import { FirestoreService } from '../firebase/firestoreService';
import {
  EnglishVocabItem,
  EnglishSentenceItem,
  EnglishSpellingItem,
  EnglishMcqItem,
  EnglishSentenceTypingItem,
  EnglishGrammarTopic,
  EnglishStoryItem,
} from '../types';

export type EnglishContentType =
  | 'vocab'
  | 'sentences'
  | 'spelling'
  | 'mcq'
  | 'typing'
  | 'grammar'
  | 'reading';

export const EnglishAiService = {
  /**
   * Generates new English learning content from the backend Groq AI engine
   * and immediately syncs it to Firebase Firestore so content never runs out.
   */
  async generateAndSync(
    type: EnglishContentType,
    level: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
    existingWords: string[] = []
  ): Promise<{ success: boolean; count: number; provider: string; error?: string }> {
    try {
      const response = await fetch('/api/ai/generate-english-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          level,
          count: 5,
          existingWords,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI generation request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !Array.isArray(data.items)) {
        throw new Error(data.error || 'Invalid AI generation response');
      }

      // Synchronize directly with Firebase Firestore in real-time
      const items = data.items;
      for (const item of items) {
        try {
          if (type === 'vocab') {
            await FirestoreService.saveEnglishVocab(item as EnglishVocabItem);
          } else if (type === 'sentences') {
            await FirestoreService.saveEnglishSentence(item as EnglishSentenceItem);
          } else if (type === 'spelling') {
            await FirestoreService.saveEnglishSpelling(item as EnglishSpellingItem);
          } else if (type === 'mcq') {
            await FirestoreService.saveEnglishMcq(item as EnglishMcqItem);
          } else if (type === 'typing') {
            await FirestoreService.saveEnglishTypingSentence(item as EnglishSentenceTypingItem);
          } else if (type === 'grammar') {
            await FirestoreService.saveEnglishGrammarTopic(item as EnglishGrammarTopic);
          } else if (type === 'reading') {
            await FirestoreService.saveEnglishStory(item as EnglishStoryItem);
          }
        } catch (dbErr) {
          console.warn('Failed to sync item to Firestore, continuing:', dbErr);
        }
      }

      return {
        success: true,
        count: items.length,
        provider: data.provider || 'groq',
      };
    } catch (err: any) {
      console.error('Error generating and syncing English content:', err);
      return {
        success: false,
        count: 0,
        provider: 'none',
        error: err.message,
      };
    }
  },

  async getStatus(): Promise<{ groqConfigured: boolean; geminiConfigured: boolean; activeProvider: string }> {
    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    return { groqConfigured: false, geminiConfigured: false, activeProvider: 'built-in' };
  },
};
