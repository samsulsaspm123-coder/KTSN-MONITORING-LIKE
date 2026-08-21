import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  BookOpen,
  Terminal,
  Chrome,
  Type,
  Share2,
  MessageSquare,
  FileCode2,
  Menu,
  X,
  Palette,
  Moon,
  Sun
} from 'lucide-react';
import { ThemeMode } from '../types';
import { AppLogo } from './AppLogo';
import { LocalStorageGauge } from './LocalStorageGauge';

export type ActiveTab = 'rekap' | 'desain' | 'sosmed' | 'karyawan' | 'extension' | 'code' | 'guide' | 'console';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  employeeCount: number;
  storeCode: string;
  currentFontName?: string;
  onOpenFontModal?: () => void;
  compactMode?: boolean;
  onToggleCompactMode?: () => void;
  themeMode?: ThemeMode;
  onToggleTheme?: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  employeeCount,
  storeCode,
  currentFontName = 'Plus Jakarta Sans',
  onOpenFontModal,
  compactMode = false,
  onToggleCompactMode,
  themeMode = 'light',
  onToggleTheme,
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Navigation Items with clean, lightweight solid color coding and fast CSS states
  const navItems = [
    {
      id: 'rekap' as ActiveTab,
      label: 'Rekap Like WA',
      subtitle: 'Generator Text & Template WA',
      icon: MessageSquare,
      activeBg: 'bg-emerald-600 text-white shadow-xs',
      activeIconBg: 'bg-white/20 text-white',
      inactiveIconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
      inactiveBorder: 'border-slate-200/80 hover:bg-emerald-50/70 dark:border-slate-800 dark:hover:bg-slate-800/60',
      badge: 'WA',
      badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800',
    },
    {
      id: 'desain' as ActiveTab,
      label: 'Planning & Desain',
      subtitle: 'Planning Harian + Jadwal Desain',
      icon: Palette,
      activeBg: 'bg-purple-600 text-white shadow-xs',
      activeIconBg: 'bg-white/20 text-white',
      inactiveIconBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
      inactiveBorder: 'border-slate-200/80 hover:bg-purple-50/70 dark:border-slate-800 dark:hover:bg-slate-800/60',
      badge: 'PLANNING',
      badgeClass: 'bg-purple-100 text-purple-900 border border-purple-300 font-bold dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800',
    },
    {
      id: 'sosmed' as ActiveTab,
      label: 'Laporan Sosmed',
      subtitle: '7 Postingan & Foto Screenshot',
      icon: Share2,
      activeBg: 'bg-pink-600 text-white shadow-xs',
      activeIconBg: 'bg-white/20 text-white',
      inactiveIconBg: 'bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300',
      inactiveBorder: 'border-slate-200/80 hover:bg-pink-50/70 dark:border-slate-800 dark:hover:bg-slate-800/60',
      badge: '7 POST',
      badgeClass: 'bg-pink-100 text-pink-900 border border-pink-300 font-bold dark:bg-pink-950/80 dark:text-pink-300 dark:border-pink-800',
    },
    {
      id: 'karyawan' as ActiveTab,
      label: 'Data Karyawan',
      subtitle: 'Kelola Kuota & 151 Staff',
      icon: Users,
      activeBg: 'bg-indigo-600 text-white shadow-xs',
      activeIconBg: 'bg-white/20 text-white',
      inactiveIconBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
      inactiveBorder: 'border-slate-200/80 hover:bg-indigo-50/70 dark:border-slate-800 dark:hover:bg-slate-800/60',
      badge: `${employeeCount}`,
      badgeClass: 'bg-indigo-100 text-indigo-900 border border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800',
    },
    {
      id: 'extension' as ActiveTab,
      label: 'Ekstensi IG Chrome',
      subtitle: 'Ambil Like IG Otomatis',
      icon: Chrome,
      activeBg: 'bg-amber-500 text-slate-950 shadow-xs font-black',
      activeIconBg: 'bg-slate-900/20 text-slate-950',
      inactiveIconBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
      inactiveBorder: 'border-slate-200/80 hover:bg-amber-50/70 dark:border-slate-800 dark:hover:bg-slate-800/60',
      badge: 'AUTO',
      badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800',
    },
    {
      id: 'code' as ActiveTab,
      label: 'Kode Code.gs',
      subtitle: 'Script Google Sheets GAS',
      icon: FileCode2,
      activeBg: 'bg-sky-600 text-white shadow-xs',
      activeIconBg: 'bg-white/20 text-white',
      inactiveIconBg: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
      inactiveBorder: 'border-slate-200/80 hover:bg-sky-50/70 dark:border-slate-800 dark:hover:bg-slate-800/60',
      badge: 'GAS',
      badgeClass: 'bg-sky-100 text-sky-900 border border-sky-200 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800',
    },
    {
      id: 'guide' as ActiveTab,
      label: 'Panduan Setup',
      subtitle: 'Tutorial Lengkap & Deploy',
      icon: BookOpen,
      activeBg: 'bg-purple-600 text-white shadow-xs',
      activeIconBg: 'bg-white/20 text-white',
      inactiveIconBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
      inactiveBorder: 'border-slate-200/80 hover:bg-purple-50/70 dark:border-slate-800 dark:hover:bg-slate-800/60',
      badge: 'Buku',
      badgeClass: 'bg-purple-100 text-purple-900 border border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800',
    },
    {
      id: 'console' as ActiveTab,
      label: 'Script IG Console',
      subtitle: 'Ambil Like Manual di DevTools',
      icon: Terminal,
      activeBg: 'bg-rose-600 text-white shadow-xs',
      activeIconBg: 'bg-white/20 text-white',
      inactiveIconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
      inactiveBorder: 'border-slate-200/80 hover:bg-rose-50/70 dark:border-slate-800 dark:hover:bg-slate-800/60',
      badge: 'JS',
      badgeClass: 'bg-rose-100 text-rose-900 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800',
    },
  ];

  const handleSelectTab = (id: ActiveTab) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* ========================================================= */}
      {/* MOBILE TOP BAR (Visible only on small screens < lg)        */}
      {/* ========================================================= */}
      <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Buka Menu Navigasi"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          </button>
          <div className="flex items-center gap-2">
            <AppLogo size="sm" showLiveDot={false} />
            <div>
              <h1 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-tight flex items-center gap-1.5">
                <span>{storeCode}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-black dark:bg-blue-900/60 dark:text-blue-200">SA</span>
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                Instagram Like System
              </p>
            </div>
          </div>
        </div>

        {/* Quick Mobile Action Buttons */}
        <div className="flex items-center gap-1.5">
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                themeMode === 'dark'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title={themeMode === 'dark' ? 'Kembali ke Tema Default (Terang)' : 'Ubah ke Tema Dark Mode'}
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('sosmed')}
            className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 text-[10px] font-black flex items-center gap-1 shadow-2xs"
            title="Laporan Sosmed"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>15:40 | 16:15</span>
          </button>

          {onOpenFontModal && (
            <button
              type="button"
              onClick={onOpenFontModal}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
              title="Ganti Font"
            >
              <Type className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE BACKDROP OVERLAY                                    */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* LEFT SIDEBAR CONTAINER (Desktop: Sticky Fixed, Mobile: Drawer) */}
      {/* ========================================================= */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:max-h-screen lg:z-30 shrink-0 shadow-sm overflow-hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* SIDEBAR HEADER (ALWAYS FIXED AT TOP) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/90 shrink-0 z-10">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <AppLogo size="md" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-black text-slate-900 dark:text-slate-100 leading-tight tracking-tight">
                    {storeCode} Monitoring
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/60 dark:text-blue-200 dark:border-blue-700 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1 shrink-0" />
                    PWA Ready
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">v2.5.0</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide uppercase mt-1">
                  Retail Instagram & Planning
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SIDEBAR NAVIGATION ITEMS LIST (SCROLLABLE MIDDLE BODY ONLY) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3.5 py-3 space-y-1.5 custom-scrollbar">
          <div className="px-2 pb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Menu Utama & Laporan
            </span>
            <span className="text-[9px] font-mono font-bold text-slate-400">
              Ctrl+1..8
            </span>
          </div>

          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const shortcutNum = index + 1;

            return (
              <button
                key={item.id}
                id={`sidebar-btn-${item.id}`}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full text-left p-2.5 rounded-xl transition-transform duration-100 ease-out hover:translate-x-0.5 flex items-center justify-between gap-2.5 cursor-pointer group relative overflow-hidden ${
                  isActive
                    ? item.activeBg
                    : `text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border ${item.inactiveBorder} bg-white dark:bg-slate-800/60 shadow-2xs`
                }`}
                title={`Buka ${item.label} (Tekan Ctrl+${shortcutNum} atau Alt+${shortcutNum})`}
              >
                <div className="flex items-center gap-3 min-w-0 z-10">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? item.activeIconBg : item.inactiveIconBg
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black tracking-tight truncate">
                        {item.label}
                      </span>
                    </div>
                    <p
                      className={`text-[10px] truncate leading-tight font-medium ${
                        isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Badges: Feature Tag + Keyboard Shortcut Indicator */}
                <div className="flex items-center gap-1.5 shrink-0 z-10">
                  {item.badge && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tight shadow-2xs ${
                        isActive ? 'bg-white/20 text-white' : item.badgeClass
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <kbd
                    className={`hidden sm:inline-flex items-center justify-center text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      isActive
                        ? 'bg-white/20 text-white border-white/30'
                        : 'bg-slate-100/90 dark:bg-slate-700 text-slate-400 border-slate-200/90 dark:border-slate-600'
                    }`}
                    title={`Pindah cepat: Tekan Ctrl+${shortcutNum}`}
                  >
                    ^{shortcutNum}
                  </kbd>
                </div>
              </button>
            );
          })}
        </div>

        {/* SIDEBAR FOOTER: UNIFIED CONTROLS (ALWAYS FIXED AT BOTTOM) */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 space-y-2 shrink-0 z-10">
          {/* Dual Quick Controls: Theme Mode & Font Selector */}
          <div className="grid grid-cols-2 gap-1.5">
            {/* Dark / Light Theme Toggle */}
            {onToggleTheme && (
              <button
                id="sidebar-btn-theme-toggle"
                type="button"
                onClick={onToggleTheme}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-between border transition-all cursor-pointer shadow-2xs ${
                  themeMode === 'dark'
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
                title={
                  themeMode === 'dark'
                    ? 'Tema Gelap AKTIF: Klik untuk beralih ke Terang'
                    : 'Aktifkan Tema Dark Mode (Gelap)'
                }
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {themeMode === 'dark' ? (
                    <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  )}
                  <span className="truncate">
                    {themeMode === 'dark' ? 'Dark' : 'Terang'}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                    themeMode === 'dark'
                      ? 'bg-amber-400/20 text-amber-300'
                      : 'bg-indigo-50 text-indigo-700'
                  }`}
                >
                  {themeMode === 'dark' ? 'ON' : 'OFF'}
                </span>
              </button>
            )}

            {/* Font Picker Trigger Button */}
            {onOpenFontModal && (
              <button
                id="sidebar-btn-font-picker"
                type="button"
                onClick={onOpenFontModal}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-between border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
                title="Ubah jenis & ukuran font tampilan"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Type className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="font-bold truncate max-w-[55px]">
                    {currentFontName}
                  </span>
                </div>
                <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-1 py-0.2 rounded border border-indigo-100 dark:border-indigo-800 shrink-0">
                  Font
                </span>
              </button>
            )}
          </div>

          {/* Google Sheets Connection Indicator */}
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-[11px] font-bold shadow-2xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
              <span>Google Sheets</span>
            </div>
            <span className="text-[9px] bg-emerald-200 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200 px-1.5 py-0.2 rounded font-black uppercase">
              Connected
            </span>
          </div>

          {/* Real-time Local Storage Usage Monitor Gauge */}
          <LocalStorageGauge />
        </div>
      </aside>
    </>
  );
}

