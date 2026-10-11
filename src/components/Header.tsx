import React from 'react';
import { MainSection, Language } from '../types';
import { Volume2, VolumeX, ArrowLeft, Home, Settings } from 'lucide-react';
import { Logo } from './Logo';
import { playTapSound } from '../utils/audio';

interface HeaderProps {
  currentSection: MainSection;
  onBackToMenu: () => void;
  onBackStep?: () => void;
  backLabel?: string;
  language: Language;
  onToggleLanguage: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  onBackToMenu,
  onBackStep,
  backLabel,
  language,
  onToggleLanguage,
  soundEnabled,
  onToggleSound,
  onOpenAdmin,
}) => {
  const getSectionTitle = () => {
    if (currentSection === 'quiz') return language === 'hi' ? 'Quiz (अभ्यास)' : 'Quiz Practice';
    if (currentSection === 'mock') return language === 'hi' ? 'Mock (टेस्ट)' : 'Mock Tests';
    if (currentSection === 'notes') return language === 'hi' ? 'Notes (PDF)' : 'PDF Notes';
    if (currentSection === 'typing') return language === 'hi' ? 'Typing Skills' : 'Typing Test';
    if (currentSection === 'calculations') return language === 'hi' ? 'Calculations' : 'Math Booster';
    if (currentSection === 'english') return language === 'hi' ? 'English Improve' : 'English Booster';
    return 'Study Bull';
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-md">
      <div className="max-w-md mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        {/* Left Side Navigation Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {currentSection !== 'menu' ? (
            <div className="flex items-center gap-1.5 shrink-0">
              {/* FIXED "BACK TO MENU" (मुख्य मेन्यू) BUTTON AT THE VERY TOP */}
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundEnabled);
                  onBackToMenu();
                }}
                title={language === 'hi' ? 'मुख्य मेन्यू पर जाएं' : 'Go to Main Menu'}
                className="flex items-center gap-1 py-1 px-2.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-amber-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer border border-amber-300 select-none shrink-0"
              >
                <Home className="w-3.5 h-3.5 shrink-0" />
                <span className="leading-none whitespace-nowrap">
                  {language === 'hi' ? 'मुख्य मेन्यू' : 'Back to Menu'}
                </span>
              </button>

              {/* ONE-STEP BACK BUTTON (IF INSIDE A SUB-FOLDER / SUB-MODULE) */}
              {onBackStep && (
                <button
                  type="button"
                  onClick={() => {
                    playTapSound(soundEnabled);
                    onBackStep();
                  }}
                  title={backLabel || (language === 'hi' ? 'एक कदम पीछे' : 'Back')}
                  className="flex items-center gap-1 py-1 px-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs rounded-xl border border-white/20 transition-all cursor-pointer select-none shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                  <span className="leading-none whitespace-nowrap hidden xs:inline">
                    {backLabel || (language === 'hi' ? 'पीछे' : 'Back')}
                  </span>
                </button>
              )}

              {/* Current Section Title */}
              <span className="text-xs sm:text-sm font-bold text-blue-100 tracking-tight ml-0.5 truncate max-w-[110px] sm:max-w-none">
                {getSectionTitle()}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              {/* Study Bull Mascot Logo */}
              <Logo size="md" />
              <div>
                <span className="text-base font-black tracking-tight text-white leading-none block">
                  Study Bull
                </span>
                <span className="text-[10px] text-blue-200 font-medium leading-none mt-0.5 block">
                  {language === 'hi' ? 'परीक्षा पोर्टल' : 'Exam Portal'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Admin Panel Button */}
          {onOpenAdmin && (
            <button
              onClick={() => {
                playTapSound(soundEnabled);
                onOpenAdmin();
              }}
              title={language === 'hi' ? 'एडमिन पोर्टल (बटन व सेक्शन प्रबंधन)' : 'Admin Panel (Buttons & Sections)'}
              className="w-8 h-8 flex items-center justify-center bg-amber-400 hover:bg-amber-300 text-amber-950 border border-amber-300 rounded-xl font-bold active:scale-90 transition-all cursor-pointer shadow-xs"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              onToggleLanguage();
            }}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white active:scale-90 transition-all cursor-pointer"
          >
            {language === 'hi' ? 'EN' : 'हिन्दी'}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              playTapSound(!soundEnabled);
            }}
            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white active:scale-90 transition-all cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
