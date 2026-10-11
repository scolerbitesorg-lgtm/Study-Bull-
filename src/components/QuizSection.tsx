import React, { useState, useEffect } from 'react';
import { Subject, Topic, Question, Language, QuizAttempt } from '../types';
import { SUBJECTS, TOPICS, QUESTIONS_DATABASE } from '../data/mockData';
import { FirestoreService } from '../firebase/firestoreService';
import { QuizAnalysisModal } from './QuizAnalysisModal';
import { playTapSound, playCorrectSound, playWrongSound } from '../utils/audio';
import { StorageService } from '../services/storageService';
import { 
  ArrowLeft, 
  Bookmark, 
  Lightbulb, 
  ChevronRight, 
  CheckCircle, 
  Flame,
  HelpCircle,
  Share2
} from 'lucide-react';

interface QuizSectionProps {
  language: Language;
  soundEnabled: boolean;
  onNavigateHome: () => void;
  preselectedSubjectId?: string;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  language,
  soundEnabled,
  onNavigateHome,
  preselectedSubjectId,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>(SUBJECTS);

  const getSubjectTotalQuestions = (subjectId: string) => {
    const topics = TOPICS[subjectId] || [];
    const topicIds = new Set(topics.map((t) => t.id));
    return QUESTIONS_DATABASE.filter(
      (q) => q.subjectId === subjectId || (q.topicId && topicIds.has(q.topicId))
    ).length;
  };

  useEffect(() => {
    const unsub = FirestoreService.subscribeSubjects((list) => {
      if (list && list.length > 0) setSubjects(list);
    });
    return () => unsub();
  }, []);

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(() => {
    if (preselectedSubjectId) {
      return SUBJECTS.find((s) => s.id === preselectedSubjectId) || null;
    }
    return null;
  });
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Active Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userSelections, setUserSelections] = useState<Record<number, number | null>>({});
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<Record<number, boolean>>({});
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [completedAttempt, setCompletedAttempt] = useState<QuizAttempt | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>(() => StorageService.getBookmarks());
  const [lastClickedOption, setLastClickedOption] = useState<{ qIndex: number; optIndex: number; isCorrect: boolean } | null>(null);

  // Live generated questions pool state
  const [dynamicQuestionsMap, setDynamicQuestionsMap] = useState<Record<string, Question[]>>({});

  // Background silent Gemini AI quiz question generator
  const fetchLiveQuizQuestions = async (subjectId: string, topicId: string) => {
    try {
      const key = `${subjectId}_${topicId}`;
      const existing = dynamicQuestionsMap[key] || [];
      const res = await fetch('/api/ai/generate-quiz-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          topicId,
          count: 10,
          existingQuestions: existing.map((q) => q.questionHi || q.questionEn),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
          setDynamicQuestionsMap((prev) => ({
            ...prev,
            [key]: [...(prev[key] || []), ...data.questions],
          }));
        }
      }
    } catch {
      // Fail silently, no UI errors
    }
  };

  // Get active questions for the topic with non-repeating seen prioritization
  const getTopicQuestions = (topic: Topic): Question[] => {
    const key = `${topic.subjectId}_${topic.id}`;
    const baseList = QUESTIONS_DATABASE.filter(
      (q) => q.topicId === topic.id || q.subjectId === topic.subjectId
    );
    const liveList = dynamicQuestionsMap[key] || [];
    const combined = [...baseList, ...liveList];

    const seenSet = StorageService.getSeenEnglishQuestions();
    const unseen: Question[] = [];
    const seen: Question[] = [];

    for (const q of combined) {
      const qKey = (q.questionHi || q.questionEn || q.id || '').trim().toLowerCase();
      if (seenSet.has(qKey)) {
        seen.push(q);
      } else {
        unseen.push(q);
      }
    }

    const result = unseen.length > 0 ? unseen : seen;
    return result.length > 0 ? result : QUESTIONS_DATABASE.slice(0, 5);
  };

  const handleSelectSubject = (subject: Subject) => {
    playTapSound(soundEnabled);
    setSelectedSubject(subject);
    setSelectedTopic(null);
  };

  const handleStartTopicQuiz = (topic: Topic) => {
    playTapSound(soundEnabled);
    setSelectedTopic(topic);
    setCurrentQuestionIndex(0);
    setUserSelections({});
    setIsAnswerRevealed({});
    setCompletedAttempt(null);
    setQuizStartTime(Date.now());

    // Trigger silent background Gemini generation for live fresh questions
    fetchLiveQuizQuestions(topic.subjectId, topic.id);
  };

  const handleOptionClick = (optionIndex: number, currentQ: Question) => {
    if (isAnswerRevealed[currentQuestionIndex]) return; // already answered

    StorageService.addSeenEnglishQuestion(currentQ.questionHi || currentQ.questionEn || currentQ.id);

    const isCorrect = optionIndex === currentQ.correctIndex;
    if (isCorrect) {
      playCorrectSound(soundEnabled);
    } else {
      playWrongSound(soundEnabled);
    }

    setLastClickedOption({
      qIndex: currentQuestionIndex,
      optIndex: optionIndex,
      isCorrect,
    });

    setUserSelections((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));

    setIsAnswerRevealed((prev) => ({
      ...prev,
      [currentQuestionIndex]: true,
    }));
  };

  const handleToggleBookmark = (questionId: string) => {
    playTapSound(soundEnabled);
    const isNow = StorageService.toggleBookmark(questionId);
    setBookmarks(StorageService.getBookmarks());
  };

  const handleSubmitQuiz = (questions: Question[]) => {
    playTapSound(soundEnabled);
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - quizStartTime) / 1000));
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    const details = questions.map((q, idx) => {
      const choice = userSelections[idx] ?? null;
      if (choice === null) {
        skipped++;
        return { questionId: q.id, selectedOption: null, isCorrect: false };
      }
      if (choice === q.correctIndex) {
        correct++;
        return { questionId: q.id, selectedOption: choice, isCorrect: true };
      }
      wrong++;
      return { questionId: q.id, selectedOption: choice, isCorrect: false };
    });

    const attempt: QuizAttempt = {
      topicId: selectedTopic?.id || '',
      topicName: selectedTopic?.name || 'Topic Quiz',
      subjectName: selectedSubject?.name || 'Subject',
      totalQuestions: questions.length,
      correctAnswers: correct,
      wrongAnswers: wrong,
      skipped,
      score: correct,
      timeSpentSeconds,
      date: new Date().toLocaleDateString(),
      details,
    };

    StorageService.saveQuizAttempt(attempt);
    setCompletedAttempt(attempt);
  };

  // --- STEP 4: ANALYSIS REPORT MODAL ---
  if (completedAttempt && selectedTopic) {
    const questions = getTopicQuestions(selectedTopic);
    return (
      <QuizAnalysisModal
        attempt={completedAttempt}
        questions={questions}
        language={language}
        onRetry={() => handleStartTopicQuiz(selectedTopic)}
        onBackToTopics={() => {
          setSelectedTopic(null);
          setCompletedAttempt(null);
        }}
      />
    );
  }

  // --- STEP 3: INTERACTIVE MCQ PRACTICE PAGE ---
  if (selectedSubject && selectedTopic) {
    const questions = getTopicQuestions(selectedTopic);
    const currentQ = questions[currentQuestionIndex] || questions[0];
    const isAnswered = isAnswerRevealed[currentQuestionIndex] || false;
    const selectedOption = userSelections[currentQuestionIndex] ?? null;
    const isBookmarked = bookmarks.includes(currentQ.id);

    const questionText = language === 'hi' ? currentQ.questionHi : currentQ.questionEn;
    const options = language === 'hi' ? currentQ.optionsHi : currentQ.optionsEn;
    const explanation = language === 'hi' ? currentQ.explanationHi : currentQ.explanationEn;

    return (
      <div className="max-w-2xl mx-auto px-4 py-4 pb-24">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              setSelectedTopic(null);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'hi' ? 'टॉपिक्स' : 'Topics'}</span>
          </button>

          <div className="text-center">
            <span className="text-xs font-extrabold text-blue-700 block">
              {language === 'hi' ? selectedTopic.nameHi : selectedTopic.name}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {language === 'hi' ? selectedSubject.nameHi : selectedSubject.name}
            </span>
          </div>

          <button
            onClick={() => handleToggleBookmark(currentQ.id)}
            className={`p-2 rounded-xl border transition-all active:scale-95 ${
              isBookmarked
                ? 'bg-amber-50 border-amber-300 text-amber-600'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title="Bookmark Question"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* Progress Bar & Question Counter */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 mb-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span>
              {language === 'hi' ? 'प्रश्न' : 'Question'} {currentQuestionIndex + 1}{' '}
              <span className="text-slate-400 font-normal">/ {questions.length}</span>
            </span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {Object.values(userSelections).filter((val, i) => val === questions[i]?.correctIndex).length}
              </span>
              <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-mono">
                {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs mb-4">
          <div className="flex items-start gap-2.5 mb-3">
            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              Q
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {questionText}
            </h2>
          </div>

          {/* 4 Options Grid */}
          <div className="space-y-3 mt-4">
            {options.map((opt, optIndex) => {
              const isSelected = selectedOption === optIndex;
              const isCorrectAnswer = optIndex === currentQ.correctIndex;

              // Animation and styling conditions
              let optionStyle =
                'bg-white border-slate-200 text-slate-800 hover:border-blue-300 hover:bg-slate-50';
              let isLastTriggeredPulse = false;
              let isLastTriggeredShake = false;

              if (isAnswered) {
                if (isCorrectAnswer) {
                  // Sahi option: Green pulse animation
                  optionStyle =
                    'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400/40 shadow-sm';
                  if (lastClickedOption?.qIndex === currentQuestionIndex && lastClickedOption?.optIndex === optIndex) {
                    isLastTriggeredPulse = true;
                  }
                } else if (isSelected && !isCorrectAnswer) {
                  // Galat option: Red shake animation
                  optionStyle =
                    'bg-rose-50 border-rose-500 text-rose-950 font-semibold ring-2 ring-rose-400/40 shadow-sm';
                  if (lastClickedOption?.qIndex === currentQuestionIndex && lastClickedOption?.optIndex === optIndex) {
                    isLastTriggeredShake = true;
                  }
                } else {
                  optionStyle = 'bg-slate-50/70 border-slate-200/60 text-slate-400 opacity-70';
                }
              }

              return (
                <button
                  key={optIndex}
                  onClick={() => handleOptionClick(optIndex, currentQ)}
                  disabled={isAnswered}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all duration-150 flex items-center justify-between cursor-pointer active:scale-98 ${optionStyle} ${
                    isLastTriggeredPulse ? 'animate-green-pulse' : ''
                  } ${isLastTriggeredShake ? 'animate-shake' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${
                        isAnswered && isCorrectAnswer
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : isAnswered && isSelected && !isCorrectAnswer
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {String.fromCharCode(65 + optIndex)}
                    </span>
                    <span className="text-sm font-medium leading-relaxed pr-2">{opt}</span>
                  </div>

                  {isAnswered && isCorrectAnswer && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                      ✓ {language === 'hi' ? 'सही' : 'Correct'}
                    </span>
                  )}
                  {isAnswered && isSelected && !isCorrectAnswer && (
                    <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full shrink-0">
                      ✕ {language === 'hi' ? 'गलत' : 'Wrong'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 1-Line Crisp Explanation Banner right below as requested */}
          {isAnswered && (
            <div className="mt-5 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-950 text-xs sm:text-sm animate-in fade-in duration-200 flex items-start gap-2.5 shadow-2xs">
              <div className="p-1.5 rounded-lg bg-amber-200 text-amber-800 shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 fill-amber-500 text-amber-600" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-amber-900 block mb-0.5">
                  {language === 'hi' ? 'परीक्षा विशेष तथ्य (Exam Fact):' : 'Key Exam Fact:'}
                </span>
                <p className="leading-relaxed font-medium">{explanation}</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Toolbar */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
            }}
            disabled={currentQuestionIndex === 0}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
              currentQuestionIndex === 0
                ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-95 cursor-pointer shadow-2xs'
            }`}
          >
            {language === 'hi' ? '← पिछला' : '← Previous'}
          </button>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={() => {
                playTapSound(soundEnabled);
                setCurrentQuestionIndex((prev) => prev + 1);
              }}
              className="py-2.5 px-6 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center gap-1"
            >
              <span>{language === 'hi' ? 'अगला प्रश्न' : 'Next Question'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleSubmitQuiz(questions)}
              className="py-2.5 px-6 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <span>{language === 'hi' ? 'क्विज़ सबमिट करें' : 'Submit Quiz'}</span>
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- STEP 2: TOPICS / CHAPTERS SELECTION FOR SUBJECT ---
  if (selectedSubject) {
    const topics = TOPICS[selectedSubject.id] || [];

    return (
      <div className="max-w-2xl mx-auto px-4 py-4 pb-20">
        {/* Back button and Subject Title */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              setSelectedSubject(null);
            }}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{selectedSubject.icon}</span>
              <span>{language === 'hi' ? selectedSubject.nameHi : selectedSubject.name}</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {language === 'hi'
                ? 'अभ्यास के लिए अध्याय चुनें'
                : 'Select a Chapter/Topic to Practice'}
            </p>
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-3">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleStartTopicQuiz(topic)}
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-left shadow-xs hover:border-blue-400 active:scale-98 active:bg-blue-50/50 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-900 group-hover:text-blue-700 block leading-tight">
                  {language === 'hi' ? topic.nameHi : topic.name}
                </span>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{getTopicQuestions(topic).length} {language === 'hi' ? 'प्रश्न' : 'Questions'}</span>
                  <span>·</span>
                  <span
                    className={`font-semibold ${
                      topic.difficulty === 'Easy'
                        ? 'text-emerald-600'
                        : topic.difficulty === 'Moderate'
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {topic.difficulty}
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-500 flex items-center justify-center transition-colors shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- STEP 1: SUBJECTS SELECTION GRID ---
  return (
    <div className="max-w-md mx-auto px-4 py-3 pb-20">
      <div className="mb-3 text-center">
        <h2 className="text-base font-bold text-slate-900">
          {language === 'hi' ? 'विषयवार MCQ अभ्यास (Quiz)' : 'Subject-Wise Practice Quizzes'}
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {language === 'hi'
            ? 'विषय चुनें और 4-विकल्प वाले प्रश्नों का अभ्यास करें'
            : 'Select a subject to practice 4-option MCQs'}
        </p>
      </div>

      {/* Subjects Grid (2-column colorful button blocks with green dot & tap animation) */}
      <div className="grid grid-cols-2 gap-3">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => handleSelectSubject(subject)}
            type="button"
            className="relative flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 active:scale-95 active:bg-blue-50/60 active:border-blue-400 active:shadow-inner transition-all duration-150 cursor-pointer min-h-[110px] select-none text-left w-full group"
          >
            {/* Top Right Green Dot Indicator */}
            <div className="absolute top-3 right-3 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 group-hover:scale-110 transition-transform" />
            </div>

            {/* Subject Center Icon */}
            <div className="text-3xl filter drop-shadow-xs group-hover:scale-105 transition-transform duration-150 mt-1">
              {subject.icon}
            </div>

            {/* Subject Title */}
            <div className="mt-2.5 text-center px-1">
              <span className="block text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-700 tracking-tight leading-snug">
                {language === 'hi' ? subject.nameHi : subject.name}
              </span>
              <span className="block text-[11px] text-slate-500 font-medium mt-0.5">
                {getSubjectTotalQuestions(subject.id)} {language === 'hi' ? 'प्रश्न' : 'Questions'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
