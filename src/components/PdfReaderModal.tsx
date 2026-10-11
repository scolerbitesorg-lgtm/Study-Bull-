import React, { useState } from 'react';
import { NoteItem, Language } from '../types';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  FileText, 
  Lightbulb, 
  BookOpen,
  Sun,
  Moon,
  Search,
  Copy,
  Check,
  Printer,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Sparkles
} from 'lucide-react';

interface PdfReaderModalProps {
  note: NoteItem;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  soundEnabled: boolean;
}

export const PdfReaderModal: React.FC<PdfReaderModalProps> = ({
  note,
  isOpen,
  onClose,
  language,
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [readingTheme, setReadingTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  if (!isOpen) return null;

  const handleCopyText = () => {
    try {
      const text = `${note.title}\n${note.content.chapter}\n\n` +
        note.content.sections.map(s => `${s.heading}:\n` + s.points.join('\n')).join('\n\n');
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handlePrint = () => {
    window.print();
  };

  // Theme styling configurations
  const themeStyles = {
    light: {
      bg: 'bg-slate-100',
      paperBg: 'bg-white text-slate-900 border-slate-200',
      sectionBg: 'bg-slate-50 border-slate-200',
      heading: 'text-slate-900',
      text: 'text-slate-700',
      tipBg: 'bg-amber-50 border-amber-200 text-amber-950',
    },
    sepia: {
      bg: 'bg-[#f4ecd8]',
      paperBg: 'bg-[#fbf0d9] text-[#433422] border-[#e2d5b7]',
      sectionBg: 'bg-[#f5e8cf] border-[#e0d2b4]',
      heading: 'text-[#2c2013]',
      text: 'text-[#433422]',
      tipBg: 'bg-[#ebe0c5] border-[#d8c8a2] text-[#332515]',
    },
    dark: {
      bg: 'bg-slate-950',
      paperBg: 'bg-slate-900 text-slate-100 border-slate-800',
      sectionBg: 'bg-slate-800/80 border-slate-700/80',
      heading: 'text-white',
      text: 'text-slate-300',
      tipBg: 'bg-amber-950/40 border-amber-800/60 text-amber-200',
    },
  }[readingTheme];

  const fontClasses = {
    sm: 'text-xs sm:text-sm',
    md: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
  }[fontSize];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white w-full h-full min-h-screen overflow-hidden animate-in fade-in duration-200">
      {/* FULL SCREEN TOP APP BAR */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 py-2.5 flex items-center justify-between gap-2 shadow-lg">
        {/* Left: Back & Document Metadata */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'hi' ? 'वापस' : 'Back'}</span>
          </button>

          <div className="min-w-0">
            <h1 className="font-bold text-xs sm:text-sm text-white truncate max-w-[180px] xs:max-w-[260px] sm:max-w-md">
              {note.title}
            </h1>
            <p className="text-[10px] text-blue-300 font-medium truncate">
              {note.subjectName} · {note.pagesCount} {language === 'hi' ? 'पृष्ठ' : 'Pages'}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showSearch ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Search Notes"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme Selector */}
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => setReadingTheme('light')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                readingTheme === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setReadingTheme('sepia')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                readingTheme === 'sepia' ? 'bg-[#f4ecd8] text-[#433422] shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Sepia Mode"
            >
              <span className="text-[10px] font-black px-0.5">Aa</span>
            </button>
            <button
              onClick={() => setReadingTheme('dark')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                readingTheme === 'dark' ? 'bg-slate-950 text-blue-400 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Night Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Font Size Adjuster */}
          <div className="hidden sm:flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-0.5 rounded-lg ${fontSize === 'sm' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('md')}
              className={`px-2 py-0.5 rounded-lg ${fontSize === 'md' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-0.5 rounded-lg ${fontSize === 'lg' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              A+
            </button>
          </div>

          {/* Copy Text */}
          <button
            onClick={handleCopyText}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title="Copy Notes Text"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white cursor-pointer active:scale-95 transition-all"
            title="Exit Notes"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* SEARCH BAR SUB-HEADER */}
      {showSearch && (
        <div className="bg-slate-900 border-b border-slate-800 p-2.5 px-4 animate-in slide-in-from-top duration-150 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'hi' ? 'नोट्स में खोजें...' : 'Search within notes...'}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-xs text-slate-400 hover:text-white">
              Clear
            </button>
          )}
        </div>
      )}

      {/* FULL SCREEN READING CANVAS */}
      <main className={`flex-1 overflow-y-auto p-4 sm:p-8 ${themeStyles.bg} transition-colors duration-200`}>
        <div
          className={`max-w-2xl mx-auto ${themeStyles.paperBg} rounded-3xl shadow-2xl p-6 sm:p-10 space-y-6 border transition-all duration-150`}
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          {/* Official Branding & Title Header */}
          <div className="border-b-2 border-blue-600 pb-5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                Study Bull · Full Screen Revision Notes
              </span>
              <span className="text-xs font-mono text-slate-400">
                100% Verified Study Material
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black mt-2 leading-snug">
              {note.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {note.subjectName} · {note.description}
            </p>
          </div>

          {/* Chapter Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200 block">
                Chapter
              </span>
              <span className="text-sm sm:text-base font-black">
                {note.content.chapter}
              </span>
            </div>
            <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
          </div>

          {/* Document Sections */}
          <div className="space-y-6">
            {note.content.sections
              .filter((sec) => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return (
                  sec.heading.toLowerCase().includes(q) ||
                  sec.points.some((p) => p.toLowerCase().includes(q))
                );
              })
              .map((section, sIdx) => (
                <div
                  key={sIdx}
                  className={`${themeStyles.sectionBg} rounded-2xl p-5 space-y-3.5 border transition-all shadow-xs`}
                >
                  <h2 className={`text-base sm:text-lg font-bold ${themeStyles.heading} flex items-center gap-2.5`}>
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                      {sIdx + 1}
                    </div>
                    <span>{section.heading}</span>
                  </h2>

                  <ul className={`space-y-2.5 ${fontClasses} ${themeStyles.text} pl-1`}>
                    {section.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2.5 leading-relaxed">
                        <span className="text-blue-600 font-black mt-1 text-xs shrink-0">❖</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Key Table if present */}
                  {section.keyTable && (
                    <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700 shadow-xs">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold border-b border-slate-300 dark:border-slate-700">
                          <tr>
                            {section.keyTable.headers.map((h, hIdx) => (
                              <th key={hIdx} className="p-3">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {section.keyTable.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-3 font-medium">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Exam Key Fact Box */}
                  {section.proTip && (
                    <div className={`mt-3 ${themeStyles.tipBg} rounded-2xl p-3.5 flex items-start gap-3 text-xs sm:text-sm border shadow-xs`}>
                      <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-extrabold block text-amber-600 dark:text-amber-400 mb-0.5">
                          {language === 'hi' ? '⚡ परीक्षा विशेष मास्टर ट्रिक्स:' : '⚡ Exam Key Fact:'}
                        </strong>
                        <span className="leading-relaxed">{section.proTip}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Footer Page Indicator */}
          <div className="pt-6 border-t border-slate-300 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Study Bull Official Full Screen Notes</span>
            <span>Page 1 of {note.pagesCount}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

