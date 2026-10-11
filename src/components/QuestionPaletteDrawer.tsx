import React from 'react';
import { QuestionStatus, Language } from '../types';
import { X, CheckCircle2, Circle, HelpCircle, Bookmark } from 'lucide-react';

interface QuestionPaletteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  totalQuestions: number;
  currentIndex: number;
  statusMap: Record<number, QuestionStatus>;
  onSelectQuestion: (index: number) => void;
  language: Language;
}

export const QuestionPaletteDrawer: React.FC<QuestionPaletteDrawerProps> = ({
  isOpen,
  onClose,
  totalQuestions,
  currentIndex,
  statusMap,
  onSelectQuestion,
  language,
}) => {
  if (!isOpen) return null;

  // Counts for each status
  let answeredCount = 0;
  let notAnsweredCount = 0;
  let markedReviewCount = 0;
  let notVisitedCount = 0;

  for (let i = 0; i < totalQuestions; i++) {
    const status = statusMap[i] || 'not-visited';
    if (status === 'answered') answeredCount++;
    else if (status === 'not-answered') notAnsweredCount++;
    else if (status === 'marked-review') markedReviewCount++;
    else notVisitedCount++;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Palette Drawer Modal */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl z-10 overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              {language === 'hi' ? 'प्रश्न पैलेट (Question Palette)' : 'Question Palette'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {language === 'hi' ? 'किसी भी प्रश्न पर सीधे जाएं' : 'Jump to any question instantly'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 active:scale-90 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Legend Strip */}
        <div className="grid grid-cols-2 gap-2 p-3.5 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
              {answeredCount}
            </span>
            <span className="text-slate-700 font-medium truncate">
              {language === 'hi' ? 'उत्तर दिया' : 'Answered'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
              {notAnsweredCount}
            </span>
            <span className="text-slate-700 font-medium truncate">
              {language === 'hi' ? 'उत्तर नहीं दिया' : 'Not Answered'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
              {markedReviewCount}
            </span>
            <span className="text-slate-700 font-medium truncate">
              {language === 'hi' ? 'समीक्षा हेतु (Review)' : 'Marked for Review'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-slate-200 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
              {notVisitedCount}
            </span>
            <span className="text-slate-700 font-medium truncate">
              {language === 'hi' ? 'नहीं देखा' : 'Not Visited'}
            </span>
          </div>
        </div>

        {/* Question Numbers Grid */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5">
            {Array.from({ length: totalQuestions }).map((_, idx) => {
              const status = statusMap[idx] || 'not-visited';
              const isCurrent = currentIndex === idx;

              let style = 'bg-slate-100 text-slate-700 border-slate-200';
              if (status === 'answered') {
                style = 'bg-emerald-600 text-white border-emerald-700 font-bold';
              } else if (status === 'not-answered') {
                style = 'bg-rose-600 text-white border-rose-700 font-bold';
              } else if (status === 'marked-review') {
                style = 'bg-purple-600 text-white border-purple-700 font-bold';
              }

              return (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectQuestion(idx);
                    onClose();
                  }}
                  className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all active:scale-90 cursor-pointer shadow-2xs ${style} ${
                    isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : ''
                  }`}
                >
                  <span>{idx + 1}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Close */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl active:scale-98 transition-all cursor-pointer"
          >
            {language === 'hi' ? 'वापस टेस्ट पर जाएं' : 'Close Palette'}
          </button>
        </div>
      </div>
    </div>
  );
};
