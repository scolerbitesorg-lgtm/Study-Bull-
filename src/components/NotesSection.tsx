import React, { useState, useEffect } from 'react';
import { Subject, Topic, NoteItem, Language } from '../types';
import { SUBJECTS, TOPICS, PDF_NOTES_LIBRARY } from '../data/mockData';
import { FirestoreService } from '../firebase/firestoreService';
import { PdfReaderModal } from './PdfReaderModal';
import { StorageService } from '../services/storageService';
import { playTapSound } from '../utils/audio';
import { ArrowLeft, FileText, ChevronRight } from 'lucide-react';

interface NotesSectionProps {
  language: Language;
  soundEnabled: boolean;
  onNavigateHome?: () => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  language,
  soundEnabled,
  onNavigateHome,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>(() =>
    StorageService.getCachedData('notes_subjects', SUBJECTS)
  );
  const [notesList, setNotesList] = useState<NoteItem[]>(() =>
    StorageService.getCachedData('notes_list', PDF_NOTES_LIBRARY)
  );
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activePdfNote, setActivePdfNote] = useState<NoteItem | null>(null);

  useEffect(() => {
    const unsubSubs = FirestoreService.subscribeSubjects((list) => {
      if (list && list.length > 0) {
        setSubjects(list);
        StorageService.saveCachedData('notes_subjects', list);
      }
    });
    const unsubNotes = FirestoreService.subscribeNotes((list) => {
      if (list && list.length > 0) {
        setNotesList(list);
        StorageService.saveCachedData('notes_list', list);
      }
    });
    return () => {
      unsubSubs();
      unsubNotes();
    };
  }, []);

  // Step-by-step mobile hardware and gesture back button handler (Hash & Popstate synced)
  useEffect(() => {
    const syncFromNavigation = () => {
      const hash = window.location.hash || '';
      const state = window.history.state || {};

      if (hash.startsWith('#/notes') || state.section === 'notes') {
        const parts = hash.replace(/^#\/?/, '').split('/');
        // parts[0] is 'notes', parts[1] is subjectId, parts[2] is topicId
        const subjId = parts[1] || state.notesSubjectId;
        const topId = parts[2] || state.notesTopicId;

        if (topId) {
          // Inside PDF note
          const subj = subjects.find((s) => s.id === subjId) || SUBJECTS.find((s) => s.id === subjId) || null;
          if (subj) setSelectedSubject(subj);
          const subjectNote = notesList.find((n) => n.subjectId === subjId) || notesList[0] || PDF_NOTES_LIBRARY[0];
          const topicList: Topic[] = (subjId && TOPICS[subjId]) || [];
          const topic = topicList.find((t) => t.id === topId);
          if (topic) {
            setActivePdfNote({
              ...subjectNote,
              id: `note_${topic.id}`,
              title: `${language === 'hi' ? topic.nameHi : topic.name} [PDF Revision Notes]`,
              downloadFilename: `${topic.name.replace(/[^a-zA-Z0-9]/g, '_')}_Notes.pdf`,
            });
          }
        } else if (subjId) {
          // Stepped back from PDF note -> now in topic notes of this subject!
          setActivePdfNote(null);
          const subj = subjects.find((s) => s.id === subjId) || SUBJECTS.find((s) => s.id === subjId) || null;
          setSelectedSubject(subj);
        } else {
          // Subject folders root
          setActivePdfNote(null);
          setSelectedSubject(null);
        }
      }
    };

    window.addEventListener('popstate', syncFromNavigation);
    window.addEventListener('hashchange', syncFromNavigation);
    syncFromNavigation();

    return () => {
      window.removeEventListener('popstate', syncFromNavigation);
      window.removeEventListener('hashchange', syncFromNavigation);
    };
  }, [subjects, notesList, language]);

  const handleSelectSubject = (subject: Subject) => {
    playTapSound(soundEnabled);
    setSelectedSubject(subject);
    setActivePdfNote(null);
    window.history.pushState({ section: 'notes', notesSubjectId: subject.id }, '', `#/notes/${subject.id}`);
  };

  const handleOpenTopicNote = (topic: Topic) => {
    playTapSound(soundEnabled);
    // Find note matching this subject
    const subjectNote = notesList.find((n) => n.subjectId === selectedSubject?.id) || notesList[0] || PDF_NOTES_LIBRARY[0];
    
    // Adapt note title to this specific topic
    const topicNote: NoteItem = {
      ...subjectNote,
      id: `note_${topic.id}`,
      title: `${language === 'hi' ? topic.nameHi : topic.name} [PDF Revision Notes]`,
      downloadFilename: `${topic.name.replace(/[^a-zA-Z0-9]/g, '_')}_Notes.pdf`,
    };
    setActivePdfNote(topicNote);
    const subjId = selectedSubject?.id || topic.subjectId;
    window.history.pushState(
      { section: 'notes', notesSubjectId: subjId, notesTopicId: topic.id },
      '',
      `#/notes/${subjId}/${topic.id}`
    );
  };

  // STEP 2: INSIDE SUBJECT FOLDER -> SHOW TOPICS
  if (selectedSubject) {
    const topics = TOPICS[selectedSubject.id] || [
      { id: `${selectedSubject.id}_1`, subjectId: selectedSubject.id, name: 'Important Revision Points', nameHi: 'महत्वपूर्ण पुनरावृत्ति नोट्स', questionCount: 10, difficulty: 'Easy' },
      { id: `${selectedSubject.id}_2`, subjectId: selectedSubject.id, name: 'Quick Formula & Facts', nameHi: 'त्वरित सूत्र एवं मुख्य तथ्य', questionCount: 15, difficulty: 'Moderate' },
    ];

    return (
      <div className="max-w-md mx-auto px-4 py-4 pb-20">
        {/* Back and Title */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => {
              playTapSound(soundEnabled);
              window.history.back();
            }}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{selectedSubject.icon}</span>
              <span>{language === 'hi' ? selectedSubject.nameHi : selectedSubject.name}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {language === 'hi' ? 'टॉपिक चुनें और PDF नोट्स पढ़ें' : 'Select a topic to open PDF notes'}
            </p>
          </div>
        </div>

        {/* Topics List as Clean Touch Rows */}
        <div className="space-y-2.5">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleOpenTopicNote(topic)}
              className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 text-left shadow-xs hover:border-blue-400 active:scale-95 active:bg-blue-50/50 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 group-hover:text-blue-700 block leading-tight">
                    {language === 'hi' ? topic.nameHi : topic.name}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                    {language === 'hi' ? 'PDF नोट्स · तुरंत पढ़ें' : 'PDF Notes · Instant Read'}
                  </span>
                </div>
              </div>

              <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-500 flex items-center justify-center transition-colors shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>

        {/* In-App PDF Reader Modal */}
        {activePdfNote && (
          <PdfReaderModal
            note={activePdfNote}
            isOpen={!!activePdfNote}
            onClose={() => {
              playTapSound(soundEnabled);
              window.history.back();
            }}
            language={language}
            soundEnabled={soundEnabled}
          />
        )}
      </div>
    );
  }

  // STEP 1: ALL SUBJECTS AS 2-COLUMN FOLDERS (Exact screenshot button style)
  return (
    <div className="max-w-md mx-auto px-4 py-3 pb-20">
      <div className="mb-3 text-center">
        <h2 className="text-base font-bold text-slate-900">
          {language === 'hi' ? 'विषयवार PDF नोट्स लाइब्रेरी' : 'Subject-Wise PDF Notes'}
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {language === 'hi' ? 'विषय चुनें और इन-ऐप PDF नोट्स पढ़ें' : 'Choose subject to view topic notes'}
        </p>
      </div>

      {/* 2-Column Grid Button Blocks */}
      <div className="grid grid-cols-2 gap-3">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => handleSelectSubject(subject)}
            type="button"
            className="relative flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 active:scale-95 active:bg-blue-50/60 active:border-blue-400 active:shadow-inner transition-all duration-150 cursor-pointer min-h-[110px] select-none text-left w-full group"
          >
            {/* Top Right Green Dot Indicator */}
            <div className="absolute top-3 right-3 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 group-hover:scale-110 transition-transform" />
            </div>

            {/* Subject Center Icon */}
            <div className="text-3xl filter drop-shadow-xs group-hover:scale-105 transition-transform duration-150 mt-1">
              {subject.icon}
            </div>

            {/* Subject Title */}
            <div className="mt-2.5 text-center px-1">
              <span className="block text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-700 tracking-tight leading-snug">
                {language === 'hi' ? subject.nameHi : subject.name}
              </span>
              <span className="block text-[11px] text-slate-500 font-medium mt-0.5">
                {(TOPICS[subject.id] || []).length || 2} {language === 'hi' ? 'अध्याय (Chapter PDF)' : 'Topics'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
