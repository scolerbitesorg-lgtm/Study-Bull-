import React, { useState, useEffect, useMemo } from 'react';
import { EnglishSentenceTypingItem, EnglishProficiencyLevel, Language, UserWrongAnswerItem } from '../../types';
import { playTapSound, playCorrectSound, playWrongSound } from '../../utils/audio';
import { StorageService } from '../../services/storageService';
import { 
  ArrowLeft, 
  Check, 
  X, 
  ArrowRight, 
  Trophy,
  RotateCcw,
  Keyboard,
  Lightbulb,
  Sparkles,
  BookOpen
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

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const EnglishSentenceTypingView: React.FC<EnglishSentenceTypingViewProps> = ({
  typingList,
  language,
  soundEnabled,
  onBack,
  onRecordWrong,
  onSuccess,
  onSilentReplenish,
}) => {
  // Topic / Test selection state
  const [isPracticeActive, setIsPracticeActive] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<EnglishProficiencyLevel | 'all'>('all');

  // Active session state
  const [sessionQueue, setSessionQueue] = useState<EnglishSentenceTypingItem[]>([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [userTyped, setUserTyped] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Filter pool based on topic
  const filteredPool = useMemo(() => {
    return typingList.filter(
      (item) => selectedTopic === 'all' || item.level === selectedTopic
    );
  }, [typingList, selectedTopic]);

  // Build/refresh session queue prioritizing unseen questions randomly
  const buildSessionQueue = (pool: EnglishSentenceTypingItem[]) => {
    const uniqueMap = new Map<string, EnglishSentenceTypingItem>();
    for (const item of pool) {
      const key = (item.targetEnglish || item.hindiSentence || item.id || '').trim().toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    }
    const cleanPool = Array.from(uniqueMap.values());

    const seenSet = StorageService.getSeenEnglishQuestions();
    const unseen: EnglishSentenceTypingItem[] = [];
    const seen: EnglishSentenceTypingItem[] = [];

    for (const item of cleanPool) {
      const key = (item.targetEnglish || item.hindiSentence || item.id || '').trim().toLowerCase();
      if (seenSet.has(key)) {
        seen.push(item);
      } else {
        unseen.push(item);
      }
    }

    const shuffledUnseen = shuffleArray(unseen);
    const shuffledSeen = shuffleArray(seen);
    return [...shuffledUnseen, ...shuffledSeen];
  };

  const currentItem: EnglishSentenceTypingItem | undefined =
    sessionQueue.length > 0
      ? sessionQueue[sessionIndex % sessionQueue.length]
      : filteredPool[0];

  // Mark current question as seen persistently so it doesn't repeat
  useEffect(() => {
    if (isPracticeActive && currentItem) {
      const key = currentItem.targetEnglish || currentItem.hindiSentence || currentItem.id;
      if (key) {
        StorageService.addSeenEnglishQuestion(key);
      }
    }
  }, [isPracticeActive, currentItem]);

  const cleanString = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/[.,!?'"]/g, '')
      .replace(/\s+/g, ' ');
  };

  const handleStartTest = (level: EnglishProficiencyLevel | 'all') => {
    playTapSound(soundEnabled);
    setSelectedTopic(level);

    const pool = typingList.filter((item) => level === 'all' || item.level === level);
    const poolToUse = pool.length > 0 ? pool : typingList;

    const queue = buildSessionQueue(poolToUse);
    setSessionQueue(queue);
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
    const matchesAccepted = (currentItem.acceptedVariations || []).some(
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
        question: `Typing: "${currentItem.hindiSentence}"`,
        correctAnswer: currentItem.targetEnglish,
        userAnswer: userTyped.trim(),
        explanationHi: currentItem.grammarTipHi,
        timestamp: new Date().toISOString(),
      });
    }

    if (onSilentReplenish) {
      onSilentReplenish();
    }
  };

  const handleNext = () => {
    playTapSound(soundEnabled);

    const nextIndex = sessionIndex + 1;
    if (nextIndex >= sessionQueue.length) {
      setIsCompleted(true);
      return;
    }

    setSessionIndex(nextIndex);
    setUserTyped('');
    setIsAnswered(false);
    setIsCorrect(false);
  };

  // 1. TOPIC / TEST SELECTION SCREEN (WHEN PRACTICE NOT ACTIVE)
  if (!isPracticeActive) {
    const allCount = typingList.length;
    const beginnerCount = typingList.filter((t) => t.level === 'beginner').length;
    const intermediateCount = typingList.filter((t) => t.level === 'intermediate').length;
    const advancedCount = typingList.filter((t) => t.level === 'advanced').length;

    const topicsList = [
      {
        id: 'all' as const,
        titleHi: 'सभी टाइपिंग वाक्यों का संपूर्ण टेस्ट (All Typing Sentences)',
        desc: 'फ़ायरबेस में मौजूद सभी अंग्रेजी वाक्यों को लिखकर अभ्यास करने का टेस्ट',
        count: allCount,
        badge: 'संपूर्ण टेस्ट 🎯',
        bg: 'from-blue-600 to-cyan-700',
        borderColor: 'border-blue-200 hover:border-blue-500',
      },
      {
        id: 'beginner' as const,
        titleHi: 'बेसिक वाक्य (Basic Daily Sentences)',
        desc: 'दैनिक बातचीत के सरल और छोटे अंग्रेजी वाक्य',
        count: beginnerCount || allCount,
        badge: 'Level 1 🥉',
        bg: 'from-emerald-600 to-teal-700',
        borderColor: 'border-emerald-200 hover:border-emerald-500',
      },
      {
        id: 'intermediate' as const,
        titleHi: 'मध्यम स्तर (Intermediate Office & Travel Phrases)',
        desc: 'कार्यालय, व्यापार और यात्रा से जुड़े वाक्यों का टाइपिंग अभ्यास',
        count: intermediateCount || allCount,
        badge: 'Level 2 🥈',
        bg: 'from-purple-600 to-indigo-700',
        borderColor: 'border-purple-200 hover:border-purple-500',
      },
      {
        id: 'advanced' as const,
        titleHi: 'उच्च स्तर (Advanced Complex & Idiomatic Sentences)',
        desc: 'मुहावरेदार और परीक्षा विशेष जटिल संरचना वाले वाक्य',
        count: advancedCount || allCount,
        badge: 'Level 3 🥇',
        bg: 'from-rose-600 to-pink-700',
        borderColor: 'border-rose-200 hover:border-rose-500',
      },
    ];

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
          <span className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
            ⌨️ कुल {allCount} वाक्य उपलब्ध
          </span>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 rounded-3xl shadow-md space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                टाइपिंग प्रैक्टिस टॉपिक एवं टेस्ट (Sentence Typing Topics)
              </h2>
              <p className="text-[11px] text-blue-200 font-medium">
                टॉपिक चुनें और उस टेस्ट के सभी अंग्रेजी वाक्य लिखकर अभ्यास करें
              </p>
            </div>
          </div>
        </div>

        {/* Topic Cards List */}
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
                    {top.count} वाक्य शामिल
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-700 transition-colors">
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

  // 2. COMPLETION SCREEN
  if (isCompleted) {
    const totalDone = sessionCorrect + sessionWrong;
    const accuracy = totalDone > 0 ? Math.round((sessionCorrect / totalDone) * 100) : 0;

    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6">
          <div className="w-20 h-20 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              टाइपिंग टेस्ट पूरा हुआ!
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              आपने इस टेस्ट के सभी {totalDone} वाक्यों का सफलता से टाइपिंग अभ्यास कर लिया है।
            </p>
          </div>

          {/* Results Score Box */}
          <div className="grid grid-cols-3 gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">कुल वाक्य</span>
              <span className="text-xl font-black text-white">{totalDone}</span>
            </div>
            <div>
              <span className="text-[11px] text-emerald-400 block font-medium">सही उत्तर</span>
              <span className="text-xl font-black text-emerald-400">{sessionCorrect}</span>
            </div>
            <div>
              <span className="text-[11px] text-blue-400 block font-medium">सटीकता</span>
              <span className="text-xl font-black text-blue-400">{accuracy}%</span>
            </div>
          </div>

          {sessionWrong > 0 && (
            <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-900/50 p-2.5 rounded-xl font-medium">
              💡 {sessionWrong} गलत वाक्य Revision Centre में जोड़ दिए गए हैं।
            </p>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={() => {
                playTapSound(soundEnabled);
                handleStartTest(selectedTopic);
              }}
              type="button"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>इसी टाइपिंग टेस्ट का पुनः अभ्यास करें</span>
            </button>
            <button
              onClick={() => {
                playTapSound(soundEnabled);
                setIsPracticeActive(false);
              }}
              type="button"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl font-bold text-xs transition-all cursor-pointer"
            >
              <span>दूसरा टेस्ट टॉपिक चुनें (Select Topic)</span>
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
          onClick={() => {
            playTapSound(soundEnabled);
            setIsPracticeActive(false);
          }}
          className="mt-4 px-4 py-2 bg-blue-600 rounded-xl text-xs font-bold"
        >
          टॉपिक सूची पर जाएं
        </button>
      </div>
    );
  }

  const totalSentencesInSession = sessionQueue.length;
  const currentNum = sessionIndex + 1;
  const setProgressPercent = Math.min(100, Math.round((currentNum / (totalSentencesInSession || 1)) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-y-auto animate-in fade-in duration-200">
      {/* Top Header Bar */}
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
            <ArrowLeft className="w-4 h-4" />
            <span>बाहर निकलें</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-blue-300 bg-blue-950/80 border border-blue-800 px-2.5 py-1 rounded-xl font-mono">
              वाक्य {currentNum} / {totalSentencesInSession}
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
            className="bg-blue-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${setProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Practice Area */}
      <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Prompt Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-lg space-y-2">
          <span className="text-[11px] font-black uppercase text-blue-400 tracking-wider block">
            हिंदी अर्थ देखकर सटीक अँग्रेजी वाक्य टाइप करें:
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-relaxed">
            "{currentItem.hindiSentence}"
          </h2>
        </div>

        {/* Input Form */}
        <form onSubmit={handleCheck} className="space-y-3">
          <div className="relative">
            <textarea
              rows={2}
              value={userTyped}
              onChange={(e) => setUserTyped(e.target.value)}
              disabled={isAnswered}
              placeholder="अँग्रेजी अनुवाद टाइप करें..."
              autoFocus
              className={`w-full py-3.5 px-4 rounded-2xl bg-slate-900 border-2 text-sm sm:text-base font-bold text-white placeholder-slate-500 focus:outline-none transition-all resize-none ${
                isAnswered
                  ? isCorrect
                    ? 'border-emerald-500 bg-emerald-950/30'
                    : 'border-rose-500 bg-rose-950/30'
                  : 'border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
            />
          </div>

          {!isAnswered && (
            <button
              type="submit"
              disabled={!userTyped.trim()}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>वाक्य सबमिट करें</span>
              <Check className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Answer Feedback & Next Button */}
        {isAnswered && (
          <div className="space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className={`p-4 rounded-2xl border ${
              isCorrect 
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200' 
                : 'bg-rose-950/60 border-rose-800 text-rose-200'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {isCorrect ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <X className="w-5 h-5 text-rose-400" />
                )}
                <span className="font-bold text-sm">
                  {isCorrect ? 'बिल्कुल सही अँग्रेजी अनुवाद!' : 'अनुवाद में त्रुटि!'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                <span className="font-bold text-white">सटीक उत्तर:</span> "{currentItem.targetEnglish}"
              </p>
              {currentItem.grammarTipHi && (
                <p className="text-[11px] text-blue-300 mt-2 bg-blue-950/40 p-2 rounded-lg border border-blue-900/50">
                  💡 <span className="font-bold">ग्रामर टिप:</span> {currentItem.grammarTipHi}
                </p>
              )}
            </div>

            <button
              onClick={handleNext}
              type="button"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <span>अगला वाक्य (Next Sentence)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
