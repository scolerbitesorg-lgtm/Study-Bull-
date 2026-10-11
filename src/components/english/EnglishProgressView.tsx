import React from 'react';
import { UserEnglishProgress, Language } from '../../types';
import { playTapSound } from '../../utils/audio';
import { 
  ArrowLeft, 
  Trophy, 
  Flame, 
  BookOpen, 
  CheckCircle2, 
  Award, 
  Target, 
  Zap,
  TrendingUp
} from 'lucide-react';

interface EnglishProgressViewProps {
  progress: UserEnglishProgress;
  language: Language;
  soundEnabled: boolean;
  onBack: () => void;
}

export const EnglishProgressView: React.FC<EnglishProgressViewProps> = ({
  progress,
  language,
  soundEnabled,
  onBack,
}) => {
  // Determine user level tier
  const getTier = () => {
    if (progress.totalScore >= 300) return { title: 'Master 🏆', color: 'from-amber-500 to-yellow-600', nextGoal: 'शीर्ष स्तर प्राप्त' };
    if (progress.totalScore >= 150) return { title: 'Pro Aspirant 🥇', color: 'from-blue-600 to-indigo-700', nextGoal: '300 अंक पर Master' };
    if (progress.totalScore >= 50) return { title: 'Intermediate 🥈', color: 'from-emerald-600 to-teal-700', nextGoal: '150 अंक पर Pro' };
    return { title: 'Beginner 🥉', color: 'from-slate-700 to-slate-900', nextGoal: '50 अंक पर Intermediate' };
  };

  const tier = getTier();

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
        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 fill-amber-500" />
          <span>{progress.streakDays} दिन स्ट्रीक</span>
        </span>
      </div>

      {/* Hero Badge Card */}
      <div className={`bg-gradient-to-r ${tier.color} text-white rounded-3xl p-5 shadow-md space-y-3`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
            वर्तमान स्तर (Current Level)
          </span>
          <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded-lg">
            {progress.totalScore} XP
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl shrink-0 border border-white/20">
            🎖️
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">{tier.title}</h2>
            <p className="text-xs text-blue-100 font-medium mt-0.5">
              अगला लक्ष्य: {tier.nextGoal}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs text-center space-y-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-base">
            📖
          </div>
          <span className="text-xl font-black font-mono text-slate-900 block">
            {progress.learnedWordIds.length}
          </span>
          <span className="text-[11px] font-bold text-slate-500 block">
            सीखे गए शब्द (Words)
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs text-center space-y-1">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-base">
            🗣️
          </div>
          <span className="text-xl font-black font-mono text-slate-900 block">
            {progress.sentencesPracticedCount}
          </span>
          <span className="text-[11px] font-bold text-slate-500 block">
            अभ्यास किए वाक्य
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs text-center space-y-1">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-base">
            ⚖️
          </div>
          <span className="text-xl font-black font-mono text-slate-900 block">
            {progress.completedLessonIds.length}
          </span>
          <span className="text-[11px] font-bold text-slate-500 block">
            पूर्ण किए गए लेसन्स
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs text-center space-y-1">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-base">
            ⚠️
          </div>
          <span className="text-xl font-black font-mono text-slate-900 block">
            {progress.wrongAnswersList.length}
          </span>
          <span className="text-[11px] font-bold text-slate-500 block">
            मिस्टेक बुक में सवाल
          </span>
        </div>
      </div>

      {/* Progression Roadmap */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
          अंग्रेजी सीखने का रोडमैप (Roadmap):
        </h3>

        <div className="space-y-2.5 text-xs font-medium">
          <div className="flex items-center gap-2.5 p-2.5 bg-emerald-50 rounded-xl text-emerald-900 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold block">1. दैनिक वाक्य व सामान्य अभिवादन</span>
              <span className="text-[11px] text-emerald-700">बोलने की झिझक दूर करने के 50+ वाक्य</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-blue-50 rounded-xl text-blue-900 border border-blue-200">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold block">2. शब्दावली (Vocab) व निमोनिक्स</span>
              <span className="text-[11px] text-blue-700">रूट वर्ड्स और आसान हिंदी उदाहरणों से याद रखें</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-indigo-50 rounded-xl text-indigo-900 border border-indigo-200">
            <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="font-bold block">3. संपूर्ण व्याकरण (Grammar & Tenses)</span>
              <span className="text-[11px] text-indigo-700">नियम समझें और ✕ गलत vs ✓ सही पहचानें</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-purple-50 rounded-xl text-purple-900 border border-purple-200">
            <Trophy className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <span className="font-bold block">4. रीडिंग कॉम्प्रिहेंशन व लेखन</span>
              <span className="text-[11px] text-purple-700">कहानियां पढ़ें और खुद ट्रांसलेशन टाइप करें</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
