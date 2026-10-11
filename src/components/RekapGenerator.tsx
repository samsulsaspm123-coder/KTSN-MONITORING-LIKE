import { useState, useMemo, useRef, useEffect } from 'react';
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
  Clipboard,
  RefreshCw,
  Download,
  QrCode,
  Smartphone,
  Trash2,
  Camera
} from 'lucide-react';
import { Employee, LikersProcessResult } from '../types';
import { processLikersData, formatDateIndo, generateWhatsAppLink, extractUsernamesFromRawText, compareDivisions } from '../utils/likersParser';
import { INSTAGRAM_CONSOLE_SCRIPT } from '../data/gasCodeSnippets';
import { BOOKMARKLET_CODE, downloadExtensionZip } from '../data/extensionFiles';
import { RecapBarcodeModal } from './RecapBarcodeModal';
import { LongScreenshotModal } from './LongScreenshotModal';

const LOCAL_STORAGE_KEY_REKAP_URL = 'likemonitor_rekap_url_post_v1';
const LOCAL_STORAGE_KEY_REKAP_LIKERS = 'likemonitor_rekap_raw_likers_v1';
const LOCAL_STORAGE_KEY_REKAP_AUTO_DATE = 'likemonitor_rekap_auto_date_v1';
const LOCAL_STORAGE_KEY_REKAP_CUSTOM_DATE = 'likemonitor_rekap_custom_date_v1';

interface RekapGeneratorProps {
  employees: Employee[];
  storeCode: string;
  setStoreCode: (code: string) => void;
  compactMode?: boolean;
  onOpenConsoleGuide: () => void;
  onOpenExtensionGuide?: () => void;
  onOpenEmployeeManager: () => void;
  onOpenSosmedReport?: () => void;
}

export function RekapGenerator({
  employees,
  storeCode,
  setStoreCode,
  compactMode = false,
  onOpenConsoleGuide,
  onOpenExtensionGuide,
  onOpenEmployeeManager,
  onOpenSosmedReport,
}: RekapGeneratorProps) {
  // Form State with LocalStorage Persistence (Aman & Tidak Hilang saat di-minimize atau berpindah tab)
  const [urlPost, setUrlPost] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY_REKAP_URL) || '';
    } catch {
      return '';
    }
  });

  const [rawLikersText, setRawLikersText] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY_REKAP_LIKERS) || '';
    } catch {
      return '';
    }
  });

  const [isAutoDate, setIsAutoDate] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_REKAP_AUTO_DATE);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [customDate, setCustomDate] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_REKAP_CUSTOM_DATE);
      return saved || formatDateIndo(new Date());
    } catch {
      return formatDateIndo(new Date());
    }
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Restore initial processed result if rawLikersText exists in storage
  const [result, setResult] = useState<LikersProcessResult | null>(() => {
    try {
      const savedLikers = localStorage.getItem(LOCAL_STORAGE_KEY_REKAP_LIKERS);
      if (savedLikers && savedLikers.trim()) {
        const savedUrl = localStorage.getItem(LOCAL_STORAGE_KEY_REKAP_URL) || '';
        const savedCustomDate = localStorage.getItem(LOCAL_STORAGE_KEY_REKAP_CUSTOM_DATE) || formatDateIndo(new Date());
        return processLikersData({
          urlPost: savedUrl.trim(),
          rawLikersText: savedLikers,
          employees,
          customDate: savedCustomDate,
          storeCode: storeCode || 'KTSN',
        });
      }
    } catch {
      // Fallback
    }
    return null;
  });

  const [clearFeedback, setClearFeedback] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState<boolean>(false);
  const [isDownloadingExtensionZip, setIsDownloadingExtensionZip] = useState<boolean>(false);
  const [isQuickGuideOpen, setIsQuickGuideOpen] = useState<boolean>(false);
  const [isNetlifyGuideOpen, setIsNetlifyGuideOpen] = useState<boolean>(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState<boolean>(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState<boolean>(false);
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState<boolean>(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  // Auto-sync form inputs to localStorage so data NEVER vanishes when minimized or refreshed
  useEffect(() => {
    try {
      if (urlPost) {
        localStorage.setItem(LOCAL_STORAGE_KEY_REKAP_URL, urlPost);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY_REKAP_URL);
      }
    } catch (e) {
      console.warn('Failed to save urlPost to localStorage', e);
    }
  }, [urlPost]);

  useEffect(() => {
    try {
      if (rawLikersText) {
        localStorage.setItem(LOCAL_STORAGE_KEY_REKAP_LIKERS, rawLikersText);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY_REKAP_LIKERS);
      }
    } catch (e) {
      console.warn('Failed to save rawLikersText to localStorage', e);
    }
  }, [rawLikersText]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_REKAP_AUTO_DATE, String(isAutoDate));
    } catch (e) {
      console.warn('Failed to save isAutoDate to localStorage', e);
    }
  }, [isAutoDate]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_REKAP_CUSTOM_DATE, customDate);
    } catch (e) {
      console.warn('Failed to save customDate to localStorage', e);
    }
  }, [customDate]);

  // Keep result synced if employees list updates while raw likers are present
  useEffect(() => {
    if (rawLikersText.trim() && !result) {
      const effectiveDate = isAutoDate ? formatDateIndo(new Date()) : customDate;
      const res = processLikersData({
        urlPost: urlPost.trim(),
        rawLikersText,
        employees,
        customDate: effectiveDate,
        storeCode: storeCode || 'KTSN',
      });
      setResult(res);
    }
  }, [employees]);
  
  // Breakdown Table Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDivFilter, setSelectedDivFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'DENDA' | 'LIKED' | 'ORANG_LUAR' | 'EXEMPT'>('ALL');
  const [copiedExternalLikers, setCopiedExternalLikers] = useState<boolean>(false);
  const [copiedSingleUser, setCopiedSingleUser] = useState<string | null>(null);
  const [externalLikersViewMode, setExternalLikersViewMode] = useState<'top' | 'bottom' | 'table_only'>('top');
  const [isExternalLikersExpanded, setIsExternalLikersExpanded] = useState<boolean>(true);

  // Ref to bypass React security filter for javascript: URLs when dragging to bookmark bar
  const bookmarkletQuickRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (isExtensionModalOpen && bookmarkletQuickRef.current) {
      bookmarkletQuickRef.current.setAttribute('href', BOOKMARKLET_CODE);
    }
  }, [isExtensionModalOpen]);

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

  // 1-Click Auto Clear: Menghapus link IG dan seluruh username likers sebelumnya sekaligus & membersihkan storage
  const handleAutoClear = () => {
    setUrlPost('');
    setRawLikersText('');
    setResult(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_REKAP_URL);
      localStorage.removeItem(LOCAL_STORAGE_KEY_REKAP_LIKERS);
    } catch (e) {
      console.warn('Failed to clear rekap from localStorage', e);
    }
    setClearFeedback(true);
    setTimeout(() => {
      setClearFeedback(false);
    }, 2800);
  };

  const handleClear = handleAutoClear;

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
              urlPost: urlPost || '',
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

  // Download Extension ZIP from modal
  const handleDownloadExtensionZip = async () => {
    try {
      setIsDownloadingExtensionZip(true);
      await downloadExtensionZip();
    } catch (err) {
      console.error('Failed to download extension:', err);
    } finally {
      setIsDownloadingExtensionZip(false);
    }
  };

  // Copy all external likers list to clipboard
  const handleCopyExternalLikers = (format: 'newline' | 'comma' = 'newline') => {
    if (!result?.unrecognizedLikers?.length) return;
    const text = format === 'newline'
      ? result.unrecognizedLikers.map((u) => `@${u}`).join('\n')
      : result.unrecognizedLikers.map((u) => `@${u}`).join(', ');
    navigator.clipboard.writeText(text).then(() => {
      setCopiedExternalLikers(true);
      setTimeout(() => setCopiedExternalLikers(false), 2000);
    });
  };

  // Copy single username
  const handleCopySingleUser = (username: string) => {
    navigator.clipboard.writeText(`@${username}`).then(() => {
      setCopiedSingleUser(username);
      setTimeout(() => setCopiedSingleUser(null), 1500);
    });
  };

  // Filtered external likers (non-employee / not in database)
  const filteredExternalLikers = useMemo(() => {
    if (!result?.unrecognizedLikers) return [];
    if (!searchQuery.trim()) return result.unrecognizedLikers;
    const q = searchQuery.toLowerCase().replace(/^@+/, '');
    return result.unrecognizedLikers.filter((u) => u.toLowerCase().includes(q));
  }, [result, searchQuery]);

  // Filtered list for the detail breakdown table
  const filteredDetailResults = useMemo(() => {
    if (!result) return [];
    // If user filtered specifically for ORANG_LUAR only, hide standard employee rows
    if (selectedStatusFilter === 'ORANG_LUAR') return [];

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

  // Unique divisions for filter dropdown (sorted by branch priority: NGK -> WRJ -> KTSN)
  const divisionList = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => set.add(e.divisi));
    return Array.from(set).sort(compareDivisions);
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

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setIsScreenshotModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-fuchsia-600 via-rose-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title="Buat screenshot panjang otomatis mirip 100% modal Likes Instagram tanpa screen recording iPhone"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Screenshot Panjang IG</span>
          </button>
          {onOpenSosmedReport && (
            <button
              onClick={onOpenSosmedReport}
              className="px-3.5 py-2 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Buka menu Recap Konten Harian (Talent, Status Produksi & Status Upload)"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Recap Konten</span>
              <span className="text-[9px] bg-white/25 px-1 py-0.2 rounded font-mono">Harian</span>
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
                    onClick={() => setIsExtensionModalOpen(true)}
                    className="text-[11px] text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold transition-colors cursor-pointer"
                    title="Buka pop up mini ekstrak otomatis (Bookmarklet, Ekstensi Chrome, Script Console)"
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
                  placeholder="https://www.instagram.com/p/..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all text-slate-900 font-medium pr-36"
                />
                <div className="absolute right-2 flex items-center gap-1.5">
                  {urlPost && (
                    <button
                      type="button"
                      onClick={() => setUrlPost('')}
                      className="text-[11px] text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-200 cursor-pointer"
                      title="Hapus Link"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsExtensionModalOpen(true)}
                    className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                    title="Buka pop up mini 1-klik ekstrak likers"
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
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5" htmlFor="likers-textarea">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                    <span>Username Likers List</span>
                  </label>
                  {detectedUsernames.length > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      {detectedUsernames.length} User Terdeteksi
                    </span>
                  )}
                  {(rawLikersText || urlPost) && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200" title="Data tersimpan di browser secara otomatis sehingga aman saat diminimize atau berpindah tab">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Aman Saat Minimize</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Tombol Hapus Otomatis (1-Klik Bersihkan Link & Likers Sebelumnya) */}
                  {(rawLikersText || urlPost) && (
                    <button
                      type="button"
                      onClick={handleAutoClear}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                      title="Sekali klik untuk menghapus link Instagram dan seluruh daftar username likers sebelumnya"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Hapus Otomatis (Link & Likers)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsScreenshotModalOpen(true)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-gradient-to-r from-fuchsia-50 to-pink-50 hover:from-fuchsia-100 hover:to-pink-100 text-fuchsia-800 border border-fuchsia-200 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="Buka generator screenshot panjang bukti like Instagram (100% mirip modal IG asli)"
                  >
                    <Camera className="w-3.5 h-3.5 text-fuchsia-600" />
                    <span>Screenshot Panjang</span>
                  </button>

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
                </div>
              </div>

              <textarea
                id="likers-textarea"
                rows={6}
                value={rawLikersText}
                onChange={(e) => setRawLikersText(e.target.value)}
                placeholder="Tempel (Ctrl + V) hasil copy dari Bookmarklet atau Console F12 Instagram di sini..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm resize-none font-mono transition-all text-slate-800 custom-scrollbar leading-relaxed"
              />

              {/* Notification Banner when Auto Clear is clicked */}
              {clearFeedback && (
                <div className="mt-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Link postingan dan seluruh daftar username likers sebelumnya berhasil dihapus! Siap untuk postingan berikutnya.</span>
                </div>
              )}

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
                        <li>Klik <strong>Bookmarklet</strong> di browser atau tekan <strong>F12</strong> (Console) &gt; jalankan script likers.</li>
                        <li>Daftar likers langsung otomatis tersalin. Kembali ke sini lalu tekan <strong>Ctrl + V</strong> (atau tombol Tempel dari Clipboard)!</li>
                        <li><strong className="text-emerald-700">Data otomatis tersimpan di browser</strong>, jadi aman dan tidak akan hilang saat aplikasi di-minimize.</li>
                      </ol>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-indigo-100/60 text-[11px]">
                    <span className="text-slate-500">Hasil tempel akan tersimpan otomatis dan dapat dihapus dalam sekali klik dengan tombol Hapus Otomatis.</span>
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
                  <span>✅ Format didukung: @username, baris baru, koma, spasi, atau output console. Data tersimpan otomatis.</span>
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
            <div className="space-y-2 pt-1">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  id="btn-process-rekap"
                  type="button"
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className={`flex-1 font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
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

                {(rawLikersText || urlPost) && (
                  <button
                    type="button"
                    onClick={handleAutoClear}
                    className="sm:w-auto px-4 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                    title="Sekali klik untuk menghapus link Instagram dan seluruh daftar username likers sebelumnya"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span className="whitespace-nowrap">Hapus Otomatis</span>
                  </button>
                )}
              </div>
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
              <div className="flex items-center gap-1.5">
                {(result || urlPost || rawLikersText) && (
                  <button
                    type="button"
                    onClick={handleAutoClear}
                    className="px-2.5 py-1.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-xs active:scale-95"
                    title="Sekali klik untuk menghapus link & username untuk rekap berikutnya"
                  >
                    <Trash2 className="w-3 h-3 text-rose-400" />
                    <span>HAPUS</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsBarcodeModalOpen(true)}
                  disabled={!result}
                  className={`px-2.5 py-1.5 rounded text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    result
                      ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-xs'
                      : 'bg-white/5 text-slate-500 cursor-not-allowed'
                  }`}
                  title="Tampilkan Barcode QR untuk discan langsung dari kamera HP Anda"
                >
                  <QrCode className="w-3 h-3 text-amber-400" />
                  <span>BARCODE HP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsScreenshotModalOpen(true)}
                  disabled={!result}
                  className={`px-2.5 py-1.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    result
                      ? 'bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-300 border border-fuchsia-500/40 shadow-xs'
                      : 'bg-white/5 text-slate-500 cursor-not-allowed'
                  }`}
                  title="Buat dan unduh screenshot panjang bukti like Instagram (100% mirip modal IG asli)"
                >
                  <Camera className="w-3 h-3 text-fuchsia-400" />
                  <span>SCREENSHOT</span>
                </button>

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
            </div>

            {/* Metrics Chips */}
            {result && (
              <div className="grid grid-cols-5 gap-1.5 bg-slate-800/80 p-2.5 rounded-lg border border-white/5 text-center">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Karyawan</span>
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
                <div className="border-l border-slate-700 pl-1">
                  <span className="text-[9px] text-cyan-400 font-bold block uppercase" title="Orang luar / non-karyawan yang me-like postingan">Luar (IG)</span>
                  <span className="text-sm font-bold text-cyan-300 font-mono">
                    {result.unrecognizedLikers?.length || 0}
                  </span>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!result}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
                className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  result
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    : 'bg-slate-800/40 text-slate-500 pointer-events-none cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Buka di WA</span>
              </a>

              <button
                type="button"
                onClick={() => setIsBarcodeModalOpen(true)}
                disabled={!result}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  result
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/20 active:scale-[0.98]'
                    : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
                }`}
                title="Tampilkan barcode QR untuk discan langsung dari kamera HP Anda"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Barcode HP</span>
              </button>

              <button
                type="button"
                onClick={() => setIsScreenshotModalOpen(true)}
                disabled={!result}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  result
                    ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white shadow-md shadow-fuchsia-500/20 active:scale-[0.98]'
                    : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
                }`}
                title="Buat dan download screenshot panjang bukti like Instagram (100% mirip modal IG asli)"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Screenshot</span>
              </button>
            </div>

            {/* Quick 1-Click Clear / Reset for Next Post */}
            {result && (
              <div>
                <button
                  type="button"
                  onClick={handleAutoClear}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-slate-800/80 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700/60 hover:border-rose-500/30 shadow-xs"
                  title="Hapus data rekap ini dan bersihkan link & username untuk postingan berikutnya"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Selesai & Hapus Otomatis (Siap Posting Baru)</span>
                </button>
              </div>
            )}

            {/* Quick Helper Banner: WA Laptop Susah / Lemot Buka */}
            {result && (
              <div className="bg-gradient-to-r from-amber-950/40 via-slate-800/90 to-slate-800/90 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>WA di Laptop Susah Buka?</span>
                      <span className="text-[9px] text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded font-bold border border-amber-500/30">
                        Scan Barcode
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Scan barcode di layar &rarr; teks rekap denda langsung pindah ke WhatsApp HP Anda.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBarcodeModalOpen(true)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shrink-0 shadow-sm transition-colors cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan di HP</span>
                </button>
              </div>
            )}
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
      {/* DETAILED EMPLOYEE BREAKDOWN TABLE & ORANG LUAR SECTION     */}
      {/* ========================================================= */}
      {result && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Rincian Status Setiap Karyawan &amp; Akun Luar
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {filteredDetailResults.length} dari {result.allResults.length} Karyawan
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'ORANG_LUAR' ? 'ALL' : 'ORANG_LUAR')}
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer border ${
                    selectedStatusFilter === 'ORANG_LUAR'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  }`}
                  title="Klik untuk memfilter khusus akun orang luar"
                >
                  <Globe className="w-3 h-3 text-amber-700" />
                  <span>{result.unrecognizedLikers?.length || 0} Orang Luar (Non-DB)</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pemeriksaan detail akun Instagram karyawan terdaftar dan tracking akun publik/orang luar yang me-like postingan
              </p>
            </div>

            {/* Filters & Position Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama / username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 w-36 sm:w-44"
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
                <option value="ALL">Semua Status (Karyawan + Luar)</option>
                <option value="DENDA">❌ Kena Denda ({result.totalDenda})</option>
                <option value="LIKED">✅ Sudah Like ({result.totalSudahLike})</option>
                <option value="ORANG_LUAR">🌐 Orang Luar / Non-DB ({result.unrecognizedLikers?.length || 0})</option>
                <option value="EXEMPT">🏖️ Cuti / Off ({result.totalExempt})</option>
              </select>

              {/* Position Switcher for Orang Luar */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => setExternalLikersViewMode('top')}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    externalLikersViewMode === 'top' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'
                  }`}
                  title="Tampilkan panel orang luar di paling atas"
                >
                  Posisi: Atas
                </button>
                <button
                  type="button"
                  onClick={() => setExternalLikersViewMode('bottom')}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    externalLikersViewMode === 'bottom' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-900'
                  }`}
                  title="Tampilkan panel orang luar di paling bawah"
                >
                  Bawah
                </button>
              </div>
            </div>
          </div>

          {/* DEDICATED ORANG LUAR / NON-DATABASE CARD (TOP POSITION) */}
          {(externalLikersViewMode === 'top' || selectedStatusFilter === 'ORANG_LUAR') && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-amber-200/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        Daftar Akun Orang Luar (Non-Database)
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                        {filteredExternalLikers.length} dari {result.unrecognizedLikers?.length || 0} Akun
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Username yang me-like postingan ini tapi tidak terdaftar di database karyawan (audiens / follower organik).
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyExternalLikers('newline')}
                    disabled={!result.unrecognizedLikers?.length}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      copiedExternalLikers
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                    }`}
                  >
                    {copiedExternalLikers ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedExternalLikers ? 'Semua Tersalin!' : `Salin Semua (${result.unrecognizedLikers?.length || 0})`}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsExternalLikersExpanded(!isExternalLikersExpanded)}
                    className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-semibold cursor-pointer"
                    title={isExternalLikersExpanded ? 'Sembunyikan chip' : 'Tampilkan chip'}
                  >
                    {isExternalLikersExpanded ? 'Tutup' : 'Buka'}
                  </button>
                </div>
              </div>

              {/* Chips Grid */}
              {isExternalLikersExpanded && (
                <div>
                  {filteredExternalLikers.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                      {filteredExternalLikers.map((username) => (
                        <div
                          key={`chip-${username}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-amber-200 hover:border-amber-400 text-slate-800 text-xs shadow-2xs group transition-all"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span className="font-mono font-medium text-slate-800">@{username}</span>
                          
                          <button
                            type="button"
                            onClick={() => handleCopySingleUser(username)}
                            className="text-slate-400 hover:text-indigo-600 p-0.5 rounded cursor-pointer transition-colors"
                            title="Salin username"
                          >
                            {copiedSingleUser === username ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>

                          <a
                            href={`https://www.instagram.com/${username}/`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-indigo-600 p-0.5 rounded transition-colors"
                            title="Buka profil Instagram"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-800/80 italic py-2">
                      {searchQuery ? 'Tidak ada akun orang luar yang cocok dengan pencarian.' : 'Tidak ada akun orang luar terdeteksi.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Divisi</th>
                  <th className="py-2.5 px-3 font-semibold">Nama Karyawan / Info Akun</th>
                  <th className="py-2.5 px-3 font-semibold">Username 1</th>
                  <th className="py-2.5 px-3 font-semibold">Username 2</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status Kerja</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Hasil Like</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {/* 1. ORANG LUAR ROWS (WHEN VIEW MODE IS 'top' OR FILTER IS 'ORANG_LUAR' OR 'ALL') */}
                {(selectedStatusFilter === 'ORANG_LUAR' || (selectedStatusFilter === 'ALL' && externalLikersViewMode === 'top')) && (
                  selectedDivFilter === 'ALL' && filteredExternalLikers.map((username) => (
                    <tr
                      key={`table-ext-top-${username}`}
                      className="bg-amber-50/50 hover:bg-amber-100/60 transition-colors border-l-4 border-l-amber-500"
                    >
                      <td className="py-2.5 px-3 font-bold">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300 inline-flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5 text-amber-700" />
                          <span>NON-KARYAWAN</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>Akun Publik / Orang Luar</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-200 text-amber-900">
                            Non-DB
                          </span>
                        </div>
                        <span className="block text-[10px] font-normal text-amber-800">
                          Bukan staf terdaftar di database
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                        @{username}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        -
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Orang Luar
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                          Sudah Like (Publik)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopySingleUser(username)}
                            className="text-[10px] font-mono text-slate-600 hover:text-indigo-600 bg-white px-2 py-0.5 rounded border border-slate-200 cursor-pointer flex items-center gap-1"
                            title="Salin username"
                          >
                            {copiedSingleUser === username ? (
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                            <span>{copiedSingleUser === username ? 'Tersalin' : 'Salin'}</span>
                          </button>
                          <a
                            href={`https://www.instagram.com/${username}/`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-mono text-indigo-600 hover:underline bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-flex items-center gap-1"
                          >
                            <span>Buka IG</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}

                {/* 2. REGULAR EMPLOYEE ROWS */}
                {filteredDetailResults.map((item) => (
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
                ))}

                {/* 3. ORANG LUAR ROWS (WHEN VIEW MODE IS 'bottom' AND FILTER IS 'ALL') */}
                {selectedStatusFilter === 'ALL' && externalLikersViewMode === 'bottom' && selectedDivFilter === 'ALL' && (
                  filteredExternalLikers.map((username) => (
                    <tr
                      key={`table-ext-bottom-${username}`}
                      className="bg-amber-50/50 hover:bg-amber-100/60 transition-colors border-l-4 border-l-amber-500"
                    >
                      <td className="py-2.5 px-3 font-bold">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300 inline-flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5 text-amber-700" />
                          <span>NON-KARYAWAN</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>Akun Publik / Orang Luar</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-200 text-amber-900">
                            Non-DB
                          </span>
                        </div>
                        <span className="block text-[10px] font-normal text-amber-800">
                          Bukan staf terdaftar di database
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                        @{username}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        -
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Orang Luar
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                          Sudah Like (Publik)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopySingleUser(username)}
                            className="text-[10px] font-mono text-slate-600 hover:text-indigo-600 bg-white px-2 py-0.5 rounded border border-slate-200 cursor-pointer flex items-center gap-1"
                            title="Salin username"
                          >
                            {copiedSingleUser === username ? (
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                            <span>{copiedSingleUser === username ? 'Tersalin' : 'Salin'}</span>
                          </button>
                          <a
                            href={`https://www.instagram.com/${username}/`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-mono text-indigo-600 hover:underline bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-flex items-center gap-1"
                          >
                            <span>Buka IG</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}

                {/* Empty State */}
                {filteredDetailResults.length === 0 && (selectedStatusFilter !== 'ORANG_LUAR' || filteredExternalLikers.length === 0) && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada data yang cocok dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* DEDICATED ORANG LUAR / NON-DATABASE CARD (BOTTOM POSITION) */}
          {externalLikersViewMode === 'bottom' && selectedStatusFilter !== 'ORANG_LUAR' && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 mt-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-amber-200/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        Daftar Akun Orang Luar (Non-Database)
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                        {filteredExternalLikers.length} dari {result.unrecognizedLikers?.length || 0} Akun
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Username yang me-like postingan ini tapi tidak terdaftar di database karyawan (audiens / follower organik).
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyExternalLikers('newline')}
                    disabled={!result.unrecognizedLikers?.length}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      copiedExternalLikers
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                    }`}
                  >
                    {copiedExternalLikers ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedExternalLikers ? 'Semua Tersalin!' : `Salin Semua (${result.unrecognizedLikers?.length || 0})`}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsExternalLikersExpanded(!isExternalLikersExpanded)}
                    className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-semibold cursor-pointer"
                    title={isExternalLikersExpanded ? 'Sembunyikan chip' : 'Tampilkan chip'}
                  >
                    {isExternalLikersExpanded ? 'Tutup' : 'Buka'}
                  </button>
                </div>
              </div>

              {/* Chips Grid */}
              {isExternalLikersExpanded && (
                <div>
                  {filteredExternalLikers.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                      {filteredExternalLikers.map((username) => (
                        <div
                          key={`chip-bottom-${username}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-amber-200 hover:border-amber-400 text-slate-800 text-xs shadow-2xs group transition-all"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span className="font-mono font-medium text-slate-800">@{username}</span>
                          
                          <button
                            type="button"
                            onClick={() => handleCopySingleUser(username)}
                            className="text-slate-400 hover:text-indigo-600 p-0.5 rounded cursor-pointer transition-colors"
                            title="Salin username"
                          >
                            {copiedSingleUser === username ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>

                          <a
                            href={`https://www.instagram.com/${username}/`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-indigo-600 p-0.5 rounded transition-colors"
                            title="Buka profil Instagram"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-800/80 italic py-2">
                      {searchQuery ? 'Tidak ada akun orang luar yang cocok dengan pencarian.' : 'Tidak ada akun orang luar terdeteksi.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
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
              
              {/* Option 1: Bookmarklet (Fastest & No Install) */}
              <div className="p-4 bg-gradient-to-br from-amber-50/90 to-indigo-50/70 border-2 border-amber-300/80 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-amber-600" />
                    <span>Pilihan 1: Bookmarklet (Super Cepat &amp; Tanpa Install)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyBookmarklet}
                    className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {copiedBookmarklet ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Kode Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Seret tombol di bawah ke <b>Bookmarks Bar (Ctrl+Shift+B)</b>, atau <b>klik tombol</b> untuk langsung menyalin kodenya:
                </p>

                <div className="flex justify-center pt-1">
                  <a
                    ref={bookmarkletQuickRef}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCopyBookmarklet();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:from-amber-600 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform"
                    title="Seret ke bar bookmark atau klik untuk salin kode"
                  >
                    {copiedBookmarklet ? <Check className="w-4 h-4 text-emerald-300" /> : <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />}
                    <span>{copiedBookmarklet ? '✅ Kode Bookmarklet Tersalin!' : '⚡ Ekstrak Likers IG (Seret ke Bar / Klik Salin)'}</span>
                  </a>
                </div>

                <div className="text-[10px] text-slate-500 bg-white/60 p-2.5 rounded-lg border border-slate-200/60 space-y-1.5">
                  <div className="font-semibold text-slate-700">💡 Cara Pasang & Pakai di Instagram:</div>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                    <li><b>Cara Cepat:</b> Seret tombol di atas ke Bookmarks Bar Chrome (tekan <code>Ctrl+Shift+B</code> jika bar belum muncul).</li>
                    <li><b>Cara Manual (Jika seret terhalang):</b> Klik tombol di atas untuk salin kode &gt; Tekan <code>Ctrl+Shift+O</code> di Chrome &gt; Klik titik 3 kanan atas &gt; <i>Add new bookmark</i> &gt; Paste kode di kolom URL &gt; Simpan.</li>
                    <li>Buka postingan IG di tab baru &gt; Klik jumlah <b>Suka / Likes</b> agar modal terbuka &gt; Klik bookmark <b>⚡ Ekstrak Likers IG</b>.</li>
                  </ol>
                </div>
              </div>

              {/* Option 2: Full Chrome Extension */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Chrome className="w-4 h-4 text-indigo-600" />
                    <span>Pilihan 2: Ekstensi Chrome (.ZIP Lengkap)</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Ekstensi resmi dengan ikon petir di pojok kanan atas browser Anda untuk auto-scroll dan ekstrak hingga ribuan likers.
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadExtensionZip}
                    disabled={isDownloadingExtensionZip}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    {isDownloadingExtensionZip ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyiapkan ZIP...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh Ekstensi ZIP</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsExtensionModalOpen(false);
                      if (onOpenExtensionGuide) {
                        onOpenExtensionGuide();
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Panduan Lengkap &rarr;</span>
                  </button>
                </div>
              </div>

              {/* Option 3: F12 Script */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-slate-700" />
                    <span>Pilihan 3: Script Console F12 (Tanpa Pasang Apapun)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    {copiedScript ? 'Script Tersalin!' : 'Salin Script'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Buka tab Instagram &gt; Tekan <b>F12 &gt; Console</b> &gt; Paste script &gt; Tekan Enter. Likers langsung tersalin dalam 2 detik.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text && text.trim()) {
                      setRawLikersText(text.trim());
                      setIsExtensionModalOpen(false);
                      setTimeout(() => {
                        const effectiveDate = isAutoDate ? formatDateIndo(new Date()) : customDate;
                        const res = processLikersData({
                          urlPost: urlPost.trim(),
                          rawLikersText: text.trim(),
                          employees,
                          customDate: effectiveDate,
                          storeCode: storeCode || 'KTSN',
                        });
                        setResult(res);
                      }, 100);
                    } else {
                      setIsExtensionModalOpen(false);
                      alert('Clipboard masih kosong. Silakan salin likers dari IG terlebih dahulu.');
                    }
                  } catch {
                    setIsExtensionModalOpen(false);
                  }
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                title="Tempel teks likers yang ada di clipboard dan proses rekap langsung"
              >
                <Clipboard className="w-4 h-4" />
                <span>Tempel dari Clipboard &amp; Mulai Rekap</span>
              </button>

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

      {/* Barcode QR Modal for Phone Scanning */}
      <RecapBarcodeModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        result={result}
      />

      {/* Long Screenshot Modal */}
      <LongScreenshotModal
        isOpen={isScreenshotModalOpen}
        onClose={() => setIsScreenshotModalOpen(false)}
        result={result}
        employees={employees}
        storeCode={storeCode || 'KTSN'}
        urlPost={urlPost}
      />

    </div>
  );
}
