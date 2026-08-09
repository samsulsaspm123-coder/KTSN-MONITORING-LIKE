import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Building2,
  Upload,
  RefreshCw,
  X,
  List,
  LayoutGrid,
  Filter,
  Sparkles,
  Layers,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { InventoryItem, InventoryReportMeta, StockStatus } from '../types';
import {
  RAW_INVENTORY_ITEMS,
  DEFAULT_INVENTORY_META,
  parseInventoryPdfText,
  getStockStatusInfo,
} from '../data/defaultInventoryPdf';

interface InventoryPdfCheckerProps {
  storeCode?: string;
  onNavigateToDesain?: (initialProductName?: string) => void;
  onNavigateToSosmed?: (initialTitle?: string) => void;
}

const LOCAL_STORAGE_KEY_CUSTOM_INV = 'likemonitor_custom_inventory_v3';
const LOCAL_STORAGE_KEY_CUSTOM_META = 'likemonitor_custom_inv_meta_v3';

// Quick filter chips for ultra-fast product discovery
const QUICK_SEARCH_CHIPS = [
  { label: 'Semua Produk', query: '' },
  { label: '💡 Philips', query: 'philips' },
  { label: '🔥 Kompor & Gas', query: 'kompor' },
  { label: '❄️ Freezer & Kulkas', query: 'freezer' },
  { label: '📺 TV LED', query: 'tv' },
  { label: '🧺 Mesin Cuci', query: 'mesin cuci' },
  { label: '🔌 Listrik & Kabel', query: 'kabel stop kontak' },
  { label: '⚡ Sepeda Listrik', query: 'sepeda listrik' },
  { label: '🍚 Magic Com', query: 'magic com' },
  { label: '🌪️ Blender & Juicer', query: 'blender' },
  { label: '👔 Setrika', query: 'setrika' },
  { label: '📱 HP & Gadget', query: 'hp' },
  { label: '❄️ AC', query: 'ac' },
  { label: '💧 Pompa Air', query: 'pompa air' },
];

const SAMPLE_PDF_SNIPPET = `Saldo Persediaan Per Tanggal
Tanggal : 05/08/2026
KERTOSONO
Gudang : GB001 [ BELAKANG ]
Merek Kode / Nama Saldo
POLYTRON [PT00189]POLYTRON TV LED 32TC1865 + SPK 2.00
POLYTRON [PT00190]POLYTRON TV LED 43TG5055 + SPK 1.00
POLYTRON [PT00198]POLYTRON TV LED 50BUG3058+SWF 3.00
RSA [RF00009]RSA FREEZER BOX CF 110 1.00
RSA [RF00008]RSA FREEZER BOX CF 1200 1.00
RSA [RF00010]RSA FREEZER BOX CF 210 2.00
RSA [RF00011]RSA FREEZER BOX CF 310 3.00
RSA [RJ00001]RSA JUICER HAND WM-1078 1.00
RSA [RM00039]RSA MESIN CUCI WM TT-100 1.00`;

export function InventoryPdfChecker({
  storeCode = 'MEGA KTSN',
}: InventoryPdfCheckerProps) {
  // Main Search query
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | StockStatus>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Copy tracking state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAllNotice, setCopiedAllNotice] = useState<boolean>(false);

  // Import Modal state
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importRawText, setImportRawText] = useState<string>('');
  const [importDate, setImportDate] = useState<string>('05/08/2026');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);

  // Inventory dataset
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOM_INV);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return RAW_INVENTORY_ITEMS;
  });

  const [inventoryMeta, setInventoryMeta] = useState<InventoryReportMeta>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOM_META);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.storeName) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_INVENTORY_META;
  });

  // Escape key & body overflow handler for Modal
  useEffect(() => {
    if (!showImportModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowImportModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [showImportModal]);

  // Extract unique warehouses
  const availableWarehouses = useMemo(() => {
    const set = new Set<string>();
    inventoryList.forEach((item) => {
      if (item.gudang) set.add(item.gudang);
    });
    return Array.from(set).sort();
  }, [inventoryList]);

  // Live preview parser when typing in modal
  const livePreview = useMemo(() => {
    if (!importRawText.trim()) return null;
    try {
      const res = parseInventoryPdfText(
        importRawText,
        importDate || inventoryMeta.sourceDate,
        inventoryMeta.storeName
      );
      return res;
    } catch {
      return null;
    }
  }, [importRawText, importDate, inventoryMeta.sourceDate, inventoryMeta.storeName]);

  // Comprehensive, ultra-flexible multi-word search algorithm
  const filteredItems = useMemo(() => {
    const rawTokens = searchQuery
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter((t) => t.length > 0);

    return inventoryList.filter((item) => {
      // 1. Warehouse filter
      if (selectedWarehouse !== 'ALL' && item.gudang !== selectedWarehouse) {
        return false;
      }

      // 2. Status filter
      if (selectedStatus !== 'ALL') {
        const itemStatus = item.saldo > 1 ? 'AMAN' : item.saldo === 1 ? 'KRITIS' : 'KOSONG';
        if (itemStatus !== selectedStatus) return false;
      }

      // 3. Search query matching
      if (rawTokens.length === 0) return true;

      // Prepare rich searchable text for this item
      const combinedText = `
        ${item.nama}
        ${item.merek}
        ${item.kode}
        ${item.tipeModel}
        ${item.gudang}
        ${item.category || ''}
      `.toLowerCase();

      // Check synonyms / semantic aliases
      const hasTokenMatch = rawTokens.every((token) => {
        // Direct substring check (matches product names with numbers, models like cf 110, 1200, 32tc1865, etc.)
        if (combinedText.includes(token)) return true;

        // Alias & synonym mappings
        if (token === 'freezer' || token === 'showcase' || token === 'chiller') {
          return (
            combinedText.includes('freezer') ||
            combinedText.includes('showcase') ||
            combinedText.includes('rsa') ||
            combinedText.includes('gea') ||
            combinedText.includes('cf') ||
            combinedText.includes('kulkas')
          );
        }
        if (token === 'rsa') {
          return (
            combinedText.includes('rsa') ||
            combinedText.includes('rf') ||
            combinedText.includes('rj') ||
            combinedText.includes('rm')
          );
        }
        if (token === 'polytron') {
          return (
            combinedText.includes('polytron') ||
            combinedText.includes('pt') ||
            combinedText.includes('pk') ||
            combinedText.includes('pm') ||
            combinedText.includes('pas')
          );
        }
        if (token === 'kompor') {
          return (
            combinedText.includes('rinnai') ||
            combinedText.includes('quantum') ||
            combinedText.includes('winn gas') ||
            combinedText.includes('niko') ||
            combinedText.includes('kompor') ||
            combinedText.includes('gas')
          );
        }
        if (token === 'regulator') {
          return (
            combinedText.includes('regulator') ||
            combinedText.includes('star cam') ||
            combinedText.includes('destec') ||
            combinedText.includes('winn gas') ||
            combinedText.includes('selang')
          );
        }
        if (token === 'lampu' || token === 'bohlam' || token === 'led') {
          return (
            combinedText.includes('lampu') ||
            combinedText.includes('led') ||
            combinedText.includes('hannochs') ||
            combinedText.includes('philips') ||
            combinedText.includes('luby')
          );
        }
        if (token === 'listrik' || token === 'colokan' || token === 'stopkontak') {
          return (
            combinedText.includes('broco') ||
            combinedText.includes('uticon') ||
            combinedText.includes('steker') ||
            combinedText.includes('stop kontak') ||
            combinedText.includes('kabel') ||
            combinedText.includes('saklar') ||
            combinedText.includes('fitting')
          );
        }
        if (token === 'setrika') {
          return (
            combinedText.includes('setrika') ||
            combinedText.includes('1172') ||
            combinedText.includes('1173') ||
            combinedText.includes('dst') ||
            combinedText.includes('ha-130') ||
            combinedText.includes('gc 122') ||
            combinedText.includes('cis')
          );
        }
        if (token === 'blender' || token === 'chopper' || token === 'jus' || token === 'juicer') {
          return (
            combinedText.includes('blender') ||
            combinedText.includes('chopper') ||
            combinedText.includes('juicer') ||
            combinedText.includes('wm-1078') ||
            combinedText.includes('hr 2221') ||
            combinedText.includes('hr 2115') ||
            combinedText.includes('cb 180') ||
            combinedText.includes('101pl')
          );
        }
        if (token === 'mesin' || token === 'cuci' || token === 'mesincuci') {
          return (
            combinedText.includes('mesin cuci') ||
            combinedText.includes('wm') ||
            combinedText.includes('tt-100') ||
            combinedText.includes('qw') ||
            combinedText.includes('pwm') ||
            combinedText.includes('tw')
          );
        }
        if (token === 'ricecooker' || token === 'magiccom' || token === 'penanak') {
          return (
            combinedText.includes('magic com') ||
            combinedText.includes('yongma') ||
            combinedText.includes('mcm') ||
            combinedText.includes('crj') ||
            combinedText.includes('hd 3003') ||
            combinedText.includes('hd 3119')
          );
        }
        if (token === 'aksesoris' || token === 'accessory') {
          return (
            combinedText.includes('kabel') ||
            combinedText.includes('braket') ||
            combinedText.includes('bracket') ||
            combinedText.includes('antena') ||
            combinedText.includes('remote') ||
            combinedText.includes('baterai') ||
            combinedText.includes('powerbank') ||
            combinedText.includes('tws') ||
            combinedText.includes('flashdisk') ||
            combinedText.includes('memory') ||
            combinedText.includes('holder')
          );
        }

        return false;
      });

      return hasTokenMatch;
    });
  }, [inventoryList, searchQuery, selectedWarehouse, selectedStatus]);

  // Summary counts
  const stats = useMemo(() => {
    let safe = 0;
    let critical = 0;
    let empty = 0;
    filteredItems.forEach((item) => {
      if (item.saldo > 1) safe++;
      else if (item.saldo === 1) critical++;
      else empty++;
    });
    return {
      totalFound: filteredItems.length,
      totalAll: inventoryList.length,
      safe,
      critical,
      empty,
    };
  }, [filteredItems, inventoryList]);

  // Copy single product name
  const handleCopyProductName = (item: InventoryItem) => {
    const textToCopy = `${item.nama}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Copy all visible product names
  const handleCopyAllFoundNames = () => {
    if (filteredItems.length === 0) return;
    const textToCopy = filteredItems
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.nama} [${item.merek}] - ${
            item.saldo > 1
              ? `Stok Aman (${item.saldo.toFixed(0)} Unit)`
              : item.saldo === 1
              ? '1 Unit (Kritis)'
              : 'Kosong'
          }`
      )
      .join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopiedAllNotice(true);
    setTimeout(() => {
      setCopiedAllNotice(false);
    }, 2500);
  };

  // Reset to default sample inventory
  const handleResetToDefault = () => {
    if (
      confirm(
        'Kembalikan database inventaris ke data bawaan lengkap (Philips, RSA, Polytron, Kompor, Elektronik, Aksesoris)?'
      )
    ) {
      localStorage.removeItem(LOCAL_STORAGE_KEY_CUSTOM_INV);
      localStorage.removeItem(LOCAL_STORAGE_KEY_CUSTOM_META);
      setInventoryList(RAW_INVENTORY_ITEMS);
      setInventoryMeta(DEFAULT_INVENTORY_META);
      setSearchQuery('');
    }
  };

  // Process Text / PDF Parser for imported data
  const handleParseCustomText = () => {
    if (!importRawText.trim()) {
      setImportStatusMessage('Silakan tempel teks laporan PDF terlebih dahulu.');
      return;
    }

    try {
      const parsedResult = parseInventoryPdfText(
        importRawText,
        importDate || inventoryMeta.sourceDate,
        inventoryMeta.storeName
      );

      if (parsedResult.items.length === 0) {
        setImportStatusMessage(
          'Format data tidak terbaca. Pastikan teks laporan memuat baris nama produk dan angka saldo (contoh: "RSA [RF00009]RSA FREEZER BOX CF 110 1.00").'
        );
        return;
      }

      let finalList: InventoryItem[] = [];
      if (importMode === 'append') {
        // Merge without duplicating existing IDs
        finalList = [...inventoryList, ...parsedResult.items];
      } else {
        finalList = parsedResult.items;
      }

      const updatedMeta: InventoryReportMeta = {
        ...parsedResult.meta,
        totalItems: finalList.length,
      };

      setInventoryList(finalList);
      setInventoryMeta(updatedMeta);
      localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOM_INV, JSON.stringify(finalList));
      localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOM_META, JSON.stringify(updatedMeta));

      setImportStatusMessage(
        `✅ Berhasil memproses ${parsedResult.items.length} produk! Stok dan nama model sudah disesuaikan dengan benar.`
      );
      setTimeout(() => {
        setShowImportModal(false);
        setImportStatusMessage(null);
        setImportRawText('');
      }, 1300);
    } catch (err: any) {
      setImportStatusMessage(`Gagal parsing: ${err?.message || 'Error tidak diketahui'}`);
    }
  };

  return (
    <div className="w-full space-y-4 pb-16">
      {/* Top Banner / Store Info Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Pencarian Stok Produk
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                {storeCode}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Tgl Data: <strong>{inventoryMeta.sourceDate}</strong>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cek stok akurat semua produk (Freezer RSA, TV Polytron, Kompor, Philips, Elektronik, Aksesoris)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-import-data"
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
            title="Import teks atau perbarui data stok dari PDF"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Update / Import Data PDF</span>
          </button>

          <button
            id="btn-reset-default"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors"
            title="Muat ulang sampel bawaan"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* Main Search & Filter Control Hub */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
        {/* Large Main Input Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5 text-indigo-600" />
          </div>
          <input
            id="input-product-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik produk apa saja (contoh: CF 110, RSA, Polytron 32, Philips 1172, Kompor, Kulkas, Setrika)..."
            className="w-full pl-11 pr-28 py-3.5 text-base sm:text-lg font-medium text-slate-900 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-indigo-600 rounded-xl outline-none transition-all shadow-inner"
            autoFocus
          />
          {searchQuery && (
            <button
              id="btn-clear-search"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-20 px-2 flex items-center text-slate-400 hover:text-slate-700"
              title="Bersihkan pencarian"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs font-black bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-lg">
              {stats.totalFound} Produk
            </span>
          </div>
        </div>

        {/* Quick Search Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 pr-1 shrink-0">
            <Filter className="w-3 h-3" /> Cepat:
          </span>
          {QUICK_SEARCH_CHIPS.map((chip) => {
            const isActive =
              chip.query === ''
                ? searchQuery === ''
                : searchQuery.toLowerCase() === chip.query.toLowerCase();
            return (
              <button
                key={chip.label}
                id={`chip-${chip.label.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setSearchQuery(chip.query)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Row (Status & Warehouse + View Mode) */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              id="status-filter-all"
              onClick={() => setSelectedStatus('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedStatus === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Semua ({stats.totalFound})
            </button>
            <button
              id="status-filter-safe"
              onClick={() => setSelectedStatus('AMAN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${
                selectedStatus === 'AMAN'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Stok Aman ({stats.safe})</span>
            </button>
            <button
              id="status-filter-critical"
              onClick={() => setSelectedStatus('KRITIS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${
                selectedStatus === 'KRITIS'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>1 Unit Kritis ({stats.critical})</span>
            </button>
            <button
              id="status-filter-empty"
              onClick={() => setSelectedStatus('KOSONG')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${
                selectedStatus === 'KOSONG'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Kosong ({stats.empty})</span>
            </button>
          </div>

          {/* Right Controls: Warehouse filter & View toggle & Copy All */}
          <div className="flex items-center gap-2 justify-between sm:justify-end">
            <select
              id="select-warehouse-filter"
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 outline-none focus:border-indigo-600"
            >
              <option value="ALL">Semua Gudang ({availableWarehouses.length} Lokasi)</option>
              {availableWarehouses.map((wh) => (
                <option key={wh} value={wh}>
                  {wh}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                id="btn-view-table"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Tabel Rapat"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                id="btn-view-cards"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'cards'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Kartu Ringkas"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Copy All Names Button */}
            {filteredItems.length > 0 && (
              <button
                id="btn-copy-all-names"
                onClick={handleCopyAllFoundNames}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white inline-flex items-center gap-1.5 transition-colors shadow-xs"
                title="Salin semua nama produk yang tampil di layar"
              >
                {copiedAllNotice ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Semua Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Semua ({filteredItems.length})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Results Container */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            Tidak ada produk yang cocok dengan pencarian "{searchQuery}"
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Coba ketik model seperti "CF 110", "32TC1865", atau nama merk seperti RSA, Polytron, Philips, Rinnai.
          </p>
          <button
            id="btn-empty-reset"
            onClick={() => {
              setSearchQuery('');
              setSelectedStatus('ALL');
              setSelectedWarehouse('ALL');
            }}
            className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors inline-block"
          >
            Tampilkan Semua Produk
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ================= COMPACT HIGH-DENSITY TABLE VIEW ================= */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Daftar Produk ({filteredItems.length} item)</span>
            <span className="text-slate-400 font-normal">Klik tombol "Salin Nama" untuk menyalin nama produk</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3">Nama Produk & Spesifikasi</th>
                  <th className="py-2.5 px-3 w-28">Merk</th>
                  <th className="py-2.5 px-3 w-44 text-center">Status Stok</th>
                  <th className="py-2.5 px-3 w-36 text-slate-400 hidden sm:table-cell">Gudang</th>
                  <th className="py-2.5 px-3 w-32 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item, index) => {
                  const statusInfo = getStockStatusInfo(item.saldo);
                  const isCopied = copiedId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${statusInfo.rowHighlight}`}
                    >
                      {/* Number */}
                      <td className="py-3 px-3 text-center text-xs text-slate-400 font-mono">
                        {index + 1}
                      </td>

                      {/* Product Name */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-sm leading-snug">
                          {item.nama}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-slate-400">
                            [{item.kode}]
                          </span>
                          {item.category && (
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-md text-xs font-black bg-slate-100 text-slate-800 border border-slate-200 inline-block">
                          {item.merek}
                        </span>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${statusInfo.badgeClass}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${statusInfo.dotColor}`}
                          />
                          <span>{statusInfo.badgeLabel}</span>
                        </span>
                      </td>

                      {/* Warehouse */}
                      <td className="py-3 px-3 text-xs text-slate-500 hidden sm:table-cell">
                        <span className="truncate max-w-[130px] inline-block" title={item.gudang}>
                          {item.gudang.replace(' [ ', ' - ').replace(' ]', '')}
                        </span>
                      </td>

                      {/* Copy Action Button */}
                      <td className="py-3 px-3 text-right">
                        <button
                          id={`btn-copy-${item.id}`}
                          onClick={() => handleCopyProductName(item)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                            isCopied
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                              : 'bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600'
                          }`}
                          title="Salin nama produk ini ke clipboard"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin Nama</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= COMPACT CARDS GRID VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map((item) => {
            const statusInfo = getStockStatusInfo(item.saldo);
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between gap-3 transition-all hover:shadow-md ${statusInfo.rowHighlight}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-black bg-slate-100 text-slate-800 border border-slate-200">
                      {item.merek}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border ${statusInfo.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
                      <span>{statusInfo.badgeLabel}</span>
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    {item.nama}
                  </h4>

                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded text-[10px] text-slate-600 border border-slate-200">
                      {item.kode}
                    </span>
                    <span className="truncate text-[11px]">
                      📍 {item.gudang.replace(' [ ', ' ').replace(' ]', '')}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Saldo: <strong>{item.saldo.toFixed(0)} Unit</strong>
                  </span>

                  <button
                    id={`btn-copy-card-${item.id}`}
                    onClick={() => handleCopyProductName(item)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                      isCopied
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                        : 'bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Nama</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= IMPORT / UPDATE MODAL (VIA BODY PORTAL) ================= */}
      {showImportModal && typeof document !== 'undefined' && createPortal(
        <div
          id="modal-import-backdrop"
          className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowImportModal(false);
          }}
        >
          <div
            id="modal-import-card"
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 my-auto relative animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    Import / Perbarui Data Stok dari Teks PDF
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Parser otomatis memisahkan desimal saldo di ujung baris dari nama produk &amp; model angka.
                  </p>
                </div>
              </div>
              <button
                id="btn-close-modal"
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-colors cursor-pointer"
                title="Tutup Modal (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Laporan PDF
                  </label>
                  <input
                    id="input-import-date"
                    type="text"
                    value={importDate}
                    onChange={(e) => setImportDate(e.target.value)}
                    placeholder="Contoh: 05/08/2026"
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl outline-none focus:border-indigo-600 bg-slate-50/50 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mode Import Database
                  </label>
                  <select
                    id="select-import-mode"
                    value={importMode}
                    onChange={(e) => setImportMode(e.target.value as 'replace' | 'append')}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl outline-none focus:border-indigo-600 bg-white cursor-pointer"
                  >
                    <option value="replace">Gantikan Seluruh Data Stok (Rekomendasi)</option>
                    <option value="append">Gabungkan / Tambahkan ke Data yang Ada</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Tempel Teks Laporan PDF di Sini:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setImportRawText(SAMPLE_PDF_SNIPPET)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" /> Contoh RSA &amp; Polytron
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setImportRawText(`Saldo Persediaan Per Tanggal 05/08/2026
Gudang : GB001 [ BELAKANG ]
PHILIPS [PS00023]PHILIPS SETRIKA HD 1172 CLASSIC ABU-ABU 14.00
PHILIPS [PB00012]PHILIPS BLENDER HR 2221 /00 2L PLASTIK 12.00
RINNAI [RK00007]RINNAI KOMPOR GAS RI-522 C 2 TUNGKU 48.00
QUANTUM [QK00001]QUANTUM KOMPOR GAS QGC-201 DMPC 22.00
AQUA [AF00042]AQUA FREEZER AQF 260 DS 200 LITER 1.00`)
                      }
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3 h-3" /> Contoh Elektronik
                    </button>
                  </div>
                </div>
                <textarea
                  id="textarea-import-pdf"
                  value={importRawText}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setImportRawText(e.target.value)}
                  placeholder="Tempel teks laporan PDF di sini... Contoh:
POLYTRON [PT00189]POLYTRON TV LED 32TC1865 + SPK 2.00
RSA [RF00009]RSA FREEZER BOX CF 110 1.00
RSA [RF00008]RSA FREEZER BOX CF 1200 1.00
PHILIPS [PS00023]PHILIPS SETRIKA HD 1172 CLASSIC ABU-ABU 14.00"
                  rows={8}
                  className="w-full p-3 font-mono text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-indigo-600 focus:bg-white resize-none shadow-inner leading-relaxed"
                />
              </div>

              {/* Live Preview of parsed items */}
              {livePreview && livePreview.items.length > 0 && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="text-emerald-700 flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Terdeteksi {livePreview.items.length} Produk Siap Diimpor
                    </span>
                    <span className="text-slate-500 font-mono text-[11px] bg-slate-200/80 px-2 py-0.5 rounded">
                      Gudang: {livePreview.items[0]?.gudang || 'GB001'}
                    </span>
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1.5 divide-y divide-slate-200/70 text-xs pr-1">
                    {livePreview.items.slice(0, 5).map((it, idx) => (
                      <div key={idx} className="pt-1.5 flex items-center justify-between gap-2">
                        <div className="truncate font-medium text-slate-800">
                          <span className="font-bold text-indigo-700 mr-1">[{it.merek}]</span>
                          {it.nama}
                        </div>
                        <div className="shrink-0 font-bold">
                          {it.saldo > 1 ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Stok: {it.saldo} Unit
                            </span>
                          ) : it.saldo === 1 ? (
                            <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                              1 Unit (Kritis)
                            </span>
                          ) : (
                            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              Kosong
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {livePreview.items.length > 5 && (
                      <div className="text-[11px] text-slate-500 pt-1 text-center font-medium">
                        + {livePreview.items.length - 5} produk lainnya terdeteksi...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {importStatusMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-bold ${
                    importStatusMessage.startsWith('✅')
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {importStatusMessage}
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
              <button
                id="btn-cancel-import"
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-submit-import"
                type="button"
                onClick={handleParseCustomText}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Proses &amp; Simpan Data</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
