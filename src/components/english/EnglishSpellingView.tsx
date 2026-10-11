import React, { useState, useEffect } from 'react';
import { EnglishSpellingItem, EnglishProficiencyLevel, Language, UserWrongAnswerItem } from '../../types';
import { playTapSound, playCorrectSound, playWrongSound } from '../../utils/audio';
import { 
  ArrowLeft, 
  Check, 
  X, 
  ArrowRight, 
  Trophy,
  RotateCcw,
  Lightbulb,
  HelpCircle,
  Eye,
  PenTool
} from 'lucide-react';

interface EnglishSpellingViewProps {
  spellingList: EnglishSpellingItem[];
  language: Language;
  soundEnabled: boolean;
  onBack: () => void;
  onRecordWrong: (item: UserWrongAnswerItem) => void;
  onSuccess: () => void;
  onSilentReplenish?: () => void;
}

type QuestionCountOption = 5 | 10 | 15 | 20 | 'infinite';

export const EnglishSpellingView: React.FC<EnglishSpellingViewProps> = ({
  spellingList,
  language,
  soundEnabled,
  onBack,
  onRecordWrong,
  onSuccess,
  onSilentReplenish,
}) => {
  // Setup configuration state
  const [isPracticeActive, setIsPracticeActive] = useState(false);
  const [selectedCount, setSelectedCount] = useState<QuestionCountOption>(10);
  const [selectedLevel, setSelectedLevel] = useState<EnglishProficiencyLevel | 'all'>('all');

  // Active session state
  const [sessionIndex, setSessionIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Filter pool based on level
  const filtered = spellingList.filter(
    (w) => selectedLevel === 'all' || w.level === selectedLevel
  );

  const activeWord: EnglishSpellingItem | undefined = filtered[sessionIndex % (filtered.length || 1)];

  // Silent background replenishment when pool gets used
  useEffect(() => {
    if (isPracticeActive && onSilentReplenish) {
      if (sessionIndex >= filtered.length - 2 || selectedCount === 'infinite') {
        onSilentReplenish();
      }
    }
  }, [sessionIndex, isPracticeActive, filtered.length, selectedCount, onSilentReplenish]);

  const handleStartPractice = () => {
    playTapSound(soundEnabled);
    setSessionIndex(0);
    setUserInput('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setSessionCorrect(0);
    setSessionWrong(0);
    setIsCompleted(false);
    setIsPracticeActive(true);
  };

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeWord || !userInput.trim() || isAnswered) return;

    const cleanInput = userInput.trim().toLowerCase();
    const cleanWord = activeWord.word.trim().toLowerCase();
    const correct = cleanInput === cleanWord;

    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      playCorrectSound(soundEnabled);
      setSessionCorrect((c) => c + 1);
      onSuccess();
    } else {
      playWrongSound(soundEnabled);
      setSessionWrong((w) => w + 1);
      onRecordWrong({
        id: `wrong_spell_${Date.now()}`,
        type: 'spelling',
        question: `Spelling of "${activeWord.word}" (${activeWord.hindiMeaning})`,
        correctAnswer: activeWord.word,
        userAnswer: userInput.trim(),
        explanationHi: `${activeWord.mnemonicRule} (उच्चारण: ${activeWord.phoneticHint})`,
        timestamp: new Date().toISOString(),
      });
    }

    // Trigger silent background replenishment on every answer so questions never run out
    if (onSilentReplenish) {
      onSilentReplenish();
    }
  };

  const handleNext = () => {
    playTapSound(soundEnabled);

    const nextIndex = sessionIndex + 1;
    if (selectedCount !== 'infinite' && nextIndex >= selectedCount) {
      setIsCompleted(true);
      return;
    }

    setSessionIndex(nextIndex);
    setUserInput('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
  };

  const handleExitFullScreen = () => {
    playTapSound(soundEnabled);
    setIsPracticeActive(false);
    setIsCompleted(false);
  };

  // 1. PRE-PRACTICE SETUP SCREEN
  if (!isPracticeActive) {
    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              onBack();
            }}
            type="button"
            className="flex items-center gap-1.5 py-1.5 px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'hi' ? 'वापस' : 'Back'}</span>
          </button>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-xl">
            ✍️ {filtered.length} कठिन शब्द उपलब्ध
          </span>
        </div>

        {/* Practice Setup Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl mb-3 shadow-inner">
              ✍️
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Words Writing (Spelling Practice)
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
              Pneumonia, Queue, Lieutenant जैसे कठिन व बार-बार पूछे जाने वाले शब्दों की स्पेलिंग लिखने का अभ्यास करें।
            </p>
          </div>

          {/* Question Count Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              1. शब्दों की संख्या चुनें (Select Words Count):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { count: 5 as QuestionCountOption, label: '5 शब्द', sub: 'त्वरित ड्रिल' },
                { count: 10 as QuestionCountOption, label: '10 शब्द', sub: 'मानक सेट' },
                { count: 15 as QuestionCountOption, label: '15 शब्द', sub: 'अनुशंसित' },
                { count: 20 as QuestionCountOption, label: '20 शब्द', sub: 'गहरा अभ्यास' },
                { count: 'infinite' as QuestionCountOption, label: '∞ अनलिमिटेड', sub: 'अनंत सवाल' },
              ].map((opt) => (
                <button
                  key={String(opt.count)}
                  type="button"
                  onClick={() => {
                    playTapSound(soundEnabled);
                    setSelectedCount(opt.count);
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer active:scale-95 ${
                    selectedCount === opt.count
                      ? 'bg-amber-600 border-amber-700 text-white shadow-md ring-2 ring-amber-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-sm font-black">{opt.label}</span>
                  <span className={`block text-[10px] mt-0.5 ${
                    selectedCount === opt.count ? 'text-amber-100' : 'text-slate-500'
                  }`}>
                    {opt.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Level Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              2. स्तर चुनें (Difficulty Level):
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'all', label: 'सभी (All)' },
                { id: 'beginner', label: 'Beginner' },
                { id: 'intermediate', label: 'Medium' },
                { id: 'advanced', label: 'Advanced' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => {
                    playTapSound(soundEnabled);
                    setSelectedLevel(lvl.id as EnglishProficiencyLevel | 'all');
                  }}
                  className={`py-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                    selectedLevel === lvl.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pool Info */}
          <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-amber-900 font-semibold">
              वर्तमान उपलब्ध कठिन शब्द बैंक:
            </span>
            <span className="font-black text-amber-950">
              {filtered.length} शब्द
            </span>
          </div>

          {/* Start Full Screen Practice Button */}
          <button
            onClick={handleStartPractice}
            type="button"
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition-all cursor-pointer"
          >
            <span>🚀 फुल स्क्रीन में स्पेलिंग अभ्यास शुरू करें</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 2. FULL SCREEN SPELLING VIEW
  const totalTarget = selectedCount === 'infinite' ? null : selectedCount;
  const progressPercent = totalTarget ? Math.min(100, Math.round(((sessionIndex + 1) / totalTarget) * 100)) : 100;

  // Completion Screen
  if (isCompleted) {
    const totalDone = sessionCorrect + sessionWrong;
    const accuracy = totalDone > 0 ? Math.round((sessionCorrect / totalDone) * 100) : 0;

    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6">
          <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              स्पेलिंग सेट पूरा हुआ!
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              बधाई हो! कठिन स्पेलिंग्स पर पकड़ बनने से परीक्षा में नेगेटिव मार्किंग से बचेंगे।
            </p>
          </div>

          {/* Results Score Box */}
          <div className="grid grid-cols-3 gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">कुल शब्द</span>
              <span className="text-xl font-black text-white">{totalDone}</span>
            </div>
            <div>
              <span className="text-[11px] text-emerald-400 block font-medium">सही स्पेलिंग</span>
              <span className="text-xl font-black text-emerald-400">{sessionCorrect}</span>
            </div>
            <div>
              <span className="text-[11px] text-amber-400 block font-medium">सटीकता</span>
              <span className="text-xl font-black text-amber-400">{accuracy}%</span>
            </div>
          </div>

          {sessionWrong > 0 && (
            <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-900/50 p-2.5 rounded-xl font-medium">
              💡 {sessionWrong} गलत स्पेलिंग्स Revision Centre में सुरक्षित सेव हो गई हैं।
            </p>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={handleStartPractice}
              type="button"
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>नया स्पेलिंग अभ्यास शुरू करें</span>
            </button>
            <button
              onClick={handleExitFullScreen}
              type="button"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl font-bold text-xs transition-all cursor-pointer"
            >
              <span>मेनू में वापस जाएं (Back to Menu)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!activeWord) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <p className="text-sm font-bold text-slate-300">शब्द लोड हो रहे हैं...</p>
        <button
          onClick={handleExitFullScreen}
          className="mt-4 px-4 py-2 bg-amber-600 rounded-xl text-xs font-bold"
        >
          वापस जाएं
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-y-auto animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={handleExitFullScreen}
            type="button"
            className="flex items-center gap-1.5 py-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>बाहर निकलें</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-amber-300 bg-amber-950/80 border border-amber-800 px-2.5 py-1 rounded-xl font-mono">
              शब्द {sessionIndex + 1} / {totalTarget ? totalTarget : '∞'}
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-900 px-2 py-1 rounded-xl">
              ✓ {sessionCorrect}
            </span>
            {sessionWrong > 0 && (
              <span className="text-xs font-bold text-rose-400 bg-rose-950/80 border border-rose-900 px-2 py-1 rounded-xl">
                ✕ {sessionWrong}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {totalTarget && (
          <div className="w-full bg-slate-800 h-1.5 mt-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Main Full Screen Spelling Drill */}
      <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Word Level */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-lg">
            उच्चारण: {activeWord.phoneticHint}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            {activeWord.level}
          </span>
        </div>

        {/* Hindi Meaning Prompt */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-lg space-y-2">
          <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider block">
            हिंदी अर्थ देखकर सही अंग्रेजी Spelling लिखें:
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-relaxed">
            "{activeWord.hindiMeaning}"
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            ध्वनि/उच्चारण: <span className="text-slate-200 font-bold">{activeWord.phoneticHint}</span>
          </p>
        </div>

        {/* Hint button if user is stuck */}
        {!isAnswered && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-amber-400/90 hover:text-amber-300 flex items-center gap-1.5 py-1 px-3 rounded-full bg-amber-950/40 border border-amber-900/60 cursor-pointer transition-all"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{showHint ? 'संकेत छिपाएं' : 'ट्रिकी लेटर्स का संकेत देखें (Show Hint)'}</span>
            </button>
          </div>
        )}

        {showHint && !isAnswered && (
          <div className="bg-amber-950/30 border border-amber-900/60 rounded-2xl p-3 text-xs text-amber-200 text-center animate-in fade-in">
            <p className="font-semibold">{activeWord.trickyPartExplanation}</p>
          </div>
        )}

        {/* Interactive Input Form */}
        <form onSubmit={handleCheck} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isAnswered}
              placeholder="यहाँ अंग्रेजी spelling लिखें..."
              autoFocus
              className={`w-full py-4 px-5 pr-12 rounded-2xl border text-base sm:text-lg font-black tracking-wide text-center transition-all outline-hidden ${
                isAnswered
                  ? isCorrect
                    ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 ring-2 ring-emerald-400'
                    : 'bg-rose-950/50 border-rose-500 text-rose-200 ring-2 ring-rose-400'
                  : 'bg-slate-900 border-slate-800 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
              }`}
            />
            {isAnswered && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isCorrect ? (
                  <Check className="w-6 h-6 text-emerald-400" />
                ) : (
                  <X className="w-6 h-6 text-rose-400" />
                )}
              </div>
            )}
          </div>

          {!isAnswered ? (
            <button
              type="submit"
              disabled={!userInput.trim()}
              className="w-full py-4 bg-amber-600 hover:bg-amber-700 active:scale-98 disabled:opacity-40 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
            >
              <PenTool className="w-4 h-4" />
              <span>स्पेलिंग जांचें (Check Spelling)</span>
            </button>
          ) : (
            <div className="space-y-3.5 pt-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Feedback Card */}
              <div className={`p-5 rounded-2xl border text-xs sm:text-sm space-y-2.5 ${
                isCorrect 
                  ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-200' 
                  : 'bg-rose-950/50 border-rose-800/80 text-rose-200'
              }`}>
                <div className="font-bold flex items-center justify-between">
                  <span>{isCorrect ? '✓ बिल्कुल सही स्पेलिंग!' : '✕ गलत स्पेलिंग! सही स्पेलिंग:'}</span>
                </div>

                <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-xl sm:text-2xl font-black tracking-widest text-emerald-300 font-mono block">
                    {activeWord.word}
                  </span>
                </div>

                {/* Tricky Part & Mnemonic breakdown */}
                <div className="space-y-1 text-slate-300 pt-1 border-t border-slate-800 text-xs">
                  <p className="font-bold text-amber-300">
                    🔍 ट्रिकी लेटर्स: {activeWord.trickyPartExplanation}
                  </p>
                  <p className="text-slate-300">
                    💡 याद रखने की ट्रिक: {activeWord.mnemonicRule}
                  </p>
                  {activeWord.exampleSentence && (
                    <p className="text-[11px] text-slate-400 italic mt-1">
                      उदाहरण: "{activeWord.exampleSentence}"
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full py-4 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
              >
                <span>अगला शब्द (Next Word)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
