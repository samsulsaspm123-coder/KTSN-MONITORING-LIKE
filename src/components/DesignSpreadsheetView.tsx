import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Check,
  Zap,
  Globe,
  SlidersHorizontal,
  Download,
  Upload,
  Calendar,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck,
  CheckCircle2,
  X,
  Settings
} from 'lucide-react';
import {
  SheetWeekRow,
  SheetDaySchedule,
  DAYS_OF_WEEK,
  INITIAL_SPREADSHEET_WEEKS,
  normalizeDateSlash,
  normalizeDateHyphen
} from '../data/spreadsheetMatrixData';
import {
  getProductColorStyle,
  PRODUCT_COLOR_PALETTE,
  ALL_CLEAN_CATEGORIES
} from '../data/productColorMap';

interface DesignSpreadsheetViewProps {
  weeks: SheetWeekRow[];
  onUpdateWeeks: (updatedWeeks: SheetWeekRow[]) => void;
  selectedDate: string; // e.g. "09/08/2026" or "09-08-2026"
  onSelectDate: (dateSlash: string, items: string[]) => void;
  onOpenSyncSettings: () => void;
  onSyncToCloud: () => Promise<void>;
  onSyncSingleDay?: (dateSlash: string, items: string[]) => Promise<boolean>;
  onPushAllWeeksToCloud?: () => Promise<boolean>;
  onPullFromCloud: () => Promise<void>;
  isSyncing: boolean;
  webAppUrl: string;
}

export function DesignSpreadsheetView({
  weeks,
  onUpdateWeeks,
  selectedDate,
  onSelectDate,
  onOpenSyncSettings,
  onSyncToCloud,
  onSyncSingleDay,
  onPushAllWeeksToCloud,
  onPullFromCloud,
  isSyncing,
  webAppUrl,
}: DesignSpreadsheetViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCell, setEditingCell] = useState<{ weekIndex: number; dayIndex: number } | null>(null);
  const [newProductInput, setNewProductInput] = useState('');
  const [activeSheetTab, setActiveSheetTab] = useState<'Sheet1' | 'Table 1'>('Sheet1');
  const [showColorLegend, setShowColorLegend] = useState(false);
  const [showTroubleshootHelp, setShowTroubleshootHelp] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const cleanSelectedDateSlash = useMemo(() => normalizeDateSlash(selectedDate), [selectedDate]);

  // Find currently selected day items
  const selectedDayData = useMemo(() => {
    for (const week of weeks) {
      for (const day of week.days) {
        if (normalizeDateSlash(day.date) === cleanSelectedDateSlash) {
          return day;
        }
      }
    }
    return null;
  }, [weeks, cleanSelectedDateSlash]);

  // Handle cell item removal
  const handleRemoveItem = (weekIndex: number, dayIndex: number, itemIndex: number) => {
    const updated = [...weeks];
    const targetDays = [...updated[weekIndex].days];
    const targetDay = { ...targetDays[dayIndex] };
    targetDay.items = targetDay.items.filter((_, i) => i !== itemIndex);
    targetDays[dayIndex] = targetDay;
    updated[weekIndex] = { ...updated[weekIndex], days: targetDays };
    onUpdateWeeks(updated);

    if (normalizeDateSlash(targetDay.date) === cleanSelectedDateSlash) {
      onSelectDate(targetDay.date, targetDay.items);
    }

    if (onSyncSingleDay && webAppUrl) {
      onSyncSingleDay(targetDay.date, targetDay.items);
    }
  };

  // Handle adding product to cell
  const handleAddItemToCell = (weekIndex: number, dayIndex: number, productToAdd: string) => {
    if (!productToAdd.trim()) return;
    const cleanProduct = productToAdd.trim().toUpperCase();

    const updated = [...weeks];
    const targetDays = [...updated[weekIndex].days];
    const targetDay = { ...targetDays[dayIndex] };
    targetDay.items = [...targetDay.items, cleanProduct];
    targetDays[dayIndex] = targetDay;
    updated[weekIndex] = { ...updated[weekIndex], days: targetDays };
    onUpdateWeeks(updated);

    if (normalizeDateSlash(targetDay.date) === cleanSelectedDateSlash) {
      onSelectDate(targetDay.date, targetDay.items);
    }

    if (onSyncSingleDay && webAppUrl) {
      onSyncSingleDay(targetDay.date, targetDay.items);
    }
    setNewProductInput('');
  };

  // Handle adding a new week row
  const handleAddNewWeek = () => {
    const lastWeek = weeks[weeks.length - 1];
    let nextStart = new Date();
    if (lastWeek && lastWeek.days.length > 0) {
      const lastDateParts = lastWeek.days[lastWeek.days.length - 1].date.split('/');
      if (lastDateParts.length === 3) {
        const lastD = new Date(parseInt(lastDateParts[2], 10), parseInt(lastDateParts[1], 10) - 1, parseInt(lastDateParts[0], 10));
        nextStart = new Date(lastD);
        nextStart.setDate(nextStart.getDate() + 1);
      }
    }

    const newDays: SheetDaySchedule[] = DAYS_OF_WEEK.map((dayName, idx) => {
      const d = new Date(nextStart);
      d.setDate(d.getDate() + idx);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const isSun = idx === 6;

      return {
        date: `${dd}/${mm}/${yyyy}`,
        dayName: dayName,
        dayIndex: idx,
        items: isSun ? ['B2 PROMO KREDIT', 'SEPEDA LISTRIK', 'KULKAS'] : ['TV', 'MESIN CUCI', 'AC'],
      };
    });

    const newWeekRow: SheetWeekRow = {
      weekId: `week-${Date.now()}`,
      weekLabel: `${newDays[0].date} - ${newDays[6].date}`,
      days: newDays,
    };

    onUpdateWeeks([...weeks, newWeekRow]);
  };

  const handleTriggerSync = async () => {
    try {
      if (onSyncSingleDay && selectedDayData) {
        const ok = await onSyncSingleDay(cleanSelectedDateSlash, selectedDayData.items || []);
        if (ok) {
          setSyncFeedback(`Jadwal ${cleanSelectedDateSlash} berhasil ditimpa ke Google Sheets!`);
        } else {
          setSyncFeedback('Gagal sync. Periksa URL Web App.');
        }
      } else {
        await onSyncToCloud();
        setSyncFeedback('Berhasil disinkronkan ke Spreadsheet Google!');
      }
      setTimeout(() => setSyncFeedback(null), 3000);
    } catch (err) {
      setSyncFeedback('Gagal sync. Periksa URL Web App.');
      setTimeout(() => setSyncFeedback(null), 3000);
    }
  };

  const handleTriggerPull = async () => {
    try {
      await onPullFromCloud();
      setSyncFeedback('Data terbaru ditarik dari Spreadsheet!');
      setTimeout(() => setSyncFeedback(null), 3000);
    } catch (err) {
      setSyncFeedback('Gagal menarik data dari Google Sheets.');
      setTimeout(() => setSyncFeedback(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden space-y-0">
      
      {/* ========================================================= */}
      {/* 1. SPREADSHEET WINDOW TITLEBAR (EXACT REPLICA STYLE)      */}
      {/* ========================================================= */}
      <div className="bg-[#0f766e] text-white p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-teal-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Spreadsheet - ELEKTRONIK (1)</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-[10px] font-black uppercase">
                Google Sheets Grid
              </span>
            </div>
            <p className="text-xs text-teal-100/90 flex items-center gap-2 mt-0.5">
              <span>Matriks Desain 7 Hari per Minggu</span>
              <span>&bull;</span>
              <span className="text-amber-200 font-bold">Sinkronisasi Realtime Produk</span>
            </p>
          </div>
        </div>

        {/* Top Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
          {webAppUrl ? (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Realtime Sync Aktif</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenSyncSettings}
              className="px-2.5 py-1 rounded-lg bg-amber-500/30 text-amber-200 border border-amber-400/40 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer hover:bg-amber-500/40 transition-colors"
            >
              <Zap className="w-3 h-3 text-amber-300" />
              <span>Hubungkan ke Google Sheets</span>
            </button>
          )}

          {onPushAllWeeksToCloud && (
            <button
              type="button"
              onClick={async () => {
                const ok = await onPushAllWeeksToCloud();
                if (ok) {
                  setSyncFeedback('Seluruh 6 Minggu terkirim ke Google Sheets!');
                  setTimeout(() => setSyncFeedback(null), 3500);
                }
              }}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all disabled:opacity-50"
              title="Kirim dan isi seluruh jadwal 6 minggu lengkap dengan warna ke Google Sheets"
            >
              <Upload className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span>{isSyncing ? 'Mengirim...' : '🚀 Push Seluruh 6 Minggu'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
            title={`Timpa item desain tanggal ${cleanSelectedDateSlash} langsung ke Google Sheets tanpa membuat duplikat`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : `⚡ Sync Tgl (${cleanSelectedDateSlash})`}</span>
          </button>

          <button
            type="button"
            onClick={onOpenSyncSettings}
            title="Pengaturan Google Apps Script"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors border border-white/20"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TROUBLESHOOTING / HELP BANNER */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-bold">
            Data belum muncul di Google Sheets Anda?
          </span>
          <span className="text-amber-800 hidden md:inline">
            Gunakan tombol <strong>&quot;🚀 Push Seluruh 6 Minggu&quot;</strong> atau jalankan fungsi <code>setupFullElectronicSchedule</code> di Apps Script.
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowTroubleshootHelp(!showTroubleshootHelp)}
          className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-black text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{showTroubleshootHelp ? 'Tutup Panduan' : '💡 Lihat Cara Mengisi Tabel (1-Klik)'}</span>
          {showTroubleshootHelp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* EXPANDABLE TROUBLESHOOTING DRAWER */}
      <AnimatePresence>
        {showTroubleshootHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900 text-slate-100 p-5 border-b border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-black text-white">
                  Panduan: 2 Cara Mengisi Seluruh Jadwal &amp; Warna Produk ke Google Sheets
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowTroubleshootHelp(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Cara 1: Langsung dari Apps Script (Paling Cepat & Instan) */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 font-black">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-[10px]">1</span>
                  <span>CARA 1: Jalankan Fungsi di Apps Script (Instan)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Di tab Google Spreadsheet Anda, buka menu <strong>Ekstensi &gt; Apps Script</strong>.
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                  <li>Buka tab <strong>Pengaturan Sync &gt; Script Google Apps Script</strong> di aplikasi ini, lalu klik <strong>Salin Script</strong>.</li>
                  <li>Tempelkan ke file <code>Code.gs</code> di Google Sheets Anda.</li>
                  <li>Di dropdown pilihan fungsi (sebelah tombol Debug), pilih <strong><code>setupFullElectronicSchedule</code></strong>.</li>
                  <li>Klik tombol <strong>▶️ Jalankan (Run)</strong>.</li>
                </ol>
                <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-[11px]">
                  ✨ Hasil: Seluruh matriks 6 minggu, tanggal baris hitam, dan warna tiap produk langsung terisi otomatis!
                </div>
              </div>

              {/* Cara 2: Push via Web App URL */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2.5">
                <div className="flex items-center gap-2 text-cyan-400 font-black">
                  <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-[10px]">2</span>
                  <span>CARA 2: Push Lewat Web App API</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Jika sudah men-deploy Web App di Apps Script:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                  <li>Klik <strong>Deploy &gt; New deployment &gt; Web app</strong> (Access: <strong>Anyone</strong>).</li>
                  <li>Salin URL Web App dan masukkan ke <strong>Pengaturan Sync</strong> di web ini.</li>
                  <li>Klik tombol <strong>&quot;🚀 Push Seluruh 6 Minggu&quot;</strong> di toolbar atas.</li>
                </ol>
                <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold text-[11px]">
                  🔄 Setiap Anda mengedit tabel di web ini, perubahan akan otomatis tersinkronisasi realtime ke spreadsheet!
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onOpenSyncSettings}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Buka Pengaturan Apps Script &amp; Salin Kode &rarr;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SPREADSHEET NOTIFICATION CYAN BANNER (MATCHING SCREENSHOT) */}
      <div className="bg-[#00e5ff] text-slate-950 font-black px-4 py-2 text-xs sm:text-sm flex items-center justify-between shadow-xs border-b border-cyan-400">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-900" />
          <span>
            DAFTAR DESAIN AKTIF: {cleanSelectedDateSlash ? `TANGGAL ${normalizeDateHyphen(cleanSelectedDateSlash)}` : 'SEMUA TANGGAL'}
          </span>
          {selectedDayData && (
            <span className="hidden sm:inline font-normal text-slate-900 text-xs">
              ({selectedDayData.items.join(', ')})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowColorLegend(!showColorLegend)}
            className="px-2.5 py-0.5 rounded-md bg-black/15 hover:bg-black/25 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Katalog Warna Produk</span>
            {showColorLegend ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* PRODUCT COLOR PALETTE CATALOG (COLLAPSIBLE) */}
      <AnimatePresence>
        {showColorLegend && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900 text-white p-4 border-b border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Pewarnaan Sel Spreadsheet Otomatis Sesuai Produk:
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {Object.keys(PRODUCT_COLOR_PALETTE).length} Warna Unik
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {Object.entries(PRODUCT_COLOR_PALETTE).map(([name, style]) => (
                <div
                  key={name}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between gap-1.5 shadow-2xs ${style.tailwindBg} ${style.tailwindText}`}
                >
                  <span className="truncate">{name}</span>
                  <span className="text-[9px] font-mono opacity-80 shrink-0">{style.bgHex}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH & CONTROLS SUB-BAR */}
      <div className="bg-slate-50 p-3 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
            placeholder="CARI PRODUK (MISAL: KULKAS, SEPEDA)..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {syncFeedback && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 animate-fadeIn">
              {syncFeedback}
            </span>
          )}

          <button
            type="button"
            onClick={handleAddNewWeek}
            className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Baris Minggu</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SPREADSHEET 7-COLUMN MATRIX TABLE                      */}
      {/* ========================================================= */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs select-none">
          {/* Day of Week Column Headers (SENIN - MINGGU) */}
          <thead>
            <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
              <th className="w-10 p-2 border-r border-slate-300 text-center font-mono text-[10px] text-slate-500">
                #
              </th>
              {DAYS_OF_WEEK.map((dayName) => (
                <th
                  key={dayName}
                  className="p-2.5 sm:p-3 border-r border-slate-300 text-center font-black tracking-wider uppercase min-w-[130px] sm:min-w-[150px] last:border-r-0"
                >
                  {dayName}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {weeks.map((week, weekIdx) => {
              // Calculate max rows in this week for balanced cell heights
              const maxItemsInDay = Math.max(
                4,
                ...week.days.map((d) => d.items.length)
              );

              return (
                <React.Fragment key={week.weekId || weekIdx}>
                  {/* DATE HEADER ROW (BLACK BAR WITH BOLD DATES) */}
                  <tr className="bg-black text-white font-bold border-t-2 border-slate-900">
                    <td className="p-2 border-r border-slate-800 text-center font-mono text-[10px] text-slate-400 bg-slate-900">
                      {102 + weekIdx * 6}
                    </td>
                    {week.days.map((day, dayIdx) => {
                      const isSelected = normalizeDateSlash(day.date) === cleanSelectedDateSlash;

                      return (
                        <td
                          key={dayIdx}
                          onClick={() => onSelectDate(day.date, day.items)}
                          className={`p-2 border-r border-slate-800 text-center font-mono font-bold cursor-pointer transition-colors relative group ${
                            isSelected
                              ? 'bg-emerald-800 text-white ring-2 ring-emerald-400 font-black'
                              : 'hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <span>{day.date}</span>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* PRODUCT ITEM ROWS UNDER THE DATES */}
                  {Array.from({ length: maxItemsInDay }).map((_, itemRowIdx) => (
                    <tr
                      key={itemRowIdx}
                      className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="p-1 border-r border-slate-200 text-center font-mono text-[10px] text-slate-400 bg-slate-50">
                        {103 + weekIdx * 6 + itemRowIdx}
                      </td>

                      {week.days.map((day, dayIdx) => {
                        const item = day.items[itemRowIdx];
                        const isSelectedDay = normalizeDateSlash(day.date) === cleanSelectedDateSlash;
                        const isEditingThis = editingCell?.weekIndex === weekIdx && editingCell?.dayIndex === dayIdx;
                        const matchesSearch = searchQuery && item && item.toUpperCase().includes(searchQuery);

                        if (!item) {
                          // Empty slot in cell
                          return (
                            <td
                              key={dayIdx}
                              onClick={() => {
                                onSelectDate(day.date, day.items);
                                setEditingCell({ weekIndex: weekIdx, dayIndex: dayIdx });
                              }}
                              className={`p-1.5 border-r border-slate-200 text-center align-middle cursor-pointer ${
                                isSelectedDay ? 'bg-emerald-50/30' : ''
                              }`}
                            >
                              <div className="h-6 flex items-center justify-center text-slate-300 hover:text-slate-500 transition-colors">
                                <span className="text-[10px] font-mono opacity-0 hover:opacity-100">+ Tambah</span>
                              </div>
                            </td>
                          );
                        }

                        const colorStyle = getProductColorStyle(item);

                        return (
                          <td
                            key={dayIdx}
                            onClick={() => onSelectDate(day.date, day.items)}
                            className={`p-1 border-r border-slate-200 align-middle transition-all cursor-pointer relative group ${
                              isSelectedDay ? 'ring-1 ring-inset ring-emerald-400' : ''
                            } ${matchesSearch ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}
                          >
                            <div
                              className={`px-2 py-1 rounded text-center text-xs font-bold uppercase tracking-tight flex items-center justify-between gap-1 shadow-2xs transition-transform group-hover:scale-[1.02] ${colorStyle.tailwindBg} ${colorStyle.tailwindText}`}
                            >
                              <span className="truncate flex-1 text-center font-bold">
                                {item}
                              </span>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveItem(weekIdx, dayIdx, itemRowIdx);
                                }}
                                title="Hapus item dari sel"
                                className="opacity-0 group-hover:opacity-100 hover:bg-black/20 rounded p-0.5 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SPREADSHEET BOTTOM TAB BAR (MATCHING GOOGLE SHEETS) */}
      <div className="bg-slate-100 border-t border-slate-300 px-4 py-2 flex items-center justify-between text-xs font-bold text-slate-700">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveSheetTab('Sheet1')}
            className={`px-4 py-1 rounded-t-lg cursor-pointer transition-colors border-t-2 ${
              activeSheetTab === 'Sheet1'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            Sheet1 (ELEKTRONIK)
          </button>
          <button
            type="button"
            onClick={() => setActiveSheetTab('Table 1')}
            className={`px-4 py-1 rounded-t-lg cursor-pointer transition-colors border-t-2 ${
              activeSheetTab === 'Table 1'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            Table 1
          </button>
        </div>

        <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
          <span>Total {weeks.length} Minggu ({weeks.length * 7} Hari)</span>
          <span>&bull;</span>
          <span className="text-emerald-700 font-bold">Auto-Color Formatting Ready</span>
        </div>
      </div>

      {/* QUICK INLINE PRODUCT ADDER MODAL / DRAWER IF CELL CLICKED */}
      {editingCell && (
        <div className="p-4 bg-purple-50 border-t border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-purple-950 uppercase">
              Tambah Produk ke {weeks[editingCell.weekIndex]?.days[editingCell.dayIndex]?.dayName} ({weeks[editingCell.weekIndex]?.days[editingCell.dayIndex]?.date}):
            </span>

            <div className="flex flex-wrap gap-1">
              {['KULKAS', 'SEPEDA LISTRIK', 'LAPTOP', 'MESIN CUCI', 'TV', 'AC', 'B2 PROMO KREDIT', 'MAGIC COM', 'BLENDER', 'OVEN', 'LIBUR'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleAddItemToCell(editingCell.weekIndex, editingCell.dayIndex, p)}
                  className="px-2 py-0.5 rounded text-[11px] font-bold bg-white text-slate-800 hover:bg-purple-600 hover:text-white border border-purple-200 transition-colors shadow-2xs cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={newProductInput}
              onChange={(e) => setNewProductInput(e.target.value.toUpperCase())}
              placeholder="PRODUK LAINNYA..."
              className="bg-white border border-purple-300 rounded-lg px-2.5 py-1 text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1 sm:w-36"
            />
            <button
              type="button"
              onClick={() => {
                handleAddItemToCell(editingCell.weekIndex, editingCell.dayIndex, newProductInput);
              }}
              className="px-3 py-1 rounded-lg bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 cursor-pointer shadow-xs"
            >
              Tambah
            </button>
            <button
              type="button"
              onClick={() => setEditingCell(null)}
              className="p-1 text-purple-700 hover:text-purple-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
