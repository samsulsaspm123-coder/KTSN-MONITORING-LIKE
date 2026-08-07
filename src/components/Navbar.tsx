import { Heart, Users, Code, BookOpen, Terminal, Sparkles, Layers, Chrome, Type, Share2 } from 'lucide-react';

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

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Header Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-sm">
              {storeInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {storeCode} Monitoring System
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase hidden sm:block">
                Retail Employee Instagram Engagement
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1.5">
            <button
              id="tab-btn-rekap"
              onClick={() => setActiveTab('rekap')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'rekap'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rekap Like WA</span>
            </button>

            <button
              id="tab-btn-sosmed"
              onClick={() => setActiveTab('sosmed')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'sosmed'
                  ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-indigo-900 hover:bg-indigo-50/70'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-pink-500" />
              <span>Laporan Posting Sosmed</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                activeTab === 'sosmed' ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-800'
              }`}>
                7 Post
              </span>
            </button>

            <button
              id="tab-btn-karyawan"
              onClick={() => setActiveTab('karyawan')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'karyawan'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Data Karyawan</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'karyawan' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {employeeCount}
              </span>
            </button>

            <button
              id="tab-btn-extension"
              onClick={() => setActiveTab('extension')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'extension'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Chrome className="w-3.5 h-3.5 text-amber-500" />
              <span>Ekstensi IG</span>
              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded uppercase">
                Baru
              </span>
            </button>

            <button
              id="tab-btn-code"
              onClick={() => setActiveTab('code')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Kode Code.gs</span>
            </button>

            <button
              id="tab-btn-guide"
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Panduan Setup</span>
            </button>

            <button
              id="tab-btn-console"
              onClick={() => setActiveTab('console')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'console'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Script IG</span>
            </button>
          </nav>

          {/* Right Header Actions: Font Switcher, Milestone Alert Pill & Connected Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* 15:40 & 16:15 Milestone Reminder Pill */}
            <button
              onClick={() => setActiveTab('sosmed')}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold hover:bg-amber-100 transition-all cursor-pointer shadow-2xs"
              title="Klik untuk membuka Laporan Posting Sosmed (15:40 Laporan Web App • 16:15 Deadline WA)"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>⏰ 15:40 Laporan | 16:15 WA</span>
            </button>

            {/* Font Picker Trigger Button */}
            {onOpenFontModal && (
              <button
                id="btn-font-picker"
                onClick={onOpenFontModal}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 border border-slate-200 transition-all cursor-pointer shadow-2xs hover:border-indigo-300"
                title="Ubah jenis & ukuran font tampilan"
              >
                <Type className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Font:</span>
                <span className="text-indigo-900 max-w-[90px] sm:max-w-[120px] truncate">
                  {currentFontName}
                </span>
              </button>
            )}

            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
              <span className="hidden sm:inline">Google Sheets Connected</span>
              <span className="sm:hidden">Connected</span>
            </div>
          </div>

        </div>

        {/* Mobile Navigation Tabs (scrollable) */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-100 custom-scrollbar">
          <button
            onClick={() => setActiveTab('rekap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'rekap' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            ⚡ Rekap WA
          </button>
          <button
            onClick={() => setActiveTab('sosmed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'sosmed' ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white' : 'bg-pink-50 text-pink-900 border border-pink-200'
            }`}
          >
            📢 Laporan Sosmed (7 Post)
          </button>
          <button
            onClick={() => setActiveTab('karyawan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'karyawan' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            👥 Karyawan ({employeeCount})
          </button>
          <button
            onClick={() => setActiveTab('extension')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'extension' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            🧩 Ekstensi IG
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'code' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            📜 Kode GAS
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'guide' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            📖 Panduan
          </button>
          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'console' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            🛠️ Script IG
          </button>
        </div>

      </div>
    </header>
  );
}

