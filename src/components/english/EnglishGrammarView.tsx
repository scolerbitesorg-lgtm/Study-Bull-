import React, { useState } from 'react';
import { EnglishGrammarTopic, EnglishProficiencyLevel, Language, UserWrongAnswerItem } from '../../types';
import { playTapSound, playCorrectSound, playWrongSound } from '../../utils/audio';
import { 
  ArrowLeft, 
  BookOpen, 
  Check, 
  X, 
  HelpCircle, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  Award,
  ArrowRight
} from 'lucide-react';

interface EnglishGrammarViewProps {
  grammarTopics: EnglishGrammarTopic[];
  language: Language;
  soundEnabled: boolean;
  onBack: () => void;
  onLessonComplete: (topicId: string) => void;
  onRecordWrong: (item: UserWrongAnswerItem) => void;
}

export const EnglishGrammarView: React.FC<EnglishGrammarViewProps> = ({
  grammarTopics,
  language,
  soundEnabled,
  onBack,
  onLessonComplete,
  onRecordWrong,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<EnglishGrammarTopic | null>(null);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleSelectTopic = (topic: EnglishGrammarTopic) => {
    playTapSound(soundEnabled);
    setSelectedTopic(topic);
    setQuizIdx(0);
    setSelectedOpt(null);
    setQuizAnswered(false);
    setQuizCompleted(false);
  };

  const handleQuizAnswer = (idx: number) => {
    if (quizAnswered || !selectedTopic) return;
    const currentQ = selectedTopic.miniQuiz[quizIdx];
    setSelectedOpt(idx);
    setQuizAnswered(true);

    const isRight = idx === currentQ.correctIndex;
    if (isRight) {
      playCorrectSound(soundEnabled);
    } else {
      playWrongSound(soundEnabled);
      onRecordWrong({
        id: `wrong_gram_${Date.now()}`,
        type: 'grammar',
        question: `${selectedTopic.titleEn}: ${currentQ.question}`,
        correctAnswer: currentQ.options[currentQ.correctIndex],
        userAnswer: currentQ.options[idx],
        explanationHi: currentQ.explanationHi,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleNextQuiz = () => {
    playTapSound(soundEnabled);
    if (!selectedTopic) return;
    if (quizIdx + 1 < selectedTopic.miniQuiz.length) {
      setQuizIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setQuizAnswered(false);
    } else {
      setQuizCompleted(true);
      onLessonComplete(selectedTopic.id);
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
            if (selectedTopic) {
              setSelectedTopic(null);
            } else {
              onBack();
            }
          }}
          className="flex items-center gap-1.5 py-1 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{selectedTopic ? 'सभी नियम' : 'वापस'}</span>
        </button>
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl">
          ⚖️ {grammarTopics.length} {language === 'hi' ? 'विषय उपलब्ध' : 'Topics'}
        </span>
      </div>

      {/* TOPIC SELECTION LIST (If not inside a topic) */}
      {!selectedTopic ? (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] font-black uppercase text-amber-300">
              संपूर्ण व्याकरण मास्टरक्लास
            </span>
            <h2 className="text-base font-black mt-0.5">
              Tenses, Voice, Narration & 100 Rules
            </h2>
            <p className="text-[11px] text-indigo-100 font-medium mt-0.5">
              प्रत्येक टॉपिक में आसान हिंदी व्याख्या, सही-गलत वाक्य और अंत में प्रैक्टिस क्विज!
            </p>
          </div>

          <div className="space-y-2.5">
            {grammarTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleSelectTopic(topic)}
                className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 text-left shadow-xs hover:border-indigo-300 active:scale-98 transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {topic.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                      {topic.level}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-700 transition-colors">
                    {topic.titleHi}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {topic.titleEn}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 flex items-center justify-center shrink-0 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* SELECTED TOPIC DETAIL VIEW */
        <div className="space-y-4 animate-in fade-in">
          {/* Topic Header Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                {selectedTopic.category}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                {selectedTopic.level}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 leading-snug">
              {selectedTopic.titleHi}
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              {selectedTopic.titleEn}
            </p>

            {/* Concept Explanation Box */}
            <div className="mt-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3 text-xs text-indigo-950 space-y-1">
              <span className="font-bold text-indigo-800 text-[11px] block">
                📖 कॉन्सेप्ट व नियम (आसान हिंदी में):
              </span>
              <p className="leading-relaxed font-medium">
                {selectedTopic.conceptHi}
              </p>
            </div>
          </div>

          {/* Golden Rules List */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider px-1">
              मुख्य नियम व परीक्षा ट्रैप्स ({selectedTopic.rules.length}):
            </h3>

            {selectedTopic.rules.map((rule, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {rule.ruleTitle}
                  </h4>
                </div>

                <p className="text-xs text-slate-600 font-medium pl-1">
                  {rule.explanationHi}
                </p>

                {/* Wrong vs Right */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-start gap-1.5 text-rose-700">
                    <span className="font-bold shrink-0">✕ गलत:</span>
                    <span className="line-through">{rule.wrongSentence}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-emerald-700">
                    <span className="font-bold shrink-0">✓ सही:</span>
                    <span className="font-semibold">{rule.correctSentence}</span>
                  </div>
                </div>

                {/* Exam Trap */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-xs text-amber-950 flex items-start gap-1.5">
                  <span className="font-bold text-amber-800 shrink-0">★ परीक्षा ट्रैप:</span>
                  <span>{rule.examTrapHi}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Embedded Mini Practice Quiz for Lesson */}
          {selectedTopic.miniQuiz.length > 0 && !quizCompleted && (
            <div className="bg-white border-2 border-indigo-200 rounded-3xl p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  अध्याय अभ्यास क्विज
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  Q {quizIdx + 1} / {selectedTopic.miniQuiz.length}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {selectedTopic.miniQuiz[quizIdx].question}
              </h4>

              <div className="space-y-2">
                {selectedTopic.miniQuiz[quizIdx].options.map((opt, optIdx) => {
                  let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';

                  if (quizAnswered) {
                    if (optIdx === selectedTopic.miniQuiz[quizIdx].correctIndex) {
                      btnStyle = 'bg-emerald-500 border-emerald-600 text-white shadow-md animate-[greenPulse_0.6s_ease-out]';
                    } else if (optIdx === selectedOpt) {
                      btnStyle = 'bg-rose-500 border-rose-600 text-white shadow-md animate-[shake_0.5s_ease-in-out]';
                    } else {
                      btnStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleQuizAnswer(optIdx)}
                      disabled={quizAnswered}
                      className={`w-full py-2.5 px-3.5 rounded-xl border text-xs font-bold text-left transition-all active:scale-95 cursor-pointer flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {quizAnswered && optIdx === selectedTopic.miniQuiz[quizIdx].correctIndex && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                      {quizAnswered && optIdx === selectedOpt && optIdx !== selectedTopic.miniQuiz[quizIdx].correctIndex && (
                        <X className="w-4 h-4 text-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              {quizAnswered && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-2 animate-in fade-in">
                  <p>
                    <strong>व्याख्या:</strong> {selectedTopic.miniQuiz[quizIdx].explanationHi}
                  </p>
                  <button
                    onClick={handleNextQuiz}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{quizIdx + 1 < selectedTopic.miniQuiz.length ? 'अगला सवाल' : 'अध्याय पूरा करें'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Lesson Completed Card */}
          {quizCompleted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-center space-y-2 animate-in fade-in">
              <Award className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-black text-emerald-900">
                बधाई! यह लेसन सफलतापूर्वक पूरा हुआ।
              </h3>
              <p className="text-xs text-emerald-700 font-medium">
                आपकी प्रगति सेव कर ली गई है। +25 पॉइंट्स जोड़े गए!
              </p>
              <button
                onClick={() => setSelectedTopic(null)}
                className="mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
              >
                अन्य व्याकरण विषय देखें
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
