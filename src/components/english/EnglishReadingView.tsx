import React, { useState } from 'react';
import { EnglishStoryItem, EnglishProficiencyLevel, Language } from '../../types';
import { playTapSound, playCorrectSound, playWrongSound } from '../../utils/audio';
import { 
  ArrowLeft, 
  BookOpen, 
  Languages, 
  Check, 
  X, 
  ArrowRight, 
  Clock,
  Sparkles
} from 'lucide-react';

interface EnglishReadingViewProps {
  stories: EnglishStoryItem[];
  language: Language;
  soundEnabled: boolean;
  onBack: () => void;
  onLessonComplete: (storyId: string) => void;
}

export const EnglishReadingView: React.FC<EnglishReadingViewProps> = ({
  stories,
  language,
  soundEnabled,
  onBack,
  onLessonComplete,
}) => {
  const [selectedStory, setSelectedStory] = useState<EnglishStoryItem | null>(null);
  const [showHindi, setShowHindi] = useState(false);
  const [compIdx, setCompIdx] = useState(0);
  const [selectedCompOpt, setSelectedCompOpt] = useState<number | null>(null);
  const [compAnswered, setCompAnswered] = useState(false);

  const handleSelectStory = (s: EnglishStoryItem) => {
    playTapSound(soundEnabled);
    setSelectedStory(s);
    setShowHindi(false);
    setCompIdx(0);
    setSelectedCompOpt(null);
    setCompAnswered(false);
  };

  const handleCompAnswer = (idx: number) => {
    if (compAnswered || !selectedStory) return;
    const currentQ = selectedStory.comprehensionQuestions[compIdx];
    setSelectedCompOpt(idx);
    setCompAnswered(true);

    if (idx === currentQ.correctIndex) {
      playCorrectSound(soundEnabled);
    } else {
      playWrongSound(soundEnabled);
    }
  };

  const handleNextComp = () => {
    playTapSound(soundEnabled);
    if (!selectedStory) return;
    if (compIdx + 1 < selectedStory.comprehensionQuestions.length) {
      setCompIdx((prev) => prev + 1);
      setSelectedCompOpt(null);
      setCompAnswered(false);
    } else {
      onLessonComplete(selectedStory.id);
      playCorrectSound(soundEnabled);
    }
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            playTapSound(soundEnabled);
            if (selectedStory) {
              setSelectedStory(null);
            } else {
              onBack();
            }
          }}
          className="flex items-center gap-1.5 py-1 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{selectedStory ? 'कहानियां' : 'वापस'}</span>
        </button>
        <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-xl">
          📚 {stories.length} {language === 'hi' ? 'पाठ उपलब्ध' : 'Stories'}
        </span>
      </div>

      {/* STORY LIST VIEW */}
      {!selectedStory ? (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-teal-700 to-emerald-800 text-white rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] font-black uppercase text-amber-300">
              रीडिंग कॉम्प्रिहेंशन प्रैक्टिस
            </span>
            <h2 className="text-base font-black mt-0.5">
              कहानियां, पैराग्राफ्स व हिंदी अनुवाद
            </h2>
            <p className="text-[11px] text-teal-100 font-medium mt-0.5">
              अंग्रेजी पढ़ने की आदत बनाएं, कठिन शब्दों के अर्थ सीखें और बोध प्रश्न हल करें।
            </p>
          </div>

          <div className="space-y-2.5">
            {stories.map((story) => (
              <button
                key={story.id}
                onClick={() => handleSelectStory(story)}
                className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 text-left shadow-xs hover:border-teal-300 active:scale-98 transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                      {story.level}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 inline" />
                      {story.estimatedMinutes} min read
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                    {story.titleEn}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {story.titleHi}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-teal-50 text-slate-400 group-hover:text-teal-600 flex items-center justify-center shrink-0 transition-colors">
                  <BookOpen className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* STORY READER DETAIL VIEW */
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {selectedStory.titleEn}
                </h2>
                <p className="text-xs font-semibold text-teal-700">
                  {selectedStory.titleHi}
                </p>
              </div>

              {/* Hindi Toggle & Audio Button */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowHindi(!showHindi)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    showHindi
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title="Toggle Hindi Translation"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>{showHindi ? 'हिंदी चालू' : 'हिंदी अनुवाद'}</span>
                </button>
              </div>
            </div>

            {/* Paragraphs with vocabulary helpers */}
            <div className="space-y-4 pt-2">
              {selectedStory.paragraphs.map((para, idx) => (
                <div key={idx} className="space-y-2 border-b border-slate-100 pb-3 last:border-b-0">
                  <p className="text-sm text-slate-800 leading-relaxed font-serif">
                    {para.english}
                  </p>

                  {/* Hindi Translation under paragraph */}
                  {showHindi && (
                    <p className="text-xs text-teal-900 bg-teal-50/70 p-2.5 rounded-xl font-medium leading-relaxed animate-in fade-in">
                      {para.hindi}
                    </p>
                  )}

                  {/* Vocabulary Notes in this paragraph */}
                  {para.vocabNotes && para.vocabNotes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {para.vocabNotes.map((v, vIdx) => (
                        <span
                          key={vIdx}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200"
                        >
                          <strong>{v.word}:</strong> {v.meaning}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Reading Comprehension Questions */}
          {selectedStory.comprehensionQuestions.length > 0 && (
            <div className="bg-white border-2 border-teal-200 rounded-3xl p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                  कॉम्प्रिहेंशन क्विज (Comprehension Check)
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  Q {compIdx + 1} / {selectedStory.comprehensionQuestions.length}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {selectedStory.comprehensionQuestions[compIdx].question}
              </h4>

              <div className="space-y-2">
                {selectedStory.comprehensionQuestions[compIdx].options.map((opt, optIdx) => {
                  let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';

                  if (compAnswered) {
                    if (optIdx === selectedStory.comprehensionQuestions[compIdx].correctIndex) {
                      btnStyle = 'bg-emerald-500 border-emerald-600 text-white shadow-md animate-[greenPulse_0.6s_ease-out]';
                    } else if (optIdx === selectedCompOpt) {
                      btnStyle = 'bg-rose-500 border-rose-600 text-white shadow-md animate-[shake_0.5s_ease-in-out]';
                    } else {
                      btnStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleCompAnswer(optIdx)}
                      disabled={compAnswered}
                      className={`w-full py-2.5 px-3.5 rounded-xl border text-xs font-bold text-left transition-all active:scale-95 cursor-pointer flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {compAnswered && optIdx === selectedStory.comprehensionQuestions[compIdx].correctIndex && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                      {compAnswered && optIdx === selectedCompOpt && optIdx !== selectedStory.comprehensionQuestions[compIdx].correctIndex && (
                        <X className="w-4 h-4 text-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              {compAnswered && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-2 animate-in fade-in">
                  <p>
                    <strong>व्याख्या:</strong> {selectedStory.comprehensionQuestions[compIdx].explanationHi}
                  </p>
                  <button
                    onClick={handleNextComp}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>
                      {compIdx + 1 < selectedStory.comprehensionQuestions.length ? 'अगला सवाल' : 'कहानी पूरी हुई'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
