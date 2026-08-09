import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Code,
  BookOpen,
  Terminal,
  Sparkles,
  Chrome,
  Type,
  Share2,
  Clock,
  MessageSquare,
  FileCode2,
  Puzzle,
  Flame,
  CheckCircle2,
  Menu,
  X,
  ChevronRight,
  AlertTriangle,
  Zap,
  ExternalLink,
  ShieldCheck,
  Palette,
  Package
} from 'lucide-react';

export type ActiveTab = 'rekap' | 'stok' | 'desain' | 'sosmed' | 'karyawan' | 'extension' | 'code' | 'guide' | 'console';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  employeeCount: number;
  storeCode: string;
  currentFontName?: string;
  onOpenFontModal?: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  employeeCount,
  storeCode,
  currentFontName = 'Plus Jakarta Sans',
  onOpenFontModal,
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live timer for sidebar milestone clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const totalMinutesNow = hours * 60 + minutes + seconds / 60;

  // Key Milestones
  const M_15_40 = 15 * 60 + 40; // 940 min (Laporan Web App Harus Lengkap)
  const M_16_15 = 16 * 60 + 15; // 975 min (DEADLINE Masuk Grup WA)

  const isWebReportReminderActive = totalMinutesNow >= M_15_40 && totalMinutesNow < M_16_15;
  const isDeadlinePassed = totalMinutesNow >= M_16_15;

  const storeInitial = storeCode ? storeCode.charAt(0).toUpperCase() : 'K';

  // Navigation Items with unique branding, colors, icons, subtitles, and badges
  const navItems = [
    {
      id: 'rekap' as ActiveTab,
      label: 'Rekap Like WA',
      subtitle: 'Generator Text & Template WA',
      icon: MessageSquare,
      color: 'emerald',
      activeBg: 'bg-emerald-600 text-white shadow-emerald-600/30 shadow-md ring-2 ring-emerald-400/40',
      activeIconBg: 'bg-white/20 text-white',
      inactiveIconBg: 'bg-emerald-100 text-emerald-700',
      inactiveBorder: 'border-emerald-200/60 hover:bg-emerald-50/70',
      badge: 'WA',
      badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    },
    {
      id: 'stok' as ActiveTab,
      label: 'Cari Stok PDF',
      subtitle: 'Stok Persediaan & Cek 1 Unit',
      icon: Package,
      color: 'indigo',
      activeBg: 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white shadow-indigo-600/30 shadow-md ring-2 ring-indigo-400/40',
      activeIconBg: 'bg-white/25 text-white',
      inactiveIconBg: 'bg-indigo-100 text-indigo-700',
      inactiveBorder: 'border-indigo-200/80 hover:bg-indigo-50/80',
      badge: 'MODUL 1',
      badgeClass: 'bg-indigo-100 text-indigo-950 border border-indigo-300 font-black',
    },
    {
      id: 'desain' as ActiveTab,
      label: 'Planning & Desain',
      subtitle: 'Planning Harian + AI Jadwal Desain',
      icon: Palette,
      color: 'purple',
      activeBg: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-purple-600/30 shadow-md ring-2 ring-purple-400/40',
      activeIconBg: 'bg-white/25 text-white',
      inactiveIconBg: 'bg-purple-100 text-purple-700',
      inactiveBorder: 'border-purple-200/80 hover:bg-purple-50/80',
      badge: 'PLANNING',
      badgeClass: 'bg-purple-100 text-purple-900 border border-purple-300 font-black',
    },
    {
      id: 'sosmed' as ActiveTab,
      label: 'Laporan Sosmed',
      subtitle: '7 Postingan & Foto Screenshot',
      icon: Share2,
      color: 'pink',
      activeBg: 'bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 text-white shadow-pink-600/30 shadow-md ring-2 ring-pink-400/40',
      activeIconBg: 'bg-white/25 text-white',
      inactiveIconBg: 'bg-pink-100 text-pink-700',
      inactiveBorder: 'border-pink-200/80 hover:bg-pink-50/80',
      badge: '7 POST',
      badgeClass: 'bg-pink-100 text-pink-900 border border-pink-300 font-black animate-pulse',
    },
    {
      id: 'karyawan' as ActiveTab,
      label: 'Data Karyawan',
      subtitle: 'Kelola Kuota & 151 Staff',
      icon: Users,
      color: 'indigo',
      activeBg: 'bg-indigo-600 text-white shadow-indigo-600/30 shadow-md ring-2 ring-indigo-400/40',
      activeIconBg: 'bg-white/20 text-white',
      inactiveIconBg: 'bg-indigo-100 text-indigo-700',
      inactiveBorder: 'border-indigo-200/60 hover:bg-indigo-50/70',
      badge: `${employeeCount}`,
      badgeClass: 'bg-indigo-100 text-indigo-900 border border-indigo-200',
    },
    {
      id: 'extension' as ActiveTab,
      label: 'Ekstensi IG Chrome',
      subtitle: 'Ambil Like IG Otomatis',
      icon: Chrome,
      color: 'amber',
      activeBg: 'bg-amber-500 text-slate-950 shadow-amber-500/30 shadow-md font-extrabold ring-2 ring-amber-300',
      activeIconBg: 'bg-slate-900/20 text-slate-950',
      inactiveIconBg: 'bg-amber-100 text-amber-800',
      inactiveBorder: 'border-amber-200/80 hover:bg-amber-50/80',
      badge: 'BARU',
      badgeClass: 'bg-amber-200 text-amber-950 border border-amber-300 font-black',
    },
    {
      id: 'code' as ActiveTab,
      label: 'Kode Code.gs',
      subtitle: 'Script Google Sheets GAS',
      icon: FileCode2,
      color: 'sky',
      activeBg: 'bg-sky-600 text-white shadow-sky-600/30 shadow-md ring-2 ring-sky-400/40',
      activeIconBg: 'bg-white/20 text-white',
      inactiveIconBg: 'bg-sky-100 text-sky-700',
      inactiveBorder: 'border-sky-200/60 hover:bg-sky-50/70',
      badge: 'GAS',
      badgeClass: 'bg-sky-100 text-sky-900 border border-sky-200',
    },
    {
      id: 'guide' as ActiveTab,
      label: 'Panduan Setup',
      subtitle: 'Tutorial Lengkap & Deploy',
      icon: BookOpen,
      color: 'purple',
      activeBg: 'bg-purple-600 text-white shadow-purple-600/30 shadow-md ring-2 ring-purple-400/40',
      activeIconBg: 'bg-white/20 text-white',
      inactiveIconBg: 'bg-purple-100 text-purple-700',
      inactiveBorder: 'border-purple-200/60 hover:bg-purple-50/70',
      badge: 'Buku',
      badgeClass: 'bg-purple-100 text-purple-900 border border-purple-200',
    },
    {
      id: 'console' as ActiveTab,
      label: 'Script IG Console',
      subtitle: 'Ambil Like Manual di DevTools',
      icon: Terminal,
      color: 'rose',
      activeBg: 'bg-rose-600 text-white shadow-rose-600/30 shadow-md ring-2 ring-rose-400/40',
      activeIconBg: 'bg-white/20 text-white',
      inactiveIconBg: 'bg-rose-100 text-rose-700',
      inactiveBorder: 'border-rose-200/60 hover:bg-rose-50/70',
      badge: 'JS',
      badgeClass: 'bg-rose-100 text-rose-900 border border-rose-200',
    },
  ];

  const handleSelectTab = (id: ActiveTab) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  const timeFormatted = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')} WIB`;

  return (
    <>
      {/* ========================================================= */}
      {/* MOBILE TOP BAR (Visible only on small screens < lg)        */}
      {/* ========================================================= */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer border border-slate-200"
            title="Buka Menu Navigasi"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-indigo-600" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-700 to-purple-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
              {storeInitial}
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 leading-tight">
                {storeCode} Monitoring
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">
                Instagram Like System
              </p>
            </div>
          </div>
        </div>

        {/* Quick Mobile Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('sosmed')}
            className="px-2 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-black flex items-center gap-1 shadow-2xs"
            title="Laporan Sosmed"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span>15:40 | 16:15</span>
          </button>

          {onOpenFontModal && (
            <button
              type="button"
              onClick={onOpenFontModal}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
              title="Ganti Font"
            >
              <Type className="w-4 h-4 text-indigo-600" />
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
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* LEFT SIDEBAR CONTAINER (Desktop: Sticky, Mobile: Drawer)  */}
      {/* ========================================================= */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-30 shrink-0 shadow-sm ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* SIDEBAR HEADER: BRAND, STORE LOGO & LIVE BADGE */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-tr from-indigo-700 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-md border border-indigo-400/30">
                {storeInitial}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-black text-slate-900 leading-tight tracking-tight">
                    {storeCode} Monitoring
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                    Live System
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">v2.4.0</span>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase mt-1">
                  Retail Instagram Audit
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SIDEBAR NAVIGATION ITEMS LIST (Scrollable if needed) */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5 custom-scrollbar">
          <div className="px-2 pb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Menu Utama & Laporan
            </span>
            <span className="text-[9px] font-mono font-bold text-slate-400">
              Ctrl+1..7
            </span>
          </div>

          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const shortcutNum = index + 1;

            return (
              <motion.button
                key={item.id}
                id={`sidebar-btn-${item.id}`}
                onClick={() => handleSelectTab(item.id)}
                whileHover={{ scale: 1.015, x: 2 }}
                whileTap={{ scale: 0.975 }}
                transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
                className={`w-full text-left p-2.5 rounded-2xl transition-all duration-200 flex items-center justify-between gap-2.5 cursor-pointer group relative overflow-hidden ${
                  isActive
                    ? item.activeBg
                    : `text-slate-700 hover:text-slate-900 border ${item.inactiveBorder} bg-white shadow-2xs hover:shadow-xs`
                }`}
                title={`Buka ${item.label} (Tekan Ctrl+${shortcutNum} atau Alt+${shortcutNum})`}
              >
                <div className="flex items-center gap-3 min-w-0 z-10">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105 shadow-2xs ${
                      isActive ? item.activeIconBg : item.inactiveIconBg
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black tracking-tight truncate">
                        {item.label}
                      </span>
                    </div>
                    <p
                      className={`text-[10px] truncate leading-tight font-medium transition-colors ${
                        isActive ? 'text-white/80' : 'text-slate-500'
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
                      className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight shadow-2xs transition-transform group-hover:scale-105 ${
                        isActive ? 'bg-white/25 text-white' : item.badgeClass
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <kbd
                    className={`hidden sm:inline-flex items-center justify-center text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white border-white/30'
                        : 'bg-slate-100/90 text-slate-400 border-slate-200/90 group-hover:text-slate-700 group-hover:border-slate-300'
                    }`}
                    title={`Pindah cepat: Tekan Ctrl+${shortcutNum} / Alt+${shortcutNum}`}
                  >
                    ^{shortcutNum}
                  </kbd>
                </div>
              </motion.button>
            );
          })}

          {/* ========================================================= */}
          {/* SIDEBAR MILESTONE REMINDER WIDGET (15:40 & 16:15)         */}
          {/* ========================================================= */}
          <div className="pt-3">
            <motion.div
              onClick={() => handleSelectTab('sosmed')}
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs group ${
                isDeadlinePassed
                  ? 'bg-rose-50 border-rose-200 text-rose-950 hover:bg-rose-100/90'
                  : isWebReportReminderActive
                  ? 'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100/90'
                  : 'bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-pink-50/80 border-indigo-100 text-slate-900 hover:border-indigo-200'
              }`}
              title="Klik untuk membuka Laporan Posting Sosmed Harian"
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Clock
                    className={`w-3.5 h-3.5 ${
                      isDeadlinePassed
                        ? 'text-rose-600 animate-bounce'
                        : isWebReportReminderActive
                        ? 'text-amber-600 animate-pulse'
                        : 'text-indigo-600'
                    }`}
                  />
                  <span className="text-[11px] font-black uppercase tracking-wider">
                    Jadwal Milestone
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold text-slate-500 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200/80">
                  {timeFormatted}
                </span>
              </div>

              <div className="space-y-1 text-[11px] font-medium text-slate-700">
                <div className="flex items-center justify-between bg-white/70 px-2 py-1 rounded-lg border border-slate-200/60">
                  <span className="font-bold text-amber-900">⏰ 15:40 WIB</span>
                  <span className="text-[10px] font-semibold text-slate-500">Laporan Web Lengkap</span>
                </div>
                <div className="flex items-center justify-between bg-white/70 px-2 py-1 rounded-lg border border-slate-200/60">
                  <span className="font-bold text-rose-900">🚨 16:15 WIB</span>
                  <span className="text-[10px] font-semibold text-slate-500">Deadline Grup WA</span>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[10px] font-bold text-indigo-700 group-hover:text-indigo-900">
                <span>Buka Rekap 7 Post &rarr;</span>
                <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900 text-[9px] font-black">
                  Format WA
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* SIDEBAR FOOTER: FONT SWITCHER & GOOGLE SHEETS CONNECTION */}
        <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/80 space-y-2 shrink-0">
          {/* Font Picker Trigger Button */}
          {onOpenFontModal && (
            <button
              id="sidebar-btn-font-picker"
              type="button"
              onClick={onOpenFontModal}
              className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 flex items-center justify-between border border-slate-200 transition-all cursor-pointer shadow-2xs hover:border-indigo-300"
              title="Ubah jenis & ukuran font tampilan"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Type className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-slate-600 font-medium">Font:</span>
                <span className="text-indigo-950 font-black truncate max-w-[100px]">
                  {currentFontName}
                </span>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-100 shrink-0">
                Ubah
              </span>
            </button>
          )}

          {/* Google Sheets Connection Indicator */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold shadow-2xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
              <span>Google Sheets</span>
            </div>
            <span className="text-[9px] bg-emerald-200 text-emerald-950 px-1.5 py-0.5 rounded font-black uppercase">
              Connected
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
