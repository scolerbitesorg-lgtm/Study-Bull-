import React, { useState, useEffect } from 'react';
import { MainSection, Language, EnglishSubModule } from './types';
import { Header } from './components/Header';
import { MainMenu } from './components/MainMenu';
import { QuizSection } from './components/QuizSection';
import { MockSection } from './components/MockSection';
import { NotesSection } from './components/NotesSection';
import { TypingSection } from './components/TypingSection';
import { CalculationsSection } from './components/CalculationsSection';
import { EnglishImproveSection } from './components/EnglishImproveSection';
import { StorageService } from './services/storageService';

export default function App() {
  const [currentSection, setCurrentSection] = useState<MainSection>('menu');
  const [englishSubModule, setEnglishSubModule] = useState<EnglishSubModule>('overview');
  const [calcScreen, setCalcScreen] = useState<'setup' | 'practice' | 'result'>('setup');
  const [settings, setSettings] = useState(() => StorageService.getSettings());

  // Browser history sync so back button only navigates one screen back, never exiting the web
  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ section: 'menu', englishSubModule: 'overview', calcScreen: 'setup' }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        const state = event.state;
        setCurrentSection(state.section || 'menu');
        setEnglishSubModule(state.englishSubModule || 'overview');
        setCalcScreen(state.calcScreen || 'setup');
      } else {
        setCurrentSection('menu');
        setEnglishSubModule('overview');
        setCalcScreen('setup');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToSection = (section: MainSection) => {
    setCurrentSection(section);
    setEnglishSubModule('overview');
    setCalcScreen('setup');
    window.history.pushState({ section, englishSubModule: 'overview', calcScreen: 'setup' }, '');
  };

  const navigateEnglishSubModule = (subMod: EnglishSubModule) => {
    setEnglishSubModule(subMod);
    window.history.pushState({ section: 'english', englishSubModule: subMod, calcScreen: 'setup' }, '');
  };

  const navigateCalcScreen = (cScreen: 'setup' | 'practice' | 'result') => {
    setCalcScreen(cScreen);
    window.history.pushState({ section: 'calculations', englishSubModule: 'overview', calcScreen: cScreen }, '');
  };

  const handleStepBack = () => {
    // If inside a sub-module or sub-screen, navigate back using browser history stack
    if (window.history.state && (currentSection !== 'menu' || englishSubModule !== 'overview' || calcScreen !== 'setup')) {
      window.history.back();
    } else {
      navigateToSection('menu');
    }
  };

  const getBackLabel = () => {
    if (currentSection === 'english') {
      return englishSubModule !== 'overview'
        ? (settings.language === 'hi' ? 'ओवरव्यू' : 'Overview')
        : (settings.language === 'hi' ? 'मेन्यू' : 'Menu');
    }
    if (currentSection === 'calculations') {
      return calcScreen !== 'setup'
        ? (settings.language === 'hi' ? 'सेटअप' : 'Setup')
        : (settings.language === 'hi' ? 'मेन्यू' : 'Menu');
    }
    return settings.language === 'hi' ? 'मेन्यू' : 'Menu';
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
            language={settings.language}
            soundEnabled={settings.soundEnabled}
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
    </div>
  );
}
