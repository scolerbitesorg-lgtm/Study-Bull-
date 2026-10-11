import { EnglishMcqItem, EnglishProficiencyLevel } from '../types';

// Seed subject names, nouns, and verbs for procedural generation
const SUBJECT_NAMES = ['Rohan', 'Priya', 'Amit', 'Neha', 'Vikram', 'Ananya', 'Rahul', 'Kavya', 'Suresh', 'Pooja'];
const PLURAL_NOUNS = ['students', 'teachers', 'officers', 'players', 'doctors', 'workers', 'singers', 'volunteers', 'engineers', 'scientists'];
const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Jaipur', 'Lucknow', 'Chandigarh', 'Ahmadabad'];
const TIME_DURATIONS = ['for two hours', 'since morning', 'for three days', 'since 2020', 'since last night', 'for five months'];

interface GeneratorTemplate {
  category: string;
  level: EnglishProficiencyLevel;
  generate: (seed: number) => EnglishMcqItem;
}

const TEMPLATES: GeneratorTemplate[] = [
  // 1. Preposition Rules - Prefer
  {
    category: 'Preposition Rules',
    level: 'beginner',
    generate: (seed) => {
      const name = SUBJECT_NAMES[seed % SUBJECT_NAMES.length];
      const drink1 = ['tea', 'coffee', 'juice', 'milk', 'water'][seed % 5];
      const drink2 = ['cold drink', 'green tea', 'soda', 'shake', 'lemonade'][(seed + 2) % 5];
      return {
        id: `algo_prep_prefer_${seed}`,
        hindiSentence: `${name} ${drink2} की तुलना में ${drink1} को अधिक पसंद करता है।`,
        options: [
          `${name} prefers ${drink1} than ${drink2}.`,
          `${name} prefers ${drink1} to ${drink2}.`,
          `${name} prefers ${drink1} over ${drink2}.`,
          `${name} prefers ${drink1} instead ${drink2}.`,
        ],
        correctIndex: 1,
        explanationHi: 'व्याकरण का नियम: "Prefer" और "Preferable" के बाद तुलना करने के लिए Preposition "to" का प्रयोग होता है, "than" का नहीं।',
        grammarRuleTag: 'Preposition Rules (Prefer to)',
        level: 'beginner',
      };
    },
  },

  // 2. Preposition Rules - Addicted/Accused/Interested/Proficient
  {
    category: 'Preposition Rules',
    level: 'intermediate',
    generate: (seed) => {
      const items = [
        { verb: 'proficient', prep: 'in', hi: 'निपुण', topic: 'English speaking', options: ['in', 'at', 'with', 'on'] },
        { verb: 'accused', prep: 'of', hi: 'आरोपी', topic: 'the theft', options: ['of', 'for', 'with', 'on'] },
        { verb: 'interested', prep: 'in', hi: 'रुचि', topic: 'learning coding', options: ['in', 'at', 'for', 'about'] },
        { verb: 'congratulated', prep: 'on', hi: 'बधाई', topic: 'his success', options: ['on', 'for', 'at', 'with'] },
        { verb: 'prevented', prep: 'from', hi: 'रोका गया', topic: 'entering the room', options: ['from', 'to', 'against', 'off'] },
        { verb: 'absorbed', prep: 'in', hi: 'मग्न', topic: 'his studies', options: ['in', 'with', 'at', 'for'] },
        { verb: 'fond', prep: 'of', hi: 'शौकीन', topic: 'classical music', options: ['of', 'off', 'with', 'for'] },
      ];
      const item = items[seed % items.length];
      const name = SUBJECT_NAMES[(seed + 1) % SUBJECT_NAMES.length];
      const correctText = `${name} is ${item.verb} ${item.prep} ${item.topic}.`;
      
      const opts = item.options.map((p) => `${name} is ${item.verb} ${p} ${item.topic}.`);
      const correctIdx = item.options.indexOf(item.prep);

      return {
        id: `algo_prep_fixed_${seed}`,
        hindiSentence: `${name} ${item.topic} में ${item.hi} है।`,
        options: opts,
        correctIndex: correctIdx !== -1 ? correctIdx : 0,
        explanationHi: `व्याकरण का नियम: Word "${item.verb}" के साथ फिक्स्ड Preposition "${item.prep}" लगता है।`,
        grammarRuleTag: 'Fixed Prepositions',
        level: 'intermediate',
      };
    },
  },

  // 3. Subject-Verb Agreement - Neither Nor
  {
    category: 'Subject-Verb Agreement',
    level: 'intermediate',
    generate: (seed) => {
      const name = SUBJECT_NAMES[seed % SUBJECT_NAMES.length];
      const pluralGroup = PLURAL_NOUNS[(seed + 3) % PLURAL_NOUNS.length];
      const city = CITIES[seed % CITIES.length];

      return {
        id: `algo_sva_neither_${seed}`,
        hindiSentence: `न तो ${name} और न ही ${pluralGroup} ${city} में उपस्थित थे।`,
        options: [
          `Neither ${name} nor the ${pluralGroup} was present in ${city}.`,
          `Neither ${name} nor the ${pluralGroup} were present in ${city}.`,
          `Neither ${name} or the ${pluralGroup} were present in ${city}.`,
          `Neither ${name} nor the ${pluralGroup} are present in ${city} yesterday.`,
        ],
        correctIndex: 1,
        explanationHi: 'व्याकरण का नियम: "Neither...nor" में मुख्य क्रिया (Verb) हमेशा सबसे नजदीकी कर्ता (Nearest Subject - "the ' + pluralGroup + '" जो Plural है) के अनुसार होगी।',
        grammarRuleTag: 'Subject-Verb Agreement',
        level: 'intermediate',
      };
    },
  },

  // 4. One of the + Plural Noun + Singular Verb
  {
    category: 'Subject-Verb Agreement',
    level: 'beginner',
    generate: (seed) => {
      const pluralGroup = PLURAL_NOUNS[seed % PLURAL_NOUNS.length];
      const city = CITIES[(seed + 2) % CITIES.length];

      return {
        id: `algo_oneof_${seed}`,
        hindiSentence: `${pluralGroup} में से एक ${city} जा रहा है।`,
        options: [
          `One of the ${pluralGroup} are going to ${city}.`,
          `One of the ${pluralGroup} is going to ${city}.`,
          `One of the ${pluralGroup.slice(0, -1)} is going to ${city}.`,
          `One from the ${pluralGroup} were going to ${city}.`,
        ],
        correctIndex: 1,
        explanationHi: 'व्याकरण का नियम: "One of the" के बाद हमेशा Plural Noun आता है लेकिन बात उनमें से "एक" की होती है इसलिए Verb एकवचन (Singular - is/has/was) आती है।',
        grammarRuleTag: 'One of the Rules',
        level: 'beginner',
      };
    },
  },

  // 5. Present Perfect Continuous - Since vs For
  {
    category: 'Tenses',
    level: 'beginner',
    generate: (seed) => {
      const name = SUBJECT_NAMES[seed % SUBJECT_NAMES.length];
      const duration = TIME_DURATIONS[seed % TIME_DURATIONS.length];
      const action = ['reading a novel', 'working on this project', 'learning English', 'preparing for exam', 'playing chess'][seed % 5];

      return {
        id: `algo_tense_ppc_${seed}`,
        hindiSentence: `${name} ${duration.includes('since') ? duration.replace('since ', '') + ' से' : duration.replace('for ', '') + ' से'} ${action} कर रहा है।`,
        options: [
          `${name} is doing ${action} ${duration}.`,
          `${name} has been doing ${action} ${duration}.`,
          `${name} had done ${action} ${duration}.`,
          `${name} was doing ${action} ${duration}.`,
        ],
        correctIndex: 1,
        explanationHi: 'व्याकरण का नियम: जो कार्य भूतकाल से शुरू होकर अब तक जारी है, उसमें Present Perfect Continuous (has been + V1+ing) और समय के लिए Since/For लगता है।',
        grammarRuleTag: 'Present Perfect Continuous',
        level: 'beginner',
      };
    },
  },

  // 6. Conditionals (Had + V3 -> Would have + V3)
  {
    category: 'Conditionals',
    level: 'advanced',
    generate: (seed) => {
      const name = SUBJECT_NAMES[seed % SUBJECT_NAMES.length];
      const exam = ['SSC CGL', 'UPSC Prelims', 'Banking Exam', 'Railway Exam', 'Defense Exam'][seed % 5];

      return {
        id: `algo_cond_past_${seed}`,
        hindiSentence: `यदि ${name} ने कठिन परिश्रम किया होता, तो वह ${exam} परीक्षा पास कर लेता।`,
        options: [
          `If ${name} worked hard, he would pass the ${exam} exam.`,
          `If ${name} had worked hard, he would have passed the ${exam} exam.`,
          `If ${name} would work hard, he had passed the ${exam} exam.`,
          `If ${name} has worked hard, he will pass the ${exam} exam.`,
        ],
        correctIndex: 1,
        explanationHi: 'व्याकरण का नियम: 3rd Conditional (Past Unfulfilled Wish) में structure: If + Had + V3 ... Would have + V3 होता है।',
        grammarRuleTag: 'Third Conditional',
        level: 'advanced',
      };
    },
  },

  // 7. Articles & Universal Truth
  {
    category: 'Articles',
    level: 'beginner',
    generate: (seed) => {
      const professions = [
        { name: 'honest officer', article: 'an', hi: 'ईमानदार अधिकारी' },
        { name: 'European tourist', article: 'a', hi: 'यूरोपीय पर्यटक' },
        { name: 'university professor', article: 'a', hi: 'विश्वविद्यालय के प्रोफेसर' },
        { name: 'IAS officer', article: 'an', hi: 'आईएएस अधिकारी' },
        { name: 'unique opportunity', article: 'a', hi: 'अनोखा अवसर' },
        { name: 'hourly update', article: 'an', hi: 'प्रति घंटे का अपडेट' },
      ];
      const p = professions[seed % professions.length];
      const subj = SUBJECT_NAMES[seed % SUBJECT_NAMES.length];

      return {
        id: `algo_article_${seed}`,
        hindiSentence: `${subj} एक ${p.hi} हैं।`,
        options: [
          `${subj} is a ${p.name}.`,
          `${subj} is an ${p.name}.`,
          `${subj} is the ${p.name}.`,
          `${subj} is ${p.name}.`,
        ],
        correctIndex: p.article === 'an' ? 1 : 0,
        explanationHi: `व्याकरण का नियम: स्वर ध्वनि (Vowel sound) से शुरू होने पर "an" तथा व्यंजन ध्वनि (Consonant sound) से शुरू होने पर "a" लगता है। "${p.name}" का उच्चारण ध्यान से देखें।`,
        grammarRuleTag: 'Articles (A/An)',
        level: 'beginner',
      };
    },
  },

  // 8. Direct and Indirect Speech
  {
    category: 'Narration',
    level: 'intermediate',
    generate: (seed) => {
      const name = SUBJECT_NAMES[seed % SUBJECT_NAMES.length];
      const city = CITIES[seed % CITIES.length];

      return {
        id: `algo_narr_${seed}`,
        hindiSentence: `${name} ने कहा कि वह अगले दिन ${city} जाएगा।`,
        options: [
          `${name} said that he will go to ${city} tomorrow.`,
          `${name} said that he would go to ${city} the next day.`,
          `${name} said that he should go to ${city} next day.`,
          `${name} told that he will go to ${city} the next day.`,
        ],
        correctIndex: 1,
        explanationHi: 'व्याकरण का नियम: Indirect Speech में भूतकाल की बात होने पर "will" बदल कर "would" तथा "tomorrow" बदल कर "the next day" में रूपांतरित होता है।',
        grammarRuleTag: 'Direct & Indirect Speech',
        level: 'intermediate',
      };
    },
  },

  // 9. Vocabulary Synonyms
  {
    category: 'Vocabulary',
    level: 'intermediate',
    generate: (seed) => {
      const vocabList = [
        { word: 'Diligent', syn: 'Hardworking', wrong: ['Lazy', 'Careless', 'Slow'], hi: 'मेहनती' },
        { word: 'Enormous', syn: 'Huge', wrong: ['Tiny', 'Weak', 'Small'], hi: 'विशाल' },
        { word: 'Meticulous', syn: 'Careful', wrong: ['Rash', 'Rough', 'Foolish'], hi: 'सतर्क/सूक्ष्म' },
        { word: 'Authentic', syn: 'Genuine', wrong: ['Fake', 'False', 'Duplicate'], hi: 'असली/प्रामाणिक' },
        { word: 'Candid', syn: 'Frank', wrong: ['Secretive', 'Dishonest', 'Shy'], hi: 'स्पष्टवादी' },
        { word: 'Oblivious', syn: 'Unaware', wrong: ['Alert', 'Mindful', 'Attentive'], hi: 'बेखबर' },
        { word: 'Prudent', syn: 'Wise', wrong: ['Foolish', 'Reckless', 'Silly'], hi: 'बुद्धिमान/विवेकपूर्ण' },
      ];
      const item = vocabList[seed % vocabList.length];
      const opts = [item.syn, ...item.wrong];
      // Shuffle options deterministically
      const shuffled = [opts[0], opts[1], opts[2], opts[3]];
      const correctIdx = 0;

      return {
        id: `algo_vocab_syn_${seed}`,
        hindiSentence: `शब्द "${item.word}" (${item.hi}) का सही पर्यायवाची (Synonym) चुनें:`,
        options: shuffled,
        correctIndex: correctIdx,
        explanationHi: `शब्द कोश: "${item.word}" का अर्थ "${item.hi}" होता है। इसका सही पर्यायवाची (Synonym) "${item.syn}" है।`,
        grammarRuleTag: 'Synonym Practice',
        level: 'intermediate',
      };
    },
  },

  // 10. Active & Passive Voice
  {
    category: 'Voice',
    level: 'intermediate',
    generate: (seed) => {
      const name = SUBJECT_NAMES[seed % SUBJECT_NAMES.length];
      const project = ['report', 'project', 'assignment', 'presentation', 'article'][seed % 5];

      return {
        id: `algo_voice_${seed}`,
        hindiSentence: `यह ${project} ${name} द्वारा तैयार की गई थी।`,
        options: [
          `This ${project} is prepared by ${name}.`,
          `This ${project} was prepared by ${name}.`,
          `This ${project} had prepared by ${name}.`,
          `This ${project} was preparing by ${name}.`,
        ],
        correctIndex: 1,
        explanationHi: 'व्याकरण का नियम: Simple Past Passive Voice का सूत्र: Object + Was/Were + V3 + by + Subject होता है।',
        grammarRuleTag: 'Active & Passive Voice',
        level: 'intermediate',
      };
    },
  }
];

/**
 * Generates an endless, unique procedural English MCQ item based on index/seed
 */
export function generateAlgorithmicEnglishMcq(seed: number): EnglishMcqItem {
  const template = TEMPLATES[seed % TEMPLATES.length];
  return template.generate(seed);
}

/**
 * Generates a specified count of completely unique English MCQ questions
 */
export function generateUniqueEnglishMcqBatch(count: number, startIndex: number = Date.now()): EnglishMcqItem[] {
  const result: EnglishMcqItem[] = [];
  for (let i = 0; i < count; i++) {
    result.push(generateAlgorithmicEnglishMcq(startIndex + i));
  }
  return result;
}
