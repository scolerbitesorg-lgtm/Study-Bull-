import React, { useState } from 'react';
import { HomeCustomModule, CustomSubSection, CustomQuizQuestion, Language } from '../../types';
import { FirestoreService } from '../../firebase/firestoreService';
import { playTapSound } from '../../utils/audio';
import { DEFAULT_HOME_BUTTONS } from '../../data/mockData';
import {
  Plus,
  Trash2,
  Edit3,
  X,
  Layers,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  FileText,
  HelpCircle,
  Code,
  Link2,
  Bell,
  Settings,
  FolderPlus,
  BookOpen,
  Check,
  AlertCircle
} from 'lucide-react';

interface HomeButtonsAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  soundEnabled: boolean;
}

const QUICK_EMOJIS = ['⚡', '🎯', '📖', '🚀', '💡', '🧮', '📄', '📝', '🏆', '📰', '🏛️', '🔬', '🔍', '⭐', '🎓', '📚'];

export const HomeButtonsAdminModal: React.FC<HomeButtonsAdminModalProps> = ({
  isOpen,
  onClose,
  language,
  soundEnabled,
}) => {
  const [customModulesList, setCustomModulesList] = useState<HomeCustomModule[]>([]);
  const [activeView, setActiveView] = useState<'list' | 'add_button' | 'manage_sections'>('list');
  const [selectedModule, setSelectedModule] = useState<HomeCustomModule | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Form states for creating/editing a home button
  const [btnTitle, setBtnTitle] = useState('');
  const [btnTitleHi, setBtnTitleHi] = useState('');
  const [btnSubtitle, setBtnSubtitle] = useState('');
  const [btnSubtitleHi, setBtnSubtitleHi] = useState('');
  const [btnIcon, setBtnIcon] = useState('📂');
  const [btnBadge, setBtnBadge] = useState('NEW');
  const [btnActionType, setBtnActionType] = useState<HomeCustomModule['actionType']>('nested_sections');
  const [btnDirectCode, setBtnDirectCode] = useState('');
  const [btnDirectLink, setBtnDirectLink] = useState('');

  // Form states for adding a nested section inside a button
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [secTitle, setSecTitle] = useState('');
  const [secTitleHi, setSecTitleHi] = useState('');
  const [secDesc, setSecDesc] = useState('');
  const [secDescHi, setSecDescHi] = useState('');
  const [secIcon, setSecIcon] = useState('📌');
  const [secBadge, setSecBadge] = useState('');
  const [secType, setSecType] = useState<'notes' | 'quiz' | 'code' | 'link'>('notes');
  const [secNotes, setSecNotes] = useState('');
  const [secCode, setSecCode] = useState('');
  const [secLink, setSecLink] = useState('');

  // Quiz Builder states for MCQ section
  const [secQuestions, setSecQuestions] = useState<CustomQuizQuestion[]>([]);
  const [qText, setQText] = useState('');
  const [qTextHi, setQTextHi] = useState('');
  const [qOpt0, setQOpt0] = useState('');
  const [qOpt1, setQOpt1] = useState('');
  const [qOpt2, setQOpt2] = useState('');
  const [qOpt3, setQOpt3] = useState('');
  const [qCorrect, setQCorrect] = useState(0);
  const [qExp, setQExp] = useState('');

  // Firebase Full Sync States
  const [isUploadingAll, setIsUploadingAll] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');
  const [uploadProgressPercent, setUploadProgressPercent] = useState(0);
  const [uploadSuccessDetails, setUploadSuccessDetails] = useState<{ totalUploaded: number; details: Record<string, number> } | null>(null);

  // Subscribe to real-time home custom modules from Firestore
  React.useEffect(() => {
    if (!isOpen) return;
    const unsub = FirestoreService.subscribeHomeCustomModules((list) => {
      const existingIds = new Set(list.map((m) => m.id));
      const missingDefaults = DEFAULT_HOME_BUTTONS.filter((d) => !existingIds.has(d.id));
      const combined = [...list, ...missingDefaults].sort((a, b) => a.order - b.order);
      setCustomModulesList(combined);
      if (selectedModule) {
        const updated = combined.find((m) => m.id === selectedModule.id);
        if (updated) setSelectedModule(updated);
      }
    });
    return () => unsub();
  }, [isOpen, selectedModule]);

  const handleUploadAllData = async () => {
    setIsUploadingAll(true);
    setUploadProgressMsg('फायरबेस कनेक्शन शुरू हो रहा है...');
    setUploadProgressPercent(0);
    setUploadSuccessDetails(null);
    try {
      const result = await FirestoreService.uploadAllAppDataToFirestore((step, percent) => {
        setUploadProgressMsg(step);
        setUploadProgressPercent(percent);
      });
      setUploadSuccessDetails(result);
      showToast(`🎉 कुल ${result.totalUploaded} रिकॉर्ड्स फायरबेस में सफलतापूर्वक अपलोड हुए!`);
    } catch {
      alert('अपलोड में समस्या आई। कृपया इंटरनेट व फायरबेस कनेक्शन जांचें।');
    } finally {
      setIsUploadingAll(false);
    }
  };

  const showToast = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  if (!isOpen) return null;

  // 1. SAVE NEW HOME SCREEN BUTTON
  const handleSaveButton = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!btnTitle.trim()) return;
    playTapSound(soundEnabled);

    const newMod: HomeCustomModule = {
      id: selectedModule && activeView === 'add_button' ? selectedModule.id : `btn_${Date.now()}`,
      title: btnTitle.trim(),
      titleHi: btnTitleHi.trim() || btnTitle.trim(),
      subtitle: btnSubtitle.trim() || 'Custom Section',
      subtitleHi: btnSubtitleHi.trim() || btnSubtitle.trim() || 'कस्टम सेक्शन',
      icon: btnIcon.trim() || '📂',
      badge: btnBadge.trim() || undefined,
      actionType: btnActionType,
      actionTarget: btnDirectLink.trim() || undefined,
      contentCode: btnDirectCode.trim() || undefined,
      subSections: selectedModule?.subSections || [],
      order: selectedModule ? selectedModule.order : customModulesList.length + 1,
      active: true,
      createdAt: selectedModule?.createdAt || new Date().toISOString(),
    };

    await FirestoreService.saveHomeCustomModule(newMod);
    showToast(`✅ होम बटन "${newMod.title}" सफलतापूर्वक सेव हुआ!`);
    resetButtonForm();
    setActiveView('list');
  };

  const resetButtonForm = () => {
    setBtnTitle('');
    setBtnTitleHi('');
    setBtnSubtitle('');
    setBtnSubtitleHi('');
    setBtnIcon('📂');
    setBtnBadge('NEW');
    setBtnActionType('nested_sections');
    setBtnDirectCode('');
    setBtnDirectLink('');
    setSelectedModule(null);
  };

  const handleEditButton = (mod: HomeCustomModule) => {
    playTapSound(soundEnabled);
    setSelectedModule(mod);
    setBtnTitle(mod.title);
    setBtnTitleHi(mod.titleHi);
    setBtnSubtitle(mod.subtitle || '');
    setBtnSubtitleHi(mod.subtitleHi || '');
    setBtnIcon(mod.icon || '📂');
    setBtnBadge(mod.badge || '');
    setBtnActionType(mod.actionType || 'nested_sections');
    setBtnDirectCode(mod.contentCode || '');
    setBtnDirectLink(mod.actionTarget || '');
    setActiveView('add_button');
  };

  const handleDeleteButton = async (id: string) => {
    if (confirm('क्या आप वाकई इस होम स्क्रीन बटन को हटाना चाहते हैं?')) {
      playTapSound(soundEnabled);
      await FirestoreService.deleteHomeCustomModule(id);
      showToast('🗑️ बटन हटा दिया गया!');
      if (selectedModule?.id === id) {
        setSelectedModule(null);
        setActiveView('list');
      }
    }
  };

  // 2. OPEN SECTIONS BUILDER FOR A BUTTON
  const handleOpenSectionsManager = (mod: HomeCustomModule) => {
    playTapSound(soundEnabled);
    setSelectedModule(mod);
    setIsAddingSection(false);
    resetSectionForm();
    setActiveView('manage_sections');
  };

  const resetSectionForm = () => {
    setEditingSectionId(null);
    setSecTitle('');
    setSecTitleHi('');
    setSecDesc('');
    setSecDescHi('');
    setSecIcon('📌');
    setSecBadge('');
    setSecType('notes');
    setSecNotes('');
    setSecCode('');
    setSecLink('');
    setSecQuestions([]);
    resetQuestionForm();
  };

  const resetQuestionForm = () => {
    setQText('');
    setQTextHi('');
    setQOpt0('');
    setQOpt1('');
    setQOpt2('');
    setQOpt3('');
    setQCorrect(0);
    setQExp('');
  };

  // Add question to active section being edited
  const handleAddQuestionToSection = () => {
    if (!qText.trim() || !qOpt0.trim() || !qOpt1.trim()) {
      alert('कृपया प्रश्न और कम से कम 2 विकल्प भरें।');
      return;
    }
    const q: CustomQuizQuestion = {
      id: `q_${Date.now()}`,
      question: qText.trim(),
      questionHi: qTextHi.trim() || qText.trim(),
      options: [qOpt0.trim(), qOpt1.trim(), qOpt2.trim() || 'N/A', qOpt3.trim() || 'N/A'],
      optionsHi: [qOpt0.trim(), qOpt1.trim(), qOpt2.trim() || 'N/A', qOpt3.trim() || 'N/A'],
      correctIndex: qCorrect,
      explanation: qExp.trim(),
      explanationHi: qExp.trim(),
    };
    setSecQuestions([...secQuestions, q]);
    resetQuestionForm();
    playTapSound(soundEnabled);
  };

  // Save nested section into selected button
  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule || !secTitle.trim()) return;
    playTapSound(soundEnabled);

    const currentSections = selectedModule.subSections ? [...selectedModule.subSections] : [];
    const newSec: CustomSubSection = {
      id: editingSectionId || `sec_${Date.now()}`,
      title: secTitle.trim(),
      titleHi: secTitleHi.trim() || secTitle.trim(),
      description: secDesc.trim() || undefined,
      descriptionHi: secDescHi.trim() || secDesc.trim() || undefined,
      icon: secIcon.trim() || '📌',
      badge: secBadge.trim() || undefined,
      contentType: secType,
      notesContent: secType === 'notes' ? secNotes.trim() : undefined,
      quizQuestions: secType === 'quiz' ? secQuestions : undefined,
      contentCode: secType === 'code' ? secCode.trim() : undefined,
      linkUrl: secType === 'link' ? secLink.trim() : undefined,
    };

    let updatedList: CustomSubSection[];
    if (editingSectionId) {
      updatedList = currentSections.map((s) => (s.id === editingSectionId ? newSec : s));
    } else {
      updatedList = [...currentSections, newSec];
    }

    const updatedModule: HomeCustomModule = {
      ...selectedModule,
      actionType: 'nested_sections',
      subSections: updatedList,
    };

    await FirestoreService.saveHomeCustomModule(updatedModule);
    setSelectedModule(updatedModule);
    showToast(`✅ सेक्शन "${newSec.title}" बटन में जोड़ दिया गया!`);
    resetSectionForm();
    setIsAddingSection(false);
  };

  const handleEditSection = (sec: CustomSubSection) => {
    playTapSound(soundEnabled);
    setEditingSectionId(sec.id);
    setSecTitle(sec.title);
    setSecTitleHi(sec.titleHi);
    setSecDesc(sec.description || '');
    setSecDescHi(sec.descriptionHi || '');
    setSecIcon(sec.icon || '📌');
    setSecBadge(sec.badge || '');
    setSecType(sec.contentType);
    setSecNotes(sec.notesContent || '');
    setSecCode(sec.contentCode || '');
    setSecLink(sec.linkUrl || '');
    setSecQuestions(sec.quizQuestions || []);
    setIsAddingSection(true);
  };

  const handleDeleteSection = async (secId: string) => {
    if (!selectedModule) return;
    if (confirm('क्या आप वाकई इस सब-सेक्शन को हटाना चाहते हैं?')) {
      playTapSound(soundEnabled);
      const updatedList = (selectedModule.subSections || []).filter((s) => s.id !== secId);
      const updatedModule: HomeCustomModule = {
        ...selectedModule,
        subSections: updatedList,
      };
      await FirestoreService.saveHomeCustomModule(updatedModule);
      setSelectedModule(updatedModule);
      showToast('🗑️ सब-सेक्शन हटा दिया गया');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {activeView !== 'list' && (
              <button
                type="button"
                onClick={() => {
                  playTapSound(soundEnabled);
                  if (isAddingSection) setIsAddingSection(false);
                  else setActiveView('list');
                }}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-all cursor-pointer text-amber-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight leading-tight flex items-center gap-1.5">
                <span>होम स्क्रीन & सेक्शन एडमिन</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                  Firebase
                </span>
              </h2>
              <p className="text-[11px] text-blue-200 font-medium">
                {activeView === 'list' && 'होम स्क्रीन पर नए बटन व अंदर सेक्शन्स प्रबंधित करें'}
                {activeView === 'add_button' && 'नया होम बटन बनाएं / संपादित करें'}
                {activeView === 'manage_sections' && `बटन: "${selectedModule?.title}" के अंदर सेक्शन्स`}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound(soundEnabled);
              onClose();
            }}
            className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {statusMsg && (
          <div className="bg-emerald-600 text-white py-2 px-4 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* VIEW 1: ALL HOME BUTTONS LIST */}
          {activeView === 'list' && (
            <div className="space-y-4">
              {/* Firebase Cloud Sync Banner: Upload All App Data A to Z */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-4 border border-indigo-800 shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🚀</span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-white">
                        Firebase Cloud डेटा सिंक (A to Z)
                      </h4>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                        1-Click Sync
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-200 mt-1 max-w-sm">
                      ऐप के सभी होम बटन्स, प्रश्न (MCQs), मॉक टेस्ट, PDF नोट्स, टाइपिंग पैसेज व इंग्लिश बूस्टर डेटा को फायरबेस डेटाबेस में अपलोड करें।
                    </p>
                  </div>
                  <button
                    onClick={handleUploadAllData}
                    disabled={isUploadingAll}
                    type="button"
                    className="w-full sm:w-auto px-3.5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 text-xs font-black rounded-xl shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    <span>{isUploadingAll ? 'अपलोड हो रहा है...' : '☁️ सारा डेटा फायरबेस में डालें'}</span>
                  </button>
                </div>

                {isUploadingAll && (
                  <div className="mt-3 pt-3 border-t border-indigo-800/60 space-y-1.5 animate-in fade-in">
                    <div className="flex justify-between text-[11px] font-bold text-amber-300">
                      <span>{uploadProgressMsg}</span>
                      <span>{uploadProgressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-indigo-700">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-200"
                        style={{ width: `${uploadProgressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadSuccessDetails && !isUploadingAll && (
                  <div className="mt-3 pt-3 border-t border-indigo-800/60 text-[11px] text-emerald-300 flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      सफलतापूर्वक कुल {uploadSuccessDetails.totalUploaded} रिकॉर्ड्स (होम बटन्स, प्रश्न, टेस्ट, नोट्स, पैसेज, इंग्लिश सामग्री) फायरबेस में अपलोड हो गए!
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">
                    होम स्क्रीन बटन्स ({customModulesList.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    होम स्क्रीन पर लाइव दिखाई देने वाले मुख्य व कस्टम बटन्स
                  </p>
                </div>
                <button
                  onClick={() => {
                    playTapSound(soundEnabled);
                    resetButtonForm();
                    setActiveView('add_button');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ नया बटन जोड़ें</span>
                </button>
              </div>

              {customModulesList.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
                  <div className="text-3xl">📂</div>
                  <h4 className="text-xs font-bold text-slate-700">अभी कोई कस्टम बटन नहीं है</h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    ऊपर "+ नया बटन जोड़ें" पर क्लिक करके होम स्क्रीन पर कोई भी नया विषय, परीक्षा, या टूल जोड़ें।
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {customModulesList.map((mod) => {
                    const secCount = mod.subSections ? mod.subSections.length : 0;
                    return (
                      <div
                        key={mod.id}
                        className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-1.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center shrink-0">
                            {mod.icon || '📂'}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs sm:text-sm font-bold text-slate-900">
                                {mod.title}
                              </span>
                              {mod.titleHi && (
                                <span className="text-[11px] text-slate-500">
                                  ({mod.titleHi})
                                </span>
                              )}
                              {mod.badge && (
                                <span className="text-[9px] font-black px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-md">
                                  {mod.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 block">
                              {mod.subtitle || 'Custom feature'}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                {mod.actionType === 'nested_sections'
                                  ? `📂 ${secCount} सेक्शन्स`
                                  : mod.actionType === 'code'
                                  ? '💻 कोड टूल'
                                  : mod.actionType}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Button Action Controls */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          {/* Manage Sections inside this button */}
                          <button
                            onClick={() => handleOpenSectionsManager(mod)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-all active:scale-95 cursor-pointer"
                            title="इसके अंदर सेक्शन्स जोड़ें व प्रबंधित करें"
                          >
                            <FolderPlus className="w-3.5 h-3.5 text-indigo-600" />
                            <span>सेक्शन्स ({secCount})</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditButton(mod)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                            title="बटन एडिट करें"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteButton(mod.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                            title="हटाएं"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: ADD / EDIT HOME BUTTON */}
          {activeView === 'add_button' && (
            <form onSubmit={handleSaveButton} className="space-y-3.5">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  {selectedModule ? 'बटन संपादित करें (Edit Button)' : 'होम स्क्रीन पर नया बटन जोड़ें'}
                </span>
                <span className="text-[10px] font-bold text-blue-600">
                  होम स्क्रीन ग्रिड में जुड़ेगा
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    बटन नाम (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Current Affairs 2026"
                    value={btnTitle}
                    onChange={(e) => setBtnTitle(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    बटन नाम (Hindi) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. समसामयिकी 2026"
                    value={btnTitleHi}
                    onChange={(e) => setBtnTitleHi(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  सब-टाइटल / टैगलाइन (Hindi & English)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="English: Daily GK & Updates"
                    value={btnSubtitle}
                    onChange={(e) => setBtnSubtitle(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Hindi: दैनिक राष्ट्रीय व अंतरराष्ट्रीय प्रश्न"
                    value={btnSubtitleHi}
                    onChange={(e) => setBtnSubtitleHi(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Icon & Badge Selection */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    इमोजी / आइकॉन (Icon)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={btnIcon}
                      onChange={(e) => setBtnIcon(e.target.value)}
                      className="w-12 text-center text-base p-2 bg-white border border-slate-200 rounded-xl font-bold"
                    />
                    <div className="flex flex-wrap gap-1 flex-1">
                      {QUICK_EMOJIS.slice(0, 7).map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setBtnIcon(em)}
                          className="w-7 h-7 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center cursor-pointer"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    बैज (Badge)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NEW, HOT, DAILY"
                    value={btnBadge}
                    onChange={(e) => setBtnBadge(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Type */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  बटन का प्रकार (Button Type) *
                </label>
                <select
                  value={btnActionType}
                  onChange={(e) => setBtnActionType(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold text-indigo-900"
                >
                  <option value="nested_sections">
                    📂 Nested Sections (अंदर कई अलग-अलग सेक्शन्स/टॉपिक्स बनाना)
                  </option>
                  <option value="code">
                    💻 Interactive Tool / HTML Code (सीधा ऐप/टूल चलाना)
                  </option>
                  <option value="link">
                    🔗 External Web Link (वेबसाइट का लिंक खोलना)
                  </option>
                  <option value="notice">
                    📢 Popup Card Notice (पॉपअप सूचना)
                  </option>
                </select>
              </div>

              {btnActionType === 'code' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    HTML / JS Code
                  </label>
                  <textarea
                    rows={4}
                    value={btnDirectCode}
                    onChange={(e) => setBtnDirectCode(e.target.value)}
                    placeholder="<div>Custom HTML tool code here</div>"
                    className="w-full text-xs p-2.5 font-mono bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl focus:outline-none"
                  />
                </div>
              )}

              {btnActionType === 'link' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    वेब URL (https://...)
                  </label>
                  <input
                    type="url"
                    value={btnDirectLink}
                    onChange={(e) => setBtnDirectLink(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>बटन सेव करें (Save Button)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('list')}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  रद्द करें
                </button>
              </div>
            </form>
          )}

          {/* VIEW 3: MANAGE NESTED SECTIONS INSIDE SELECTED BUTTON */}
          {activeView === 'manage_sections' && selectedModule && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase block">
                    अंदरूनी सेक्शन्स प्रबंधन
                  </span>
                  <h3 className="text-sm font-black text-indigo-950 flex items-center gap-1.5">
                    <span>{selectedModule.icon}</span>
                    <span>{selectedModule.title}</span>
                  </h3>
                </div>
                {!isAddingSection && (
                  <button
                    onClick={() => {
                      playTapSound(soundEnabled);
                      resetSectionForm();
                      setIsAddingSection(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ नया सेक्शन जोड़ें</span>
                  </button>
                )}
              </div>

              {/* If Form is Open to Add/Edit Section */}
              {isAddingSection ? (
                <form onSubmit={handleSaveSection} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-black text-slate-800">
                      {editingSectionId ? 'सेक्शन एडिट करें' : 'इस बटन के अंदर नया सेक्शन जोड़ें'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingSection(false)}
                      className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      रद्द करें
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                        सेक्शन शीर्षक (English) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Chapter 1: Polity Basics"
                        value={secTitle}
                        onChange={(e) => setSecTitle(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                        सेक्शन शीर्षक (Hindi) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. अध्याय 1: राजव्यवस्था परिचय"
                        value={secTitleHi}
                        onChange={(e) => setSecTitleHi(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                        विवरण (Subtitle/Description)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. संविधान सभा एवं मुख्य अनुच्छेद"
                        value={secDescHi}
                        onChange={(e) => setSecDescHi(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                        आइकॉन (Icon / Emoji)
                      </label>
                      <input
                        type="text"
                        placeholder="📌"
                        value={secIcon}
                        onChange={(e) => setSecIcon(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-center font-bold"
                      />
                    </div>
                  </div>

                  {/* Section Content Type */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-1">
                      कंटेंट का प्रकार (Content Type) *
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { id: 'notes', label: '📖 नोट्स (Notes)', icon: FileText },
                        { id: 'quiz', label: '⚡ क्विज (MCQs)', icon: HelpCircle },
                        { id: 'code', label: '💻 टूल (HTML)', icon: Code },
                        { id: 'link', label: '🔗 वेब लिंक', icon: Link2 },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSecType(t.id as any)}
                          className={`py-2 px-1 text-[10px] font-bold rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            secType === t.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <t.icon className="w-3.5 h-3.5" />
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 1. If Type is Notes */}
                  {secType === 'notes' && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-1">
                        नोट्स सामग्री (Study Notes Content) *
                      </label>
                      <textarea
                        rows={6}
                        required
                        value={secNotes}
                        onChange={(e) => setSecNotes(e.target.value)}
                        placeholder="अध्ययन सामग्री यहाँ लिखें...&#10;• मुख्य बिंदु 1: संविधान 26 जनवरी 1950 को लागू हुआ।&#10;• मुख्य बिंदु 2: प्रारूप समिति के अध्यक्ष डॉ. भीमराव अंबेडकर थे।"
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-500">
                        छात्र इस नोट्स को सीधे ऐप में बड़े अक्षरों में पढ़ सकेंगे।
                      </p>
                    </div>
                  )}

                  {/* 2. If Type is Quiz */}
                  {secType === 'quiz' && (
                    <div className="space-y-3 bg-white p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          क्विज प्रश्न जोड़ें (कुल {secQuestions.length} प्रश्न जोड़े गए)
                        </span>
                      </div>

                      {/* Add Question Box */}
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                            प्रश्न (Question Text) *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. भारत का संविधान कब लागू हुआ था?"
                            value={qText}
                            onChange={(e) => setQText(e.target.value)}
                            className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="विकल्प 1 (Option A)"
                            value={qOpt0}
                            onChange={(e) => setQOpt0(e.target.value)}
                            className="text-xs p-1.5 bg-white border border-slate-200 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="विकल्प 2 (Option B)"
                            value={qOpt1}
                            onChange={(e) => setQOpt1(e.target.value)}
                            className="text-xs p-1.5 bg-white border border-slate-200 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="विकल्प 3 (Option C)"
                            value={qOpt2}
                            onChange={(e) => setQOpt2(e.target.value)}
                            className="text-xs p-1.5 bg-white border border-slate-200 rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="विकल्प 4 (Option D)"
                            value={qOpt3}
                            onChange={(e) => setQOpt3(e.target.value)}
                            className="text-xs p-1.5 bg-white border border-slate-200 rounded-lg"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                              सही विकल्प (Correct Option)
                            </label>
                            <select
                              value={qCorrect}
                              onChange={(e) => setQCorrect(Number(e.target.value))}
                              className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-emerald-700"
                            >
                              <option value={0}>विकल्प 1 (Option A) सही है</option>
                              <option value={1}>विकल्प 2 (Option B) सही है</option>
                              <option value={2}>विकल्प 3 (Option C) सही है</option>
                              <option value={3}>विकल्प 4 (Option D) सही है</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                              व्याख्या (Explanation)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 26 जनवरी 1950 को संविधान लागू हुआ।"
                              value={qExp}
                              onChange={(e) => setQExp(e.target.value)}
                              className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddQuestionToSection}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all active:scale-95 cursor-pointer"
                        >
                          + यह प्रश्न जोड़ें (Add Question)
                        </button>
                      </div>

                      {/* Questions list preview */}
                      {secQuestions.length > 0 && (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto">
                          {secQuestions.map((q, idx) => (
                            <div
                              key={q.id}
                              className="text-xs p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                            >
                              <span className="font-semibold truncate">
                                Q{idx + 1}. {q.question}
                              </span>
                              <button
                                type="button"
                                onClick={() => setSecQuestions(secQuestions.filter((item) => item.id !== q.id))}
                                className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. If Type is Code */}
                  {secType === 'code' && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-1">
                        HTML / JS Tool Code *
                      </label>
                      <textarea
                        rows={5}
                        required
                        value={secCode}
                        onChange={(e) => setSecCode(e.target.value)}
                        placeholder="<div>Tool code here</div>"
                        className="w-full text-xs p-2.5 font-mono bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl"
                      />
                    </div>
                  )}

                  {/* 4. If Type is Link */}
                  {secType === 'link' && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-1">
                        वेब URL (https://...) *
                      </label>
                      <input
                        type="url"
                        required
                        value={secLink}
                        onChange={(e) => setSecLink(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                  )}

                  <div className="pt-2 flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      {editingSectionId ? 'सेक्शन अपडेट करें' : '+ सेक्शन सुरक्षित करें (Save Section)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingSection(false)}
                      className="py-2 px-3 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      रद्द करें
                    </button>
                  </div>
                </form>
              ) : null}

              {/* Existing Sub-Sections Inside This Button */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  इस बटन के अंदर के सेक्शन्स ({selectedModule.subSections?.length || 0}):
                </span>

                {(!selectedModule.subSections || selectedModule.subSections.length === 0) ? (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-1">
                    <p className="text-xs font-bold text-slate-600">
                      इस बटन में अभी कोई सेक्शन नहीं है।
                    </p>
                    <p className="text-[11px] text-slate-400">
                      ऊपर "+ नया सेक्शन जोड़ें" बटन दबाकर नोट्स, क्विज या टूल जोड़ें।
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedModule.subSections.map((sec, idx) => (
                      <div
                        key={sec.id}
                        className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs flex items-center justify-between gap-3 hover:border-indigo-300 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-1 bg-indigo-50 rounded-lg">
                            {sec.icon || '📌'}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900">
                                {idx + 1}. {sec.title}
                              </span>
                              {sec.titleHi && (
                                <span className="text-[11px] text-slate-500">
                                  ({sec.titleHi})
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 block">
                              {sec.description || sec.descriptionHi || ''}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                                {sec.contentType === 'notes' && '📖 नोट्स'}
                                {sec.contentType === 'quiz' && `⚡ क्विज (${sec.quizQuestions?.length || 0} प्रश्न)`}
                                {sec.contentType === 'code' && '💻 टूल'}
                                {sec.contentType === 'link' && '🔗 लिंक'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleEditSection(sec)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="एडिट करें"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSection(sec.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
