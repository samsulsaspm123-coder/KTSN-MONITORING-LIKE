import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Palette,
  Sparkles,
  Copy,
  Check,
  Send,
  RefreshCw,
  Calendar,
  Layers,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Plus,
  Trash2,
  Info,
  SlidersHorizontal,
  History,
  RotateCcw,
  Sparkle,
  BookmarkCheck,
  Flame,
  FileText,
  User,
  Edit2,
  CheckSquare,
  Square,
  ArrowUp,
  ArrowDown,
  Wand2,
  FileSpreadsheet,
  Globe,
  Settings,
  LayoutGrid,
  Columns,
  Split,
  GripVertical
} from 'lucide-react';
import {
  ALLOWED_CATEGORIES,
  ALL_CLEAN_CATEGORIES,
  MASTER_SCHEDULE_QUEUE,
  DEFAULT_PRE_TASKS,
  DEFAULT_POST_TASKS,
  PlanningTaskItem,
  formatIndonesianDate,
  formatHyphenDate,
  formatToDesignTaskText,
  buildPlanningWhatsAppMessage,
  sanitizeToGenericCategory,
  detectTaskType,
  DesignHistoryRecord
} from '../data/dailyDesignData';
import {
  SheetWeekRow,
  SheetDaySchedule,
  INITIAL_SPREADSHEET_WEEKS,
  normalizeDateSlash,
  normalizeDateHyphen,
  upsertDayInWeeks,
  findDayInWeeks
} from '../data/spreadsheetMatrixData';
import {
  getProductColorStyle,
  PRODUCT_COLOR_PALETTE,
  PROMO_PRESETS,
  ELECTRONIC_GROUPS
} from '../data/productColorMap';
import { DesignSpreadsheetView } from './DesignSpreadsheetView';
import { SheetsSyncModal } from './SheetsSyncModal';

const LOCAL_STORAGE_KEY_DESIGN_QUEUE = 'likemonitor_design_queue_index_v2';
const LOCAL_STORAGE_KEY_LAST_DATE = 'likemonitor_design_last_date_v2';
const LOCAL_STORAGE_KEY_EMPLOYEE_NAME = 'likemonitor_design_emp_name_v2';
const LOCAL_STORAGE_KEY_CUSTOM_TASKS = 'likemonitor_design_planning_tasks_v2';
const LOCAL_STORAGE_KEY_HISTORY = 'likemonitor_design_history_v2';
const LOCAL_STORAGE_KEY_SPREADSHEET_WEEKS = 'likemonitor_design_spreadsheet_weeks_v2';
const LOCAL_STORAGE_KEY_SHEETS_URL = 'likemonitor_design_sheets_webapp_url_v2';
const LOCAL_STORAGE_KEY_AUTO_SYNC = 'likemonitor_design_auto_sync_v2';

interface DailyDesignGeneratorProps {
  storeCode?: string;
  onOpenSosmedReport?: () => void;
  compactMode?: boolean;
}

export function DailyDesignGenerator({
  storeCode = 'MEGA KTSN',
  onOpenSosmedReport,
  compactMode = false,
}: DailyDesignGeneratorProps) {
  // Current Date State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const dateInfo = useMemo(() => formatIndonesianDate(currentDate), [currentDate]);
  const formattedHyphen = useMemo(() => formatHyphenDate(currentDate), [currentDate]);
  const formattedSlash = useMemo(() => formattedHyphen.replace(/-/g, '/'), [formattedHyphen]);

  const isoDateString = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(currentDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [currentDate]);

  // PIC Name
  const [employeeName, setEmployeeName] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY_EMPLOYEE_NAME) || 'SAMSUL';
    } catch {
      return 'SAMSUL';
    }
  });

  // Master Queue Index
  const [queueIndex, setQueueIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_DESIGN_QUEUE);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [lastGeneratedDate, setLastGeneratedDate] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY_LAST_DATE) || '';
    } catch {
      return '';
    }
  });

  // Current Generated Design Categories (3 to 4 items)
  const [designCategories, setDesignCategories] = useState<string[]>(() => {
    return ['B2 PROMO KREDIT', 'SEPEDA LISTRIK', 'KULKAS'];
  });

  // Spreadsheet Weeks Matrix
  const [spreadsheetWeeks, setSpreadsheetWeeks] = useState<SheetWeekRow[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SPREADSHEET_WEEKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_SPREADSHEET_WEEKS;
  });

  // Google Sheets Web App Endpoint & Auto-Sync
  const [webAppUrl, setWebAppUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY_SHEETS_URL) || '';
    } catch {
      return '';
    }
  });

  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_AUTO_SYNC);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusToast, setSyncStatusToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Active View Tab: 'planning' | 'spreadsheet' | 'split'
  const [activeTab, setActiveTab] = useState<'planning' | 'spreadsheet' | 'split'>('planning');

  // Full Planning Tasks (Pre-Tasks + Design Slots + Post-Tasks)
  const [tasks, setTasks] = useState<PlanningTaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CUSTOM_TASKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }

    // Default Initial Template matching Gambar 1 & Gambar 2
    const initialDesigns = ['B2 PROMO KREDIT', 'SEPEDA LISTRIK', 'KULKAS'];
    const pre: PlanningTaskItem[] = DEFAULT_PRE_TASKS.map((t, idx) => ({
      id: `pre-${idx}`,
      text: t,
      isCompleted: false,
    }));
    const designs: PlanningTaskItem[] = initialDesigns.map((cat, idx) => ({
      id: `design-${idx}`,
      text: formatToDesignTaskText(cat),
      isDesignSlot: true,
      category: cat,
      isCompleted: false,
    }));
    const post: PlanningTaskItem[] = DEFAULT_POST_TASKS.map((t, idx) => ({
      id: `post-${idx}`,
      text: t,
      isCompleted: false,
    }));

    return [...pre, ...designs, ...post];
  });

  // History Records
  const [historyRecords, setHistoryRecords] = useState<DesignHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // UI Modes
  const [viewMode, setViewMode] = useState<'plain' | 'checked' | 'dynamic'>('plain');
  const [copiedMode, setCopiedMode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [skippedDaysCount, setSkippedDaysCount] = useState<number>(0);
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [editingDesignCategoryIndex, setEditingDesignCategoryIndex] = useState<number | null>(null);
  const [newTaskInput, setNewTaskInput] = useState<string>('');
  const [customPromoInput, setCustomPromoInput] = useState<string>('');
  const [customProductInput, setCustomProductInput] = useState<string>('');
  const [pickerTab, setPickerTab] = useState<'all' | 'promo' | 'gadget' | 'pendingin' | 'dapur' | 'entertainment'>('all');

  // Drag Mode ON/OFF (Default: false = Mode Ringan & Anti-Lag)
  const [dragMode, setDragMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('likemonitor_drag_mode_v1');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [draggingTaskIndex, setDraggingTaskIndex] = useState<number | null>(null);
  const [dragOverTaskIndex, setDragOverTaskIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('likemonitor_drag_mode_v1', dragMode ? 'true' : 'false');
    } catch {
      // Ignore
    }
  }, [dragMode]);

  // Real-time task input detector
  const detectedNewTask = useMemo(() => {
    return detectTaskType(newTaskInput);
  }, [newTaskInput]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_EMPLOYEE_NAME, employeeName);
      localStorage.setItem(LOCAL_STORAGE_KEY_DESIGN_QUEUE, queueIndex.toString());
      localStorage.setItem(LOCAL_STORAGE_KEY_LAST_DATE, lastGeneratedDate);
      localStorage.setItem(LOCAL_STORAGE_KEY_CUSTOM_TASKS, JSON.stringify(tasks));
      localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(historyRecords.slice(0, 30)));
      localStorage.setItem(LOCAL_STORAGE_KEY_SPREADSHEET_WEEKS, JSON.stringify(spreadsheetWeeks));
      localStorage.setItem(LOCAL_STORAGE_KEY_SHEETS_URL, webAppUrl);
      localStorage.setItem(LOCAL_STORAGE_KEY_AUTO_SYNC, autoSyncEnabled.toString());
    } catch {
      // ignore
    }
  }, [employeeName, queueIndex, lastGeneratedDate, tasks, historyRecords, spreadsheetWeeks, webAppUrl, autoSyncEnabled]);

  // Real-time synchronization state & background sync debouncer
  const isInitialRenderRef = React.useRef(true);
  const [realtimeSyncStatus, setRealtimeSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // Debounced Auto-Sync to Google Sheets when spreadsheetWeeks or employeeName changes
  useEffect(() => {
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      return;
    }
    if (!autoSyncEnabled || !webAppUrl || !webAppUrl.trim().startsWith('http')) {
      return;
    }

    setRealtimeSyncStatus('syncing');
    const timer = setTimeout(async () => {
      try {
        const payload = {
          action: 'syncAllWeeks',
          weeks: spreadsheetWeeks,
          employee: employeeName,
          store: storeCode,
          timestamp: new Date().toISOString(),
        };

        const res = await fetch(webAppUrl.trim(), {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setRealtimeSyncStatus('synced');
          setTimeout(() => setRealtimeSyncStatus('idle'), 3000);
        } else {
          setRealtimeSyncStatus('error');
        }
      } catch (e) {
        console.error('Realtime auto sync error:', e);
        setRealtimeSyncStatus('error');
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [spreadsheetWeeks, autoSyncEnabled, webAppUrl, employeeName, storeCode]);

  // Formatted Output Messages
  const plainTextMessage = useMemo(() => {
    return buildPlanningWhatsAppMessage(employeeName, formattedHyphen, tasks, 'plain');
  }, [employeeName, formattedHyphen, tasks]);

  const checkedTextMessage = useMemo(() => {
    return buildPlanningWhatsAppMessage(employeeName, formattedHyphen, tasks, 'checked');
  }, [employeeName, formattedHyphen, tasks]);

  const dynamicTextMessage = useMemo(() => {
    return buildPlanningWhatsAppMessage(employeeName, formattedHyphen, tasks, 'dynamic');
  }, [employeeName, formattedHyphen, tasks]);

  const activePreviewMessage = useMemo(() => {
    if (viewMode === 'plain') return plainTextMessage;
    if (viewMode === 'checked') return checkedTextMessage;
    return dynamicTextMessage;
  }, [viewMode, plainTextMessage, checkedTextMessage, dynamicTextMessage]);

  /**
   * Helper: Push item updates to Google Sheets Web App Endpoint in realtime
   */
  const syncItemsToGoogleSheets = async (targetDateSlash: string, itemsToSync: string[]) => {
    if (!webAppUrl || !webAppUrl.trim().startsWith('http')) {
      return false;
    }

    try {
      setIsSyncing(true);
      const payload = {
        action: 'syncDay',
        date: targetDateSlash,
        items: itemsToSync,
        employee: employeeName,
        store: storeCode,
        timestamp: new Date().toISOString(),
      };

      const res = await fetch(webAppUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSyncStatusToast({
          message: `Item desain ${targetDateSlash} disinkronkan ke Spreadsheet!`,
          type: 'success',
        });
        setTimeout(() => setSyncStatusToast(null), 3500);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Google Sheets sync error:', err);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Helper: Push entire 4-6 weeks matrix to Google Sheets Web App
   */
  const pushAllWeeksToGoogleSheets = async (): Promise<boolean> => {
    if (!webAppUrl || !webAppUrl.trim().startsWith('http')) {
      setIsSyncModalOpen(true);
      return false;
    }

    try {
      setIsSyncing(true);
      const payload = {
        action: 'syncAllWeeks',
        weeks: spreadsheetWeeks,
        employee: employeeName,
        store: storeCode,
        timestamp: new Date().toISOString(),
      };

      const res = await fetch(webAppUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSyncStatusToast({
          message: 'Seluruh matriks 6 Minggu berhasil diisi & diwarnai di Google Sheets!',
          type: 'success',
        });
        setTimeout(() => setSyncStatusToast(null), 4000);
        return true;
      }
      setSyncStatusToast({
        message: 'Gagal mengirim data. Pastikan Apps Script telah di-deploy ulang.',
        type: 'error',
      });
      setTimeout(() => setSyncStatusToast(null), 4000);
      return false;
    } catch (err: any) {
      setSyncStatusToast({
        message: `Gagal kirim: ${err.message || 'Periksa koneksi'}`,
        type: 'error',
      });
      setTimeout(() => setSyncStatusToast(null), 4000);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Helper: Pull latest matrix from Google Sheets Web App Endpoint
   */
  const pullFromGoogleSheets = async () => {
    if (!webAppUrl || !webAppUrl.trim().startsWith('http')) {
      throw new Error('URL Web App Google Sheets belum diatur.');
    }

    try {
      setIsSyncing(true);
      const res = await fetch(webAppUrl.trim(), { method: 'GET' });
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();

      setSyncStatusToast({
        message: 'Data spreadsheet berhasil ditarik dari Google Sheets!',
        type: 'success',
      });
      setTimeout(() => setSyncStatusToast(null), 3500);
    } catch (err: any) {
      setSyncStatusToast({
        message: `Gagal menarik data: ${err.message || 'Error'}`,
        type: 'error',
      });
      setTimeout(() => setSyncStatusToast(null), 3500);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Helper: Test connection to Google Sheets Web App
   */
  const testConnectionToGoogleSheets = async (): Promise<boolean> => {
    if (!webAppUrl || !webAppUrl.trim().startsWith('http')) return false;
    try {
      const res = await fetch(webAppUrl.trim(), { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  };

  /**
   * Helper: Generate a balanced 3 or 4 item array from category pools
   */
  const generateBalancedSet = (targetDate: Date, seedIndex: number): string[] => {
    const isSunday = targetDate.getDay() === 0;
    const baseSet = MASTER_SCHEDULE_QUEUE[seedIndex % MASTER_SCHEDULE_QUEUE.length];
    const cleaned = baseSet.map((it) => sanitizeToGenericCategory(it));
    const unique = Array.from(new Set(cleaned));

    if (isSunday) {
      const hasB2 = unique.some((it) => it.includes('KREDIT') || it.startsWith('B2'));
      if (!hasB2) {
        if (unique.length >= 4) {
          unique[0] = 'B2 PROMO KREDIT';
        } else {
          unique.unshift('B2 PROMO KREDIT');
        }
      }
    }

    while (unique.length < 3) {
      const randomCategory = ALL_CLEAN_CATEGORIES[Math.floor(Math.random() * ALL_CLEAN_CATEGORIES.length)];
      if (!unique.includes(randomCategory)) {
        unique.push(randomCategory);
      }
    }

    return unique.slice(0, 4);
  };

  /**
   * Main Generator Function with Shift & Overflow Logic
   * Injects the generated design items directly into the Planning List AND updates Spreadsheet Matrix!
   */
  const handleGenerateToday = (forcedSimulationDays: number = 0) => {
    setIsGenerating(true);

    setTimeout(() => {
      const today = new Date();
      const todayIso = dateInfo.isoDate;

      let daysDiff = 1;
      if (forcedSimulationDays > 0) {
        daysDiff = forcedSimulationDays;
      } else if (lastGeneratedDate) {
        const last = new Date(lastGeneratedDate);
        const diffTime = Math.abs(today.getTime() - last.getTime());
        daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));
      }

      const hadMissedDays = daysDiff > 1;
      const skipped = hadMissedDays ? daysDiff - 1 : 0;
      setSkippedDaysCount(skipped);

      const nextIndex = (queueIndex + 1) % MASTER_SCHEDULE_QUEUE.length;
      setQueueIndex(nextIndex);

      const newCategories = generateBalancedSet(today, nextIndex);
      setDesignCategories(newCategories);
      setLastGeneratedDate(todayIso);

      // Rebuild or update the tasks array:
      // Keep pre-tasks and post-tasks intact, replace/inject design slots
      const designTaskItems: PlanningTaskItem[] = newCategories.map((cat, idx) => ({
        id: `design-${Date.now()}-${idx}`,
        text: formatToDesignTaskText(cat),
        isDesignSlot: true,
        category: cat,
        isCompleted: false,
      }));

      // Filter out old design slots and insert new ones right after "DESAIN ELEKTRONIK/HOME APPIANCE"
      const nonDesignTasks = tasks.filter((t) => !t.isDesignSlot);
      const insertAnchorIndex = nonDesignTasks.findIndex((t) =>
        t.text.includes('DESAIN ELEKTRONIK') || t.text.includes('HOME APPIANCE')
      );

      let updatedTaskList: PlanningTaskItem[] = [];
      if (insertAnchorIndex !== -1) {
        const before = nonDesignTasks.slice(0, insertAnchorIndex + 1);
        const after = nonDesignTasks.slice(insertAnchorIndex + 1);
        updatedTaskList = [...before, ...designTaskItems, ...after];
      } else {
        const mid = Math.floor(nonDesignTasks.length / 2);
        updatedTaskList = [
          ...nonDesignTasks.slice(0, mid),
          ...designTaskItems,
          ...nonDesignTasks.slice(mid),
        ];
      }

      setTasks(updatedTaskList);

      // Update Spreadsheet Matrix in memory
      const updatedWeeks = upsertDayInWeeks(spreadsheetWeeks, formattedSlash, newCategories);
      setSpreadsheetWeeks(updatedWeeks);

      // Auto Sync to Cloud Google Sheets if enabled
      if (autoSyncEnabled && webAppUrl) {
        syncItemsToGoogleSheets(formattedSlash, newCategories);
      }

      // Save to history
      const newRecord: DesignHistoryRecord = {
        id: `gen-${Date.now()}`,
        timestamp: new Date().toISOString(),
        dateLabel: `${dateInfo.dayName}, ${formattedHyphen}`,
        dayOfWeek: dateInfo.dayName,
        items: newCategories,
        wasShifted: hadMissedDays,
        skippedDays: skipped,
        statusText: hadMissedDays
          ? 'Antrean aktif (Disesuaikan dari jadwal pergeseran)'
          : 'Antrean normal harian',
        source: 'auto-generate',
      };

      setHistoryRecords((prev) => [newRecord, ...prev.slice(0, 29)]);
      setIsGenerating(false);
    }, 250);
  };

  /**
   * Helper to rebuild tasks by injecting design items into existing pre- and post-tasks
   */
  const injectDesignSlotsIntoTaskList = (currentTasks: PlanningTaskItem[], newDesignCats: string[]): PlanningTaskItem[] => {
    const nonDesignTasks = currentTasks.filter((t) => !t.isDesignSlot);
    const designTaskItems: PlanningTaskItem[] = newDesignCats.map((cat, idx) => ({
      id: `design-${Date.now()}-${idx}-${cat}`,
      text: formatToDesignTaskText(cat),
      isDesignSlot: true,
      category: cat,
      isCompleted: false,
    }));

    const insertAnchorIndex = nonDesignTasks.findIndex((t) =>
      t.text.includes('DESAIN ELEKTRONIK') || t.text.includes('HOME APPIANCE')
    );

    if (insertAnchorIndex !== -1) {
      const before = nonDesignTasks.slice(0, insertAnchorIndex + 1);
      const after = nonDesignTasks.slice(insertAnchorIndex + 1);
      return [...before, ...designTaskItems, ...after];
    } else {
      const mid = Math.floor(nonDesignTasks.length / 2);
      return [
        ...nonDesignTasks.slice(0, mid),
        ...designTaskItems,
        ...nonDesignTasks.slice(mid),
      ];
    }
  };

  /**
   * When weeks are updated from Spreadsheet View (Gambar 2):
   * 1. Save new spreadsheet weeks
   * 2. Immediately update the Planning Harian tasks and design categories for the active day!
   */
  const handleUpdateSpreadsheetWeeks = (newWeeks: SheetWeekRow[]) => {
    setSpreadsheetWeeks(newWeeks);

    const foundDay = findDayInWeeks(newWeeks, formattedSlash);
    if (foundDay) {
      const dayItems = foundDay.items || [];
      setDesignCategories(dayItems);
      setTasks((prevTasks) => injectDesignSlotsIntoTaskList(prevTasks, dayItems));
    }
  };

  /**
   * Selecting a day from Spreadsheet Matrix loads those items into the Planning WA generator!
   * Also updates the active currentDate so editing and syncing target this exact day.
   */
  const handleSelectDateFromSpreadsheet = (dateSlash: string, items: string[]) => {
    // 1. Sinkronkan currentDate ke tanggal yang diklik dari Spreadsheet
    const cleanSlash = dateSlash.replace(/-/g, '/').trim();
    const parts = cleanSlash.split('/');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const parsedDate = new Date(y, m, d);
      if (!isNaN(parsedDate.getTime())) {
        setCurrentDate(parsedDate);
      }
    }

    // 2. Convert items into design tasks and update task list & design categories
    const cleanItems = items.length > 0 ? items : ['KULKAS', 'SEPEDA LISTRIK', 'TV'];
    setDesignCategories(cleanItems);
    setTasks((prevTasks) => injectDesignSlotsIntoTaskList(prevTasks, cleanItems));

    setSyncStatusToast({
      message: `Item desain tanggal ${dateSlash} (${cleanItems.join(', ')}) dimuat ke Planning Harian!`,
      type: 'success',
    });
    setTimeout(() => setSyncStatusToast(null), 3000);
  };

  /**
   * Manual date selection via HTML Date Picker in header
   */
  const handleManualDateSelect = (isoString: string) => {
    if (!isoString) return;
    const parts = isoString.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const newD = new Date(y, m, d);
      if (!isNaN(newD.getTime())) {
        setCurrentDate(newD);
        const dd = String(d).padStart(2, '0');
        const mm = String(m + 1).padStart(2, '0');
        const slash = `${dd}/${mm}/${y}`;

        // Look up if this date exists in spreadsheet
        const found = findDayInWeeks(spreadsheetWeeks, slash);
        if (found && found.items && found.items.length > 0) {
          handleSelectDateFromSpreadsheet(slash, found.items);
        } else {
          // If not in spreadsheet, generate a balanced set and add it
          const generatedItems = generateBalancedSet(newD, queueIndex);
          setDesignCategories(generatedItems);
          setTasks((prev) => injectDesignSlotsIntoTaskList(prev, generatedItems));
          const updatedWeeks = upsertDayInWeeks(spreadsheetWeeks, slash, generatedItems);
          setSpreadsheetWeeks(updatedWeeks);
        }
      }
    }
  };

  // Copy helper
  const handleCopyText = async (textToCopy: string, modeName: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedMode(modeName);
      setTimeout(() => setCopiedMode(null), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedMode(modeName);
      setTimeout(() => setCopiedMode(null), 2000);
    }
  };

  // Send to WhatsApp
  const handleSendWhatsApp = (textToSend: string) => {
    const encoded = encodeURIComponent(textToSend);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Toggle individual task checkmark
  const handleToggleTaskCheck = (index: number) => {
    const updated = [...tasks];
    updated[index] = {
      ...updated[index],
      isCompleted: !updated[index].isCompleted,
    };
    setTasks(updated);
  };

  // Check all / Uncheck all
  const handleSetAllChecks = (completed: boolean) => {
    const updated = tasks.map((t) => ({ ...t, isCompleted: completed }));
    setTasks(updated);
  };

  // Update task text
  const handleUpdateTaskText = (index: number, newText: string) => {
    if (!newText.trim()) return;
    const detected = detectTaskType(newText);
    const updated = [...tasks];

    if (detected.isDesignSlot && detected.category) {
      updated[index] = {
        ...updated[index],
        text: detected.cleanText,
        isDesignSlot: true,
        category: detected.category,
      };
    } else {
      updated[index] = {
        ...updated[index],
        text: newText.trim().toUpperCase(),
        isDesignSlot: false,
        category: undefined,
      };
    }
    setTasks(updated);

    // Update in spreadsheet too
    const currentDesigns = updated.filter((t) => t.isDesignSlot && t.category).map((t) => t.category!);
    setDesignCategories(currentDesigns);
    const updatedWeeks = upsertDayInWeeks(spreadsheetWeeks, formattedSlash, currentDesigns);
    setSpreadsheetWeeks(updatedWeeks);

    if (autoSyncEnabled && webAppUrl) {
      syncItemsToGoogleSheets(formattedSlash, currentDesigns);
    }
  };

  // Swap / Reroll single design item category
  const handleSwapDesignCategory = (taskIndex: number, newCategory: string) => {
    const cleanCat = sanitizeToGenericCategory(newCategory);
    const updated = [...tasks];
    updated[taskIndex] = {
      ...updated[taskIndex],
      text: formatToDesignTaskText(cleanCat),
      category: cleanCat,
      isDesignSlot: true,
    };
    setTasks(updated);
    setEditingDesignCategoryIndex(null);

    // Update in spreadsheet too
    const currentDesigns = updated.filter((t) => t.isDesignSlot && t.category).map((t) => t.category!);
    setDesignCategories(currentDesigns);
    const updatedWeeks = upsertDayInWeeks(spreadsheetWeeks, formattedSlash, currentDesigns);
    setSpreadsheetWeeks(updatedWeeks);

    if (autoSyncEnabled && webAppUrl) {
      syncItemsToGoogleSheets(formattedSlash, currentDesigns);
    }

    setSyncStatusToast({
      message: `Item desain [${cleanCat}] diperbarui dan disinkronkan ke Spreadsheet!`,
      type: 'success',
    });
    setTimeout(() => setSyncStatusToast(null), 3000);
  };

  // Reroll single design item randomly
  const handleRerollSingleDesign = (taskIndex: number) => {
    const currentTask = tasks[taskIndex];
    const currentCats = tasks.filter((t) => t.isDesignSlot && t.category).map((t) => t.category!);
    const available = ALL_CLEAN_CATEGORIES.filter((c) => !currentCats.includes(c));
    const nextCat = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : 'KULKAS';

    const updated = [...tasks];
    updated[taskIndex] = {
      ...currentTask,
      text: formatToDesignTaskText(nextCat),
      category: nextCat,
      isDesignSlot: true,
    };
    setTasks(updated);

    const currentDesigns = updated.filter((t) => t.isDesignSlot && t.category).map((t) => t.category!);
    setDesignCategories(currentDesigns);
    const updatedWeeks = upsertDayInWeeks(spreadsheetWeeks, formattedSlash, currentDesigns);
    setSpreadsheetWeeks(updatedWeeks);

    if (autoSyncEnabled && webAppUrl) {
      syncItemsToGoogleSheets(formattedSlash, currentDesigns);
    }
  };

  // Delete task
  const handleDeleteTask = (index: number) => {
    if (tasks.length <= 1) return;
    const targetTask = tasks[index];
    const updated = tasks.filter((_, i) => i !== index);
    setTasks(updated);

    // If deleted task was a design slot, update spreadsheet
    if (targetTask.isDesignSlot) {
      const currentDesigns = updated.filter((t) => t.isDesignSlot && t.category).map((t) => t.category!);
      setDesignCategories(currentDesigns);
      const updatedWeeks = upsertDayInWeeks(spreadsheetWeeks, formattedSlash, currentDesigns);
      setSpreadsheetWeeks(updatedWeeks);

      if (autoSyncEnabled && webAppUrl) {
        syncItemsToGoogleSheets(formattedSlash, currentDesigns);
      }
    }
  };

  // Move task up / down
  const handleMoveTask = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === tasks.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...tasks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setTasks(updated);

    const currentDesigns = updated.filter((t) => t.isDesignSlot && t.category).map((t) => t.category!);
    setDesignCategories(currentDesigns);
    const updatedWeeks = upsertDayInWeeks(spreadsheetWeeks, formattedSlash, currentDesigns);
    setSpreadsheetWeeks(updatedWeeks);

    if (autoSyncEnabled && webAppUrl) {
      syncItemsToGoogleSheets(formattedSlash, currentDesigns);
    }
  };

  // Drag & drop handlers for tasks (active only when dragMode is true)
  const handleTaskDragStart = (e: React.DragEvent, index: number) => {
    if (!dragMode) return;
    setDraggingTaskIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTaskDragOver = (e: React.DragEvent, index: number) => {
    if (!dragMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTaskIndex !== index) {
      setDragOverTaskIndex(index);
    }
  };

  const handleTaskDragEnd = () => {
    setDraggingTaskIndex(null);
    setDragOverTaskIndex(null);
  };

  const handleTaskDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverTaskIndex(null);
    setDraggingTaskIndex(null);
    if (!dragMode) return;

    const rawSource = e.dataTransfer.getData('text/plain');
    const sourceIndex = parseInt(rawSource, 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const updated = [...tasks];
    const [movedItem] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, movedItem);
    setTasks(updated);

    const currentDesigns = updated.filter((t) => t.isDesignSlot && t.category).map((t) => t.category!);
    setDesignCategories(currentDesigns);
    const updatedWeeks = upsertDayInWeeks(spreadsheetWeeks, formattedSlash, currentDesigns);
    setSpreadsheetWeeks(updatedWeeks);

    if (autoSyncEnabled && webAppUrl) {
      syncItemsToGoogleSheets(formattedSlash, currentDesigns);
    }
  };

  // Quick add from chip button
  const handleAddQuickCategory = (catName: string) => {
    const cleanCat = sanitizeToGenericCategory(catName);
    const newItem: PlanningTaskItem = {
      id: `design-${Date.now()}`,
      text: formatToDesignTaskText(cleanCat),
      isDesignSlot: true,
      category: cleanCat,
      isCompleted: false,
    };
    const updated = [...tasks, newItem];
    setTasks(updated);

    const currentDesigns = updated.filter((t) => t.isDesignSlot && t.category).map((t) => t.category!);
    setDesignCategories(currentDesigns);
    const updatedWeeks = upsertDayInWeeks(spreadsheetWeeks, formattedSlash, currentDesigns);
    setSpreadsheetWeeks(updatedWeeks);

    if (autoSyncEnabled && webAppUrl) {
      syncItemsToGoogleSheets(formattedSlash, currentDesigns);
    }

    setSyncStatusToast({
      message: `Item desain [${cleanCat}] ditambahkan dan disinkronkan ke Spreadsheet!`,
      type: 'success',
    });
    setTimeout(() => setSyncStatusToast(null), 3000);
  };

  // Add new task with intelligent electronics/promo detection
  const handleAddNewTask = (forcedCategory?: string) => {
    const text = (forcedCategory || newTaskInput).trim();
    if (!text) return;

    const detected = detectTaskType(text);
    let newItem: PlanningTaskItem;

    if (detected.isDesignSlot && detected.category) {
      newItem = {
        id: `design-${Date.now()}`,
        text: detected.cleanText,
        isDesignSlot: true,
        category: detected.category,
        isCompleted: false,
      };
    } else {
      newItem = {
        id: `custom-${Date.now()}`,
        text: text.toUpperCase(),
        isDesignSlot: false,
        isCompleted: false,
      };
    }

    const updated = [...tasks, newItem];
    setTasks(updated);
    setNewTaskInput('');

    if (newItem.isDesignSlot && newItem.category) {
      const currentDesigns = updated.filter((t) => t.isDesignSlot && t.category).map((t) => t.category!);
      setDesignCategories(currentDesigns);
      const updatedWeeks = upsertDayInWeeks(spreadsheetWeeks, formattedSlash, currentDesigns);
      setSpreadsheetWeeks(updatedWeeks);

      if (autoSyncEnabled && webAppUrl) {
        syncItemsToGoogleSheets(formattedSlash, currentDesigns);
      }

      setSyncStatusToast({
        message: `Item desain [${newItem.category}] berhasil ditambahkan dengan warna & disinkronkan ke Spreadsheet!`,
        type: 'success',
      });
      setTimeout(() => setSyncStatusToast(null), 3000);
    }
  };

  // Reset to default template
  const handleResetToDefault = () => {
    const pre: PlanningTaskItem[] = DEFAULT_PRE_TASKS.map((t, idx) => ({
      id: `pre-${Date.now()}-${idx}`,
      text: t,
      isCompleted: false,
    }));
    const designs: PlanningTaskItem[] = designCategories.map((cat, idx) => ({
      id: `design-${Date.now()}-${idx}`,
      text: formatToDesignTaskText(cat),
      isDesignSlot: true,
      category: cat,
      isCompleted: false,
    }));
    const post: PlanningTaskItem[] = DEFAULT_POST_TASKS.map((t, idx) => ({
      id: `post-${Date.now()}-${idx}`,
      text: t,
      isCompleted: false,
    }));

    const newTasks = [...pre, ...designs, ...post];
    setTasks(newTasks);

    const currentDesigns = newTasks.filter((t) => t.isDesignSlot && t.category).map((t) => t.category!);
    setDesignCategories(currentDesigns);
    const updatedWeeks = upsertDayInWeeks(spreadsheetWeeks, formattedSlash, currentDesigns);
    setSpreadsheetWeeks(updatedWeeks);
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100) || 0;

  return (
    <div className="space-y-6">
      
      {/* GLOBAL TOAST NOTIFICATION */}
      <AnimatePresence>
        {syncStatusToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-black ${
              syncStatusToast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/30'
                : 'bg-rose-600 text-white border-rose-500 shadow-rose-900/30'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
            <span>{syncStatusToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 1. HERO HEADER: PLANNING AKTIFITAS & SPREADSHEET SYNC     */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-800/60">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-12 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                Planning Aktifitas Harian & Jadwal Desain
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                <FileSpreadsheet className="w-3 h-3 text-emerald-300" />
                Terintegrasi Spreadsheet ELEKTRONIK
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/40 text-[11px] font-black uppercase tracking-wider">
                🛡️ TANPA MERK • WARNA UNIK PRODUK
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Palette className="w-8 h-8 text-emerald-300 shrink-0" />
              <span>Planning Aktifitas Harian {employeeName.toUpperCase()}</span>
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Format WhatsApp resmi: Daftar item desain harian otomatis diselipkan di antara planning harian dengan <strong>sinkronisasi data dan warna produk realtime ke Spreadsheet &quot;ELEKTRONIK&quot;</strong>.
            </p>

            {/* Config bar: PIC + Date + Live Sync Status */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-emerald-400/30">
                <User className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-emerald-200 font-bold">PIC:</span>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value.toUpperCase())}
                  placeholder="SAMSUL"
                  className="bg-emerald-950/80 text-white font-black px-2 py-0.5 rounded border border-emerald-500/50 text-xs w-28 uppercase focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-emerald-400/30 font-mono">
                <Calendar className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span className="text-emerald-200 font-bold">Tanggal:</span>
                <input
                  type="date"
                  value={isoDateString}
                  onChange={(e) => handleManualDateSelect(e.target.value)}
                  className="bg-emerald-950/80 text-white font-black px-2 py-0.5 rounded border border-emerald-500/50 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                />
                <span className="text-emerald-300 text-[11px] font-bold">({dateInfo.dayName})</span>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    setCurrentDate(today);
                    const dd = String(today.getDate()).padStart(2, '0');
                    const mm = String(today.getMonth() + 1).padStart(2, '0');
                    const yyyy = today.getFullYear();
                    const slash = `${dd}/${mm}/${yyyy}`;
                    const found = findDayInWeeks(spreadsheetWeeks, slash);
                    if (found && found.items && found.items.length > 0) {
                      handleSelectDateFromSpreadsheet(slash, found.items);
                    } else {
                      const generatedItems = generateBalancedSet(today, queueIndex);
                      setDesignCategories(generatedItems);
                      setTasks((prev) => injectDesignSlotsIntoTaskList(prev, generatedItems));
                      const updatedWeeks = upsertDayInWeeks(spreadsheetWeeks, slash, generatedItems);
                      setSpreadsheetWeeks(updatedWeeks);
                    }
                  }}
                  title="Kembali ke Tanggal Hari Ini"
                  className="px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 text-[10px] font-bold border border-emerald-400/30 cursor-pointer ml-1"
                >
                  Hari Ini
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsSyncModalOpen(true)}
                className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-xl border border-emerald-400/30 cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-200 font-bold">
                  {webAppUrl ? '🟢 Realtime Sync Aktif' : '🟡 Hubungkan Google Sheets'}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Action Button Right */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <motion.button
              type="button"
              onClick={() => handleGenerateToday(0)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isGenerating}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-700/40 flex items-center justify-center gap-3 cursor-pointer border border-emerald-300/40 transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Menghitung Antrean...' : 'GENERATE DESAIN HARI INI'}</span>
            </motion.button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleCopyText(plainTextMessage, 'plain')}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 border border-white/20 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                {copiedMode === 'plain' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMode === 'plain' ? 'Tersalin!' : 'Salin Polos (Gbr 1)'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyText(checkedTextMessage, 'checked')}
                className="px-3 py-2 rounded-xl bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-100 border border-emerald-400/40 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                {copiedMode === 'checked' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <CheckSquare className="w-3.5 h-3.5 text-emerald-300" />}
                <span>{copiedMode === 'checked' ? 'Tersalin!' : 'Salin Semua ✅ (Gbr 2)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TAB SWITCHER: PLANNING WA vs SPREADSHEET ELEKTRONIK     */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('planning')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'planning'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Generator Planning Harian (WhatsApp)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('spreadsheet')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'spreadsheet'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>2. Tampilan Spreadsheet ELEKTRONIK (Katalog Warna)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'split'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Split className="w-4 h-4" />
            <span className="hidden sm:inline">Split View (Berdampingan)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pr-2">
          <button
            type="button"
            onClick={() => setIsSyncModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Pengaturan Sync</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. SPREADSHEET MATRIX VIEW (WHEN SELECTED OR SPLIT)       */}
      {/* ========================================================= */}
      {(activeTab === 'spreadsheet' || activeTab === 'split') && (
        <DesignSpreadsheetView
          weeks={spreadsheetWeeks}
          onUpdateWeeks={handleUpdateSpreadsheetWeeks}
          selectedDateSlash={formattedSlash}
          onSelectDate={handleSelectDateFromSpreadsheet}
          onOpenSyncSettings={() => setIsSyncModalOpen(true)}
          onSyncToCloud={async () => {
            const currentDesigns = tasks
              .filter((t) => t.isDesignSlot && t.category)
              .map((t) => t.category!);
            return await syncItemsToGoogleSheets(formattedSlash, currentDesigns);
          }}
          onSyncSingleDay={syncItemsToGoogleSheets}
          onPushAllWeeksToCloud={pushAllWeeksToGoogleSheets}
          onPullFromCloud={pullFromGoogleSheets}
          isSyncing={isSyncing}
          realtimeSyncStatus={realtimeSyncStatus}
          webAppUrl={webAppUrl}
          compactMode={compactMode}
        />
      )}

      {/* ========================================================= */}
      {/* 4. MAIN PLANNING WORKSPACE (WHEN SELECTED OR SPLIT)       */}
      {/* ========================================================= */}
      {(activeTab === 'planning' || activeTab === 'split') && (
        <div className="space-y-6">
          {/* AUTO SHIFT LOGIC BANNER */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900">
                    Logika Pergeseran & Antrean Jadwal (Auto-Shift Libur)
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase">
                    Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Jika ada hari libur / tidak absen, antrean desain yang terlewat otomatis dimajukan ke hari aktif berikutnya tanpa merusak struktur planning.
                  {skippedDaysCount > 0 && (
                    <span className="block text-amber-700 font-bold mt-0.5">
                      ⚡ Terdeteksi jeda {skippedDaysCount} hari (Libur). Antrean telah disesuaikan ke hari ini!
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Simulasi Libur:</span>
              <button
                type="button"
                onClick={() => handleGenerateToday(2)}
                title="Simulasi jika kemarin libur (jeda 1 hari)"
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-bold cursor-pointer transition-colors"
              >
                Libur 1 Hari
              </button>
              <button
                type="button"
                onClick={() => handleGenerateToday(4)}
                title="Simulasi jika libur 3 hari berturut-turut"
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-bold cursor-pointer transition-colors"
              >
                Libur 3 Hari
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: INTERACTIVE TASK LIST & INLINE EDITOR (7 COLS) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                {/* Header & Quick Action Toggles */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-emerald-600" />
                      <span>Daftar Item Planning Aktifitas ({tasks.length} Item)</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Klik centang untuk menandai tugas yang selesai, atau edit teks dan ganti produk
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* DRAG MODE ON/OFF SWITCH */}
                    <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                      <GripVertical className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-[11px] font-bold text-slate-700">Drag:</span>
                      <span
                        className={`px-1 py-0.2 rounded text-[9px] font-black uppercase ${
                          dragMode
                            ? 'bg-indigo-600 text-white'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {dragMode ? 'ON' : 'OFF (Ringan)'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDragMode((prev) => !prev)}
                        className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ml-0.5 ${
                          dragMode ? 'bg-indigo-600' : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                        title={dragMode ? 'Matikan Drag Mode (Mode Ringan / Anti-Lag)' : 'Aktifkan Drag Mode (Geser & tukar baris tugas)'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            dragMode ? 'translate-x-3.5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSetAllChecks(true)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Centang Semua</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetAllChecks(false)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>Hapus Centang</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetToDefault}
                      title="Kembalikan ke susunan template bawaan"
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Task Items List */}
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {tasks.map((task, index) => {
                      const isDesign = task.isDesignSlot;
                      const isEditing = editingTaskIndex === index;
                      const colorStyle = isDesign ? getProductColorStyle(task.category || task.text) : null;
                      const isBeingDragged = draggingTaskIndex === index;
                      const isDragTarget = dragOverTaskIndex === index && draggingTaskIndex !== index;

                      return (
                        <motion.div
                          key={task.id || `task-${index}`}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.18 }}
                          draggable={dragMode}
                          onDragStart={(e) => handleTaskDragStart(e, index)}
                          onDragOver={(e) => handleTaskDragOver(e, index)}
                          onDragLeave={handleTaskDragEnd}
                          onDragEnd={handleTaskDragEnd}
                          onDrop={(e) => handleTaskDrop(e, index)}
                          className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isBeingDragged
                              ? 'opacity-40 border-dashed border-indigo-400 scale-[0.98]'
                              : isDragTarget
                              ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-50/40'
                              : isDesign
                              ? 'bg-slate-50/90 border-slate-300 shadow-2xs'
                              : task.isCompleted
                              ? 'bg-emerald-50/60 border-emerald-200'
                              : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200'
                          }`}
                        >
                          {/* Left: Grip (if dragMode) + Checkbox + Bullet + Text */}
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {dragMode && (
                              <div
                                className="cursor-grab active:cursor-grabbing p-1 rounded-md bg-slate-200/70 hover:bg-slate-300 text-slate-600 transition-colors shrink-0"
                                title="Tahan & geser untuk mengubah urutan tugas"
                              >
                                <GripVertical className="w-3.5 h-3.5" />
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => handleToggleTaskCheck(index)}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                                task.isCompleted
                                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                                  : 'bg-white border-slate-300 hover:border-emerald-500 text-transparent'
                              }`}
                            >
                              <Check className="w-4 h-4 text-white stroke-[3]" />
                            </button>

                            <div className="min-w-0 flex-1">
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    autoFocus
                                    defaultValue={task.text}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleUpdateTaskText(index, (e.target as HTMLInputElement).value);
                                        setEditingTaskIndex(null);
                                      } else if (e.key === 'Escape') {
                                        setEditingTaskIndex(null);
                                      }
                                    }}
                                    onBlur={(e) => {
                                      handleUpdateTaskText(index, e.target.value);
                                      setEditingTaskIndex(null);
                                    }}
                                    className="w-full bg-white text-slate-900 font-bold px-2 py-1 rounded-lg border border-indigo-400 text-xs sm:text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className="text-xs sm:text-sm font-bold uppercase tracking-wide cursor-pointer text-slate-800"
                                    onClick={() => setEditingTaskIndex(index)}
                                    title="Klik untuk mengedit teks tugas ini"
                                  >
                                    &bull; {task.text}
                                  </span>

                                  {/* PRODUCT COLOR BADGE MATCHING GOOGLE SPREADSHEET */}
                                  {isDesign && colorStyle && (
                                    <span
                                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs border border-black/10 ${colorStyle.tailwindBg} ${colorStyle.tailwindText}`}
                                    >
                                      <Sparkles className="w-2.5 h-2.5 opacity-80" />
                                      {colorStyle.name}
                                    </span>
                                  )}

                                  {task.isCompleted && (
                                    <span className="text-emerald-600 font-black text-xs">
                                      ✅
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Actions: Edit / Category Swap / Reorder / Delete */}
                          <div className="flex items-center gap-1 shrink-0">
                            {isDesign && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingDesignCategoryIndex(
                                      editingDesignCategoryIndex === index ? null : index
                                    )
                                  }
                                  title="Ganti kategori desain generik"
                                  className="px-2 py-1 rounded-lg bg-white text-purple-700 hover:bg-purple-100 border border-purple-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                >
                                  <SlidersHorizontal className="w-3 h-3" />
                                  <span className="hidden sm:inline">Ganti</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRerollSingleDesign(index)}
                                  title="Acak kategori desain ini"
                                  className="p-1 rounded-lg bg-white text-purple-700 hover:bg-purple-100 border border-purple-200 cursor-pointer transition-colors shadow-2xs"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                </button>
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => setEditingTaskIndex(isEditing ? null : index)}
                              title="Edit teks item"
                              className="p-1 rounded-lg bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 cursor-pointer transition-colors shadow-2xs"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMoveTask(index, 'up')}
                              disabled={index === 0}
                              title="Pindah ke atas"
                              className="p-1 rounded-lg bg-white text-slate-500 hover:text-slate-800 border border-slate-200 disabled:opacity-30 cursor-pointer transition-colors shadow-2xs"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMoveTask(index, 'down')}
                              disabled={index === tasks.length - 1}
                              title="Pindah ke bawah"
                              className="p-1 rounded-lg bg-white text-slate-500 hover:text-slate-800 border border-slate-200 disabled:opacity-30 cursor-pointer transition-colors shadow-2xs"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteTask(index)}
                              title="Hapus baris tugas ini"
                              className="p-1 rounded-lg bg-white text-rose-500 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 cursor-pointer transition-colors shadow-2xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Category Quick Picker Dropdown when editing design slot */}
                {editingDesignCategoryIndex !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-purple-50/80 backdrop-blur-xs border border-purple-200 rounded-2xl p-4 space-y-3.5 shadow-md"
                  >
                    <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Palette className="w-4 h-4 text-purple-700" />
                        <span className="text-xs font-black text-purple-950 uppercase tracking-wide">
                          Pilih / Buat Kategori Desain (Warna Spreadsheet)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDesignCategoryIndex(null);
                          setCustomPromoInput('');
                          setCustomProductInput('');
                        }}
                        className="text-xs text-purple-700 hover:text-purple-900 font-bold px-2 py-0.5 rounded-md hover:bg-purple-100 cursor-pointer"
                      >
                        Tutup &times;
                      </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => setPickerTab('all')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition-colors ${
                          pickerTab === 'all'
                            ? 'bg-purple-700 text-white shadow-xs'
                            : 'bg-white text-purple-900 hover:bg-purple-100 border border-purple-200'
                        }`}
                      >
                        Semua Kategori
                      </button>
                      <button
                        type="button"
                        onClick={() => setPickerTab('promo')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition-colors ${
                          pickerTab === 'promo'
                            ? 'bg-[#1565c0] text-white shadow-xs'
                            : 'bg-white text-blue-900 hover:bg-blue-50 border border-blue-200'
                        }`}
                      >
                        🏷️ Promo & Banner
                      </button>
                      <button
                        type="button"
                        onClick={() => setPickerTab('gadget')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition-colors ${
                          pickerTab === 'gadget'
                            ? 'bg-purple-700 text-white shadow-xs'
                            : 'bg-white text-purple-900 hover:bg-purple-100 border border-purple-200'
                        }`}
                      >
                        📱 Gadget
                      </button>
                      <button
                        type="button"
                        onClick={() => setPickerTab('pendingin')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition-colors ${
                          pickerTab === 'pendingin'
                            ? 'bg-purple-700 text-white shadow-xs'
                            : 'bg-white text-purple-900 hover:bg-purple-100 border border-purple-200'
                        }`}
                      >
                        ❄️ Pendingin
                      </button>
                      <button
                        type="button"
                        onClick={() => setPickerTab('dapur')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition-colors ${
                          pickerTab === 'dapur'
                            ? 'bg-purple-700 text-white shadow-xs'
                            : 'bg-white text-purple-900 hover:bg-purple-100 border border-purple-200'
                        }`}
                      >
                        🍳 Dapur
                      </button>
                      <button
                        type="button"
                        onClick={() => setPickerTab('entertainment')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition-colors ${
                          pickerTab === 'entertainment'
                            ? 'bg-purple-700 text-white shadow-xs'
                            : 'bg-white text-purple-900 hover:bg-purple-100 border border-purple-200'
                        }`}
                      >
                        📺 TV
                      </button>
                    </div>

                    {/* Promo Section if Tab is 'all' or 'promo' */}
                    {(pickerTab === 'all' || pickerTab === 'promo') && (
                      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-blue-950 uppercase tracking-wide flex items-center gap-1">
                            🏷️ Promo & Banner (Warna Royal Blue Google Sheets)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {PROMO_PRESETS.map((promoName) => {
                            const style = getProductColorStyle(promoName);
                            return (
                              <button
                                key={promoName}
                                type="button"
                                onClick={() =>
                                  handleSwapDesignCategory(editingDesignCategoryIndex, promoName)
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-black shadow-2xs cursor-pointer border transition-transform hover:scale-105 ${style.tailwindBg} ${style.tailwindText}`}
                              >
                                {promoName}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Promo Creator Input */}
                        <div className="pt-1.5 flex items-center gap-1.5">
                          <input
                            type="text"
                            value={customPromoInput}
                            onChange={(e) => setCustomPromoInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && customPromoInput.trim()) {
                                handleSwapDesignCategory(
                                  editingDesignCategoryIndex,
                                  customPromoInput.trim()
                                );
                                setCustomPromoInput('');
                              }
                            }}
                            placeholder="Ketik Promo Baru (mis: PROMO MERDEKA, CASHBACK 100RB)..."
                            className="flex-1 bg-white text-blue-950 font-bold px-2.5 py-1.5 rounded-lg border border-blue-300 text-xs placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            disabled={!customPromoInput.trim()}
                            onClick={() => {
                              if (customPromoInput.trim()) {
                                handleSwapDesignCategory(
                                  editingDesignCategoryIndex,
                                  customPromoInput.trim()
                                );
                                setCustomPromoInput('');
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#1565c0] hover:bg-blue-800 disabled:opacity-40 text-white font-black text-xs cursor-pointer shadow-xs transition-colors shrink-0"
                          >
                            + Terapkan Promo
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Electronic Product Categories */}
                    {pickerTab !== 'promo' && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-wide">
                          Kategori Produk Elektronik:
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                          {ALL_CLEAN_CATEGORIES.filter((cat) => {
                            if (pickerTab === 'all') return true;
                            const style = getProductColorStyle(cat);
                            return style.categoryGroup === pickerTab;
                          }).map((cat) => {
                            const style = getProductColorStyle(cat);
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() =>
                                  handleSwapDesignCategory(editingDesignCategoryIndex, cat)
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-2xs cursor-pointer border transition-transform hover:scale-105 ${style.tailwindBg} ${style.tailwindText}`}
                              >
                                {cat}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Intelligent Task Adder Section */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {/* Add Custom Task Row */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={newTaskInput}
                        onChange={(e) => setNewTaskInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddNewTask();
                        }}
                        placeholder="TAMBAH TUGAS (MISAL: TV, KULKAS, PROMO GAJIAN, CEK DM)..."
                        className="w-full bg-slate-50 text-slate-900 font-bold px-3 py-2.5 rounded-xl border border-slate-200 text-xs uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddNewTask()}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah</span>
                    </button>
                  </div>

                  {/* Real-time Category Detection Badge */}
                  {newTaskInput.trim().length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 border border-slate-200"
                    >
                      {detectedNewTask.isDesignSlot && detectedNewTask.category ? (
                        <>
                          {(() => {
                            const style = getProductColorStyle(detectedNewTask.category);
                            return (
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-black uppercase shadow-2xs ${style.tailwindBg} ${style.tailwindText}`}
                              >
                                {detectedNewTask.isPromo ? '🏷️ PROMO' : '🎨 DESAIN'}: {detectedNewTask.category}
                              </span>
                            );
                          })()}
                          <span className="text-emerald-700 font-bold text-[11px]">
                            ✓ Terdeteksi sebagai Desain Elektronik/Promo & otomatis disinkronkan ke Spreadsheet
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-600 text-[11px]">
                          📋 Terdeteksi sebagai Tugas Rutin Harian (Non-desain)
                        </span>
                      )}
                    </motion.div>
                  )}

                  {/* Quick Preset Chips Bar */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Sparkle className="w-3 h-3 text-amber-500" />
                      Tambah Cepat:
                    </span>
                    {['DUDUKAN KULKAS', 'SETRIKA', 'TV', 'KULKAS', 'AC', 'MESIN CUCI', 'SEPEDA LISTRIK', 'LAPTOP', 'MAGIC COM', 'WATER HEATER'].map((quickItem) => {
                      const style = getProductColorStyle(quickItem);
                      return (
                        <button
                          key={quickItem}
                          type="button"
                          onClick={() => handleAddQuickCategory(quickItem)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-transform hover:scale-105 border ${style.tailwindBg} ${style.tailwindText}`}
                        >
                          + {quickItem}
                        </button>
                      );
                    })}
                    {['B2 PROMO KREDIT', 'B2 KREDIT 0%', 'PROMO GAJIAN'].map((promoItem) => (
                      <button
                        key={promoItem}
                        type="button"
                        onClick={() => handleAddQuickCategory(promoItem)}
                        className="px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-transform hover:scale-105 bg-[#1565c0] text-white border border-blue-900"
                      >
                        + 🏷️ {promoItem}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: WHATSAPP OUTPUT CARDS (MATCHING GAMBAR 1 & 2) (5 COLS) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 sticky top-20">
                {/* Header & Mode Switcher */}
                <div className="flex flex-col gap-2.5 border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-base font-black text-slate-900">
                        Hasil Output WhatsApp
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                      Siap Kirim
                    </span>
                  </div>

                  {/* Toggle Mode: Gambar 1 (Polos) vs Gambar 2 (Checklist ✅) */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setViewMode('plain')}
                      className={`py-1.5 px-2 rounded-lg text-center cursor-pointer transition-all ${
                        viewMode === 'plain'
                          ? 'bg-white text-slate-900 shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Gambar 1: Polos
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode('checked')}
                      className={`py-1.5 px-2 rounded-lg text-center cursor-pointer transition-all flex items-center justify-center gap-1 ${
                        viewMode === 'checked'
                          ? 'bg-emerald-600 text-white shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Gambar 2: Ceklist ✅</span>
                    </button>
                  </div>
                </div>

                {/* EXACT WHATSAPP MONOSPACE BOX MATCHING SCREENSHOTS */}
                <div className="bg-[#0b141a] text-slate-100 rounded-2xl p-4 sm:p-5 font-mono text-xs sm:text-sm border border-slate-800 relative group select-all shadow-inner space-y-3 leading-relaxed">
                  <div className="text-emerald-400 font-bold text-[11px] font-sans flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span>📱 {viewMode === 'plain' ? 'OUTPUT DRAFT PLANNING (GAMBAR 1)' : 'OUTPUT PROGRESS SELESAI (GAMBAR 2)'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{formattedHyphen}</span>
                  </div>

                  {/* Exact WhatsApp Message Body */}
                  <div className="whitespace-pre-wrap font-mono text-slate-100 leading-relaxed font-bold tracking-wide">
                    <span className="text-emerald-300">
                      PLANNING AKTIFITAS HARIAN {(employeeName || 'SAMSUL').trim().toUpperCase()} {formattedHyphen}
                    </span>
                    {'\n\n'}
                    {tasks.map((task, idx) => {
                      const isCompleted = viewMode === 'checked' ? true : viewMode === 'dynamic' ? task.isCompleted : false;
                      const isDesign = task.isDesignSlot;

                      return (
                        <React.Fragment key={idx}>
                          <span className={isDesign ? 'text-amber-300' : 'text-slate-100'}>
                            &bull; {task.text.trim().toUpperCase()}{isCompleted ? ' ✅' : ''}
                          </span>
                          {'\n'}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-sans flex items-center justify-between">
                    <span>{tasks.length} Baris Planning</span>
                    <span>Huruf Besar Semua (Standard WA)</span>
                  </div>
                </div>

                {/* Quick Copy & WhatsApp Action Buttons */}
                <div className="space-y-2 pt-1">
                  <motion.button
                    type="button"
                    onClick={() => handleCopyText(activePreviewMessage, viewMode)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/30 transition-all"
                  >
                    {copiedMode === viewMode ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5" />}
                    <span>
                      {copiedMode === viewMode
                        ? 'BERHASIL DISALIN KE CLIPBOARD!'
                        : `SALIN OUTPUT (${viewMode === 'plain' ? 'GAMBAR 1: POLOS' : 'GAMBAR 2: CEKLIST ✅'})`}
                    </span>
                  </motion.button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyText(plainTextMessage, 'plain_btn')}
                      className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      {copiedMode === 'plain_btn' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                      <span>Salin Polos (Gbr 1)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyText(checkedTextMessage, 'checked_btn')}
                      className="py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      {copiedMode === 'checked_btn' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />}
                      <span>Salin Semua ✅ (Gbr 2)</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSendWhatsApp(activePreviewMessage)}
                    className="w-full py-3 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim Langsung ke WhatsApp Web</span>
                  </button>

                  {onOpenSosmedReport && (
                    <button
                      type="button"
                      onClick={onOpenSosmedReport}
                      className="w-full py-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors mt-1"
                    >
                      <Sparkle className="w-3.5 h-3.5 text-pink-500" />
                      <span>Lanjut ke Laporan Sosmed (7 Postingan) &rarr;</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. RIWAYAT GENERATOR SEBELUMNYA                           */}
      {/* ========================================================= */}
      {historyRecords.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-black text-slate-900">
                Riwayat Generator Desain Sebelumnya
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {historyRecords.length} Catatan Tersimpan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {historyRecords.slice(0, 6).map((record) => (
              <div
                key={record.id}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">
                    {record.dateLabel}
                  </span>
                  {record.wasShifted && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      Auto-Shift
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs">
                  {record.items.map((it, idx) => {
                    const style = getProductColorStyle(it);
                    return (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <span className="w-4 h-4 rounded bg-white text-[10px] font-bold flex items-center justify-center border border-slate-200">
                          {idx + 1}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${style.tailwindBg} ${style.tailwindText}`}>
                          {it}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{record.items.length} Item Desain</span>
                  <button
                    type="button"
                    onClick={() => {
                      const msg = buildPlanningWhatsAppMessage(
                        employeeName,
                        formattedHyphen,
                        tasks,
                        'plain'
                      );
                      handleCopyText(msg, `hist-${record.id}`);
                    }}
                    className="text-emerald-600 hover:text-emerald-800 font-bold cursor-pointer"
                  >
                    Salin &uarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. GOOGLE SHEETS SYNC CONFIGURATION MODAL                 */}
      {/* ========================================================= */}
      <SheetsSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        webAppUrl={webAppUrl}
        onSaveWebAppUrl={(url) => {
          setWebAppUrl(url);
          setSyncStatusToast({
            message: 'URL Google Sheets Web App disimpan!',
            type: 'success',
          });
          setTimeout(() => setSyncStatusToast(null), 3000);
        }}
        autoSyncEnabled={autoSyncEnabled}
        onToggleAutoSync={setAutoSyncEnabled}
        onTestConnection={testConnectionToGoogleSheets}
        onPushAllWeeksToCloud={pushAllWeeksToGoogleSheets}
        isSyncing={isSyncing}
      />
    </div>
  );
}
