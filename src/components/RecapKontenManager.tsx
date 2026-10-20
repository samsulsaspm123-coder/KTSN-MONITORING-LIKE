import React, { useState, useEffect, useMemo } from 'react';
import {
  Video,
  Plus,
  Trash2,
  Copy,
  Check,
  Send,
  Edit2,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Mic,
  Scissors,
  CheckSquare,
  Upload,
  Calendar,
  Users,
  Film,
  FileText,
  Save,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  Layers,
  ArrowUpDown,
  Tag,
  Share2,
  Info,
  AlertTriangle,
  X,
  Briefcase,
  Zap,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import {
  RecapKontenItem,
  ContentProductionStatus,
  ContentUploadStatus,
  ContentDivisi,
  Employee
} from '../types';

export const LOCAL_STORAGE_KEY_RECAP_KONTEN = 'likemonitor_recap_konten_items_v1';

// 4 Divisions with their distinct color schemes, badges, and icons
export const DIVISI_OPTIONS: {
  id: ContentDivisi;
  name: string;
  fullName: string;
  colorName: string;
  icon: React.ComponentType<{ className?: string }>;
  borderLeftClass: string;
  cardBadgeClass: string;
  filterActiveClass: string;
  dotClass: string;
  bgLight: string;
}[] = [
  {
    id: 'Admin',
    name: 'Admin',
    fullName: 'Divisi Admin',
    colorName: 'Indigo / Ungu',
    icon: Briefcase,
    borderLeftClass: 'border-l-4 border-l-indigo-500 dark:border-l-indigo-400',
    cardBadgeClass: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800',
    filterActiveClass: 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-400/40',
    dotClass: 'bg-indigo-500',
    bgLight: 'bg-indigo-50/40 dark:bg-indigo-950/20'
  },
  {
    id: 'FL Elekt',
    name: 'FL Elekt',
    fullName: 'Divisi Frontliner Elektrik',
    colorName: 'Emerald / Hijau',
    icon: Zap,
    borderLeftClass: 'border-l-4 border-l-emerald-500 dark:border-l-emerald-400',
    cardBadgeClass: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
    filterActiveClass: 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-400/40',
    dotClass: 'bg-emerald-500',
    bgLight: 'bg-emerald-50/40 dark:bg-emerald-950/20'
  },
  {
    id: 'FL HP',
    name: 'FL HP',
    fullName: 'Divisi Frontliner HP',
    colorName: 'Amber / Oranye',
    icon: Smartphone,
    borderLeftClass: 'border-l-4 border-l-amber-500 dark:border-l-amber-400',
    cardBadgeClass: 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800',
    filterActiveClass: 'bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/40',
    dotClass: 'bg-amber-500',
    bgLight: 'bg-amber-50/40 dark:bg-amber-950/20'
  },
  {
    id: 'All Team',
    name: 'All Team',
    fullName: 'Divisi All Team (Semua Tim)',
    colorName: 'Rose / Pink',
    icon: Users,
    borderLeftClass: 'border-l-4 border-l-rose-500 dark:border-l-rose-400',
    cardBadgeClass: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800',
    filterActiveClass: 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-400/40',
    dotClass: 'bg-rose-500',
    bgLight: 'bg-rose-50/40 dark:bg-rose-950/20'
  }
];

export function getDivisiConfig(divisi?: ContentDivisi) {
  const found = DIVISI_OPTIONS.find((d) => d.id === divisi);
  return found || DIVISI_OPTIONS[0]; // fallback to Admin
}

// Helper to format talent with divisi:
// e.g. "Amelia" + "Admin" -> "Amelia Admin"
// e.g. "Amelia Admin" + "Admin" -> "Amelia Admin"
// e.g. "All Team" + "All Team" -> "All Team"
export function formatTalentWithDivisi(talent: string, divisi?: ContentDivisi): string {
  const clean = (talent || '').trim();
  if (!clean && !divisi) return 'Talent';
  if (!clean) return divisi || 'All Team';
  if (clean.toLowerCase() === 'all team' || divisi === 'All Team') {
    return 'All Team';
  }
  if (!divisi) return clean;

  const escapedDivisi = divisi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(?:\\s+|-)${escapedDivisi}$`, 'i');
  if (regex.test(clean) || clean.toLowerCase() === divisi.toLowerCase()) {
    return clean;
  }
  return `${clean} ${divisi}`;
}

// Preset options for talent quick select
export const TALENT_PRESETS = [
  'Amelia',
  'All Team',
  'Binti',
  'Christin',
  'Tiara',
  'Mega',
  'Rian',
  'Doni',
  'Reza',
  'Bagus'
];

export const JENIS_KONTEN_PRESETS = [
  'Konten Edukasi',
  'Review Produk',
  'Promo / Diskon',
  'Tips & Trik',
  'Behind The Scene',
  'Komedi / Hiburan',
  'Testimoni Pelanggan',
  'Unboxing',
  'Perbandingan Produk'
];

export const STATUS_PRODUKSI_PRESETS: {
  label: ContentProductionStatus;
  desc: string;
  color: string;
  iconBg: string;
}[] = [
  {
    label: 'Tinggal VO',
    desc: 'Footage siap, tinggal rekam Voice Over',
    color: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700',
    iconBg: 'bg-amber-500 text-white'
  },
  {
    label: 'Belum/Tinggal Edit',
    desc: 'Bahan lengkap (footage + VO), belum/tinggal editing',
    color: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-700',
    iconBg: 'bg-blue-500 text-white'
  },
  {
    label: 'Done',
    desc: 'Semua beres, video selesai diedit & siap tayang',
    color: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700',
    iconBg: 'bg-emerald-500 text-white'
  },
  {
    label: 'Take Video / Footage',
    desc: 'Masih proses pengambilan gambar/video',
    color: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-700',
    iconBg: 'bg-purple-500 text-white'
  },
  {
    label: 'Scripting / Naskah',
    desc: 'Sedang bikin naskah / ide konsep',
    color: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    iconBg: 'bg-slate-600 text-white'
  }
];

export const STATUS_POST_OPTIONS: {
  label: ContentUploadStatus;
  color: string;
  badgeClass: string;
}[] = [
  {
    label: 'Belum Upload',
    color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    badgeClass: 'bg-rose-500 text-white'
  },
  {
    label: 'Sudah Upload',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    badgeClass: 'bg-emerald-500 text-white'
  }
];

// Default sample representing all 4 divisions and both upload statuses
export const DEFAULT_RECAP_KONTEN_ITEMS: RecapKontenItem[] = [
  {
    id: 'rk-1',
    talent: 'Amelia',
    divisi: 'Admin',
    jenisKonten: 'Konten Edukasi',
    judulKonten: 'Sepeda Listrik Goda Sunray',
    statusProduksi: 'Tinggal VO',
    statusPost: 'Belum Upload',
    tanggal: new Date().toISOString().split('T')[0],
    catatan: 'Footage display baterai & test ride siap, tinggal VO',
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5
  },
  {
    id: 'rk-2',
    talent: 'Amelia',
    divisi: 'Admin',
    jenisKonten: 'Review Produk',
    judulKonten: 'Fitur Rahasia Goda Lemon 2026',
    statusProduksi: 'Done',
    statusPost: 'Sudah Upload',
    tanggal: new Date().toISOString().split('T')[0],
    linkPost: 'https://instagram.com/p/mega_ktsn_goda',
    catatan: 'Sudah tayang di Reels & TikTok MEGA KTSN',
    createdAt: Date.now() - 3600000 * 7,
    updatedAt: Date.now() - 3600000 * 2
  },
  {
    id: 'rk-3',
    talent: 'Rian',
    divisi: 'FL Elekt',
    jenisKonten: 'Review Produk',
    judulKonten: 'Test Ride Sepeda Listrik Exotic Cooltech',
    statusProduksi: 'Done',
    statusPost: 'Sudah Upload',
    tanggal: new Date().toISOString().split('T')[0],
    linkPost: 'https://instagram.com/p/mega_ktsn_exotic',
    catatan: 'Tayang siang hari, performa views bagus',
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now() - 3600000 * 1
  },
  {
    id: 'rk-4',
    talent: 'Bagus',
    divisi: 'FL Elekt',
    jenisKonten: 'Konten Edukasi',
    judulKonten: 'Perawatan Baterai Sepeda Listrik Saat Musim Hujan',
    statusProduksi: 'Tinggal VO',
    statusPost: 'Belum Upload',
    tanggal: new Date().toISOString().split('T')[0],
    catatan: 'Tinggal dubbing suara Bagus',
    createdAt: Date.now() - 3600000 * 3,
    updatedAt: Date.now() - 3600000 * 3
  },
  {
    id: 'rk-5',
    talent: 'Doni',
    divisi: 'FL HP',
    jenisKonten: 'Tips & Trik',
    judulKonten: 'Cara Maksimalkan Kamera HP Android Murah',
    statusProduksi: 'Belum/Tinggal Edit',
    statusPost: 'Belum Upload',
    tanggal: new Date().toISOString().split('T')[0],
    catatan: 'Footage di drive, tinggal cut & subtitle',
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2
  },
  {
    id: 'rk-6',
    talent: 'All Team',
    divisi: 'All Team',
    jenisKonten: 'Behind The Scene',
    judulKonten: 'Keseruan Unboxing Motor Listrik Baru',
    statusProduksi: 'Belum/Tinggal Edit',
    statusPost: 'Belum Upload',
    tanggal: new Date().toISOString().split('T')[0],
    catatan: 'Semua kru ikut shooting unboxing',
    createdAt: Date.now() - 3600000 * 1,
    updatedAt: Date.now() - 3600000 * 1
  }
];

interface RecapKontenManagerProps {
  storeCode?: string;
  compactMode?: boolean;
  employees?: Employee[];
}

export function RecapKontenManager({
  storeCode = 'KTSN',
  compactMode = false,
  employees = []
}: RecapKontenManagerProps) {
  // Load persistent items from localStorage (permanent data, updated daily)
  const [items, setItems] = useState<RecapKontenItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_RECAP_KONTEN);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize items ensuring each has a valid divisi
          return parsed.map((item: any) => {
            if (!item.divisi) {
              if (item.talent?.toLowerCase().includes('all team')) item.divisi = 'All Team';
              else if (item.talent?.toLowerCase().includes('elekt')) item.divisi = 'FL Elekt';
              else if (item.talent?.toLowerCase().includes('hp')) item.divisi = 'FL HP';
              else item.divisi = 'Admin';
            }
            return item as RecapKontenItem;
          });
        }
      }
    } catch (e) {
      console.error('Failed to load recap konten:', e);
    }
    return DEFAULT_RECAP_KONTEN_ITEMS;
  });

  // Form State for Adding / Editing
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [talent, setTalent] = useState<string>('Amelia');
  const [divisi, setDivisi] = useState<ContentDivisi>('Admin');
  const [isCustomTalent, setIsCustomTalent] = useState<boolean>(false);
  const [jenisKonten, setJenisKonten] = useState<string>('Konten Edukasi');
  const [isCustomJenis, setIsCustomJenis] = useState<boolean>(false);
  const [judulKonten, setJudulKonten] = useState<string>('');
  const [statusProduksi, setStatusProduksi] = useState<ContentProductionStatus>('Tinggal VO');
  const [statusPost, setStatusPost] = useState<ContentUploadStatus>('Belum Upload');
  const [catatan, setCatatan] = useState<string>('');
  const [linkPost, setLinkPost] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDivisi, setFilterDivisi] = useState<string>('ALL'); // 'ALL' | 'Admin' | 'FL Elekt' | 'FL HP' | 'All Team'
  const [filterProduksi, setFilterProduksi] = useState<string>('ALL');
  const [filterPost, setFilterPost] = useState<string>('ALL');

  // UI state
  const [copiedWA, setCopiedWA] = useState<boolean>(false);
  const [copiedItemText, setCopiedItemText] = useState<string | null>(null);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showResetContohModal, setShowResetContohModal] = useState<boolean>(false);
  const [showResetAllModal, setShowResetAllModal] = useState<boolean>(false);

  // Synchronize items to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_RECAP_KONTEN, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save recap konten to localStorage:', e);
    }
  }, [items]);

  // Derived talent list from presets + employee names
  const availableTalents = useMemo(() => {
    const list = new Set<string>(TALENT_PRESETS);
    if (employees && employees.length > 0) {
      employees.slice(0, 30).forEach((emp) => {
        if (emp.nama) list.add(emp.nama);
      });
    }
    return Array.from(list);
  }, [employees]);

  // Format single line string matching user's exact specification:
  // "Amelia Admin - Konten Edukasi - Sepeda Listrik Goda Sunray ( tinggal VO) - belum upload/sudah upload"
  const formatItemString = (item: RecapKontenItem): string => {
    const formattedTalent = formatTalentWithDivisi(item.talent, item.divisi);
    const postStatusLower = item.statusPost.toLowerCase();
    const prodStatusFormatted = item.statusProduksi === 'Done' ? 'done' : item.statusProduksi.toLowerCase();
    return `${formattedTalent} - ${item.jenisKonten} - ${item.judulKonten} ( ${prodStatusFormatted} ) - ${postStatusLower}`;
  };

  // Build complete WhatsApp text recap grouped by Divisi, with uploaded videos first!
  const generateWhatsAppRecapText = useMemo(() => {
    const today = new Date();
    const dateFormatted = today.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const totalUploaded = items.filter((i) => i.statusPost === 'Sudah Upload').length;
    const totalProgress = items.filter((i) => i.statusPost === 'Belum Upload').length;

    const lines: string[] = [];
    lines.push(`📋 *RECAP KONTEN HARIAN - MEGA ${storeCode}*`);
    lines.push(`🗓️ *Hari/Tanggal:* ${dateFormatted}`);
    lines.push(`📊 *Total Konten:* ${items.length} Judul Konten (${totalUploaded} Tayang • ${totalProgress} Progress)`);
    lines.push('────────────────────────');
    lines.push('');

    // Grouping by Divisi in order
    const divisiOrder: ContentDivisi[] = ['Admin', 'FL Elekt', 'FL HP', 'All Team'];
    const divisionIcons: Record<ContentDivisi, string> = {
      Admin: '🏢',
      'FL Elekt': '⚡',
      'FL HP': '📱',
      'All Team': '👥'
    };

    let divisionsWithContent = 0;

    divisiOrder.forEach((div) => {
      // Find all items belonging to this division
      const divItems = items.filter((it) => (it.divisi || 'Admin') === div);

      if (divItems.length > 0) {
        divisionsWithContent++;
        // Order within division: SUDAH UPLOAD first, then BELUM UPLOAD
        const uploadedInDiv = divItems.filter((it) => it.statusPost === 'Sudah Upload');
        const belumInDiv = divItems.filter((it) => it.statusPost === 'Belum Upload');
        const sortedDivItems = [...uploadedInDiv, ...belumInDiv];

        const divIcon = divisionIcons[div] || '📌';
        lines.push(`${divIcon} *DIVISI ${div.toUpperCase()}* (${sortedDivItems.length} Konten: ${uploadedInDiv.length} Tayang, ${belumInDiv.length} Progress):`);

        sortedDivItems.forEach((item, idx) => {
          lines.push(`${idx + 1}. ${formatItemString(item)}`);
          if (item.statusPost === 'Sudah Upload' && item.linkPost) {
            lines.push(`   └ 🔗 ${item.linkPost}`);
          } else if (item.statusPost === 'Belum Upload' && item.catatan) {
            lines.push(`   └ 💬 _${item.catatan}_`);
          }
        });

        lines.push('');
      }
    });

    if (divisionsWithContent === 0) {
      lines.push('_(Belum ada data konten tersimpan. Tambahkan konten baru di sistem)_');
      lines.push('');
    }

    lines.push('────────────────────────');
    lines.push(`📌 _Rekap diperbarui real-time via Sistem Monitoring Konten MEGA ${storeCode}_`);

    return lines.join('\n');
  }, [items, storeCode]);

  // Handle Submit Form (Add or Update)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judulKonten.trim()) {
      alert('Mohon isi Judul Konten terlebih dahulu!');
      return;
    }

    const effectiveTalent = talent.trim() || 'All Team';
    const effectiveJenis = jenisKonten.trim() || 'Konten Edukasi';

    if (isEditingId) {
      // Edit existing
      setItems((prev) =>
        prev.map((it) =>
          it.id === isEditingId
            ? {
                ...it,
                talent: effectiveTalent,
                divisi,
                jenisKonten: effectiveJenis,
                judulKonten: judulKonten.trim(),
                statusProduksi,
                statusPost,
                catatan: catatan.trim() || undefined,
                linkPost: linkPost.trim() || undefined,
                tanggal: selectedDate,
                updatedAt: Date.now()
              }
            : it
        )
      );
      setSaveBanner('Konten berhasil diperbarui!');
      setIsEditingId(null);
    } else {
      // Create new
      const newItem: RecapKontenItem = {
        id: `rk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        talent: effectiveTalent,
        divisi,
        jenisKonten: effectiveJenis,
        judulKonten: judulKonten.trim(),
        statusProduksi,
        statusPost,
        catatan: catatan.trim() || undefined,
        linkPost: linkPost.trim() || undefined,
        tanggal: selectedDate,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setItems((prev) => [newItem, ...prev]);
      setSaveBanner(`Konten ${formatTalentWithDivisi(effectiveTalent, divisi)} berhasil ditambahkan!`);
    }

    // Reset inputs
    setJudulKonten('');
    setCatatan('');
    setLinkPost('');
    setTimeout(() => setSaveBanner(null), 3000);
  };

  // Quick 1-click update status produksi on a card
  const handleQuickUpdateProduksi = (id: string, newStatus: ContentProductionStatus) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, statusProduksi: newStatus, updatedAt: Date.now() } : it))
    );
    setSaveBanner(`Status produksi diperbarui jadi: "${newStatus}"`);
    setTimeout(() => setSaveBanner(null), 2500);
  };

  // Quick 1-click toggle status posting (Sudah Upload <-> Belum Upload)
  const handleQuickTogglePostStatus = (id: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const toggled: ContentUploadStatus =
            it.statusPost === 'Sudah Upload' ? 'Belum Upload' : 'Sudah Upload';
          return { ...it, statusPost: toggled, updatedAt: Date.now() };
        }
        return it;
      })
    );
    setSaveBanner('Status posting berhasil diperbarui');
    setTimeout(() => setSaveBanner(null), 2000);
  };

  // Start edit item
  const handleStartEdit = (item: RecapKontenItem) => {
    setIsEditingId(item.id);
    setTalent(item.talent);
    setDivisi(item.divisi || 'Admin');
    setJenisKonten(item.jenisKonten);
    setJudulKonten(item.judulKonten);
    setStatusProduksi(item.statusProduksi);
    setStatusPost(item.statusPost);
    setCatatan(item.catatan || '');
    setLinkPost(item.linkPost || '');
    if (item.tanggal) setSelectedDate(item.tanggal);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditingId(null);
    setJudulKonten('');
    setCatatan('');
    setLinkPost('');
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setDeleteConfirmId(null);
    setSaveBanner('Data konten telah dihapus dari sistem');
    setTimeout(() => setSaveBanner(null), 2500);
  };

  // 1. Reset Contoh: Kembali ke 6 contoh data bawaan lengkap 4 divisi
  const handleResetContoh = () => {
    setItems(DEFAULT_RECAP_KONTEN_ITEMS);
    setShowResetContohModal(false);
    setSaveBanner('Berhasil memuat ulang 6 contoh data recap konten lengkap 4 divisi!');
    setTimeout(() => setSaveBanner(null), 3500);
  };

  // 2. Reset Data Semua: Kosongkan seluruh data untuk ganti bulan baru
  const handleResetSemuaData = () => {
    setItems([]);
    setShowResetAllModal(false);
    setSaveBanner('Seluruh data konten bulan lalu telah dihapus. Siap untuk rekap bulan baru!');
    setTimeout(() => setSaveBanner(null), 4000);
  };

  // Copy single formatted line to clipboard
  const handleCopySingleItem = (item: RecapKontenItem) => {
    const text = formatItemString(item);
    navigator.clipboard.writeText(text);
    setCopiedItemText(item.id);
    setTimeout(() => setCopiedItemText(null), 2000);
  };

  // Copy full WA recap to clipboard
  const handleCopyWARecap = () => {
    navigator.clipboard.writeText(generateWhatsAppRecapText);
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2500);
  };

  // Direct share to WhatsApp
  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(generateWhatsAppRecapText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Count items per division for quick stats & filter pills
  const divisionCounts = useMemo(() => {
    const counts: Record<ContentDivisi, number> = {
      Admin: 0,
      'FL Elekt': 0,
      'FL HP': 0,
      'All Team': 0
    };
    items.forEach((it) => {
      const d = it.divisi || 'Admin';
      if (counts[d] !== undefined) counts[d]++;
    });
    return counts;
  }, [items]);

  // Filtered items for display
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Division filter
      if (filterDivisi !== 'ALL' && (item.divisi || 'Admin') !== filterDivisi) {
        return false;
      }
      // Status Produksi filter
      if (filterProduksi !== 'ALL' && item.statusProduksi !== filterProduksi) {
        return false;
      }
      // Status Post filter
      if (filterPost !== 'ALL' && item.statusPost !== filterPost) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const formattedT = formatTalentWithDivisi(item.talent, item.divisi).toLowerCase();
        const matchJudul = item.judulKonten.toLowerCase().includes(q);
        const matchTalent = formattedT.includes(q) || item.talent.toLowerCase().includes(q);
        const matchJenis = item.jenisKonten.toLowerCase().includes(q);
        const matchDivisi = (item.divisi || '').toLowerCase().includes(q);
        const matchCatatan = (item.catatan || '').toLowerCase().includes(q);
        return matchJudul || matchTalent || matchJenis || matchDivisi || matchCatatan;
      }
      return true;
    });
  }, [items, filterDivisi, filterProduksi, filterPost, searchQuery]);

  // Overall statistics
  const stats = useMemo(() => {
    const total = items.length;
    const sudahUpload = items.filter((i) => i.statusPost === 'Sudah Upload').length;
    const belumUpload = items.filter((i) => i.statusPost === 'Belum Upload').length;
    const tinggalVO = items.filter((i) => i.statusProduksi === 'Tinggal VO').length;
    const tinggalEdit = items.filter((i) => i.statusProduksi === 'Belum/Tinggal Edit').length;
    const doneProduksi = items.filter((i) => i.statusProduksi === 'Done').length;
    return { total, sudahUpload, belumUpload, tinggalVO, tinggalEdit, doneProduksi };
  }, [items]);

  // Preview formatted text for current input form
  const currentInputFormatted = useMemo(() => {
    const effectiveTalent = talent.trim() || 'Amelia';
    const formattedT = formatTalentWithDivisi(effectiveTalent, divisi);
    const effectiveJenis = jenisKonten.trim() || 'Konten Edukasi';
    const effectiveJudul = judulKonten.trim() || 'Sepeda Listrik Goda Sunray';
    const prodLower = statusProduksi === 'Done' ? 'done' : statusProduksi.toLowerCase();
    const postLower = statusPost.toLowerCase();
    return `${formattedT} - ${effectiveJenis} - ${effectiveJudul} ( ${prodLower} ) - ${postLower}`;
  }, [talent, divisi, jenisKonten, judulKonten, statusProduksi, statusPost]);

  const activeDivisiConfig = getDivisiConfig(divisi);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & WhatsApp Action Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Recap Konten Harian
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-100 text-pink-700 dark:bg-pink-950/80 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                  Data Permanen Tiap Hari
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                  4 Divisi Warna
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pilih talent & divisi, klik tahap produksi & status posting &bull; Format WA otomatis dikelompokkan per divisi (video tayang paling atas)
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleCopyWARecap}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                copiedWA
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
              title="Salin rekap berformat WhatsApp lengkap untuk dikirim ke grup kerja"
            >
              {copiedWA ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedWA ? 'Tersalin ke WA!' : 'Salin Rekap WA'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              title="Kirim langsung ke WhatsApp"
            >
              <Send className="w-4 h-4" />
              <span>Kirim ke WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Division Summary Banner: Visual Color Recognition */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          {DIVISI_OPTIONS.map((d) => {
            const Icon = d.icon;
            const count = divisionCounts[d.id] || 0;
            const isSelected = filterDivisi === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setFilterDivisi(filterDivisi === d.id ? 'ALL' : d.id)}
                className={`p-2.5 rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? `${d.cardBadgeClass} ring-2 ring-current shadow-xs`
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60'
                }`}
                title={`Klik untuk filter hanya Divisi ${d.name}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${d.cardBadgeClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                      Divisi
                    </div>
                    <div className="text-xs font-black truncate">{d.name}</div>
                  </div>
                </div>
                <div className="text-base font-black px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 shadow-2xs">
                  {count}
                </div>
              </button>
            );
          })}
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Judul</span>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{stats.total} Konten</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Mic className="w-3 h-3" /> Tinggal VO
            </span>
            <div className="text-lg font-black text-amber-900 dark:text-amber-200 mt-0.5">{stats.tinggalVO}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1">
              <Scissors className="w-3 h-3" /> Tinggal Edit
            </span>
            <div className="text-lg font-black text-blue-900 dark:text-blue-200 mt-0.5">{stats.tinggalEdit}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
            <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1">
              <CheckSquare className="w-3 h-3" /> Done Edit
            </span>
            <div className="text-lg font-black text-purple-900 dark:text-purple-200 mt-0.5">{stats.doneProduksi}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Belum Upload
            </span>
            <div className="text-lg font-black text-rose-900 dark:text-rose-200 mt-0.5">{stats.belumUpload}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <Upload className="w-3 h-3" /> Sudah Upload
            </span>
            <div className="text-lg font-black text-emerald-900 dark:text-emerald-200 mt-0.5">{stats.sudahUpload}</div>
          </div>
        </div>
      </div>

      {/* Save / Notice Alert */}
      {saveBanner && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* Main Grid: Form Builder (Left 5 Cols) & List / Output (Right 7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 1-CLICK FORM BUILDER */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                {isEditingId ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                {isEditingId ? 'Edit Data Konten' : 'Input / Tambah Konten Baru'}
              </h3>
            </div>
            {isEditingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-semibold cursor-pointer"
              >
                Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-4">
            {/* 1. NAMA TALENT */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  <span>1. Nama Talent:</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomTalent(!isCustomTalent)}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  {isCustomTalent ? 'Pilih Nama Cepat' : '+ Ketik Manual'}
                </button>
              </div>

              {isCustomTalent ? (
                <input
                  type="text"
                  value={talent}
                  onChange={(e) => setTalent(e.target.value)}
                  placeholder="Ketik nama talent (misal: Amelia, Rian, Doni, All Team)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {['Amelia', 'All Team', 'Binti', 'Christin', 'Rian', 'Doni'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setTalent(t);
                          if (t === 'All Team') setDivisi('All Team');
                        }}
                        className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-all cursor-pointer ${
                          talent === t
                            ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {t === 'All Team' ? '👥 All Team' : t}
                      </button>
                    ))}
                  </div>

                  {/* Dropdown for other talents / employees */}
                  <div className="relative">
                    <select
                      value={talent}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTalent(val);
                        if (val === 'All Team') setDivisi('All Team');
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
                    >
                      <option value="">-- Pilih dari Daftar Karyawan / Talent Lainnya --</option>
                      {availableTalents.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 2. DIVISI (Tepat Di Bawah Nama Talent - 4 Pilihan Warna) */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                  <span>2. Divisi:</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Hasil recap: nama + divisi)</span>
                </label>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Hasil: <strong className="text-indigo-600 dark:text-indigo-400">{formatTalentWithDivisi(talent, divisi)}</strong>
                </span>
              </div>

              {/* 4 Division Buttons with Distinct Colors */}
              <div className="grid grid-cols-2 gap-2">
                {DIVISI_OPTIONS.map((d) => {
                  const Icon = d.icon;
                  const isSelected = divisi === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDivisi(d.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? `${d.cardBadgeClass} ring-2 ring-current shadow-xs font-black scale-[1.01]`
                          : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${d.cardBadgeClass}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black truncate">{d.name}</div>
                        <div className="text-[10px] opacity-75 truncate">{d.colorName}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. JENIS KONTEN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-500" />
                  <span>3. Jenis Konten:</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomJenis(!isCustomJenis)}
                  className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-semibold cursor-pointer"
                >
                  {isCustomJenis ? 'Pilih Preset' : '+ Ketik Manual'}
                </button>
              </div>

              {isCustomJenis ? (
                <input
                  type="text"
                  value={jenisKonten}
                  onChange={(e) => setJenisKonten(e.target.value)}
                  placeholder="Ketik jenis konten (misal: Konten Edukasi, Review Produk)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {JENIS_KONTEN_PRESETS.map((jk) => (
                    <button
                      key={jk}
                      type="button"
                      onClick={() => setJenisKonten(jk)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-all cursor-pointer ${
                        jenisKonten === jk
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {jk}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. JUDUL KONTEN */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-pink-500" />
                <span>4. Judul Konten:</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={judulKonten}
                onChange={(e) => setJudulKonten(e.target.value)}
                placeholder="Contoh: Sepeda Listrik Goda Sunray / Mesin Cuci 2 Tabung"
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 font-semibold"
              />
            </div>

            {/* 5. TAHAP STATUS PRODUKSI (Tinggal Klik Saja) */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Scissors className="w-3.5 h-3.5 text-amber-500" />
                <span>5. Tahap Status Produksi:</span>
                <span className="text-[10px] text-slate-400 font-normal">(Tinggal klik salah satu)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STATUS_PRODUKSI_PRESETS.map((st) => {
                  const isSelected = statusProduksi === st.label;
                  return (
                    <button
                      key={st.label}
                      type="button"
                      onClick={() => setStatusProduksi(st.label)}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? `${st.color} ring-2 ring-indigo-500/50 shadow-xs font-bold`
                          : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full shrink-0 ${isSelected ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{st.label}</div>
                        <div className="text-[10px] opacity-75 truncate">{st.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. STATUS POSTING (Sudah Upload / Belum Upload) */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Upload className="w-3.5 h-3.5 text-emerald-500" />
                <span>6. Status Posting:</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_POST_OPTIONS.map((sp) => {
                  const isSelected = statusPost === sp.label;
                  return (
                    <button
                      key={sp.label}
                      type="button"
                      onClick={() => setStatusPost(sp.label)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold text-xs flex items-center justify-center gap-2 ${
                        isSelected
                          ? `${sp.color} ring-2 ring-indigo-500/50 shadow-xs`
                          : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${sp.label === 'Sudah Upload' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span>{sp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Notes / Link Post */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Catatan tambahan (misal: bahan video di HP admin, tinggal VO)"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />

              {statusPost === 'Sudah Upload' && (
                <input
                  type="url"
                  value={linkPost}
                  onChange={(e) => setLinkPost(e.target.value)}
                  placeholder="Link postingan (opsional, misal: https://instagram.com/p/...)"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
            >
              {isEditingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isEditingId ? 'Simpan Perubahan Konten' : 'Simpan Konten ke Recap'}</span>
            </button>
          </form>

          {/* Quick Preview Box of Current Input */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs">
            <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
              Pratinjau Format Baris Anda:
            </span>
            <code className="font-mono text-xs text-indigo-700 dark:text-indigo-300 font-bold break-all block">
              {currentInputFormatted}
            </code>
          </div>
        </div>

        {/* RIGHT COLUMN: LIST KONTEN & 1-CLICK STAGE TOGGLES */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-auto flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul, talent, divisi, atau status..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              {/* 2 Reset Actions: Reset Contoh & Reset Data Semua (Ganti Bulan) */}
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowResetContohModal(true)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  title="Muat ulang contoh data recap 4 divisi standar"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Reset Contoh</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowResetAllModal(true)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  title="Hapus bersih semua data konten bulan lalu untuk ganti bulan baru"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Reset Data Semua</span>
                  <span className="text-[10px] px-1 py-0.2 bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 rounded font-normal">
                    Ganti Bulan
                  </span>
                </button>
              </div>
            </div>

            {/* FILTER DIVISI (4 Pilihan Berwarna + Semua) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
                  <Filter className="w-3 h-3" /> Divisi:
                </span>

                <button
                  type="button"
                  onClick={() => setFilterDivisi('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    filterDivisi === 'ALL'
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Semua Divisi ({items.length})
                </button>

                {DIVISI_OPTIONS.map((d) => {
                  const Icon = d.icon;
                  const isSelected = filterDivisi === d.id;
                  const count = divisionCounts[d.id] || 0;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setFilterDivisi(d.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? d.filterActiveClass
                          : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{d.name}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Pills for Status Produksi & Upload */}
            <div className="flex items-center gap-2 flex-wrap text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400">Filter Status:</span>

              {/* Status Produksi Filter */}
              <select
                value={filterProduksi}
                onChange={(e) => setFilterProduksi(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
              >
                <option value="ALL">Semua Tahap Produksi</option>
                <option value="Tinggal VO">Tinggal VO</option>
                <option value="Belum/Tinggal Edit">Belum/Tinggal Edit</option>
                <option value="Done">Done</option>
                <option value="Take Video / Footage">Take Video</option>
              </select>

              {/* Status Post Filter */}
              <select
                value={filterPost}
                onChange={(e) => setFilterPost(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
              >
                <option value="ALL">Semua Status Upload</option>
                <option value="Belum Upload">Belum Upload</option>
                <option value="Sudah Upload">Sudah Upload</option>
              </select>

              {(filterDivisi !== 'ALL' || filterProduksi !== 'ALL' || filterPost !== 'ALL' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterDivisi('ALL');
                    setFilterProduksi('ALL');
                    setFilterPost('ALL');
                    setSearchQuery('');
                  }}
                  className="text-[11px] text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* List of Recap Konten Items */}
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
                <Film className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Belum Ada Data Konten</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {filterDivisi !== 'ALL'
                    ? `Tidak ada data konten untuk Divisi ${filterDivisi}. Coba ubah filter atau tambahkan konten baru.`
                    : 'Tambahkan konten di formulir sebelah kiri atau klik "Reset Contoh" untuk memuat data awal.'}
                </p>
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const itemDivisi = item.divisi || 'Admin';
                const divConfig = getDivisiConfig(itemDivisi);
                const DivIcon = divConfig.icon;
                const formattedTalent = formatTalentWithDivisi(item.talent, item.divisi);
                const isItemDone = item.statusProduksi === 'Done';
                const isUploaded = item.statusPost === 'Sudah Upload';

                return (
                  <div
                    key={item.id}
                    className={`bg-white dark:bg-slate-900 border ${divConfig.borderLeftClass} rounded-2xl p-4 shadow-xs transition-all ${
                      isUploaded
                        ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-pink-300 dark:hover:border-pink-800'
                    }`}
                  >
                    {/* Top Row: Index + Divisi Badge (Distinct Color) + Talent + Jenis Konten + Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-black shrink-0">
                          {index + 1}
                        </span>

                        {/* Distinct Divisi Badge with Color */}
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-xs font-black border flex items-center gap-1 ${divConfig.cardBadgeClass}`}
                          title={`Divisi: ${divConfig.fullName}`}
                        >
                          <DivIcon className="w-3 h-3" />
                          <span>{itemDivisi}</span>
                        </span>

                        {/* Talent Badge */}
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {formattedTalent}
                        </span>

                        {/* Jenis Konten Badge */}
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {item.jenisKonten}
                        </span>
                      </div>

                      {/* Top Action Buttons (Copy, Edit, Delete) */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopySingleItem(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          title="Salin format 1 baris ini"
                        >
                          {copiedItemText === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit konten ini"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {deleteConfirmId === item.id ? (
                          <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 p-1 rounded-lg border border-rose-200 dark:border-rose-800">
                            <span className="text-[10px] text-rose-700 dark:text-rose-300 font-bold px-1">Hapus?</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer"
                            >
                              Ya
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Hapus baris konten ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Judul Konten (Big & Clear) */}
                    <div className="mt-2.5">
                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                        {item.judulKonten}
                      </h4>
                      {item.catatan && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-start gap-1">
                          <span className="text-slate-400 font-semibold">Catatan:</span>
                          <span>{item.catatan}</span>
                        </p>
                      )}
                    </div>

                    {/* Exact Formatted String (Highlight User's Format) */}
                    <div className="mt-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-slate-800 dark:text-slate-200 font-medium select-all">
                        {formatItemString(item)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopySingleItem(item)}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 cursor-pointer"
                      >
                        {copiedItemText === item.id ? 'Tersalin!' : 'Salin Baris'}
                      </button>
                    </div>

                    {/* 1-CLICK STAGE CONTROLS */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Tahap Produksi 1-Click Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                          Tahap:
                        </span>
                        {(['Tinggal VO', 'Belum/Tinggal Edit', 'Done'] as ContentProductionStatus[]).map((st) => {
                          const isActive = item.statusProduksi === st;
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleQuickUpdateProduksi(item.id, st)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                isActive
                                  ? st === 'Done'
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                    : st === 'Tinggal VO'
                                    ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                                    : 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {st === 'Done' && <Check className="w-3 h-3 inline mr-1" />}
                              {st}
                            </button>
                          );
                        })}
                      </div>

                      {/* Status Post 1-Click Toggle */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickTogglePostStatus(item.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                            isUploaded
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 ring-2 ring-emerald-300/40'
                              : 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800'
                          }`}
                          title="Klik untuk beralih antara Belum Upload & Sudah Upload"
                        >
                          {isUploaded ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              <span>Sudah Upload</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                              <span>Belum Upload</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Full WhatsApp Output Preview Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-600" />
                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  Pratinjau Format WhatsApp Siap Kirim (Dikelompokkan Per Divisi)
                </h4>
              </div>
              <button
                type="button"
                onClick={handleCopyWARecap}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedWA ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWA ? 'Tersalin!' : 'Salin Format'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Format WhatsApp otomatis mengelompokkan konten per divisi (Admin, FL Elekt, FL HP, All Team). Di dalam tiap divisi, video yang <strong>sudah upload diletakkan di nomor teratas</strong>, disusul video yang belum upload.
            </p>

            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto border border-slate-800">
              {generateWhatsAppRecapText}
            </pre>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. MODAL KONFIRMASI: RESET CONTOH DATA                   */}
      {/* ========================================================= */}
      {showResetContohModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowResetContohModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Muat Ulang Contoh Format Data?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Tindakan ini akan mengembalikan daftar recap ke <strong>6 contoh konten standar 4 divisi</strong> (Amelia Admin, Rian FL Elekt, Doni FL HP, All Team) lengkap dengan status Sudah Upload di atas dan Belum Upload di bawah. Data yang sedang aktif saat ini akan ditimpa.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-300">
              💡 <em>Gunakan fitur ini jika Anda ingin melihat kembali contoh format 4 divisi atau baru mencoba pengisian rekap.</em>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetContohModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetContoh}
                className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ya, Muat Contoh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MODAL KONFIRMASI: RESET DATA SEMUA (GANTI BULAN)       */}
      {/* ========================================================= */}
      {showResetAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowResetAllModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  PERIODE BULANAN
                </span>
                <span className="text-xs text-slate-400">Ganti Bulan Baru</span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                Hapus Bersih Semua Data Konten?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Karena laporan rekap konten dikirim <strong>1 bulan sekali</strong>, tombol ini akan <strong>menghapus bersih seluruh {items.length} data konten bulan lalu</strong> dan mengosongkan tabel agar siap diisi rekap baru untuk bulan berikutnya.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-900 dark:text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong>Peringatan Ganti Bulan:</strong> Pastikan rekap bulan lalu sudah disalin atau dikirim ke WhatsApp sebelum direset, karena data yang telah dihapus tidak dapat dipulihkan kembali.
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleCopyWARecap}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                title="Salin rekap saat ini dulu sebelum dihapus"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Rekap Dulu</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetAllModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleResetSemuaData}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-[0.98]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua & Ganti Bulan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
