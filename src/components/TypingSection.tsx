import React, { useState, useEffect, useRef } from 'react';
import { TypingPassage, TypingResult, Language } from '../types';
import { TYPING_PASSAGES } from '../data/mockData';
import { FirestoreService } from '../firebase/firestoreService';
import { playTapSound } from '../utils/audio';
import { 
  Keyboard, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Flame, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TypingSectionProps {
  language: Language;
  soundEnabled: boolean;
  onNavigateHome: () => void;
}

export const TypingSection: React.FC<TypingSectionProps> = ({
  language,
  soundEnabled,
  onNavigateHome,
}) => {
  const [passages, setPassages] = useState<TypingPassage[]>(TYPING_PASSAGES);
  const [selectedPassage, setSelectedPassage] = useState<TypingPassage>(TYPING_PASSAGES[0]);
  const [durationMinutes, setDurationMinutes] = useState<number>(2); // 1, 2, 5, 10, 15

  // Live Test State
  const [isTestActive, setIsTestActive] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(120);
  const [startTime, setStartTime] = useState<number>(0);
  const [result, setResult] = useState<TypingResult | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Subscribe to real-time typing passages from Firestore
  useEffect(() => {
    const unsub = FirestoreService.subscribeTypingPassages((data) => {
      if (data && data.length > 0) {
        setPassages(data);
      }
    });
    return () => unsub();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isTestActive && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleFinishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTestActive, secondsRemaining]);

  const handleStartTest = (passage: TypingPassage) => {
    playTapSound(soundEnabled);
    setSelectedPassage(passage);
    setUserInput('');
    setSecondsRemaining(durationMinutes * 60);
    setStartTime(Date.now());
    setIsTestActive(true);
    setResult(null);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleFinishTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTestActive(false);

    const timeSpentSeconds = Math.max(1, durationMinutes * 60 - secondsRemaining);
    const minutesElapsed = Math.max(0.1, timeSpentSeconds / 60);

    const targetText = selectedPassage.content;
    let correctChars = 0;
    let mistakes = 0;

    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === targetText[i]) {
        correctChars++;
      } else {
        mistakes++;
      }
    }

    // Standard Gross WPM: (Total typed chars / 5) / minutes
    const grossWpm = Math.round((userInput.length / 5) / minutesElapsed);
    // Net WPM: (Correct chars / 5) / minutes or Gross WPM - (mistakes / minutes)
    const netWpm = Math.max(0, Math.round((correctChars / 5) / minutesElapsed));
    const accuracy = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 0;
    const passedSscCriteria = netWpm >= 35 && accuracy >= 95;

    if (passedSscCriteria) {
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    }

    setResult({
      grossWpm,
      netWpm,
      accuracy,
      totalKeystrokes: userInput.length,
      correctKeystrokes: correctChars,
      mistakes,
      timeSpentSeconds,
      passedSscCriteria,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setUserInput(val);
    playTapSound(soundEnabled);

    // If completed whole passage
    if (val.length >= selectedPassage.content.length) {
      handleFinishTest();
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Live real-time stats while typing
  const liveMinutes = Math.max(0.1, (durationMinutes * 60 - secondsRemaining) / 60);
  const liveGrossWpm = userInput.length > 0 ? Math.round((userInput.length / 5) / liveMinutes) : 0;
  let liveCorrect = 0;
  for (let i = 0; i < userInput.length; i++) {
    if (userInput[i] === selectedPassage.content[i]) liveCorrect++;
  }
  const liveAccuracy = userInput.length > 0 ? Math.round((liveCorrect / userInput.length) * 100) : 100;

  // --- RESULT VIEW ---
  if (result) {
    return (
      <div className="max-w-md mx-auto px-4 py-4 pb-20 space-y-4 animate-in fade-in duration-200">
        {/* Certificate Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl shadow-md">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-black uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
              SSC CGL / CHSL DEST Evaluation
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-2">
              {language === 'hi' ? 'टाइपिंग स्पीड टेस्ट स्कोरकार्ड' : 'Typing Speed Evaluation'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {selectedPassage.title}
            </p>
          </div>

          {/* Primary Score Ring */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="block text-3xl font-black text-blue-600 font-mono">
                {result.netWpm}
              </span>
              <span className="text-xs text-slate-600 font-bold">
                {language === 'hi' ? 'शुद्ध गति (Net WPM)' : 'Net Speed (WPM)'}
              </span>
            </div>
            <div>
              <span className="block text-3xl font-black text-emerald-600 font-mono">
                {result.accuracy}%
              </span>
              <span className="text-xs text-slate-600 font-bold">
                {language === 'hi' ? 'सटीकता (Accuracy)' : 'Accuracy'}
              </span>
            </div>
          </div>

          {/* Qualification Badge */}
          <div>
            {result.passedSscCriteria ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 text-emerald-900 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {language === 'hi'
                    ? 'उत्तीर्ण (SSC 35 WPM / 95% क्राइटेरिया पास)!'
                    : 'QUALIFIED (Met SSC 35 WPM / 95% Criteria)!'}
                </span>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-amber-900 text-xs font-bold flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>
                  {language === 'hi'
                    ? 'लक्ष्य: 35 WPM एवं 95% सटीकता'
                    : 'Target: 35 WPM with 95% Accuracy'}
                </span>
              </div>
            )}
          </div>

          {/* Key Metrics Breakdown */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-100 rounded-xl">
              <span className="block font-bold text-slate-800 font-mono">{result.grossWpm}</span>
              <span className="text-[10px] text-slate-500">{language === 'hi' ? 'सकल WPM' : 'Gross WPM'}</span>
            </div>
            <div className="p-2 bg-slate-100 rounded-xl">
              <span className="block font-bold text-rose-600 font-mono">{result.mistakes}</span>
              <span className="text-[10px] text-slate-500">{language === 'hi' ? 'गलतियां' : 'Errors'}</span>
            </div>
            <div className="p-2 bg-slate-100 rounded-xl">
              <span className="block font-bold text-slate-800 font-mono">{result.totalKeystrokes}</span>
              <span className="text-[10px] text-slate-500">{language === 'hi' ? 'कुंजी आघात' : 'Keystrokes'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleStartTest(selectedPassage)}
              className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'दोबारा करें' : 'Try Again'}</span>
            </button>
            <button
              onClick={() => {
                setResult(null);
                setIsTestActive(false);
              }}
              className="py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs active:scale-95 transition-all cursor-pointer"
            >
              <span>{language === 'hi' ? 'अन्य पैसेज' : 'Other Passages'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- LIVE TEST RUNNER VIEW ---
  if (isTestActive) {
    const targetText = selectedPassage.content;

    return (
      <div className="max-w-md mx-auto px-4 py-3 pb-24 space-y-3 animate-in fade-in duration-150">
        {/* Live HUD Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-sm font-bold text-emerald-400">
              {formatTimer(secondsRemaining)}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block leading-none">WPM</span>
              <span className="font-bold text-white text-sm">{liveGrossWpm}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block leading-none">ACC</span>
              <span className="font-bold text-white text-sm">{liveAccuracy}%</span>
            </div>
          </div>

          <button
            onClick={handleFinishTest}
            className="py-1 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold active:scale-95 cursor-pointer"
          >
            {language === 'hi' ? 'समाप्त' : 'Finish'}
          </button>
        </div>

        {/* Text Display Canvas with Real-Time Character Highlighting */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs max-h-56 overflow-y-auto font-mono text-xs sm:text-sm leading-relaxed tracking-wide select-none">
          {targetText.split('').map((char, index) => {
            let charStyle = 'text-slate-500';
            const userChar = userInput[index];

            if (userChar !== undefined) {
              if (userChar === char) {
                // Correct
                charStyle = 'text-emerald-700 font-bold bg-emerald-50';
              } else {
                // Mistake
                charStyle = 'text-rose-700 font-bold bg-rose-200';
              }
            } else if (index === userInput.length) {
              // Current cursor
              charStyle = 'bg-blue-500 text-white rounded-xs underline animate-pulse';
            }

            return (
              <span key={index} className={charStyle}>
                {char}
              </span>
            );
          })}
        </div>

        {/* Live Typing Input Area */}
        <div className="relative">
          <textarea
            ref={inputRef}
            value={userInput}
            onChange={handleInputChange}
            placeholder={
              language === 'hi'
                ? 'यहाँ टाइप करना शुरू करें (टाइमर चालू है)...'
                : 'Start typing here (timer running)...'
            }
            rows={4}
            className="w-full p-3.5 bg-white border-2 border-blue-600 rounded-2xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none shadow-md resize-none"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>

        <p className="text-[11px] text-slate-500 text-center font-medium">
          {language === 'hi'
            ? 'बैकस्पेस की अनुमति है। पूरा पैसेज टाइप करने पर परिणाम स्वतः आएगा।'
            : 'Backspace is allowed. Auto-submits on completion.'}
        </p>
      </div>
    );
  }

  // --- PASSAGE SELECTION VIEW (Step 1) ---
  return (
    <div className="max-w-md mx-auto px-4 py-3 pb-20 space-y-4">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-base font-bold text-slate-900 flex items-center justify-center gap-1.5">
          <span>⌨️</span>
          <span>{language === 'hi' ? 'टाइपिंग स्पीड टेस्ट' : 'Typing Speed Test'}</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {language === 'hi'
            ? 'SSC CGL, CHSL, Delhi Police HC स्पीड एवं एक्यूरेसी टेस्ट'
            : 'SSC DEST & Police HC standard speed & accuracy simulator'}
        </p>
      </div>

      {/* Duration Selector Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs">
        <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
          {language === 'hi' ? 'समय अवधि चुनें (Time Duration):' : 'Select Duration:'}
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 5, 10].map((mins) => (
            <button
              key={mins}
              onClick={() => {
                playTapSound(soundEnabled);
                setDurationMinutes(mins);
              }}
              className={`py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer ${
                durationMinutes === mins
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {mins} {language === 'hi' ? 'मिनट' : 'Min'}
            </button>
          ))}
        </div>
      </div>

      {/* Passages List (2-column screenshot style with green dot and tap animation) */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-slate-700 block px-1">
          {language === 'hi' ? 'अभ्यास पैसेज चुनें:' : 'Select Practice Passage:'}
        </span>

        <div className="space-y-2.5">
          {passages.map((p) => (
            <button
              key={p.id}
              onClick={() => handleStartTest(p)}
              type="button"
              className="relative w-full p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 active:scale-95 active:bg-blue-50/60 active:border-blue-400 active:shadow-inner transition-all duration-150 cursor-pointer flex items-center justify-between text-left group select-none"
            >
              {/* Top right active indicator */}
              <div className="absolute top-3.5 right-3.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 group-hover:scale-110 transition-transform block" />
              </div>

              <div className="flex items-center gap-3 pr-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 block leading-tight">
                    {p.title}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                    {p.wordCount} {language === 'hi' ? 'शब्द' : 'Words'} · {p.category}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
