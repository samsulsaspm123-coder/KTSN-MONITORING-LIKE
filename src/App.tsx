import { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { RekapGenerator } from './components/RekapGenerator';
import { EmployeeManager } from './components/EmployeeManager';
import { GasDeployGuide } from './components/GasDeployGuide';
import { Employee } from './types';
import { DEFAULT_EMPLOYEES } from './data/defaultEmployees';
import { Heart, Sparkles, Code2, BookOpen, ShieldCheck, Instagram } from 'lucide-react';

const LOCAL_STORAGE_KEY_EMPLOYEES = 'likemonitor_employees_v1';
const LOCAL_STORAGE_KEY_STORE = 'likemonitor_store_code_v1';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('rekap');
  const [gasGuideDefaultTab, setGasGuideDefaultTab] = useState<
    'code-gs' | 'index-html' | 'sheet-template' | 'step-by-step' | 'console-ig'
  >('code-gs');

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        employeeCount={employees.length}
        storeCode={storeCode}
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
            onOpenEmployeeManager={() => setActiveTab('karyawan')}
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

        {/* TAB 3: GOOGLE APPS SCRIPT CODE VIEWER */}
        {activeTab === 'code' && (
          <GasDeployGuide defaultTab="code-gs" />
        )}

        {/* TAB 4: STEP BY STEP DEPLOY GUIDE */}
        {activeTab === 'guide' && (
          <GasDeployGuide defaultTab="step-by-step" />
        )}

        {/* TAB 5: INSTAGRAM CONSOLE HELPER SCRIPT */}
        {activeTab === 'console' && (
          <GasDeployGuide defaultTab="console-ig" />
        )}

      </main>

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
              onClick={() => setActiveTab('karyawan')}
              className="hover:text-indigo-600 cursor-pointer transition-colors"
            >
              Data Karyawan ({employees.length})
            </button>
            <span>&bull;</span>
            <button
              onClick={handleOpenCodeTab}
              className="hover:text-indigo-600 cursor-pointer transition-colors"
            >
              Code.gs & Index.html
            </button>
            <span>&bull;</span>
            <button
              onClick={handleOpenGuideTab}
              className="hover:text-indigo-600 cursor-pointer transition-colors"
            >
              Deployment Guide
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
