import React, { useState } from 'react';
import {
  EnglishVocabItem,
  EnglishSentenceItem,
  EnglishSpellingItem,
  EnglishMcqItem,
  EnglishSentenceTypingItem,
  EnglishGrammarTopic,
  EnglishStoryItem,
  Language,
} from '../../types';
import { FirestoreService } from '../../firebase/firestoreService';
import { playTapSound, playCorrectSound } from '../../utils/audio';
import {
  ArrowLeft,
  Plus,
  Trash2,
  BookOpen,
  FileText,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Layers,
  Settings,
} from 'lucide-react';

interface EnglishAdminViewProps {
  language: Language;
  soundEnabled: boolean;
  onBack: () => void;
  vocabList: EnglishVocabItem[];
  sentencesList: EnglishSentenceItem[];
  spellingList: EnglishSpellingItem[];
  mcqList: EnglishMcqItem[];
  typingList: EnglishSentenceTypingItem[];
  grammarList: EnglishGrammarTopic[];
  storiesList: EnglishStoryItem[];
}

type TabType = 'vocab' | 'sentences' | 'spelling' | 'mcq' | 'typing' | 'grammar' | 'stories';

export const EnglishAdminView: React.FC<EnglishAdminViewProps> = ({
  language,
  soundEnabled,
  onBack,
  vocabList,
  sentencesList,
  spellingList,
  mcqList,
  typingList,
  grammarList,
  storiesList,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('vocab');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Form states for each tab
  // 1. Vocab form
  const [newWord, setNewWord] = useState('');
  const [newWordHi, setNewWordHi] = useState('');
  const [newWordExplanation, setNewWordExplanation] = useState('');
  const [newWordExample, setNewWordExample] = useState('');
  const [newWordExampleHi, setNewWordExampleHi] = useState('');
  const [newWordMnemonic, setNewWordMnemonic] = useState('');
  const [newWordLevel, setNewWordLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  // 2. Sentences form
  const [newSentEn, setNewSentEn] = useState('');
  const [newSentHi, setNewSentHi] = useState('');
  const [newSentSituation, setNewSentSituation] = useState('Daily Conversation');
  const [newSentLevel, setNewSentLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  // 3. Spelling form
  const [newSpellWord, setNewSpellWord] = useState('');
  const [newSpellHi, setNewSpellHi] = useState('');
  const [newSpellBreakdown, setNewSpellBreakdown] = useState('');
  const [newSpellMnemonic, setNewSpellMnemonic] = useState('');

  // 4. MCQ form
  const [newMcqHi, setNewMcqHi] = useState('');
  const [newMcqOpt0, setNewMcqOpt0] = useState('');
  const [newMcqOpt1, setNewMcqOpt1] = useState('');
  const [newMcqOpt2, setNewMcqOpt2] = useState('');
  const [newMcqOpt3, setNewMcqOpt3] = useState('');
  const [newMcqCorrect, setNewMcqCorrect] = useState<number>(0);
  const [newMcqExpHi, setNewMcqExpHi] = useState('');

  // 5. Typing form
  const [newTypingHi, setNewTypingHi] = useState('');
  const [newTypingEn, setNewTypingEn] = useState('');
  const [newTypingVariants, setNewTypingVariants] = useState('');
  const [newTypingTip, setNewTypingTip] = useState('');

  // 6. Grammar form
  const [newGrammarTitleEn, setNewGrammarTitleEn] = useState('');
  const [newGrammarTitleHi, setNewGrammarTitleHi] = useState('');
  const [newGrammarConcept, setNewGrammarConcept] = useState('');
  const [newGrammarRuleTitle, setNewGrammarRuleTitle] = useState('');
  const [newGrammarRuleExp, setNewGrammarRuleExp] = useState('');
  const [newGrammarWrong, setNewGrammarWrong] = useState('');
  const [newGrammarCorrect, setNewGrammarCorrect] = useState('');

  // 7. Stories form
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryTitleHi, setNewStoryTitleHi] = useState('');
  const [newStoryEn, setNewStoryEn] = useState('');
  const [newStoryHi, setNewStoryHi] = useState('');

  const showNotification = (msg: string) => {
    playCorrectSound(soundEnabled);
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Handlers for Add & Delete
  const handleAddVocab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newWordHi.trim()) return;

    const item: EnglishVocabItem = {
      id: `vocab-${Date.now()}`,
      word: newWord.trim(),
      hindiMeaning: newWordHi.trim(),
      simpleExplanation: newWordExplanation.trim() || `${newWord} का अर्थ ${newWordHi} होता है।`,
      exampleSentence: newWordExample.trim() || `Learn how to use ${newWord} in sentences.`,
      exampleSentenceHi: newWordExampleHi.trim() || `${newWordHi} का वाक्य में प्रयोग।`,
      level: newWordLevel,
      synonyms: [],
      antonyms: [],
      mnemonicHint: newWordMnemonic.trim() || 'याद रखने की ट्रिक',
      partOfSpeech: 'Noun',
    };

    await FirestoreService.saveEnglishVocab(item);
    setNewWord('');
    setNewWordHi('');
    setNewWordExplanation('');
    setNewWordExample('');
    setNewWordExampleHi('');
    setNewWordMnemonic('');
    showNotification(`✅ नया शब्द "${item.word}" सफलतापूर्वक जोड़ा गया!`);
  };

  const handleDeleteVocab = async (id: string) => {
    await FirestoreService.deleteEnglishVocab(id);
    showNotification('🗑️ शब्द हटा दिया गया');
  };

  const handleAddSentence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSentEn.trim() || !newSentHi.trim()) return;

    const item: EnglishSentenceItem = {
      id: `sent-${Date.now()}`,
      english: newSentEn.trim(),
      hindi: newSentHi.trim(),
      situation: newSentSituation.trim() || 'General',
      level: newSentLevel,
    };

    await FirestoreService.saveEnglishSentence(item);
    setNewSentEn('');
    setNewSentHi('');
    showNotification(`✅ नया वाक्य सफलतापूर्वक जोड़ा गया!`);
  };

  const handleDeleteSentence = async (id: string) => {
    await FirestoreService.deleteEnglishSentence(id);
    showNotification('🗑️ वाक्य हटा दिया गया');
  };

  const handleAddSpelling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpellWord.trim()) return;

    const breakdowns = newSpellBreakdown
      .split(/[,-]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const item: EnglishSpellingItem = {
      id: `spell-${Date.now()}`,
      word: newSpellWord.trim(),
      hindiMeaning: newSpellHi.trim() || 'कठिन वर्तनी अभ्यास',
      phoneticHint: newSpellWord.trim(),
      mnemonicRule: newSpellMnemonic.trim() || 'स्पेलिंग याद रखने की ट्रिक',
      breakdown: breakdowns.length > 0 ? breakdowns : [newSpellWord.trim()],
      level: 'intermediate',
    };

    await FirestoreService.saveEnglishSpelling(item);
    setNewSpellWord('');
    setNewSpellHi('');
    setNewSpellBreakdown('');
    setNewSpellMnemonic('');
    showNotification(`✅ कठिन शब्द "${item.word}" जोड़ा गया!`);
  };

  const handleDeleteSpelling = async (id: string) => {
    await FirestoreService.deleteEnglishSpelling(id);
    showNotification('🗑️ स्पेलिंग हटाई गई');
  };

  const handleAddMcq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMcqHi.trim() || !newMcqOpt0.trim() || !newMcqOpt1.trim()) return;

    const opts = [newMcqOpt0.trim(), newMcqOpt1.trim(), newMcqOpt2.trim() || 'Option C', newMcqOpt3.trim() || 'Option D'];

    const item: EnglishMcqItem = {
      id: `mcq-${Date.now()}`,
      hindiSentence: newMcqHi.trim(),
      options: opts,
      correctIndex: Number(newMcqCorrect) || 0,
      explanationHi: newMcqExpHi.trim() || 'सही अंग्रेजी अनुवाद।',
      grammarRuleTag: 'General Grammar',
      level: 'intermediate',
    };

    await FirestoreService.saveEnglishMcq(item);
    setNewMcqHi('');
    setNewMcqOpt0('');
    setNewMcqOpt1('');
    setNewMcqOpt2('');
    setNewMcqOpt3('');
    setNewMcqExpHi('');
    showNotification(`✅ नया MCQ प्रश्न जोड़ा गया!`);
  };

  const handleDeleteMcq = async (id: string) => {
    await FirestoreService.deleteEnglishMcq(id);
    showNotification('🗑️ MCQ प्रश्न हटाया गया');
  };

  const handleAddTyping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypingHi.trim() || !newTypingEn.trim()) return;

    const variants = newTypingVariants
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const item: EnglishSentenceTypingItem = {
      id: `type-${Date.now()}`,
      hindiSentence: newTypingHi.trim(),
      targetEnglish: newTypingEn.trim(),
      acceptedVariations: [newTypingEn.trim(), ...variants],
      grammarTipHi: newTypingTip.trim() || 'सही व्याकरण संरचना का ध्यान रखें।',
      level: 'intermediate',
    };

    await FirestoreService.saveEnglishTypingSentence(item);
    setNewTypingHi('');
    setNewTypingEn('');
    setNewTypingVariants('');
    setNewTypingTip('');
    showNotification(`✅ टाइपिंग अभ्यास वाक्य जोड़ा गया!`);
  };

  const handleDeleteTyping = async (id: string) => {
    await FirestoreService.deleteEnglishTypingSentence(id);
    showNotification('🗑️ टाइपिंग वाक्य हटाया गया');
  };

  const handleAddGrammar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrammarTitleEn.trim() || !newGrammarTitleHi.trim()) return;

    const item: EnglishGrammarTopic = {
      id: `grammar-${Date.now()}`,
      titleEn: newGrammarTitleEn.trim(),
      titleHi: newGrammarTitleHi.trim(),
      category: 'Golden Rules',
      level: 'intermediate',
      conceptHi: newGrammarConcept.trim() || 'व्याकरण का महत्वपूर्ण नियम।',
      rules: [
        {
          ruleTitle: newGrammarRuleTitle.trim() || 'गोल्डन रूल',
          explanationHi: newGrammarRuleExp.trim() || 'नियम का विवरण',
          wrongSentence: newGrammarWrong.trim() || 'Wrong usage',
          correctSentence: newGrammarCorrect.trim() || 'Correct usage',
          examTrapHi: 'परीक्षा में अक्सर पूछी जाने वाली गलती।',
        },
      ],
      miniQuiz: [],
    };

    await FirestoreService.saveEnglishGrammarTopic(item);
    setNewGrammarTitleEn('');
    setNewGrammarTitleHi('');
    setNewGrammarConcept('');
    setNewGrammarRuleTitle('');
    setNewGrammarRuleExp('');
    setNewGrammarWrong('');
    setNewGrammarCorrect('');
    showNotification(`✅ व्याकरण टॉपिक "${item.titleEn}" जोड़ा गया!`);
  };

  const handleDeleteGrammar = async (id: string) => {
    await FirestoreService.deleteEnglishGrammarTopic(id);
    showNotification('🗑️ व्याकरण टॉपिक हटाया गया');
  };

  const handleAddStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryTitle.trim() || !newStoryEn.trim()) return;

    const item: EnglishStoryItem = {
      id: `story-${Date.now()}`,
      titleEn: newStoryTitle.trim(),
      titleHi: newStoryTitleHi.trim() || newStoryTitle.trim(),
      level: 'intermediate',
      estimatedMinutes: 2,
      paragraphs: [
        {
          english: newStoryEn.trim(),
          hindi: newStoryHi.trim() || 'कहानी का हिंदी अनुवाद',
        },
      ],
      comprehensionQuestions: [],
    };

    await FirestoreService.saveEnglishStory(item);
    setNewStoryTitle('');
    setNewStoryTitleHi('');
    setNewStoryEn('');
    setNewStoryHi('');
    showNotification(`✅ नई कहानी सफलतापूर्वक जोड़ी गई!`);
  };

  const handleDeleteStory = async (id: string) => {
    await FirestoreService.deleteEnglishStory(id);
    showNotification('🗑️ कहानी हटाई गई');
  };

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'vocab', label: 'शब्द (Vocab)', count: vocabList.length },
    { id: 'sentences', label: 'वाक्य (Sentences)', count: sentencesList.length },
    { id: 'spelling', label: 'कठिन शब्द (Spelling)', count: spellingList.length },
    { id: 'mcq', label: 'MCQs', count: mcqList.length },
    { id: 'typing', label: 'टाइपिंग (Typing)', count: typingList.length },
    { id: 'grammar', label: 'व्याकरण (Grammar)', count: grammarList.length },
    { id: 'stories', label: 'कहानियां (Stories)', count: storiesList.length },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-3.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              onBack();
            }}
            className="p-1.5 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-amber-400" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-amber-400" />
              <span>English Admin Panel</span>
            </h2>
            <p className="text-[10px] text-slate-300">
              कंटेंट जोड़ें, संपादित करें व डिलीट करें (Firebase Synced)
            </p>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMsg && (
        <div className="bg-emerald-600 text-white p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex overflow-x-auto gap-1.5 pb-1 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playTapSound(soundEnabled);
              setActiveTab(tab.id);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: VOCABULARY */}
      {activeTab === 'vocab' && (
        <div className="space-y-4">
          <form onSubmit={handleAddVocab} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>नया शब्द जोड़ें (Add Vocabulary Word)</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">English Word *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ubiquitous"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Hindi Meaning *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. सर्वव्यापी, हर जगह मौजूद"
                  value={newWordHi}
                  onChange={(e) => setNewWordHi(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">आसान हिंदी व्याख्या</label>
              <input
                type="text"
                placeholder="जो चीज़ हर जगह उपस्थित हो या दिखाई दे।"
                value={newWordExplanation}
                onChange={(e) => setNewWordExplanation(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Example Sentence (EN)</label>
                <input
                  type="text"
                  placeholder="Smartphones have become ubiquitous."
                  value={newWordExample}
                  onChange={(e) => setNewWordExample(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Example (Hindi)</label>
                <input
                  type="text"
                  placeholder="स्मार्टफोन हर जगह सर्वव्यापी हो गए हैं।"
                  value={newWordExampleHi}
                  onChange={(e) => setNewWordExampleHi(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Mnemonic Trick (याद रखने की ट्रिक)</label>
                <input
                  type="text"
                  placeholder="Ubi -> Ubhi (अभी) हर जगह दिखना"
                  value={newWordMnemonic}
                  onChange={(e) => setNewWordMnemonic(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Level</label>
                <select
                  value={newWordLevel}
                  onChange={(e) => setNewWordLevel(e.target.value as any)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="beginner">Beginner (आसान)</option>
                  <option value="intermediate">Intermediate (मध्यम)</option>
                  <option value="advanced">Advanced (कठिन)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer active:scale-98 transition-all"
            >
              + शब्द सेव करें (Save to Firestore)
            </button>
          </form>

          {/* List of existing words */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-slate-700 px-1">
              मौजूदा शब्द भंडार ({vocabList.length} शब्द)
            </h4>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {vocabList.map((item) => (
                <div key={item.id} className="py-2 px-1 flex items-start justify-between gap-2">
                  <div className="text-xs">
                    <span className="font-bold text-slate-900">{item.word}</span>
                    <span className="text-slate-500 ml-1.5 font-medium">({item.hindiMeaning})</span>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.exampleSentence}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteVocab(item.id)}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer shrink-0"
                    title="हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SENTENCES */}
      {activeTab === 'sentences' && (
        <div className="space-y-4">
          <form onSubmit={handleAddSentence} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>नया वाक्य जोड़ें (Add Basic Sentence)</span>
            </h3>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">English Sentence *</label>
              <input
                type="text"
                required
                placeholder="e.g. Could you please give me a hand?"
                value={newSentEn}
                onChange={(e) => setNewSentEn(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Hindi Translation *</label>
              <input
                type="text"
                required
                placeholder="e.g. क्या आप मेरी थोड़ी मदद कर सकते हैं?"
                value={newSentHi}
                onChange={(e) => setNewSentHi(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Situation / Category</label>
                <input
                  type="text"
                  placeholder="e.g. Request / Polite"
                  value={newSentSituation}
                  onChange={(e) => setNewSentSituation(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Level</label>
                <select
                  value={newSentLevel}
                  onChange={(e) => setNewSentLevel(e.target.value as any)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer active:scale-98 transition-all"
            >
              + वाक्य सेव करें (Save Sentence)
            </button>
          </form>

          {/* List of existing sentences */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-slate-700 px-1">
              मौजूदा वाक्य ({sentencesList.length} वाक्य)
            </h4>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {sentencesList.map((item) => (
                <div key={item.id} className="py-2 px-1 flex items-start justify-between gap-2">
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">{item.english}</span>
                    <span className="text-slate-600">{item.hindi}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteSentence(item.id)}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer shrink-0"
                    title="हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SPELLING */}
      {activeTab === 'spelling' && (
        <div className="space-y-4">
          <form onSubmit={handleAddSpelling} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>कठिन शब्द जोड़ें (Tough Word Spelling)</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Word *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pneumonia"
                  value={newSpellWord}
                  onChange={(e) => setNewSpellWord(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Hindi Meaning</label>
                <input
                  type="text"
                  placeholder="e.g. फेफड़ों का संक्रमण"
                  value={newSpellHi}
                  onChange={(e) => setNewSpellHi(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Syllables Breakdown (कॉमा से अलग करें)</label>
              <input
                type="text"
                placeholder="e.g. Pneu, mo, nia"
                value={newSpellBreakdown}
                onChange={(e) => setNewSpellBreakdown(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Mnemonic Rule / Trick</label>
              <input
                type="text"
                placeholder="P silent रहता है, याद रखें Pneu + monia"
                value={newSpellMnemonic}
                onChange={(e) => setNewSpellMnemonic(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer active:scale-98 transition-all"
            >
              + कठिन शब्द सेव करें (Save Spelling)
            </button>
          </form>

          {/* Existing spelling list */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-slate-700 px-1">
              मौजूदा कठिन शब्द ({spellingList.length} शब्द)
            </h4>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {spellingList.map((item) => (
                <div key={item.id} className="py-2 px-1 flex items-start justify-between gap-2">
                  <div className="text-xs">
                    <span className="font-bold text-slate-900">{item.word}</span>
                    <span className="text-slate-500 ml-1.5 font-medium">({item.hindiMeaning})</span>
                    <p className="text-[11px] text-amber-700 font-medium">
                      विभाजन: {item.breakdown.join(' - ')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteSpelling(item.id)}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer shrink-0"
                    title="हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MCQS */}
      {activeTab === 'mcq' && (
        <div className="space-y-4">
          <form onSubmit={handleAddMcq} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>नया MCQ अनुवाद प्रश्न जोड़ें</span>
            </h3>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Hindi Sentence *</label>
              <input
                type="text"
                required
                placeholder="e.g. वह सुबह से पढ़ रहा है।"
                value={newMcqHi}
                onChange={(e) => setNewMcqHi(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Option 1 (Index 0) *</label>
                <input
                  type="text"
                  required
                  placeholder="He has been studying since morning."
                  value={newMcqOpt0}
                  onChange={(e) => setNewMcqOpt0(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Option 2 (Index 1) *</label>
                <input
                  type="text"
                  required
                  placeholder="He is studying since morning."
                  value={newMcqOpt1}
                  onChange={(e) => setNewMcqOpt1(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Option 3 (Index 2)</label>
                <input
                  type="text"
                  placeholder="He was studying for morning."
                  value={newMcqOpt2}
                  onChange={(e) => setNewMcqOpt2(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Option 4 (Index 3)</label>
                <input
                  type="text"
                  placeholder="He has studied from morning."
                  value={newMcqOpt3}
                  onChange={(e) => setNewMcqOpt3(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">सही उत्तर विकल्प (Correct)</label>
                <select
                  value={newMcqCorrect}
                  onChange={(e) => setNewMcqCorrect(Number(e.target.value))}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value={0}>Option 1 (A)</option>
                  <option value={1}>Option 2 (B)</option>
                  <option value={2}>Option 3 (C)</option>
                  <option value={3}>Option 4 (D)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Hindi Explanation</label>
                <input
                  type="text"
                  placeholder="Present Perfect Continuous में has been + V1+ing लगता है।"
                  value={newMcqExpHi}
                  onChange={(e) => setNewMcqExpHi(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer active:scale-98 transition-all"
            >
              + MCQ सेव करें (Save MCQ)
            </button>
          </form>

          {/* List of existing MCQs */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-slate-700 px-1">
              मौजूदा MCQ प्रश्न ({mcqList.length} प्रश्न)
            </h4>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {mcqList.map((item) => (
                <div key={item.id} className="py-2 px-1 flex items-start justify-between gap-2">
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">{item.hindiSentence}</span>
                    <span className="text-emerald-700 text-[11px] font-semibold">
                      सही: {item.options[item.correctIndex]}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteMcq(item.id)}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer shrink-0"
                    title="हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TYPING */}
      {activeTab === 'typing' && (
        <div className="space-y-4">
          <form onSubmit={handleAddTyping} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>टाइपिंग अनुवाद वाक्य जोड़ें</span>
            </h3>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Hindi Sentence *</label>
              <input
                type="text"
                required
                placeholder="e.g. सूर्य पूर्व में उगता है।"
                value={newTypingHi}
                onChange={(e) => setNewTypingHi(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Target English Translation *</label>
              <input
                type="text"
                required
                placeholder="e.g. The sun rises in the east."
                value={newTypingEn}
                onChange={(e) => setNewTypingEn(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Other Accepted Variants (कॉमा से अलग)</label>
              <input
                type="text"
                placeholder="e.g. The sun rises in the east, Sun rises in east"
                value={newTypingVariants}
                onChange={(e) => setNewTypingVariants(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Grammar Tip (Hindi)</label>
              <input
                type="text"
                placeholder="दिशाओं के नाम के आगे 'the' का प्रयोग अवश्य करें।"
                value={newTypingTip}
                onChange={(e) => setNewTypingTip(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer active:scale-98 transition-all"
            >
              + टाइपिंग वाक्य सेव करें (Save)
            </button>
          </form>

          {/* List of existing typing sentences */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-slate-700 px-1">
              मौजूदा टाइपिंग वाक्य ({typingList.length} वाक्य)
            </h4>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {typingList.map((item) => (
                <div key={item.id} className="py-2 px-1 flex items-start justify-between gap-2">
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">{item.hindiSentence}</span>
                    <span className="text-blue-700 font-semibold">{item.targetEnglish}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteTyping(item.id)}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer shrink-0"
                    title="हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: GRAMMAR */}
      {activeTab === 'grammar' && (
        <div className="space-y-4">
          <form onSubmit={handleAddGrammar} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>नया व्याकरण टॉपिक जोड़ें (Add Grammar Topic)</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Topic Title (EN) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Subject-Verb Agreement"
                  value={newGrammarTitleEn}
                  onChange={(e) => setNewGrammarTitleEn(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Topic Title (HI) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. कर्ता और क्रिया का तालमेल"
                  value={newGrammarTitleHi}
                  onChange={(e) => setNewGrammarTitleHi(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Concept Explanation (Hindi)</label>
              <textarea
                rows={2}
                placeholder="सिंगुलर कर्ता के साथ सिंगुलर वर्ब और प्लूरल के साथ प्लूरल वर्ब आती है।"
                value={newGrammarConcept}
                onChange={(e) => setNewGrammarConcept(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-700 block">गोल्डन रूल व उदाहरण</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="रूल शीर्षक (e.g. Either... Or का नियम)"
                  value={newGrammarRuleTitle}
                  onChange={(e) => setNewGrammarRuleTitle(e.target.value)}
                  className="text-xs p-1.5 border border-slate-200 rounded-lg bg-white"
                />
                <input
                  type="text"
                  placeholder="रूल व्याख्या (Hindi)"
                  value={newGrammarRuleExp}
                  onChange={(e) => setNewGrammarRuleExp(e.target.value)}
                  className="text-xs p-1.5 border border-slate-200 rounded-lg bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="अशुद्ध वाक्य (Wrong: e.g. Neither he nor I are ready)"
                  value={newGrammarWrong}
                  onChange={(e) => setNewGrammarWrong(e.target.value)}
                  className="text-xs p-1.5 border border-rose-200 rounded-lg bg-white text-rose-800"
                />
                <input
                  type="text"
                  placeholder="शुद्ध वाक्य (Correct: Neither he nor I am ready)"
                  value={newGrammarCorrect}
                  onChange={(e) => setNewGrammarCorrect(e.target.value)}
                  className="text-xs p-1.5 border border-emerald-200 rounded-lg bg-white text-emerald-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer active:scale-98 transition-all"
            >
              + व्याकरण टॉपिक सेव करें (Save Topic)
            </button>
          </form>

          {/* List of grammar topics */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-slate-700 px-1">
              मौजूदा व्याकरण टॉपिक्स ({grammarList.length} टॉपिक्स)
            </h4>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {grammarList.map((item) => (
                <div key={item.id} className="py-2 px-1 flex items-start justify-between gap-2">
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">{item.titleEn}</span>
                    <span className="text-slate-600 text-[11px]">{item.titleHi}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteGrammar(item.id)}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer shrink-0"
                    title="हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: STORIES */}
      {activeTab === 'stories' && (
        <div className="space-y-4">
          <form onSubmit={handleAddStory} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>नई कहानी / पैराग्राफ जोड़ें</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Story Title (EN) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Honest Woodcutter"
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Hindi Title</label>
                <input
                  type="text"
                  placeholder="e.g. ईमानदार लकड़हारा"
                  value={newStoryTitleHi}
                  onChange={(e) => setNewStoryTitleHi(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Story Content (English) *</label>
              <textarea
                rows={3}
                required
                placeholder="Write the English passage or story here..."
                value={newStoryEn}
                onChange={(e) => setNewStoryEn(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Hindi Translation</label>
              <textarea
                rows={3}
                placeholder="कहानी का हिंदी अनुवाद यहाँ लिखें..."
                value={newStoryHi}
                onChange={(e) => setNewStoryHi(e.target.value)}
                className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer active:scale-98 transition-all"
            >
              + कहानी सेव करें (Save Story)
            </button>
          </form>

          {/* List of existing stories */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-slate-700 px-1">
              मौजूदा कहानियां ({storiesList.length} कहानियां)
            </h4>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {storiesList.map((item) => (
                <div key={item.id} className="py-2 px-1 flex items-start justify-between gap-2">
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">{item.titleEn}</span>
                    <span className="text-slate-500 text-[11px] line-clamp-1">
                      {item.paragraphs?.[0]?.hindi || item.titleHi}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteStory(item.id)}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer shrink-0"
                    title="हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
