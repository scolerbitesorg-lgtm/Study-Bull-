import React, { useEffect, useState } from 'react';
import { MainSection, Language, HomeCustomModule } from '../types';
import { playTapSound } from '../utils/audio';
import { FirestoreService } from '../firebase/firestoreService';
import { StorageService } from '../services/storageService';
import { MOCK_TESTS, PDF_NOTES_LIBRARY, TYPING_PASSAGES, QUESTIONS_DATABASE } from '../data/mockData';

interface MainMenuProps {
  onSelectSection: (section: MainSection) => void;
  onSelectCustomModule: (module: HomeCustomModule) => void;
  language: Language;
  soundEnabled: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onSelectSection,
  onSelectCustomModule,
  language,
  soundEnabled,
}) => {
  // Cache-first initial state: Instant zero-latency render on refresh!
  const [customModules, setCustomModules] = useState<HomeCustomModule[]>(() =>
    StorageService.getCachedHomeCustomModules()
  );
  const [activeNotice, setActiveNotice] = useState<HomeCustomModule | null>(null);

  useEffect(() => {
    if (activeNotice) {
      window.history.pushState({ notice: true }, '', '#/notice');
      const handlePop = () => setActiveNotice(null);
      window.addEventListener('popstate', handlePop);
      return () => window.removeEventListener('popstate', handlePop);
    }
  }, [activeNotice]);

  // Cached counts for immediate real data display without 1-2s delay
  const [counts, setCounts] = useState(() => StorageService.getCachedCounts());

  useEffect(() => {
    let pendingCounts = { ...StorageService.getCachedCounts() };
    let updateTimer: NodeJS.Timeout | null = null;
    const scheduleCountUpdate = (partial: Partial<typeof counts>) => {
      pendingCounts = { ...pendingCounts, ...partial };
      if (updateTimer) clearTimeout(updateTimer);
      updateTimer = setTimeout(() => {
        setCounts(pendingCounts);
        StorageService.saveCachedCounts(pendingCounts);
      }, 80);
    };

    const unsubscribeCustom = FirestoreService.subscribeHomeCustomModules((modules) => {
      setCustomModules(modules || []);
      if (modules) {
        StorageService.saveCachedHomeCustomModules(modules);
      }
    });

    const unsubQuiz = FirestoreService.subscribeQuestions((list) => {
      scheduleCountUpdate({ quizTotal: list.length });
    });

    const unsubMock = FirestoreService.subscribeMockTests((list) => {
      scheduleCountUpdate({ mock: list.length });
    });

    const unsubNotes = FirestoreService.subscribeNotes((list) => {
      scheduleCountUpdate({ notes: list.length });
    });

    const unsubPassages = FirestoreService.subscribeTypingPassages((list) => {
      scheduleCountUpdate({ passages: list.length });
    });

    const unsubMcq = FirestoreService.subscribeEnglishMcq((list) => {
      scheduleCountUpdate({ mcq: list.length });
    });
    const unsubSpell = FirestoreService.subscribeEnglishSpelling((list) => {
      scheduleCountUpdate({ spelling: list.length });
    });
    const unsubSent = FirestoreService.subscribeEnglishSentences((list) => {
      scheduleCountUpdate({ sentences: list.length });
    });
    const unsubVocab = FirestoreService.subscribeEnglishVocab((list) => {
      scheduleCountUpdate({ vocab: list.length });
    });
    const unsubTyping = FirestoreService.subscribeEnglishTyping((list) => {
      scheduleCountUpdate({ typing: list.length });
    });
    const unsubGrammar = FirestoreService.subscribeEnglishGrammar((list) => {
      scheduleCountUpdate({ grammar: list.length });
    });
    const unsubStories = FirestoreService.subscribeEnglishStories((list) => {
      scheduleCountUpdate({ stories: list.length });
    });

    return () => {
      if (updateTimer) clearTimeout(updateTimer);
      unsubscribeCustom();
      unsubQuiz();
      unsubMock();
      unsubNotes();
      unsubPassages();
      unsubMcq();
      unsubSpell();
      unsubSent();
      unsubVocab();
      unsubTyping();
      unsubGrammar();
      unsubStories();
    };
  }, []);

  const totalEnglishItems =
    counts.mcq +
    counts.spelling +
    counts.sentences +
    counts.vocab +
    counts.typing +
    counts.grammar +
    counts.stories;

  const handleTap = (section: MainSection) => {
    playTapSound(soundEnabled);
    onSelectSection(section);
  };

  const handleCustomTap = (mod: HomeCustomModule) => {
    playTapSound(soundEnabled);
    if (mod.actionType === 'link' && mod.actionTarget) {
      window.open(mod.actionTarget, '_blank');
    } else if (mod.actionType === 'section' && mod.actionTarget) {
      onSelectSection(mod.actionTarget as MainSection);
    } else if (mod.actionType === 'notice') {
      setActiveNotice(mod);
    } else {
      // Seamlessly open in-app page just like any other button (no cut/close popup!)
      onSelectCustomModule(mod);
    }
  };

  const menuItems = [
    {
      id: 'quiz' as MainSection,
      icon: '⚡',
      title: language === 'hi' ? 'Quiz अभ्यास' : 'Quiz Practice',
      subtitle: language === 'hi' ? `${counts.quizTotal} विषयवार MCQs` : `${counts.quizTotal} Subject MCQs`,
    },
    {
      id: 'mock' as MainSection,
      icon: '📝',
      title: language === 'hi' ? 'Mock टेस्ट' : 'Mock Tests',
      subtitle: language === 'hi' ? `${counts.mock} लाइव टाइमर टेस्ट` : `${counts.mock} Live Series`,
    },
    {
      id: 'notes' as MainSection,
      icon: '📚',
      title: language === 'hi' ? 'Notes लाइब्रेरी' : 'PDF Notes',
      subtitle: language === 'hi' ? `${counts.notes} स्पष्ट PDF नोट्स` : `${counts.notes} Clear Reading`,
    },
    {
      id: 'typing' as MainSection,
      icon: '⌨️',
      title: language === 'hi' ? 'Typing Skills' : 'Typing Test',
      subtitle: language === 'hi' ? `${counts.passages} SSC DEST पैसेज` : `${counts.passages} Passages`,
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
      subtitle: language === 'hi' ? `${totalEnglishItems} प्रश्न व शब्द` : `${totalEnglishItems} Practice Items`,
    },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-4 flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
      {/* 2-Column Grid Button Blocks */}
      <div className="w-full grid grid-cols-2 gap-3 sm:gap-3.5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTap(item.id)}
            type="button"
            className="relative flex flex-col items-center justify-center p-4 sm:p-4.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 active:scale-95 active:bg-blue-50/60 active:border-blue-400 active:shadow-inner transition-all duration-150 cursor-pointer min-h-[110px] select-none text-center w-full group"
          >
            {/* Top Right Green Active Indicator Dot */}
            <div className="absolute top-3 right-3 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 group-hover:scale-110 transition-transform block" />
            </div>

            {/* Center Big Colorful Icon */}
            <div className="text-3xl filter drop-shadow-xs group-hover:scale-110 transition-transform duration-150 mt-0.5">
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

        {/* Dynamic Admin-Added Custom Home Modules & Buttons (Styling perfectly unified with standard buttons) */}
        {customModules
          .filter(
            (mod) =>
              !['quiz', 'mock', 'notes', 'typing', 'calculations', 'english', 'btn_quiz', 'btn_mock', 'btn_notes', 'btn_typing', 'btn_calculations', 'btn_english'].includes(mod.id)
          )
          .map((mod) => {
            const secCount = mod.subSections?.length || mod.nestedButtons?.length || 0;
            return (
              <button
                key={mod.id}
                onClick={() => handleCustomTap(mod)}
                type="button"
                className="relative flex flex-col items-center justify-center p-4 sm:p-4.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 active:scale-95 active:bg-blue-50/60 active:border-blue-400 active:shadow-inner transition-all duration-150 cursor-pointer min-h-[110px] select-none text-center w-full group"
              >
                {/* Top Right Green Active Indicator Dot */}
                <div className="absolute top-3 right-3 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 group-hover:scale-110 transition-transform block" />
                </div>

                {/* Center Big Colorful Icon */}
                <div className="text-3xl filter drop-shadow-xs group-hover:scale-110 transition-transform duration-150 mt-0.5">
                  {mod.icon || '⭐'}
                </div>

                {/* Title & Subtitle */}
                <div className="mt-2 text-center px-1">
                  <span className="block text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-700 tracking-tight leading-snug">
                    {language === 'hi' ? mod.titleHi || mod.title : mod.title}
                  </span>
                  <span className="block text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">
                    {language === 'hi'
                      ? mod.subtitleHi || mod.subtitle || `${secCount > 0 ? `${secCount} सेक्शन्स` : 'विशेष अभ्यास'}`
                      : mod.subtitle || `${secCount > 0 ? `${secCount} Sections` : 'Special Feature'}`}
                  </span>
                </div>
              </button>
            );
          })}
      </div>

      {/* Admin Notice / Custom Module Popup Modal */}
      {activeNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center relative animate-scale-up">
            <div className="text-4xl mb-3">{activeNotice.icon || '📌'}</div>
            <h3 className="text-lg font-bold text-slate-800">
              {language === 'hi' ? activeNotice.titleHi || activeNotice.title : activeNotice.title}
            </h3>
            <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">
              {language === 'hi'
                ? activeNotice.subtitleHi || activeNotice.subtitle
                : activeNotice.subtitle}
            </p>
            {activeNotice.actionTarget && activeNotice.actionType === 'link' && (
              <a
                href={activeNotice.actionTarget}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block w-full py-2.5 px-4 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-colors"
              >
                {language === 'hi' ? 'आगे बढ़ें / लिंक खोलें' : 'Open Link'}
              </a>
            )}
            <button
              onClick={() => setActiveNotice(null)}
              className="mt-3 w-full py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
            >
              {language === 'hi' ? 'बंद करें' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
