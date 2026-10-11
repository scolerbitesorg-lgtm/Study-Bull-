import React from 'react';
import { MainSection, Language } from '../types';
import { playTapSound } from '../utils/audio';

interface MainMenuProps {
  onSelectSection: (section: MainSection) => void;
  language: Language;
  soundEnabled: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onSelectSection,
  language,
  soundEnabled,
}) => {
  const handleTap = (section: MainSection) => {
    playTapSound(soundEnabled);
    onSelectSection(section);
  };

  const menuItems = [
    {
      id: 'quiz' as MainSection,
      icon: '⚡',
      title: language === 'hi' ? 'Quiz अभ्यास' : 'Quiz Practice',
      subtitle: language === 'hi' ? 'विषयवार MCQs' : 'Subject MCQs',
    },
    {
      id: 'mock' as MainSection,
      icon: '📝',
      title: language === 'hi' ? 'Mock टेस्ट' : 'Mock Tests',
      subtitle: language === 'hi' ? 'लाइव टाइमर टेस्ट' : 'Real Timer Series',
    },
    {
      id: 'notes' as MainSection,
      icon: '📚',
      title: language === 'hi' ? 'Notes लाइब्रेरी' : 'PDF Notes',
      subtitle: language === 'hi' ? 'स्पष्ट इन-ऐप नोट्स' : 'Clear Reading',
    },
    {
      id: 'typing' as MainSection,
      icon: '⌨️',
      title: language === 'hi' ? 'Typing Skills' : 'Typing Test',
      subtitle: language === 'hi' ? 'SSC DEST स्पीड' : 'Speed Simulator',
    },
    {
      id: 'calculations' as MainSection,
      icon: '🧮',
      title: language === 'hi' ? 'Calculations' : 'Math Speed',
      subtitle: language === 'hi' ? 'BODMAS व ट्रिक्स' : 'BODMAS & Tricks',
    },
    {
      id: 'english' as MainSection,
      icon: '🔤',
      title: language === 'hi' ? 'English Improve' : 'English Booster',
      subtitle: language === 'hi' ? 'शब्दावली व व्याकरण' : 'Vocab & Rules',
    },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-4 flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
      {/* 2-Column Grid Button Blocks (Side by Side matching the screenshot style) */}
      <div className="w-full grid grid-cols-2 gap-3 sm:gap-3.5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTap(item.id)}
            type="button"
            className="relative flex flex-col items-center justify-center p-4 sm:p-4.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 active:scale-95 active:bg-blue-50/60 active:border-blue-400 active:shadow-inner transition-all duration-150 cursor-pointer min-h-[118px] select-none text-center w-full group"
          >
            {/* Top Right Green Active Indicator Dot */}
            <div className="absolute top-3 right-3 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 group-hover:scale-110 transition-transform block" />
            </div>

            {/* Center Big Colorful Icon */}
            <div className="text-3xl filter drop-shadow-xs group-hover:scale-110 transition-transform duration-150 mt-1">
              {item.icon}
            </div>

            {/* Title & Subtitle */}
            <div className="mt-2 text-center px-1">
              <span className="block text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-700 tracking-tight leading-snug">
                {item.title}
              </span>
              <span className="block text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">
                {item.subtitle}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
