import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  BookOpen,
  Terminal,
  Chrome,
  Type,
  MessageSquare,
  FileCode2,
  Menu,
  X,
  Palette,
  Moon,
  Sun,
  Film,
  Grid,
} from 'lucide-react';
import { ThemeMode } from '../types';
import { LocalStorageGauge } from './LocalStorageGauge';

export type ActiveTab = 'rekap' | 'feed' | 'desain' | 'sosmed' | 'karyawan' | 'extension' | 'code' | 'guide' | 'console';

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
  themeMode = 'light',
  onToggleTheme,
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Urutan harus sama dengan TAB_ORDER di App.tsx (dipakai untuk Ctrl+1..9)
  const navItems: { id: ActiveTab; label: string; icon: typeof Users; count?: number; group: 'main' | 'tools' }[] = [
    { id: 'rekap', label: 'Rekap Like', icon: MessageSquare, group: 'main' },
    { id: 'feed', label: 'Feed Instagram', icon: Grid, group: 'main' },
    { id: 'desain', label: 'Planning & Desain', icon: Palette, group: 'main' },
    { id: 'sosmed', label: 'Recap Konten', icon: Film, group: 'main' },
    { id: 'karyawan', label: 'Data Karyawan', icon: Users, count: employeeCount, group: 'main' },
    { id: 'extension', label: 'Ekstensi IG & FB', icon: Chrome, group: 'tools' },
    { id: 'code', label: 'Kode Code.gs', icon: FileCode2, group: 'tools' },
    { id: 'guide', label: 'Panduan Setup', icon: BookOpen, group: 'tools' },
    { id: 'console', label: 'Script Console', icon: Terminal, group: 'tools' },
  ];

  const handleSelectTab = (id: ActiveTab) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  const Monogram = ({ small = false }: { small?: boolean }) => (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white ${
        small ? 'h-8 w-8 text-sm' : 'h-9 w-9 text-base'
      }`}
    >
      {storeCode.charAt(0).toUpperCase() || 'K'}
    </div>
  );

  const renderGroup = (group: 'main' | 'tools', title: string) => (
    <div className="space-y-0.5">
      <p className="px-3 pb-1 pt-2 text-[11px] font-medium text-slate-400">{title}</p>
      {navItems
        .filter((i) => i.group === group)
        .map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const shortcut = navItems.findIndex((i) => i.id === item.id) + 1;
          return (
            <button
              key={item.id}
              id={`sidebar-btn-${item.id}`}
              type="button"
              data-active={isActive}
              onClick={() => handleSelectTab(item.id)}
              title={`${item.label} (Ctrl+${shortcut})`}
              className="nav-item flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate text-left">{item.label}</span>
              {item.count !== undefined && <span className="text-[11px] text-slate-400">{item.count}</span>}
            </button>
          );
        })}
    </div>
  );

  return (
    <>
      {/* Bar atas khusus layar kecil */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 lg:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="cursor-pointer rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            title="Menu"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Monogram small />
          <span className="text-sm font-semibold text-slate-900">{storeCode} Monitoring</span>
        </div>
        <div className="flex items-center gap-1">
          {onToggleTheme && (
            <button type="button" onClick={onToggleTheme} className="cursor-pointer rounded-lg p-2 text-slate-600 hover:bg-slate-100" title="Ganti tema terang/gelap">
              {themeMode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
          {onOpenFontModal && (
            <button type="button" onClick={onOpenFontModal} className="cursor-pointer rounded-lg p-2 text-slate-600 hover:bg-slate-100" title="Ganti font">
              <Type className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 cursor-pointer bg-slate-950/40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-64 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <Monogram />
            <div>
              <h2 className="text-sm font-semibold leading-tight text-slate-900">{storeCode} Monitoring</h2>
              <p className="text-[11px] text-slate-400">Instagram & planning retail</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Menu utama" className="custom-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-3">
          {renderGroup('main', 'Laporan')}
          {renderGroup('tools', 'Alat bantu')}
        </nav>

        <div className="shrink-0 space-y-2 border-t border-slate-100 p-3">
          <div className="flex gap-1.5">
            {onToggleTheme && (
              <button
                id="sidebar-btn-theme-toggle"
                type="button"
                onClick={onToggleTheme}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                {themeMode === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                {themeMode === 'dark' ? 'Terang' : 'Gelap'}
              </button>
            )}
            {onOpenFontModal && (
              <button
                id="sidebar-btn-font-picker"
                type="button"
                onClick={onOpenFontModal}
                title="Ubah jenis & ukuran font"
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <Type className="h-3.5 w-3.5" />
                <span className="max-w-[70px] truncate">{currentFontName}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 px-1 text-[11px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Google Sheets terhubung
          </div>
          <LocalStorageGauge />
        </div>
      </aside>
    </>
  );
}
