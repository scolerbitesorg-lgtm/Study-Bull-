import React, { useState } from 'react';
import { HomeCustomModule, NestedSubButton, Language } from '../types';
import { X, ExternalLink, Printer, Sparkles, Layers, Maximize2, Minimize2 } from 'lucide-react';

interface CustomFeatureRunnerModalProps {
  module: HomeCustomModule;
  language: Language;
  onClose: () => void;
}

export const CustomFeatureRunnerModal: React.FC<CustomFeatureRunnerModalProps> = ({
  module,
  language,
  onClose,
}) => {
  const [activeSubButton, setActiveSubButton] = useState<NestedSubButton | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // If activeSubButton has code or module itself has code
  const activeCode = activeSubButton?.contentCode || module.contentCode;
  const activeTitle = activeSubButton
    ? (language === 'hi' ? activeSubButton.titleHi || activeSubButton.title : activeSubButton.title)
    : (language === 'hi' ? module.titleHi || module.title : module.title);

  const handleSubButtonClick = (subBtn: NestedSubButton) => {
    if (subBtn.actionType === 'link' && subBtn.actionTarget) {
      window.open(subBtn.actionTarget, '_blank');
    } else {
      setActiveSubButton(subBtn);
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col w-full transition-all duration-300 border border-slate-200 ${
          isFullscreen ? 'h-full max-w-full rounded-none' : 'h-[92vh] max-w-2xl'
        }`}
      >
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="text-xl shrink-0">{activeSubButton?.icon || module.icon || '✨'}</span>
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-bold truncate">{activeTitle}</h3>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {module.subtitleHi || module.subtitle || 'Admin Custom Feature Tool'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {activeSubButton && (
              <button
                onClick={() => setActiveSubButton(null)}
                className="text-[11px] font-bold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                ← सब-बटन सूची
              </button>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title={isFullscreen ? 'सामान्य व्यू' : 'फुल स्क्रीन'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer"
              title="बंद करें"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-slate-50 overflow-y-auto relative flex flex-col">
          {/* Mode 1: Nested Sub-Buttons List */}
          {module.actionType === 'nested_buttons' && !activeSubButton && (
            <div className="p-4 sm:p-6 space-y-4 max-w-lg mx-auto w-full">
              <div className="text-center space-y-1">
                <div className="text-4xl">{module.icon || '📂'}</div>
                <h4 className="text-base font-black text-slate-800">
                  {language === 'hi' ? module.titleHi || module.title : module.title}
                </h4>
                <p className="text-xs text-slate-500">
                  {language === 'hi'
                    ? module.subtitleHi || module.subtitle || 'नीचे दिए गए फ़ीचर्स में से चुनें:'
                    : module.subtitle || 'Select a sub-feature below:'}
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {module.nestedButtons && module.nestedButtons.length > 0 ? (
                  module.nestedButtons.map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => handleSubButtonClick(btn)}
                      className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-indigo-400 hover:shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-between gap-3 text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl group-hover:scale-110 transition-transform">
                          {btn.icon || '⚡'}
                        </span>
                        <div>
                          <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 block">
                            {language === 'hi' ? btn.titleHi || btn.title : btn.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {btn.actionType === 'link' ? '🔗 External Web Link' : '💻 Interactive Tool'}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        ओपन करें →
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-center text-slate-400 py-6">
                    कोई सब-बटन उपलब्ध नहीं है। एडमिन पैनल से नया बटन जोड़ें।
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Mode 2: Interactive Custom Code / HTML Runner (e.g. Resume Maker) */}
          {activeCode ? (
            <iframe
              srcDoc={wrapCodeHtml(activeCode)}
              title={activeTitle}
              className="w-full flex-1 border-none bg-white rounded-b-3xl"
              sandbox="allow-scripts allow-modals font-src allow-forms allow-same-origin allow-downloads"
            />
          ) : module.actionType !== 'nested_buttons' ? (
            <div className="p-6 text-center text-slate-500 my-auto space-y-2">
              <p className="text-sm font-bold">इस बटन के लिए कोई कोड सेट नहीं किया गया है।</p>
              <p className="text-xs text-slate-400">
                एडमिन पैनल में जाकर 'HTML / JS Code' पेस्ट करें।
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
