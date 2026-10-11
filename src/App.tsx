import React, { useState, useEffect } from 'react';
import { MainSection, Language, EnglishSubModule, HomeCustomModule } from './types';
import { Header } from './components/Header';
import { MainMenu } from './components/MainMenu';
import { QuizSection } from './components/QuizSection';
import { MockSection } from './components/MockSection';
import { NotesSection } from './components/NotesSection';
import { TypingSection } from './components/TypingSection';
import { CalculationsSection } from './components/CalculationsSection';
import { EnglishImproveSection } from './components/EnglishImproveSection';
import { CustomFeaturePageView } from './components/CustomFeaturePageView';
import { HomeButtonsAdminModal } from './components/admin/HomeButtonsAdminModal';
import { StorageService } from './services/storageService';
import { FirestoreService } from './firebase/firestoreService';

export default function App() {
  const [currentSection, setCurrentSection] = useState<MainSection>('menu');
  const [selectedCustomModule, setSelectedCustomModule] = useState<HomeCustomModule | null>(null);
  const [englishSubModule, setEnglishSubModule] = useState<EnglishSubModule>('overview');
  const [calcScreen, setCalcScreen] = useState<'setup' | 'practice' | 'result'>('setup');
  const [settings, setSettings] = useState(() => StorageService.getSettings());
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Keep selected custom module synced with Firestore
  useEffect(() => {
    const unsub = FirestoreService.subscribeHomeCustomModules((list) => {
      StorageService.saveCachedHomeCustomModules(list);
      if (selectedCustomModule) {
        const found = list.find((m) => m.id === selectedCustomModule.id);
        if (found) setSelectedCustomModule(found);
      }
    });
    return () => unsub();
  }, [selectedCustomModule]);

  // Ensure default data for Quiz, Mock, Notes in Firebase Firestore on startup
  useEffect(() => {
    FirestoreService.ensureDefaultFirestoreData();
  }, []);

  // Hash & Popstate router for mobile hardware back button support
  useEffect(() => {
    // Initial replaceState if not set
    if (!window.history.state) {
      window.history.replaceState({ section: 'menu' }, '', window.location.hash || '#/');
    }

    const syncNavigation = (e?: Event) => {
      const hash = window.location.hash || '#/';
      const popState = e && 'state' in e ? (e as PopStateEvent).state : null;
      const state = popState || window.history.state || {};

      // If at root menu:
      if (hash === '#/' || hash === '' || hash === '#') {
        setCurrentSection('menu');
        setSelectedCustomModule(null);
        setEnglishSubModule('overview');
        setCalcScreen('setup');
        return;
      }

      // Admin panel direct link if URL hash is #/admin or #admin
      if (hash === '#/admin' || hash === '#admin') {
        setIsAdminModalOpen(true);
        return;
      }

      // Quiz section
      if (hash.startsWith('#/quiz')) {
        setCurrentSection('quiz');
        return;
      }

      // Mock section
      if (hash.startsWith('#/mock')) {
        setCurrentSection('mock');
        return;
      }

      // Notes section
      if (hash.startsWith('#/notes')) {
        setCurrentSection('notes');
        return;
      }

      // Typing section
      if (hash.startsWith('#/typing')) {
        setCurrentSection('typing');
        return;
      }

      // Calculations section
      if (hash.startsWith('#/calculations')) {
        setCurrentSection('calculations');
        if (hash.includes('/practice')) setCalcScreen('practice');
        else if (hash.includes('/result')) setCalcScreen('result');
        else setCalcScreen('setup');
        return;
      }

      // English section
      if (hash.startsWith('#/english')) {
        setCurrentSection('english');
        const parts = hash.replace(/^#\/?/, '').split('/');
        const sub = (parts[1] as EnglishSubModule) || 'overview';
        setEnglishSubModule(sub);
        return;
      }

      // Custom feature
      if (hash.startsWith('#/custom')) {
        setCurrentSection('custom_feature');
        const parts = hash.replace(/^#\/?/, '').split('/');
        const modId = parts[1];
        if (modId) {
          const cached = StorageService.getCachedData<HomeCustomModule[]>('homeCustomModules', []);
          const found = cached.find((m) => m.id === modId);
          if (found) setSelectedCustomModule(found);
        }
        return;
      }

      // Fallback
      if (state.section) {
        setCurrentSection(state.section);
      } else {
        setCurrentSection('menu');
      }
    };

    window.addEventListener('popstate', syncNavigation);
    window.addEventListener('hashchange', syncNavigation);
    syncNavigation();

    return () => {
      window.removeEventListener('popstate', syncNavigation);
      window.removeEventListener('hashchange', syncNavigation);
    };
  }, [currentSection]);

  const navigateToSection = (section: MainSection) => {
    setCurrentSection(section);
    setSelectedCustomModule(null);
    setEnglishSubModule('overview');
    setCalcScreen('setup');
    const targetHash = section === 'menu' ? '#/' : ` #/${section}`.trim();
    window.history.pushState({ section }, '', targetHash);
  };

  const navigateToCustomModule = (mod: HomeCustomModule) => {
    setSelectedCustomModule(mod);
    setCurrentSection('custom_feature');
    setEnglishSubModule('overview');
    setCalcScreen('setup');
    window.history.pushState({ section: 'custom_feature', moduleId: mod.id }, '', `#/custom/${mod.id}`);
  };

  const navigateEnglishSubModule = (subMod: EnglishSubModule) => {
    setEnglishSubModule(subMod);
    const targetHash = subMod === 'overview' ? '#/english' : `#/english/${subMod}`;
    window.history.pushState({ section: 'english', englishSubModule: subMod }, '', targetHash);
  };

  const navigateCalcScreen = (cScreen: 'setup' | 'practice' | 'result') => {
    setCalcScreen(cScreen);
    const targetHash = cScreen === 'setup' ? '#/calculations' : `#/calculations/${cScreen}`;
    window.history.pushState({ section: 'calculations', calcScreen: cScreen }, '', targetHash);
  };

  const handleStepBack = () => {
    if (currentSection !== 'menu' || window.location.hash !== '#/') {
      window.history.back();
    } else {
      navigateToSection('menu');
    }
  };

  const getBackLabel = () => {
    const hash = window.location.hash || '';
    const isHi = settings.language === 'hi';

    if (currentSection === 'custom_feature') {
      const parts = hash.replace(/^#\/?/, '').split('/');
      if (parts.length >= 3) return isHi ? 'सेक्शन्स' : 'Sections';
      return isHi ? 'मेन्यू' : 'Menu';
    }
    if (currentSection === 'quiz') {
      const parts = hash.replace(/^#\/?/, '').split('/');
      if (parts.length >= 3) return isHi ? 'टॉपिक्स' : 'Topics';
      if (parts.length === 2 && parts[1]) return isHi ? 'विषय' : 'Subjects';
      return isHi ? 'मेन्यू' : 'Menu';
    }
    if (currentSection === 'mock') {
      const parts = hash.replace(/^#\/?/, '').split('/');
      if (parts.length >= 3) return isHi ? 'सीरीज' : 'Series';
      if (parts.length === 2 && parts[1]) return isHi ? 'परीक्षाएं' : 'Exams';
      return isHi ? 'मेन्यू' : 'Menu';
    }
    if (currentSection === 'notes') {
      const parts = hash.replace(/^#\/?/, '').split('/');
      if (parts.length >= 3) return isHi ? 'टॉपिक्स' : 'Topics';
      if (parts.length === 2 && parts[1]) return isHi ? 'फोल्डर्स' : 'Folders';
      return isHi ? 'मेन्यू' : 'Menu';
    }
    if (currentSection === 'typing') {
      if (hash.includes('/test') || hash.includes('/result')) {
        return isHi ? 'पैसेज' : 'Passages';
      }
      return isHi ? 'मेन्यू' : 'Menu';
    }
    if (currentSection === 'calculations') {
      return calcScreen !== 'setup' ? (isHi ? 'सेटअप' : 'Setup') : (isHi ? 'मेन्यू' : 'Menu');
    }
    if (currentSection === 'english') {
      if (hash.includes('/practice')) return isHi ? 'टॉपिक्स' : 'Topics';
      return englishSubModule !== 'overview' ? (isHi ? 'ओवरव्यू' : 'Overview') : (isHi ? 'मेन्यू' : 'Menu');
    }
    return isHi ? 'मेन्यू' : 'Menu';
  };

  const toggleLanguage = () => {
    const nextLang: Language = settings.language === 'hi' ? 'en' : 'hi';
    const updated = { ...settings, language: nextLang };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  const toggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Royal Blue Header with Mascot Logo, One-Step-Back Button & Controls */}
      <Header
        currentSection={currentSection}
        onBackToMenu={() => navigateToSection('menu')}
        onBackStep={handleStepBack}
        backLabel={getBackLabel()}
        language={settings.language}
        onToggleLanguage={toggleLanguage}
        soundEnabled={settings.soundEnabled}
        onToggleSound={toggleSound}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {/* Main Menu Screen (Side-by-side 2-column grid button blocks) */}
        {currentSection === 'menu' && (
          <MainMenu
            onSelectSection={navigateToSection}
            onSelectCustomModule={navigateToCustomModule}
            language={settings.language}
            soundEnabled={settings.soundEnabled}
          />
        )}

        {/* Dynamic Admin-Added Custom Feature / Code Runner (Opens full in-app view like all standard buttons) */}
        {currentSection === 'custom_feature' && selectedCustomModule && (
          <CustomFeaturePageView
            module={selectedCustomModule}
            language={settings.language}
            soundEnabled={settings.soundEnabled}
            onBackToMenu={() => navigateToSection('menu')}
          />
        )}

        {/* Quiz Section (Subjects -> Topics -> 4 Option Practice Page) */}
        {currentSection === 'quiz' && (
          <QuizSection
            language={settings.language}
            soundEnabled={settings.soundEnabled}
            onNavigateHome={() => navigateToSection('menu')}
          />
        )}

        {/* Mock Section (Exams -> Test Series -> Real Timer & Question Palette) */}
        {currentSection === 'mock' && (
          <MockSection
            language={settings.language}
            soundEnabled={settings.soundEnabled}
            onNavigateHome={() => navigateToSection('menu')}
          />
        )}

        {/* Notes Section (Subject Folders -> Topics -> Crystal Clear In-App Reading) */}
        {currentSection === 'notes' && (
          <NotesSection
            language={settings.language}
            soundEnabled={settings.soundEnabled}
            onNavigateHome={() => navigateToSection('menu')}
          />
        )}

        {/* Typing Skills Section (Passages -> Duration -> Live WPM/Accuracy Simulator) */}
        {currentSection === 'typing' && (
          <TypingSection
            language={settings.language}
            soundEnabled={settings.soundEnabled}
            onNavigateHome={() => navigateToSection('menu')}
          />
        )}

        {/* Calculations Section (First setup questions & level, then start practice screen) */}
        {currentSection === 'calculations' && (
          <CalculationsSection
            language={settings.language}
            soundEnabled={settings.soundEnabled}
            onNavigateHome={() => navigateToSection('menu')}
            activeScreen={calcScreen}
            onScreenChange={navigateCalcScreen}
          />
        )}

        {/* English Improve Section (Vocab, Golden Grammar Rules, MCQ, Typing, Admin Panel) */}
        {currentSection === 'english' && (
          <EnglishImproveSection
            language={settings.language}
            soundEnabled={settings.soundEnabled}
            onNavigateHome={() => navigateToSection('menu')}
            activeSubModule={englishSubModule}
            onSubModuleChange={navigateEnglishSubModule}
          />
        )}
      </main>

      {/* Admin Panel Modal for Managing Home Screen Buttons & Nested Sections */}
      <HomeButtonsAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        language={settings.language}
        soundEnabled={settings.soundEnabled}
      />
    </div>
  );
}
