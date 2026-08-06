import { Heart, Users, Code, BookOpen, Terminal, Sparkles, Layers } from 'lucide-react';

export type ActiveTab = 'rekap' | 'karyawan' | 'code' | 'guide' | 'console';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  employeeCount: number;
  storeCode: string;
}

export function Navbar({ activeTab, setActiveTab, employeeCount, storeCode }: NavbarProps) {
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
              <span>Rekapitulasi WA</span>
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

          {/* Connected status badge */}
          <div className="flex items-center gap-3">
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
            onClick={() => setActiveTab('karyawan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'karyawan' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            👥 Karyawan ({employeeCount})
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
