import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Instagram,
  Facebook,
  Send,
  Copy,
  Check,
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
  Terminal,
  X,
  Layers,
  ArrowRight,
  Globe,
  Rocket,
  Chrome,
  Bookmark,
  Zap,
  Clipboard,
  RefreshCw,
  Download,
  QrCode,
  Smartphone,
  Trash2,
  Camera,
  UserCheck,
  UserX,
  ShieldAlert,
  Link2,
  Upload,
  RotateCcw,
} from 'lucide-react';
import {
  Employee,
  LikersProcessResult,
  LikePlatformMode,
  SimilarLikerCandidate,
} from '../types';
import {
  processLikersData,
  formatDateIndo,
  generateWhatsAppLink,
  extractLikersByPlatform,
  parseFacebookIdentity,
  compareDivisions,
} from '../utils/likersParser';
import {
  INSTAGRAM_CONSOLE_SCRIPT,
  FACEBOOK_CONSOLE_SCRIPT,
} from '../data/gasCodeSnippets';
import {
  BOOKMARKLET_CODE,
  FACEBOOK_BOOKMARKLET_CODE,
  downloadExtensionZip,
} from '../data/extensionFiles';
import { RecapBarcodeModal } from './RecapBarcodeModal';
import { LongScreenshotModal } from './LongScreenshotModal';

const LOCAL_STORAGE_KEY_REKAP_URL_IG = 'likemonitor_rekap_url_post_v1';
const LOCAL_STORAGE_KEY_REKAP_LIKERS_IG = 'likemonitor_rekap_raw_likers_v1';
const LOCAL_STORAGE_KEY_REKAP_URL_FB = 'likemonitor_rekap_fb_url_post_v1';
const LOCAL_STORAGE_KEY_REKAP_LIKERS_FB = 'likemonitor_rekap_fb_raw_likers_v1';
const LOCAL_STORAGE_KEY_REKAP_AUTO_DATE = 'likemonitor_rekap_auto_date_v1';
const LOCAL_STORAGE_KEY_REKAP_CUSTOM_DATE = 'likemonitor_rekap_custom_date_v1';
const LOCAL_STORAGE_KEY_REJECTED_SIMILAR = 'likemonitor_rejected_similar_pairs_v1';

interface RekapGeneratorProps {
  employees: Employee[];
  setEmployees?: (employees: Employee[]) => void;
  storeCode: string;
  setStoreCode: (code: string) => void;
  compactMode?: boolean;
  likePlatform?: LikePlatformMode;
  setLikePlatform?: (mode: LikePlatformMode) => void;
  onOpenConsoleGuide: () => void;
  onOpenExtensionGuide?: () => void;
  onOpenEmployeeManager: () => void;
  onOpenFbImport?: () => void;
  onOpenSosmedReport?: () => void;
}

export function RekapGenerator({
  employees,
  setEmployees,
  storeCode,
  setStoreCode,
  compactMode = false,
  likePlatform,
  setLikePlatform,
  onOpenConsoleGuide,
  onOpenExtensionGuide,
  onOpenEmployeeManager,
  onOpenFbImport,
  onOpenSosmedReport,
}: RekapGeneratorProps) {
  // Unified Platform Switcher (Saklar Pembeda Mode Instagram vs Mode Facebook)
  const [internalPlatform, setInternalPlatform] = useState<LikePlatformMode>('instagram');
  const activePlatform: LikePlatformMode = likePlatform ?? internalPlatform;
  const isFb = activePlatform === 'facebook';

  const handleSwitchPlatform = (mode: LikePlatformMode) => {
    if (setLikePlatform) {
      setLikePlatform(mode);
    } else {
      setInternalPlatform(mode);
    }
    setLinkingLikerRaw(null);
  };

  // Separate persisted drafts for Instagram & Facebook so switching toggle never overwrites data
  const [urlPostIg, setUrlPostIg] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY_REKAP_URL_IG) || '';
    } catch {
      return '';
    }
  });

  const [rawLikersIg, setRawLikersIg] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY_REKAP_LIKERS_IG) || '';
    } catch {
      return '';
    }
  });

  const [urlPostFb, setUrlPostFb] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY_REKAP_URL_FB) || '';
    } catch {
      return '';
    }
  });

  const [rawLikersFb, setRawLikersFb] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY_REKAP_LIKERS_FB) || '';
    } catch {
      return '';
    }
  });

  const urlPost = isFb ? urlPostFb : urlPostIg;
  const setUrlPost = (val: string) => {
    if (isFb) setUrlPostFb(val);
    else setUrlPostIg(val);
  };

  const rawLikersText = isFb ? rawLikersFb : rawLikersIg;
  const setRawLikersText = (val: string) => {
    if (isFb) setRawLikersFb(val);
    else setRawLikersIg(val);
  };

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

  // Manual similarity / unlisted account confirmations per platform (employeeId -> likerRaw)
  const [manualConfirmedIg, setManualConfirmedIg] = useState<Record<string, string>>({});
  const [manualConfirmedFb, setManualConfirmedFb] = useState<Record<string, string>>({});
  const activeManualConfirmed = isFb ? manualConfirmedFb : manualConfirmedIg;

  // Rejected similar pairs ("Beda Orang") persisted across sessions
  const [rejectedPairKeys, setRejectedPairKeys] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_REJECTED_SIMILAR);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_REJECTED_SIMILAR, JSON.stringify(rejectedPairKeys));
    } catch {
      // ignore
    }
  }, [rejectedPairKeys]);

  // Track whether each platform has processed output active
  const [hasProcessedIg, setHasProcessedIg] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_REKAP_LIKERS_IG);
      return Boolean(saved && saved.trim());
    } catch {
      return false;
    }
  });

  const [hasProcessedFb, setHasProcessedFb] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_REKAP_LIKERS_FB);
      return Boolean(saved && saved.trim());
    } catch {
      return false;
    }
  });

  const hasProcessedActive = isFb ? hasProcessedFb : hasProcessedIg;
  const setHasProcessedActive = (val: boolean) => {
    if (isFb) setHasProcessedFb(val);
    else setHasProcessedIg(val);
  };

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [toastNotice, setToastNotice] = useState<{ type: 'success' | 'warning' | 'info'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    setToastNotice({ message, type });
    setTimeout(() => {
      setToastNotice((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Compute result reactively whenever platform, employees, confirmations, or processed state changes
  const result = useMemo<LikersProcessResult | null>(() => {
    if (!hasProcessedActive || !rawLikersText.trim()) return null;
    const effectiveDate = isAutoDate ? formatDateIndo(new Date()) : customDate;
    return processLikersData({
      urlPost: urlPost.trim(),
      rawLikersText,
      employees,
      customDate: effectiveDate,
      storeCode: storeCode || 'KTSN',
      platform: activePlatform,
      manualConfirmedMap: activeManualConfirmed,
      rejectedPairKeys,
    });
  }, [
    hasProcessedActive,
    rawLikersText,
    urlPost,
    employees,
    isAutoDate,
    customDate,
    storeCode,
    activePlatform,
    activeManualConfirmed,
    rejectedPairKeys,
  ]);

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

  // State for linking an unlisted liker directly to an existing employee
  const [linkingLikerRaw, setLinkingLikerRaw] = useState<string | null>(null);
  const [linkingEmployeeId, setLinkingEmployeeId] = useState<string>('');

  // Persist IG & FB inputs independently
  useEffect(() => {
    try {
      if (urlPostIg) localStorage.setItem(LOCAL_STORAGE_KEY_REKAP_URL_IG, urlPostIg);
      else localStorage.removeItem(LOCAL_STORAGE_KEY_REKAP_URL_IG);
    } catch {
      // ignore
    }
  }, [urlPostIg]);

  useEffect(() => {
    try {
      if (rawLikersIg) localStorage.setItem(LOCAL_STORAGE_KEY_REKAP_LIKERS_IG, rawLikersIg);
      else localStorage.removeItem(LOCAL_STORAGE_KEY_REKAP_LIKERS_IG);
    } catch {
      // ignore
    }
  }, [rawLikersIg]);

  useEffect(() => {
    try {
      if (urlPostFb) localStorage.setItem(LOCAL_STORAGE_KEY_REKAP_URL_FB, urlPostFb);
      else localStorage.removeItem(LOCAL_STORAGE_KEY_REKAP_URL_FB);
    } catch {
      // ignore
    }
  }, [urlPostFb]);

  useEffect(() => {
    try {
      if (rawLikersFb) localStorage.setItem(LOCAL_STORAGE_KEY_REKAP_LIKERS_FB, rawLikersFb);
      else localStorage.removeItem(LOCAL_STORAGE_KEY_REKAP_LIKERS_FB);
    } catch {
      // ignore
    }
  }, [rawLikersFb]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_REKAP_AUTO_DATE, String(isAutoDate));
    } catch {
      // ignore
    }
  }, [isAutoDate]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_REKAP_CUSTOM_DATE, customDate);
    } catch {
      // ignore
    }
  }, [customDate]);

  // Breakdown Table Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDivFilter, setSelectedDivFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<
    'ALL' | 'DENDA' | 'LIKED' | 'ORANG_LUAR' | 'EXEMPT'
  >('ALL');
  const [copiedExternalLikers, setCopiedExternalLikers] = useState<boolean>(false);
  const [copiedSingleUser, setCopiedSingleUser] = useState<string | null>(null);
  const [externalLikersViewMode, setExternalLikersViewMode] = useState<'top' | 'bottom'>('top');
  const [isExternalLikersExpanded, setIsExternalLikersExpanded] = useState<boolean>(true);

  // Ref to bypass React security filter for javascript: URLs when dragging to bookmark bar
  const bookmarkletQuickRef = useRef<HTMLAnchorElement | null>(null);
  const activeBookmarkletCode = isFb ? FACEBOOK_BOOKMARKLET_CODE : BOOKMARKLET_CODE;
  const activeConsoleScript = isFb ? FACEBOOK_CONSOLE_SCRIPT : INSTAGRAM_CONSOLE_SCRIPT;

  useEffect(() => {
    if (isExtensionModalOpen && bookmarkletQuickRef.current) {
      bookmarkletQuickRef.current.setAttribute('href', activeBookmarkletCode);
    }
  }, [isExtensionModalOpen, activeBookmarkletCode]);

  // Real-time extracted accounts preview count
  const detectedUsernames = useMemo(() => {
    return extractLikersByPlatform(rawLikersText, activePlatform);
  }, [rawLikersText, activePlatform]);

  // Count how many Normal employees have missing FB accounts (for helpful import nudge)
  const unmappedFbEmployeesCount = useMemo(() => {
    return employees.filter(
      (e) => e.status === 'Normal' && !(e.fbUsername1 && e.fbUsername1.trim()) && !(e.fbUsername2 && e.fbUsername2.trim())
    ).length;
  }, [employees]);

  // Detect mismatched URL vs selected platform
  const urlPlatformMismatch = useMemo<'should_be_fb' | 'should_be_ig' | null>(() => {
    const lower = urlPost.trim().toLowerCase();
    if (!lower) return null;
    if (!isFb && (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com'))) {
      return 'should_be_fb';
    }
    if (isFb && lower.includes('instagram.com')) {
      return 'should_be_ig';
    }
    return null;
  }, [urlPost, isFb]);

  // Handle Process Click
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

    setTimeout(() => {
      setHasProcessedActive(true);
      setIsProcessing(false);
    }, 150);
  };

  // Confirm a similar candidate (temporary for this post OR permanently save into employee's FB/IG account)
  const handleConfirmCandidate = (candidate: SimilarLikerCandidate, savePermanently: boolean) => {
    const empId = candidate.employee.id;
    if (isFb) {
      setManualConfirmedFb((prev) => ({ ...prev, [empId]: candidate.likerRaw }));
    } else {
      setManualConfirmedIg((prev) => ({ ...prev, [empId]: candidate.likerRaw }));
    }

    if (savePermanently && setEmployees) {
      const updated = employees.map((emp) => {
        if (emp.id !== empId) return emp;
        if (isFb) {
          const parsedFb = parseFacebookIdentity(candidate.likerRaw);
          const cleanName = parsedFb.rawDisplay || candidate.likerRaw.trim();
          if (!emp.fbUsername1 || !emp.fbUsername1.trim()) {
            return { ...emp, fbUsername1: cleanName };
          }
          return { ...emp, fbUsername2: cleanName };
        } else {
          const cleanIg = candidate.likerRaw.trim().replace(/^@+/, '');
          if (!emp.username1 || !emp.username1.trim()) {
            return { ...emp, username1: cleanIg };
          }
          return { ...emp, username2: cleanIg };
        }
      });
      setEmployees(updated);
      showToast(
        `Akun "${candidate.likerRaw}" disimpan permanen ke data ${isFb ? 'Facebook' : 'Instagram'} ${candidate.employee.nama} (Total staf tetap ${employees.length}).`,
        'success'
      );
    } else {
      showToast(`${candidate.employee.nama} ditandai SUDAH LIKE melalui "${candidate.likerRaw}".`, 'success');
    }
  };

  // Mark a similar candidate as DIFFERENT PERSON ("Beda Orang")
  const handleRejectCandidate = (candidate: SimilarLikerCandidate) => {
    setRejectedPairKeys((prev) => (prev.includes(candidate.id) ? prev : [...prev, candidate.id]));
    showToast(
      `"${candidate.likerRaw}" ditandai BEDA ORANG dengan ${candidate.employee.nama} dan tetap dipisahkan.`,
      'info'
    );
  };

  // Undo manual confirmation on an employee row
  const handleUndoManualConfirm = (employeeId: string) => {
    if (isFb) {
      setManualConfirmedFb((prev) => {
        const next = { ...prev };
        delete next[employeeId];
        return next;
      });
    } else {
      setManualConfirmedIg((prev) => {
        const next = { ...prev };
        delete next[employeeId];
        return next;
      });
    }
  };

  // Link an arbitrary unlisted liker to an existing employee
  const handleAssignUnlistedToEmployee = (likerRaw: string, empId: string, savePermanently: boolean) => {
    if (!empId) return;
    const targetEmp = employees.find((e) => e.id === empId);
    if (!targetEmp) return;

    if (isFb) {
      setManualConfirmedFb((prev) => ({ ...prev, [empId]: likerRaw }));
    } else {
      setManualConfirmedIg((prev) => ({ ...prev, [empId]: likerRaw }));
    }

    if (savePermanently && setEmployees) {
      const updated = employees.map((emp) => {
        if (emp.id !== empId) return emp;
        if (isFb) {
          const parsedFb = parseFacebookIdentity(likerRaw);
          const cleanName = parsedFb.rawDisplay || likerRaw.trim();
          if (!emp.fbUsername1 || !emp.fbUsername1.trim()) {
            return { ...emp, fbUsername1: cleanName };
          }
          return { ...emp, fbUsername2: cleanName };
        } else {
          const cleanIg = likerRaw.trim().replace(/^@+/, '');
          if (!emp.username1 || !emp.username1.trim()) {
            return { ...emp, username1: cleanIg };
          }
          return { ...emp, username2: cleanIg };
        }
      });
      setEmployees(updated);
      showToast(
        `Akun "${likerRaw}" berhasil dihubungkan & disimpan ke profil ${isFb ? 'FB' : 'IG'} ${targetEmp.nama}!`,
        'success'
      );
    } else {
      showToast(`Akun "${likerRaw}" ditandai sebagai like milik ${targetEmp.nama}.`, 'success');
    }

    setLinkingLikerRaw(null);
    setLinkingEmployeeId('');
  };

  // Copy WA text to clipboard
  const handleCopy = () => {
    if (!result?.waTextOutput) return;
    navigator.clipboard.writeText(result.waTextOutput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // 1-Click Copy Script Console (IG or FB depending on active mode)
  const handleCopyScript = () => {
    navigator.clipboard.writeText(activeConsoleScript).then(() => {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
    });
  };

  // Fill sample testing data (Platform-aware: IG or FB with realistic similarity & false-positive test cases)
  const handleFillSample = () => {
    if (isFb) {
      setUrlPostFb('https://www.facebook.com/share/p/19XkLm2PqR/');
      const sampleFbLikers = [
        'Surya Rahmad',
        'Binti Andini',
        'Megawati Sun',
        'Christin Df',
        'Tiara Indriani',
        'Fitria Ran',
        'Desy Aldita',
        'Oktafian Shinta',
        'Fitri Aay',
        'Aisti Alqur',
        'Anggita Restiana',
        'Wahyu Saputro',
        'Bagas Billy',
        'Gifani',
        'Adi Diecast',
        'Pak Poh',
        'Nicky Athalla',
        'Cindy Akbar',
        'Fabyan',
        'Arik Priyanto',
        'Eko Tarmidianto',
        'Aziz Fikri',
        'Fani Kurniawan',
        'Nanda Kipz',
        'Qodriyah Nur',
        'Aditya Reich',
        'Riskhy',
        'Munir Murtado',
        'Rizki Jahe',
        'Erland',
        // Tricky similar-but-different or slight-typo accounts to showcase similarity & false-positive protection:
        'Bayu Setiawan', // Employee BAYU is "Bayu Sukma" -> Nama depan mirip tapi marga beda!
        'Putri Maharani', // Employee PUTRI FL is "Putri Rahayu" -> Nama depan sama tapi beda orang!
        'Dimas Prayogaa', // Employee DIMAS OPPO is "Dimas Prayoga" -> Mirip 96% (huruf ganda)
        // Unlisted public / external accounts:
        'Rina Kusuma Wardhani',
        'Hendra Wijaya Nganjuk',
      ].join('\n');

      setRawLikersFb(sampleFbLikers);
      setManualConfirmedFb({});
      const effectiveDate = isAutoDate ? formatDateIndo(new Date()) : customDate;
      if (isAutoDate) setCustomDate(effectiveDate);
      setHasProcessedFb(true);
    } else {
      setUrlPostIg('https://www.instagram.com/p/DAxKj2-z9Yw/');
      const sampleIgLikers = [
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
        'dimas_prayoga99',
        'fashion_lover_id',
        'retail_customer_99',
      ].join('\n');

      setRawLikersIg(sampleIgLikers);
      setManualConfirmedIg({});
      const effectiveDate = isAutoDate ? formatDateIndo(new Date()) : customDate;
      if (isAutoDate) setCustomDate(effectiveDate);
      setHasProcessedIg(true);
    }
  };

  // Fill sample where EVERY Normal employee has liked (Testing "LIKE DONE")
  const handleFillAllLikedSample = () => {
    if (isFb) {
      setUrlPostFb('https://www.facebook.com/share/p/19XkLm2PqR/');
      const allNormalFb = employees
        .filter((e) => e.status === 'Normal')
        .map((e) => e.fbUsername1 || e.fbUsername2 || e.nama)
        .filter(Boolean);

      const sampleFb = [
        ...allNormalFb,
        'Pelanggan Setia Kertosono',
        'Budi Santoso Kediri',
      ].join('\n');

      setRawLikersFb(sampleFb);
      setManualConfirmedFb({});
      const effectiveDate = isAutoDate ? formatDateIndo(new Date()) : customDate;
      if (isAutoDate) setCustomDate(effectiveDate);
      setHasProcessedFb(true);
    } else {
      setUrlPostIg('https://www.instagram.com/p/DAxKj2-z9Yw/');
      const allNormalUsernames = employees
        .filter((e) => e.status === 'Normal')
        .map((e) => e.username1)
        .filter(Boolean);

      const sampleLikers = [
        ...allNormalUsernames,
        'customer_fashion_id',
        'surabaya_mall_lovers',
        'retail_lovers_indo',
      ].join('\n');

      setRawLikersIg(sampleLikers);
      setManualConfirmedIg({});
      const effectiveDate = isAutoDate ? formatDateIndo(new Date()) : customDate;
      if (isAutoDate) setCustomDate(effectiveDate);
      setHasProcessedIg(true);
    }
  };

  // 1-Click Auto Clear for the currently active platform
  const handleAutoClear = () => {
    if (isFb) {
      setUrlPostFb('');
      setRawLikersFb('');
      setManualConfirmedFb({});
      setHasProcessedFb(false);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY_REKAP_URL_FB);
        localStorage.removeItem(LOCAL_STORAGE_KEY_REKAP_LIKERS_FB);
      } catch {
        // ignore
      }
    } else {
      setUrlPostIg('');
      setRawLikersIg('');
      setManualConfirmedIg({});
      setHasProcessedIg(false);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY_REKAP_URL_IG);
        localStorage.removeItem(LOCAL_STORAGE_KEY_REKAP_LIKERS_IG);
      } catch {
        // ignore
      }
    }
    setLinkingLikerRaw(null);
    setClearFeedback(true);
    setTimeout(() => {
      setClearFeedback(false);
    }, 2800);
  };

  // Paste from clipboard directly (zero window.alert)
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setRawLikersText(text);
          const effectiveDate = isAutoDate ? formatDateIndo(new Date()) : customDate;
          if (isAutoDate) setCustomDate(effectiveDate);
          setHasProcessedActive(true);
          showToast(
            `Berhasil menempel & memproses daftar likers ${isFb ? 'Facebook' : 'Instagram'} dari clipboard.`,
            'success'
          );
        } else {
          showToast(
            `Clipboard masih kosong. Salin daftar likers menggunakan Bookmarklet / Ekstensi ${isFb ? 'Facebook' : 'Instagram'} terlebih dahulu.`,
            'warning'
          );
        }
      } else {
        showToast(
          'Browser meminta izin baca clipboard. Klik kotak teks lalu tekan Ctrl+V secara manual.',
          'warning'
        );
      }
    } catch {
      showToast(
        'Izin baca clipboard otomatis diblokir browser. Klik pada kotak teks lalu tekan Ctrl+V.',
        'warning'
      );
    }
  };

  // Quick Copy Bookmarklet (Platform-aware)
  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(activeBookmarkletCode).then(() => {
      setCopiedBookmarklet(true);
      setTimeout(() => setCopiedBookmarklet(false), 2000);
    });
  };

  // Download Universal IG+FB Extension ZIP
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

  // Format display & profile link for an unrecognized liker
  const formatLikerDisplay = (raw: string): { label: string; slugBadge?: string; profileUrl: string } => {
    if (!isFb) {
      const clean = raw.replace(/^@+/, '');
      return {
        label: `@${clean}`,
        profileUrl: `https://www.instagram.com/${clean}/`,
      };
    }
    const parsed = parseFacebookIdentity(raw);
    const display = parsed.rawDisplay || raw;
    let profileUrl = `https://www.facebook.com/search/top/?q=${encodeURIComponent(display)}`;
    if (parsed.slug) {
      if (parsed.slug.startsWith('id:')) {
        profileUrl = `https://www.facebook.com/profile.php?id=${parsed.slug.slice(3)}`;
      } else {
        profileUrl = `https://www.facebook.com/${parsed.slug}`;
      }
    }
    return {
      label: display,
      slugBadge: parsed.slug || undefined,
      profileUrl,
    };
  };

  // Copy all external likers list to clipboard
  const handleCopyExternalLikers = (format: 'newline' | 'comma' = 'newline') => {
    if (!result?.unrecognizedLikers?.length) return;
    const formattedList = result.unrecognizedLikers.map((u) =>
      isFb ? parseFacebookIdentity(u).rawDisplay || u : `@${u}`
    );
    const text = format === 'newline' ? formattedList.join('\n') : formattedList.join(', ');
    navigator.clipboard.writeText(text).then(() => {
      setCopiedExternalLikers(true);
      setTimeout(() => setCopiedExternalLikers(false), 2000);
    });
  };

  // Copy single username / FB name
  const handleCopySingleUser = (rawUser: string) => {
    const textToCopy = isFb ? parseFacebookIdentity(rawUser).rawDisplay || rawUser : `@${rawUser}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedSingleUser(rawUser);
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
    if (selectedStatusFilter === 'ORANG_LUAR') return [];

    const q = searchQuery.toLowerCase();
    return result.allResults.filter((item) => {
      const matchesSearch =
        !q ||
        item.employee.nama.toLowerCase().includes(q) ||
        item.employee.username1.toLowerCase().includes(q) ||
        (item.employee.username2 && item.employee.username2.toLowerCase().includes(q)) ||
        (item.employee.fbUsername1 && item.employee.fbUsername1.toLowerCase().includes(q)) ||
        (item.employee.fbUsername2 && item.employee.fbUsername2.toLowerCase().includes(q)) ||
        item.employee.divisi.toLowerCase().includes(q);

      const matchesDiv = selectedDivFilter === 'ALL' || item.employee.divisi === selectedDivFilter;

      let matchesStatus = true;
      if (selectedStatusFilter === 'DENDA') matchesStatus = item.isPenalized;
      if (selectedStatusFilter === 'LIKED') matchesStatus = item.hasLiked && !item.isExempt;
      if (selectedStatusFilter === 'EXEMPT') matchesStatus = item.isExempt;

      return matchesSearch && matchesDiv && matchesStatus;
    });
  }, [result, searchQuery, selectedDivFilter, selectedStatusFilter]);

  // Employees currently penalized (useful dropdown options when linking an unlisted account)
  const unlikedEmployeesForLinking = useMemo(() => {
    if (!result) return employees;
    const unliked = result.allResults.filter((r) => !r.hasLiked).map((r) => r.employee);
    return unliked.length > 0 ? unliked : employees;
  }, [result, employees]);

  // Unique divisions for filter dropdown
  const divisionList = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => set.add(e.divisi));
    return Array.from(set).sort(compareDivisions);
  }, [employees]);

  // Split similarCandidates counts by risk level
  const highRiskCount = useMemo(
    () => result?.similarCandidates.filter((c) => c.conflictLevel === 'high_risk_different').length || 0,
    [result]
  );

  return (
    <div className="space-y-5">
      {/* ========================================================= */}
      {/* UNIFIED PLATFORM SWITCHER ("SAKLAR PEMBEDA IG vs FB")     */}
      {/* ========================================================= */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Left: Segmented Platform Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div
              role="group"
              aria-label="Saklar Pembeda Mode Sosial Media"
              className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/90 shadow-inner self-start"
            >
              <button
                type="button"
                onClick={() => handleSwitchPlatform('instagram')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  !isFb
                    ? 'bg-gradient-to-r from-fuchsia-600 via-pink-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Instagram className="w-4 h-4 shrink-0" />
                <span>Mode Instagram</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    !isFb ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  @username
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchPlatform('facebook')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isFb
                    ? 'bg-[#1877F2] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Facebook className="w-4 h-4 shrink-0" />
                <span>Mode Facebook</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isFb ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  Nama FB
                </span>
              </button>
            </div>

            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {isFb ? 'Rekap Like / Tanggapan Facebook' : 'Rekap Like Postingan Instagram'}
                </span>
                <span className="text-[11px] text-slate-500">
                  &bull; Total Staf Tetap: <strong className="text-slate-800">{employees.length} Karyawan</strong> (1 Staf = Akun IG &amp; FB)
                </span>
              </div>
              {!compactMode && (
                <p className="text-[11px] text-slate-500">
                  {isFb
                    ? 'Mencocokkan daftar Tanggapan FB ke kolom Akun Facebook karyawan + deteksi nama mirip tapi beda orang.'
                    : 'Mencocokkan daftar Likes IG ke kolom @username Instagram karyawan + pelacakan akun luar.'}
                </p>
              )}
            </div>
          </div>

          {/* Right Quick Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {isFb && (onOpenFbImport || onOpenEmployeeManager) && (
              <button
                type="button"
                onClick={onOpenFbImport || onOpenEmployeeManager}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-[#1877F2] border border-blue-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Import khusus daftar nama/username Facebook ke data karyawan tanpa mengubah jumlah karyawan"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Akun FB</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsScreenshotModalOpen(true)}
              className={`px-3.5 py-2 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                isFb
                  ? 'bg-[#1877F2] hover:bg-blue-700'
                  : 'bg-gradient-to-r from-fuchsia-600 via-rose-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700'
              }`}
              title={`Buat screenshot panjang otomatis bukti like ${isFb ? 'Facebook' : 'Instagram'}`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Screenshot Panjang {isFb ? 'FB' : 'IG'}</span>
            </button>

            {onOpenSosmedReport && (
              <button
                type="button"
                onClick={onOpenSosmedReport}
                className="px-3 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Buka menu Recap Konten Harian"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Recap Konten</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenConsoleGuide}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isFb ? 'text-[#1877F2]' : 'text-indigo-600'}`} />
              <span>Script {isFb ? 'FB' : 'IG'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenEmployeeManager}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Data Karyawan ({employees.length})</span>
            </button>
          </div>
        </div>

        {/* Inline Toast Feedback (replaces window.alert) */}
        {toastNotice && (
          <div
            className={`px-3.5 py-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between gap-2 ${
              toastNotice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : toastNotice.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {toastNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>{toastNotice.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastNotice(null)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Helpful Banner if in Facebook Mode and some employees don't have FB accounts imported yet */}
        {isFb && unmappedFbEmployeesCount > 0 && (
          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-start sm:items-center gap-2.5 text-slate-800">
              <Facebook className="w-4 h-4 text-[#1877F2] shrink-0 mt-0.5 sm:mt-0" />
              <span>
                Terdapat <strong>{unmappedFbEmployeesCount} staf aktif</strong> yang kolom <strong>Username/Nama Facebook</strong>-nya masih kosong. Anda tetap bisa rekap sekarang (sistem mengecek kemiripan nama otomatis) atau import daftar akun FB sekaligus tanpa mengubah jumlah karyawan.
              </span>
            </div>
            {(onOpenFbImport || onOpenEmployeeManager) && (
              <button
                type="button"
                onClick={onOpenFbImport || onOpenEmployeeManager}
                className="px-3 py-1.5 bg-[#1877F2] hover:bg-blue-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Khusus Username FB</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Grid Layout: Form Input (Left) & Output WhatsApp (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================= */}
        {/* LEFT COLUMN: INPUT FORM & DATABASE STATUS                 */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Input Card */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isFb ? 'bg-blue-50 text-[#1877F2]' : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  {isFb ? <Facebook className="w-4 h-4" /> : <Instagram className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-sm">
                    {isFb ? 'Input Monitoring Postingan Facebook' : 'Input Monitoring Postingan Instagram'}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {isFb
                      ? 'Tempel link postingan FB & daftar nama akun yang memberi Like / Tanggapan'
                      : 'Masukkan tautan post Instagram dan tempel daftar @username likers'}
                  </p>
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
                <Calendar className={`w-3.5 h-3.5 ${isFb ? 'text-[#1877F2]' : 'text-indigo-600'}`} />
                <span className="text-slate-500">Tanggal Rekap:</span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-xs border ${
                    isAutoDate
                      ? isFb
                        ? 'bg-blue-50 text-[#1877F2] border-blue-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
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
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
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

            {/* Step 1: URL Postingan IG / FB */}
            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                <label
                  className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
                  htmlFor="url-post-input"
                >
                  <span
                    className={`w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold ${
                      isFb ? 'bg-[#1877F2]' : 'bg-indigo-600'
                    }`}
                  >
                    1
                  </span>
                  <span>{isFb ? 'Facebook Post / Reel URL' : 'Instagram Post URL'}</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExtensionModalOpen(true)}
                    className={`text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 font-bold transition-colors cursor-pointer border ${
                      isFb
                        ? 'text-[#1877F2] bg-blue-50 hover:bg-blue-100 border-blue-200'
                        : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                    }`}
                    title={`Buka pop up mini ekstrak otomatis ${isFb ? 'Facebook' : 'Instagram'} (Bookmarklet, Ekstensi v2.0, Script Console)`}
                  >
                    <Chrome className="w-3 h-3" />
                    <span>⚡ Ekstrak Otomatis {isFb ? 'FB' : 'IG'} (Bookmarklet / Ekstensi)</span>
                  </button>

                  {urlPost && (urlPost.includes('instagram.com') || urlPost.includes('facebook.com') || urlPost.includes('fb.')) && (
                    <a
                      href={urlPost}
                      target="_blank"
                      rel="noreferrer"
                      className={`text-[11px] flex items-center gap-1 font-semibold normal-case ${
                        isFb ? 'text-[#1877F2] hover:text-blue-800' : 'text-indigo-600 hover:text-indigo-800'
                      }`}
                    >
                      <span>Buka Post</span>
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
                  placeholder={
                    isFb
                      ? 'https://www.facebook.com/share/p/... atau https://www.facebook.com/reel/...'
                      : 'https://www.instagram.com/p/...'
                  }
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
                    className={`text-[10px] font-bold text-white px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                      isFb ? 'bg-[#1877F2] hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                    title={`Buka pop up mini 1-klik ekstrak likers ${isFb ? 'Facebook' : 'Instagram'}`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>1-Klik {isFb ? 'FB' : 'IG'}</span>
                  </button>
                </div>
              </div>

              {/* Smart Mismatch Nudge if user pasted FB link in IG mode or vice versa */}
              {urlPlatformMismatch === 'should_be_fb' && (
                <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between gap-2 text-xs text-blue-900">
                  <span>Tautan di atas terdeteksi sebagai link <strong>Facebook</strong>. Pindah ke Mode Facebook?</span>
                  <button
                    type="button"
                    onClick={() => {
                      const movedUrl = urlPostIg;
                      setUrlPostFb(movedUrl);
                      setUrlPostIg('');
                      handleSwitchPlatform('facebook');
                    }}
                    className="px-2.5 py-1 bg-[#1877F2] text-white rounded-md font-bold text-[11px] cursor-pointer shrink-0"
                  >
                    Pindah ke Mode FB
                  </button>
                </div>
              )}
              {urlPlatformMismatch === 'should_be_ig' && (
                <div className="mt-2 p-2.5 bg-fuchsia-50 border border-fuchsia-200 rounded-lg flex items-center justify-between gap-2 text-xs text-fuchsia-900">
                  <span>Tautan di atas terdeteksi sebagai link <strong>Instagram</strong>. Pindah ke Mode Instagram?</span>
                  <button
                    type="button"
                    onClick={() => {
                      const movedUrl = urlPostFb;
                      setUrlPostIg(movedUrl);
                      setUrlPostFb('');
                      handleSwitchPlatform('instagram');
                    }}
                    className="px-2.5 py-1 bg-indigo-600 text-white rounded-md font-bold text-[11px] cursor-pointer shrink-0"
                  >
                    Pindah ke Mode IG
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Daftar Likers Instagram / Facebook (Textarea) */}
            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <label
                    className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
                    htmlFor="likers-textarea"
                  >
                    <span
                      className={`w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold ${
                        isFb ? 'bg-[#1877F2]' : 'bg-indigo-600'
                      }`}
                    >
                      2
                    </span>
                    <span>{isFb ? 'Daftar Nama / Akun Likers Facebook' : 'Username Likers Instagram'}</span>
                  </label>
                  {detectedUsernames.length > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      {detectedUsernames.length} Akun {isFb ? 'FB' : 'IG'} Terdeteksi
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {(rawLikersText || urlPost) && (
                    <button
                      type="button"
                      onClick={handleAutoClear}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all flex items-center gap-1 cursor-pointer"
                      title={`Hapus link dan daftar likers ${isFb ? 'Facebook' : 'Instagram'} saat ini`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Hapus</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsScreenshotModalOpen(true)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-fuchsia-600" />
                    <span>Screenshot</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-md text-white transition-all flex items-center gap-1 cursor-pointer ${
                      isFb ? 'bg-[#1877F2] hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    <Clipboard className="w-3 h-3" />
                    <span>Tempel Clipboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyBookmarklet}
                    className={`text-[11px] font-bold px-2 py-1 rounded-md border transition-all flex items-center gap-1 cursor-pointer ${
                      copiedBookmarklet
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : isFb
                        ? 'bg-blue-50 text-[#1877F2] border-blue-200 hover:bg-blue-100'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                    title={`Salin kode Bookmarklet khusus ${isFb ? 'Facebook' : 'Instagram'}`}
                  >
                    <Bookmark className="w-3 h-3" />
                    <span>
                      {copiedBookmarklet
                        ? `Bookmarklet ${isFb ? 'FB' : 'IG'} Tersalin!`
                        : `Bookmarklet ${isFb ? 'FB' : 'IG'}`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className={`text-[11px] font-bold px-2 py-1 rounded-md border transition-all flex items-center gap-1 cursor-pointer ${
                      copiedScript
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                    title={`Salin script console F12 khusus ${isFb ? 'Facebook' : 'Instagram'}`}
                  >
                    {copiedScript ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Script Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Terminal className="w-3 h-3 text-slate-600" />
                        <span>Script F12 {isFb ? 'FB' : 'IG'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleFillSample}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded-md border border-slate-200 cursor-pointer flex items-center gap-1"
                    title={
                      isFb
                        ? 'Simulasi data Facebook lengkap dengan contoh nama mirip tapi beda orang'
                        : 'Simulasi jika ada karyawan yang belum like IG'
                    }
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{isFb ? 'Demo FB + Nama Mirip' : 'Demo Denda'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFillAllLikedSample}
                    className="text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-md border border-emerald-200 cursor-pointer flex items-center gap-1"
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
                placeholder={
                  isFb
                    ? 'Tempel (Ctrl + V) daftar nama akun Facebook hasil Bookmarklet FB / Ekstensi v2.0 / Console F12 di sini (1 baris 1 nama, contoh: Binti Andini)...'
                    : 'Tempel (Ctrl + V) hasil copy dari Bookmarklet IG atau Console F12 Instagram di sini...'
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm resize-none font-mono transition-all text-slate-800 custom-scrollbar leading-relaxed"
              />

              {clearFeedback && (
                <div className="mt-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Link postingan dan daftar likers {isFb ? 'Facebook' : 'Instagram'} berhasil dibersihkan!
                  </span>
                </div>
              )}

              {/* Workflow Callout when Empty */}
              {!rawLikersText && !compactMode && (
                <div
                  className={`mt-2.5 p-3.5 rounded-xl text-xs space-y-2 border ${
                    isFb ? 'bg-blue-50/60 border-blue-200/80' : 'bg-indigo-50/70 border-indigo-100'
                  }`}
                >
                  <div className="flex items-start gap-2 text-slate-900">
                    <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isFb ? 'text-[#1877F2]' : 'text-indigo-600'}`} />
                    <div className="space-y-1">
                      <p className="font-bold">
                        {isFb
                          ? 'Cara Mengambil Daftar Like / Tanggapan Facebook (Otomatis):'
                          : 'Cara Cepat Mengambil Likers Instagram (Hanya 3 Detik):'}
                      </p>
                      {isFb ? (
                        <ol className="list-decimal pl-4 space-y-1 text-slate-700 text-[11px]">
                          <li>
                            Buka postingan di <strong>Facebook Web</strong> &gt; Klik ikon jumlah <strong>👍❤️ Tanggapan / Suka</strong> agar jendela daftar orang yang menanggapi terbuka.
                          </li>
                          <li>
                            Gunakan <strong>Bookmarklet Khusus FB</strong> (atau <strong>Ekstensi Chrome v2.0 Universal IG+FB</strong>). Bookmarklet IG lama tidak bisa dipakai di FB karena struktur dialog FB berbeda.
                          </li>
                          <li>
                            Daftar nama lengkap + username profil FB otomatis tersalin &amp; bersih dari teks <em>&quot;Tambah Teman&quot;</em>. Tempel (<strong>Ctrl + V</strong>) di kotak atas!
                          </li>
                        </ol>
                      ) : (
                        <ol className="list-decimal pl-4 space-y-1 text-slate-700 text-[11px]">
                          <li>
                            Buka post di IG Web &gt; Klik jumlah <strong>&quot;Likes/Suka&quot;</strong> agar modal daftar orang yang like muncul.
                          </li>
                          <li>
                            Klik <strong>Bookmarklet IG</strong> di browser atau gunakan <strong>Ekstensi Chrome v2.0</strong>.
                          </li>
                          <li>
                            Daftar @username otomatis tersalin. Kembali ke sini lalu tekan <strong>Ctrl + V</strong>!
                          </li>
                        </ol>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-500">
                      Input Mode IG &amp; Mode FB disimpan terpisah sehingga aman saat saklar digeser.
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsExtensionModalOpen(true)}
                      className={`font-bold hover:underline cursor-pointer flex items-center gap-1 ${
                        isFb ? 'text-[#1877F2]' : 'text-indigo-700'
                      }`}
                    >
                      <span>Pasang Bookmarklet / Ekstensi {isFb ? 'FB' : 'IG'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
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
                  className={`flex-1 font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                    isProcessing
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : isFb
                      ? 'bg-[#1877F2] hover:bg-blue-700 text-white active:scale-[0.99]'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.99]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memproses Data Likers {isFb ? 'Facebook' : 'Instagram'}...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Langkah 3: Proses &amp; Buat Rekap WA ({isFb ? 'Mode Facebook' : 'Mode Instagram'})</span>
                    </>
                  )}
                </button>

                {(rawLikersText || urlPost) && (
                  <button
                    type="button"
                    onClick={handleAutoClear}
                    className="sm:w-auto px-4 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span className="whitespace-nowrap">Hapus Input</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Database Quick View Table (Shows BOTH IG and FB for the same employee rows) */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Ringkasan Database Karyawan (1 Staf = Akun IG &amp; FB)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Total jumlah staf tetap sama ({employees.length} orang), masing-masing memiliki kolom IG &amp; FB terpisah
                </p>
              </div>
              <span className="text-[10px] bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-bold uppercase tracking-wider">
                {employees.length} Total Staff
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="pb-2 font-semibold uppercase text-[10px]">Nama</th>
                    <th className="pb-2 font-semibold uppercase text-[10px]">Divisi</th>
                    <th className="pb-2 font-semibold uppercase text-[10px]">Instagram</th>
                    <th className="pb-2 font-semibold uppercase text-[10px]">Facebook</th>
                    <th className="pb-2 font-semibold text-right uppercase text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {employees.slice(0, 5).map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50">
                      <td className="py-2 font-semibold text-slate-900">{emp.nama}</td>
                      <td className="py-2 text-slate-600">{emp.divisi}</td>
                      <td
                        className={`py-2 font-mono text-[11px] ${
                          !isFb ? 'text-indigo-700 font-semibold' : 'text-slate-500'
                        }`}
                      >
                        {emp.username1 ? `@${emp.username1}` : '-'}
                      </td>
                      <td
                        className={`py-2 text-[11px] ${
                          isFb ? 'text-[#1877F2] font-semibold' : 'text-slate-600'
                        }`}
                      >
                        {emp.fbUsername1 || <span className="text-amber-600 italic">Belum diisi</span>}
                      </td>
                      <td className="py-2 text-right">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            emp.status === 'Normal'
                              ? 'text-emerald-700 bg-emerald-50'
                              : 'text-orange-700 bg-orange-50'
                          }`}
                        >
                          {emp.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>Menampilkan 5 dari {employees.length} staf terdaftar</span>
              <div className="flex items-center gap-3">
                {(onOpenFbImport || onOpenEmployeeManager) && (
                  <button
                    type="button"
                    onClick={onOpenFbImport || onOpenEmployeeManager}
                    className="text-[#1877F2] hover:underline font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Facebook className="w-3 h-3" />
                    <span>Import Khusus Akun FB</span>
                  </button>
                )}
                <span className="text-slate-300">|</span>
                <button
                  type="button"
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
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                    isFb ? 'bg-[#1877F2]' : 'bg-white/10'
                  }`}
                >
                  {isFb ? <Facebook className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">WhatsApp Output Preview</h3>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        isFb ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30' : 'bg-fuchsia-500/25 text-fuchsia-200 border border-fuchsia-400/30'
                      }`}
                    >
                      {isFb ? 'FACEBOOK' : 'INSTAGRAM'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Siap disalin atau diteruskan ke grup</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {(result || urlPost || rawLikersText) && (
                  <button
                    type="button"
                    onClick={handleAutoClear}
                    className="px-2.5 py-1.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40"
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
                      ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                      : 'bg-white/5 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <QrCode className="w-3 h-3 text-amber-400" />
                  <span>BARCODE</span>
                </button>

                <button
                  type="button"
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
                  <span
                    className={`text-sm font-bold ${
                      result.totalDenda === 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {result.totalDenda}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-amber-400 font-bold block uppercase">Cuti</span>
                  <span className="text-sm font-bold text-amber-400">{result.totalExempt}</span>
                </div>
                <div className="border-l border-slate-700 pl-1">
                  <span
                    className="text-[9px] text-cyan-400 font-bold block uppercase"
                    title="Akun yang like tapi tidak tercantum di data karyawan"
                  >
                    Non-Data
                  </span>
                  <span className="text-sm font-bold text-cyan-300 font-mono">
                    {result.unrecognizedLikers?.length || 0}
                  </span>
                </div>
              </div>
            )}

            {/* Quick Notice inside terminal panel if similarity candidates need verification */}
            {result && result.similarCandidates.length > 0 && (
              <div className="bg-amber-950/60 border border-amber-500/40 rounded-lg p-2.5 text-[11px] text-amber-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Terdeteksi <strong>{result.similarCandidates.length} nama mirip</strong>
                    {highRiskCount > 0 ? ` (${highRiskCount} rawan beda orang)` : ''}. Cek panel verifikasi di bawah!
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
                    Output disetel otomatis menjadi <b>&quot;LIKE DONE&quot;</b> karena 0 denda.
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
                  {isFb ? `DATA LIKE FACEBOOK [DD/MM/YYYY] ${storeCode}` : `DATA LIKE [DD/MM/YYYY] ${storeCode}`}
                  {'\n'}
                  {isFb ? 'https://www.facebook.com/share/p/...' : 'https://www.instagram.com/p/...'}
                  {'\n\n'}
                  #ADMIN KTSN{'\n'}
                  • Nama Karyawan{'\n\n'}
                  #FL HP KTSN{'\n'}
                  • (Semua Like){'\n\n'}
                  Total Denda: 1 Personel
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
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
                }`}
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
                    ? isFb
                      ? 'bg-[#1877F2] hover:bg-blue-700 text-white'
                      : 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white'
                    : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Screenshot</span>
              </button>
            </div>

            {result && (
              <div className="bg-slate-800/90 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">WA di Laptop Susah Buka?</div>
                    <p className="text-[11px] text-slate-300">
                      Scan barcode &rarr; teks rekap langsung pindah ke WhatsApp HP Anda.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBarcodeModalOpen(true)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan di HP</span>
                </button>
              </div>
            )}
          </div>

          {/* Setup Instruction & Deployment Card */}
          {!compactMode && (
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Alat Ekstraktor IG &amp; FB v2.0</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsExtensionModalOpen(true)}
                  className="text-[11px] font-bold text-indigo-700 bg-white hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Chrome className="w-3.5 h-3.5" />
                  <span>Buka Ekstraktor &rarr;</span>
                </button>
              </div>
              <p className="text-xs text-indigo-950 leading-relaxed">
                Gunakan <b>Ekstensi Chrome Universal v2.0</b> (1 ekstensi mendukung saklar Instagram &amp; Facebook sekaligus) atau pasang Bookmarklet terpisah untuk IG &amp; FB.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setIsNetlifyGuideOpen(true)}
                  className="p-2.5 bg-white border border-teal-200 rounded-lg hover:border-teal-400 text-left transition-all cursor-pointer space-y-0.5"
                >
                  <div className="font-bold text-teal-900 flex items-center gap-1 text-[11px]">
                    <Rocket className="w-3.5 h-3.5 text-teal-600" />
                    <span>Deploy ke Netlify</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Web App siap online gratis</p>
                </button>

                <button
                  type="button"
                  onClick={onOpenConsoleGuide}
                  className="p-2.5 bg-white border border-indigo-200 rounded-lg hover:border-indigo-400 text-left transition-all cursor-pointer space-y-0.5"
                >
                  <div className="font-bold text-indigo-900 flex items-center gap-1 text-[11px]">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Script &amp; Apps Script</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Script Console IG/FB &amp; Sheets</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SMART SIMILARITY & FALSE-POSITIVE PROTECTION PANEL         */}
      {/* ("kadang ada nama yang mirip tetap beda")                  */}
      {/* ========================================================= */}
      {result && (result.similarCandidates.length > 0 || rejectedPairKeys.length > 0) && (
        <div className="bg-white rounded-xl p-5 border border-amber-300 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Deteksi Kemiripan Nama &amp; Proteksi Nama Mirip Tapi Beda Orang
                  </h3>
                  {result.similarCandidates.length > 0 && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      {result.similarCandidates.length} Perlu Konfirmasi
                    </span>
                  )}
                  {highRiskCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      ⚠️ {highRiskCount} Awas Beda Orang!
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Sistem sengaja <strong>tidak langsung menganggap sudah like</strong> pada akun yang namanya mirip sebagian agar tidak salah rekap jika ada orang luar yang namanya kebetulan mirip karyawan. Konfirmasi cukup 1 klik:
                </p>
              </div>
            </div>

            {rejectedPairKeys.length > 0 && (
              <button
                type="button"
                onClick={() => setRejectedPairKeys([])}
                className="text-[11px] font-semibold text-slate-600 hover:text-indigo-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 cursor-pointer self-start md:self-auto shrink-0"
                title="Tampilkan kembali pasangan nama mirip yang sebelumnya pernah ditandai Beda Orang"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Daftar &quot;Beda Orang&quot; ({rejectedPairKeys.length})</span>
              </button>
            )}
          </div>

          {result.similarCandidates.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {result.similarCandidates.map((cand) => {
                const isHighRisk = cand.conflictLevel === 'high_risk_different';
                const isLikelySame = cand.conflictLevel === 'likely_same';

                return (
                  <div
                    key={cand.id}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 ${
                      isHighRisk
                        ? 'bg-rose-50/50 border-rose-200'
                        : isLikelySame
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-amber-50/40 border-amber-200'
                    }`}
                  >
                    <div className="space-y-2">
                      {/* Top Risk Badge + Score */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            isHighRisk
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : isLikelySame
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          {isHighRisk
                            ? '⚠️ AWAS BEDA ORANG (Nama Mirip Tapi Beda)'
                            : isLikelySame
                            ? '✨ Kemungkinan Besar Akun Karyawan Sama'
                            : '🔍 Nama Mirip Sebagian — Cek Manual'}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-600">
                          Kemiripan: {cand.similarityScore}%
                        </span>
                      </div>

                      {/* Side-by-side Comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-slate-200/80 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Akun yang Like ({isFb ? 'FB' : 'IG'}):
                          </span>
                          <span className="font-bold text-slate-900 break-all">
                            {isFb ? parseFacebookIdentity(cand.likerRaw).rawDisplay || cand.likerRaw : `@${cand.likerRaw}`}
                          </span>
                        </div>
                        <div className="sm:border-l sm:border-slate-100 sm:pl-2.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Karyawan Belum Like ({cand.employee.divisi}):
                          </span>
                          <span className="font-bold text-indigo-900">{cand.employee.nama}</span>
                          <span className="block text-[10px] text-slate-500">
                            Data pembanding: <strong>{cand.comparedAgainst}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Reason / Warning */}
                      <p
                        className={`text-[11px] leading-relaxed ${
                          isHighRisk ? 'text-rose-800 font-medium' : 'text-slate-600'
                        }`}
                      >
                        {cand.reason}
                        {cand.hasEmployeeCollision && cand.conflictingEmployeeNames?.length ? (
                          <span className="block mt-0.5 font-semibold text-rose-700">
                            ⚠️ Nama depan ini juga dimiliki beberapa staf: {cand.conflictingEmployeeNames.join(', ')}.
                          </span>
                        ) : null}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => handleConfirmCandidate(cand, false)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Anggap orang yang sama untuk postingan ini saja"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Benar Sama (Tandai Like)</span>
                      </button>

                      {setEmployees && (
                        <button
                          type="button"
                          onClick={() => handleConfirmCandidate(cand, true)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title={`Simpan permanen sebagai akun ${isFb ? 'Facebook' : 'Instagram'} milik ${cand.employee.nama}`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Sama &amp; Simpan ke Akun {isFb ? 'FB' : 'IG'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRejectCandidate(cand)}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ml-auto"
                        title="Beda orang! Jangan samakan (karyawan tetap kena denda & akun tetap di daftar non-data)"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Beda Orang (Pisahkan)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Semua kandidat nama mirip sudah dikonfirmasi atau dipisahkan sebagai &quot;Beda Orang&quot;.
            </p>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* DETAILED EMPLOYEE BREAKDOWN TABLE & UNLISTED ACCOUNTS      */}
      {/* ========================================================= */}
      {result && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Rincian Status Karyawan ({isFb ? 'Mode Facebook' : 'Mode Instagram'}) &amp; Akun Tidak Tercantum
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {filteredDetailResults.length} dari {result.allResults.length} Karyawan
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedStatusFilter(selectedStatusFilter === 'ORANG_LUAR' ? 'ALL' : 'ORANG_LUAR')
                  }
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer border ${
                    selectedStatusFilter === 'ORANG_LUAR'
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>{result.unrecognizedLikers?.length || 0} Tidak Tercantum di Data</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar staf tetap {result.totalKaryawan} karyawan, ditambah akun yang ikut like tapi belum/tidak tercantum di database.
              </p>
            </div>

            {/* Filters & Position Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Cari nama / akun ${isFb ? 'FB' : 'IG'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 w-36 sm:w-44"
                />
              </div>

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

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700 font-medium cursor-pointer"
              >
                <option value="ALL">Semua Status (Karyawan + Non-Data)</option>
                <option value="DENDA">❌ Kena Denda ({result.totalDenda})</option>
                <option value="LIKED">✅ Sudah Like ({result.totalSudahLike})</option>
                <option value="ORANG_LUAR">
                  🌐 Tidak Tercantum di Data ({result.unrecognizedLikers?.length || 0})
                </option>
                <option value="EXEMPT">🏖️ Cuti / Off ({result.totalExempt})</option>
              </select>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => setExternalLikersViewMode('top')}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    externalLikersViewMode === 'top' ? 'bg-white text-indigo-600 shadow-2xs' : 'hover:text-slate-900'
                  }`}
                >
                  Non-Data: Atas
                </button>
                <button
                  type="button"
                  onClick={() => setExternalLikersViewMode('bottom')}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    externalLikersViewMode === 'bottom' ? 'bg-white text-indigo-600 shadow-2xs' : 'hover:text-slate-900'
                  }`}
                >
                  Bawah
                </button>
              </div>
            </div>
          </div>

          {/* UNRECOGNIZED / UNLISTED LIKERS PANEL ("akun yang like tapi tidak tercantum di data") */}
          {(externalLikersViewMode === 'top' || selectedStatusFilter === 'ORANG_LUAR') && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-amber-200/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        Akun yang Like Tapi Tidak Tercantum di Data ({isFb ? 'Facebook' : 'Instagram'})
                      </h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                        {filteredExternalLikers.length} dari {result.unrecognizedLikers?.length || 0} Akun
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Bisa berupa pelanggan/orang luar ATAU akun baru karyawan yang namanya belum tercatat. Klik ikon <strong>🔗 Hubungkan</strong> jika akun tersebut milik staf yang belum tercatat.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyExternalLikers('newline')}
                    disabled={!result.unrecognizedLikers?.length}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      copiedExternalLikers
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {copiedExternalLikers ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>
                      {copiedExternalLikers
                        ? 'Tersalin!'
                        : `Salin Semua (${result.unrecognizedLikers?.length || 0})`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsExternalLikersExpanded(!isExternalLikersExpanded)}
                    className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    {isExternalLikersExpanded ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                </div>
              </div>

              {/* Inline Assign / Link Bar when user clicks "Hubungkan ke Karyawan" on any unlisted liker */}
              {linkingLikerRaw && (
                <div className="p-3 bg-white border border-indigo-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
                  <div className="text-xs">
                    <span className="text-slate-500">Hubungkan akun </span>
                    <strong className="text-indigo-700">{formatLikerDisplay(linkingLikerRaw).label}</strong>
                    <span className="text-slate-500"> ke karyawan terdaftar (jumlah karyawan tidak bertambah):</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={linkingEmployeeId}
                      onChange={(e) => setLinkingEmployeeId(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800"
                    >
                      <option value="">-- Pilih Karyawan --</option>
                      {unlikedEmployeesForLinking.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nama} ({emp.divisi})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!linkingEmployeeId}
                      onClick={() => handleAssignUnlistedToEmployee(linkingLikerRaw, linkingEmployeeId, false)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
                    >
                      Tandai Like Saja
                    </button>
                    {setEmployees && (
                      <button
                        type="button"
                        disabled={!linkingEmployeeId}
                        onClick={() => handleAssignUnlistedToEmployee(linkingLikerRaw, linkingEmployeeId, true)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
                      >
                        Simpan Permanen ke {isFb ? 'FB' : 'IG'} Staf
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setLinkingLikerRaw(null);
                        setLinkingEmployeeId('');
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {isExternalLikersExpanded && (
                <div>
                  {filteredExternalLikers.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto p-1 custom-scrollbar">
                      {filteredExternalLikers.map((rawUser) => {
                        const info = formatLikerDisplay(rawUser);
                        return (
                          <div
                            key={`chip-${rawUser}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-amber-200 hover:border-amber-400 text-slate-800 text-xs transition-all"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span className="font-medium text-slate-900">{info.label}</span>
                            {info.slugBadge && (
                              <span className="text-[10px] font-mono text-slate-400">[{info.slugBadge}]</span>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setLinkingLikerRaw(rawUser);
                                if (!linkingEmployeeId && unlikedEmployeesForLinking[0]) {
                                  setLinkingEmployeeId(unlikedEmployeesForLinking[0].id);
                                }
                              }}
                              className="text-indigo-600 hover:text-indigo-800 p-0.5 rounded cursor-pointer"
                              title="Hubungkan akun ini ke karyawan terdaftar"
                            >
                              <Link2 className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopySingleUser(rawUser)}
                              className="text-slate-400 hover:text-indigo-600 p-0.5 rounded cursor-pointer"
                              title="Salin nama/username"
                            >
                              {copiedSingleUser === rawUser ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>

                            <a
                              href={info.profileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-indigo-600 p-0.5 rounded"
                              title={`Cek profil di ${isFb ? 'Facebook' : 'Instagram'}`}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-800/80 italic py-2">
                      {searchQuery
                        ? 'Tidak ada akun non-database yang cocok dengan pencarian.'
                        : 'Tidak ada akun luar / non-database terdeteksi.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Breakdown Table */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Divisi</th>
                  <th className="py-2.5 px-3 font-semibold">Nama Karyawan / Info Akun</th>
                  <th className="py-2.5 px-3 font-semibold">
                    {isFb ? 'Akun FB Utama' : 'Username IG 1'}
                  </th>
                  <th className="py-2.5 px-3 font-semibold">
                    {isFb ? 'Akun FB 2 / IG Ref' : 'Username IG 2 / FB Ref'}
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status Kerja</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Hasil Like ({isFb ? 'FB' : 'IG'})</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Keterangan Cocok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {/* 1. UNLISTED ACCOUNTS AT TOP */}
                {(selectedStatusFilter === 'ORANG_LUAR' ||
                  (selectedStatusFilter === 'ALL' && externalLikersViewMode === 'top')) &&
                  selectedDivFilter === 'ALL' &&
                  filteredExternalLikers.map((rawUser) => {
                    const info = formatLikerDisplay(rawUser);
                    return (
                      <tr
                        key={`table-ext-top-${rawUser}`}
                        className="bg-amber-50/40 hover:bg-amber-100/50 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-bold">
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300 inline-flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5 text-amber-700" />
                            <span>TIDAK TERCANTUM</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          <span>Akun Luar / Belum Tercatat di Data</span>
                          <span className="block text-[10px] font-normal text-amber-800">
                            Ikut like di {isFb ? 'Facebook' : 'Instagram'} namun tidak terdaftar di database staf
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{info.label}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{info.slugBadge || '-'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Non-Data
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                            Sudah Like
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setLinkingLikerRaw(rawUser);
                                if (!linkingEmployeeId && unlikedEmployeesForLinking[0]) {
                                  setLinkingEmployeeId(unlikedEmployeesForLinking[0].id);
                                }
                              }}
                              className="text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 cursor-pointer inline-flex items-center gap-1"
                            >
                              <Link2 className="w-2.5 h-2.5" />
                              <span>Hubungkan</span>
                            </button>
                            <a
                              href={info.profileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-semibold text-slate-600 hover:text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200 inline-flex items-center gap-1"
                            >
                              <span>Cek</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

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
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {isFb ? (
                        item.employee.fbUsername1 ? (
                          <span className="font-sans font-semibold text-[#1877F2]">
                            {item.employee.fbUsername1}
                          </span>
                        ) : (
                          <span className="font-sans text-[11px] text-amber-600 italic">Belum diisi</span>
                        )
                      ) : item.employee.username1 ? (
                        `@${item.employee.username1}`
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {isFb ? (
                        item.employee.fbUsername2 ? (
                          <span className="font-semibold text-slate-700">{item.employee.fbUsername2}</span>
                        ) : (
                          <span className="font-mono text-[10px] text-slate-400">
                            IG: @{item.employee.username1}
                          </span>
                        )
                      ) : item.employee.username2 ? (
                        <span className="font-mono">@{item.employee.username2}</span>
                      ) : item.employee.fbUsername1 ? (
                        <span className="text-[10px] text-slate-400">FB: {item.employee.fbUsername1}</span>
                      ) : (
                        '-'
                      )}
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
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            {isFb ? item.matchedUsername : `@${item.matchedUsername}`}
                          </span>
                          {item.matchType === 'manual_confirmed' && (
                            <button
                              type="button"
                              onClick={() => handleUndoManualConfirm(item.employee.id)}
                              className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                              title="Batalkan konfirmasi manual"
                            >
                              Batal
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {/* 3. UNLISTED ACCOUNTS AT BOTTOM */}
                {selectedStatusFilter === 'ALL' &&
                  externalLikersViewMode === 'bottom' &&
                  selectedDivFilter === 'ALL' &&
                  filteredExternalLikers.map((rawUser) => {
                    const info = formatLikerDisplay(rawUser);
                    return (
                      <tr
                        key={`table-ext-bottom-${rawUser}`}
                        className="bg-amber-50/40 hover:bg-amber-100/50 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-bold">
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300 inline-flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5 text-amber-700" />
                            <span>TIDAK TERCANTUM</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          <span>Akun Luar / Belum Tercatat di Data</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{info.label}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{info.slugBadge || '-'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Non-Data
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                            Sudah Like
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setLinkingLikerRaw(rawUser);
                              setExternalLikersViewMode('top');
                            }}
                            className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 cursor-pointer"
                          >
                            Hubungkan
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                {filteredDetailResults.length === 0 &&
                  (selectedStatusFilter !== 'ORANG_LUAR' || filteredExternalLikers.length === 0) && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Tidak ada data yang cocok dengan filter.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* QUICK CONSOLE GUIDE MODAL (SUPPORTS BOTH IG & FB)          */}
      {/* ========================================================= */}
      {isQuickGuideOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold ${
                    isFb ? 'bg-[#1877F2]' : 'bg-indigo-600'
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Cara Ambil Likers {isFb ? 'Facebook' : 'Instagram'} Otomatis
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pilih platform di kanan untuk menyalin script yang sesuai
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex p-0.5 rounded-lg bg-slate-200/80 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => handleSwitchPlatform('instagram')}
                    className={`px-2.5 py-1 rounded-md cursor-pointer ${
                      !isFb ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    IG
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchPlatform('facebook')}
                    className={`px-2.5 py-1 rounded-md cursor-pointer ${
                      isFb ? 'bg-[#1877F2] text-white shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    FB
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickGuideOpen(false)}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div
                    className={`w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-xs mb-2 ${
                      isFb ? 'bg-[#1877F2]' : 'bg-indigo-600'
                    }`}
                  >
                    1
                  </div>
                  <strong className="block text-slate-900">
                    {isFb ? 'Buka Dialog Tanggapan FB' : 'Buka Modal Likes IG'}
                  </strong>
                  <p className="text-[11px] text-slate-600">
                    {isFb
                      ? 'Buka postingan di Facebook Web, lalu klik ikon jumlah 👍❤️ Tanggapan di bawah postingan hingga daftar nama muncul.'
                      : 'Buka postingan di Instagram Web, lalu klik tulisan jumlah "Likes/Suka" agar popup likers terbuka.'}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div
                    className={`w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-xs mb-2 ${
                      isFb ? 'bg-[#1877F2]' : 'bg-indigo-600'
                    }`}
                  >
                    2
                  </div>
                  <strong className="block text-slate-900">Bookmarklet / F12 Console</strong>
                  <p className="text-[11px] text-slate-600">
                    Klik Bookmarklet {isFb ? 'FB' : 'IG'} di bar browser ATAU tekan <strong>F12 &gt; Console</strong>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div
                    className={`w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-xs mb-2 ${
                      isFb ? 'bg-[#1877F2]' : 'bg-indigo-600'
                    }`}
                  >
                    3
                  </div>
                  <strong className="block text-slate-900">Otomatis Scroll &amp; Salin</strong>
                  <p className="text-[11px] text-slate-600">
                    Script otomatis men-scroll daftar sampai habis dan menyalinnya ke Clipboard. Kembali ke sini lalu tekan <strong>Ctrl+V</strong>!
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Script Console {isFb ? 'Facebook' : 'Instagram'} (F12):
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                      copiedScript
                        ? 'bg-emerald-600 text-white'
                        : isFb
                        ? 'bg-[#1877F2] hover:bg-blue-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? 'Script Tersalin!' : `Salin Script ${isFb ? 'FB' : 'IG'}`}</span>
                  </button>
                </div>

                <div className="bg-slate-950 text-emerald-400 p-3.5 rounded-xl font-mono text-[11px] max-h-40 overflow-y-auto custom-scrollbar border border-slate-800 select-all">
                  <pre className="whitespace-pre">{activeConsoleScript}</pre>
                </div>
              </div>
            </div>

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
                <span>Coba pakai Demo Data {isFb ? 'Facebook' : 'Instagram'} sekarang &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQuickGuideOpen(false)}
                className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
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
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-teal-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Panduan Deploy ke Netlify (Gratis &amp; Cepat)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Konfigurasi <code>netlify.toml</code> &amp; <code>_redirects</code> sudah terpasang.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNetlifyGuideOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 custom-scrollbar">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">1. Deploy via GitHub / Netlify Drop</h4>
                <ol className="list-decimal space-y-1.5 text-slate-700 text-xs pl-4">
                  <li>Jalankan <code>npm run build</code> untuk menghasilkan folder <b>dist/</b>.</li>
                  <li>Buka <b>app.netlify.com/drop</b> dan seret folder <b>dist</b>, atau hubungkan via GitHub.</li>
                  <li>Seluruh data karyawan (IG &amp; FB) tersimpan aman di browser masing-masing perangkat.</li>
                </ol>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsNetlifyGuideOpen(false)}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EXTENSION & BOOKMARKLET QUICK MODAL (IG + FB SWITCHABLE)   */}
      {/* ========================================================= */}
      {isExtensionModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl text-white flex items-center justify-center ${
                    isFb ? 'bg-[#1877F2]' : 'bg-amber-500'
                  }`}
                >
                  {isFb ? <Facebook className="w-5 h-5" /> : <Chrome className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Ekstraktor Otomatis {isFb ? 'Facebook' : 'Instagram'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih saklar IG / FB untuk mengambil Bookmarklet atau unduh Ekstensi Universal v2.0
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExtensionModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 custom-scrollbar">
              {/* Switcher inside modal */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleSwitchPlatform('instagram')}
                  className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    !isFb ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Bookmarklet Instagram</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchPlatform('facebook')}
                  className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    isFb ? 'bg-[#1877F2] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Facebook className="w-3.5 h-3.5" />
                  <span>Bookmarklet Facebook</span>
                </button>
              </div>

              {/* Option 1: Platform-Specific Bookmarklet */}
              <div
                className={`p-4 rounded-2xl space-y-3 border ${
                  isFb ? 'bg-blue-50/70 border-blue-300' : 'bg-amber-50/70 border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Bookmark className={`w-4 h-4 ${isFb ? 'text-[#1877F2]' : 'text-amber-600'}`} />
                    <span>
                      Pilihan 1: Bookmarklet Khusus {isFb ? 'Facebook' : 'Instagram'} (Tanpa Install)
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyBookmarklet}
                    className="text-[11px] font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 cursor-pointer flex items-center gap-1"
                  >
                    {copiedBookmarklet ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBookmarklet ? 'Tersalin!' : 'Salin Kode'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-600">
                  Seret tombol di bawah ke <b>Bookmarks Bar (Ctrl+Shift+B)</b> browser Anda, lalu klik saat jendela daftar {isFb ? 'Tanggapan Facebook' : 'Likes Instagram'} sedang terbuka:
                </p>

                <div className="flex justify-center pt-1">
                  <a
                    ref={bookmarkletQuickRef}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCopyBookmarklet();
                    }}
                    className={`w-full sm:w-auto px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-grab active:cursor-grabbing ${
                      isFb
                        ? 'bg-[#1877F2] hover:bg-blue-700'
                        : 'bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>
                      {copiedBookmarklet
                        ? `✅ Kode Bookmarklet ${isFb ? 'FB' : 'IG'} Tersalin!`
                        : isFb
                        ? '⚡ Ekstrak Likers FB (Seret ke Bar / Klik Salin)'
                        : '⚡ Ekstrak Likers IG (Seret ke Bar / Klik Salin)'}
                    </span>
                  </a>
                </div>
              </div>

              {/* Option 2: Universal IG + FB Chrome Extension v2.0 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Chrome className="w-4 h-4 text-indigo-600" />
                    <span>Pilihan 2: Ekstensi Chrome v2.0 Universal (IG + FB Jadi Satu!)</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Cukup pasang 1 ekstensi saja untuk mengambil daftar like dari <strong>Instagram maupun Facebook</strong> (otomatis mendeteksi tab yang sedang dibuka + fitur Screenshot Panjang PNG).
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadExtensionZip}
                    disabled={isDownloadingExtensionZip}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    {isDownloadingExtensionZip ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyiapkan ZIP...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh Ekstensi IG+FB v2.0 (.ZIP)</span>
                      </>
                    )}
                  </button>

                  {onOpenExtensionGuide && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsExtensionModalOpen(false);
                        onOpenExtensionGuide();
                      }}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Panduan Pasang Lengkap &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={async () => {
                  setIsExtensionModalOpen(false);
                  await handlePasteFromClipboard();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Clipboard className="w-4 h-4" />
                <span>Tempel dari Clipboard &amp; Mulai Rekap</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExtensionModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
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

      {/* Long Screenshot Modal (Supports IG Likes & FB Reactions) */}
      <LongScreenshotModal
        isOpen={isScreenshotModalOpen}
        onClose={() => setIsScreenshotModalOpen(false)}
        result={result}
        employees={employees}
        storeCode={storeCode || 'KTSN'}
        urlPost={urlPost}
        platform={activePlatform}
      />
    </div>
  );
}
