import { QuizAttempt, MockAttempt } from '../types';
import { DEFAULT_HOME_BUTTONS } from '../data/mockData';

const STORAGE_KEYS = {
  BOOKMARKS: 'studybull_bookmarks',
  QUIZ_HISTORY: 'studybull_quiz_history',
  MOCK_HISTORY: 'studybull_mock_history',
  SETTINGS: 'studybull_settings',
  STREAK: 'studybull_streak',
};

export interface AppSettings {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  language: 'hi' | 'en';
}

export const StorageService = {
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return {
      soundEnabled: true,
      hapticEnabled: true,
      language: 'hi', // Default Hindi as requested for Study Bull
    };
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  },

  getBookmarks(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return [];
  },

  toggleBookmark(questionId: string): boolean {
    const list = this.getBookmarks();
    const idx = list.indexOf(questionId);
    let bookmarked = false;
    if (idx >= 0) {
      list.splice(idx, 1);
      bookmarked = false;
    } else {
      list.push(questionId);
      bookmarked = true;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list));
    } catch {
      // ignore
    }
    return bookmarked;
  },

  saveQuizAttempt(attempt: QuizAttempt): void {
    try {
      const existing = this.getQuizHistory();
      existing.unshift(attempt);
      localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(existing.slice(0, 50)));
      this.incrementStreak();
    } catch {
      // ignore
    }
  },

  getQuizHistory(): QuizAttempt[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return [];
  },

  saveMockAttempt(attempt: MockAttempt): void {
    try {
      const existing = this.getMockHistory();
      existing.unshift(attempt);
      localStorage.setItem(STORAGE_KEYS.MOCK_HISTORY, JSON.stringify(existing.slice(0, 50)));
      this.incrementStreak();
    } catch {
      // ignore
    }
  },

  getEnglishProgress(): import('../types').UserEnglishProgress {
    try {
      const data = localStorage.getItem('studybull_english_progress');
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return {
      learnedWordIds: [],
      completedLessonIds: [],
      sentencesPracticedCount: 0,
      spellingDrillsCompletedCount: 0,
      wrongAnswersList: [],
      currentLevel: 'beginner',
      streakDays: 3,
      totalScore: 0,
      lastActive: new Date().toISOString(),
    };
  },

  saveEnglishProgress(progress: import('../types').UserEnglishProgress): void {
    try {
      localStorage.setItem('studybull_english_progress', JSON.stringify(progress));
    } catch {
      // ignore
    }
  },

  markWordLearned(wordId: string): void {
    const p = this.getEnglishProgress();
    if (!p.learnedWordIds.includes(wordId)) {
      p.learnedWordIds.push(wordId);
      p.totalScore += 10;
      this.saveEnglishProgress(p);
    }
  },

  addWrongAnswer(wrong: import('../types').UserWrongAnswerItem): void {
    const p = this.getEnglishProgress();
    // Keep max 50 mistakes
    const filtered = p.wrongAnswersList.filter((item) => item.question !== wrong.question);
    filtered.unshift(wrong);
    p.wrongAnswersList = filtered.slice(0, 50);
    this.saveEnglishProgress(p);
  },

  removeWrongAnswer(id: string): void {
    const p = this.getEnglishProgress();
    p.wrongAnswersList = p.wrongAnswersList.filter((item) => item.id !== id);
    this.saveEnglishProgress(p);
  },

  recordSentencePracticed(): void {
    const p = this.getEnglishProgress();
    p.sentencesPracticedCount += 1;
    p.totalScore += 5;
    this.saveEnglishProgress(p);
  },

  recordLessonCompleted(lessonId: string): void {
    const p = this.getEnglishProgress();
    if (!p.completedLessonIds.includes(lessonId)) {
      p.completedLessonIds.push(lessonId);
      p.totalScore += 25;
      this.saveEnglishProgress(p);
    }
  },

  getMockHistory(): MockAttempt[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MOCK_HISTORY);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return [];
  },

  getStreak(): number {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STREAK);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.count || 3;
      }
    } catch {
      // ignore
    }
    return 3;
  },

  incrementStreak(): void {
    try {
      const current = this.getStreak();
      localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify({ count: current + 1, lastActive: new Date().toISOString() }));
    } catch {
      // ignore
    }
  },

  getSeenEnglishQuestions(): Set<string> {
    try {
      const data = localStorage.getItem('studybull_seen_english_questions_v2');
      if (data) {
        const arr = JSON.parse(data);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch {
      // ignore
    }
    return new Set();
  },

  addSeenEnglishQuestion(key: string): void {
    if (!key || !key.trim()) return;
    try {
      const set = this.getSeenEnglishQuestions();
      const normKey = key.trim().toLowerCase();
      if (!set.has(normKey)) {
        set.add(normKey);
        const arr = Array.from(set);
        if (arr.length > 5000) arr.splice(0, arr.length - 4000);
        localStorage.setItem('studybull_seen_english_questions_v2', JSON.stringify(arr));
      }
    } catch {
      // ignore
    }
  },

  getCachedHomeCustomModules(): import('../types').HomeCustomModule[] {
    try {
      const data = localStorage.getItem('studybull_cached_custom_modules');
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_HOME_BUTTONS;
  },

  saveCachedHomeCustomModules(modules: import('../types').HomeCustomModule[]): void {
    try {
      localStorage.setItem('studybull_cached_custom_modules', JSON.stringify(modules));
    } catch {
      // ignore
    }
  },

  getCachedCounts(): {
    mcq: number;
    spelling: number;
    sentences: number;
    vocab: number;
    typing: number;
    grammar: number;
    stories: number;
    mock: number;
    notes: number;
    passages: number;
    quizTotal: number;
  } {
    const trueDefaults = {
      mcq: 25,
      spelling: 25,
      sentences: 25,
      vocab: 25,
      typing: 25,
      grammar: 12,
      stories: 8,
      mock: 5,
      notes: 8,
      passages: 7,
      quizTotal: 20,
    };
    try {
      const data = localStorage.getItem('studybull_cached_counts');
      if (data) {
        const parsed = JSON.parse(data);
        // Prevent legacy 850 or invalid counts from showing for a few seconds
        if (parsed.quizTotal === 850 || !parsed.quizTotal) {
          parsed.quizTotal = 20;
        }
        return { ...trueDefaults, ...parsed };
      }
    } catch {
      // ignore
    }
    return trueDefaults;
  },

  saveCachedCounts(counts: any): void {
    try {
      localStorage.setItem('studybull_cached_counts', JSON.stringify(counts));
    } catch {
      // ignore
    }
  },

  getCachedData<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(`studybull_cached_${key}`);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return fallback;
  },

  saveCachedData<T>(key: string, data: T): void {
    try {
      localStorage.setItem(`studybull_cached_${key}`, JSON.stringify(data));
    } catch {
      // ignore
    }
  }
};
