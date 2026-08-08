import { useState, useMemo } from 'react';
import { 
  Instagram, 
  Send, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  ExternalLink,
  Info,
  SlidersHorizontal,
  Search,
  Filter,
  Terminal,
  HelpCircle,
  X,
  Layers,
  ArrowRight,
  Globe,
  Rocket,
  UploadCloud,
  Chrome,
  Bookmark,
  Zap,
  Clipboard
} from 'lucide-react';
import { Employee, LikersProcessResult } from '../types';
import { processLikersData, formatDateIndo, generateWhatsAppLink, extractUsernamesFromRawText } from '../utils/likersParser';
import { INSTAGRAM_CONSOLE_SCRIPT } from '../data/gasCodeSnippets';
import { BOOKMARKLET_CODE } from '../data/extensionFiles';

interface RekapGeneratorProps {
  employees: Employee[];
  storeCode: string;
  setStoreCode: (code: string) => void;
  onOpenConsoleGuide: () => void;
  onOpenExtensionGuide?: () => void;
  onOpenEmployeeManager: () => void;
  onOpenSosmedReport?: () => void;
}

export function RekapGenerator({
  employees,
  storeCode,
  setStoreCode,
  onOpenConsoleGuide,
  onOpenExtensionGuide,
  onOpenEmployeeManager,
  onOpenSosmedReport,
}: RekapGeneratorProps) {
  // Form State
  const [urlPost, setUrlPost] = useState<string>('https://www.instagram.com/p/DAxKj2-z9Yw/');
  const [rawLikersText, setRawLikersText] = useState<string>('');
  const [isAutoDate, setIsAutoDate] = useState<boolean>(true);
  const [customDate, setCustomDate] = useState<string>(formatDateIndo(new Date()));
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<LikersProcessResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState<boolean>(false);
  const [isQuickGuideOpen, setIsQuickGuideOpen] = useState<boolean>(false);
  const [isNetlifyGuideOpen, setIsNetlifyGuideOpen] = useState<boolean>(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState<boolean>(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  
  // Breakdown Table Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDivFilter, setSelectedDivFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'DENDA' | 'LIKED' | 'EXEMPT'>('ALL');

  // Real-time extracted usernames preview count
  const detectedUsernames = useMemo(() => {
    return extractUsernamesFromRawText(rawLikersText);
  }, [rawLikersText]);

  // Handle Process Click (always uses real-time today date if isAutoDate is true)
  const handleProcess = () => {
    if (!rawLikersText.trim()) {
      setIsQuickGuideOpen(true);
      return;
    }

    setIsProcessing(true);

    const effectiveDate = isAutoDate ? formatDateIndo(new Date()) : customDate;
    if (isAutoDate) {
      setCustomDate(effectiveDate);
    }

    // Simulate responsive processing feel
    setTimeout(() => {
      const res = processLikersData({
        urlPost: urlPost.trim(),
        rawLikersText,
        employees,
        customDate: effectiveDate,
        storeCode: storeCode || 'KTSN',
      });
      setResult(res);
      setIsProcessing(false);
    }, 200);
  };

  // Copy WA text to clipboard
  const handleCopy = () => {
    if (!result?.waTextOutput) return;
    navigator.clipboard.writeText(result.waTextOutput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // 1-Click Copy Script Console
  const handleCopyScript = () => {
    navigator.clipboard.writeText(INSTAGRAM_CONSOLE_SCRIPT).then(() => {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
    });
  };

  // Fill sample testing data with realistic KTSN data (Ada Denda)
  const handleFillSample = () => {
    setUrlPost('https://www.instagram.com/p/DAxKj2-z9Yw/');
    const sampleLikers = [
      'suryarahmad64',
      'bintiandini',
      'megawati.sun',
      'christinn.df',
      'tiaraindrianip',
      'fitria_ran',
      'desyaldita',
      'oktafianshinta',
      'ftr.aay',
      'aistialqur_',
      'anggita.restianad',
      'wahyusaputro2023',
      'putrirhayu_8',
      'bagasbilly1',
      'gifanii11',
      'diecast_motret',
      'sebutsajapakpoh',
      'papa_athalla',
      'cin.dyakbarwm',
      'xffbyzz.6',
      'arikprynt',
      'bayusukmaaaa',
      'ekotarmidianto',
      'azizfikri28',
      'fani_kurniawan80',
      'nanda_kipz24',
      'qodriyah.nur',
      'adityareich1933',
      'riskhy_1101',
      'munir_murtado',
      'ikijahee',
      'errr.and',
      'fashion_lover_id',
      'retail_customer_99',
    ].join('\n');

    setRawLikersText(sampleLikers);

    const effectiveDate = isAutoDate ? formatDateIndo(new Date()) : customDate;
    if (isAutoDate) setCustomDate(effectiveDate);

    // Auto process sample
    setTimeout(() => {
      const res = processLikersData({
        urlPost: 'https://www.instagram.com/p/DAxKj2-z9Yw/',
        rawLikersText: sampleLikers,
        employees,
        customDate: effectiveDate,
        storeCode: storeCode || 'KTSN',
      });
      setResult(res);
    }, 100);
  };

  // Fill sample where EVERY Normal employee has liked (Testing "LIKE DONE")
  const handleFillAllLikedSample = () => {
    setUrlPost('https://www.instagram.com/p/DAxKj2-z9Yw/');
    const allNormalUsernames = employees
      .filter(e => e.status === 'Normal')
      .map(e => e.username1)
      .filter(Boolean);

    const sampleLikers = [
      ...allNormalUsernames,
      'customer_fashion_id',
      'surabaya_mall_lovers',
      'retail_lovers_indo',
    ].join('\n');

    setRawLikersText(sampleLikers);

    const effectiveDate = isAutoDate ? formatDateIndo(new Date()) : customDate;
    if (isAutoDate) setCustomDate(effectiveDate);

    setTimeout(() => {
      const res = processLikersData({
        urlPost: 'https://www.instagram.com/p/DAxKj2-z9Yw/',
        rawLikersText: sampleLikers,
        employees,
        customDate: effectiveDate,
        storeCode: storeCode || 'KTSN',
      });
      setResult(res);
    }, 100);
  };

  // Clear inputs
  const handleClear = () => {
    setRawLikersText('');
    setResult(null);
  };

  // Paste from clipboard directly
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setRawLikersText(text);
          const effectiveDate = isAutoDate ? formatDateIndo(new Date()) : customDate;
          if (isAutoDate) setCustomDate(effectiveDate);

          // Auto trigger process
          setTimeout(() => {
            const res = processLikersData({
              urlPost: urlPost || 'https://www.instagram.com/p/DAxKj2-z9Yw/',
              rawLikersText: text,
              employees,
              customDate: effectiveDate,
              storeCode: storeCode || 'KTSN',
            });
            setResult(res);
          }, 100);
        } else {
          alert('Clipboard Anda masih kosong. Silakan salin daftar username likers terlebih dahulu (atau gunakan Ekstensi / Bookmarklet IG).');
        }
      } else {
        alert('Browser Anda memerlukan izin untuk membaca clipboard. Silakan gunakan Ctrl+V (Paste manual) di kolom textarea.');
      }
    } catch {
      alert('Tidak dapat membaca clipboard secara otomatis. Silakan klik pada kolom teks dan tekan Ctrl+V.');
    }
  };

  // Quick Copy Bookmarklet
  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(BOOKMARKLET_CODE);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2000);
  };

  // Filtered list for the detail breakdown table
  const filteredDetailResults = useMemo(() => {
    if (!result) return [];
    return result.allResults.filter((item) => {
      const matchesSearch =
        item.employee.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.employee.username1.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.employee.username2 && item.employee.username2.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.employee.divisi.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDiv = selectedDivFilter === 'ALL' || item.employee.divisi === selectedDivFilter;

      let matchesStatus = true;
      if (selectedStatusFilter === 'DENDA') matchesStatus = item.isPenalized;
      if (selectedStatusFilter === 'LIKED') matchesStatus = item.hasLiked && !item.isExempt;
      if (selectedStatusFilter === 'EXEMPT') matchesStatus = item.isExempt;

      return matchesSearch && matchesDiv && matchesStatus;
    });
  }, [result, searchQuery, selectedDivFilter, selectedStatusFilter]);

  // Unique divisions for filter dropdown
  const divisionList = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => set.add(e.divisi));
    return Array.from(set).sort();
  }, [employees]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Quick Info */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
              Post Monitoring Engine
            </span>
            <span className="text-xs text-slate-500">
              Database: <strong className="text-slate-800">{employees.length} Staff</strong>
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Pemrosesan Like & Format Rekapitulasi Denda Otomatis
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Sistem membandingkan likers dengan database karyawan, otomatis mengecualikan status Cuti/Off/HP Hilang, dan mengelompokkan personel terkena denda per divisi.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenSosmedReport && (
            <button
              onClick={onOpenSosmedReport}
              className="px-3.5 py-2 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Buka pembuat laporan posting sosmed harian (IG, FB, TikTok)"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Laporan Posting Sosmed</span>
              <span className="text-[9px] bg-white/25 px-1 py-0.2 rounded font-mono">7 Post</span>
            </button>
          )}
          <button
            onClick={onOpenConsoleGuide}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Script Likers IG</span>
          </button>
          <button
            onClick={onOpenEmployeeManager}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Kelola Karyawan</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout: Form Input (Left) & Output WhatsApp (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ========================================================= */}
        {/* LEFT COLUMN: INPUT FORM & DATABASE STATUS                 */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Input Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-sm">Post Monitoring Input</h2>
                  <p className="text-[11px] text-slate-400">Masukkan tautan post Instagram dan tempel daftar likers</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNetlifyGuideOpen(true)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                  title="Panduan Deploy ke Netlify"
                >
                  <Globe className="w-3.5 h-3.5 text-teal-600" />
                  <span className="hidden sm:inline">Deploy Netlify</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Pengaturan</span>
                </button>
              </div>
            </div>

            {/* Dynamic Real-time Date Indicator */}
            <div className="flex items-center justify-between text-xs bg-slate-50/80 px-3.5 py-2 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-slate-500">Tanggal Rekap:</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs border ${
                  isAutoDate 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {isAutoDate ? `${formatDateIndo(new Date())} (Otomatis Hari Ini)` : `${customDate} (Manual)`}
                </span>
              </div>

              {isAutoDate ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoDate(false);
                    setShowAdvancedSettings(true);
                  }}
                  className="text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                >
                  Ubah Tanggal
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoDate(true);
                    setCustomDate(formatDateIndo(new Date()));
                  }}
                  className="text-[11px] text-emerald-700 hover:underline font-semibold cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Reset ke Hari Ini (Otomatis)</span>
                </button>
              )}
            </div>

            {/* Advanced Settings Drawer */}
            {showAdvancedSettings && (
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                      Kode Toko / Unit
                    </label>
                    <input
                      type="text"
                      value={storeCode}
                      onChange={(e) => setStoreCode(e.target.value.toUpperCase())}
                      placeholder="KTSN"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-indigo-700"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Tanggal (DD/MM/YYYY)</span>
                      </label>
                      {isAutoDate && (
                        <span className="text-[10px] text-indigo-600 font-bold">Otomatis Aktif</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={customDate}
                      onChange={(e) => {
                        setCustomDate(e.target.value);
                        setIsAutoDate(false);
                      }}
                      placeholder="DD/MM/YYYY"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: URL Postingan Instagram */}
            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5" htmlFor="url-post-input">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>Instagram Post URL</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenExtensionGuide) {
                        onOpenExtensionGuide();
                      } else {
                        setIsExtensionModalOpen(true);
                      }
                    }}
                    className="text-[11px] text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold transition-colors cursor-pointer"
                    title="Gunakan Ekstensi Chrome atau Bookmarklet untuk ekstrak otomatis"
                  >
                    <Chrome className="w-3 h-3 text-amber-600" />
                    <span>⚡ Ekstrak Otomatis via Ekstensi / Bookmarklet</span>
                  </button>

                  {urlPost && urlPost.includes('instagram.com') && (
                    <a
                      href={urlPost}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold normal-case"
                    >
                      <span>Buka IG</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="relative flex items-center">
                <input
                  id="url-post-input"
                  type="text"
                  value={urlPost}
                  onChange={(e) => setUrlPost(e.target.value)}
                  placeholder="https://www.instagram.com/p/Cx4j..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all text-slate-900 font-medium pr-28"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenExtensionGuide) {
                        onOpenExtensionGuide();
                      } else {
                        setIsExtensionModalOpen(true);
                      }
                    }}
                    className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3 h-3" />
                    <span>1-Klik Ekstrak</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Daftar Likers Instagram (Textarea) */}
            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5" htmlFor="likers-textarea">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  <span>Username Likers List</span>
                  {detectedUsernames.length > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      {detectedUsernames.length} User Terdeteksi
                    </span>
                  )}
                </label>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                    title="Tempel langsung dari clipboard dan jalankan rekap otomatis"
                  >
                    <Clipboard className="w-3 h-3" />
                    <span>Tempel dari Clipboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyBookmarklet}
                    className={`text-[11px] font-bold px-2 py-1 rounded-md border transition-all flex items-center gap-1 cursor-pointer ${
                      copiedBookmarklet
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                    title="Salin kode Bookmarklet 1-Klik"
                  >
                    <Bookmark className="w-3 h-3 text-amber-600" />
                    <span>{copiedBookmarklet ? 'Bookmarklet Tersalin!' : 'Bookmarklet'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className={`text-[11px] font-bold px-2 py-1 rounded-md border transition-all flex items-center gap-1 cursor-pointer ${
                      copiedScript 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                    title="Salin script console browser F12"
                  >
                    {copiedScript ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Script Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Terminal className="w-3 h-3 text-slate-600" />
                        <span>Script F12</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleFillSample}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded-md border border-slate-200 cursor-pointer flex items-center gap-1"
                    title="Simulasi jika ada karyawan yang belum like (denda)"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Demo Denda</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFillAllLikedSample}
                    className="text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-md border border-emerald-200 cursor-pointer flex items-center gap-1"
                    title="Simulasi jika semua karyawan sudah like (output: LIKE DONE)"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Demo LIKE DONE</span>
                  </button>

                  {rawLikersText && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer px-1"
                      title="Hapus input"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>

              <textarea
                id="likers-textarea"
                rows={6}
                value={rawLikersText}
                onChange={(e) => setRawLikersText(e.target.value)}
                placeholder="Tempel (Ctrl + V) hasil copy dari Console F12 Instagram di sini..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm resize-none font-mono transition-all text-slate-800 custom-scrollbar leading-relaxed"
              />

              {/* Informational Workflow Callout when Empty */}
              {!rawLikersText && (
                <div className="mt-2.5 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs space-y-2">
                  <div className="flex items-start gap-2 text-indigo-950">
                    <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-indigo-900">
                        Cara Cepat Mengambil Likers (Hanya 3 Detik):
                      </p>
                      <ol className="list-decimal pl-4 space-y-1 text-slate-700 text-[11px]">
                        <li>Buka post di IG Web &gt; Klik jumlah <strong>"Likes/Suka"</strong> agar modal daftar orang yang like muncul.</li>
                        <li>Tekan <strong>F12</strong> di keyboard &gt; pilih tab <strong>Console</strong>.</li>
                        <li>
                          Klik tombol <strong className="text-indigo-700">"Salin Script F12"</strong> di atas, paste di Console IG lalu tekan <strong>Enter</strong>.
                        </li>
                        <li>Daftar likers langsung otomatis tersalin. Kembali ke sini lalu tekan <strong>Ctrl + V</strong> (Paste)!</li>
                      </ol>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-indigo-100/60 text-[11px]">
                    <span className="text-slate-500">Kenapa perlu F12? Karena Instagram membatasi akses likers di balik login browser.</span>
                    <button
                      type="button"
                      onClick={() => setIsQuickGuideOpen(true)}
                      className="text-indigo-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Lihat Panduan Bergambar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {rawLikersText && (
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 mt-1.5 gap-2">
                  <span>✅ Format didukung: @username, baris baru, koma, spasi, atau output console.</span>
                  <button
                    type="button"
                    onClick={() => setIsQuickGuideOpen(true)}
                    className="text-indigo-600 hover:underline font-semibold cursor-pointer"
                  >
                    Bantuan Console IG &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Step 3: Process Action Button */}
            <div className="space-y-1.5 pt-1">
              <button
                id="btn-process-rekap"
                type="button"
                onClick={handleProcess}
                disabled={isProcessing}
                className={`w-full font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isProcessing
                    ? 'bg-slate-300 text-slate-500 shadow-none cursor-not-allowed'
                    : !rawLikersText.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 active:scale-[0.99]'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 active:scale-[0.99]'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses Data Likers...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Langkah 3: Proses & Buat Rekap WA</span>
                  </>
                )}
              </button>
              {!rawLikersText.trim() && (
                <p className="text-center text-[11px] text-slate-400">
                  * Isi kotak username likers di atas atau klik <strong>"Demo KTSN"</strong> untuk mencoba langsung.
                </p>
              )}
            </div>

          </div>

          {/* Database Quick View Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Employee Database Status</h3>
                <p className="text-[11px] text-slate-400">Ringkasan status karyawan toko {storeCode}</p>
              </div>
              <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold uppercase tracking-wider">
                {employees.length} Total Staff
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="pb-2 font-semibold uppercase text-[10px]">Name</th>
                    <th className="pb-2 font-semibold uppercase text-[10px]">Division</th>
                    <th className="pb-2 font-semibold uppercase text-[10px]">Status</th>
                    <th className="pb-2 font-semibold uppercase text-[10px]">Instagram</th>
                    <th className="pb-2 font-semibold text-right uppercase text-[10px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {employees.slice(0, 5).map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50">
                      <td className="py-2 font-medium text-slate-900">{emp.nama}</td>
                      <td className="py-2 text-slate-600">{emp.divisi}</td>
                      <td className="py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          emp.status === 'Normal'
                            ? 'text-emerald-600 bg-emerald-50'
                            : 'text-orange-600 bg-orange-50'
                        }`}>
                          {emp.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 font-mono text-[11px] text-slate-500">@{emp.username1}</td>
                      <td className="py-2 text-right">
                        <button
                          onClick={onOpenEmployeeManager}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer text-xs"
                        >
                          Kelola
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>{employees.length} staf terdaftar</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenEmployeeManager}
                  className="text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Import dari Sheet Anda</span>
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={onOpenEmployeeManager}
                  className="text-indigo-600 hover:underline font-semibold cursor-pointer"
                >
                  Kelola Database &rarr;
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: OUTPUT WHATSAPP & DEPLOY GUIDE               */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Output Preview (Dark Professional Terminal) */}
          <div className="bg-slate-900 rounded-xl shadow-xl p-5 flex flex-col gap-4 border border-slate-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">WhatsApp Output Preview</h3>
                  <p className="text-[11px] text-slate-400">Siap disalin atau diteruskan ke grup</p>
                </div>
              </div>
              <button
                onClick={handleCopy}
                disabled={!result}
                className={`px-3 py-1.5 rounded text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : result
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'COPIED' : 'COPY TEXT'}</span>
              </button>
            </div>

            {/* Metrics Chips */}
            {result && (
              <div className="grid grid-cols-4 gap-2 bg-slate-800/80 p-2.5 rounded-lg border border-white/5 text-center">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Total</span>
                  <span className="text-sm font-bold text-white">{result.totalKaryawan}</span>
                </div>
                <div>
                  <span className="text-[9px] text-emerald-400 font-bold block uppercase">Like</span>
                  <span className="text-sm font-bold text-emerald-400">{result.totalSudahLike}</span>
                </div>
                <div>
                  <span className="text-[9px] text-rose-400 font-bold block uppercase">Denda</span>
                  <span className={`text-sm font-bold ${result.totalDenda === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.totalDenda}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-amber-400 font-bold block uppercase">Cuti</span>
                  <span className="text-sm font-bold text-amber-400">{result.totalExempt}</span>
                </div>
              </div>
            )}

            {/* Special LIKE DONE Status Card if 0 Denda */}
            {result && result.totalDenda === 0 && (
              <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-lg p-3 text-xs flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-emerald-300">SELURUH KARYAWAN SUDAH LIKE</p>
                  <p className="text-[11px] text-emerald-400/80">
                    Output disetel otomatis menjadi <b>"LIKE DONE"</b> karena 0 denda.
                  </p>
                </div>
              </div>
            )}

            {/* Terminal output box */}
            <div className="bg-slate-800 rounded-lg p-4 font-mono text-xs sm:text-sm text-indigo-300 h-64 overflow-y-auto leading-relaxed border border-white/5 custom-scrollbar select-all whitespace-pre-wrap">
              {result?.waTextOutput ? (
                result.waTextOutput
              ) : (
                <span className="text-slate-500">
                  DATA LIKE [DD/MM/YYYY] {storeCode}{'\n'}
                  https://www.instagram.com/p/...{'\n\n'}
                  #STORE FRONT{'\n'}
                  • Andi Pratama{'\n'}
                  • Rina Sari{'\n\n'}
                  #WAREHOUSE{'\n'}
                  • Dedi Kurniawan{'\n\n'}
                  #MANAGEMENT{'\n'}
                  • (Semua Like){'\n\n'}
                  Total Denda: 3 Personel{'\n\n'}
                  (Jika semua like, otomatis: LIKE DONE)
                </span>
              )}
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!result}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : result
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
                <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
              </button>

              <a
                href={result ? generateWhatsAppLink(result.waTextOutput) : '#'}
                target="_blank"
                rel="noreferrer"
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  result
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    : 'bg-slate-800/40 text-slate-500 pointer-events-none cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Buka di WA</span>
              </a>
            </div>
          </div>

          {/* Setup Instruction & Deployment Card */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Opsi Deployment Web App</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNetlifyGuideOpen(true)}
                className="text-[11px] font-bold text-teal-700 bg-teal-100 hover:bg-teal-200 px-2.5 py-1 rounded-lg border border-teal-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Deploy Netlify &rarr;</span>
              </button>
            </div>
            <p className="text-xs text-indigo-950 leading-relaxed">
              Aplikasi ini siap dipakai baik sebagai <b>Netlify Web App</b> mandiri maupun sebagai <b>Google Apps Script</b> terintegrasi langsung di Google Spreadsheet Anda.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => setIsNetlifyGuideOpen(true)}
                className="p-2.5 bg-white border border-teal-200 rounded-lg hover:border-teal-400 text-left transition-all cursor-pointer space-y-0.5"
              >
                <div className="font-bold text-teal-900 flex items-center gap-1 text-[11px]">
                  <Rocket className="w-3.5 h-3.5 text-teal-600" />
                  <span>1. Deploy ke Netlify</span>
                </div>
                <p className="text-[10px] text-slate-500">Gratis, cepat, URL kustom, drag & drop</p>
              </button>

              <button
                type="button"
                onClick={onOpenConsoleGuide}
                className="p-2.5 bg-white border border-indigo-200 rounded-lg hover:border-indigo-400 text-left transition-all cursor-pointer space-y-0.5"
              >
                <div className="font-bold text-indigo-900 flex items-center gap-1 text-[11px]">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>2. Google Apps Script</span>
                </div>
                <p className="text-[10px] text-slate-500">Langsung di menu Spreadsheet Anda</p>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* DETAILED EMPLOYEE BREAKDOWN TABLE                         */}
      {/* ========================================================= */}
      {result && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Rincian Status Setiap Karyawan</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {filteredDetailResults.length} dari {result.allResults.length} Karyawan
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Pemeriksaan detail akun Instagram utama (Username 1) & cadangan (Username 2)
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama / username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 w-40 sm:w-48"
                />
              </div>

              {/* Divisi Filter */}
              <select
                value={selectedDivFilter}
                onChange={(e) => setSelectedDivFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700 font-medium cursor-pointer"
              >
                <option value="ALL">Semua Divisi</option>
                {divisionList.map((div) => (
                  <option key={div} value={div}>
                    {div}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700 font-medium cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="DENDA">❌ Kena Denda ({result.totalDenda})</option>
                <option value="LIKED">✅ Sudah Like ({result.totalSudahLike})</option>
                <option value="EXEMPT">🏖️ Cuti / Off ({result.totalExempt})</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Divisi</th>
                  <th className="py-2.5 px-3 font-semibold">Nama Karyawan</th>
                  <th className="py-2.5 px-3 font-semibold">Username 1</th>
                  <th className="py-2.5 px-3 font-semibold">Username 2</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status Kerja</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Hasil Like</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDetailResults.length > 0 ? (
                  filteredDetailResults.map((item) => (
                    <tr
                      key={item.employee.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        item.isPenalized ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-700">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold">
                          {item.employee.divisi}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {item.employee.nama}
                        {item.employee.keterangan && (
                          <span className="block text-[10px] font-normal text-slate-400">
                            {item.employee.keterangan}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        @{item.employee.username1}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        {item.employee.username2 ? `@${item.employee.username2}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.employee.status === 'Normal'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-orange-50 text-orange-700'
                          }`}
                        >
                          {item.employee.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {item.isExempt ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-100">
                            Pengecualian ({item.employee.status})
                          </span>
                        ) : item.hasLiked ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                            Sudah Like
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                            <XCircle className="w-3 h-3 mr-1 text-rose-600" />
                            KENA DENDA
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.matchedUsername && (
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            matched: @{item.matchedUsername}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada data karyawan yang cocok dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* QUICK CONSOLE GUIDE & TROUBLESHOOTING MODAL              */}
      {/* ========================================================= */}
      {isQuickGuideOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Cara Ambil Likers Instagram (Hanya 3 Detik)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Solusi praktis mengekstrak ratusan username likers tanpa ketik manual
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickGuideOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 custom-scrollbar">
              
              {/* Why F12 explanation */}
              <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Mengapa tidak bisa hanya memasukkan link postingan saja?</span>
                </p>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Instagram mengunci data orang yang me-like di balik akun login browser untuk mencegah scraping liar. Karena itu, cara paling cepat dan resmi adalah menyalin daftar likers langsung dari browser Anda menggunakan script 1-klik di bawah ini.
                </p>
              </div>

              {/* Step by Step Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs mb-2">
                    1
                  </div>
                  <strong className="block text-slate-900">Buka Modal Likes IG</strong>
                  <p className="text-[11px] text-slate-600">
                    Buka postingan di Instagram Web, lalu klik tulisan jumlah <strong>"Likes/Suka"</strong> agar popup likers terbuka.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs mb-2">
                    2
                  </div>
                  <strong className="block text-slate-900">Tekan F12 &gt; Console</strong>
                  <p className="text-[11px] text-slate-600">
                    Tekan <strong>F12</strong> pada keyboard (atau Ctrl+Shift+I), lalu klik tab menu <strong>Console</strong>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs mb-2">
                    3
                  </div>
                  <strong className="block text-slate-900">Paste Script & Enter</strong>
                  <p className="text-[11px] text-slate-600">
                    Paste script di bawah lalu tekan <strong>Enter</strong>. Semua username langsung otomatis tersalin ke Clipboard!
                  </p>
                </div>
              </div>

              {/* Script Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Script Console 1-Klik:
                  </span>
                  <button
                    onClick={handleCopyScript}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                      copiedScript
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                    }`}
                  >
                    {copiedScript ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Script Tersalin ke Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Script Console</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950 text-emerald-400 p-3.5 rounded-xl font-mono text-[11px] max-h-40 overflow-y-auto custom-scrollbar border border-slate-800 select-all">
                  <pre className="whitespace-pre">{INSTAGRAM_CONSOLE_SCRIPT}</pre>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  handleFillSample();
                  setIsQuickGuideOpen(false);
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Atau coba pakai Demo Data KTSN sekarang &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQuickGuideOpen(false)}
                className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Mengerti &amp; Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* NETLIFY DEPLOYMENT GUIDE MODAL                            */}
      {/* ========================================================= */}
      {isNetlifyGuideOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50 to-indigo-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-200">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span>Panduan Deploy ke Netlify (Gratis &amp; Cepat)</span>
                    <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-bold">
                      Siap Pakai
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Aplikasi ini 100% kompatibel dengan Netlify. Konfigurasi <code>netlify.toml</code> &amp; <code>_redirects</code> sudah terpasang.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNetlifyGuideOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 custom-scrollbar">
              
              {/* Ready notice */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-emerald-900 text-xs">
                    File Konfigurasi Netlify Sudah Otomatis Tersedia!
                  </p>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Kami sudah menambahkan file <b>netlify.toml</b> dan <b>public/_redirects</b> di repositori ini, sehingga routing SPA dan build React Vite akan berjalan mulus tanpa error 404 saat refresh halaman.
                  </p>
                </div>
              </div>

              {/* Method 1: Connect via GitHub */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">1</span>
                  <h4 className="font-bold text-slate-900 text-sm">Metode 1: Hubungkan ke GitHub (Rekomendasi Otomatis)</h4>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 pl-8">
                  <ol className="list-decimal space-y-2 text-slate-700 text-xs pl-2">
                    <li>
                      Buka <b><a href="https://app.netlify.com" target="_blank" rel="noreferrer" className="text-teal-700 underline font-bold">app.netlify.com</a></b> dan login / buat akun gratis.
                    </li>
                    <li>
                      Klik tombol <b>"Add new site" &gt; "Import an existing project"</b>.
                    </li>
                    <li>
                      Pilih <b>GitHub</b>, lalu pilih repositori proyek ini.
                    </li>
                    <li>
                      Netlify akan otomatis mendeteksi pengaturan build:
                      <div className="mt-2 bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-[11px] space-y-1">
                        <div><span className="text-slate-400">Build command:</span> <span className="text-white font-bold">npm run build</span></div>
                        <div><span className="text-slate-400">Publish directory:</span> <span className="text-teal-300 font-bold">dist</span></div>
                        <div><span className="text-slate-400">Node version:</span> <span className="text-slate-300">20.x / 18.x</span></div>
                      </div>
                    </li>
                    <li>
                      Klik tombol <b>"Deploy Site"</b>. Dalam hitungan 1-2 menit web app Anda langsung LIVE dengan domain <code>https://nama-app.netlify.app</code>!
                    </li>
                  </ol>
                </div>
              </div>

              {/* Method 2: Netlify Drop */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">2</span>
                  <h4 className="font-bold text-slate-900 text-sm">Metode 2: Netlify Drop (Drag &amp; Drop Folder Tanpa Git)</h4>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 pl-8">
                  <ol className="list-decimal space-y-1.5 text-slate-700 text-xs pl-2">
                    <li>
                      Jalankan perintah <code>npm run build</code> di komputer Anda. Ini akan menghasilkan folder <b>dist/</b>.
                    </li>
                    <li>
                      Buka <b><a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-teal-700 underline font-bold">app.netlify.com/drop</a></b>.
                    </li>
                    <li>
                      Tarik (drag &amp; drop) folder <b>dist</b> ke halaman browser tersebut.
                    </li>
                    <li>
                      Situs langsung online seketika tanpa perlu konfigurasi server apapun!
                    </li>
                  </ol>
                </div>
              </div>

              {/* FAQ / Clarification */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-indigo-950 space-y-1.5">
                <p className="font-bold text-xs text-indigo-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-600" />
                  <span>Apakah Tanggal &amp; Database Karyawan Perlu Diatur Ulang Tiap Hari?</span>
                </p>
                <p className="text-[11px] text-indigo-900 leading-relaxed">
                  <b>Tidak perlu!</b> Tanggal di aplikasi ini berjalan <b>otomatis setiap hari</b> menggunakan tanggal real-time perangkat. Database karyawan juga tersimpan aman di browser (LocalStorage) atau bisa langsung diimpor dari Google Sheets via tombol <i>"Kelola Karyawan &gt; Import Google Sheets"</i>.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Butuh deploy ke Google Apps Script juga? Ada di tab Panduan Deployment.
              </span>
              <button
                type="button"
                onClick={() => setIsNetlifyGuideOpen(false)}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-sm"
              >
                Tutup Panduan
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EXTENSION & BOOKMARKLET QUICK MODAL                      */}
      {/* ========================================================= */}
      {isExtensionModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-indigo-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200">
                  <Chrome className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span>Ekstensi &amp; Bookmarklet IG Liker Export</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                      1-Klik
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ekstrak otomatis daftar orang yang like postingan Instagram tanpa repot ketik manual.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExtensionModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 custom-scrollbar">
              
              {/* Option 1: Bookmarklet (Fastest) */}
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-amber-600" />
                    <span>Pilihan 1: Bookmarklet (Tanpa Perlu Install)</span>
                  </span>
                  <button
                    onClick={handleCopyBookmarklet}
                    className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
                  >
                    {copiedBookmarklet ? 'Tersalin!' : 'Salin Kode'}
                  </button>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Tinggal seret tombol di bawah ini ke <b>Bookmark Bar browser Anda</b>. Saat membuka likes di Instagram, cukup klik bookmark tersebut &gt; username otomatis tersalin ke clipboard!
                </p>
                <div className="flex justify-center pt-1">
                  <a
                    href={BOOKMARKLET_CODE}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCopyBookmarklet();
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                    title="Seret ke bar bookmark atau klik untuk salin kode"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>⚡ Ekstrak Likers IG (Seret ke Bookmark Bar)</span>
                  </a>
                </div>
              </div>

              {/* Option 2: Full Chrome Extension */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Chrome className="w-4 h-4 text-indigo-600" />
                    <span>Pilihan 2: Ekstensi Chrome (.ZIP)</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Pasang ekstensi permanen di Google Chrome / Edge untuk ekstraksi likers dengan 1-klik di pojok kanan atas browser.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsExtensionModalOpen(false);
                      if (onOpenExtensionGuide) {
                        onOpenExtensionGuide();
                      }
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Buka Tab Ekstensi &amp; Unduh ZIP &rarr;</span>
                  </button>
                </div>
              </div>

              {/* Option 3: F12 Script */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-slate-700" />
                    <span>Pilihan 3: Script Console F12</span>
                  </span>
                  <button
                    onClick={handleCopyScript}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    {copiedScript ? 'Script Tersalin!' : 'Salin Script'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Tekan <b>F12 &gt; Console</b> di halaman Instagram dan paste script untuk menyalin ratusan username dalam 2 detik.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Semua metode 100% aman dan berjalan di browser Anda sendiri.
              </span>
              <button
                type="button"
                onClick={() => setIsExtensionModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-sm"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
