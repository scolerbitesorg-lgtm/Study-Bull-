import React, { useEffect, useState } from 'react';
import { MainSection, Language, HomeCustomModule } from '../types';
import { playTapSound } from '../utils/audio';
import { FirestoreService } from '../firebase/firestoreService';
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
  const [customModules, setCustomModules] = useState<HomeCustomModule[]>([]);
  const [activeNotice, setActiveNotice] = useState<HomeCustomModule | null>(null);

  // Real data counts from Firestore
  const [counts, setCounts] = useState({
    mcq: 25,
    spelling: 25,
    sentences: 25,
    vocab: 25,
    typing: 25,
    grammar: 12,
    stories: 8,
    mock: MOCK_TESTS.length,
    notes: PDF_NOTES_LIBRARY.length,
    passages: TYPING_PASSAGES.length,
    quizTotal: QUESTIONS_DATABASE.length,
  });

  useEffect(() => {
    const unsubscribeCustom = FirestoreService.subscribeHomeCustomModules((modules) => {
      setCustomModules(modules);
    });

    const unsubMcq = FirestoreService.subscribeEnglishMcq((list) => {
      setCounts((prev) => ({ ...prev, mcq: list.length }));
    });
    const unsubSpell = FirestoreService.subscribeEnglishSpelling((list) => {
      setCounts((prev) => ({ ...prev, spelling: list.length }));
    });
    const unsubSent = FirestoreService.subscribeEnglishSentences((list) => {
      setCounts((prev) => ({ ...prev, sentences: list.length }));
    });
    const unsubVocab = FirestoreService.subscribeEnglishVocab((list) => {
      setCounts((prev) => ({ ...prev, vocab: list.length }));
    });
    const unsubTyping = FirestoreService.subscribeEnglishTyping((list) => {
      setCounts((prev) => ({ ...prev, typing: list.length }));
    });
    const unsubGrammar = FirestoreService.subscribeEnglishGrammar((list) => {
      setCounts((prev) => ({ ...prev, grammar: list.length }));
    });
    const unsubStories = FirestoreService.subscribeEnglishStories((list) => {
      setCounts((prev) => ({ ...prev, stories: list.length }));
    });

    return () => {
      unsubscribeCustom();
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
      countBadge: `${counts.quizTotal} प्रश्न`,
    },
    {
      id: 'mock' as MainSection,
      icon: '📝',
      title: language === 'hi' ? 'Mock टेस्ट' : 'Mock Tests',
      subtitle: language === 'hi' ? `${counts.mock} लाइव टाइमर टेस्ट` : `${counts.mock} Live Series`,
      countBadge: `${counts.mock} टेस्ट`,
    },
    {
      id: 'notes' as MainSection,
      icon: '📚',
      title: language === 'hi' ? 'Notes लाइब्रेरी' : 'PDF Notes',
      subtitle: language === 'hi' ? `${counts.notes} स्पष्ट PDF नोट्स` : `${counts.notes} Clear Reading`,
      countBadge: `${counts.notes} नोट्स`,
    },
    {
      id: 'typing' as MainSection,
      icon: '⌨️',
      title: language === 'hi' ? 'Typing Skills' : 'Typing Test',
      subtitle: language === 'hi' ? `${counts.passages} SSC DEST पैसेज` : `${counts.passages} Passages`,
      countBadge: `${counts.passages} पैसेज`,
    },
    {
      id: 'calculations' as MainSection,
      icon: '🧮',
      title: language === 'hi' ? 'Calculations' : 'Math Speed',
      subtitle: language === 'hi' ? 'BODMAS व ट्रिक्स' : 'BODMAS & Tricks',
      countBadge: 'असीमित ड्रिल',
    },
    {
      id: 'english' as MainSection,
      icon: '🔤',
      title: language === 'hi' ? 'English Improve' : 'English Booster',
      subtitle: language === 'hi' ? `${totalEnglishItems} प्रश्न व शब्द` : `${totalEnglishItems} Practice Items`,
      countBadge: `${totalEnglishItems} आइटम`,
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
            className="relative flex flex-col items-center justify-center p-4 sm:p-4.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 active:scale-95 active:bg-blue-50/60 active:border-blue-400 active:shadow-inner transition-all duration-150 cursor-pointer min-h-[124px] select-none text-center w-full group"
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

            {/* Bottom Real Count Pill */}
            <div className="mt-1.5">
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                {item.countBadge}
              </span>
            </div>
          </button>
        ))}

        {/* Dynamic Admin-Added Custom Home Modules & Buttons (Styling perfectly unified with standard buttons) */}
        {customModules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => handleCustomTap(mod)}
            type="button"
            className="relative flex flex-col items-center justify-center p-4 sm:p-4.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 active:scale-95 active:bg-blue-50/60 active:border-blue-400 active:shadow-inner transition-all duration-150 cursor-pointer min-h-[124px] select-none text-center w-full group"
          >
            {/* Top Right Green Active Indicator Dot */}
            <div className="absolute top-3 right-3 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 group-hover:scale-110 transition-transform block" />
            </div>

            {/* Center Big Colorful Icon */}
            <div className="text-3xl filter drop-shadow-xs group-hover:scale-110 transition-transform duration-150 mt-1">
              {mod.icon || '⭐'}
            </div>

            {/* Title & Subtitle */}
            <div className="mt-2 text-center px-1">
              <span className="block text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-700 tracking-tight leading-snug">
                {language === 'hi' ? mod.titleHi || mod.title : mod.title}
              </span>
              <span className="block text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">
                {language === 'hi' ? mod.subtitleHi || mod.subtitle || 'विशेष अभ्यास' : mod.subtitle || 'Special Feature'}
              </span>
            </div>

            {/* Bottom Real Count / Badge Pill */}
            <div className="mt-1.5">
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                {mod.badge ? mod.badge : mod.actionType === 'code' ? 'विशेष टूल' : mod.actionType === 'nested_buttons' ? 'सब-बटन' : 'लाइव'}
              </span>
            </div>
          </button>
        ))}
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
