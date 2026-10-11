import React, { useState, useEffect } from 'react';
import { EnglishMcqItem, EnglishProficiencyLevel, Language, UserWrongAnswerItem } from '../../types';
import { playTapSound, playCorrectSound, playWrongSound } from '../../utils/audio';
import { 
  ArrowLeft, 
  Check, 
  X, 
  ArrowRight, 
  CheckCircle2,
  Trophy,
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';

interface EnglishMcqViewProps {
  mcqList: EnglishMcqItem[];
  language: Language;
  soundEnabled: boolean;
  onBack: () => void;
  onRecordWrong: (item: UserWrongAnswerItem) => void;
  onSuccess: () => void;
  onSilentReplenish?: () => void;
}

type QuestionCountOption = 5 | 10 | 15 | 20 | 'infinite';

export const EnglishMcqView: React.FC<EnglishMcqViewProps> = ({
  mcqList,
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
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Filter pool based on level
  const filtered = mcqList.filter(
    (q) => selectedLevel === 'all' || q.level === selectedLevel
  );

  const currentQ: EnglishMcqItem | undefined = filtered[sessionIndex % (filtered.length || 1)];

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
    setSelectedOption(null);
    setIsAnswered(false);
    setSessionCorrect(0);
    setSessionWrong(0);
    setIsCompleted(false);
    setIsPracticeActive(true);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !currentQ) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isRight = idx === currentQ.correctIndex;
    if (isRight) {
      playCorrectSound(soundEnabled);
      setSessionCorrect((c) => c + 1);
      onSuccess();
    } else {
      playWrongSound(soundEnabled);
      setSessionWrong((w) => w + 1);
      onRecordWrong({
        id: `wrong_mcq_${Date.now()}`,
        type: 'mcq',
        question: currentQ.hindiSentence,
        correctAnswer: currentQ.options[currentQ.correctIndex],
        userAnswer: currentQ.options[idx],
        explanationHi: currentQ.explanationHi,
        timestamp: new Date().toISOString(),
      });
    }

    // Trigger silent background replenishment on every answer so questions never end
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
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const handleExitFullScreen = () => {
    playTapSound(soundEnabled);
    setIsPracticeActive(false);
    setIsCompleted(false);
  };

  // 1. PRE-PRACTICE SETUP SCREEN (Select question count and level)
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
          <span className="text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200/60 px-3 py-1 rounded-xl">
            🎯 {filtered.length} प्रश्न उपलब्ध
          </span>
        </div>

        {/* Practice Setup Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl mb-3 shadow-inner">
              🎯
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Hindi to English MCQ अभ्यास
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
              अभ्यास शुरू करने से पहले प्रश्नों की संख्या और स्तर चुनें। इसके बाद प्रश्न पूरी स्क्रीन पर आएंगे।
            </p>
          </div>

          {/* Question Count Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              1. प्रश्नों की संख्या चुनें (Select Question Count):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { count: 5 as QuestionCountOption, label: '5 प्रश्न', sub: 'त्वरित अभ्यास' },
                { count: 10 as QuestionCountOption, label: '10 प्रश्न', sub: 'मानक सेट' },
                { count: 15 as QuestionCountOption, label: '15 प्रश्न', sub: 'अनुशंसित' },
                { count: 20 as QuestionCountOption, label: '20 प्रश्न', sub: 'गहरा अभ्यास' },
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
                      ? 'bg-purple-600 border-purple-700 text-white shadow-md ring-2 ring-purple-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-sm font-black">{opt.label}</span>
                  <span className={`block text-[10px] mt-0.5 ${
                    selectedCount === opt.count ? 'text-purple-100' : 'text-slate-500'
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
              2. कठिनाई स्तर चुनें (Select Difficulty Level):
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

          {/* Real Count Availability Info */}
          <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-purple-900 font-semibold">
              वर्तमान उपलब्ध प्रश्न बैंक:
            </span>
            <span className="font-black text-purple-950">
              {filtered.length} प्रश्न
            </span>
          </div>

          {/* Start Full Screen Practice Button */}
          <button
            onClick={handleStartPractice}
            type="button"
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
          >
            <span>🚀 फुल स्क्रीन में अभ्यास शुरू करें</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 2. FULL SCREEN PRACTICE VIEW (When practice is active)
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
              अभ्यास पूरा हुआ!
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              शानदार प्रयास! आपकी अनुवाद गति और नियमों की समझ में सुधार हो रहा है।
            </p>
          </div>

          {/* Results Score Box */}
          <div className="grid grid-cols-3 gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">कुल प्रश्न</span>
              <span className="text-xl font-black text-white">{totalDone}</span>
            </div>
            <div>
              <span className="text-[11px] text-emerald-400 block font-medium">सही उत्तर</span>
              <span className="text-xl font-black text-emerald-400">{sessionCorrect}</span>
            </div>
            <div>
              <span className="text-[11px] text-amber-400 block font-medium">सटीकता</span>
              <span className="text-xl font-black text-amber-400">{accuracy}%</span>
            </div>
          </div>

          {sessionWrong > 0 && (
            <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-900/50 p-2.5 rounded-xl font-medium">
              💡 {sessionWrong} गलत उत्तर Revision Centre में सेव कर दिए गए हैं।
            </p>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={handleStartPractice}
              type="button"
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>नया अभ्यास शुरू करें (Practice Again)</span>
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

  if (!currentQ) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <p className="text-sm font-bold text-slate-300">प्रश्न लोड हो रहे हैं...</p>
        <button
          onClick={handleExitFullScreen}
          className="mt-4 px-4 py-2 bg-purple-600 rounded-xl text-xs font-bold"
        >
          वापस जाएं
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-y-auto animate-in fade-in duration-200">
      {/* Top Full Screen Header Bar */}
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
            <span className="text-xs font-black text-purple-300 bg-purple-950/80 border border-purple-800 px-2.5 py-1 rounded-xl font-mono">
              प्रश्न {sessionIndex + 1} / {totalTarget ? totalTarget : '∞'}
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
              className="bg-purple-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Main Full Screen Question Card */}
      <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Topic Tag & Level */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-purple-400 bg-purple-950/60 border border-purple-800/80 px-2.5 py-1 rounded-lg">
            व्याकरण नियम: {currentQ.grammarRuleTag}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            {currentQ.level}
          </span>
        </div>

        {/* Hindi Prompt Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-lg space-y-2">
          <span className="text-[11px] font-black uppercase text-purple-400 tracking-wider block">
            हिंदी वाक्य का सही अंग्रेजी अनुवाद चुनें:
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-relaxed">
            "{currentQ.hindiSentence}"
          </h2>
        </div>

        {/* 4 Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            let optStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-850 hover:border-slate-700';

            if (isAnswered) {
              if (idx === currentQ.correctIndex) {
                optStyle = 'bg-emerald-600 border-emerald-500 text-white font-black shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-400';
              } else if (idx === selectedOption && idx !== currentQ.correctIndex) {
                optStyle = 'bg-rose-600 border-rose-500 text-white font-bold shadow-lg shadow-rose-900/40';
              } else {
                optStyle = 'bg-slate-900/50 border-slate-850 text-slate-500 opacity-40';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered}
                type="button"
                className={`w-full py-4 px-5 rounded-2xl border text-sm sm:text-base font-bold text-left transition-all active:scale-98 cursor-pointer flex items-center justify-between ${optStyle}`}
              >
                <span>{opt}</span>
                {isAnswered && idx === currentQ.correctIndex && (
                  <Check className="w-5 h-5 text-white shrink-0 ml-3" />
                )}
                {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                  <X className="w-5 h-5 text-white shrink-0 ml-3" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Card & Next Button */}
        {isAnswered && (
          <div className="space-y-3.5 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-300 space-y-1.5 shadow-md">
              <span className="font-bold text-purple-300 block flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <span>व्याख्या एवं नियम:</span>
              </span>
              <p className="leading-relaxed font-medium text-slate-300">
                {currentQ.explanationHi}
              </p>
            </div>

            <button
              onClick={handleNext}
              type="button"
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <span>अगला प्रश्न (Next Question)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
