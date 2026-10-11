import React, { useState } from 'react';
import { UserWrongAnswerItem, EnglishVocabItem, Language } from '../../types';
import { playTapSound, playCorrectSound, playWrongSound } from '../../utils/audio';
import { 
  ArrowLeft, 
  RotateCcw, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  BookOpen,
  AlertCircle
} from 'lucide-react';

interface EnglishRevisionViewProps {
  wrongAnswers: UserWrongAnswerItem[];
  vocabList: EnglishVocabItem[];
  learnedWordIds: string[];
  language: Language;
  soundEnabled: boolean;
  onBack: () => void;
  onClearWrongAnswer: (id: string) => void;
}

export const EnglishRevisionView: React.FC<EnglishRevisionViewProps> = ({
  wrongAnswers,
  vocabList,
  learnedWordIds,
  language,
  soundEnabled,
  onBack,
  onClearWrongAnswer,
}) => {
  const [activeTab, setActiveTab] = useState<'mistakes' | 'savedWords'>('mistakes');
  const [retestItem, setRetestItem] = useState<UserWrongAnswerItem | null>(null);
  const [retestInput, setRetestInput] = useState('');
  const [retestResult, setRetestResult] = useState<{ correct: boolean; msg: string } | null>(null);

  const learnedWords = vocabList.filter((w) => learnedWordIds.includes(w.id));

  const handleRetestSubmit = () => {
    if (!retestItem || !retestInput.trim()) return;
    const cleanUser = retestInput.trim().toLowerCase().replace(/[.,!?'"]/g, '');
    const cleanAns = retestItem.correctAnswer.toLowerCase().replace(/[.,!?'"]/g, '');

    const isMatch = cleanUser === cleanAns;
    if (isMatch) {
      playCorrectSound(soundEnabled);
      setRetestResult({
        correct: true,
        msg: 'बधाई! आपने इस गलती को सुधार लिया। यह मिस्टेक बुक से हटाई जा रही है।',
      });
      setTimeout(() => {
        onClearWrongAnswer(retestItem.id);
        setRetestItem(null);
        setRetestInput('');
        setRetestResult(null);
      }, 1500);
    } else {
      playWrongSound(soundEnabled);
      setRetestResult({
        correct: false,
        msg: `सही उत्तर है: "${retestItem.correctAnswer}"`,
      });
    }
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
        <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl">
          🔄 रिवीजन केंद्र
        </span>
      </div>

      {/* Tabs Switcher */}
      <div className="grid grid-cols-2 gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
        <button
          onClick={() => {
            playTapSound(soundEnabled);
            setActiveTab('mistakes');
          }}
          className={`py-2 rounded-xl text-center text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'mistakes'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>मिस्टेक बुक ({wrongAnswers.length})</span>
        </button>

        <button
          onClick={() => {
            playTapSound(soundEnabled);
            setActiveTab('savedWords');
          }}
          className={`py-2 rounded-xl text-center text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'savedWords'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>सीखे गए शब्द ({learnedWords.length})</span>
        </button>
      </div>

      {/* MISTAKES TAB */}
      {activeTab === 'mistakes' && (
        <div className="space-y-3">
          {wrongAnswers.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center space-y-2">
              <Sparkles className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">
                आपकी मिस्टेक बुक बिल्कुल खाली है!
              </h3>
              <p className="text-xs text-slate-500">
                जब आप किसी प्रश्न या स्पेलिंग में गलती करेंगे, तो वह यहां स्वतः सेव हो जाएगी ताकि आप उसका दोबारा अभ्यास कर सकें।
              </p>
            </div>
          ) : (
            wrongAnswers.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                      {item.type} गलती
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                      {item.question}
                    </h4>
                  </div>

                  <button
                    onClick={() => onClearWrongAnswer(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="हटाएं"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Comparison Box */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="text-rose-700 font-medium">
                    ✕ आपका गलत उत्तर: <span className="line-through">{item.userAnswer}</span>
                  </div>
                  <div className="text-emerald-700 font-bold">
                    ✓ सही उत्तर: <span>{item.correctAnswer}</span>
                  </div>
                  {item.explanationHi && (
                    <div className="text-slate-600 text-[11px] pt-1">
                      💡 {item.explanationHi}
                    </div>
                  )}
                </div>

                {/* Re-test button */}
                <div className="pt-1">
                  <button
                    onClick={() => {
                      playTapSound(soundEnabled);
                      setRetestItem(item);
                      setRetestInput('');
                      setRetestResult(null);
                    }}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>इस गलती का दोबारा अभ्यास करें</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SAVED WORDS TAB */}
      {activeTab === 'savedWords' && (
        <div className="space-y-3">
          {learnedWords.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center space-y-2">
              <BookOpen className="w-10 h-10 text-blue-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">
                अभी तक कोई शब्द मार्क नहीं किया गया है
              </h3>
              <p className="text-xs text-slate-500">
                Vocabulary सेक्शन में जाकर '✓ यह शब्द सीख लिया है' पर टैप करें।
              </p>
            </div>
          ) : (
            learnedWords.map((word) => (
              <div
                key={word.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900">{word.word}</h4>
                    <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                      {word.partOfSpeech}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">{word.hindiMeaning}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 italic">
                    "{word.exampleSentence}"
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* RE-TEST MODAL OVERLAY */}
      {retestItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3.5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                री-टेस्ट अभ्यास
              </span>
              <button
                onClick={() => setRetestItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-500">प्रश्न:</p>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                {retestItem.question}
              </h3>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                autoFocus
                value={retestInput}
                onChange={(e) => setRetestInput(e.target.value)}
                placeholder="सही उत्तर लिखें..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={handleRetestSubmit}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                जांचें
              </button>
            </div>

            {retestResult && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  retestResult.correct
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-rose-100 text-rose-900'
                }`}
              >
                {retestResult.msg}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
