import React, { useState } from 'react';
import { HomeCustomModule, NestedSubButton, Language } from '../types';
import { ArrowLeft, ExternalLink, Sparkles, Layers } from 'lucide-react';
import { playTapSound } from '../utils/audio';

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
  const [activeSubButton, setActiveSubButton] = useState<NestedSubButton | null>(null);

  // Sync sub-button with navigation
  React.useEffect(() => {
    const handlePop = () => {
      const hash = window.location.hash || '';
      const parts = hash.replace(/^#\/?/, '').split('/');
      if (parts.length <= 2) {
        setActiveSubButton(null);
      }
    };
    window.addEventListener('popstate', handlePop);
    window.addEventListener('hashchange', handlePop);
    return () => {
      window.removeEventListener('popstate', handlePop);
      window.removeEventListener('hashchange', handlePop);
    };
  }, []);

  // If activeSubButton has code or module itself has code
  const activeCode = activeSubButton?.contentCode || module.contentCode;
  const activeTitle = activeSubButton
    ? (language === 'hi' ? activeSubButton.titleHi || activeSubButton.title : activeSubButton.title)
    : (language === 'hi' ? module.titleHi || module.title : module.title);

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

  return (
    <div className="max-w-md mx-auto px-4 py-3 pb-24 space-y-3 animate-in fade-in duration-200">
      {/* Sub-header banner showing feature title & back control if inside nested button */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="text-2xl shrink-0 p-1 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
            {activeSubButton?.icon || module.icon || '⭐'}
          </div>
          <div className="truncate">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {activeTitle}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              {language === 'hi' ? module.subtitleHi || module.subtitle : module.subtitle}
            </p>
          </div>
        </div>

        {activeSubButton && (
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              window.history.back();
            }}
            type="button"
            className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-xl border border-blue-200 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>पीछे जाएं</span>
          </button>
        )}
      </div>

      {/* Main View Area */}
      {module.actionType === 'nested_buttons' && !activeSubButton ? (
        /* Mode 1: Nested Sub-Buttons List */
        <div className="space-y-2.5 pt-1">
          {module.nestedButtons && module.nestedButtons.length > 0 ? (
            module.nestedButtons.map((btn) => (
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
            ))
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-500 space-y-1 shadow-xs">
              <p className="text-sm font-bold">कोई सब-बटन उपलब्ध नहीं है।</p>
              <p className="text-xs text-slate-400">एडमिन पैनल से सब-बटन जोड़ें।</p>
            </div>
          )}
        </div>
      ) : activeCode ? (
        /* Mode 2: Interactive In-App Tool / Custom Code Runner (Seamlessly embedded) */
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs h-[calc(100vh-185px)] min-h-[500px] flex flex-col">
          <iframe
            srcDoc={wrapCodeHtml(activeCode)}
            title={activeTitle}
            className="w-full h-full border-none flex-1 bg-white"
            sandbox="allow-scripts allow-modals font-src allow-forms allow-same-origin allow-downloads"
          />
        </div>
      ) : module.actionType === 'notice' || module.actionType === 'modal' ? (
        /* Mode 3: Notice / Announcement */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-3 shadow-xs">
          <div className="text-4xl">{module.icon || '📌'}</div>
          <h3 className="text-lg font-bold text-slate-900">
            {language === 'hi' ? module.titleHi || module.title : module.title}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {language === 'hi' ? module.subtitleHi || module.subtitle : module.subtitle}
          </p>
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              onBackToMenu();
            }}
            type="button"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer mt-2"
          >
            होम पर वापस जाएं
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-500 space-y-2 shadow-xs">
          <p className="text-sm font-bold">इस बटन के लिए कोई कोड सेट नहीं किया गया है।</p>
          <p className="text-xs text-slate-400">एडमिन पैनल से 'HTML / JS Code' जोड़ें।</p>
        </div>
      )}
    </div>
  );
};
