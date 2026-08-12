import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  Calendar,
  Search,
  Plus,
  RefreshCw,
  Settings,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Upload,
  Zap,
  Info,
  CheckCircle2,
  Trash2,
  Clock,
  Filter,
  Eye
} from 'lucide-react';
import {
  SheetWeekRow,
  SheetDaySchedule,
  DAYS_OF_WEEK,
  normalizeDateSlash,
  normalizeDateHyphen,
  parseDateString,
} from '../data/spreadsheetMatrixData';
import { getProductColorStyle, PRODUCT_COLOR_PALETTE } from '../data/productColorMap';

interface DesignSpreadsheetViewProps {
  weeks: SheetWeekRow[];
  onUpdateWeeks: (updatedWeeks: SheetWeekRow[]) => void;
  selectedDateSlash?: string;
  onSelectDate: (dateSlash: string, items: string[]) => void;
  onOpenSyncSettings: () => void;
  webAppUrl?: string;
  isSyncing?: boolean;
  realtimeSyncStatus?: 'idle' | 'syncing' | 'synced' | 'error';
  onSyncToCloud?: () => Promise<boolean>;
  onPullFromCloud?: () => Promise<void>;
  onSyncSingleDay?: (targetDateSlash: string, items: string[]) => Promise<boolean>;
  onPushAllWeeksToCloud?: () => Promise<boolean>;
  compactMode?: boolean;
}

export function DesignSpreadsheetView({
  weeks,
  onUpdateWeeks,
  selectedDateSlash = '',
  onSelectDate,
  onOpenSyncSettings,
  webAppUrl = '',
  isSyncing = false,
  realtimeSyncStatus = 'idle',
  onSyncSingleDay,
  onPushAllWeeksToCloud,
  compactMode = false,
}: DesignSpreadsheetViewProps) {
  const [activeSheetTab, setActiveSheetTab] = useState<'Sheet1' | 'Monitor'>('Sheet1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showColorLegend, setShowColorLegend] = useState<boolean>(false);
  const [showTroubleshootHelp, setShowTroubleshootHelp] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Monitor tab filter
  const [monitorFilter, setMonitorFilter] = useState<'all' | 'recent7' | 'thisMonth'>('recent7');

  // Cell quick addition state
  const [editingCell, setEditingCell] = useState<{ weekIndex: number; dayIndex: number } | null>(null);
  const [newProductInput, setNewProductInput] = useState<string>('');

  const cleanSelectedDateSlash = normalizeDateSlash(selectedDateSlash);

  // Find currently selected day in matrix
  const selectedDayData = useMemo(() => {
    if (!cleanSelectedDateSlash) return null;
    for (const week of weeks) {
      for (const day of week.days) {
        if (normalizeDateSlash(day.date) === cleanSelectedDateSlash) {
          return day;
        }
      }
    }
    return null;
  }, [weeks, cleanSelectedDateSlash]);

  // Flattened array of all days for the past days monitor
  const allDaysList = useMemo(() => {
    const list: {
      date: string;
      dayName: string;
      items: string[];
      weekLabel: string;
      rawDate: Date | null;
      isToday: boolean;
      isSelected: boolean;
    }[] = [];

    const todayStr = normalizeDateSlash(
      `${String(new Date().getDate()).padStart(2, '0')}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`
    );

    weeks.forEach((w) => {
      w.days.forEach((d) => {
        const norm = normalizeDateSlash(d.date);
        list.push({
          date: norm,
          dayName: d.dayName,
          items: d.items || [],
          weekLabel: w.weekLabel,
          rawDate: parseDateString(norm),
          isToday: norm === todayStr,
          isSelected: norm === cleanSelectedDateSlash,
        });
      });
    });

    return list;
  }, [weeks, cleanSelectedDateSlash]);

  // Filtered days list for "Pantau Hari Kemaren"
  const filteredMonitorDays = useMemo(() => {
    let result = [...allDaysList];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toUpperCase();
      result = result.filter(
        (d) =>
          d.date.includes(q) ||
          d.dayName.includes(q) ||
          d.items.some((it) => it.toUpperCase().includes(q))
      );
    }

    if (monitorFilter === 'recent7') {
      return result.slice(-14).reverse();
    }
    if (monitorFilter === 'thisMonth') {
      const curMonth = new Date().getMonth() + 1;
      return result.filter((d) => d.rawDate && d.rawDate.getMonth() + 1 === curMonth).reverse();
    }

    return result.reverse();
  }, [allDaysList, searchQuery, monitorFilter]);

  // Quick remove item from cell
  const handleRemoveItem = (weekIndex: number, dayIndex: number, itemIndex: number) => {
    const updatedWeeks = [...weeks];
    const targetDay = updatedWeeks[weekIndex]?.days[dayIndex];
    if (!targetDay) return;

    const newItems = targetDay.items.filter((_, idx) => idx !== itemIndex);
    updatedWeeks[weekIndex].days[dayIndex] = {
      ...targetDay,
      items: newItems,
    };
    onUpdateWeeks(updatedWeeks);
    onSelectDate(targetDay.date, newItems);

    if (onSyncSingleDay && webAppUrl) {
      onSyncSingleDay(targetDay.date, newItems);
    }
  };

  // Quick add item to cell
  const handleAddItemToCell = (weekIndex: number, dayIndex: number, product: string) => {
    const cleanProduct = product.trim().toUpperCase();
    if (!cleanProduct) return;

    const updatedWeeks = [...weeks];
    const targetDay = updatedWeeks[weekIndex]?.days[dayIndex];
    if (!targetDay) return;

    const newItems = [...targetDay.items, cleanProduct];
    updatedWeeks[weekIndex].days[dayIndex] = {
      ...targetDay,
      items: newItems,
    };
    onUpdateWeeks(updatedWeeks);
    onSelectDate(targetDay.date, newItems);
    setNewProductInput('');

    if (onSyncSingleDay && webAppUrl) {
      onSyncSingleDay(targetDay.date, newItems);
    }
  };

  // Add new blank week row
  const handleAddNewWeek = () => {
    let nextStart = new Date();
    if (weeks.length > 0) {
      const lastWeek = weeks[weeks.length - 1];
      const lastDay = lastWeek.days[lastWeek.days.length - 1];
      const lastDateParts = lastDay.date.split('/');
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
    setSyncFeedback('Baris Minggu Baru ditambahkan ke tabel!');
    setTimeout(() => setSyncFeedback(null), 3000);
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
      } else if (onPushAllWeeksToCloud) {
        await onPushAllWeeksToCloud();
        setSyncFeedback('Berhasil disinkronkan ke Spreadsheet Google!');
      }
      setTimeout(() => setSyncFeedback(null), 3000);
    } catch {
      setSyncFeedback('Gagal sync. Periksa URL Web App.');
      setTimeout(() => setSyncFeedback(null), 3000);
    }
  };

  const handleTriggerCleanDuplicates = async () => {
    if (!webAppUrl || !webAppUrl.trim().startsWith('http')) {
      onOpenSyncSettings();
      return;
    }
    try {
      setSyncFeedback('Membersihkan duplikat di Google Sheets...');
      const res = await fetch(webAppUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'cleanDuplicates' }),
      });
      if (res.ok) {
        setSyncFeedback('🧹 Baris duplikat berhasil dibersihkan di Google Sheets!');
      } else {
        setSyncFeedback('Gagal membersihkan duplikat. Deploy ulang Apps Script.');
      }
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch {
      setSyncFeedback('Gagal menghubungi Google Sheets.');
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
                Grid 7 Kolom (Senin-Minggu)
              </span>
            </div>
            {!compactMode && (
              <p className="text-xs text-teal-100/90 flex items-center gap-2 mt-0.5">
                <span>Matriks Desain Horizontal Kesamping</span>
                <span>&bull;</span>
                <span className="text-amber-200 font-bold">Anti-Duplikat &amp; Warna Produk Otomatis</span>
              </p>
            )}
          </div>
        </div>

        {/* Top Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
          {webAppUrl ? (
            <span
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition-colors ${
                realtimeSyncStatus === 'syncing'
                  ? 'bg-amber-950/70 text-amber-300 border-amber-500/50'
                  : realtimeSyncStatus === 'synced'
                  ? 'bg-emerald-900/80 text-emerald-200 border-emerald-400'
                  : realtimeSyncStatus === 'error'
                  ? 'bg-rose-950/70 text-rose-300 border-rose-500/50'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  realtimeSyncStatus === 'syncing'
                    ? 'bg-amber-400 animate-spin'
                    : realtimeSyncStatus === 'synced'
                    ? 'bg-emerald-400'
                    : realtimeSyncStatus === 'error'
                    ? 'bg-rose-400'
                    : 'bg-emerald-400 animate-pulse'
                }`}
              />
              <span>
                {realtimeSyncStatus === 'syncing'
                  ? '⚡ Menyinkronkan ke Google Sheets...'
                  : realtimeSyncStatus === 'synced'
                  ? '✅ Google Sheets Tersinkron'
                  : realtimeSyncStatus === 'error'
                  ? '⚠️ Gagal Sync (Periksa URL)'
                  : '⚡ Realtime Sync Aktif'}
              </span>
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
                  setSyncFeedback('🧹 Seluruh matriks tersinkron 100% rapi ke Google Sheets!');
                  setTimeout(() => setSyncFeedback(null), 3500);
                }
              }}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-teal-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all disabled:opacity-50"
              title="Samakan seluruh matriks dan perbaiki format Google Sheets agar 100% persis antarmuka"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span>{isSyncing ? 'Mengirim...' : '🧹 1-Klik Samakan Total ke Sheets'}</span>
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
            <span>{isSyncing ? 'Menyinkronkan...' : `⚡ Sync Tgl (${cleanSelectedDateSlash || 'Hari Ini'})`}</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerCleanDuplicates}
            title="Bersihkan baris tanggal duplikat di Google Sheets (Auto-Fix)"
            className="px-2.5 py-1.5 rounded-xl bg-teal-900/80 hover:bg-teal-900 text-teal-200 border border-teal-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Rapikan Duplikat</span>
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

      {/* SPREADSHEET NOTIFICATION CYAN BANNER (MATCHING SCREENSHOT) */}
      <div className="bg-[#00e5ff] text-slate-950 font-black px-4 py-2 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs border-b border-cyan-400">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-4 h-4 text-slate-900 shrink-0" />
          <span>
            DAFTAR DESAIN AKTIF: {cleanSelectedDateSlash ? `TANGGAL ${normalizeDateHyphen(cleanSelectedDateSlash)}` : 'SEMUA TANGGAL'}
          </span>
          {selectedDayData && (
            <span className="font-normal text-slate-900 text-xs bg-cyan-300/60 px-2 py-0.5 rounded border border-cyan-500/30">
              ({selectedDayData.items.join(', ') || 'Belum ada item'})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Tab Switch: Grid View vs Pantauan Hari Kemarin */}
          <div className="bg-slate-900/10 p-0.5 rounded-lg flex items-center text-xs">
            <button
              type="button"
              onClick={() => setActiveSheetTab('Sheet1')}
              className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors font-bold ${
                activeSheetTab === 'Sheet1' ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-800 hover:text-black'
              }`}
            >
              📊 Grid Spreadsheet (7 Kolom)
            </button>
            <button
              type="button"
              onClick={() => setActiveSheetTab('Monitor')}
              className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors font-bold flex items-center gap-1 ${
                activeSheetTab === 'Monitor' ? 'bg-white text-slate-950 shadow-2xs' : 'text-slate-800 hover:text-black'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-800" />
              <span>🗓️ Pantau Desain Harian</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowColorLegend(!showColorLegend)}
            className="px-2.5 py-1 rounded-md bg-black/15 hover:bg-black/25 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Katalog Warna</span>
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
                Pewarnaan Sel Spreadsheet Otomatis Sesuai Produk (Google Sheets &amp; Web):
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

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {syncFeedback && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 animate-fadeIn">
              {syncFeedback}
            </span>
          )}

          {activeSheetTab === 'Monitor' && (
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMonitorFilter('recent7')}
                className={`px-2 py-1 rounded-lg cursor-pointer ${
                  monitorFilter === 'recent7' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-black'
                }`}
              >
                14 Hari Terakhir
              </button>
              <button
                type="button"
                onClick={() => setMonitorFilter('thisMonth')}
                className={`px-2 py-1 rounded-lg cursor-pointer ${
                  monitorFilter === 'thisMonth' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-black'
                }`}
              >
                Bulan Ini
              </button>
              <button
                type="button"
                onClick={() => setMonitorFilter('all')}
                className={`px-2 py-1 rounded-lg cursor-pointer ${
                  monitorFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-black'
                }`}
              >
                Semua
              </button>
            </div>
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
      {activeSheetTab === 'Sheet1' ? (
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
                    className="p-2.5 sm:p-3 border-r border-slate-300 text-center font-black tracking-wider uppercase min-w-[135px] sm:min-w-[150px] last:border-r-0"
                  >
                    {dayName}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {weeks.map((week, weekIdx) => {
                const maxItemsInDay = Math.max(
                  4,
                  ...week.days.map((d) => d.items.length)
                );

                return (
                  <React.Fragment key={week.weekId || weekIdx}>
                    {/* DATE HEADER ROW (BLACK BAR WITH BOLD DATES) */}
                    <tr className="bg-black text-white font-bold border-t-2 border-slate-900">
                      <td className="p-2 border-r border-slate-800 text-center font-mono text-[10px] text-slate-400 bg-slate-900">
                        {2 + weekIdx * 5}
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
                            title={`Klik untuk pilih & timpa jadwal tanggal ${day.date}`}
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
                          {3 + weekIdx * 5 + itemRowIdx}
                        </td>

                        {week.days.map((day, dayIdx) => {
                          const item = day.items[itemRowIdx];
                          const isSelectedDay = normalizeDateSlash(day.date) === cleanSelectedDateSlash;
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
      ) : (
        /* ========================================================= */
        /* 3. MONITOR HARIAN (PANTAU DESAIN HARI-HARI KEMAREN)       */
        /* ========================================================= */
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Pantau Riwayat Desain Harian (Hari-Hari Kemarin)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Pantau apa saja yang sudah kamu desain di hari-hari sebelumnya lengkap dengan kode warna resmi.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              Menampilkan {filteredMonitorDays.length} Hari
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredMonitorDays.map((day) => (
              <div
                key={day.date}
                onClick={() => onSelectDate(day.date, day.items)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                  day.isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-400'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-black text-white text-[11px] font-mono font-bold">
                      {day.date}
                    </span>
                    <span className="text-xs font-black text-slate-700">
                      {day.dayName}
                    </span>
                  </div>
                  {day.isToday && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                      Hari Ini
                    </span>
                  )}
                </div>

                {/* Color chips of designed items */}
                <div className="space-y-1.5">
                  {day.items.length > 0 ? (
                    day.items.map((item, idx) => {
                      const colorStyle = getProductColorStyle(item);
                      return (
                        <div
                          key={idx}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center justify-between gap-2 shadow-2xs ${colorStyle.tailwindBg} ${colorStyle.tailwindText}`}
                        >
                          <span className="truncate">{item}</span>
                          <span className="text-[9px] font-mono opacity-80 shrink-0">
                            {colorStyle.bgHex}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium text-center">
                      Tidak ada item desain
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{day.items.length} Desain</span>
                  <span className="text-emerald-600 font-bold hover:underline">
                    {day.isSelected ? 'Sedang Dipilih' : 'Klik untuk Muat &rarr;'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            onClick={() => setActiveSheetTab('Monitor')}
            className={`px-4 py-1 rounded-t-lg cursor-pointer transition-colors border-t-2 flex items-center gap-1.5 ${
              activeSheetTab === 'Monitor'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pantau Riwayat Desain</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
          <span>Total {weeks.length} Minggu ({weeks.length * 7} Hari)</span>
          <span>&bull;</span>
          <span className="text-emerald-700 font-bold">Auto-Color Formatting Ready</span>
        </div>
      </div>

      {/* QUICK INLINE PRODUCT ADDER DRAWER IF CELL CLICKED */}
      {editingCell && (
        <div className="p-4 bg-purple-50 border-t border-purple-200 flex flex-col items-start gap-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-purple-950 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                Tambah / Edit Produk {weeks[editingCell.weekIndex]?.days[editingCell.dayIndex]?.dayName} ({weeks[editingCell.weekIndex]?.days[editingCell.dayIndex]?.date}):
              </span>
              <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                {weeks[editingCell.weekIndex]?.days[editingCell.dayIndex]?.items.length || 0} Item Aktif
              </span>
            </div>

            <button
              type="button"
              onClick={() => setEditingCell(null)}
              className="p-1 text-purple-700 hover:text-purple-900 cursor-pointer rounded-lg hover:bg-purple-200/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick presets chips with exact color maps */}
          <div className="flex flex-wrap items-center gap-1.5 w-full">
            {[
              'DUDUKAN KULKAS',
              'SETRIKA',
              'TV',
              'LAPTOP',
              'KULKAS',
              'MESIN CUCI',
              'AC',
              'SEPEDA LISTRIK',
              'MAGIC COM',
              'SHOWCASE',
              'WATER HEATER',
              'B2 PROMO KREDIT',
              'LIBUR',
            ].map((p) => {
              const style = getProductColorStyle(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleAddItemToCell(editingCell.weekIndex, editingCell.dayIndex, p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer transition-transform hover:scale-105 border shadow-2xs ${style.tailwindBg} ${style.tailwindText}`}
                >
                  + {p}
                </button>
              );
            })}
          </div>

          {/* Custom Input */}
          <div className="flex items-center gap-2 w-full pt-1">
            <input
              type="text"
              value={newProductInput}
              onChange={(e) => setNewProductInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newProductInput.trim()) {
                  handleAddItemToCell(editingCell.weekIndex, editingCell.dayIndex, newProductInput);
                }
              }}
              placeholder="Ketik nama produk lain (misal: FREEZER, DISPENSER, KOMPOR)..."
              className="bg-white border border-purple-300 rounded-xl px-3 py-1.5 text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1"
            />
            <button
              type="button"
              disabled={!newProductInput.trim()}
              onClick={() => {
                handleAddItemToCell(editingCell.weekIndex, editingCell.dayIndex, newProductInput);
              }}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
            >
              + Tambah
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
