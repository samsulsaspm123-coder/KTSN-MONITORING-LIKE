import { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { RekapGenerator } from './components/RekapGenerator';
import { SosmedReportManager } from './components/SosmedReportManager';
import { EmployeeManager } from './components/EmployeeManager';
import { GasDeployGuide } from './components/GasDeployGuide';
import { ExtensionManager } from './components/ExtensionManager';
import { FontPickerModal } from './components/FontPickerModal';
import { Employee, FontFamilyId, FontSizeScale } from './types';
import { DEFAULT_EMPLOYEES } from './data/defaultEmployees';
import { FONT_OPTIONS, FONT_SIZE_SCALES } from './data/fontOptions';
import { Heart, Sparkles, Code2, BookOpen, ShieldCheck, Instagram, Chrome, Type, Palette } from 'lucide-react';

const LOCAL_STORAGE_KEY_EMPLOYEES = 'likemonitor_employees_v1';
const LOCAL_STORAGE_KEY_STORE = 'likemonitor_store_code_v1';
const LOCAL_STORAGE_KEY_FONT = 'likemonitor_font_family_v1';
const LOCAL_STORAGE_KEY_SIZE = 'likemonitor_font_size_v1';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('rekap');
  const [gasGuideDefaultTab, setGasGuideDefaultTab] = useState<
    'code-gs' | 'index-html' | 'sheet-template' | 'step-by-step' | 'console-ig'
  >('code-gs');

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

  // Helper navigations
  const handleOpenConsoleGuide = () => {
    setGasGuideDefaultTab('console-ig');
    setActiveTab('console');
  };

  const handleOpenCodeTab = () => {
    setGasGuideDefaultTab('code-gs');
    setActiveTab('code');
  };

  const handleOpenGuideTab = () => {
    setGasGuideDefaultTab('step-by-step');
    setActiveTab('guide');
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

  return (
    <div
      className={`min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased selection:bg-indigo-500 selection:text-white transition-all duration-150 ${
        fontClassMap[currentFont] || 'font-jakarta'
      } ${sizeClassMap[currentSize] || 'text-[14px]'}`}
      style={{ fontFamily: currentFontObj.cssFamily }}
    >
      
      {/* Top Navbar with Font Switcher */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        employeeCount={employees.length}
        storeCode={storeCode}
        currentFontName={currentFontObj.name}
        onOpenFontModal={() => setIsFontModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: REKAP GENERATOR (Primary Work Area) */}
        {activeTab === 'rekap' && (
          <RekapGenerator
            employees={employees}
            storeCode={storeCode}
            setStoreCode={setStoreCode}
            onOpenConsoleGuide={handleOpenConsoleGuide}
            onOpenExtensionGuide={() => setActiveTab('extension')}
            onOpenEmployeeManager={() => setActiveTab('karyawan')}
            onOpenSosmedReport={() => setActiveTab('sosmed')}
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
            onNavigateToRekap={() => setActiveTab('rekap')}
          />
        )}

        {/* TAB 3: CHROME EXTENSION & BOOKMARKLET BUILDER */}
        {activeTab === 'extension' && (
          <ExtensionManager
            onNavigateToRekap={() => setActiveTab('rekap')}
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

      </main>

      {/* Floating Quick Font Picker Widget (Bottom Right) */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsFontModalOpen(true)}
          className="px-3 py-2 bg-slate-900/90 hover:bg-slate-950 text-white rounded-full shadow-lg border border-slate-700 flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 cursor-pointer backdrop-blur-md"
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
              onClick={() => setActiveTab('rekap')}
              className="hover:text-indigo-600 cursor-pointer transition-colors"
            >
              Generator Rekap
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setActiveTab('extension')}
              className="hover:text-indigo-600 cursor-pointer transition-colors font-bold text-amber-600"
            >
              Ekstensi IG
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setActiveTab('karyawan')}
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
  );
}

