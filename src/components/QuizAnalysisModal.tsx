import React, { useEffect } from 'react';
import { QuizAttempt, Question, Language } from '../types';
import { Trophy, CheckCircle, XCircle, Clock, RotateCcw, ArrowLeft, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizAnalysisModalProps {
  attempt: QuizAttempt;
  questions: Question[];
  language: Language;
  onRetry: () => void;
  onBackToTopics: () => void;
}

export const QuizAnalysisModal: React.FC<QuizAnalysisModalProps> = ({
  attempt,
  questions,
  language,
  onRetry,
  onBackToTopics,
}) => {
  const accuracy = attempt.totalQuestions > 0 
    ? Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100) 
    : 0;

  useEffect(() => {
    if (accuracy >= 60) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  }, [accuracy]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-b-3xl shadow-md text-center">
        <div className="w-16 h-16 mx-auto mb-3 bg-amber-400 text-amber-950 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-amber-300">
          <Trophy className="w-8 h-8 text-blue-950" />
        </div>
        <h2 className="text-xl font-black tracking-tight">
          {language === 'hi' ? 'क्विज़ विश्लेषण रिपोर्ट' : 'Quiz Analysis Report'}
        </h2>
        <p className="text-sm text-blue-200 mt-1 font-medium">
          {attempt.subjectName} · {attempt.topicName}
        </p>

        {/* Score Ring / Card */}
        <div className="mt-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 grid grid-cols-3 gap-2 divide-x divide-white/10 text-center">
          <div>
            <span className="block text-2xl font-black text-amber-300">
              {attempt.score}/{attempt.totalQuestions}
            </span>
            <span className="text-[11px] text-blue-200 font-medium">
              {language === 'hi' ? 'अंक (Score)' : 'Score'}
            </span>
          </div>
          <div>
            <span className="block text-2xl font-black text-emerald-400">
              {accuracy}%
            </span>
            <span className="text-[11px] text-blue-200 font-medium">
              {language === 'hi' ? 'सटीकता' : 'Accuracy'}
            </span>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-2xl font-black text-white">
              <Clock className="w-4 h-4 text-blue-300 inline" />
              <span>{formatTime(attempt.timeSpentSeconds)}</span>
            </div>
            <span className="text-[11px] text-blue-200 font-medium">
              {language === 'hi' ? 'समय लिया' : 'Time'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Details */}
      <div className="max-w-xl mx-auto px-4 mt-6 space-y-6">
        {/* Quick Stats Pill Strip */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
            <span className="block text-xl font-bold text-emerald-700">
              {attempt.correctAnswers}
            </span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1 mt-0.5">
              <CheckCircle className="w-3.5 h-3.5" />
              {language === 'hi' ? 'सही (Correct)' : 'Correct'}
            </span>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-center">
            <span className="block text-xl font-bold text-rose-700">
              {attempt.wrongAnswers}
            </span>
            <span className="text-xs text-rose-600 font-semibold flex items-center justify-center gap-1 mt-0.5">
              <XCircle className="w-3.5 h-3.5" />
              {language === 'hi' ? 'गलत (Wrong)' : 'Wrong'}
            </span>
          </div>

          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 text-center">
            <span className="block text-xl font-bold text-slate-700">
              {attempt.skipped}
            </span>
            <span className="text-xs text-slate-500 font-semibold mt-0.5 block">
              {language === 'hi' ? 'छोड़े गए' : 'Skipped'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{language === 'hi' ? 'दोबारा करें' : 'Re-Attempt'}</span>
          </button>
          <button
            onClick={onBackToTopics}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'hi' ? 'विषय सूची' : 'All Topics'}</span>
          </button>
        </div>

        {/* Question-by-Question Review */}
        <div className="space-y-4 pt-2">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
            {language === 'hi' ? 'प्रश्नोत्तरी समीक्षा एवं उत्तर कुंजी' : 'Detailed Question Review'}
          </h3>

          {questions.map((q, idx) => {
            const detail = attempt.details.find((d) => d.questionId === q.id);
            const userChoice = detail ? detail.selectedOption : null;
            const isCorrect = userChoice === q.correctIndex;
            const isSkipped = userChoice === null;

            const questionText = language === 'hi' ? q.questionHi : q.questionEn;
            const options = language === 'hi' ? q.optionsHi : q.optionsEn;
            const explanation = language === 'hi' ? q.explanationHi : q.explanationEn;

            return (
              <div
                key={q.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Q.{idx + 1}
                  </span>
                  <div>
                    {isSkipped ? (
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {language === 'hi' ? 'छोड़ दिया' : 'Skipped'}
                      </span>
                    ) : isCorrect ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {language === 'hi' ? 'सही (+1)' : 'Correct (+1)'}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        {language === 'hi' ? 'गलत' : 'Incorrect'}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                  {questionText}
                </p>

                {/* Options Review */}
                <div className="space-y-1.5 pt-1">
                  {options.map((opt, optIdx) => {
                    const isTheCorrectOption = optIdx === q.correctIndex;
                    const isTheUserWrongChoice = userChoice === optIdx && !isTheCorrectOption;

                    let optionStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                    if (isTheCorrectOption) {
                      optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-400';
                    } else if (isTheUserWrongChoice) {
                      optionStyle = 'bg-rose-50 border-rose-400 text-rose-950 line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`text-xs p-2.5 rounded-xl border flex items-center justify-between ${optionStyle}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] bg-white/80 border border-slate-300 shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isTheCorrectOption && (
                          <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-200/70 px-1.5 py-0.5 rounded">
                            {language === 'hi' ? 'सही उत्तर' : 'Correct'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 1-Line Crisp Explanation */}
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 flex items-start gap-2 text-xs text-amber-950">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-800">
                      {language === 'hi' ? 'व्याख्या: ' : 'Explanation: '}
                    </span>
                    <span>{explanation}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
