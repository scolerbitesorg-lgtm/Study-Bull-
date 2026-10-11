import React from 'react';
import { EnglishSubModule, Language } from '../../types';
import { playTapSound } from '../../utils/audio';

interface EnglishMenuGridProps {
  onSelectModule: (module: EnglishSubModule) => void;
  language: Language;
  soundEnabled: boolean;
  userScore: number;
  wordsLearnedCount: number;
  sentencesCount: number;
  vocabCount: number;
  spellingCount: number;
  mcqCount: number;
  typingCount: number;
  grammarCount: number;
  storiesCount: number;
  revisionCount: number;
}

export const EnglishMenuGrid: React.FC<EnglishMenuGridProps> = ({
  onSelectModule,
  language,
  soundEnabled,
  userScore,
  wordsLearnedCount,
  sentencesCount,
  vocabCount,
  spellingCount,
  mcqCount,
  typingCount,
  grammarCount,
  storiesCount,
  revisionCount,
}) => {
  const handleTap = (mod: EnglishSubModule) => {
    playTapSound(soundEnabled);
    onSelectModule(mod);
  };

  const modules = [
    {
      id: 'sentences' as EnglishSubModule,
      icon: '🗣️',
      title: language === 'hi' ? 'Basic Sentences' : 'Daily Sentences',
      subtitle: language === 'hi' ? 'दैनिक बोलचाल के वाक्य' : 'Conversational Phrases',
      badge: `${sentencesCount} वाक्य`,
      badgeColor: 'bg-blue-950/80 text-blue-300 border border-blue-800/80 font-bold',
    },
    {
      id: 'vocabulary' as EnglishSubModule,
      icon: '📖',
      title: language === 'hi' ? 'Vocabulary' : 'Word Mastery',
      subtitle: language === 'hi' ? 'हिंदी अर्थ व निमोनिक ट्रिक्स' : 'Mnemonics & Synonyms',
      badge: `${vocabCount} शब्द (${wordsLearnedCount} सीखे)`,
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-bold',
    },
    {
      id: 'spelling' as EnglishSubModule,
      icon: '✍️',
      title: language === 'hi' ? 'Words Writing' : 'Spelling Practice',
      subtitle: language === 'hi' ? 'Pneumonia जैसी कठिन Spelling' : 'Tough Words Writing',
      badge: `${spellingCount} कठिन शब्द`,
      badgeColor: 'bg-amber-950/80 text-amber-300 border border-amber-800/80 font-bold',
    },
    {
      id: 'mcq' as EnglishSubModule,
      icon: '🎯',
      title: language === 'hi' ? 'Hindi to Eng MCQ' : 'Translation MCQ',
      subtitle: language === 'hi' ? 'हिंदी से अंग्रेजी बहुविकल्पीय' : '4 Option Translation',
      badge: `${mcqCount} प्रश्न`,
      badgeColor: 'bg-purple-950/80 text-purple-300 border border-purple-800/80 font-bold',
    },
    {
      id: 'typing' as EnglishSubModule,
      icon: '⌨️',
      title: language === 'hi' ? 'Sentence Typing' : 'Type in English',
      subtitle: language === 'hi' ? 'वाक्य खुद टाइप करने का अभ्यास' : 'Direct Translation',
      badge: `${typingCount} वाक्य`,
      badgeColor: 'bg-sky-950/80 text-sky-300 border border-sky-800/80 font-bold',
    },
    {
      id: 'grammar' as EnglishSubModule,
      icon: '⚖️',
      title: language === 'hi' ? 'Complete Grammar' : 'Grammar Rules',
      subtitle: language === 'hi' ? 'Tenses व 100 गोल्डन नियम' : 'Concepts & SSC Traps',
      badge: `${grammarCount} विषय/नियम`,
      badgeColor: 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 font-bold',
    },
    {
      id: 'reading' as EnglishSubModule,
      icon: '📚',
      title: language === 'hi' ? 'Reading Practice' : 'Story Reading',
      subtitle: language === 'hi' ? 'कहानियां व पैराग्राफ्स' : 'Stories & Paragraphs',
      badge: `${storiesCount} कहानियां`,
      badgeColor: 'bg-teal-950/80 text-teal-300 border border-teal-800/80 font-bold',
    },
    {
      id: 'revision' as EnglishSubModule,
      icon: '🔄',
      title: language === 'hi' ? 'Revision Centre' : 'Revision Centre',
      subtitle: language === 'hi' ? 'गलत सवाल व सेव किए गए शब्द' : 'Mistakes & Saved Words',
      badge: `${revisionCount} रिविजन सवाल`,
      badgeColor: 'bg-rose-950/80 text-rose-300 border border-rose-800/80 font-bold',
    },
    {
      id: 'progress' as EnglishSubModule,
      icon: '📊',
      title: language === 'hi' ? 'My Progress' : 'My Progress',
      subtitle: language === 'hi' ? 'सीखे गए शब्द, स्कोर व स्तर' : 'Levels & Analytics',
      badge: `${userScore} स्कोर • ${wordsLearnedCount} सीखे`,
      badgeColor: 'bg-amber-950/80 text-amber-300 border border-amber-800/80 font-bold',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Motivational Tagline Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-lg border border-blue-800/60 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
            {language === 'hi' ? '★ आसान हिंदी में संपूर्ण अंग्रेजी' : '★ Step-by-Step English Mastery'}
          </span>
          <h2 className="text-base font-black tracking-tight mt-0.5 text-white">
            {language === 'hi' ? 'अंग्रेजी सीखें और सुधारें' : 'Master English Communication'}
          </h2>
          <p className="text-[11px] text-blue-200 font-medium mt-0.5">
            {language === 'hi'
              ? 'बेसिक वाक्यों से लेकर कठिन स्पेलिंग व नियमों तक सब कुछ'
              : 'Beginner to Advanced with interactive writing & speaking'}
          </p>
        </div>
        <div className="text-3xl filter drop-shadow-md shrink-0 ml-2">
          🎓
        </div>
      </div>

      {/* 2-Column Grid Button Blocks */}
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
        {modules.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTap(item.id)}
            type="button"
            className="relative flex flex-col items-center justify-center p-4 sm:p-4.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-lg hover:border-blue-500/60 active:scale-95 active:bg-slate-800 transition-all duration-150 cursor-pointer min-h-[128px] select-none text-center w-full group overflow-hidden"
          >
            {/* Top Right Green Active Indicator Dot */}
            <div className="absolute top-3 right-3 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-950 group-hover:scale-125 transition-transform block shadow-xs shadow-emerald-500/50" />
            </div>

            {/* Center Big Colorful Icon */}
            <div className="text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-150 mt-0.5">
              {item.icon}
            </div>

            {/* Title & Subtitle */}
            <div className="mt-2 text-center px-1">
              <span className="block text-xs sm:text-sm font-extrabold text-slate-100 group-hover:text-blue-400 tracking-tight leading-snug">
                {item.title}
              </span>
              <span className="block text-[11px] text-slate-400 font-medium mt-0.5 leading-tight">
                {item.subtitle}
              </span>
            </div>

            {/* Small Bottom Tag */}
            <div className="mt-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                {item.badge}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
