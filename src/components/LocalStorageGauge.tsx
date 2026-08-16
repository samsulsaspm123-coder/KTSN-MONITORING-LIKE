import React, { useState, useEffect } from 'react';
import { Database, HardDrive, RefreshCw, ChevronDown, ChevronUp, CheckCircle, Info } from 'lucide-react';

interface StorageItem {
  key: string;
  label: string;
  bytes: number;
  kb: number;
  percent: number;
}

export function LocalStorageGauge() {
  const [totalBytes, setTotalBytes] = useState<number>(0);
  const [items, setItems] = useState<StorageItem[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const calculateStorage = () => {
    try {
      let total = 0;
      const itemList: { key: string; bytes: number }[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const val = localStorage.getItem(key) || '';
          // 2 bytes per char for UTF-16
          const bytes = (key.length + val.length) * 2;
          total += bytes;
          itemList.push({ key, bytes });
        }
      }

      setTotalBytes(total);

      const parsedItems: StorageItem[] = itemList.map((item) => {
        let label = item.key;
        if (item.key.includes('employee')) label = 'Data 151 Karyawan';
        else if (item.key.includes('social') || item.key.includes('sosmed')) label = 'Laporan 7 Sosmed';
        else if (item.key.includes('task') || item.key.includes('checklist')) label = 'Planning & Checklist';
        else if (item.key.includes('theme')) label = 'Pengaturan Tema';
        else if (item.key.includes('font')) label = 'Pengaturan Font';
        else if (item.key.includes('compact')) label = 'Mode Tampilan';

        const kb = Number((item.bytes / 1024).toFixed(2));
        const percent = total > 0 ? Number(((item.bytes / total) * 100).toFixed(1)) : 0;

        return {
          key: item.key,
          label,
          bytes: item.bytes,
          kb,
          percent,
        };
      });

      // Sort by largest data
      parsedItems.sort((a, b) => b.bytes - a.bytes);
      setItems(parsedItems);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    calculateStorage();

    // Listen to storage events and auto recalculate
    const handleStorageChange = () => {
      calculateStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(calculateStorage, 4000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    calculateStorage();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const totalKB = Number((totalBytes / 1024).toFixed(2));
  const totalMB = Number((totalBytes / (1024 * 1024)).toFixed(3));
  const quotaMB = 5.0; // Standard browser local storage quota (5 MB)
  const usagePercent = Math.min(100, Math.max(0.2, (totalMB / quotaMB) * 100));

  // Determine status color
  let barColor = 'from-blue-500 to-indigo-600';
  let badgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
  let statusText = 'Optimal';

  if (usagePercent > 75) {
    barColor = 'from-amber-500 to-rose-600';
    badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300';
    statusText = 'Hampir Penuh';
  } else if (usagePercent > 40) {
    barColor = 'from-blue-500 to-amber-500';
    badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    statusText = 'Cukup';
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 p-2.5 shadow-2xs transition-all dark:border-slate-800 dark:bg-slate-900/80">
      {/* Header Info */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <HardDrive className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">
            Local Storage
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${badgeColor}`}>
            {totalMB} MB
          </span>
          <button
            type="button"
            onClick={handleManualRefresh}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Hitung ulang ukuran storage"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="space-y-1">
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 flex items-center">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
            style={{ width: `${Math.max(4, usagePercent)}%` }}
          />
        </div>

        {/* Capacity Legend */}
        <div className="flex items-center justify-between text-[9px] font-semibold text-slate-500 dark:text-slate-400">
          <span>{totalKB} KB terpakai</span>
          <span>Kapasitas: {quotaMB} MB</span>
        </div>
      </div>

      {/* Toggle Breakdown */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-1">
          <Database className="w-2.5 h-2.5" />
          Rincian Data ({items.length} item)
        </span>
        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {/* Expanded Breakdown */}
      {isExpanded && (
        <div className="mt-1.5 pt-1 space-y-1 max-h-36 overflow-y-auto custom-scrollbar text-[10px] border-t border-slate-100 dark:border-slate-800/80">
          {items.map((it) => (
            <div
              key={it.key}
              className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300"
            >
              <span className="truncate max-w-[120px] font-medium" title={it.key}>
                {it.label}
              </span>
              <span className="font-mono text-[9px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                {it.kb} KB
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
