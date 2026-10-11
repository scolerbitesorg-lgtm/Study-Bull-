import React, { useState } from 'react';
import { EnglishSentenceItem, EnglishProficiencyLevel, Language } from '../../types';
import { playTapSound, playCorrectSound, playWrongSound } from '../../utils/audio';
import { 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  Sparkles, 
  Search,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

interface EnglishSentencesViewProps {
  sentences: EnglishSentenceItem[];
  language: Language;
  soundEnabled: boolean;
  onBack: () => void;
  onRecordPractice: () => void;
}

import { StorageService } from '../../services/storageService';

export const EnglishSentencesView: React.FC<EnglishSentencesViewProps> = ({
  sentences,
  language,
  soundEnabled,
  onBack,
  onRecordPractice,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<EnglishProficiencyLevel | 'all'>('all');
  const [search, setSearch] = useState('');
  const [activePracticeId, setActivePracticeId] = useState<string | null>(null);
  const [userPracticeAnswer, setUserPracticeAnswer] = useState('');
  const [practiceFeedback, setPracticeFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [practicedIds, setPracticedIds] = useState<Set<string>>(new Set());

  const seenSet = StorageService.getSeenEnglishQuestions();

  const filtered = sentences.filter((s) => {
    const matchesLevel = selectedLevel === 'all' || s.level === selectedLevel;
    const matchesSearch =
      !search ||
      s.english.toLowerCase().includes(search.toLowerCase()) ||
      s.hindi.includes(search) ||
      s.situation.toLowerCase().includes(search.toLowerCase());
    return matchesLevel && matchesSearch;
  }).sort((a, b) => {
    const aSeen = seenSet.has((a.english || a.id).toLowerCase());
    const bSeen = seenSet.has((b.english || b.id).toLowerCase());
    if (aSeen === bSeen) return 0;
    return aSeen ? 1 : -1;
  });

  const handlePracticeSubmit = (sentence: EnglishSentenceItem) => {
    if (!userPracticeAnswer.trim()) return;
    const cleanUser = userPracticeAnswer.trim().toLowerCase().replace(/[.,!?'"]/g, '');
    const cleanTarget = sentence.english.toLowerCase().replace(/[.,!?'"]/g, '');

    StorageService.addSeenEnglishQuestion(sentence.english || sentence.id);

    const isMatch = cleanUser === cleanTarget;
    if (isMatch) {
      playCorrectSound(soundEnabled);
      setPracticeFeedback({
        correct: true,
        message: 'अद्भुत! आपने बिल्कुल सही वाक्य लिखा।',
      });
      setPracticedIds((prev) => new Set(prev).add(sentence.id));
      onRecordPractice();
    } else {
      playWrongSound(soundEnabled);
      setPracticeFeedback({
        correct: false,
        message: `सही वाक्य: "${sentence.english}"`,
      });
    }
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">
      {/* Top Header */}
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
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl">
          🗣️ {filtered.length} {language === 'hi' ? 'वाक्य उपलब्ध' : 'Sentences'}
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
          placeholder={language === 'hi' ? 'स्थिति या वाक्य खोजें (उदा. metro, greeting)...' : 'Search situation or phrase...'}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
        />
      </div>

      {/* Sentence Cards List */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const isPracticing = activePracticeId === item.id;
          const isDone = practicedIds.has(item.id);

          return (
            <div
              key={item.id}
              className={`bg-white border rounded-2xl p-4 shadow-xs space-y-3 transition-all ${
                isDone ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-slate-200/90'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      {item.situation}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                      {item.level}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                    {item.english}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-800">
                    {item.hindi}
                  </p>
                </div>
              </div>

              {/* Phonetic Pronunciation in Hindi */}
              {item.audioPronunciation && (
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl flex items-center gap-2 border border-slate-100">
                  <span className="font-bold text-slate-500">उच्चारण:</span>
                  <span className="font-medium text-slate-800">{item.audioPronunciation}</span>
                </div>
              )}

              {/* Learning Tip */}
              {item.tip && (
                <div className="text-[11px] text-amber-900 bg-amber-50/80 p-2 rounded-xl flex items-start gap-1.5 border border-amber-200/60">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{item.tip}</span>
                </div>
              )}

              {/* Practice Test Toggle Button */}
              <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                <button
                  onClick={() => {
                    playTapSound(soundEnabled);
                    if (isPracticing) {
                      setActivePracticeId(null);
                      setPracticeFeedback(null);
                      setUserPracticeAnswer('');
                    } else {
                      setActivePracticeId(item.id);
                      setPracticeFeedback(null);
                      setUserPracticeAnswer('');
                    }
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isPracticing ? 'अभ्यास बंद करें' : 'खुद बोलकर/लिखकर अभ्यास करें'}</span>
                </button>

                {isDone && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>पूरा हुआ</span>
                  </span>
                )}
              </div>

              {/* Interactive Sentence Typing Practice Drawer */}
              {isPracticing && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 animate-in fade-in">
                  <label className="text-xs font-bold text-slate-700 block">
                    हिंदी: "{item.hindi}" ➔ अंग्रेजी में लिखें:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userPracticeAnswer}
                      onChange={(e) => setUserPracticeAnswer(e.target.value)}
                      placeholder="Type English sentence here..."
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handlePracticeSubmit(item)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold active:scale-95 cursor-pointer shadow-xs"
                    >
                      जांचें
                    </button>
                  </div>

                  {practiceFeedback && (
                    <div
                      className={`p-2.5 rounded-xl text-xs font-semibold flex items-start gap-1.5 ${
                        practiceFeedback.correct
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 animate-[greenPulse_0.6s_ease-out]'
                          : 'bg-rose-100 text-rose-900 border border-rose-300 animate-[shake_0.5s_ease-in-out]'
                      }`}
                    >
                      {practiceFeedback.correct ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      ) : (
                        <HelpCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                      )}
                      <span>{practiceFeedback.message}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
