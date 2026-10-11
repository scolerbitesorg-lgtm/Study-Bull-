import React, { useState, useEffect, useRef } from 'react';
import { 
  EnglishSubModule, 
  Language, 
  EnglishVocabItem, 
  EnglishSentenceItem, 
  EnglishSpellingItem, 
  EnglishMcqItem, 
  EnglishSentenceTypingItem, 
  EnglishGrammarTopic, 
  EnglishStoryItem, 
  UserEnglishProgress,
  UserWrongAnswerItem
} from '../types';
import { FirestoreService } from '../firebase/firestoreService';
import { StorageService } from '../services/storageService';
import { EnglishAiService, EnglishContentType } from '../services/englishAiService';
import { playTapSound } from '../utils/audio';

import { EnglishMenuGrid } from './english/EnglishMenuGrid';
import { EnglishSentencesView } from './english/EnglishSentencesView';
import { EnglishVocabView } from './english/EnglishVocabView';
import { EnglishSpellingView } from './english/EnglishSpellingView';
import { EnglishMcqView } from './english/EnglishMcqView';
import { EnglishSentenceTypingView } from './english/EnglishSentenceTypingView';
import { EnglishGrammarView } from './english/EnglishGrammarView';
import { EnglishReadingView } from './english/EnglishReadingView';
import { EnglishRevisionView } from './english/EnglishRevisionView';
import { EnglishProgressView } from './english/EnglishProgressView';

import {
  DEFAULT_ENGLISH_SENTENCES,
  DEFAULT_ENGLISH_VOCAB,
  DEFAULT_ENGLISH_SPELLING,
  DEFAULT_ENGLISH_MCQ,
  DEFAULT_ENGLISH_TYPING,
  DEFAULT_ENGLISH_GRAMMAR,
  DEFAULT_ENGLISH_STORIES,
} from '../data/englishData';

interface EnglishImproveSectionProps {
  language: Language;
  soundEnabled: boolean;
  onNavigateHome: () => void;
  activeSubModule?: EnglishSubModule;
  onSubModuleChange?: (subMod: EnglishSubModule) => void;
}

export const EnglishImproveSection: React.FC<EnglishImproveSectionProps> = ({
  language,
  soundEnabled,
  onNavigateHome,
  activeSubModule,
  onSubModuleChange,
}) => {
  const [internalModule, setInternalModule] = useState<EnglishSubModule>('overview');
  const currentModule = activeSubModule !== undefined ? activeSubModule : internalModule;
  const setCurrentModule = (mod: EnglishSubModule) => {
    if (onSubModuleChange) onSubModuleChange(mod);
    setInternalModule(mod);
  };

  // Real-time Firestore loaded states with fallback to initial seed data
  const [vocabList, setVocabList] = useState<EnglishVocabItem[]>(DEFAULT_ENGLISH_VOCAB);
  const [sentencesList, setSentencesList] = useState<EnglishSentenceItem[]>(DEFAULT_ENGLISH_SENTENCES);
  const [spellingList, setSpellingList] = useState<EnglishSpellingItem[]>(DEFAULT_ENGLISH_SPELLING);
  const [mcqList, setMcqList] = useState<EnglishMcqItem[]>(DEFAULT_ENGLISH_MCQ);
  const [typingList, setTypingList] = useState<EnglishSentenceTypingItem[]>(DEFAULT_ENGLISH_TYPING);
  const [grammarList, setGrammarList] = useState<EnglishGrammarTopic[]>(DEFAULT_ENGLISH_GRAMMAR);
  const [storiesList, setStoriesList] = useState<EnglishStoryItem[]>(DEFAULT_ENGLISH_STORIES);

  // User persistent progress
  const [progress, setProgress] = useState<UserEnglishProgress>(() =>
    StorageService.getEnglishProgress()
  );

  // Silent background replenishment queue - disabled so only admin added questions from Firebase are shown
  const handleSilentBackgroundRefill = async (_type: EnglishContentType) => {
    // Automatic AI question generation is permanently disabled.
    // Content is managed strictly manually via Firebase Firestore / Admin Panel.
    return;
  };

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    const unsubVocab = FirestoreService.subscribeEnglishVocab(setVocabList);
    const unsubSent = FirestoreService.subscribeEnglishSentences(setSentencesList);
    const unsubSpell = FirestoreService.subscribeEnglishSpelling(setSpellingList);
    const unsubMcq = FirestoreService.subscribeEnglishMcq(setMcqList);
    const unsubTyping = FirestoreService.subscribeEnglishTyping(setTypingList);
    const unsubGrammar = FirestoreService.subscribeEnglishGrammar(setGrammarList);
    const unsubStories = FirestoreService.subscribeEnglishStories(setStoriesList);

    return () => {
      unsubVocab();
      unsubSent();
      unsubSpell();
      unsubMcq();
      unsubTyping();
      unsubGrammar();
      unsubStories();
    };
  }, []);

  // Update progress helper
  const refreshProgress = () => {
    setProgress(StorageService.getEnglishProgress());
  };

  const handleMarkWordLearned = (id: string) => {
    StorageService.markWordLearned(id);
    refreshProgress();
  };

  const handleRecordWrongAnswer = (item: UserWrongAnswerItem) => {
    StorageService.addWrongAnswer(item);
    refreshProgress();
  };

  const handleClearWrongAnswer = (id: string) => {
    StorageService.removeWrongAnswer(id);
    refreshProgress();
  };

  const handleRecordPractice = () => {
    StorageService.recordSentencePracticed();
    refreshProgress();
  };

  const handleLessonCompleted = (lessonId: string) => {
    StorageService.recordLessonCompleted(lessonId);
    refreshProgress();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-3 pb-24 space-y-4 animate-in fade-in duration-200">
      {/* 1. OVERVIEW: SIDE BY SIDE 2-COLUMN GRID BLOCKS WITH REAL COUNTS */}
      {currentModule === 'overview' && (
        <EnglishMenuGrid
          onSelectModule={(mod) => {
            playTapSound(soundEnabled);
            setCurrentModule(mod);
          }}
          language={language}
          soundEnabled={soundEnabled}
          userScore={progress.totalScore}
          wordsLearnedCount={progress.learnedWordIds.length}
          sentencesCount={sentencesList.length}
          vocabCount={vocabList.length}
          spellingCount={spellingList.length}
          mcqCount={mcqList.length}
          typingCount={typingList.length}
          grammarCount={grammarList.length}
          storiesCount={storiesList.length}
          revisionCount={progress.wrongAnswersList.length}
        />
      )}

      {/* 2. BASIC SENTENCES PRACTICE */}
      {currentModule === 'sentences' && (
        <EnglishSentencesView
          sentences={sentencesList}
          language={language}
          soundEnabled={soundEnabled}
          onBack={() => setCurrentModule('overview')}
          onRecordPractice={handleRecordPractice}
        />
      )}

      {/* 3. VOCABULARY MEANINGS, EXPLANATIONS & EXAMPLES */}
      {currentModule === 'vocabulary' && (
        <EnglishVocabView
          vocabList={vocabList}
          language={language}
          soundEnabled={soundEnabled}
          learnedWordIds={progress.learnedWordIds}
          onBack={() => setCurrentModule('overview')}
          onMarkLearned={handleMarkWordLearned}
        />
      )}

      {/* 4. WORDS WRITING PRACTICE (PNEUMONIA, PHYSIOLOGY ETC) */}
      {currentModule === 'spelling' && (
        <EnglishSpellingView
          spellingList={spellingList}
          language={language}
          soundEnabled={soundEnabled}
          onBack={() => setCurrentModule('overview')}
          onRecordWrong={handleRecordWrongAnswer}
          onSuccess={() => {
            StorageService.recordSentencePracticed();
            refreshProgress();
          }}
          onSilentReplenish={() => handleSilentBackgroundRefill('spelling')}
        />
      )}

      {/* 5. HINDI TO ENGLISH MCQ PRACTICE */}
      {currentModule === 'mcq' && (
        <EnglishMcqView
          mcqList={mcqList}
          language={language}
          soundEnabled={soundEnabled}
          onBack={() => setCurrentModule('overview')}
          onRecordWrong={handleRecordWrongAnswer}
          onSuccess={() => {
            StorageService.recordSentencePracticed();
            refreshProgress();
          }}
          onSilentReplenish={() => handleSilentBackgroundRefill('mcq')}
        />
      )}

      {/* 6. SENTENCE TYPING PRACTICE */}
      {currentModule === 'typing' && (
        <EnglishSentenceTypingView
          typingList={typingList}
          language={language}
          soundEnabled={soundEnabled}
          onBack={() => setCurrentModule('overview')}
          onRecordWrong={handleRecordWrongAnswer}
          onSuccess={() => {
            StorageService.recordSentencePracticed();
            refreshProgress();
          }}
          onSilentReplenish={() => handleSilentBackgroundRefill('typing')}
        />
      )}

      {/* 7. COMPLETE GRAMMAR RULES & MINI QUIZZES */}
      {currentModule === 'grammar' && (
        <EnglishGrammarView
          grammarTopics={grammarList}
          language={language}
          soundEnabled={soundEnabled}
          onBack={() => setCurrentModule('overview')}
          onLessonComplete={handleLessonCompleted}
          onRecordWrong={handleRecordWrongAnswer}
        />
      )}

      {/* 8. READING PRACTICE (STORIES & COMPREHENSION) */}
      {currentModule === 'reading' && (
        <EnglishReadingView
          stories={storiesList}
          language={language}
          soundEnabled={soundEnabled}
          onBack={() => setCurrentModule('overview')}
          onLessonComplete={handleLessonCompleted}
        />
      )}

      {/* 9. REVISION CENTRE (MISTAKE BOOK & SAVED WORDS) */}
      {currentModule === 'revision' && (
        <EnglishRevisionView
          wrongAnswers={progress.wrongAnswersList}
          vocabList={vocabList}
          learnedWordIds={progress.learnedWordIds}
          language={language}
          soundEnabled={soundEnabled}
          onBack={() => setCurrentModule('overview')}
          onClearWrongAnswer={handleClearWrongAnswer}
        />
      )}

      {/* 10. MY PROGRESS & LEVEL TRACKING */}
      {currentModule === 'progress' && (
        <EnglishProgressView
          progress={progress}
          language={language}
          soundEnabled={soundEnabled}
          onBack={() => setCurrentModule('overview')}
        />
      )}
    </div>
  );
};
