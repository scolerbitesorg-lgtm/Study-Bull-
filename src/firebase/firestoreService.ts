import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db, auth } from './config';
import {
  ExamCategory,
  Subject,
  Topic,
  Question,
  MockTest,
  NoteItem,
  TypingPassage,
  EnglishSentenceItem,
  EnglishVocabItem,
  EnglishSpellingItem,
  EnglishMcqItem,
  EnglishSentenceTypingItem,
  EnglishGrammarTopic,
  EnglishStoryItem,
  HomeCustomModule,
} from '../types';
import {
  EXAM_CATEGORIES,
  SUBJECTS,
  TOPICS,
  QUESTIONS_DATABASE,
  MOCK_TESTS,
  PDF_NOTES_LIBRARY,
  TYPING_PASSAGES,
} from '../data/mockData';
import {
  DEFAULT_ENGLISH_SENTENCES,
  DEFAULT_ENGLISH_VOCAB,
  DEFAULT_ENGLISH_SPELLING,
  DEFAULT_ENGLISH_MCQ,
  DEFAULT_ENGLISH_TYPING,
  DEFAULT_ENGLISH_GRAMMAR,
  DEFAULT_ENGLISH_STORIES,
} from '../data/englishData';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path,
  };
  console.warn('Firestore Notification: ', JSON.stringify(errInfo));
}

export const FirestoreService = {
  // Real-time listener for Exam Categories
  subscribeCategories(callback: (categories: ExamCategory[]) => void) {
    const colRef = collection(db, 'categories');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          // Auto-seed if first time
          this.seedCategories();
          callback(EXAM_CATEGORIES);
        } else {
          const list: ExamCategory[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as ExamCategory);
          });
          callback(list.length > 0 ? list : EXAM_CATEGORIES);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'categories');
        callback(EXAM_CATEGORIES);
      }
    );
  },

  // Real-time listener for Subjects
  subscribeSubjects(callback: (subjects: Subject[]) => void) {
    const colRef = collection(db, 'subjects');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          this.seedSubjects();
          callback(SUBJECTS);
        } else {
          const list: Subject[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Subject);
          });
          callback(list.length > 0 ? list : SUBJECTS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'subjects');
        callback(SUBJECTS);
      }
    );
  },

  // Real-time listener for Mock Tests
  subscribeMockTests(callback: (tests: MockTest[]) => void) {
    const colRef = collection(db, 'mockTests');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          this.seedMockTests();
          callback(MOCK_TESTS);
        } else {
          const list: MockTest[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as MockTest);
          });
          callback(list.length > 0 ? list : MOCK_TESTS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'mockTests');
        callback(MOCK_TESTS);
      }
    );
  },

  // Real-time listener for PDF Notes
  subscribeNotes(callback: (notes: NoteItem[]) => void) {
    const colRef = collection(db, 'notes');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          this.seedNotes();
          callback(PDF_NOTES_LIBRARY);
        } else {
          const list: NoteItem[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as NoteItem);
          });
          callback(list.length > 0 ? list : PDF_NOTES_LIBRARY);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'notes');
        callback(PDF_NOTES_LIBRARY);
      }
    );
  },

  // Real-time listener for Typing Passages
  subscribeTypingPassages(callback: (passages: TypingPassage[]) => void) {
    const colRef = collection(db, 'typingPassages');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          this.seedTypingPassages();
          callback(TYPING_PASSAGES);
        } else {
          const list: TypingPassage[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as TypingPassage);
          });
          callback(list.length > 0 ? list : TYPING_PASSAGES);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'typingPassages');
        callback(TYPING_PASSAGES);
      }
    );
  },

  // Seeding helpers for first-time cloud setup
  async seedCategories() {
    try {
      for (const cat of EXAM_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'categories');
    }
  },

  async seedSubjects() {
    try {
      for (const sub of SUBJECTS) {
        await setDoc(doc(db, 'subjects', sub.id), sub);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'subjects');
    }
  },

  async seedMockTests() {
    try {
      for (const test of MOCK_TESTS) {
        await setDoc(doc(db, 'mockTests', test.id), test);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'mockTests');
    }
  },

  async seedNotes() {
    try {
      for (const note of PDF_NOTES_LIBRARY) {
        await setDoc(doc(db, 'notes', note.id), note);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'notes');
    }
  },

  async seedTypingPassages() {
    try {
      for (const passage of TYPING_PASSAGES) {
        await setDoc(doc(db, 'typingPassages', passage.id), passage);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'typingPassages');
    }
  },

  async seedTopics() {
    try {
      for (const subTopics of Object.values(TOPICS)) {
        for (const topic of subTopics) {
          await setDoc(doc(db, 'topics', topic.id), topic);
        }
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'topics');
    }
  },

  async seedQuestions() {
    try {
      for (const q of QUESTIONS_DATABASE) {
        await setDoc(doc(db, 'questions', q.id), q);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'questions');
    }
  },

  async ensureDefaultFirestoreData() {
    try {
      const [catSnap, subSnap, mockSnap, notesSnap] = await Promise.all([
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'subjects')),
        getDocs(collection(db, 'mockTests')),
        getDocs(collection(db, 'notes')),
      ]);

      if (catSnap.empty) {
        await this.seedCategories();
      }
      if (subSnap.empty) {
        await this.seedSubjects();
        await this.seedTopics();
        await this.seedQuestions();
      }
      if (mockSnap.empty) {
        await this.seedMockTests();
      }
      if (notesSnap.empty) {
        await this.seedNotes();
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'defaultData');
    }
  },

  // Admin dynamic updates methods (ready to be invoked by Admin Panel)
  async saveCategory(cat: ExamCategory) {
    await setDoc(doc(db, 'categories', cat.id), cat);
  },

  async saveMockTest(test: MockTest) {
    await setDoc(doc(db, 'mockTests', test.id), test);
  },

  async saveNote(note: NoteItem) {
    await setDoc(doc(db, 'notes', note.id), note);
  },

  async saveTypingPassage(passage: TypingPassage) {
    await setDoc(doc(db, 'typingPassages', passage.id), passage);
  },

  // English Learning Real-Time Subscriptions
  subscribeEnglishVocab(callback: (list: EnglishVocabItem[]) => void) {
    const colRef = collection(db, 'englishVocab');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          this.seedEnglishVocab();
          callback(DEFAULT_ENGLISH_VOCAB);
        } else {
          const list: EnglishVocabItem[] = [];
          snapshot.forEach((snap) => list.push(snap.data() as EnglishVocabItem));
          callback(list.length > 0 ? list : DEFAULT_ENGLISH_VOCAB);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'englishVocab');
        callback(DEFAULT_ENGLISH_VOCAB);
      }
    );
  },

  subscribeEnglishSentences(callback: (list: EnglishSentenceItem[]) => void) {
    const colRef = collection(db, 'englishSentences');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          this.seedEnglishSentences();
          callback(DEFAULT_ENGLISH_SENTENCES);
        } else {
          const list: EnglishSentenceItem[] = [];
          snapshot.forEach((snap) => list.push(snap.data() as EnglishSentenceItem));
          callback(list.length > 0 ? list : DEFAULT_ENGLISH_SENTENCES);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'englishSentences');
        callback(DEFAULT_ENGLISH_SENTENCES);
      }
    );
  },

  subscribeEnglishSpelling(callback: (list: EnglishSpellingItem[]) => void) {
    const colRef = collection(db, 'englishSpelling');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          this.seedEnglishSpelling();
          callback(DEFAULT_ENGLISH_SPELLING);
        } else {
          const list: EnglishSpellingItem[] = [];
          snapshot.forEach((snap) => list.push(snap.data() as EnglishSpellingItem));
          callback(list.length > 0 ? list : DEFAULT_ENGLISH_SPELLING);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'englishSpelling');
        callback(DEFAULT_ENGLISH_SPELLING);
      }
    );
  },

  subscribeEnglishMcq(callback: (list: EnglishMcqItem[]) => void) {
    const colRef = collection(db, 'englishMcq');
    return onSnapshot(
      colRef,
      async (snapshot) => {
        if (snapshot.empty) {
          this.seedEnglishMcq();
          callback(DEFAULT_ENGLISH_MCQ);
        } else {
          const rawList: { id: string; data: EnglishMcqItem }[] = [];
          snapshot.forEach((snap) => {
            const data = snap.data() as EnglishMcqItem;
            rawList.push({ id: snap.id, data: { ...data, id: snap.id } });
          });

          // Deduplicate by question text (hindiSentence) or options
          const seenKeys = new Set<string>();
          const uniqueList: EnglishMcqItem[] = [];
          const duplicateDocIdsToDelete: string[] = [];

          for (const item of rawList) {
            const sentenceKey = (item.data.hindiSentence || '').trim().toLowerCase();
            const optionsKey = (item.data.options || []).join('|').trim().toLowerCase();
            const normKey = sentenceKey ? sentenceKey : optionsKey;

            if (normKey && seenKeys.has(normKey)) {
              // Found duplicate document in Firebase
              duplicateDocIdsToDelete.push(item.id);
            } else {
              if (normKey) seenKeys.add(normKey);
              uniqueList.push(item.data);
            }
          }

          // Delete duplicate documents from Firebase in background
          if (duplicateDocIdsToDelete.length > 0) {
            for (const dupId of duplicateDocIdsToDelete) {
              try {
                await deleteDoc(doc(db, 'englishMcq', dupId));
              } catch (e) {
                console.warn('Silent cleanup of duplicate document failed:', dupId, e);
              }
            }
          }

          callback(uniqueList.length > 0 ? uniqueList : DEFAULT_ENGLISH_MCQ);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'englishMcq');
        callback(DEFAULT_ENGLISH_MCQ);
      }
    );
  },

  subscribeEnglishTyping(callback: (list: EnglishSentenceTypingItem[]) => void) {
    const colRef = collection(db, 'englishTyping');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          this.seedEnglishTyping();
          callback(DEFAULT_ENGLISH_TYPING);
        } else {
          const list: EnglishSentenceTypingItem[] = [];
          snapshot.forEach((snap) => list.push(snap.data() as EnglishSentenceTypingItem));
          callback(list.length > 0 ? list : DEFAULT_ENGLISH_TYPING);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'englishTyping');
        callback(DEFAULT_ENGLISH_TYPING);
      }
    );
  },

  subscribeEnglishGrammar(callback: (list: EnglishGrammarTopic[]) => void) {
    const colRef = collection(db, 'englishGrammar');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          this.seedEnglishGrammar();
          callback(DEFAULT_ENGLISH_GRAMMAR);
        } else {
          const list: EnglishGrammarTopic[] = [];
          snapshot.forEach((snap) => list.push(snap.data() as EnglishGrammarTopic));
          callback(list.length > 0 ? list : DEFAULT_ENGLISH_GRAMMAR);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'englishGrammar');
        callback(DEFAULT_ENGLISH_GRAMMAR);
      }
    );
  },

  subscribeEnglishStories(callback: (list: EnglishStoryItem[]) => void) {
    const colRef = collection(db, 'englishStories');
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          this.seedEnglishStories();
          callback(DEFAULT_ENGLISH_STORIES);
        } else {
          const list: EnglishStoryItem[] = [];
          snapshot.forEach((snap) => list.push(snap.data() as EnglishStoryItem));
          callback(list.length > 0 ? list : DEFAULT_ENGLISH_STORIES);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'englishStories');
        callback(DEFAULT_ENGLISH_STORIES);
      }
    );
  },

  // Seed functions for English modules
  async seedEnglishVocab() {
    try {
      for (const item of DEFAULT_ENGLISH_VOCAB) {
        await setDoc(doc(db, 'englishVocab', item.id), item);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'englishVocab');
    }
  },

  async seedEnglishSentences() {
    try {
      for (const item of DEFAULT_ENGLISH_SENTENCES) {
        await setDoc(doc(db, 'englishSentences', item.id), item);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'englishSentences');
    }
  },

  async seedEnglishSpelling() {
    try {
      for (const item of DEFAULT_ENGLISH_SPELLING) {
        await setDoc(doc(db, 'englishSpelling', item.id), item);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'englishSpelling');
    }
  },

  async seedEnglishMcq() {
    try {
      for (const item of DEFAULT_ENGLISH_MCQ) {
        await setDoc(doc(db, 'englishMcq', item.id), item);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'englishMcq');
    }
  },

  async seedEnglishTyping() {
    try {
      for (const item of DEFAULT_ENGLISH_TYPING) {
        await setDoc(doc(db, 'englishTyping', item.id), item);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'englishTyping');
    }
  },

  async seedEnglishGrammar() {
    try {
      for (const item of DEFAULT_ENGLISH_GRAMMAR) {
        await setDoc(doc(db, 'englishGrammar', item.id), item);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'englishGrammar');
    }
  },

  async seedEnglishStories() {
    try {
      for (const item of DEFAULT_ENGLISH_STORIES) {
        await setDoc(doc(db, 'englishStories', item.id), item);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'englishStories');
    }
  },

  // Admin CRUD mutations
  async saveEnglishVocab(item: EnglishVocabItem) {
    await setDoc(doc(db, 'englishVocab', item.id), item);
  },
  async deleteEnglishVocab(id: string) {
    await deleteDoc(doc(db, 'englishVocab', id));
  },

  async saveEnglishSentence(item: EnglishSentenceItem) {
    await setDoc(doc(db, 'englishSentences', item.id), item);
  },
  async deleteEnglishSentence(id: string) {
    await deleteDoc(doc(db, 'englishSentences', id));
  },

  async saveEnglishSpelling(item: EnglishSpellingItem) {
    await setDoc(doc(db, 'englishSpelling', item.id), item);
  },
  async deleteEnglishSpelling(id: string) {
    await deleteDoc(doc(db, 'englishSpelling', id));
  },

  async saveEnglishMcq(item: EnglishMcqItem) {
    await setDoc(doc(db, 'englishMcq', item.id), item);
  },
  async deleteEnglishMcq(id: string) {
    await deleteDoc(doc(db, 'englishMcq', id));
  },
  async cleanDuplicateMcqsFromFirebase() {
    try {
      const colRef = collection(db, 'englishMcq');
      const snapshot = await getDocs(colRef);
      const seen = new Set<string>();
      let removedCount = 0;

      for (const snapDoc of snapshot.docs) {
        const data = snapDoc.data() as EnglishMcqItem;
        const key = (data.hindiSentence || data.id || '').trim().toLowerCase();
        if (key && seen.has(key)) {
          await deleteDoc(doc(db, 'englishMcq', snapDoc.id));
          removedCount++;
        } else if (key) {
          seen.add(key);
        }
      }
      return removedCount;
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'englishMcq');
      return 0;
    }
  },
  async resetCleanEnglishMcq() {
    try {
      // 1. Delete existing docs in englishMcq collection
      const colRef = collection(db, 'englishMcq');
      const snapshot = await getDocs(colRef);
      for (const snapDoc of snapshot.docs) {
        await deleteDoc(doc(db, 'englishMcq', snapDoc.id));
      }
      // 2. Re-seed default clean unique set
      for (const item of DEFAULT_ENGLISH_MCQ) {
        await setDoc(doc(db, 'englishMcq', item.id), item);
      }
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'englishMcq');
      return false;
    }
  },

  async saveEnglishTypingSentence(item: EnglishSentenceTypingItem) {
    await setDoc(doc(db, 'englishTyping', item.id), item);
  },
  async deleteEnglishTypingSentence(id: string) {
    await deleteDoc(doc(db, 'englishTyping', id));
  },

  async saveEnglishGrammarTopic(item: EnglishGrammarTopic) {
    await setDoc(doc(db, 'englishGrammar', item.id), item);
  },
  async deleteEnglishGrammarTopic(id: string) {
    await deleteDoc(doc(db, 'englishGrammar', id));
  },

  async saveEnglishStory(item: EnglishStoryItem) {
    await setDoc(doc(db, 'englishStories', item.id), item);
  },
  async deleteEnglishStory(id: string) {
    await deleteDoc(doc(db, 'englishStories', id));
  },

  subscribeHomeCustomModules(callback: (list: HomeCustomModule[]) => void) {
    const colRef = collection(db, 'homeCustomModules');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: HomeCustomModule[] = [];
        snapshot.forEach((snap) => {
          const data = snap.data() as HomeCustomModule;
          if (data.active !== false) {
            list.push(data);
          }
        });
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        callback(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'homeCustomModules');
        callback([]);
      }
    );
  },

  async saveHomeCustomModule(item: HomeCustomModule) {
    await setDoc(doc(db, 'homeCustomModules', item.id), item);
  },
  async deleteHomeCustomModule(id: string) {
    await deleteDoc(doc(db, 'homeCustomModules', id));
  },
};
