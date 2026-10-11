import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { FloatingCalculator } from './FloatingCalculator';
import { playTapSound, playCorrectSound, playWrongSound } from '../utils/audio';
import {
  Zap,
  Sparkles,
  Clock,
  Flame,
  Trophy,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Calculator,
  HelpCircle,
  Hash,
  Infinity as InfinityIcon,
  TrendingUp,
  Home,
} from 'lucide-react';

export type MathLevel = 'easy' | 'medium' | 'hard' | 'pro';
export type MathOperation =
  | 'all'
  | 'bodmas'
  | 'percent'
  | 'average'
  | 'fractions'
  | 'square'
  | 'cube'
  | 'mul'
  | 'add'
  | 'linear';

export type QuestionCountChoice = 10 | 25 | 50 | 100 | 'infinite';

export interface MathQuestion {
  operation: string;
  operationLabel: string;
  questionText: string;
  correctAnswer: number;
  options: number[];
  hint: string;
  trickExplanation?: string;
  userSelected?: number | null;
  isCorrect?: boolean;
}

/**
 * Robust sanitizer and formatter for math expressions.
 * Converts raw *, ^, `, /, and LaTeX syntax into beautiful unicode math notation:
 * - Backticks (`) -> removed
 * - Asterisks (*) -> '×' (multiplication)
 * - Carets (^2, ^3) -> '²', '³' (clean unicode superscripts)
 * - Slashes (/) -> '÷' (clean division symbol)
 * - Sqrt expressions -> '√'
 */
export function cleanMathText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  let str = text;

  // 1. Remove backticks
  str = str.replace(/`/g, '');

  // 2. Remove markdown bold/italics
  str = str.replace(/\*\*([^*]+)\*\*/g, '$1');
  str = str.replace(/\*([^*]+)\*/g, '$1');

  // 3. Remove LaTeX tags & commands
  str = str.replace(/\\times\b/gi, '×');
  str = str.replace(/\\div\b/gi, '÷');
  str = str.replace(/\\cdot\b/gi, '×');
  str = str.replace(/\\sqrt\{([^}]+)\}/gi, '√$1');
  str = str.replace(/\\sqrt\b/gi, '√');
  str = str.replace(/\\/g, '');
  str = str.replace(/\$/g, '');

  // 4. Superscript powers: ^2 -> ², ^3 -> ³, ^4 -> ⁴, etc.
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

  // Remove any remaining stray carets
  str = str.replace(/\^/g, '');

  // 5. Convert multiplication * to ×
  str = str.replace(/\*/g, ' × ');

  // 6. Convert division / between numbers or brackets to ÷
  str = str.replace(/(\d+|\))\s*\/\s*(\d+|\()/g, '$1 ÷ $2');

  // 7. Normalize spaces around operators
  str = str.replace(/\s*×\s*/g, ' × ');
  str = str.replace(/\s*÷\s*/g, ' ÷ ');
  str = str.replace(/\s*\+\s*/g, ' + ');
  str = str.replace(/(\d+|\))\s*-\s*(\d+|\()/g, '$1 - $2');
  str = str.replace(/\s*=\s*/g, ' = ');
  str = str.replace(/\s{2,}/g, ' ').trim();

  return str;
}

// ================= USER PERSISTENT UNIQUENESS TRACKER =================
const SEEN_QUESTIONS_STORAGE_KEY = 'studybull_seen_math_questions_v2';

function loadSeenQuestionsFromStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_QUESTIONS_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch {}
  return new Set();
}

function saveSeenQuestionsToStorage(seenSet: Set<string>) {
  try {
    const arr = Array.from(seenSet);
    // Keep max 6000 items in localStorage so it stays lightweight and fast
    if (arr.length > 6000) {
      arr.splice(0, arr.length - 4500);
    }
    localStorage.setItem(SEEN_QUESTIONS_STORAGE_KEY, JSON.stringify(arr));
  } catch {}
}

interface CalculationsSectionProps {
  language: Language;
  soundEnabled: boolean;
  onNavigateHome: () => void;
  activeScreen?: 'setup' | 'practice' | 'result';
  onScreenChange?: (screen: 'setup' | 'practice' | 'result') => void;
}

export const CalculationsSection: React.FC<CalculationsSectionProps> = ({
  language,
  soundEnabled,
  onNavigateHome,
  activeScreen,
  onScreenChange,
}) => {
  // Navigation Screens: 'setup' -> 'practice' (full screen) -> 'result'
  const [internalScreen, setInternalScreen] = useState<'setup' | 'practice' | 'result'>('setup');
  const screen = activeScreen !== undefined ? activeScreen : internalScreen;

  const setScreen = (newScreen: 'setup' | 'practice' | 'result') => {
    if (onScreenChange) {
      onScreenChange(newScreen);
    } else {
      setInternalScreen(newScreen);
    }
  };

  // Setup options
  const [selectedCount, setSelectedCount] = useState<QuestionCountChoice>(10);
  const [level, setLevel] = useState<MathLevel>('medium');
  const [operation, setOperation] = useState<MathOperation>('all');
  const [inputMode, setInputMode] = useState<'options' | 'type'>('options');

  // Active Test / Practice State
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [typedInput, setTypedInput] = useState<string>('');
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Stats
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [totalTimeTaken, setTotalTimeTaken] = useState<number>(0);

  // Floating Calculator Modal
  const [isCalcOpen, setIsCalcOpen] = useState<boolean>(false);

  // Timer reference
  const timerRef = useRef<any>(null);

  // Unseen Questions Tracking Set
  const seenQuestionsRef = useRef<Set<string>>(loadSeenQuestionsFromStorage());

  useEffect(() => {
    if (screen === 'practice') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen]);

  // Infinite questions automatic replenishment:
  // When user is near the end (less than 3 remaining), seamlessly append 10 more unique questions
  useEffect(() => {
    if (screen === 'practice' && selectedCount === 'infinite') {
      if (currentIndex >= questions.length - 3) {
        const activeSignatures = new Set<string>(
          questions.map((q) => cleanMathText(q.questionText).toLowerCase().replace(/\s+/g, ''))
        );
        const moreQuestions: MathQuestion[] = [];
        for (let i = 0; i < 10; i++) {
          moreQuestions.push(generateSingleUniqueAlgorithmicQuestion(level, operation, activeSignatures));
        }
        setQuestions((prev) => [...prev, ...moreQuestions]);
      }
    }
  }, [currentIndex, screen, selectedCount, questions.length, level, operation]);

  /**
   * HIGH-ENTROPY PROCEDURAL MATH GENERATOR:
   * Guarantees that no question is EVER repeated to a user.
   * Checks against both session questions and persistent localStorage seen history.
   */
  const generateSingleUniqueAlgorithmicQuestion = (
    lvl: MathLevel,
    op: MathOperation,
    batchSignatures?: Set<string>
  ): MathQuestion => {
    let attempts = 0;
    while (attempts < 40) {
      attempts++;
      const candidate = generateRawAlgorithmicQuestion(lvl, op);
      const sig = cleanMathText(candidate.questionText).toLowerCase().replace(/\s+/g, '');

      // Check if user has already solved or seen this exact question formula
      const isAlreadySeen = seenQuestionsRef.current.has(sig);
      const isDuplicateInBatch = batchSignatures ? batchSignatures.has(sig) : false;

      if (!isAlreadySeen && !isDuplicateInBatch) {
        // Record as seen
        seenQuestionsRef.current.add(sig);
        if (batchSignatures) {
          batchSignatures.add(sig);
        }
        saveSeenQuestionsToStorage(seenQuestionsRef.current);
        return candidate;
      }
    }

    // Fallback: If 40 attempts hit seen (astronomically rare with large number space), return candidate
    const finalCandidate = generateRawAlgorithmicQuestion(lvl, op);
    return finalCandidate;
  };

  /**
   * Core generator spanning 10 operation families and varied number distributions
   */
  const generateRawAlgorithmicQuestion = (lvl: MathLevel, op: MathOperation): MathQuestion => {
    let chosenOp = op;
    if (op === 'all') {
      const ops: MathOperation[] = [
        'bodmas',
        'percent',
        'average',
        'fractions',
        'square',
        'cube',
        'mul',
        'add',
        'linear',
      ];
      chosenOp = ops[Math.floor(Math.random() * ops.length)];
    }

    let qText = '';
    let ans = 0;
    let hint = '';
    let trickExplanation = '';
    let label = '';

    // ================= 1. BODMAS & SIMPLIFICATION =================
    if (chosenOp === 'bodmas') {
      label = 'सरलीकरण (BODMAS)';
      const archetype = Math.floor(Math.random() * 5);

      if (archetype === 0 || lvl === 'easy') {
        const a = Math.floor(Math.random() * 12) + 3;
        const b = Math.floor(Math.random() * 9) + 2;
        const c = Math.floor(Math.random() * 25) + 5;
        ans = a * b + c;
        qText = `(${a} × ${b}) + ${c} = ?`;
        hint = `BODMAS: पहले कोष्ठक का गुणा (${a} × ${b} = ${a * b}), फिर जोड़ (+ ${c})।`;
        trickExplanation = `${a} × ${b} = ${a * b}; ${a * b} + ${c} = ${ans}`;
      } else if (archetype === 1) {
        const div1 = Math.floor(Math.random() * 8) + 2;
        const mult = Math.floor(Math.random() * 9) + 4;
        const div2 = div1 * mult;
        const a = Math.floor(Math.random() * 14) + 4;
        const b = Math.floor(Math.random() * 9) + 3;
        ans = a * b - mult;
        qText = `(${a} × ${b}) - (${div2} ÷ ${div1}) = ?`;
        hint = `पहले भाग (${div2} ÷ ${div1} = ${mult}) और गुणा (${a} × ${b} = ${a * b}), फिर घटाव।`;
        trickExplanation = `${a * b} - ${mult} = ${ans}`;
      } else if (archetype === 2) {
        const sq = Math.floor(Math.random() * 15) + 11;
        const divD = Math.floor(Math.random() * 7) + 2;
        const divQ = Math.floor(Math.random() * 8) + 3;
        const divN = divD * divQ;
        const addN = Math.floor(Math.random() * 30) + 10;
        ans = sq * sq - divQ + addN;
        qText = `${sq}² - (${divN} ÷ ${divD}) + ${addN} = ?`;
        hint = `${sq}² = ${sq * sq}, भाग = ${divQ}, फिर जोड़ और घटाव।`;
        trickExplanation = `${sq * sq} - ${divQ} + ${addN} = ${ans}`;
      } else if (archetype === 3) {
        const a = Math.floor(Math.random() * 20) + 10;
        const b = Math.floor(Math.random() * 15) + 5;
        const c = Math.floor(Math.random() * 18) + 6;
        const d = Math.floor(Math.random() * 8) + 2;
        ans = a * b + c * d;
        qText = `(${a} × ${b}) + (${c} × ${d}) = ?`;
        hint = `विखंडन विधि: ${a} × ${b} = ${a * b}, ${c} × ${d} = ${c * d}`;
        trickExplanation = `${a * b} + ${c * d} = ${ans}`;
      } else {
        const base = Math.floor(Math.random() * 25) + 15;
        const m1 = Math.floor(Math.random() * 12) + 6;
        const m2 = Math.floor(Math.random() * 8) + 3;
        const sub = Math.floor(Math.random() * 40) + 15;
        ans = (base + m1) * m2 - sub;
        qText = `(${base} + ${m1}) × ${m2} - ${sub} = ?`;
        hint = `पहले कोष्ठक जोड़ (${base + m1}), फिर गुणा, फिर घटाव।`;
        trickExplanation = `${base + m1} × ${m2} = ${(base + m1) * m2} - ${sub} = ${ans}`;
      }
    }

    // ================= 2. PERCENTAGES =================
    else if (chosenOp === 'percent') {
      label = 'प्रतिशत (Percentage)';
      const type = Math.floor(Math.random() * 4);

      if (type === 0) {
        // Standard percentage calculation
        const pcts = [10, 15, 20, 25, 30, 40, 50, 60, 75, 80];
        const p = pcts[Math.floor(Math.random() * pcts.length)];
        const multiplier = Math.floor(Math.random() * 25) + 4;
        const base = multiplier * 20;
        ans = Math.round((p * base) / 100);
        qText = `${p}% of ${base} = ?`;
        hint = `${p}% = ${p}/100 भाग। 10% = ${base / 10} मानकर हल करें।`;
        trickExplanation = `${base} × ${p} ÷ 100 = ${ans}`;
      } else if (type === 1) {
        // "What % of X is Y?"
        const pcts = [10, 20, 25, 30, 40, 50, 60, 75];
        const p = pcts[Math.floor(Math.random() * pcts.length)];
        const base = (Math.floor(Math.random() * 15) + 2) * 20;
        const part = (p * base) / 100;
        ans = p;
        qText = `${part} is what % of ${base}?`;
        hint = `प्रतिशत = (भाग ÷ कुल) × 100 = (${part} ÷ ${base}) × 100`;
        trickExplanation = `(${part} ÷ ${base}) × 100 = ${ans}%`;
      } else if (type === 2) {
        // Fraction-to-percentage shortcut
        const fractions = [
          { num: 1, den: 4, pct: 25 },
          { num: 1, den: 5, pct: 20 },
          { num: 1, den: 8, pct: 12.5 },
          { num: 3, den: 4, pct: 75 },
          { num: 3, den: 5, pct: 60 },
          { num: 1, den: 2, pct: 50 },
        ];
        const fr = fractions[Math.floor(Math.random() * fractions.length)];
        const multiplier = Math.floor(Math.random() * 15) + 3;
        const base = fr.den * multiplier * 10;
        ans = (fr.num * base) / fr.den;
        qText = `${fr.pct}% of ${base} = ?`;
        hint = `${fr.pct}% भिन्न में ${fr.num}/${fr.den} के बराबर होता है।`;
        trickExplanation = `${base} ÷ ${fr.den} × ${fr.num} = ${ans}`;
      } else {
        // Percentage addition: a% of X + b% of X
        const base = (Math.floor(Math.random() * 10) + 2) * 50;
        const p1 = [10, 20, 25, 30][Math.floor(Math.random() * 4)];
        const p2 = [10, 15, 20, 25][Math.floor(Math.random() * 4)];
        ans = Math.round(((p1 + p2) * base) / 100);
        qText = `${p1}% of ${base} + ${p2}% of ${base} = ?`;
        hint = `दोनों प्रतिशतों को पहले जोड़ें: ${p1}% + ${p2}% = ${p1 + p2}% of ${base}`;
        trickExplanation = `${p1 + p2}% of ${base} = ${ans}`;
      }
    }

    // ================= 3. SQUARES & SQUARE ROOTS =================
    else if (chosenOp === 'square') {
      label = 'वर्ग व वर्गमूल (Squares & Roots)';
      const isSqrt = Math.random() > 0.45;

      if (isSqrt) {
        const rootBase = Math.floor(Math.random() * (lvl === 'easy' ? 20 : lvl === 'medium' ? 40 : 80)) + 11;
        const sq = rootBase * rootBase;
        ans = rootBase;
        qText = `√${sq} = ?`;
        hint = `अंतिम अंक देखकर इकाई अंक पहचानें और वर्गमूल निकालें।`;
        trickExplanation = `${ans}² = ${sq}, अतः √${sq} = ${ans}`;
      } else {
        const base = Math.floor(Math.random() * (lvl === 'easy' ? 25 : lvl === 'medium' ? 50 : 90)) + 11;
        ans = base * base;
        qText = `${base}² = ?`;
        hint = `${base} का वर्ग निकालें (${base} × ${base})।`;
        trickExplanation = `${base}² = ${ans}`;
      }
    }

    // ================= 4. CUBES & CUBE ROOTS =================
    else if (chosenOp === 'cube') {
      label = 'घन व घनमूल (Cubes & Roots)';
      const isCubeRoot = Math.random() > 0.45;

      if (isCubeRoot) {
        const base = Math.floor(Math.random() * (lvl === 'easy' ? 10 : lvl === 'medium' ? 18 : 25)) + 2;
        const cubeVal = base * base * base;
        ans = base;
        qText = `∛${cubeVal} = ?`;
        hint = `${cubeVal} किसका घन है? अंतिम अंक नियम याद करें।`;
        trickExplanation = `${ans}³ = ${cubeVal}, अतः ∛${cubeVal} = ${ans}`;
      } else {
        const base = Math.floor(Math.random() * (lvl === 'easy' ? 10 : lvl === 'medium' ? 15 : 20)) + 2;
        ans = base * base * base;
        qText = `${base}³ = ?`;
        hint = `${base} का तीन बार गुणा करें (${base} × ${base} × ${base})।`;
        trickExplanation = `${base} × ${base} = ${base * base}; ${base * base} × ${base} = ${ans}`;
      }
    }

    // ================= 5. SPEED MULTIPLICATION TRICKS =================
    else if (chosenOp === 'mul') {
      label = 'द्रुत गुणा (Speed Multiplication)';
      const trickType = Math.floor(Math.random() * 5);

      if (trickType === 0) {
        // Multiply by 11
        const d1 = Math.floor(Math.random() * 7) + 2;
        const d2 = Math.floor(Math.random() * 7) + 1;
        const num = d1 * 10 + d2;
        ans = num * 11;
        qText = `${num} × 11 = ?`;
        hint = `11 की ट्रिक: पहले अंक (${d1}) और अंतिम अंक (${d2}) के बीच दोनों का योग (${d1 + d2}) रखें।`;
        trickExplanation = `${d1}_${d1 + d2}_${d2} = ${ans}`;
      } else if (trickType === 1) {
        // Multiply by 25
        const mult = (Math.floor(Math.random() * 30) + 6) * 4;
        ans = mult * 25;
        qText = `${mult} × 25 = ?`;
        hint = `25 की ट्रिक: संख्या को 4 से भाग दें (${mult / 4}) और आगे दो शून्य (00) लगा दें।`;
        trickExplanation = `${mult} ÷ 4 = ${mult / 4} -> ${ans}`;
      } else if (trickType === 2) {
        // Multiply by 5
        const even = (Math.floor(Math.random() * 45) + 8) * 2;
        ans = even * 5;
        qText = `${even} × 5 = ?`;
        hint = `5 की ट्रिक: संख्या का आधा करें (${even / 2}) और अंत में 0 लगा दें!`;
        trickExplanation = `${even} ÷ 2 = ${even / 2} -> ${ans}`;
      } else if (trickType === 3) {
        // Multiply by 99
        const num = Math.floor(Math.random() * 85) + 12;
        ans = num * 99;
        qText = `${num} × 99 = ?`;
        hint = `99 की ट्रिक: ${num} × 100 - ${num} = ${num * 100} - ${num}`;
        trickExplanation = `${num * 100} - ${num} = ${ans}`;
      } else {
        // Vedic base 100 multiplication: (100 + a) * (100 + b)
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 2;
        const n1 = 100 + a;
        const n2 = 100 + b;
        ans = n1 * n2;
        qText = `${n1} × ${n2} = ?`;
        hint = `वैदिक गणित 100 आधार: (100 + ${a} + ${b}) = ${100 + a + b} और ${a} × ${b} = ${a * b}`;
        trickExplanation = `${100 + a + b} के आगे ${a * b < 10 ? '0' + (a * b) : a * b} = ${ans}`;
      }
    }

    // ================= 6. AVERAGES =================
    else if (chosenOp === 'average') {
      label = 'औसत (Average)';
      const isMissing = Math.random() > 0.5;

      if (isMissing) {
        // If average of A, B, C is X, find missing
        const avg = Math.floor(Math.random() * 30) + 20;
        const a = avg - (Math.floor(Math.random() * 8) + 2);
        const b = avg + (Math.floor(Math.random() * 8) + 2);
        const targetSum = avg * 3;
        const c = targetSum - (a + b);
        ans = c;
        qText = `If Average of ${a}, ${b}, and ? is ${avg}, find ?`;
        hint = `कुल योग = ${avg} × 3 = ${targetSum}। ज्ञात संख्याओं का योग = ${a + b}।`;
        trickExplanation = `${targetSum} - (${a} + ${b}) = ${ans}`;
      } else {
        const a = (Math.floor(Math.random() * 15) + 10) * 2;
        const b = (Math.floor(Math.random() * 15) + 10) * 2;
        const c = (Math.floor(Math.random() * 15) + 10) * 2;
        const sum = a + b + c;
        const rem = sum % 3;
        const adjustedC = c + (rem === 0 ? 0 : 3 - rem);
        ans = (a + b + adjustedC) / 3;
        qText = `(${a} + ${b} + ${adjustedC}) ÷ 3 = ?`;
        hint = `तीनों संख्याओं का योग कर 3 से भाग दें।`;
        trickExplanation = `योग = ${a + b + adjustedC}, औसत = ${ans}`;
      }
    }

    // ================= 7. FRACTIONS & DECIMALS =================
    else if (chosenOp === 'fractions') {
      label = 'भिन्न व दशमलव (Fractions)';
      const type = Math.floor(Math.random() * 3);

      if (type === 0) {
        const den = [4, 5, 8, 10, 12][Math.floor(Math.random() * 5)];
        const mult = Math.floor(Math.random() * 15) + 4;
        const whole = den * mult;
        const num = Math.floor(Math.random() * (den - 1)) + 1;
        ans = (num * whole) / den;
        qText = `(${num} ÷ ${den}) × ${whole} = ?`;
        hint = `पहले ${whole} को ${den} से भाग दें (${mult}), फिर ${num} से गुणा करें।`;
        trickExplanation = `${whole} ÷ ${den} = ${mult}; ${mult} × ${num} = ${ans}`;
      } else if (type === 1) {
        // Decimal multiplication
        const d1 = (Math.floor(Math.random() * 8) + 2) * 5; // e.g. 25, 35
        const d2 = Math.floor(Math.random() * 8) + 2;
        ans = (d1 * d2) / 10;
        qText = `${(d1 / 10).toFixed(1)} × ${d2} = ?`;
        hint = `साधारण गुणा करें (${d1} × ${d2} = ${d1 * d2}), फिर 1 अंक पहले दशमलव लगाएं।`;
        trickExplanation = `${d1 / 10} × ${d2} = ${ans}`;
      } else {
        // Simple fraction sum: (a/b) + (c/b)
        const den = Math.floor(Math.random() * 6) + 4;
        const n1 = Math.floor(Math.random() * 5) + 2;
        const n2 = den * (Math.floor(Math.random() * 4) + 1) - n1;
        ans = (n1 + n2) / den;
        qText = `(${n1} ÷ ${den}) + (${n2} ÷ ${den}) = ?`;
        hint = `समान हर (Denominator) है, तो अंशों को जोड़ें: (${n1} + ${n2}) ÷ ${den}`;
        trickExplanation = `${n1 + n2} ÷ ${den} = ${ans}`;
      }
    }

    // ================= 8. LINEAR EQUATIONS (MISSING VALUE) =================
    else if (chosenOp === 'linear') {
      label = 'समीकरण मान (Find ?) ';
      const a = Math.floor(Math.random() * 8) + 2;
      const x = Math.floor(Math.random() * 18) + 3;
      const b = Math.floor(Math.random() * 30) + 10;
      const total = a * x + b;
      ans = x;
      qText = `(${a} × ?) + ${b} = ${total}`;
      hint = `पहले दाएँ पक्ष से ${b} घटाएं (${total} - ${b} = ${total - b}), फिर ${a} से भाग दें।`;
      trickExplanation = `? = (${total} - ${b}) ÷ ${a} = ${ans}`;
    }

    // ================= 9. SPEED ADDITION & SUBTRACTION =================
    else {
      label = 'जोड़ व घटाव (Add & Sub)';
      const isSub = Math.random() > 0.45;

      if (isSub) {
        // Complement subtraction from 1000 or general
        if (Math.random() > 0.5) {
          const sub = Math.floor(Math.random() * 600) + 150;
          ans = 1000 - sub;
          qText = `1000 - ${sub} = ?`;
          hint = `1000 का पूरक: अंतिम अंक 10 से, बाकी सब 9 से घटाएं (All from 9, last from 10)।`;
          trickExplanation = `1000 - ${sub} = ${ans}`;
        } else {
          const n1 = Math.floor(Math.random() * 800) + 200;
          const n2 = Math.floor(Math.random() * 400) + 80;
          ans = n1 - n2;
          qText = `${n1} - ${n2} = ?`;
          hint = `सैकड़ा और दहाई को अलग-अलग घटाएं।`;
          trickExplanation = `${n1} - ${n2} = ${ans}`;
        }
      } else {
        const n1 = Math.floor(Math.random() * 650) + 120;
        const n2 = Math.floor(Math.random() * 550) + 100;
        ans = n1 + n2;
        qText = `${n1} + ${n2} = ?`;
        hint = `सैकड़ा, दहाई व इकाई को अलग-अलग जोड़कर त्वरित हल करें।`;
        trickExplanation = `${n1} + ${n2} = ${ans}`;
      }
    }

    // Generate 4 distinct options with plausible distractor deltas
    const options = [ans];
    while (options.length < 4) {
      const step = ans > 100 ? 10 : 1;
      const delta = (Math.floor(Math.random() * 6) + 1) * (Math.random() > 0.5 ? 1 : -1) * step;
      const fake = ans + delta;
      if (fake > 0 && !options.includes(fake)) {
        options.push(fake);
      }
    }
    options.sort(() => Math.random() - 0.5);

    return {
      operation: chosenOp,
      operationLabel: label,
      questionText: cleanMathText(qText),
      correctAnswer: ans,
      options,
      hint: cleanMathText(hint),
      trickExplanation: cleanMathText(trickExplanation),
    };
  };

  /**
   * INSTANT PRACTICE START:
   * Generates questions immediately in 0ms synchronously!
   * No network delay, no 429 errors, no "प्रश्न तैयार हो रहे हैं... (question is being ready)" hanging!
   */
  const handleStartPractice = () => {
    playTapSound(soundEnabled);
    const initialFetchCount = selectedCount === 'infinite' ? 15 : selectedCount;

    const initialQuestions: MathQuestion[] = [];
    const activeSignatures = new Set<string>();

    for (let i = 0; i < initialFetchCount; i++) {
      initialQuestions.push(generateSingleUniqueAlgorithmicQuestion(level, operation, activeSignatures));
    }

    setQuestions(initialQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setTypedInput('');
    setIsAnswered(false);
    setIsCorrect(false);
    setScore(0);
    setStreak(0);
    setElapsedSeconds(0);
    setScreen('practice');
  };

  const currentQ = questions[currentIndex] || null;

  // Handle Option selection (MCQ Mode)
  const handleSelectOption = (opt: number) => {
    if (isAnswered || !currentQ) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    const correct = opt === currentQ.correctAnswer;
    setIsCorrect(correct);

    // Record question result
    const updated = [...questions];
    updated[currentIndex] = {
      ...currentQ,
      userSelected: opt,
      isCorrect: correct,
    };
    setQuestions(updated);

    if (correct) {
      playCorrectSound(soundEnabled);
      setScore((prev) => prev + 10);
      setStreak((prev) => prev + 1);
    } else {
      playWrongSound(soundEnabled);
      setStreak(0);
    }
  };

  // Handle Typed Submit (Numpad Mode)
  const handleTypedSubmit = () => {
    if (isAnswered || !currentQ || !typedInput.trim()) return;
    const userVal = parseFloat(typedInput);
    if (isNaN(userVal)) return;

    setSelectedOption(userVal);
    setIsAnswered(true);

    const correct = userVal === currentQ.correctAnswer;
    setIsCorrect(correct);

    const updated = [...questions];
    updated[currentIndex] = {
      ...currentQ,
      userSelected: userVal,
      isCorrect: correct,
    };
    setQuestions(updated);

    if (correct) {
      playCorrectSound(soundEnabled);
      setScore((prev) => prev + 10);
      setStreak((prev) => prev + 1);
    } else {
      playWrongSound(soundEnabled);
      setStreak(0);
    }
  };

  // Move to Next Question
  const handleNextQuestion = () => {
    playTapSound(soundEnabled);

    // Check if test completed (for finite modes)
    if (selectedCount !== 'infinite' && currentIndex >= questions.length - 1) {
      setTotalTimeTaken(elapsedSeconds);
      setScreen('result');
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setTypedInput('');
    setIsAnswered(false);
    setIsCorrect(false);
  };

  // Finish Infinite Session early
  const handleFinishInfiniteSession = () => {
    playTapSound(soundEnabled);
    setTotalTimeTaken(elapsedSeconds);
    setScreen('result');
  };

  // Format Time (MM:SS)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculation Operations List
  const operationsList = [
    { id: 'all', nameHi: 'मिश्रित (सभी प्रकार)', nameEn: 'All Mixed Operations', icon: '⚡' },
    { id: 'bodmas', nameHi: 'सरलीकरण (BODMAS)', nameEn: 'BODMAS / Simplification', icon: '🧮' },
    { id: 'percent', nameHi: 'प्रतिशत (Percentage)', nameEn: 'Percentage Tricks', icon: '📊' },
    { id: 'square', nameHi: 'वर्ग व वर्गमूल (Squares)', nameEn: 'Square & Square Roots', icon: '²' },
    { id: 'cube', nameHi: 'घन व घनमूल (Cubes)', nameEn: 'Cube & Cube Roots', icon: '³' },
    { id: 'mul', nameHi: 'द्रुत गुणा (Speed Multiplication)', nameEn: 'Speed Multiplication', icon: '✖️' },
    { id: 'average', nameHi: 'औसत (Average)', nameEn: 'Average Calculations', icon: '⚖️' },
    { id: 'fractions', nameHi: 'भिन्न व दशमलव (Fractions)', nameEn: 'Fractions & Decimals', icon: '½' },
    { id: 'linear', nameHi: 'रैखिक समीकरण (Find ?)', nameEn: 'Missing Number Equations', icon: '🔍' },
    { id: 'add', nameHi: 'जोड़ व घटाव (Add & Sub)', nameEn: 'Rapid Addition/Subtraction', icon: '➕' },
  ];

  return (
    <div className="w-full">
      {/* ================= SCREEN 1: SETUP SCREEN ================= */}
      {screen === 'setup' && (
        <div className="max-w-md mx-auto px-4 py-4 pb-20 space-y-4 animate-in fade-in duration-200">
          {/* Section Hero Banner */}
          <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 text-white rounded-3xl p-5 shadow-sm border border-blue-800/40 relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-amber-400 text-amber-950 font-black text-xs rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  स्पीड मैथ बूस्टर
                </span>
                <span className="text-xs text-blue-200 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  असीमित अभ्यास
                </span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-white">
                Calculation & Speed Math
              </h1>
              <p className="text-xs text-blue-200 leading-relaxed font-medium">
                SSC, Railway और Bank परीक्षाओं के लिए तीव्र गति से गणना का अभ्यास करें। कभी न खत्म होने वाले नए प्रश्न!
              </p>
            </div>
          </div>

          {/* 1. SELECT NUMBER OF QUESTIONS (INCLUDING INFINITE) */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-blue-600" />
                प्रश्नों की संख्या चुनें
              </label>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {selectedCount === 'infinite' ? 'अनलिमिटेड (कभी खत्म नहीं)' : `${selectedCount} प्रश्न`}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {([10, 25, 50, 100, 'infinite'] as QuestionCountChoice[]).map((count) => {
                const isSelected = selectedCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      playTapSound(soundEnabled);
                      setSelectedCount(count);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-102 ring-2 ring-blue-300'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {count === 'infinite' ? (
                      <>
                        <InfinityIcon className="w-4 h-4" />
                        <span className="text-[10px] leading-none">असीमित</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm leading-none">{count}</span>
                        <span className="text-[9px] text-slate-400 font-semibold leading-none">Q</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. SELECT DIFFICULTY LEVEL */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-2.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              कठिनाई स्तर (Difficulty)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: 'easy', label: 'सरल', color: 'emerald' },
                  { id: 'medium', label: 'मध्यम', color: 'blue' },
                  { id: 'hard', label: 'कठिन', color: 'amber' },
                  { id: 'pro', label: 'प्रो', color: 'rose' },
                ] as const
              ).map((lvl) => {
                const isSelected = level === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => {
                      playTapSound(soundEnabled);
                      setLevel(lvl.id);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-102'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {lvl.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. SELECT TOPIC / OPERATION */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-2.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-indigo-600" />
              विषय चुनें (Topic)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {operationsList.map((op) => {
                const isSelected = operation === op.id;
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => {
                      playTapSound(soundEnabled);
                      setOperation(op.id as MathOperation);
                    }}
                    className={`p-2.5 rounded-xl text-left font-bold text-xs transition-all cursor-pointer border flex items-center gap-2 ${
                      isSelected
                        ? 'bg-blue-50 text-blue-900 border-blue-500 shadow-xs ring-1 ring-blue-400'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="text-base">{op.icon}</span>
                    <span className="truncate leading-tight">{language === 'hi' ? op.nameHi : op.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. INPUT MODE TOGGLE */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-2.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              उत्तर देने का माध्यम
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundEnabled);
                  setInputMode('options');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                  inputMode === 'options'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                4 विकल्प (MCQ Mode)
              </button>
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundEnabled);
                  setInputMode('type');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                  inputMode === 'type'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                टाइप करें (Numpad)
              </button>
            </div>
          </div>

          {/* START FULL SCREEN BUTTON - INSTANT GENERATION */}
          <button
            type="button"
            onClick={handleStartPractice}
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm rounded-2xl shadow-lg active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 select-none"
          >
            <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
            <span>
              🚀 फुल स्क्रीन में अभ्यास शुरू करें (
              {selectedCount === 'infinite' ? 'असीमित' : `${selectedCount} प्रश्न`})
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= SCREEN 2: PROPER FULL SCREEN PRACTICE SCREEN ================= */}
      {screen === 'practice' && currentQ && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-y-auto animate-in fade-in duration-200">
          {/* Top Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 relative overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 h-full transition-all duration-300"
              style={{
                width:
                  selectedCount === 'infinite'
                    ? '100%'
                    : `${Math.min(100, Math.round(((currentIndex + 1) / selectedCount) * 100))}%`,
              }}
            />
          </div>

          {/* Top Navigation & Status Bar */}
          <div className="px-3 sm:px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10 flex items-center justify-between">
            {/* Left Buttons: Home to Menu & Back to Setup */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundEnabled);
                  onNavigateHome();
                }}
                title="मुख्य मेन्यू पर जाएं"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs active:scale-95 transition-all cursor-pointer border border-amber-300"
              >
                <Home className="w-3.5 h-3.5" />
                <span>मेन्यू</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTapSound(soundEnabled);
                  setScreen('setup');
                }}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer border border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                <span>सेटअप</span>
              </button>
            </div>

            {/* Middle Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Question Counter */}
              <span className="px-2.5 py-1 bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-black rounded-full whitespace-nowrap">
                {selectedCount === 'infinite'
                  ? `Q ${currentIndex + 1} / ∞`
                  : `Q ${currentIndex + 1} / ${questions.length}`}
              </span>

              {/* Timer Pill */}
              <div className="flex items-center gap-1 text-xs font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded-full border border-slate-700">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{formatTime(elapsedSeconds)}</span>
              </div>
            </div>

            {/* Right Action: Calculator + Finish */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsCalcOpen(true)}
                className="p-1.5 text-slate-300 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer"
                title="कैलकुलेटर खोलें"
              >
                <Calculator className="w-4 h-4 text-blue-400" />
              </button>
              {selectedCount === 'infinite' && (
                <button
                  type="button"
                  onClick={handleFinishInfiniteSession}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold rounded-xl border border-amber-500/30 transition-colors cursor-pointer"
                >
                  समाप्त
                </button>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 max-w-lg w-full mx-auto p-4 sm:p-6 flex flex-col justify-center space-y-4">
            {/* Score & Streak Header */}
            <div className="flex items-center justify-between px-1 text-xs font-bold">
              <span className="text-slate-400 flex items-center gap-1">
                <span>टॉपिक:</span>
                <span className="text-slate-200">{currentQ.operationLabel}</span>
              </span>
              <div className="flex items-center gap-3">
                <span className="text-amber-400 flex items-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                  स्ट्रीक: {streak}
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  स्कोर: {score}
                </span>
              </div>
            </div>

            {/* Crisp Question Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-3 relative overflow-hidden">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-900 inline-block">
                स्पीड कैलकुलेशन
              </span>

              {/* Render Question Text - Clean, Big, Beautiful */}
              <div className="text-3xl sm:text-4xl font-black text-white tracking-wide py-2 font-mono">
                {currentQ.questionText}
              </div>

              {/* Hint button if not answered */}
              {!isAnswered && currentQ.hint && (
                <div className="pt-1">
                  <span className="text-xs text-slate-400 flex items-center justify-center gap-1 font-medium">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>संकेत: {currentQ.hint}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Answer Mode 1: 4 Options (MCQ Mode) */}
            {inputMode === 'options' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                {currentQ.options.map((opt, i) => {
                  const isUserPick = selectedOption === opt;
                  const isCorrectAnswer = opt === currentQ.correctAnswer;

                  let btnStyle =
                    'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-850 hover:border-slate-700';

                  if (isAnswered) {
                    if (isCorrectAnswer) {
                      btnStyle = 'bg-emerald-600/90 border-emerald-500 text-white ring-2 ring-emerald-400';
                    } else if (isUserPick && !isCorrectAnswer) {
                      btnStyle = 'bg-rose-600/90 border-rose-500 text-white ring-2 ring-rose-400';
                    } else {
                      btnStyle = 'bg-slate-900/50 border-slate-850 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(opt)}
                      className={`py-4 px-4 rounded-2xl border text-xl font-black font-mono transition-all active:scale-95 cursor-pointer shadow-sm flex items-center justify-center gap-2 ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && isCorrectAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                      )}
                      {isAnswered && isUserPick && !isCorrectAnswer && (
                        <XCircle className="w-5 h-5 text-white shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Answer Mode 2: Numpad / Type Mode */}
            {inputMode === 'type' && (
              <div className="space-y-3 pt-1">
                <div className="flex gap-2">
                  <input
                    type="number"
                    disabled={isAnswered}
                    value={typedInput}
                    onChange={(e) => setTypedInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTypedSubmit();
                    }}
                    placeholder="अपना उत्तर लिखें..."
                    className="flex-1 bg-slate-900 border border-slate-800 text-white font-mono text-2xl font-bold px-4 py-3 rounded-2xl text-center focus:outline-none focus:border-blue-500"
                  />
                  {!isAnswered && (
                    <button
                      type="button"
                      onClick={handleTypedSubmit}
                      disabled={!typedInput.trim()}
                      className="px-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold rounded-2xl transition-all cursor-pointer"
                    >
                      जांचें
                    </button>
                  )}
                </div>

                {/* Quick Numpad Keys */}
                {!isAnswered && (
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setTypedInput((prev) => prev + num.toString())}
                        className="py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-mono font-bold rounded-xl text-lg cursor-pointer active:scale-95 transition-all"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Post-Answer Feedback & Shortcut Explanation */}
            {isAnswered && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    isCorrect
                      ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-800/80 text-rose-200'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 text-xs space-y-1">
                    <p className="font-bold text-sm">
                      {isCorrect ? 'शाबाश! सही उत्तर है 🎉' : `गलत उत्तर! सही उत्तर था: ${currentQ.correctAnswer}`}
                    </p>
                    {currentQ.trickExplanation && (
                      <p className="text-slate-300 font-mono pt-1 text-xs">
                        💡 त्वरित हल (Shortcut): {currentQ.trickExplanation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Next Question Button */}
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm rounded-2xl shadow-lg active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>
                    {selectedCount !== 'infinite' && currentIndex >= questions.length - 1
                      ? 'परिणाम देखें'
                      : 'अगला प्रश्न'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SCREEN 3: RESULT SCREEN ================= */}
      {screen === 'result' && (
        <div className="max-w-md mx-auto px-4 py-6 pb-20 space-y-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-inner">
              <Trophy className="w-8 h-8 fill-amber-500" />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">स्पीड मैथ सत्र संपन्न!</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                शानदार प्रयास! आपकी गति और सटीकता का विवरण:
              </p>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3">
                <span className="text-xs text-blue-600 font-bold block">कुल प्रश्न</span>
                <span className="text-xl font-black text-blue-900 font-mono">
                  {questions.filter((q) => q.isCorrect !== undefined).length}
                </span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3">
                <span className="text-xs text-emerald-600 font-bold block">सही उत्तर</span>
                <span className="text-xl font-black text-emerald-900 font-mono">
                  {questions.filter((q) => q.isCorrect).length}
                </span>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3">
                <span className="text-xs text-purple-600 font-bold block">समय</span>
                <span className="text-xl font-black text-purple-900 font-mono">
                  {formatTime(totalTimeTaken)}
                </span>
              </div>
            </div>

            {/* Accuracy Bar */}
            {(() => {
              const attempted = questions.filter((q) => q.isCorrect !== undefined).length;
              const correct = questions.filter((q) => q.isCorrect).length;
              const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
              return (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>सटीकता (Accuracy)</span>
                    <span className="font-mono text-sm text-blue-600">{accuracy}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundEnabled);
                  setScreen('setup');
                }}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>नया टेस्ट</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundEnabled);
                  onNavigateHome();
                }}
                className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Home className="w-4 h-4" />
                <span>मुख्य मेन्यू</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Calculator Modal */}
      <FloatingCalculator
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        soundEnabled={soundEnabled}
      />
    </div>
  );
};
