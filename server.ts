import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

let cachedGroqModel: string | null = null;
let groqCooldownUntil: number = 0;

async function getBestGroqModel(apiKey: string): Promise<string> {
  if (cachedGroqModel) return cachedGroqModel;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.ok) {
      const data = await res.json();
      const modelIds: string[] = (data.data || []).map((m: any) => m.id);

      // Prioritize fast, high-rate-limit models (20B/27B) over heavy 120B
      const preferences = [
        'openai/gpt-oss-20b',
        'qwen/qwen3.8-27b',
        'openai/gpt-oss-120b',
        'llama-3.1-8b-instant',
        'llama-3.3-70b-versatile',
        'allam-2-7b',
      ];

      for (const pref of preferences) {
        if (modelIds.includes(pref)) {
          cachedGroqModel = pref;
          return pref;
        }
      }

      const fallbackModel = modelIds.find(
        (id) => !id.includes('whisper') && !id.includes('guard') && !id.includes('embed')
      );
      if (fallbackModel) {
        cachedGroqModel = fallbackModel;
        return fallbackModel;
      }
    }
  } catch (err) {
    console.warn('Could not query Groq /models list, falling back to default:', err);
  }

  return 'openai/gpt-oss-20b';
}

// Helper to call Groq API (High-speed Llama / GPT models)
async function callGroqApi(systemPrompt: string, userPrompt: string, maxTokens: number = 1500): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured in backend');
  }

  if (Date.now() < groqCooldownUntil) {
    throw new Error('Groq is currently in rate limit cooldown');
  }

  const model = await getBestGroqModel(apiKey);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429) {
      groqCooldownUntil = Date.now() + 20000;
    }
    cachedGroqModel = null;
    throw new Error(`Groq API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '{}';
}

// Helper to call Gemini API as fallback
async function callGeminiApi(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in backend');
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: `${systemPrompt}\n\nTask:\n${userPrompt}`,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  });

  return response.text || '{}';
}

// Fallback high-yield content generator if keys are absent
function getFallbackContent(type: string, level: string, count: number): any[] {
  const timestamp = Date.now();
  if (type === 'vocab') {
    const pool = [
      {
        word: 'Ephemeral',
        hindiMeaning: 'क्षणिक, अल्पकालिक',
        partOfSpeech: 'Adjective',
        simpleExplanation: 'जो चीज़ बहुत थोड़े समय के लिए रहे (जैसे ओस की बूंद या पल भर की खुशी)।',
        exampleSentence: 'Fame in social media is often ephemeral.',
        exampleSentenceHi: 'सोशल मीडिया पर प्रसिद्धि अक्सर क्षणिक होती है।',
        mnemonicTrick: 'E-pheral -> Fairy (परी) की तरह जो पल भर में गायब हो जाए।',
        level: 'advanced',
        synonyms: ['Transient', 'Fleeting', 'Brief'],
        antonyms: ['Permanent', 'Eternal', 'Enduring'],
      },
      {
        word: 'Plausible',
        hindiMeaning: 'विश्वसनीय, मुमकिन लगने वाला',
        partOfSpeech: 'Adjective',
        simpleExplanation: 'जिस बात पर यकीन किया जा सके और जो सच लग रही हो।',
        exampleSentence: 'She gave a plausible excuse for being late.',
        exampleSentenceHi: 'उसने देर से आने का एक विश्वसनीय बहाना दिया।',
        mnemonicTrick: 'Possible + Applaud = जो संभव लगे और लोग मान लें।',
        level: 'intermediate',
        synonyms: ['Credible', 'Believable', 'Feasible'],
        antonyms: ['Improbable', 'Unbelievable'],
      },
      {
        word: 'Meticulous',
        hindiMeaning: 'अति-सावधान, बारीकी से काम करने वाला',
        partOfSpeech: 'Adjective',
        simpleExplanation: 'जो हर छोटी-से-छोटी बात का बहुत ध्यान रखे और कोई गलती न करे।',
        exampleSentence: 'He is meticulous about his accounts and calculations.',
        exampleSentenceHi: 'वह अपने हिसाब-किताब के प्रति अति-सावधान है।',
        mnemonicTrick: 'Meticulous -> Metric Scale से नाप-नाप कर चलने वाला।',
        level: 'intermediate',
        synonyms: ['Careful', 'Diligent', 'Scrupulous'],
        antonyms: ['Careless', 'Sloppy'],
      },
      {
        word: 'Resilient',
        hindiMeaning: 'लचीला, कठिनाइयों से तुरंत उबरने वाला',
        partOfSpeech: 'Adjective',
        simpleExplanation: 'जो इंसान मुश्किलों में हार न माने और गिरकर दोबारा खड़ा हो जाए।',
        exampleSentence: 'Indian students are highly resilient and hardworking.',
        exampleSentenceHi: 'भारतीय छात्र बेहद जुझारू और मेहनती होते हैं।',
        mnemonicTrick: 'Re (दोबारा) + Silent (शांति से फिर खड़े होना)।',
        level: 'beginner',
        synonyms: ['Tough', 'Strong', 'Adaptable'],
        antonyms: ['Fragile', 'Vulnerable'],
      },
      {
        word: 'Benevolent',
        hindiMeaning: 'परोपकारी, दयालु',
        partOfSpeech: 'Adjective',
        simpleExplanation: 'जो दूसरों की भलाई और मदद करने में विश्वास रखता हो।',
        exampleSentence: 'A benevolent ruler always protects his citizens.',
        exampleSentenceHi: 'एक दयालु राजा हमेशा अपनी प्रजा की रक्षा करता है।',
        mnemonicTrick: 'Bene = Good (अच्छा) + Vol = Wish (इच्छा)।',
        level: 'beginner',
        synonyms: ['Kind', 'Generous', 'Compassionate'],
        antonyms: ['Malevolent', 'Cruel'],
      },
    ];
    return pool.slice(0, count).map((item, idx) => ({ ...item, id: `ai-vocab-${timestamp}-${idx}` }));
  }

  if (type === 'sentences') {
    const pool = [
      {
        english: 'Could you please speak a little slower?',
        hindi: 'क्या आप थोड़ा धीरे बोल सकते हैं?',
        situation: 'विनम्र निवेदन (Polite Request)',
        level: 'beginner',
        audioPronunciation: 'कुड यू प्लीज़ स्पीक अ लिटल स्लोअर?',
        tip: 'अजनबियों से धीमे बोलने के लिए "Could you please..." सबसे शिष्ट तरीका है।',
      },
      {
        english: 'I will keep you in the loop.',
        hindi: 'मैं आपको पूरी जानकारी देता रहूँगा।',
        situation: 'ऑफिस और ईमेल में (Office / Professional)',
        level: 'intermediate',
        audioPronunciation: 'आई विल कीप यू इन द लूप',
        tip: '"Keep in the loop" का अर्थ लगातार अपडेट देते रहना होता है।',
      },
      {
        english: 'Let us not jump to conclusions.',
        hindi: 'हमें बिना सोचे-समझे किसी नतीजे पर नहीं पहुँचना चाहिए।',
        situation: 'फैसले लेते समय (Decision Making)',
        level: 'intermediate',
        audioPronunciation: 'लेट अस नॉट जम्प टू कन्क्लूजन्स',
        tip: 'Jump to conclusions का मतलब बिना तथ्य जाने फैसला करना।',
      },
      {
        english: 'It slipped my mind completely.',
        hindi: 'यह बात मेरे दिमाग से बिल्कुल निकल गई थी।',
        situation: 'भूल जाने पर (Apology / Memory)',
        level: 'beginner',
        audioPronunciation: 'इट स्लिप्ड माई माइंड कम्प्लीटली',
        tip: 'भूलने के लिए "I forgot" की जगह यह फ्रेज ज्यादा नेचुरल लगता है।',
      },
    ];
    return pool.slice(0, count).map((item, idx) => ({ ...item, id: `ai-sent-${timestamp}-${idx}` }));
  }

  if (type === 'spelling') {
    const pool = [
      {
        word: 'Accommodation',
        hindiMeaning: 'रहने का स्थान / आवास',
        phoneticHint: 'अ-कॉ-मो-डे-शन',
        trickyPart: 'इसमें डबल C (cc) और डबल M (mm) दोनों आते हैं।',
        level: 'intermediate',
        example: 'Hotel accommodation was included in the tour package.',
      },
      {
        word: 'Lieutenant',
        hindiMeaning: 'लेफ्टिनेंट (सेना का अधिकारी)',
        phoneticHint: 'लेफ-टि-नेन्ट (L-i-e-u-t-e-n-a-n-t)',
        trickyPart: 'बोलते "leftenant" हैं लेकिन लिखते "lieutenant" हैं।',
        level: 'advanced',
        example: 'He was promoted to the rank of Lieutenant.',
      },
      {
        word: 'Millennium',
        hindiMeaning: 'सहस्राब्दी (1000 वर्षों की अवधि)',
        phoneticHint: 'मि-ले-नि-अम',
        trickyPart: 'डबल L (ll) और डबल N (nn) आते हैं।',
        level: 'intermediate',
        example: 'The new millennium brought rapid technological change.',
      },
      {
        word: 'Queue',
        hindiMeaning: 'कतार / लाइन',
        phoneticHint: 'क्यू (Q-u-e-u-e)',
        trickyPart: 'केवल Q की आवाज है पर पीछे "ueue" 4 लेटर्स जुड़े हैं।',
        level: 'beginner',
        example: 'Please stand in the queue and wait for your turn.',
      },
    ];
    return pool.slice(0, count).map((item, idx) => ({ ...item, id: `ai-spell-${timestamp}-${idx}` }));
  }

  if (type === 'mcq') {
    const pool = [
      {
        hindiSentence: 'वह सुबह से पढ़ रहा है।',
        englishSentence: 'He has been studying since morning.',
        options: [
          'He is studying since morning.',
          'He has been studying since morning.',
          'He was studying from morning.',
          'He has studied for morning.',
        ],
        correctOptionIndex: 1,
        explanation: 'सुबह से काम लगातार जारी है (Present Perfect Continuous Tense), इसलिए "has been + verb-ing + since" आएगा।',
        level: 'intermediate',
        grammarTag: 'Tense: Present Perfect Continuous',
      },
      {
        hindiSentence: 'अगर मैं राजा होता, तो सबकी मदद करता।',
        englishSentence: 'If I were a king, I would help everyone.',
        options: [
          'If I was a king, I will help everyone.',
          'If I were a king, I would help everyone.',
          'If I am a king, I would helped everyone.',
          'If I had king, I help everyone.',
        ],
        correctOptionIndex: 1,
        explanation: 'काल्पनिक स्थिति (Hypothetical Condition) में "I" के साथ हमेशा "were" और मुख्य वाक्य में "would" आता है।',
        level: 'advanced',
        grammarTag: 'Conditional Sentences',
      },
      {
        hindiSentence: 'सूरज पूर्व से उगता है।',
        englishSentence: 'The sun rises in the east.',
        options: [
          'Sun rise in east.',
          'The sun rising in east.',
          'The sun rises in the east.',
          'A sun rose from east.',
        ],
        correctOptionIndex: 2,
        explanation: 'सार्वभौमिक सत्य (Universal Truth) में Simple Present Tense और प्राकृतिक दिशाओं/चीजों से पहले "The" आता है।',
        level: 'beginner',
        grammarTag: 'Simple Present & Articles',
      },
    ];
    return pool.slice(0, count).map((item, idx) => ({ ...item, id: `ai-mcq-${timestamp}-${idx}` }));
  }

  if (type === 'typing') {
    const pool = [
      {
        hindiSentence: 'कृपया अपनी आवाज नीची रखें।',
        targetEnglishSentence: 'Please keep your voice down.',
        acceptableVariants: ['Please lower your voice.', 'Keep your voice down please.'],
        grammarTip: '"Keep voice down" एक शिष्ट मुहावरा है जिसका अर्थ शांति बनाए रखना है।',
        level: 'beginner',
        difficulty: 'Easy',
      },
      {
        hindiSentence: 'मेरे स्टेशन पहुँचने से पहले ट्रेन जा चुकी थी।',
        targetEnglishSentence: 'The train had left before I reached the station.',
        acceptableVariants: [
          'The train had departed before I reached the station.',
          'Before I reached the station, the train had left.',
        ],
        grammarTip: 'अतीत के दो कार्यों में जो कार्य पहले हुआ उसमें Past Perfect (had + V3) आता है।',
        level: 'intermediate',
        difficulty: 'Medium',
      },
    ];
    return pool.slice(0, count).map((item, idx) => ({ ...item, id: `ai-type-${timestamp}-${idx}` }));
  }

  return [];
}

// Backend API endpoint for AI content generation
app.post('/api/ai/generate-english-content', async (req, res) => {
  try {
    const { type = 'vocab', level = 'intermediate', count = 4, existingWords = [] } = req.body;

    const systemPrompt = `You are an expert bilingual English and Hindi language teacher for competitive exam aspirants (SSC CGL, CHSL, Banking, NDA, State Exams).
Your task is to generate fresh, pristine, error-free educational content in JSON format.
All explanations MUST be in clear, easy Hindi (आसान हिंदी) with practical real-life examples and memory mnemonics.
Do NOT repeat any of these existing words or phrases: ${JSON.stringify(existingWords.slice(0, 50))}.
Output MUST be pure JSON with no markdown wrapping. The root object must have a key "items" which is an array of generated objects.`;

    let userPrompt = '';
    if (type === 'vocab') {
      userPrompt = `Generate ${count} distinct English vocabulary words of ${level} level.
Each item must have:
- "word": English word string
- "hindiMeaning": Hindi meaning string (bold, accurate)
- "partOfSpeech": "Noun" | "Verb" | "Adjective" | "Adverb"
- "simpleExplanation": 1-2 sentence explanation in very easy Hindi (उदा. आसान शब्दों में इसका क्या मतलब है)
- "exampleSentence": Practical English sentence
- "exampleSentenceHi": Hindi translation of the example sentence
- "mnemonicTrick": Memory trick or breakdown in Hindi to never forget this word
- "level": "${level}"
- "synonyms": array of 2-3 strings
- "antonyms": array of 2-3 strings`;
    } else if (type === 'sentences') {
      userPrompt = `Generate ${count} practical daily English sentences of ${level} level.
Each item must have:
- "english": The English sentence string
- "hindi": Natural Hindi translation
- "situation": Context string (e.g. "बातचीत", "ऑफिस", "बाजार", "दोस्त")
- "level": "${level}"
- "audioPronunciation": Hindi phonetic pronunciation string (उदा. 'कुड यू प्लीज़...')
- "tip": 1 short grammatical or conversational tip in Hindi`;
    } else if (type === 'spelling') {
      userPrompt = `Generate ${count} tough English words frequently asked in spelling tests (like Pneumonia, Queue, Hierarchy) of ${level} level.
Each item must have:
- "word": Correct English word string
- "hindiMeaning": Hindi meaning string
- "phoneticHint": Hindi phonetic sound
- "trickyPart": Explanation of what letter is silent or doubled in Hindi
- "level": "${level}"
- "example": English sentence using this word`;
    } else if (type === 'mcq') {
      userPrompt = `Generate ${count} Hindi-to-English translation MCQs of ${level} level.
Each item must have:
- "hindiSentence": The Hindi sentence string
- "englishSentence": Correct English translation
- "options": Array of 4 options (strings), where 1 is correct and 3 are realistic student mistakes
- "correctOptionIndex": integer (0, 1, 2, or 3)
- "explanation": Comprehensive explanation in Hindi of why the correct option is right and what grammar rule applies
- "level": "${level}"
- "grammarTag": String tag (e.g. "Tenses", "Prepositions", "Conditionals")`;
    } else if (type === 'typing') {
      userPrompt = `Generate ${count} sentences for English typing translation practice of ${level} level.
Each item must have:
- "hindiSentence": Hindi sentence string
- "targetEnglishSentence": Standard English translation
- "acceptableVariants": Array of 2-3 other correct English translations
- "grammarTip": 1 sentence tip in Hindi
- "level": "${level}"
- "difficulty": "Easy" | "Medium" | "Hard"`;
    } else if (type === 'grammar') {
      userPrompt = `Generate ${count} English grammar topics of ${level} level.
Each item must have:
- "title": English title (e.g. "Subject-Verb Agreement")
- "hindiTitle": Hindi title
- "category": Category string
- "level": "${level}"
- "rules": Array of objects with "rule" (string in Hindi) and "example" (string in English)
- "commonMistakes": Array of objects with "wrong" (string), "correct" (string), and "explanation" (string in Hindi)`;
    } else if (type === 'reading') {
      userPrompt = `Generate ${count} short English reading passages/stories of ${level} level.
Each item must have:
- "title": English story title
- "hindiTitle": Hindi story title
- "storyEn": English story paragraph (80-120 words)
- "storyHi": Natural Hindi translation
- "level": "${level}"
- "readingTimeMinutes": 2
- "comprehensionQuestions": Array of 2 questions with "question", "options" (4 strings), "correctIndex" (0-3), "explanation" (in Hindi)`;
    } else {
      userPrompt = `Generate ${count} educational items of ${level} level for English learning.`;
    }

    let rawJson = '';
    let provider = '';

    // Priority 1: Groq API (High speed, respects rate-limit cooldown)
    if (process.env.GROQ_API_KEY && Date.now() >= groqCooldownUntil) {
      try {
        rawJson = await callGroqApi(systemPrompt, userPrompt);
        provider = 'groq';
      } catch (err: any) {
        // Fall back gracefully to Gemini
      }
    }

    // Priority 2: Gemini API
    if (!rawJson && process.env.GEMINI_API_KEY) {
      try {
        rawJson = await callGeminiApi(systemPrompt, userPrompt);
        provider = 'gemini';
      } catch (err: any) {
        // Fall back gracefully to built-in generator
      }
    }

    let parsedItems: any[] = [];
    if (rawJson) {
      try {
        // Strip markdown backticks if returned
        const cleaned = rawJson.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        parsedItems = Array.isArray(parsed) ? parsed : parsed.items || [];
      } catch (jsonErr) {
        console.error('Error parsing AI JSON output:', jsonErr);
      }
    }

    // Fallback if parsing failed or keys were empty
    if (!parsedItems || parsedItems.length === 0) {
      parsedItems = getFallbackContent(type, level, count);
      provider = 'built-in';
    }

    // Assign unique stable IDs to all generated items
    const timestamp = Date.now();
    const finalItems = parsedItems.map((item, idx) => ({
      ...item,
      id: item.id || `ai-${type}-${timestamp}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      source: 'ai-groq',
    }));

    res.json({
      success: true,
      provider,
      count: finalItems.length,
      items: finalItems,
    });
  } catch (error: any) {
    console.error('Backend AI Generator Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate content',
    });
  }
});

function cleanMathText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  let str = text;
  // Remove backticks completely
  str = str.replace(/`/g, '');
  // Remove markdown bold / italic
  str = str.replace(/\*\*([^*]+)\*\*/g, '$1');
  str = str.replace(/\*([^*]+)\*/g, '$1');
  // Remove LaTeX
  str = str.replace(/\\times\b/gi, '×');
  str = str.replace(/\\div\b/gi, '÷');
  str = str.replace(/\\cdot\b/gi, '×');
  str = str.replace(/\\sqrt\{([^}]+)\}/gi, '√$1');
  str = str.replace(/\\sqrt\b/gi, '√');
  str = str.replace(/\\/g, '');
  str = str.replace(/\$/g, '');

  // Power superscripts: ^2 -> ², ^3 -> ³, ^4 -> ⁴, etc.
  const superscriptMap: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '(': '⁽', ')': '⁾'
  };
  str = str.replace(/\^\(([-+]?[0-9]+)\)/gi, (_, p1) => {
    return p1.split('').map((c: string) => superscriptMap[c] || c).join('');
  });
  str = str.replace(/\^([0-9]+)/g, (_, p1) => {
    return p1.split('').map((c: string) => superscriptMap[c] || c).join('');
  });
  str = str.replace(/\^/g, '');

  // Multiplication: replace * with ×
  str = str.replace(/\*/g, ' × ');

  // Division: replace / between numbers or brackets with ÷
  str = str.replace(/(\d+|\))\s*\/\s*(\d+|\()/g, '$1 ÷ $2');

  // Format spacing
  str = str.replace(/\s*×\s*/g, ' × ');
  str = str.replace(/\s*÷\s*/g, ' ÷ ');
  str = str.replace(/\s*\+\s*/g, ' + ');
  str = str.replace(/(\d+|\))\s*-\s*(\d+|\()/g, '$1 - $2');
  str = str.replace(/\s*=\s*/g, ' = ');
  str = str.replace(/\s{2,}/g, ' ').trim();

  return str;
}

// Math questions generation endpoint with support for backend AI and clean formatting
app.post('/api/ai/generate-math-questions', async (req, res) => {
  try {
    const { count = 10, level = 'medium', operation = 'all', userApiKey } = req.body;
    const qCount = Math.min(Math.max(Number(count) || 10, 5), 30);
    const aiCount = Math.min(qCount, 5);

    const systemPrompt = `You are a high-speed competitive exam math problem generator for Indian exams (SSC CGL, CHSL, Banking, Railways). 
CRITICAL FORMATTING INSTRUCTIONS:
- NEVER use backticks (\`), asterisks (*), carets (^), markdown formatting, or LaTeX syntax in questionText, hint, or trickExplanation.
- ALWAYS use unicode '×' for multiplication (never *).
- ALWAYS use unicode '÷' for division (never /).
- ALWAYS use unicode superscripts like '²' or '³' for powers (never ^2 or ^3).
- ALWAYS use '√' for square roots.
- Output ONLY a valid JSON object matching: {"questions": [{"operation": "bodmas", "operationLabel": "सरलीकरण", "questionText": "(45 × 12) - (144 ÷ 12) = ?", "correctAnswer": 528, "options": [528, 518, 538, 548], "trickExplanation": "नियम: पहले भाग (144 ÷ 12 = 12) और गुणा (45 × 12 = 540), फिर घटाव (540 - 12 = 528)।"}]}`;

    const userPrompt = `Generate a valid JSON object containing ${aiCount} math calculation practice questions of level "${level}" and operation "${operation}". All questions must have accurate correctAnswer, 4 numeric options, and a clear Hindi trickExplanation. Use unicode symbols (×, ÷, ², ³, √) and NEVER output *, ^, or backticks. Output pure JSON only.`;

    let rawJson = '';
    let provider = 'built-in';

    // 1. Try with userApiKey if passed
    if (userApiKey && typeof userApiKey === 'string' && userApiKey.trim().length > 10) {
      const customKey = userApiKey.trim();
      if (customKey.startsWith('gsk_')) {
        // Groq custom key
        try {
          const model = await getBestGroqModel(customKey);
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${customKey}`,
            },
            body: JSON.stringify({
              model,
              temperature: 0.5,
              max_tokens: 1500,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              response_format: { type: 'json_object' },
            }),
          });
          if (response.ok) {
            const data = await response.json();
            rawJson = data.choices?.[0]?.message?.content || '';
            provider = 'user-groq';
          }
        } catch {
          // Fall through
        }
      } else {
        // Assume Gemini custom key
        try {
          const ai = new GoogleGenAI({ apiKey: customKey });
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `${systemPrompt}\n\nTask:\n${userPrompt}`,
            config: { responseMimeType: 'application/json', temperature: 0.5 },
          });
          rawJson = response.text || '';
          provider = 'user-gemini';
        } catch {
          // Fall through
        }
      }
    }

    // 2. If no rawJson yet, try server GROQ_API_KEY
    if (!rawJson && process.env.GROQ_API_KEY && Date.now() >= groqCooldownUntil) {
      try {
        rawJson = await callGroqApi(systemPrompt, userPrompt, 1500);
        provider = 'server-groq';
      } catch {
        // Fall back gracefully to Gemini
      }
    }

    // 3. If no rawJson yet, try server GEMINI_API_KEY
    if (!rawJson && process.env.GEMINI_API_KEY) {
      try {
        rawJson = await callGeminiApi(systemPrompt, userPrompt);
        provider = 'server-gemini';
      } catch {
        // Fall back gracefully to built-in generator
      }
    }

    let parsedQuestions: any[] = [];
    if (rawJson) {
      try {
        const cleaned = rawJson.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        parsedQuestions = Array.isArray(parsed) ? parsed : parsed.questions || parsed.items || [];
      } catch (jsonErr) {
        console.error('Error parsing math questions JSON:', jsonErr);
      }
    }

    // If AI provided fewer than qCount, supplement with programmatic questions
    if (!parsedQuestions || parsedQuestions.length < qCount) {
      const needed = qCount - (parsedQuestions ? parsedQuestions.length : 0);
      const extra = generateAlgorithmicMathQuestions(needed, level, operation);
      parsedQuestions = [...(parsedQuestions || []), ...extra];
      if (!provider || provider === 'built-in') {
        provider = 'built-in-math-engine';
      }
    }

    // Clean and sanitize all math questions so no * or ^ or ` ever leak through
    const sanitizedQuestions = (parsedQuestions || []).map((q) => ({
      ...q,
      questionText: cleanMathText(q.questionText || ''),
      hint: cleanMathText(q.hint || ''),
      trickExplanation: cleanMathText(q.trickExplanation || ''),
    }));

    res.json({
      success: true,
      provider,
      count: sanitizedQuestions.length,
      questions: sanitizedQuestions,
    });
  } catch (error: any) {
    console.error('Math question generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate math questions',
    });
  }
});

// Helper for fast, reliable programmatic math questions
function generateAlgorithmicMathQuestions(count: number, level: string, op: string): any[] {
  const list = [];
  const ops = ['bodmas', 'percent', 'square', 'mul', 'average'];
  for (let i = 0; i < count; i++) {
    const chosenOp = op === 'all' ? ops[i % ops.length] : op;
    let qText = '';
    let ans = 0;
    let hint = '';
    let trick = '';
    let label = 'स्पीड मैथ';

    if (chosenOp === 'percent') {
      label = 'प्रतिशत (Percentage)';
      const pcts = level === 'easy' ? [10, 20, 25, 50] : [15, 24, 35, 45, 60, 75];
      const p = pcts[Math.floor(Math.random() * pcts.length)];
      const base = (Math.floor(Math.random() * 12) + 2) * (level === 'easy' ? 20 : 50);
      ans = Math.round((p * base) / 100);
      qText = `${p}% of ${base} = ?`;
      hint = `प्रतिशत की गणना: (${base} × ${p}) ÷ 100`;
      trick = `शॉर्टकट: 10% = ${base / 10}, फिर गुणज से निकालें। उत्तर = ${ans}`;
    } else if (chosenOp === 'square') {
      label = 'वर्ग व वर्गमूल (Square)';
      const base = level === 'easy' ? Math.floor(Math.random() * 15) + 11 : Math.floor(Math.random() * 35) + 21;
      ans = base * base;
      qText = `${base}² = ?`;
      hint = `${base} को उसी से गुणा करें (${base} × ${base})`;
      trick = `नजदीकी आधार (Base method): ${base}² = ${ans}`;
    } else if (chosenOp === 'mul') {
      label = 'त्वरित गुणा (Multiplication)';
      const a = level === 'easy' ? Math.floor(Math.random() * 12) + 11 : Math.floor(Math.random() * 40) + 21;
      const b = level === 'easy' ? Math.floor(Math.random() * 9) + 4 : Math.floor(Math.random() * 19) + 11;
      ans = a * b;
      qText = `${a} × ${b} = ?`;
      hint = `वैदिक गणित एकाधिकेन या विखंडन विधि।`;
      trick = `${a} × ${b} = ${ans}`;
    } else {
      label = 'सरलीकरण (BODMAS)';
      const a = Math.floor(Math.random() * 12) + 6;
      const b = Math.floor(Math.random() * 8) + 4;
      const c = Math.floor(Math.random() * 15) + 5;
      ans = a * b - c;
      qText = `(${a} × ${b}) - ${c} = ?`;
      hint = `पहले गुणा (${a} × ${b} = ${a * b}), फिर घटाएं (- ${c})`;
      trick = `${a * b} - ${c} = ${ans}`;
    }

    const options = [ans];
    while (options.length < 4) {
      const delta = (Math.floor(Math.random() * 7) + 1) * (Math.random() > 0.5 ? 1 : -1) * (ans > 100 ? 10 : 1);
      const fake = ans + delta;
      if (fake > 0 && !options.includes(fake)) {
        options.push(fake);
      }
    }
    options.sort(() => Math.random() - 0.5);

    list.push({
      operation: chosenOp,
      operationLabel: label,
      questionText: qText,
      correctAnswer: ans,
      options,
      hint,
      trickExplanation: trick,
    });
  }
  return list;
}

// Status endpoint for frontend health check
app.get('/api/ai/status', (req, res) => {
  res.json({
    groqConfigured: !!process.env.GROQ_API_KEY,
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    activeProvider: process.env.GROQ_API_KEY ? 'groq' : (process.env.GEMINI_API_KEY ? 'gemini' : 'built-in-resilient'),
  });
});

// Vite middleware or production static files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const vite = await createViteServer({
    server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

if (!process.env.VERCEL) {
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Study Bull Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
