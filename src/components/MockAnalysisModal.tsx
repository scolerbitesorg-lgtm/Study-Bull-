import React, { useEffect } from 'react';
import { MockAttempt, MockTest, Language } from '../types';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Award, 
  RotateCcw, 
  ArrowLeft,
  ChevronDown,
  Lightbulb
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MockAnalysisModalProps {
  attempt: MockAttempt;
  mockTest: MockTest;
  language: Language;
  onRetry: () => void;
  onBackToSeries: () => void;
}

export const MockAnalysisModal: React.FC<MockAnalysisModalProps> = ({
  attempt,
  mockTest,
  language,
  onRetry,
  onBackToSeries,
}) => {
  const percentage = Math.round((attempt.scoreObtained / attempt.totalMarks) * 100);

  useEffect(() => {
    if (percentage >= 50) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  }, [percentage]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 animate-in fade-in duration-200">
      {/* Top Banner with Score */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-6 rounded-b-3xl shadow-lg text-center">
        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-2xl flex items-center justify-center text-blue-950 shadow-xl border border-amber-300">
          <Trophy className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-black tracking-tight">
          {language === 'hi' ? 'मॉक टेस्ट स्कोर कार्ड एवं विश्लेषण' : 'Mock Test Scorecard & Analysis'}
        </h1>
        <p className="text-xs text-blue-200 mt-1 font-medium">
          {mockTest.title}
        </p>

        {/* Primary Score Board */}
        <div className="mt-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 grid grid-cols-3 gap-2 divide-x divide-white/10">
          <div>
            <span className="block text-2xl font-black text-amber-300 font-mono">
              {attempt.scoreObtained.toFixed(2)}
            </span>
            <span className="text-[11px] text-blue-200 font-medium">
              / {attempt.totalMarks} {language === 'hi' ? 'कुल अंक' : 'Marks'}
            </span>
          </div>

          <div>
            <span className="block text-2xl font-black text-emerald-400 font-mono">
              {attempt.accuracy}%
            </span>
            <span className="text-[11px] text-blue-200 font-medium">
              {language === 'hi' ? 'सटीकता (Accuracy)' : 'Accuracy'}
            </span>
          </div>

          <div>
            <span className="block text-2xl font-black text-blue-200 font-mono">
              {formatTime(attempt.timeSpentSeconds)}
            </span>
            <span className="text-[11px] text-blue-200 font-medium">
              {language === 'hi' ? 'समय लिया' : 'Time Taken'}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Container */}
      <div className="max-w-xl mx-auto px-4 mt-6 space-y-6">
        {/* Negative Marking Breakdown Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            <span>{language === 'hi' ? 'नेगेटिव मार्किंग विवरण' : 'Marks Calculation Breakdown'}</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
              <span className="block font-black text-emerald-700 text-lg">
                {attempt.correctCount}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold block">
                {language === 'hi' ? 'सही प्रश्न' : 'Correct'}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                +{attempt.correctCount * mockTest.positiveMarks} marks
              </span>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5">
              <span className="block font-black text-rose-700 text-lg">
                {attempt.wrongCount}
              </span>
              <span className="text-[11px] text-rose-600 font-semibold block">
                {language === 'hi' ? 'गलत प्रश्न' : 'Incorrect'}
              </span>
              <span className="text-[10px] text-rose-700 font-bold mt-1 block">
                -{(attempt.wrongCount * mockTest.negativeMarks).toFixed(2)} marks
              </span>
            </div>

            <div className="bg-slate-100 border border-slate-200 rounded-xl p-2.5">
              <span className="block font-black text-slate-700 text-lg">
                {attempt.unattemptedCount}
              </span>
              <span className="text-[11px] text-slate-600 font-semibold block">
                {language === 'hi' ? 'छोड़े गए' : 'Unattempted'}
              </span>
              <span className="text-[10px] text-slate-500 font-bold mt-1 block">
                0 marks
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5">
              <span className="block font-black text-blue-700 text-lg">
                {Math.min(99.4, Math.max(15, percentage + 12)).toFixed(1)}%
              </span>
              <span className="text-[11px] text-blue-600 font-semibold block">
                {language === 'hi' ? 'अनुमानित पर्सेंटाइल' : 'Est. Percentile'}
              </span>
              <span className="text-[10px] text-blue-700 font-bold mt-1 block">
                Rank ~142
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{language === 'hi' ? 'पुनः टेस्ट दें' : 'Re-Attempt Test'}</span>
          </button>
          <button
            onClick={onBackToSeries}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'hi' ? 'टेस्ट सूची' : 'Test Series List'}</span>
          </button>
        </div>

        {/* Detailed Solution Key Review */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-sm font-bold text-slate-900">
              {language === 'hi' ? 'प्रश्नवार हल एवं उत्तर कुंजी' : 'Question Solution Key'}
            </h2>
            <span className="text-xs text-slate-500">
              {mockTest.questions.length} {language === 'hi' ? 'प्रश्न' : 'Questions'}
            </span>
          </div>

          {mockTest.questions.map((q, idx) => {
            const userChoice = attempt.answers[idx] ?? null;
            const isCorrect = userChoice === q.correctIndex;
            const isUnattempted = userChoice === null;

            const questionText = language === 'hi' ? q.questionHi : q.questionEn;
            const options = language === 'hi' ? q.optionsHi : q.optionsEn;
            const explanation = language === 'hi' ? q.explanationHi : q.explanationEn;

            return (
              <div
                key={q.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    Q.{idx + 1}
                  </span>
                  <div>
                    {isUnattempted ? (
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {language === 'hi' ? 'प्रयास नहीं किया' : 'Not Attempted'}
                      </span>
                    ) : isCorrect ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        +{mockTest.positiveMarks} marks
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        -{mockTest.negativeMarks} marks
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
                    const isCorrectAnswer = optIdx === q.correctIndex;
                    const isUserPick = userChoice === optIdx;

                    let style = 'bg-slate-50 border-slate-200 text-slate-700';
                    if (isCorrectAnswer) {
                      style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-1 ring-emerald-300';
                    } else if (isUserPick && !isCorrectAnswer) {
                      style = 'bg-rose-50 border-rose-400 text-rose-950 line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`text-xs p-2.5 rounded-xl border flex items-center justify-between ${style}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-white border border-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isCorrectAnswer && (
                          <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-200/80 px-1.5 py-0.5 rounded">
                            {language === 'hi' ? 'सही उत्तर' : 'Correct'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-2.5 flex items-start gap-2 text-xs text-amber-950">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900">
                      {language === 'hi' ? 'समाधान: ' : 'Solution: '}
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
