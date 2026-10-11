import React, { useState, useEffect } from 'react';
import { HomeCustomModule, CustomSubSection, NestedSubButton, Language, CustomQuizQuestion } from '../types';
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  FileText,
  HelpCircle,
  Code,
  Link2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Copy,
  Check,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { playTapSound, playCorrectSound, playWrongSound } from '../utils/audio';

interface CustomFeaturePageViewProps {
  module: HomeCustomModule;
  language: Language;
  soundEnabled: boolean;
  onBackToMenu: () => void;
}

export const CustomFeaturePageView: React.FC<CustomFeaturePageViewProps> = ({
  module,
  language,
  soundEnabled,
  onBackToMenu,
}) => {
  const [activeSubSection, setActiveSubSection] = useState<CustomSubSection | null>(null);
  const [activeSubButton, setActiveSubButton] = useState<NestedSubButton | null>(null);

  // Active Quiz State (if inside an MCQ sub-section)
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizAnswerRevealed, setQuizAnswerRevealed] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [copiedNote, setCopiedNote] = useState(false);

  // Sync sub-section / sub-button with URL hash & popstate
  useEffect(() => {
    const handleSync = () => {
      const hash = window.location.hash || '';
      const parts = hash.replace(/^#\/?/, '').split('/');
      // parts[0] is 'custom', parts[1] is moduleId, parts[2] is subSectionId
      if (parts.length >= 3 && parts[2]) {
        const subId = parts[2];
        const foundSec = module.subSections?.find((s) => s.id === subId) || null;
        if (foundSec) {
          setActiveSubSection(foundSec);
          setQuizIndex(0);
          setQuizSelectedOption(null);
          setQuizAnswerRevealed(false);
          setQuizScore(0);
          return;
        }
        const foundBtn = module.nestedButtons?.find((b) => b.id === subId) || null;
        if (foundBtn) {
          setActiveSubButton(foundBtn);
          return;
        }
      } else {
        setActiveSubSection(null);
        setActiveSubButton(null);
      }
    };

    window.addEventListener('popstate', handleSync);
    window.addEventListener('hashchange', handleSync);
    handleSync();

    return () => {
      window.removeEventListener('popstate', handleSync);
      window.removeEventListener('hashchange', handleSync);
    };
  }, [module]);

  const handleOpenSubSection = (sec: CustomSubSection) => {
    playTapSound(soundEnabled);
    if (sec.contentType === 'link' && sec.linkUrl) {
      window.open(sec.linkUrl, '_blank');
      return;
    }
    setActiveSubSection(sec);
    setQuizIndex(0);
    setQuizSelectedOption(null);
    setQuizAnswerRevealed(false);
    setQuizScore(0);
    window.history.pushState(
      { section: 'custom_feature', moduleId: module.id, subSecId: sec.id },
      '',
      `#/custom/${module.id}/${sec.id}`
    );
  };

  const handleSubButtonClick = (subBtn: NestedSubButton) => {
    playTapSound(soundEnabled);
    if (subBtn.actionType === 'link' && subBtn.actionTarget) {
      window.open(subBtn.actionTarget, '_blank');
    } else {
      setActiveSubButton(subBtn);
      window.history.pushState(
        { section: 'custom_feature', moduleId: module.id, subId: subBtn.id },
        '',
        `#/custom/${module.id}/${subBtn.id}`
      );
    }
  };

  const wrapCodeHtml = (code: string) => {
    if (code.includes('<html') || code.includes('<!DOCTYPE')) {
      return code;
    }
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 16px;
      background-color: #f8fafc;
      color: #0f172a;
    }
  </style>
</head>
<body>
  ${code}
</body>
</html>`;
  };

  const copyNoteText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNote(true);
    playTapSound(soundEnabled);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  // Check if we are inside a nested sub-section
  const currentSubTitle = activeSubSection
    ? (language === 'hi' ? activeSubSection.titleHi || activeSubSection.title : activeSubSection.title)
    : activeSubButton
    ? (language === 'hi' ? activeSubButton.titleHi || activeSubButton.title : activeSubButton.title)
    : (language === 'hi' ? module.titleHi || module.title : module.title);

  return (
    <div className="max-w-md mx-auto px-4 py-3 pb-24 space-y-3 animate-in fade-in duration-200">
      {/* Top Banner with One-Step Back Control */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="text-2xl shrink-0 p-1 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
            {activeSubSection?.icon || activeSubButton?.icon || module.icon || '⭐'}
          </div>
          <div className="truncate">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {currentSubTitle}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              {activeSubSection
                ? (language === 'hi' ? activeSubSection.descriptionHi || activeSubSection.description || module.title : activeSubSection.description || module.title)
                : (language === 'hi' ? module.subtitleHi || module.subtitle : module.subtitle)}
            </p>
          </div>
        </div>

        {(activeSubSection || activeSubButton) && (
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              window.history.back();
            }}
            type="button"
            className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-xl border border-blue-200 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'सेक्शन्स' : 'Sections'}</span>
          </button>
        )}
      </div>

      {/* ---------------- VIEW 1: INSIDE A NESTED SUB-SECTION ---------------- */}
      {activeSubSection ? (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* A. NOTES VIEW */}
          {activeSubSection.contentType === 'notes' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>{language === 'hi' ? 'अध्ययन नोट्स' : 'Study Notes'}</span>
                </span>
                {activeSubSection.notesContent && (
                  <button
                    onClick={() => copyNoteText(activeSubSection.notesContent || '')}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-blue-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNote ? (language === 'hi' ? 'कॉपी हुआ' : 'Copied') : (language === 'hi' ? 'कॉपी करें' : 'Copy')}</span>
                  </button>
                )}
              </div>

              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal selection:bg-blue-100">
                {activeSubSection.notesContent || (
                  <p className="text-slate-400 italic">इस सेक्शन में अभी कोई नोट्स सामग्री उपलब्ध नहीं है।</p>
                )}
              </div>
            </div>
          )}

          {/* B. MCQ PRACTICE QUIZ VIEW */}
          {activeSubSection.contentType === 'quiz' && (
            <div className="space-y-3">
              {activeSubSection.quizQuestions && activeSubSection.quizQuestions.length > 0 ? (
                (() => {
                  const questions = activeSubSection.quizQuestions;
                  const currentQ = questions[quizIndex] || questions[0];
                  const totalQ = questions.length;
                  const isFinished = quizIndex >= totalQ;

                  if (isFinished) {
                    return (
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-3 shadow-xs">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                          🏆
                        </div>
                        <h3 className="text-base font-black text-slate-900">
                          {language === 'hi' ? 'क्विज समाप्त!' : 'Quiz Completed!'}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {language === 'hi' ? 'आपका स्कोर:' : 'Your Score:'} {quizScore} / {totalQ}
                        </p>
                        <button
                          onClick={() => {
                            playTapSound(soundEnabled);
                            setQuizIndex(0);
                            setQuizScore(0);
                            setQuizSelectedOption(null);
                            setQuizAnswerRevealed(false);
                          }}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{language === 'hi' ? 'दोबारा खेलें' : 'Retry Quiz'}</span>
                        </button>
                      </div>
                    );
                  }

                  const qText = language === 'hi' ? currentQ.questionHi || currentQ.question : currentQ.question;
                  const opts = (language === 'hi' && currentQ.optionsHi && currentQ.optionsHi.length === 4)
                    ? currentQ.optionsHi
                    : currentQ.options;
                  const expText = language === 'hi' ? currentQ.explanationHi || currentQ.explanation : currentQ.explanation;

                  const handleSelectOpt = (optIdx: number) => {
                    if (quizAnswerRevealed) return;
                    setQuizSelectedOption(optIdx);
                    setQuizAnswerRevealed(true);
                    if (optIdx === currentQ.correctIndex) {
                      playCorrectSound(soundEnabled);
                      setQuizScore((prev) => prev + 1);
                    } else {
                      playWrongSound(soundEnabled);
                    }
                  };

                  const handleNextQ = () => {
                    playTapSound(soundEnabled);
                    setQuizSelectedOption(null);
                    setQuizAnswerRevealed(false);
                    setQuizIndex((prev) => prev + 1);
                  };

                  return (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
                      {/* Quiz Progress Counter */}
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>
                          {language === 'hi' ? 'प्रश्न' : 'Question'} {quizIndex + 1}/{totalQ}
                        </span>
                        <span className="text-emerald-600">
                          {language === 'hi' ? 'अंक:' : 'Score:'} {quizScore}
                        </span>
                      </div>

                      {/* Question Text */}
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {qText}
                      </h3>

                      {/* Options */}
                      <div className="space-y-2 pt-1">
                        {opts.map((opt, oIdx) => {
                          const isCorrect = oIdx === currentQ.correctIndex;
                          const isSelected = quizSelectedOption === oIdx;

                          let btnClasses = 'border-slate-200 bg-slate-50/60 text-slate-800 hover:bg-slate-100 hover:border-blue-300';
                          if (quizAnswerRevealed) {
                            if (isCorrect) {
                              btnClasses = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-400';
                            } else if (isSelected) {
                              btnClasses = 'border-rose-500 bg-rose-50 text-rose-950 font-bold ring-1 ring-rose-400';
                            } else {
                              btnClasses = 'border-slate-200 bg-slate-50/40 text-slate-400 opacity-60';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectOpt(oIdx)}
                              disabled={quizAnswerRevealed}
                              className={`w-full p-3 rounded-xl border text-xs sm:text-sm font-medium text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${btnClasses}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-[11px] text-slate-700 shrink-0">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {quizAnswerRevealed && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                              {quizAnswerRevealed && isSelected && !isCorrect && (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Box */}
                      {quizAnswerRevealed && expText && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1 animate-in fade-in">
                          <span className="font-bold block text-blue-800">
                            💡 {language === 'hi' ? 'व्याख्या (Explanation):' : 'Explanation:'}
                          </span>
                          <p className="leading-relaxed">{expText}</p>
                        </div>
                      )}

                      {/* Next Question Button */}
                      {quizAnswerRevealed && (
                        <button
                          onClick={handleNextQ}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer mt-2"
                        >
                          {quizIndex + 1 < totalQ
                            ? (language === 'hi' ? 'अगला प्रश्न →' : 'Next Question →')
                            : (language === 'hi' ? 'स्कोर देखें' : 'View Results')}
                        </button>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-500 space-y-1">
                  <p className="text-xs font-bold">इस क्विज में अभी कोई प्रश्न नहीं जोड़े गए हैं।</p>
                  <p className="text-[11px] text-slate-400">एडमिन पैनल से प्रश्न जोड़ें।</p>
                </div>
              )}
            </div>
          )}

          {/* C. INTERACTIVE HTML TOOL VIEW */}
          {activeSubSection.contentType === 'code' && activeSubSection.contentCode && (
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs h-[calc(100vh-200px)] min-h-[480px] flex flex-col">
              <iframe
                srcDoc={wrapCodeHtml(activeSubSection.contentCode)}
                title={activeSubSection.title}
                className="w-full h-full border-none flex-1 bg-white"
                sandbox="allow-scripts allow-modals font-src allow-forms allow-same-origin allow-downloads"
              />
            </div>
          )}
        </div>
      ) : activeSubButton ? (
        /* Legacy Sub-Button View */
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs h-[calc(100vh-200px)] min-h-[480px] flex flex-col">
          <iframe
            srcDoc={wrapCodeHtml(activeSubButton.contentCode || module.contentCode || '')}
            title={activeSubButton.title}
            className="w-full h-full border-none flex-1 bg-white"
            sandbox="allow-scripts allow-modals font-src allow-forms allow-same-origin allow-downloads"
          />
        </div>
      ) : module.subSections && module.subSections.length > 0 ? (
        /* ---------------- VIEW 2: BUTTON'S NESTED SECTIONS LIST ---------------- */
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700">
              {language === 'hi' ? 'सेक्शन / विषय चुनें:' : 'Select Section / Chapter:'}
            </span>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {module.subSections.length} {language === 'hi' ? 'सेक्शन्स उपलब्ध' : 'Sections'}
            </span>
          </div>

          <div className="space-y-2.5">
            {module.subSections.map((sec, idx) => (
              <button
                key={sec.id}
                onClick={() => handleOpenSubSection(sec)}
                type="button"
                className="w-full p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-blue-400 active:scale-95 active:bg-blue-50/50 transition-all cursor-pointer flex items-center justify-between gap-3 text-left group select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-1 bg-slate-50 border border-slate-100 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                    {sec.icon || '📌'}
                  </span>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 block leading-tight">
                      {language === 'hi' ? sec.titleHi || sec.title : sec.title}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium mt-0.5 block line-clamp-1">
                      {language === 'hi' ? sec.descriptionHi || sec.description || 'अध्ययन सामग्री' : sec.description || 'Study Material'}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-800 text-slate-600 transition-colors">
                        {sec.contentType === 'notes' && '📖 नोट्स'}
                        {sec.contentType === 'quiz' && `⚡ क्विज (${sec.quizQuestions?.length || 0} प्रश्न)`}
                        {sec.contentType === 'code' && '💻 टूल'}
                        {sec.contentType === 'link' && '🔗 लिंक'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-lg bg-slate-50 group-hover:bg-blue-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-colors shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : module.actionType === 'nested_buttons' && module.nestedButtons && module.nestedButtons.length > 0 ? (
        /* Legacy nested_buttons */
        <div className="space-y-2.5 pt-1">
          {module.nestedButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => handleSubButtonClick(btn)}
              type="button"
              className="w-full p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-blue-300 active:scale-95 active:bg-blue-50/50 transition-all cursor-pointer flex items-center justify-between gap-3 text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {btn.icon || '⚡'}
                </span>
                <div>
                  <span className="text-sm font-bold text-slate-900 group-hover:text-blue-700 block leading-tight">
                    {language === 'hi' ? btn.titleHi || btn.title : btn.title}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                    {btn.actionType === 'link' ? '🔗 External Web Link' : '💻 Interactive In-App Tool'}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                खोलें →
              </span>
            </button>
          ))}
        </div>
      ) : module.contentCode ? (
        /* Direct Interactive Tool Code */
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs h-[calc(100vh-185px)] min-h-[500px] flex flex-col">
          <iframe
            srcDoc={wrapCodeHtml(module.contentCode)}
            title={module.title}
            className="w-full h-full border-none flex-1 bg-white"
            sandbox="allow-scripts allow-modals font-src allow-forms allow-same-origin allow-downloads"
          />
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 space-y-2 shadow-xs">
          <div className="text-3xl">📂</div>
          <p className="text-sm font-bold text-slate-800">
            {language === 'hi' ? 'इस बटन में अभी कोई सेक्शन नहीं है' : 'No sections available yet'}
          </p>
          <p className="text-xs text-slate-500">
            {language === 'hi'
              ? 'एडमिन पैनल से इस बटन के अंदर नोट्स, क्विज या टूल जोड़ें।'
              : 'Add sections, notes, quizzes, or tools from Admin Panel.'}
          </p>
        </div>
      )}
    </div>
  );
};
