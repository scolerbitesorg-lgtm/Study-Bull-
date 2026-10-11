import React from 'react';
import { ExamCategory } from '../types';
import { playTapSound } from '../utils/audio';

interface ExamCardProps {
  exam: ExamCategory;
  onClick: (exam: ExamCategory) => void;
  soundEnabled?: boolean;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam, onClick, soundEnabled = true }) => {
  const handleClick = () => {
    playTapSound(soundEnabled);
    onClick(exam);
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className="relative flex flex-col items-center justify-center p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 active:scale-95 active:bg-blue-50/60 active:border-blue-400 active:shadow-inner transition-all duration-150 cursor-pointer min-h-[110px] sm:min-h-[124px] select-none text-left w-full group"
    >
      {/* Top right indicator exactly as in the reference screenshot */}
      <div className="absolute top-3 right-3 flex items-center justify-center">
        {exam.active ? (
          <span 
            className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 group-hover:scale-110 transition-transform" 
            title="Active Test Available"
          />
        ) : (
          <span className="text-[10px] font-bold tracking-wider text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded-md uppercase">
            {exam.badge || 'SOON'}
          </span>
        )}
      </div>

      {/* Center Icon */}
      <div className="text-3xl sm:text-4xl filter drop-shadow-xs group-hover:scale-105 transition-transform duration-150 mt-1">
        {exam.icon}
      </div>

      {/* Title below icon */}
      <div className="mt-2.5 text-center px-1">
        <span className="block text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-700 tracking-tight leading-snug">
          {exam.name}
        </span>
        {exam.active && (
          <span className="block text-[11px] text-slate-600 font-medium mt-0.5">
            {exam.testCount} Tests
          </span>
        )}
      </div>
    </button>
  );
};
