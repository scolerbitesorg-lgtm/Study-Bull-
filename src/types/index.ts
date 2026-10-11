export type Language = 'hi' | 'en';

export type MainSection = 'menu' | 'quiz' | 'mock' | 'notes' | 'typing' | 'calculations' | 'english';

export interface ExamCategory {
  id: string;
  name: string;
  icon: string;
  active: boolean;
  badge?: string;
  category: 'SSC' | 'Police' | 'Railway' | 'Other';
  description: string;
  testCount: number;
}

export interface Subject {
  id: string;
  name: string;
  nameHi: string;
  icon: string;
  color?: string;
  topicCount: number;
  questionCount: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  nameHi: string;
  questionCount: number;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
}

export interface Question {
  id: string;
  topicId?: string;
  subjectId?: string;
  examId?: string;
  questionEn: string;
  questionHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctIndex: number;
  explanationEn: string;
  explanationHi: string;
  section?: string;
}

export interface MockTest {
  id: string;
  examId: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  positiveMarks: number;
  negativeMarks: number;
  free: boolean;
  sections: string[];
  questions: Question[];
}

export type QuestionStatus = 'answered' | 'not-answered' | 'marked-review' | 'not-visited';

export interface NoteItem {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  description: string;
  pagesCount: number;
  fileSizeBytes?: string;
  downloadFilename?: string;
  tags?: string[];
  content: {
    chapter: string;
    sections: {
      heading: string;
      points: string[];
      keyTable?: { headers: string[]; rows: string[][] };
      proTip?: string;
    }[];
  };
}

export interface QuizAttempt {
  topicId: string;
  topicName: string;
  subjectName: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skipped: number;
  timeSpentSeconds: number;
  score: number;
  date: string;
  details: {
    questionId: string;
    selectedOption: number | null;
    isCorrect: boolean;
  }[];
}

export interface MockAttempt {
  testId: string;
  testTitle: string;
  examId: string;
  answers: Record<number, number>;
  statusMap: Record<number, QuestionStatus>;
  timeSpentSeconds: number;
  totalMarks: number;
  scoreObtained: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  accuracy: number;
  date: string;
}

export interface TypingPassage {
  id: string;
  title: string;
  category: string;
  content: string;
  wordCount: number;
}

export interface TypingResult {
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  mistakes: number;
  timeSpentSeconds: number;
  passedSscCriteria: boolean;
}

export type EnglishProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

export type EnglishSubModule =
  | 'overview'
  | 'sentences'
  | 'vocabulary'
  | 'spelling'
  | 'mcq'
  | 'typing'
  | 'grammar'
  | 'reading'
  | 'revision'
  | 'progress';

export interface EnglishSentenceItem {
  id: string;
  english: string;
  hindi: string;
  situation: string;
  level: EnglishProficiencyLevel;
  audioPronunciation?: string;
  tip?: string;
}

export interface EnglishVocabItem {
  id: string;
  word: string;
  hindiMeaning: string;
  simpleExplanation: string;
  exampleSentence: string;
  exampleSentenceHi: string;
  level: EnglishProficiencyLevel;
  synonyms: string[];
  antonyms: string[];
  mnemonicHint: string;
  partOfSpeech: string;
}

export interface EnglishSpellingItem {
  id: string;
  word: string;
  hindiMeaning: string;
  phoneticHint: string;
  mnemonicRule: string;
  breakdown: string[]; // e.g. ["Pneu", "mo", "nia"]
  level: EnglishProficiencyLevel;
  trickyPartExplanation?: string;
  exampleSentence?: string;
}

export interface EnglishMcqItem {
  id: string;
  hindiSentence: string;
  options: string[];
  correctIndex: number;
  explanationHi: string;
  grammarRuleTag: string;
  level: EnglishProficiencyLevel;
}

export interface EnglishSentenceTypingItem {
  id: string;
  hindiSentence: string;
  targetEnglish: string;
  acceptedVariations: string[];
  grammarTipHi: string;
  level: EnglishProficiencyLevel;
  difficulty?: string;
}

export interface EnglishGrammarTopic {
  id: string;
  titleHi: string;
  titleEn: string;
  category: 'Tenses' | 'Parts of Speech' | 'Voice & Narration' | 'Golden Rules' | 'Modals';
  level: EnglishProficiencyLevel;
  conceptHi: string;
  rules: {
    ruleTitle: string;
    explanationHi: string;
    wrongSentence: string;
    correctSentence: string;
    examTrapHi: string;
  }[];
  miniQuiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanationHi: string;
  }[];
}

export interface EnglishStoryParagraph {
  english: string;
  hindi: string;
  vocabNotes?: { word: string; meaning: string }[];
}

export interface EnglishStoryItem {
  id: string;
  titleEn: string;
  titleHi: string;
  level: EnglishProficiencyLevel;
  estimatedMinutes: number;
  paragraphs: EnglishStoryParagraph[];
  comprehensionQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanationHi: string;
  }[];
}

export interface UserWrongAnswerItem {
  id: string;
  type: 'mcq' | 'spelling' | 'typing' | 'grammar';
  question: string;
  correctAnswer: string;
  userAnswer: string;
  explanationHi: string;
  timestamp: string;
}

export interface UserEnglishProgress {
  learnedWordIds: string[];
  completedLessonIds: string[];
  sentencesPracticedCount: number;
  spellingDrillsCompletedCount: number;
  wrongAnswersList: UserWrongAnswerItem[];
  currentLevel: EnglishProficiencyLevel;
  streakDays: number;
  totalScore: number;
  lastActive: string;
}
