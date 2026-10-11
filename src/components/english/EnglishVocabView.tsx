import React, { useState } from 'react';
import { EnglishVocabItem, EnglishProficiencyLevel, Language } from '../../types';
import { playTapSound, playCorrectSound } from '../../utils/audio';
import { 
  ArrowLeft, 
  Search, 
  Check, 
  CheckCircle2, 
  Lightbulb,
  Bookmark,
  Share2,
  Sparkles
} from 'lucide-react';

interface EnglishVocabViewProps {
  vocabList: EnglishVocabItem[];
  language: Language;
  soundEnabled: boolean;
  learnedWordIds: string[];
  onBack: () => void;
  onMarkLearned: (id: string) => void;
}

import { StorageService } from '../../services/storageService';

export const EnglishVocabView: React.FC<EnglishVocabViewProps> = ({
  vocabList,
  language,
  soundEnabled,
  learnedWordIds,
  onBack,
  onMarkLearned,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<EnglishProficiencyLevel | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = vocabList.filter((w) => {
    const matchesLevel = selectedLevel === 'all' || w.level === selectedLevel;
    const matchesSearch =
      !search ||
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      w.hindiMeaning.includes(search) ||
      w.simpleExplanation.includes(search);
    return matchesLevel && matchesSearch;
  });

  const handleToggleLearn = (item: EnglishVocabItem) => {
    playCorrectSound(soundEnabled);
    StorageService.addSeenEnglishQuestion(item.word || item.id);
    onMarkLearned(item.id);
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            playTapSound(soundEnabled);
            onBack();
          }}
          className="flex items-center gap-1.5 py-1 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'वापस' : 'Back'}</span>
        </button>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
          📖 {learnedWordIds.length} / {vocabList.length} {language === 'hi' ? 'सीखे गए' : 'Learned'}
        </span>
      </div>

      {/* Level Filters */}
      <div className="grid grid-cols-4 gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
        {[
          { id: 'all', label: 'सभी (All)' },
          { id: 'beginner', label: 'Beginner 🥉' },
          { id: 'intermediate', label: 'Medium 🥈' },
          { id: 'advanced', label: 'Advanced 🥇' },
        ].map((lvl) => (
          <button
            key={lvl.id}
            onClick={() => {
              playTapSound(soundEnabled);
              setSelectedLevel(lvl.id as EnglishProficiencyLevel | 'all');
            }}
            className={`py-1.5 rounded-xl text-center text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              selectedLevel === lvl.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {lvl.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={language === 'hi' ? 'शब्द या हिंदी अर्थ खोजें (उदा. Diligent, मेहनती)...' : 'Search word or meaning...'}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
        />
      </div>

      {/* Word Cards List */}
      <div className="space-y-3.5">
        {filtered.map((item) => {
          const isLearned = learnedWordIds.includes(item.id);

          return (
            <div
              key={item.id}
              className={`bg-white border rounded-2xl p-4 shadow-xs space-y-3 transition-all ${
                isLearned ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-slate-200/90'
              }`}
            >
              {/* Word Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      {item.word}
                    </h3>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      {item.partOfSpeech}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                      {item.level}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-emerald-700 block mt-0.5">
                    {item.hindiMeaning}
                  </span>
                </div>
              </div>

              {/* Simple Hindi Explanation as requested */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-2.5 text-xs text-blue-950 space-y-0.5">
                <span className="font-bold text-blue-700 text-[10px] uppercase tracking-wide block">
                  💡 आसान हिंदी में समझें:
                </span>
                <p className="leading-relaxed font-medium">
                  {item.simpleExplanation}
                </p>
              </div>

              {/* Example Sentence with Hindi Meaning */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs space-y-1">
                <span className="font-bold text-slate-700 text-[10px] uppercase tracking-wide block">
                  📝 उदाहरण वाक्य (Example):
                </span>
                <p className="font-semibold text-slate-900 italic">
                  "{item.exampleSentence}"
                </p>
                <p className="text-slate-600 text-[11px]">
                  अर्थ: {item.exampleSentenceHi}
                </p>
              </div>

              {/* Synonyms & Antonyms */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <span className="font-bold text-slate-700 block text-[10px]">समानार्थी (Synonyms):</span>
                  <span className="text-slate-600 font-medium">{item.synonyms.join(', ')}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block text-[10px]">विलोम (Antonyms):</span>
                  <span className="text-slate-600 font-medium">{item.antonyms.join(', ')}</span>
                </div>
              </div>

              {/* Mnemonic Memory Trick */}
              {item.mnemonicHint && (
                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 flex items-start gap-2 text-xs text-amber-950">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-amber-900">याद रखने की ट्रिक (Mnemonic): </strong>
                    <span>{item.mnemonicHint}</span>
                  </div>
                </div>
              )}

              {/* Mark as Learned Toggle Button */}
              <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                <button
                  onClick={() => handleToggleLearn(item)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                    isLearned
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isLearned ? '✓ यह शब्द सीख लिया है' : 'इस शब्द को "सीखा हुआ" मार्क करें'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
