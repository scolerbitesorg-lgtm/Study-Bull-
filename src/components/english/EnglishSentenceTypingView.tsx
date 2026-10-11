import React, { useState, useEffect } from 'react';
import { EnglishSentenceTypingItem, EnglishProficiencyLevel, Language, UserWrongAnswerItem } from '../../types';
import { playTapSound, playCorrectSound, playWrongSound } from '../../utils/audio';
import { 
  ArrowLeft, 
  Check, 
  X, 
  ArrowRight, 
  Trophy,
  RotateCcw,
  Keyboard,
  Lightbulb
} from 'lucide-react';

interface EnglishSentenceTypingViewProps {
  typingList: EnglishSentenceTypingItem[];
  language: Language;
  soundEnabled: boolean;
  onBack: () => void;
  onRecordWrong: (item: UserWrongAnswerItem) => void;
  onSuccess: () => void;
  onSilentReplenish?: () => void;
}

type QuestionCountOption = 5 | 10 | 15 | 20 | 'infinite';

export const EnglishSentenceTypingView: React.FC<EnglishSentenceTypingViewProps> = ({
  typingList,
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
  const [userTyped, setUserTyped] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Filter pool based on level
  const filtered = typingList.filter(
    (item) => selectedLevel === 'all' || item.level === selectedLevel
  );

  const currentItem: EnglishSentenceTypingItem | undefined = filtered[sessionIndex % (filtered.length || 1)];

  // Silent background replenishment when pool gets used
  useEffect(() => {
    if (isPracticeActive && onSilentReplenish) {
      if (sessionIndex >= filtered.length - 2 || selectedCount === 'infinite') {
        onSilentReplenish();
      }
    }
  }, [sessionIndex, isPracticeActive, filtered.length, selectedCount, onSilentReplenish]);

  const cleanString = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/[.,!?'"]/g, '')
      .replace(/\s+/g, ' ');
  };

  const handleStartPractice = () => {
    playTapSound(soundEnabled);
    setSessionIndex(0);
    setUserTyped('');
    setIsAnswered(false);
    setIsCorrect(false);
    setSessionCorrect(0);
    setSessionWrong(0);
    setIsCompleted(false);
    setIsPracticeActive(true);
  };

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentItem || !userTyped.trim() || isAnswered) return;

    const cleanInput = cleanString(userTyped);
    const cleanTarget = cleanString(currentItem.targetEnglish);
    const matchesAccepted = currentItem.acceptedVariations.some(
      (v) => cleanString(v) === cleanInput
    );

    const correct = cleanInput === cleanTarget || matchesAccepted;
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
        id: `wrong_type_${Date.now()}`,
        type: 'typing',
        question: `Translation of: "${currentItem.hindiSentence}"`,
        correctAnswer: currentItem.targetEnglish,
        userAnswer: userTyped.trim(),
        explanationHi: currentItem.grammarTipHi,
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
    setUserTyped('');
    setIsAnswered(false);
    setIsCorrect(false);
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
          <span className="text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200/60 px-3 py-1 rounded-xl">
            ⌨️ {filtered.length} वाक्य उपलब्ध
          </span>
        </div>

        {/* Practice Setup Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-2xl mb-3 shadow-inner">
              ⌨️
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Sentence Typing अभ्यास
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
              हिंदी वाक्यों को खुद अंग्रेजी में टाइप करके अपनी ग्रामर और वोकैबुलरी मजबूत करें। अभ्यास पूरी स्क्रीन पर खुलेगा।
            </p>
          </div>

          {/* Question Count Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              1. प्रश्नों (वाक्यों) की संख्या चुनें:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { count: 5 as QuestionCountOption, label: '5 वाक्य', sub: 'त्वरित टाइपिंग' },
                { count: 10 as QuestionCountOption, label: '10 वाक्य', sub: 'मानक सेट' },
                { count: 15 as QuestionCountOption, label: '15 वाक्य', sub: 'अनुशंसित' },
                { count: 20 as QuestionCountOption, label: '20 वाक्य', sub: 'गहरा अभ्यास' },
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
                      ? 'bg-sky-600 border-sky-700 text-white shadow-md ring-2 ring-sky-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-sm font-black">{opt.label}</span>
                  <span className={`block text-[10px] mt-0.5 ${
                    selectedCount === opt.count ? 'text-sky-100' : 'text-slate-500'
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
          <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-sky-900 font-semibold">
              वर्तमान उपलब्ध वाक्य बैंक:
            </span>
            <span className="font-black text-sky-950">
              {filtered.length} वाक्य
            </span>
          </div>

          {/* Start Full Screen Practice Button */}
          <button
            onClick={handleStartPractice}
            type="button"
            className="w-full py-4 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/25 transition-all cursor-pointer"
          >
            <span>🚀 फुल स्क्रीन में टाइपिंग अभ्यास शुरू करें</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 2. FULL SCREEN TYPING VIEW
  const totalTarget = selectedCount === 'infinite' ? null : selectedCount;
  const progressPercent = totalTarget ? Math.min(100, Math.round(((sessionIndex + 1) / totalTarget) * 100)) : 100;

  // Completion Screen
  if (isCompleted) {
    const totalDone = sessionCorrect + sessionWrong;
    const accuracy = totalDone > 0 ? Math.round((sessionCorrect / totalDone) * 100) : 0;

    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6">
          <div className="w-20 h-20 bg-sky-500/20 text-sky-400 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              टाइपिंग सेट पूरा हुआ!
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              उत्कृष्ट काम! खुद से टाइप करने से अंग्रेजी सोचने की आदत विकसित होती है।
            </p>
          </div>

          {/* Results Score Box */}
          <div className="grid grid-cols-3 gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">कुल वाक्य</span>
              <span className="text-xl font-black text-white">{totalDone}</span>
            </div>
            <div>
              <span className="text-[11px] text-emerald-400 block font-medium">सही अनुवाद</span>
              <span className="text-xl font-black text-emerald-400">{sessionCorrect}</span>
            </div>
            <div>
              <span className="text-[11px] text-sky-400 block font-medium">सटीकता</span>
              <span className="text-xl font-black text-sky-400">{accuracy}%</span>
            </div>
          </div>

          {sessionWrong > 0 && (
            <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-900/50 p-2.5 rounded-xl font-medium">
              💡 {sessionWrong} गलत वाक्य Revision Centre में सेव कर दिए गए हैं।
            </p>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={handleStartPractice}
              type="button"
              className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>नया टाइपिंग अभ्यास शुरू करें</span>
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

  if (!currentItem) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <p className="text-sm font-bold text-slate-300">वाक्य लोड हो रहे हैं...</p>
        <button
          onClick={handleExitFullScreen}
          className="mt-4 px-4 py-2 bg-sky-600 rounded-xl text-xs font-bold"
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
            <span className="text-xs font-black text-sky-300 bg-sky-950/80 border border-sky-800 px-2.5 py-1 rounded-xl font-mono">
              वाक्य {sessionIndex + 1} / {totalTarget ? totalTarget : '∞'}
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
              className="bg-sky-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Main Full Screen Typing Stage */}
      <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Difficulty Pill */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-sky-400 bg-sky-950/60 border border-sky-800/80 px-2.5 py-1 rounded-lg">
            कठिनाई: {currentItem.difficulty || 'Standard'}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            {currentItem.level}
          </span>
        </div>

        {/* Hindi Prompt */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-lg space-y-2">
          <span className="text-[11px] font-black uppercase text-sky-400 tracking-wider block">
            दिए गए हिंदी वाक्य को सही English में टाइप करें:
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-relaxed">
            "{currentItem.hindiSentence}"
          </h2>
        </div>

        {/* Interactive Typing Form */}
        <form onSubmit={handleCheck} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={userTyped}
              onChange={(e) => setUserTyped(e.target.value)}
              disabled={isAnswered}
              placeholder="यहाँ अंग्रेजी अनुवाद टाइप करें..."
              autoFocus
              className={`w-full py-4 px-5 pr-12 rounded-2xl border text-sm sm:text-base font-bold transition-all outline-hidden ${
                isAnswered
                  ? isCorrect
                    ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 ring-2 ring-emerald-400'
                    : 'bg-rose-950/50 border-rose-500 text-rose-200 ring-2 ring-rose-400'
                  : 'bg-slate-900 border-slate-800 text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
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
              disabled={!userTyped.trim()}
              className="w-full py-4 bg-sky-600 hover:bg-sky-700 active:scale-98 disabled:opacity-40 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
            >
              <Keyboard className="w-4 h-4" />
              <span>उत्तर जांचें (Check Translation)</span>
            </button>
          ) : (
            <div className="space-y-3.5 pt-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Feedback Card */}
              <div className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-2 ${
                isCorrect 
                  ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-200' 
                  : 'bg-rose-950/50 border-rose-800/80 text-rose-200'
              }`}>
                <div className="font-bold flex items-center gap-2">
                  {isCorrect ? '✓ बिल्कुल सही उत्तर!' : '✕ गलत उत्तर! सही अनुवाद नीचे देखें:'}
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 font-mono text-sm font-bold text-white">
                  {currentItem.targetEnglish}
                </div>

                {currentItem.acceptedVariations?.length > 1 && (
                  <div className="text-[11px] text-slate-300">
                    <span className="font-bold text-slate-400">अन्य मान्य रूप: </span>
                    {currentItem.acceptedVariations.slice(1).join(' / ')}
                  </div>
                )}

                {currentItem.grammarTipHi && (
                  <div className="text-[11px] text-slate-300 flex items-start gap-1.5 pt-1 border-t border-slate-800">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{currentItem.grammarTipHi}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full py-4 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
              >
                <span>अगला वाक्य (Next Sentence)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
