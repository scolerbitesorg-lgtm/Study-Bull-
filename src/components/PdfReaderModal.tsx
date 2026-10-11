import React, { useState } from 'react';
import { NoteItem, Language } from '../types';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  FileText, 
  Lightbulb, 
  BookOpen
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Click backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Document Viewer Container */}
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-3xl max-h-[92vh] flex flex-col shadow-2xl z-10 overflow-hidden border border-slate-700">
        {/* PDF Reader Top Toolbar (Clean, NO download button as requested) */}
        <div className="flex items-center justify-between p-3.5 bg-slate-900 border-b border-slate-800 text-white">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-xs sm:text-sm text-white truncate max-w-[220px] sm:max-w-md">
                {note.title}
              </h3>
              <span className="text-[10px] text-blue-300 font-medium">
                {note.subjectName} · {note.pagesCount} {language === 'hi' ? 'पृष्ठ' : 'Pages'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
                className="p-1 hover:text-white text-slate-400 active:scale-90"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-slate-300 px-1">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
                className="p-1 hover:text-white text-slate-400 active:scale-90"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-90 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clear In-App Document Canvas (Crystal Clear Reading Experience) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-800/90">
          <div
            className="max-w-xl mx-auto bg-white text-slate-900 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 transition-all duration-150 border border-slate-200"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          >
            {/* Document Header Page Header */}
            <div className="border-b-2 border-blue-600 pb-4">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                Study Bull · Revision Notes
              </span>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-2 leading-snug">
                {note.title}
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {note.subjectName} · {note.description}
              </p>
            </div>

            {/* Chapter Heading Banner */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded-r-xl">
              <span className="text-xs font-black uppercase text-blue-900 tracking-wide">
                {note.content.chapter}
              </span>
            </div>

            {/* Document Sections with High Legibility */}
            <div className="space-y-6">
              {note.content.sections.map((section, sIdx) => (
                <div
                  key={sIdx}
                  className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3"
                >
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>{section.heading}</span>
                  </h2>

                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700 pl-1">
                    {section.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-blue-600 font-bold mt-1 text-xs">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Clean Table if present */}
                  {section.keyTable && (
                    <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold">
                          <tr>
                            {section.keyTable.headers.map((h, hIdx) => (
                              <th key={hIdx} className="p-2.5">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {section.keyTable.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50/80">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-2.5 text-slate-700">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pro Tip Box */}
                  {section.proTip && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-950">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-amber-900">
                          {language === 'hi' ? 'परीक्षा विशेष तथ्य: ' : 'Exam Key Fact: '}
                        </strong>
                        <span>{section.proTip}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Document Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Study Bull Official Portal</span>
              <span>Page 1 of {note.pagesCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
