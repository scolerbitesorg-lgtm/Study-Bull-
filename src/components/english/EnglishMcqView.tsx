import React, { useState, useEffect } from 'react';
import { EnglishMcqItem, EnglishProficiencyLevel, Language, UserWrongAnswerItem } from '../../types';
import { playTapSound, playCorrectSound, playWrongSound } from '../../utils/audio';
import { StorageService } from '../../services/storageService';
import { 
  ArrowLeft, 
  Check, 
  X, 
  ArrowRight, 
  Trophy,
  RotateCcw,
  Sparkles,
  HelpCircle,
  BookOpen,
  Layers,
  Award
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

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const EnglishMcqView: React.FC<EnglishMcqViewProps> = ({
  mcqList,
  language,
  soundEnabled,
  onBack,
  onRecordWrong,
  onSuccess,
  onSilentReplenish,
}) => {
  // Setup topic / test selection state
  const [selectedTopic, setSelectedTopic] = useState<EnglishProficiencyLevel | 'all'>('all');
  const [isPracticeActive, setIsPracticeActive] = useState(false);

  // Active session state
  const [sessionQueue, setSessionQueue] = useState<EnglishMcqItem[]>([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Build session queue strictly containing filtered items (unseen first, then seen)
  const buildSessionQueue = (pool: EnglishMcqItem[]) => {
    // Deduplicate by question text
    const uniqueMap = new Map<string, EnglishMcqItem>();
    for (const item of pool) {
      const key = (item.hindiSentence || item.id || '').trim().toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    }
    const cleanPool = Array.from(uniqueMap.values());

    const seenSet = StorageService.getSeenEnglishQuestions();
    const unseen: EnglishMcqItem[] = [];
    const seen: EnglishMcqItem[] = [];

    for (const q of cleanPool) {
      const key = (q.hindiSentence || q.id || '').trim().toLowerCase();
      if (seenSet.has(key)) {
        seen.push(q);
      } else {
        unseen.push(q);
      }
    }

    const shuffledUnseen = shuffleArray(unseen);
    const shuffledSeen = shuffleArray(seen);
    // Include ALL questions in that topic/test (no cutoff!)
    return [...shuffledUnseen, ...shuffledSeen];
  };

  const handleStartTest = (level: EnglishProficiencyLevel | 'all') => {
    playTapSound(soundEnabled);
    setSelectedTopic(level);

    const filteredPool = mcqList.filter(
      (q) => level === 'all' || q.level === level
    );
    const poolToUse = filteredPool.length > 0 ? filteredPool : mcqList;

    const queue = buildSessionQueue(poolToUse);
    setSessionQueue(queue);
    setSessionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setSessionCorrect(0);
    setSessionWrong(0);
    setIsCompleted(false);
    setIsPracticeActive(true);
  };

  const currentQ: EnglishMcqItem | undefined =
    sessionQueue.length > sessionIndex
      ? sessionQueue[sessionIndex]
      : sessionQueue[0];

  // Mark current question as seen persistently so it doesn't repeat across sessions
  useEffect(() => {
    if (isPracticeActive && currentQ) {
      const key = currentQ.hindiSentence || currentQ.id;
      if (key) {
        StorageService.addSeenEnglishQuestion(key);
      }
    }
  }, [isPracticeActive, currentQ]);

  const handleRestartFresh = () => {
    playTapSound(soundEnabled);
    const filteredPool = mcqList.filter(
      (q) => selectedTopic === 'all' || q.level === selectedTopic
    );
    const poolToUse = filteredPool.length > 0 ? filteredPool : mcqList;
    const queue = buildSessionQueue(poolToUse);

    setSessionQueue(queue);
    setSessionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setSessionCorrect(0);
    setSessionWrong(0);
    setIsCompleted(false);
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
        correctAnswer: (currentQ.options && currentQ.options[currentQ.correctIndex]) || '',
        userAnswer: (currentQ.options && currentQ.options[idx]) || '',
        explanationHi: currentQ.explanationHi,
        timestamp: new Date().toISOString(),
      });
    }

    if (onSilentReplenish) {
      onSilentReplenish();
    }
  };

  const handleNext = () => {
    playTapSound(soundEnabled);

    const nextIdx = sessionIndex + 1;
    if (nextIdx >= sessionQueue.length) {
      setIsCompleted(true);
      return;
    }

    setSessionIndex(nextIdx);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  // 1. TOPIC / TEST SELECTION SCREEN (WHEN PRACTICE NOT ACTIVE)
  if (!isPracticeActive) {
    const allCount = mcqList.length;
    const beginnerCount = mcqList.filter((m) => m.level === 'beginner').length;
    const intermediateCount = mcqList.filter((m) => m.level === 'intermediate').length;
    const advancedCount = mcqList.filter((m) => m.level === 'advanced').length;

    const topicsList = [
      {
        id: 'all' as const,
        titleHi: 'सभी MCQ टेस्ट (All MCQs Test)',
        titleEn: 'All Questions Test',
        desc: 'फ़ायरबेस में मौजूद सभी बहुविकल्पीय प्रश्नों का संपूर्ण अभ्यास टेस्ट',
        count: allCount,
        badge: 'संपूर्ण टेस्ट 🎯',
        bg: 'from-blue-600 to-indigo-700',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-200 hover:border-blue-500',
      },
      {
        id: 'beginner' as const,
        titleHi: 'बेसिक व्याकरण (Basic Tenses & Rules)',
        titleEn: 'Beginner Test',
        desc: 'सरल काल, नियम और रोज़मर्रा के वाक्य अनुवाद',
        count: beginnerCount || allCount,
        badge: 'Level 1 🥉',
        bg: 'from-emerald-600 to-teal-700',
        textColor: 'text-emerald-600',
        borderColor: 'border-emerald-200 hover:border-emerald-500',
      },
      {
        id: 'intermediate' as const,
        titleHi: 'मध्यम स्तर (Intermediate Correction)',
        titleEn: 'Intermediate Test',
        desc: 'प्रीपोजिशन, कंबाइंड क्लॉज़ और मध्यम वाक्य अभ्यास',
        count: intermediateCount || allCount,
        badge: 'Level 2 🥈',
        bg: 'from-purple-600 to-violet-700',
        textColor: 'text-purple-600',
        borderColor: 'border-purple-200 hover:border-purple-500',
      },
      {
        id: 'advanced' as const,
        titleHi: 'उच्च स्तर (Advanced Exam Rules)',
        titleEn: 'Advanced Test',
        desc: 'इनवर्जन, कंडीशनल क्लॉज़ और परीक्षा स्पेशल ट्रैप रूल्स',
        count: advancedCount || allCount,
        badge: 'Level 3 🥇',
        bg: 'from-amber-600 to-orange-700',
        textColor: 'text-amber-600',
        borderColor: 'border-amber-200 hover:border-amber-500',
      },
    ];

    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              onBack();
            }}
            type="button"
            className="flex items-center gap-1.5 py-1 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'वापस' : 'Back'}</span>
          </button>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-100 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>कुल {allCount} MCQ प्रश्न</span>
          </span>
        </div>

        {/* Title Banner */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-4 rounded-3xl shadow-md space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                MCQ प्रैक्टिस टॉपिक एवं टेस्ट (Select Test Topic)
              </h2>
              <p className="text-[11px] text-purple-200 font-medium">
                विषय चुनें और उस टेस्ट के सभी प्रश्न एक साथ हल करें
              </p>
            </div>
          </div>
        </div>

        {/* Topic / Test Cards List */}
        <div className="space-y-3">
          {topicsList.map((top) => (
            <div
              key={top.id}
              onClick={() => handleStartTest(top.id)}
              className={`bg-white p-4 rounded-3xl border-2 ${top.borderColor} shadow-xs hover:shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-between gap-3 group`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md text-white bg-gradient-to-r ${top.bg}`}>
                    {top.badge}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {top.count} {language === 'hi' ? 'प्रश्न उपलब्ध' : 'Questions'}
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                  {top.titleHi}
                </h3>
                <p className="text-xs text-slate-500 leading-snug">
                  {top.desc}
                </p>
              </div>

              <button
                type="button"
                className={`py-2 px-3.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r ${top.bg} shadow-xs group-hover:scale-105 transition-transform shrink-0 flex items-center gap-1 cursor-pointer`}
              >
                <span>स्टार्ट</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. COMPLETION SCREEN AFTER FINISHING ALL QUESTIONS IN TEST
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
              टेस्ट अभ्यास पूरा हुआ!
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              आपने इस टेस्ट के सभी {totalDone} प्रश्न सफलतापूर्वक हल कर लिए हैं।
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
              onClick={handleRestartFresh}
              type="button"
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>इसी टेस्ट का पुनः अभ्यास करें (Restart Test)</span>
            </button>
            <button
              onClick={() => {
                playTapSound(soundEnabled);
                setIsPracticeActive(false);
              }}
              type="button"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl font-bold text-xs transition-all cursor-pointer"
            >
              <span>दूसरा टॉपिक या टेस्ट चुनें (Choose Another Topic)</span>
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
          onClick={() => {
            playTapSound(soundEnabled);
            setIsPracticeActive(false);
          }}
          className="mt-4 px-4 py-2 bg-purple-600 rounded-xl text-xs font-bold"
        >
          टॉपिक सूची पर जाएं
        </button>
      </div>
    );
  }

  const totalQuestions = sessionQueue.length;
  const currentNum = sessionIndex + 1;
  const setProgressPercent = Math.min(100, Math.round((currentNum / (totalQuestions || 1)) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-y-auto animate-in fade-in duration-200">
      {/* Top Full Screen Header Bar */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              setIsPracticeActive(false);
            }}
            type="button"
            className="flex items-center gap-1.5 py-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>बाहर निकलें</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-purple-300 bg-purple-950/80 border border-purple-800 px-2.5 py-1 rounded-xl font-mono">
              प्रश्न {currentNum} / {totalQuestions}
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
        <div className="w-full bg-slate-800 h-1.5 mt-2 rounded-full overflow-hidden max-w-2xl mx-auto">
          <div
            className="bg-purple-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${setProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Full Screen Question Card */}
      <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Topic Tag & Level */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-purple-400 bg-purple-950/60 border border-purple-800/80 px-2.5 py-1 rounded-lg">
            व्याकरण नियम: {currentQ.grammarRuleTag || 'English Grammar'}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            {currentQ.level || 'Standard'}
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
