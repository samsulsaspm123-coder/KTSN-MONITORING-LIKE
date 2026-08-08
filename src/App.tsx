import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { RekapGenerator } from './components/RekapGenerator';
import { SosmedReportManager } from './components/SosmedReportManager';
import { EmployeeManager } from './components/EmployeeManager';
import { GasDeployGuide } from './components/GasDeployGuide';
import { ExtensionManager } from './components/ExtensionManager';
import { FontPickerModal } from './components/FontPickerModal';
import { GlobalMilestonePopup } from './components/GlobalMilestonePopup';
import { Employee, FontFamilyId, FontSizeScale } from './types';
import { DEFAULT_EMPLOYEES } from './data/defaultEmployees';
import { FONT_OPTIONS, FONT_SIZE_SCALES } from './data/fontOptions';
import {
  MessageSquare,
  Share2,
  Users,
  Chrome,
  FileCode2,
  BookOpen,
  Terminal,
  Type,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';

const LOCAL_STORAGE_KEY_EMPLOYEES = 'likemonitor_employees_v1';
const LOCAL_STORAGE_KEY_STORE = 'likemonitor_store_code_v1';
const LOCAL_STORAGE_KEY_FONT = 'likemonitor_font_family_v1';
const LOCAL_STORAGE_KEY_SIZE = 'likemonitor_font_size_v1';

const TAB_ORDER: ActiveTab[] = ['rekap', 'sosmed', 'karyawan', 'extension', 'code', 'guide', 'console'];

// Motion Variants for smooth horizontal swipe + vertical lift + subtle blur transitions
const tabVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir >= 0 ? 32 : -32,
    y: 6,
    filter: 'blur(3px)',
  }),
  center: {
    opacity: 1,
    x: 0,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.24,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir >= 0 ? -28 : 28,
    y: -4,
    filter: 'blur(2px)',
    transition: {
      duration: 0.18,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function App() {
  // Navigation & Directional Swipe Transition
  const [activeTab, setActiveTab] = useState<ActiveTab>('rekap');
  const [direction, setDirection] = useState<number>(1);
  const [gasGuideDefaultTab, setGasGuideDefaultTab] = useState<
    'code-gs' | 'index-html' | 'sheet-template' | 'step-by-step' | 'console-ig'
  >('code-gs');

  const handleTabChange = (newTab: ActiveTab) => {
    if (newTab === activeTab) return;
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    const newIndex = TAB_ORDER.indexOf(newTab);
    setDirection(newIndex >= currentIndex ? 1 : -1);
    setActiveTab(newTab);
  };

  // Font & Typography States
  const [currentFont, setCurrentFont] = useState<FontFamilyId>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_FONT);
      if (saved && FONT_OPTIONS.some((f) => f.id === saved)) {
        return saved as FontFamilyId;
      }
    } catch {
      // Fallback
    }
    return 'jakarta';
  });

  const [currentSize, setCurrentSize] = useState<FontSizeScale>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SIZE);
      if (saved && FONT_SIZE_SCALES.some((s) => s.id === saved)) {
        return saved as FontSizeScale;
      }
    } catch {
      // Fallback
    }
    return 'normal';
  });

  const [isFontModalOpen, setIsFontModalOpen] = useState<boolean>(false);

  // Employee State with local storage persistence
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_EMPLOYEES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_EMPLOYEES;
  });

  // Store Code State (e.g. "KTSN")
  const [storeCode, setStoreCode] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY_STORE) || 'KTSN';
    } catch {
      return 'KTSN';
    }
  });

  // Apply dynamic font to document element and CSS variables
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_FONT, currentFont);
      const fontObj = FONT_OPTIONS.find((f) => f.id === currentFont);
      if (fontObj) {
        document.documentElement.style.setProperty('--app-font-family', fontObj.cssFamily);
        document.body.style.fontFamily = fontObj.cssFamily;
      }
    } catch {
      // Ignore
    }
  }, [currentFont]);

  // Apply font size scale
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SIZE, currentSize);
    } catch {
      // Ignore
    }
  }, [currentSize]);

  // Save employees changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
    } catch {
      // Ignore
    }
  }, [employees]);

  // Save store code
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_STORE, storeCode);
    } catch {
      // Ignore
    }
  }, [storeCode]);

  // Helper navigations with smooth swipe direction
  const handleOpenConsoleGuide = () => {
    setGasGuideDefaultTab('console-ig');
    handleTabChange('console');
  };

  const handleOpenCodeTab = () => {
    setGasGuideDefaultTab('code-gs');
    handleTabChange('code');
  };

  const handleOpenGuideTab = () => {
    setGasGuideDefaultTab('step-by-step');
    handleTabChange('guide');
  };

  const currentFontObj = FONT_OPTIONS.find((f) => f.id === currentFont) || FONT_OPTIONS[0];

  // Font class mapping
  const fontClassMap: Record<FontFamilyId, string> = {
    jakarta: 'font-jakarta',
    inter: 'font-inter',
    poppins: 'font-poppins',
    outfit: 'font-outfit',
    dmsans: 'font-dmsans',
    nunito: 'font-nunito',
    lexend: 'font-lexend',
    sora: 'font-sora',
    jetbrains: 'font-jetbrains',
  };

  // Font size scale class mapping
  const sizeClassMap: Record<FontSizeScale, string> = {
    compact: 'text-[13px]',
    normal: 'text-[14px]',
    comfortable: 'text-[15px]',
    large: 'text-[16px]',
  };

  // Tab titles and descriptions for top breadcrumb bar
  const tabInfo: Record<ActiveTab, { title: string; subtitle: string; icon: any; color: string }> = {
    rekap: {
      title: 'Rekap Like Instagram (Format WA)',
      subtitle: 'Generator rekap harian WhatsApp otomatis, filter kuota, dan monitoring staff',
      icon: MessageSquare,
      color: 'text-emerald-600 bg-emerald-100',
    },
    sosmed: {
      title: 'Laporan Posting Sosmed Harian (7 Post)',
      subtitle: '3-in-1 Combo: Teks Format WA + Link Postingan + Lampiran Foto Screenshot',
      icon: Share2,
      color: 'text-pink-600 bg-pink-100',
    },
    karyawan: {
      title: 'Database & Status Kuota Karyawan',
      subtitle: `Kelola ${employees.length} daftar staff, username Instagram, dan kepatuhan kuota like`,
      icon: Users,
      color: 'text-indigo-600 bg-indigo-100',
    },
    extension: {
      title: 'Ekstensi Chrome & Bookmarklet Otomatis',
      subtitle: 'Alat bantu otomatis scrape data like postingan Instagram 1-klik',
      icon: Chrome,
      color: 'text-amber-600 bg-amber-100',
    },
    code: {
      title: 'Kode Google Apps Script (Code.gs)',
      subtitle: 'Source code backend Google Sheets API & database sinkronisasi',
      icon: FileCode2,
      color: 'text-sky-600 bg-sky-100',
    },
    guide: {
      title: 'Panduan Setup & Panduan Lengkap',
      subtitle: 'Langkah demi langkah integrasi Google Sheets, Apps Script, dan sistem like',
      icon: BookOpen,
      color: 'text-purple-600 bg-purple-100',
    },
    console: {
      title: 'Script Console Instagram DevTools',
      subtitle: 'Kode JavaScript untuk mengambil username like langsung dari browser console',
      icon: Terminal,
      color: 'text-rose-600 bg-rose-100',
    },
  };

  const currentTabDetails = tabInfo[activeTab] || tabInfo.rekap;
  const ActiveTabIcon = currentTabDetails.icon;

  return (
    <div
      className={`min-h-screen bg-slate-50 text-slate-800 flex flex-col lg:flex-row antialiased selection:bg-indigo-500 selection:text-white transition-all duration-150 ${
        fontClassMap[currentFont] || 'font-jakarta'
      } ${sizeClassMap[currentSize] || 'text-[14px]'}`}
      style={{ fontFamily: currentFontObj.cssFamily }}
    >
      {/* ========================================================= */}
      {/* LEFT SIDEBAR (Sticky on Desktop/Laptop, Drawer on Mobile)  */}
      {/* ========================================================= */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        employeeCount={employees.length}
        storeCode={storeCode}
        currentFontName={currentFontObj.name}
        onOpenFontModal={() => setIsFontModalOpen(true)}
      />

      {/* ========================================================= */}
      {/* RIGHT MAIN CONTENT CONTAINER                               */}
      {/* ========================================================= */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        
        {/* TOP BREADCRUMB / STATUS HEADER ON DESKTOP */}
        <header className="hidden lg:flex bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-3.5 items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <motion.div
              key={`icon-${activeTab}`}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${currentTabDetails.color}`}
            >
              <ActiveTabIcon className="w-5 h-5" />
            </motion.div>
            <motion.div
              key={`text-${activeTab}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="min-w-0"
            >
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 leading-tight truncate">
                  {currentTabDetails.title}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                  {storeCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                {currentTabDetails.subtitle}
              </p>
            </motion.div>
          </div>

          {/* Right Header Badges: Milestone Alert + Font + Connection */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick 15:40 & 16:15 Milestone Reminder Pill */}
            <button
              type="button"
              onClick={() => handleTabChange('sosmed')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 text-amber-950 border border-amber-300 text-xs font-black hover:from-amber-200 hover:to-orange-200 transition-all cursor-pointer shadow-2xs"
              title="Laporan Web App 15:40 • Deadline Masuk Grup WA 16:15"
            >
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping shrink-0" />
              <span>⏰ 15:40 Web | 16:15 WA</span>
            </button>

            {/* Font Picker Button */}
            <button
              id="btn-font-topbar"
              type="button"
              onClick={() => setIsFontModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 border border-slate-300 transition-all cursor-pointer shadow-2xs hover:border-indigo-400"
              title="Ubah jenis & ukuran font tampilan"
            >
              <Type className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-slate-500 font-medium">Font:</span>
              <span className="text-indigo-950 font-black truncate max-w-[100px]">
                {currentFontObj.name}
              </span>
            </button>

            {/* Google Sheets Connection Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
              <span>Connected</span>
            </div>
          </div>
        </header>

        {/* MAIN BODY WORK AREA WITH HORIZONTAL SLIDE TRANSITION */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeTab}
              custom={direction}
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              {/* TAB 1: REKAP GENERATOR (Primary Work Area) */}
              {activeTab === 'rekap' && (
                <RekapGenerator
                  employees={employees}
                  storeCode={storeCode}
                  setStoreCode={setStoreCode}
                  onOpenConsoleGuide={handleOpenConsoleGuide}
                  onOpenExtensionGuide={() => handleTabChange('extension')}
                  onOpenEmployeeManager={() => handleTabChange('karyawan')}
                  onOpenSosmedReport={() => handleTabChange('sosmed')}
                />
              )}

              {/* TAB: SOSMED REPORT GENERATOR (NEW MULTI-PLATFORM WHATSAPP REPORT BUILDER) */}
              {activeTab === 'sosmed' && (
                <SosmedReportManager
                  storeCode={storeCode}
                />
              )}

              {/* TAB 2: EMPLOYEE ROSTER MANAGER */}
              {activeTab === 'karyawan' && (
                <EmployeeManager
                  employees={employees}
                  setEmployees={setEmployees}
                  onNavigateToRekap={() => handleTabChange('rekap')}
                />
              )}

              {/* TAB 3: CHROME EXTENSION & BOOKMARKLET BUILDER */}
              {activeTab === 'extension' && (
                <ExtensionManager
                  onNavigateToRekap={() => handleTabChange('rekap')}
                />
              )}

              {/* TAB 4: GOOGLE APPS SCRIPT CODE VIEWER */}
              {activeTab === 'code' && (
                <GasDeployGuide defaultTab="code-gs" />
              )}

              {/* TAB 5: STEP BY STEP DEPLOY GUIDE */}
              {activeTab === 'guide' && (
                <GasDeployGuide defaultTab="step-by-step" />
              )}

              {/* TAB 6: INSTAGRAM CONSOLE HELPER SCRIPT */}
              {activeTab === 'console' && (
                <GasDeployGuide defaultTab="console-ig" />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Milestone 15:40 & 16:15 Alert Popup (Active across all tabs) */}
        <GlobalMilestonePopup
          activeTab={activeTab}
          onNavigateToSosmed={() => handleTabChange('sosmed')}
          storeName={storeCode ? `MEGA ${storeCode}` : 'MEGA KTSN'}
        />

        {/* Floating Quick Font Picker Widget (Bottom Right) */}
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
          <button
            onClick={() => setIsFontModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-950 text-white rounded-full shadow-lg border border-slate-700 flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 cursor-pointer backdrop-blur-md"
            title="Klik untuk memilih font favorit Anda (9 Pilihan Font)"
          >
            <Type className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Pilih Font:</span>
            <span className="text-indigo-300 max-w-[110px] truncate">{currentFontObj.name}</span>
          </button>
        </div>

        {/* Font Picker Modal */}
        <FontPickerModal
          isOpen={isFontModalOpen}
          onClose={() => setIsFontModalOpen(false)}
          currentFont={currentFont}
          onSelectFont={(fontId) => setCurrentFont(fontId)}
          currentSize={currentSize}
          onSelectSize={(size) => setCurrentSize(size)}
        />

        {/* Footer Branding */}
        <footer className="bg-white border-t border-slate-200 mt-auto py-5 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                {storeCode.charAt(0) || 'K'}
              </div>
              <span className="font-bold text-slate-800 text-xs">
                {storeCode} Monitoring System &bull; Retail Employee Instagram Engagement
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-medium">
              <button
                onClick={() => handleTabChange('rekap')}
                className="hover:text-indigo-600 cursor-pointer transition-colors"
              >
                Generator Rekap
              </button>
              <span>&bull;</span>
              <button
                onClick={() => handleTabChange('sosmed')}
                className="hover:text-indigo-600 cursor-pointer transition-colors font-bold text-pink-600"
              >
                Laporan Sosmed (7 Post)
              </button>
              <span>&bull;</span>
              <button
                onClick={() => handleTabChange('karyawan')}
                className="hover:text-indigo-600 cursor-pointer transition-colors"
              >
                Data Karyawan ({employees.length})
              </button>
              <span>&bull;</span>
              <button
                onClick={() => setIsFontModalOpen(true)}
                className="hover:text-indigo-600 cursor-pointer transition-colors flex items-center gap-1 font-bold text-indigo-700"
              >
                <Type className="w-3 h-3 text-indigo-500" />
                <span>Ganti Font ({currentFontObj.name})</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>System v2.4.0</span>
              <span>&bull;</span>
              <span>Retail Audit Ready</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

