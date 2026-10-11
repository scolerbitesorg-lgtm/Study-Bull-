import React, { useState, useEffect, useRef } from 'react';
import { ExamCategory, MockTest, QuestionStatus, MockAttempt, Language } from '../types';
import { EXAM_CATEGORIES, MOCK_TESTS } from '../data/mockData';
import { FirestoreService } from '../firebase/firestoreService';
import { ExamCard } from './ExamCard';
import { QuestionPaletteDrawer } from './QuestionPaletteDrawer';
import { MockAnalysisModal } from './MockAnalysisModal';
import { playTapSound } from '../utils/audio';
import { StorageService } from '../services/storageService';
import { 
  ArrowLeft, 
  Clock, 
  LayoutGrid, 
  CheckCircle2, 
  HelpCircle, 
  Bookmark, 
  AlertTriangle,
  PlayCircle,
  FileCheck
} from 'lucide-react';

interface MockSectionProps {
  language: Language;
  soundEnabled: boolean;
  preselectedExamId?: string;
  onNavigateHome: () => void;
}

export const MockSection: React.FC<MockSectionProps> = ({
  language,
  soundEnabled,
  preselectedExamId,
  onNavigateHome,
}) => {
  const [categories, setCategories] = useState<ExamCategory[]>(() =>
    StorageService.getCachedData('categories', EXAM_CATEGORIES)
  );
  const [mockTests, setMockTests] = useState<MockTest[]>(() =>
    StorageService.getCachedData('mockTests', MOCK_TESTS)
  );

  // Subscribe to real-time updates from Firebase Firestore
  useEffect(() => {
    const unsubCats = FirestoreService.subscribeCategories((list) => {
      if (list && list.length > 0) {
        setCategories(list);
        StorageService.saveCachedData('categories', list);
      }
    });
    const unsubTests = FirestoreService.subscribeMockTests((list) => {
      if (list && list.length > 0) {
        setMockTests(list);
        StorageService.saveCachedData('mockTests', list);
      }
    });
    return () => {
      unsubCats();
      unsubTests();
    };
  }, []);

  // Step-by-step mobile hardware and gesture back button handler (Hash & Popstate synced)
  useEffect(() => {
    const syncFromNavigation = () => {
      const hash = window.location.hash || '';
      const state = window.history.state || {};

      if (hash.startsWith('#/mock') || state.section === 'mock') {
        const parts = hash.replace(/^#\/?/, '').split('/');
        // parts[0] is 'mock', parts[1] is examId, parts[2] is testId, parts[3] is 'result'
        const exId = parts[1] || state.mockExamId;
        const tId = parts[2] || state.mockTestId;
        const isResult = parts[3] === 'result' || !!state.mockDone;

        // If drawer or confirmation is open, back closes them first
        setIsPaletteOpen(false);
        setShowSubmitConfirm(false);

        if (!isResult) {
          setCompletedAttempt(null);
        }

        if (tId) {
          // Inside Active Test
          const ex = categories.find((e) => e.id === exId) || EXAM_CATEGORIES.find((e) => e.id === exId) || null;
          if (ex) setSelectedExam(ex);
          const foundTest = mockTests.find((t: MockTest) => t.id === tId) || null;
          setActiveTest(foundTest);
        } else if (exId) {
          // Stepped back from active test -> now in Test Series list!
          setActiveTest(null);
          setCompletedAttempt(null);
          const ex = categories.find((e) => e.id === exId) || EXAM_CATEGORIES.find((e) => e.id === exId) || null;
          setSelectedExam(ex);
        } else {
          // Root Exam Categories list
          setActiveTest(null);
          setSelectedExam(null);
          setCompletedAttempt(null);
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
  }, [mockTests, categories]);

  const [selectedExam, setSelectedExam] = useState<ExamCategory | null>(() => {
    if (preselectedExamId) {
      return EXAM_CATEGORIES.find((e) => e.id === preselectedExamId) || null;
    }
    return null;
  });
  const [activeTest, setActiveTest] = useState<MockTest | null>(null);

  // Real Test Examination Environment State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [statusMap, setStatusMap] = useState<Record<number, QuestionStatus>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [testStartTime, setTestStartTime] = useState<number>(0);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [completedAttempt, setCompletedAttempt] = useState<MockAttempt | null>(null);

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeTest && secondsRemaining > 0 && !completedAttempt) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleFinalSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTest, secondsRemaining, completedAttempt]);

  const handleSelectExam = (exam: ExamCategory) => {
    if (!exam.active) {
      alert(language === 'hi' ? 'यह टेस्ट सीरीज जल्द ही उपलब्ध होगी (Coming Soon)!' : 'This test series will be available soon!');
      return;
    }
    setSelectedExam(exam);
    setActiveTest(null);
    window.history.pushState({ section: 'mock', mockExamId: exam.id }, '', `#/mock/${exam.id}`);
  };

  const handleStartTest = (test: MockTest) => {
    playTapSound(soundEnabled);
    setActiveTest(test);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    
    // Initialize status map: 0 is 'not-answered', rest 'not-visited'
    const initialStatus: Record<number, QuestionStatus> = {};
    for (let i = 0; i < test.questions.length; i++) {
      initialStatus[i] = i === 0 ? 'not-answered' : 'not-visited';
    }
    setStatusMap(initialStatus);
    setSecondsRemaining(test.durationMinutes * 60);
    setTestStartTime(Date.now());
    setCompletedAttempt(null);
    setShowSubmitConfirm(false);

    const exId = selectedExam?.id || test.examId;
    window.history.pushState(
      { section: 'mock', mockExamId: exId, mockTestId: test.id },
      '',
      `#/mock/${exId}/${test.id}`
    );
  };

  const handleOptionSelect = (optionIndex: number) => {
    playTapSound(soundEnabled);
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));

    if (activeTest && activeTest.questions[currentQuestionIndex]) {
      const q = activeTest.questions[currentQuestionIndex];
      StorageService.addSeenEnglishQuestion(q.questionHi || q.questionEn || q.id);
    }
  };

  const handleSaveAndNext = () => {
    playTapSound(soundEnabled);
    if (!activeTest) return;

    const hasSelected = userAnswers[currentQuestionIndex] !== undefined;
    setStatusMap((prev) => ({
      ...prev,
      [currentQuestionIndex]: hasSelected ? 'answered' : 'not-answered',
    }));

    if (currentQuestionIndex < activeTest.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setStatusMap((prev) => ({
        ...prev,
        [nextIndex]: prev[nextIndex] === 'not-visited' ? 'not-answered' : prev[nextIndex],
      }));
    }
  };

  const handleMarkForReviewAndNext = () => {
    playTapSound(soundEnabled);
    if (!activeTest) return;

    setStatusMap((prev) => ({
      ...prev,
      [currentQuestionIndex]: 'marked-review',
    }));

    if (currentQuestionIndex < activeTest.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setStatusMap((prev) => ({
        ...prev,
        [nextIndex]: prev[nextIndex] === 'not-visited' ? 'not-answered' : prev[nextIndex],
      }));
    }
  };

  const handleClearResponse = () => {
    playTapSound(soundEnabled);
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuestionIndex];
      return next;
    });
    setStatusMap((prev) => ({
      ...prev,
      [currentQuestionIndex]: 'not-answered',
    }));
  };

  const handleFinalSubmit = () => {
    playTapSound(soundEnabled);
    if (!activeTest) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - testStartTime) / 1000));
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;

    activeTest.questions.forEach((q, idx) => {
      const userChoice = userAnswers[idx];
      if (userChoice === undefined) {
        unattemptedCount++;
      } else if (userChoice === q.correctIndex) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const totalMarks = activeTest.totalMarks;
    const scoreObtained = Math.max(
      0,
      correctCount * activeTest.positiveMarks - wrongCount * activeTest.negativeMarks
    );
    const accuracy =
      correctCount + wrongCount > 0
        ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
        : 0;

    const attempt: MockAttempt = {
      testId: activeTest.id,
      testTitle: activeTest.title,
      examId: activeTest.examId,
      answers: userAnswers,
      statusMap,
      timeSpentSeconds,
      totalMarks,
      scoreObtained,
      correctCount,
      wrongCount,
      unattemptedCount,
      accuracy,
      date: new Date().toLocaleDateString(),
    };

    StorageService.saveMockAttempt(attempt);
    setCompletedAttempt(attempt);
    setShowSubmitConfirm(false);
    const exId = selectedExam?.id || activeTest.examId;
    window.history.pushState(
      { section: 'mock', mockExamId: exId, mockTestId: activeTest.id, mockDone: true },
      '',
      `#/mock/${exId}/${activeTest.id}/result`
    );
  };

  // Helper format time
  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- STEP 4: ANALYSIS REPORT ---
  if (completedAttempt && activeTest) {
    return (
      <MockAnalysisModal
        attempt={completedAttempt}
        mockTest={activeTest}
        language={language}
        onRetry={() => handleStartTest(activeTest)}
        onBackToSeries={() => {
          playTapSound(soundEnabled);
          window.history.back();
        }}
      />
    );
  }

  // --- STEP 3: REAL EXAMINATION ENVIRONMENT ---
  if (activeTest) {
    const currentQ = activeTest.questions[currentQuestionIndex] || activeTest.questions[0];
    const isWarningTime = secondsRemaining < 300; // less than 5 mins

    const questionText = language === 'hi' ? currentQ.questionHi : currentQ.questionEn;
    const options = language === 'hi' ? currentQ.optionsHi : currentQ.optionsEn;

    let answeredCount = 0;
    let markedCount = 0;
    Object.values(statusMap).forEach((st) => {
      if (st === 'answered') answeredCount++;
      if (st === 'marked-review') markedCount++;
    });

    return (
      <div className="bg-slate-100 min-h-screen pb-28">
        {/* Sticky Exam Status Header */}
        <div className="sticky top-0 z-30 bg-slate-900 text-white shadow-md border-b border-slate-800">
          <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
            {/* Test Title / Question Number */}
            <div>
              <span className="text-xs text-slate-300 font-bold block truncate max-w-[170px] sm:max-w-xs">
                {activeTest.title}
              </span>
              <span className="text-[11px] text-blue-400 font-mono">
                {language === 'hi' ? 'प्रश्न' : 'Q'} {currentQuestionIndex + 1}/{activeTest.questions.length}
              </span>
            </div>

            {/* Countdown Timer with Warning State */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold ${
                isWarningTime
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-800 text-emerald-400 border border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            {/* Question Palette Drawer Trigger */}
            <button
              onClick={() => {
                playTapSound(soundEnabled);
                setIsPaletteOpen(true);
              }}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold active:scale-90 transition-all cursor-pointer shadow-xs"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {language === 'hi' ? 'पैलेट' : 'Palette'}
              </span>
            </button>
          </div>
        </div>

        {/* Question Area Container */}
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          {/* Question Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3.5 text-xs text-slate-500 font-medium">
              <span>
                {language === 'hi' ? 'मार्किंग: ' : 'Marking: '}{' '}
                <strong className="text-emerald-600">+{activeTest.positiveMarks}</strong>,{' '}
                <strong className="text-rose-600">-{activeTest.negativeMarks}</strong>
              </span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                {statusMap[currentQuestionIndex] === 'answered'
                  ? (language === 'hi' ? 'उत्तर दिया गया' : 'Answered')
                  : statusMap[currentQuestionIndex] === 'marked-review'
                  ? (language === 'hi' ? 'समीक्षा हेतु चिन्हित' : 'Marked for Review')
                  : (language === 'hi' ? 'उत्तर नहीं दिया' : 'Not Answered')}
              </span>
            </div>

            {/* Question Heading */}
            <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {questionText}
            </p>

            {/* Options List */}
            <div className="space-y-3 mt-5">
              {options.map((opt, optIdx) => {
                const isSelected = userAnswers[currentQuestionIndex] === optIdx;

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleOptionSelect(optIdx)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 flex items-center gap-3 cursor-pointer active:scale-98 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-950 font-semibold ring-2 ring-blue-500/30'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="text-sm font-medium leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fixed Sticky Action Bar at the Bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-lg">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleMarkForReviewAndNext}
                className="py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                {language === 'hi' ? 'समीक्षा व अगला' : 'Review & Next'}
              </button>

              <button
                onClick={handleClearResponse}
                className="py-2.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                {language === 'hi' ? 'उत्तर हटाएं' : 'Clear'}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSaveAndNext}
                className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold active:scale-95 transition-all shadow-xs cursor-pointer whitespace-nowrap"
              >
                {language === 'hi' ? 'सहेजें व अगला →' : 'Save & Next →'}
              </button>

              <button
                onClick={() => {
                  playTapSound(soundEnabled);
                  setShowSubmitConfirm(true);
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold active:scale-95 transition-all shadow-xs cursor-pointer whitespace-nowrap"
              >
                {language === 'hi' ? 'सबमिट' : 'Submit'}
              </button>
            </div>
          </div>
        </div>

        {/* Question Palette Slide-out Drawer */}
        <QuestionPaletteDrawer
          isOpen={isPaletteOpen}
          onClose={() => setIsPaletteOpen(false)}
          totalQuestions={activeTest.questions.length}
          currentIndex={currentQuestionIndex}
          statusMap={statusMap}
          onSelectQuestion={(idx) => {
            setCurrentQuestionIndex(idx);
            setStatusMap((prev) => ({
              ...prev,
              [idx]: prev[idx] === 'not-visited' ? 'not-answered' : prev[idx],
            }));
          }}
          language={language}
        />

        {/* Submit Confirmation Dialog Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 text-center shadow-2xl space-y-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                <FileCheck className="w-7 h-7" />
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {language === 'hi' ? 'क्या आप टेस्ट सबमिट करना चाहते हैं?' : 'Submit Mock Test?'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'hi'
                    ? 'सबमिट करने के बाद आप उत्तर नहीं बदल सकेंगे'
                    : 'You will not be able to change answers after final submission'}
                </p>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-xs">
                <div>
                  <span className="block font-black text-emerald-600 text-lg">
                    {answeredCount}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {language === 'hi' ? 'उत्तर दिए' : 'Answered'}
                  </span>
                </div>
                <div>
                  <span className="block font-black text-purple-600 text-lg">
                    {markedCount}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {language === 'hi' ? 'रिव्यू' : 'Review'}
                  </span>
                </div>
                <div>
                  <span className="block font-black text-rose-600 text-lg">
                    {activeTest.questions.length - answeredCount}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {language === 'hi' ? 'शेष' : 'Left'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 active:scale-95 cursor-pointer"
                >
                  {language === 'hi' ? 'वापस जाएं' : 'Resume'}
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs active:scale-95 shadow-sm cursor-pointer"
                >
                  {language === 'hi' ? 'हां, सबमिट करें' : 'Confirm Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- STEP 2: TEST SERIES LIST FOR CHOSEN EXAM ---
  if (selectedExam) {
    const availableTests = mockTests.filter((t) => t.examId === selectedExam.id);
    const testsToShow = availableTests.length > 0 ? availableTests : [mockTests[0] || MOCK_TESTS[0]];

    return (
      <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
        {/* Back and Title Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              window.history.back();
            }}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{selectedExam.icon}</span>
              <span>{selectedExam.name}</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {selectedExam.description}
            </p>
          </div>
        </div>

        {/* Test Series Cards List */}
        <div className="space-y-3.5">
          {testsToShow.map((test, idx) => (
            <div
              key={test.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-blue-400 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-md">
                      Test {idx + 1} · {test.free ? (language === 'hi' ? 'निःशुल्क (FREE)' : 'FREE') : 'PRO'}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1.5 leading-snug">
                    {test.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{test.subtitle}</p>
                </div>
              </div>

              {/* Test Meta Strip */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{test.durationMinutes} {language === 'hi' ? 'मिनट' : 'Mins'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{test.questions.length} {language === 'hi' ? 'प्रश्न' : 'Questions'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-emerald-600 font-mono">
                    {test.totalMarks} {language === 'hi' ? 'अंक' : 'Marks'}
                  </span>
                </div>
              </div>

              {/* Start Test CTA */}
              <button
                onClick={() => handleStartTest(test)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" />
                <span>{language === 'hi' ? 'टेस्ट शुरू करें (Start Test)' : 'Start Full Mock Test'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- STEP 1: EXAM CATEGORIES SELECTION (Matching Reference Screenshot!) ---
  return (
    <div className="max-w-md mx-auto px-4 py-3 pb-20">
      <div className="mb-3 text-center">
        <h2 className="text-base font-bold text-slate-900">
          {language === 'hi' ? 'मॉक टेस्ट सीरीज़ (Mock Tests)' : 'Mock Test Series'}
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {language === 'hi'
            ? 'परीक्षा चुनें और फुल लेंथ मॉक टेस्ट दें'
            : 'Select examination to start test series'}
        </p>
      </div>

      {/* 2-Column Grid Button Blocks matching the screenshot! */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map((exam) => (
          <ExamCard
            key={exam.id}
            exam={exam}
            onClick={handleSelectExam}
            soundEnabled={soundEnabled}
            testCount={mockTests.filter((t) => t.examId === exam.id).length}
          />
        ))}
      </div>
    </div>
  );
};
