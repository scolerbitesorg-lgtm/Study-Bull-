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
  ArrowLeft,
  Settings2,
  FileText,
  Hash,
  Zap,
  Palette,
  Layers,
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type TypingMode = 'paragraph' | 'speed_drill' | 'number_drill' | 'custom' | 'infinite';
export type TypingTheme = 'slate' | 'cyberpunk' | 'sepia' | 'emerald' | 'midnight';

const EXTRA_SPEED_DRILLS: TypingPassage[] = [
  {
    id: 'drill_1',
    title: 'Top 50 Exam Frequent Words Drill',
    category: 'Speed Drill',
    language: 'en',
    content: 'the of and to a in is it you that he was for on are as with his they I at be this have from or one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part',
    wordCount: 50,
  },
  {
    id: 'drill_2',
    title: 'Data Entry Number & Symbol Precision Drill',
    category: 'Number & Symbol Drill',
    language: 'en',
    content: '2026-10-11 ID: #98421 Amount: $4,580.00 Code: 89012 (25% tax = $1,145.00) Phone: +91 98765-43210 Ref: #A-90812 Score: 98.5% Rate: 12.50 km/h Serial: 4509-1234-8901 Date: 15/08/1947 Time: 10:30 AM',
    wordCount: 32,
  },
  {
    id: 'drill_3',
    title: 'Hindi Typing Speed Drill (Devanagari)',
    category: 'Hindi Drill',
    language: 'hi',
    content: 'भारत एक महान और विशाल देश है। यहाँ विभिन्न संस्कृतियों और भाषाओं का संगम देखने को मिलता है। हमारी मेहनत और लगन से ही देश की प्रगति संभव है। शिक्षा और ज्ञान का हमारे जीवन में सर्वोच्च स्थान है। नियमित अभ्यास से सफलता अवश्य प्राप्त होती है।',
    wordCount: 45,
  },
  {
    id: 'drill_4',
    title: 'Legal & Constitutional Terms Speed Practice',
    category: 'Legal Practice',
    language: 'en',
    content: 'The Constitution of India guarantees fundamental rights to all citizens including freedom of speech equality before law and protection of life and personal liberty. Every officer shall uphold integrity honesty and public interest in discharge of official duties without bias or prejudice.',
    wordCount: 42,
  },
];

const dedupePassages = (list: TypingPassage[]): TypingPassage[] => {
  const seen = new Set<string>();
  const out: TypingPassage[] = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const id = item.id || `passage_${i}`;
    if (!seen.has(id)) {
      seen.add(id);
      out.push({ ...item, id });
    }
  }
  return out;
};

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
  const [passages, setPassages] = useState<TypingPassage[]>(() =>
    dedupePassages([...TYPING_PASSAGES, ...EXTRA_SPEED_DRILLS])
  );
  const [selectedPassage, setSelectedPassage] = useState<TypingPassage>(() => passages[0] || TYPING_PASSAGES[0]);

  // Subscribe to real-time Firestore updates for typing passages
  useEffect(() => {
    const unsub = FirestoreService.subscribeTypingPassages((list) => {
      if (list && list.length > 0) {
        const combined = dedupePassages([...list, ...EXTRA_SPEED_DRILLS]);
        setPassages(combined);
        setSelectedPassage((prev) => combined.find((p) => p.id === prev.id) || combined[0]);
      }
    });
    return () => unsub();
  }, []);
  const [durationMinutes, setDurationMinutes] = useState<number>(2); // 1, 2, 3, 5, 10, 15, infinite
  const [mode, setMode] = useState<TypingMode>('paragraph');
  const [theme, setTheme] = useState<TypingTheme>('slate');
  const [customText, setCustomText] = useState<string>('');

  // Live Test State
  const [isTestActive, setIsTestActive] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(120);
  const [startTime, setStartTime] = useState<number>(0);
  const [result, setResult] = useState<TypingResult | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync mobile hardware & gesture back button with typing states
  useEffect(() => {
    const syncFromNavigation = () => {
      const hash = window.location.hash || '';
      const state = window.history.state || {};
      if (hash.startsWith('#/typing') || state.section === 'typing') {
        if (!hash.includes('/test') && !hash.includes('/result')) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsTestActive(false);
          setResult(null);
        }
      }
    };

    window.addEventListener('popstate', syncFromNavigation);
    window.addEventListener('hashchange', syncFromNavigation);
    syncFromNavigation();

    return () => {
      window.removeEventListener('popstate', syncFromNavigation);
      window.removeEventListener('hashchange', syncFromNavigation);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isTestActive && durationMinutes > 0 && secondsRemaining > 0) {
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
  }, [isTestActive, secondsRemaining, durationMinutes]);

  const handleStartTest = (passage: TypingPassage) => {
    playTapSound(soundEnabled);
    let finalPassage = passage;
    if (mode === 'custom' && customText.trim().length > 10) {
      finalPassage = {
        id: 'custom_1',
        title: 'Custom User Passage',
        category: 'Custom',
        language: 'en',
        content: customText.trim(),
        wordCount: customText.trim().split(/\s+/).length,
      };
    }
    setSelectedPassage(finalPassage);
    setUserInput('');
    setSecondsRemaining(durationMinutes * 60);
    setStartTime(Date.now());
    setIsTestActive(true);
    setResult(null);
    window.history.pushState({ section: 'typing', typingScreen: 'test' }, '', '#/typing/test');

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleFinishTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTestActive(false);

    const timeSpentSeconds = durationMinutes > 0 ? Math.max(1, durationMinutes * 60 - secondsRemaining) : Math.max(1, Math.round((Date.now() - startTime) / 1000));
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

    const grossWpm = Math.round((userInput.length / 5) / minutesElapsed);
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
    window.history.pushState({ section: 'typing', typingScreen: 'result' }, '', '#/typing/result');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setUserInput(val);
    playTapSound(soundEnabled);

    if (val.length >= selectedPassage.content.length) {
      handleFinishTest();
    }
  };

  const formatTimer = (totalSecs: number) => {
    if (durationMinutes === 0) return '∞ Free Mode';
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const liveMinutes = durationMinutes > 0
    ? Math.max(0.1, (durationMinutes * 60 - secondsRemaining) / 60)
    : Math.max(0.1, (Date.now() - startTime) / 60000);

  const liveGrossWpm = userInput.length > 0 ? Math.round((userInput.length / 5) / liveMinutes) : 0;
  let liveCorrect = 0;
  for (let i = 0; i < userInput.length; i++) {
    if (userInput[i] === selectedPassage.content[i]) liveCorrect++;
  }
  const liveAccuracy = userInput.length > 0 ? Math.round((liveCorrect / userInput.length) * 100) : 100;

  // Theme styling
  const themeClasses = {
    slate: 'bg-white border-slate-200 text-slate-900',
    cyberpunk: 'bg-slate-950 border-cyan-500/50 text-cyan-300 font-mono shadow-cyan-900/20',
    sepia: 'bg-[#fbf0d9] border-[#e2d5b7] text-[#433422]',
    emerald: 'bg-emerald-950 border-emerald-600 text-emerald-100',
    midnight: 'bg-indigo-950 border-indigo-700 text-indigo-100',
  }[theme];

  // --- RESULT VIEW ---
  if (result) {
    return (
      <div className="max-w-md mx-auto px-4 py-4 pb-20 space-y-4 animate-in fade-in duration-200">
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

        <div className={`border rounded-2xl p-4 shadow-xs max-h-60 overflow-y-auto font-mono text-xs sm:text-sm leading-relaxed tracking-wide select-none ${themeClasses}`}>
          {targetText.split('').map((char, index) => {
            let charStyle = 'text-slate-500';
            const userChar = userInput[index];

            if (userChar !== undefined) {
              if (userChar === char) {
                charStyle = 'text-emerald-500 font-bold bg-emerald-500/20';
              } else {
                charStyle = 'text-rose-500 font-bold bg-rose-500/30';
              }
            } else if (index === userInput.length) {
              charStyle = 'bg-blue-500 text-white rounded-xs underline animate-pulse';
            }

            return (
              <span key={index} className={charStyle}>
                {char}
              </span>
            );
          })}
        </div>

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

  // --- PASSAGE SELECTION & CONFIGURATION VIEW (Step 1) ---
  const filteredPassages = passages.filter((p) => {
    if (mode === 'speed_drill') return p.category.toLowerCase().includes('drill') || p.category.toLowerCase().includes('speed');
    if (mode === 'number_drill') return p.category.toLowerCase().includes('number') || p.category.toLowerCase().includes('symbol');
    return true;
  });

  return (
    <div className="max-w-md mx-auto px-4 py-3 pb-20 space-y-4">
      {/* Title Header */}
      <div className="text-center">
        <h2 className="text-base font-bold text-slate-900 flex items-center justify-center gap-1.5">
          <Keyboard className="w-5 h-5 text-blue-600" />
          <span>{language === 'hi' ? 'टाइपिंग स्पीड एवं एक्यूरेसी लैब' : 'Typing Speed & Accuracy Lab'}</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {language === 'hi'
            ? 'SSC CGL, CHSL, Delhi Police HC स्पीड एवं एक्यूरेसी टेस्ट'
            : 'SSC DEST & Police HC standard speed & accuracy simulator'}
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs space-y-2">
        <span className="text-[11px] font-bold text-slate-600 block">
          {language === 'hi' ? 'टेस्ट मोड (Mode):' : 'Select Mode:'}
        </span>
        <div className="grid grid-cols-4 gap-1">
          {[
            { id: 'paragraph', labelHi: 'पैसेज', labelEn: 'Passage', icon: FileText },
            { id: 'speed_drill', labelHi: 'स्पीड ड्रिल', labelEn: 'Drills', icon: Zap },
            { id: 'number_drill', labelHi: 'संख्याएं', labelEn: 'Numbers', icon: Hash },
            { id: 'custom', labelHi: 'कस्टम', labelEn: 'Custom', icon: Edit3 },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => {
                  playTapSound(soundEnabled);
                  setMode(m.id as TypingMode);
                }}
                className={`py-1.5 px-1 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                  mode === m.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? m.labelHi : m.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Text Mode Option */}
      {mode === 'custom' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2 animate-in fade-in duration-150">
          <label className="text-xs font-bold text-slate-800 block">
            {language === 'hi' ? 'अपना खुद का टेक्स्ट पेस्ट करें:' : 'Paste your custom text:'}
          </label>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={3}
            placeholder={
              language === 'hi'
                ? 'यहाँ कोई भी पैराग्राफ या अभ्यास वाक्य पेस्ट करें...'
                : 'Paste any text or sentence here to test your typing speed...'
            }
            className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-600"
          />
          <button
            disabled={customText.trim().length < 5}
            onClick={() => handleStartTest(passages[0])}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            {language === 'hi' ? 'कस्टम टेक्स्ट टेस्ट शुरू करें' : 'Start Custom Test'}
          </button>
        </div>
      )}

      {/* Duration Selector Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs">
        <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
          {language === 'hi' ? 'समय अवधि चुनें (Duration):' : 'Select Duration:'}
        </span>
        <div className="grid grid-cols-5 gap-1">
          {[1, 2, 5, 10, 0].map((mins) => (
            <button
              key={mins}
              onClick={() => {
                playTapSound(soundEnabled);
                setDurationMinutes(mins);
              }}
              className={`py-1.5 rounded-xl font-bold text-[11px] transition-all active:scale-95 cursor-pointer ${
                durationMinutes === mins
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {mins === 0 ? '∞ Free' : `${mins} ${language === 'hi' ? 'मि' : 'm'}`}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
          <Palette className="w-3.5 h-3.5 text-blue-600" />
          <span>{language === 'hi' ? 'थीम:' : 'Canvas Theme:'}</span>
        </span>
        <div className="flex items-center gap-1.5">
          {[
            { id: 'slate', name: 'Classic', color: 'bg-slate-100' },
            { id: 'cyberpunk', name: 'Cyber', color: 'bg-slate-900 border-cyan-400' },
            { id: 'sepia', name: 'Sepia', color: 'bg-[#f4ecd8]' },
            { id: 'emerald', name: 'Matrix', color: 'bg-emerald-950' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id as TypingTheme)}
              title={t.name}
              className={`w-6 h-6 rounded-full border ${t.color} cursor-pointer transition-transform ${
                theme === t.id ? 'scale-125 ring-2 ring-blue-600' : 'opacity-80 hover:opacity-100'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Passages List */}
      {mode !== 'custom' && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-700 block px-1">
            {language === 'hi' ? 'अभ्यास टेस्ट चुनें:' : 'Select Practice Passage:'}
          </span>

          <div className="space-y-2.5">
            {filteredPassages.map((p, pIdx) => (
              <button
                key={`passage_${p.id || pIdx}_${pIdx}`}
                onClick={() => handleStartTest(p)}
                type="button"
                className="relative w-full p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 active:scale-95 active:bg-blue-50/60 active:border-blue-400 active:shadow-inner transition-all duration-150 cursor-pointer flex items-center justify-between text-left group select-none"
              >
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
      )}
    </div>
  );
};

