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
  CheckCircle2
} from 'lucide-react';

export type ActiveTab = 'rekap' | 'sosmed' | 'karyawan' | 'extension' | 'code' | 'guide' | 'console';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  employeeCount: number;
  storeCode: string;
  currentFontName?: string;
  onOpenFontModal?: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  employeeCount,
  storeCode,
  currentFontName = 'Plus Jakarta Sans',
  onOpenFontModal,
}: NavbarProps) {
  const storeInitial = storeCode ? storeCode.charAt(0).toUpperCase() : 'K';

  // Navigation Items with Distinctive Color Coding, Icons & Visual Badges
  const navItems = [
    {
      id: 'rekap' as ActiveTab,
      label: 'Rekap Like WA',
      shortLabel: 'Rekap WA',
      icon: MessageSquare,
      color: 'emerald',
      activeClass: 'bg-emerald-600 text-white shadow-emerald-600/30 shadow-md ring-2 ring-emerald-400/40',
      inactiveClass: 'text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80',
      iconColor: 'text-emerald-500',
      badge: 'WA',
      badgeClass: 'bg-emerald-200 text-emerald-900',
    },
    {
      id: 'sosmed' as ActiveTab,
      label: 'Laporan Sosmed',
      shortLabel: 'Laporan Sosmed',
      icon: Share2,
      color: 'pink',
      activeClass: 'bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 text-white shadow-pink-600/30 shadow-md ring-2 ring-pink-400/40',
      inactiveClass: 'text-pink-900 bg-pink-50/80 hover:bg-pink-100 border border-pink-200',
      iconColor: 'text-pink-600',
      badge: '7 POST',
      badgeClass: 'bg-pink-200 text-pink-900 font-black animate-pulse',
    },
    {
      id: 'karyawan' as ActiveTab,
      label: 'Data Karyawan',
      shortLabel: 'Karyawan',
      icon: Users,
      color: 'indigo',
      activeClass: 'bg-indigo-600 text-white shadow-indigo-600/30 shadow-md ring-2 ring-indigo-400/40',
      inactiveClass: 'text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-200/80',
      iconColor: 'text-indigo-600',
      badge: `${employeeCount}`,
      badgeClass: 'bg-indigo-200 text-indigo-900',
    },
    {
      id: 'extension' as ActiveTab,
      label: 'Ekstensi IG',
      shortLabel: 'Ekstensi IG',
      icon: Chrome,
      color: 'amber',
      activeClass: 'bg-amber-500 text-slate-950 shadow-amber-500/30 shadow-md font-extrabold ring-2 ring-amber-300',
      inactiveClass: 'text-amber-900 bg-amber-50/80 hover:bg-amber-100 border border-amber-200',
      iconColor: 'text-amber-600',
      badge: 'BARU',
      badgeClass: 'bg-amber-200 text-amber-950 font-black',
    },
    {
      id: 'code' as ActiveTab,
      label: 'Kode Code.gs',
      shortLabel: 'Code.gs',
      icon: FileCode2,
      color: 'sky',
      activeClass: 'bg-sky-600 text-white shadow-sky-600/30 shadow-md ring-2 ring-sky-400/40',
      inactiveClass: 'text-sky-900 bg-sky-50/70 hover:bg-sky-100 border border-sky-200/80',
      iconColor: 'text-sky-600',
      badge: 'GAS',
      badgeClass: 'bg-sky-200 text-sky-900',
    },
    {
      id: 'guide' as ActiveTab,
      label: 'Panduan Setup',
      shortLabel: 'Panduan',
      icon: BookOpen,
      color: 'purple',
      activeClass: 'bg-purple-600 text-white shadow-purple-600/30 shadow-md ring-2 ring-purple-400/40',
      inactiveClass: 'text-purple-900 bg-purple-50/70 hover:bg-purple-100 border border-purple-200/80',
      iconColor: 'text-purple-600',
      badge: 'Buku',
      badgeClass: 'bg-purple-200 text-purple-900',
    },
    {
      id: 'console' as ActiveTab,
      label: 'Script IG',
      shortLabel: 'Script IG',
      icon: Terminal,
      color: 'rose',
      activeClass: 'bg-rose-600 text-white shadow-rose-600/30 shadow-md ring-2 ring-rose-400/40',
      inactiveClass: 'text-rose-900 bg-rose-50/70 hover:bg-rose-100 border border-rose-200/80',
      iconColor: 'text-rose-600',
      badge: 'JS',
      badgeClass: 'bg-rose-200 text-rose-900',
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shrink-0 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 py-2.5">
          
          {/* Left Brand Area: Store Logo + Name + Live Badge */}
          <div className="flex items-center justify-between lg:justify-start gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-700 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-xl shrink-0 shadow-md border border-indigo-400/30">
                {storeInitial}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight tracking-tight">
                    {storeCode} Monitoring System
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold tracking-wide uppercase">
                  Retail Employee Instagram Engagement
                </p>
              </div>
            </div>

            {/* Mobile Right Controls */}
            <div className="flex items-center gap-1.5 lg:hidden">
              {onOpenFontModal && (
                <button
                  type="button"
                  onClick={onOpenFontModal}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 text-xs font-bold"
                  title="Ganti Font"
                >
                  <Type className="w-4 h-4 text-indigo-600" />
                </button>
              )}
            </div>
          </div>

          {/* Center / Navigation Menu Toolbar: Color-Coded Distinctive Cards */}
          <nav aria-label="Menu Utama" className="flex items-center gap-1.5 overflow-x-auto py-1 custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`tab-btn-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive ? item.activeClass : item.inactiveClass
                  }`}
                  title={`Buka ${item.label}`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : item.iconColor
                    }`}
                  />
                  <span className="whitespace-nowrap font-extrabold">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tight ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : item.badgeClass
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Controls: Milestone Reminder Pill + Font Switcher + Connection */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0 justify-end">
            
            {/* 15:40 & 16:15 Milestone Alert Pill */}
            <button
              type="button"
              onClick={() => setActiveTab('sosmed')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 text-amber-950 border border-amber-300 text-[11px] font-black hover:from-amber-200 hover:to-orange-200 transition-all cursor-pointer shadow-xs"
              title="Klik untuk membuka Laporan Posting Sosmed (15:40 Laporan Web App • 16:15 Deadline WA)"
            >
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping shrink-0" />
              <span>⏰ 15:40 Web | 16:15 WA</span>
            </button>

            {/* Font Picker Trigger Button */}
            {onOpenFontModal && (
              <button
                id="btn-font-picker"
                type="button"
                onClick={onOpenFontModal}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 border border-slate-300 transition-all cursor-pointer shadow-2xs hover:border-indigo-400"
                title="Ubah jenis & ukuran font tampilan"
              >
                <Type className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden xl:inline text-slate-500 font-medium">Font:</span>
                <span className="text-indigo-950 font-extrabold max-w-[90px] truncate">
                  {currentFontName}
                </span>
              </button>
            )}

            {/* Google Sheets Connection Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
              <span className="hidden xl:inline">Google Sheets Connected</span>
              <span className="xl:hidden">Connected</span>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}


