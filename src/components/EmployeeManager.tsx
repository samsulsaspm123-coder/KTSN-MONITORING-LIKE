import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Trash2,
  Edit3,
  Download,
  Upload,
  RefreshCw,
  Check,
  X,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  Link as LinkIcon,
  Instagram,
  ThumbsUp,
  AlertTriangle,
} from 'lucide-react';
import { Employee, EmployeeStatus, LikePlatformMode } from '../types';
import { DEFAULT_EMPLOYEES } from '../data/defaultEmployees';
import {
  compareDivisions,
  matchEmployeeByNameForImport,
  normalizeUsername,
} from '../utils/likersParser';

interface EmployeeManagerProps {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  compactMode?: boolean;
  likePlatform?: LikePlatformMode;
  setLikePlatform?: (mode: LikePlatformMode) => void;
  openFbImportSignal?: number;
  onNavigateToRekap: () => void;
}

export function EmployeeManager({
  employees,
  setEmployees,
  likePlatform = 'instagram',
  setLikePlatform,
  openFbImportSignal = 0,
}: EmployeeManagerProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDivisi, setSelectedDivisi] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedQuotaFilter, setSelectedQuotaFilter] = useState<
    'ALL' | 'UNMET' | 'MET' | 'EXEMPT' | 'MISSING_FB'
  >('ALL');
  const [accountViewFilter, setAccountViewFilter] = useState<'both' | 'instagram' | 'facebook'>('both');
  const [dailyQuotaTarget, setDailyQuotaTarget] = useState<number>(7);

  // Toast / Inline Notification Banner (replaces window.alert)
  const [bannerNotice, setBannerNotice] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const showNotice = (type: 'success' | 'error' | 'info', text: string) => {
    setBannerNotice({ type, text });
    setTimeout(() => {
      setBannerNotice((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Confirm Dialog State (replaces window.confirm)
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formDivisi, setFormDivisi] = useState<string>('KASIR');
  const [formNama, setFormNama] = useState<string>('');
  const [formUsername1, setFormUsername1] = useState<string>('');
  const [formUsername2, setFormUsername2] = useState<string>('');
  const [formFbUsername1, setFormFbUsername1] = useState<string>('');
  const [formFbUsername2, setFormFbUsername2] = useState<string>('');
  const [formStatus, setFormStatus] = useState<EmployeeStatus>('Normal');
  const [formKeterangan, setFormKeterangan] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Google Sheets Full Employee Import & Sync Modal
  const [isSheetSyncOpen, setIsSheetSyncOpen] = useState<boolean>(false);
  const [syncTab, setSyncTab] = useState<'paste' | 'url' | 'guide'>('paste');
  const [rawSheetText, setRawSheetText] = useState<string>('');
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMode, setSyncMode] = useState<'replace' | 'append'>('replace');
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // =========================================================
  // DEDICATED FACEBOOK USERNAME IMPORT MODAL STATE
  // (Maps FB usernames onto EXISTING employees — headcount stays 100% identical!)
  // =========================================================
  const [isFbImportOpen, setIsFbImportOpen] = useState<boolean>(false);
  const [fbImportTab, setFbImportTab] = useState<'by_name' | 'by_order'>('by_name');
  const [rawFbImportText, setRawFbImportText] = useState<string>('');
  const [fbOrderDivisi, setFbOrderDivisi] = useState<string>('ALL');
  const [manualFbRowTargetOverrides, setManualFbRowTargetOverrides] = useState<Record<number, string>>({});

  useEffect(() => {
    if (openFbImportSignal > 0) {
      setIsFbImportOpen(true);
    }
  }, [openFbImportSignal]);

  // Divisions list
  const divisionList = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => set.add(e.divisi));
    return Array.from(set).sort(compareDivisions);
  }, [employees]);

  // Parse raw pasted spreadsheet text (supports both IG-only 6 cols and IG+FB 8 cols, preserving existing FB accounts on match!)
  const parsedSheetEmployees = useMemo(() => {
    if (!rawSheetText.trim()) return [];

    const lines = rawSheetText.trim().split(/\r?\n/);
    const results: Employee[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      let cols: string[] = [];
      if (line.includes('\t')) {
        cols = line.split('\t').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      } else if (line.includes(',')) {
        cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) => c.trim().replace(/^["']|["']$/g, ''));
      } else if (line.includes(';')) {
        cols = line.split(';').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      } else {
        cols = [trimmed];
      }

      const firstCol = (cols[0] || '').toLowerCase();
      const secondCol = (cols[1] || '').toLowerCase();
      const thirdCol = (cols[2] || '').toLowerCase();
      if (
        firstCol.includes('divisi') ||
        firstCol.includes('departemen') ||
        firstCol === 'no' ||
        firstCol === 'no.' ||
        secondCol.includes('departemen') ||
        secondCol.includes('divisi') ||
        secondCol.includes('nama') ||
        thirdCol.includes('nama') ||
        firstCol.includes('nama')
      ) {
        return;
      }

      let divisi = 'UMUM';
      let nama = '';
      let username1 = '';
      let username2 = '';
      let fbUsername1 = '';
      let fbUsername2 = '';
      let status: EmployeeStatus = 'Normal';
      let keterangan = '';

      const matchStatus = (raw: string | undefined): EmployeeStatus => {
        if (!raw) return 'Normal';
        const clean = raw.trim().toLowerCase();
        if (clean.includes('bebas')) return 'Bebas';
        if (clean.includes('cuti')) return 'Cuti';
        if (clean.includes('off') || clean.includes('libur')) return 'Off';
        if (clean.includes('hp') || clean.includes('hilang') || clean.includes('rusak')) return 'HP Hilang';
        if (clean.includes('sakit')) return 'Sakit';
        if (clean.includes('izin') || clean.includes('ijin')) return 'Izin';
        return 'Normal';
      };

      const isFirstColNumber = /^\d+$/.test(cols[0]?.trim());
      const offset = isFirstColNumber ? 1 : 0;
      const effCols = cols.slice(offset);

      if (effCols.length >= 7) {
        // [Divisi] [Nama] [IG1] [IG2] [Status] [Keterangan] [FB1] [FB2]
        divisi = effCols[0]?.toUpperCase() || 'UMUM';
        nama = effCols[1] || '';
        username1 = normalizeUsername(effCols[2] || '');
        username2 = normalizeUsername(effCols[3] || '');
        status = matchStatus(effCols[4]);
        keterangan = effCols[5] || '';
        fbUsername1 = (effCols[6] || '').trim();
        fbUsername2 = (effCols[7] || '').trim();
      } else if (effCols.length >= 5) {
        divisi = effCols[0]?.toUpperCase() || 'UMUM';
        nama = effCols[1] || '';
        username1 = normalizeUsername(effCols[2] || '');
        username2 = normalizeUsername(effCols[3] || '');
        status = matchStatus(effCols[4]);
        keterangan = effCols.slice(5).join(', ').trim();
      } else if (effCols.length === 4) {
        divisi = effCols[0]?.toUpperCase() || 'UMUM';
        nama = effCols[1] || '';
        username1 = normalizeUsername(effCols[2] || '');
        const fourth = effCols[3]?.trim() || '';
        const detectedSt = matchStatus(fourth);
        if (detectedSt !== 'Normal' || fourth.toLowerCase() === 'normal') {
          status = detectedSt;
        } else {
          username2 = normalizeUsername(fourth);
        }
      } else if (effCols.length === 3) {
        divisi = effCols[0]?.toUpperCase() || 'UMUM';
        nama = effCols[1] || '';
        username1 = normalizeUsername(effCols[2] || '');
      } else if (effCols.length === 2) {
        nama = effCols[0] || '';
        username1 = normalizeUsername(effCols[1] || '');
      }

      if (nama.trim() || username1.trim()) {
        // Preserve existing FB account if employee already existed in DB and sheet didn't specify FB
        const existingMatch = employees.find(
          (e) =>
            e.nama.trim().toLowerCase() === nama.trim().toLowerCase() &&
            e.divisi.trim().toUpperCase() === divisi.trim().toUpperCase()
        );

        results.push({
          id: existingMatch?.id || `EMP-SHT-${Date.now().toString().slice(-4)}-${index + 1}`,
          divisi: divisi.trim() || 'UMUM',
          nama: nama.trim() || username1,
          username1: username1.trim() || existingMatch?.username1 || nama.toLowerCase().replace(/\s+/g, '_'),
          username2: username2.trim() || existingMatch?.username2 || undefined,
          fbUsername1: fbUsername1 || existingMatch?.fbUsername1 || undefined,
          fbUsername2: fbUsername2 || existingMatch?.fbUsername2 || undefined,
          status,
          keterangan: keterangan.trim() || undefined,
        });
      }
    });

    return results;
  }, [rawSheetText, employees]);

  // Parse Dedicated Facebook Username Import (Mode 1: By Employee Name, Mode 2: By Row Order)
  const targetEmployeesForOrder = useMemo(() => {
    if (fbOrderDivisi === 'ALL') return employees;
    return employees.filter((e) => e.divisi === fbOrderDivisi);
  }, [employees, fbOrderDivisi]);

  const parsedFbImportRows = useMemo(() => {
    if (!rawFbImportText.trim()) return [];
    const lines = rawFbImportText.split(/\r?\n/);

    if (fbImportTab === 'by_order') {
      // 1 line = 1 employee row in targetEmployeesForOrder
      const nonEmptyLines = lines.map((l) => l.trim()).filter(Boolean);
      return nonEmptyLines.map((line, idx) => {
        // Skip header if first line says "Username FB" or "Facebook"
        const targetEmp = targetEmployeesForOrder[idx] || null;
        let fb1 = line;
        let fb2 = '';
        if (line.includes('\t')) {
          const parts = line.split('\t').map((p) => p.trim());
          fb1 = parts[0] || '';
          fb2 = parts[1] || '';
        } else if (line.includes('|')) {
          const parts = line.split('|').map((p) => p.trim());
          fb1 = parts[0] || '';
          fb2 = parts[1] || '';
        }

        return {
          rowIndex: idx,
          rawInputName: targetEmp ? targetEmp.nama : `Baris #${idx + 1}`,
          fb1: fb1.replace(/^["']|["']$/g, '').trim(),
          fb2: fb2.replace(/^["']|["']$/g, '').trim(),
          matchedEmployee: targetEmp,
          matchStatus: (targetEmp ? 'exact' : 'not_found') as 'exact' | 'similar' | 'ambiguous' | 'not_found',
          candidates: targetEmp ? [targetEmp] : [],
          note: targetEmp ? undefined : 'Melebihi jumlah karyawan pada filter ini (diabaikan)',
        };
      });
    }

    // Mode 'by_name': [Nama] [Separator] [FB 1] [Optional FB 2] OR [No] [Divisi] [Nama] [FB 1] [FB 2]
    const output: Array<{
      rowIndex: number;
      rawInputName: string;
      fb1: string;
      fb2: string;
      matchedEmployee: Employee | null;
      matchStatus: 'exact' | 'similar' | 'ambiguous' | 'not_found';
      candidates: Employee[];
      note?: string;
    }> = [];

    lines.forEach((rawLine, idx) => {
      const trimmed = rawLine.trim();
      if (!trimmed) return;

      let cols: string[] = [];
      if (trimmed.includes('\t')) {
        cols = trimmed.split('\t').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      } else if (trimmed.includes('|')) {
        cols = trimmed.split('|').map((c) => c.trim());
      } else if (/[-:=]/.test(trimmed) && !trimmed.includes('facebook.com')) {
        const sepMatch = trimmed.match(/^([^:=\-]+?)\s*[:=\-]\s*(.+)$/);
        if (sepMatch) {
          cols = [sepMatch[1].trim(), ...sepMatch[2].split(',').map((s) => s.trim())];
        }
      } else if (trimmed.includes(',')) {
        cols = trimmed.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      }

      if (cols.length < 2) return;

      // Skip obvious header row
      const c0 = (cols[0] || '').toLowerCase();
      const c1 = (cols[1] || '').toLowerCase();
      if (
        (c0 === 'no' || c0 === 'no.' || c0.includes('nama') || c0.includes('divisi')) &&
        (c1.includes('nama') || c1.includes('fb') || c1.includes('facebook') || c1.includes('divisi'))
      ) {
        return;
      }

      let divPart = '';
      let namePart = '';
      let fb1 = '';
      let fb2 = '';

      const isFirstNum = /^\d+$/.test(cols[0]);
      const eff = isFirstNum ? cols.slice(1) : cols;

      if (eff.length >= 3) {
        // Could be [Divisi, Nama, FB1, FB2?] OR [Nama, FB1, FB2]
        const looksLikeDiv = divisionList.some(
          (d) => d.toUpperCase() === eff[0].toUpperCase() || eff[0].toUpperCase().includes('NGK') || eff[0].toUpperCase().includes('ADMIN') || eff[0].toUpperCase().includes('ELEKT') || eff[0].toUpperCase().includes('PROMOTOR')
        );
        if (looksLikeDiv) {
          divPart = eff[0];
          namePart = eff[1];
          fb1 = eff[2] || '';
          fb2 = eff[3] || '';
        } else {
          namePart = eff[0];
          fb1 = eff[1] || '';
          fb2 = eff[2] || '';
        }
      } else if (eff.length === 2) {
        namePart = eff[0];
        fb1 = eff[1];
      }

      if (!namePart || !fb1) return;

      const overrideEmpId = manualFbRowTargetOverrides[idx];
      if (overrideEmpId) {
        const overriddenEmp = employees.find((e) => e.id === overrideEmpId) || null;
        output.push({
          rowIndex: idx,
          rawInputName: namePart,
          fb1,
          fb2,
          matchedEmployee: overriddenEmp,
          matchStatus: overriddenEmp ? 'exact' : 'not_found',
          candidates: overriddenEmp ? [overriddenEmp] : [],
          note: 'Dipilih manual oleh pengguna',
        });
        return;
      }

      const matchRes = matchEmployeeByNameForImport(namePart, divPart, employees);
      output.push({
        rowIndex: idx,
        rawInputName: divPart ? `${namePart} (${divPart})` : namePart,
        fb1,
        fb2,
        matchedEmployee: matchRes.matchedEmployee,
        matchStatus: matchRes.matchStatus,
        candidates: matchRes.candidates,
        note: matchRes.note,
      });
    });

    return output;
  }, [rawFbImportText, fbImportTab, targetEmployeesForOrder, employees, divisionList, manualFbRowTargetOverrides]);

  const handleApplyFbImport = () => {
    const validRows = parsedFbImportRows.filter((r) => r.matchedEmployee && r.fb1.trim());
    if (validRows.length === 0) {
      showNotice('error', 'Belum ada baris Username Facebook yang cocok dengan karyawan. Periksa format tempel di bawah.');
      return;
    }

    const updatesByEmpId = new Map<string, { fb1: string; fb2?: string }>();
    for (const row of validRows) {
      if (row.matchedEmployee) {
        updatesByEmpId.set(row.matchedEmployee.id, {
          fb1: row.fb1.trim(),
          fb2: row.fb2.trim() || undefined,
        });
      }
    }

    const nextEmployees = employees.map((emp) => {
      const upd = updatesByEmpId.get(emp.id);
      if (!upd) return emp;
      return {
        ...emp,
        fbUsername1: upd.fb1,
        fbUsername2: upd.fb2 !== undefined ? upd.fb2 : emp.fbUsername2,
      };
    });

    setEmployees(nextEmployees);
    setIsFbImportOpen(false);
    setRawFbImportText('');
    setManualFbRowTargetOverrides({});
    showNotice(
      'success',
      `Berhasil menyimpan Username Facebook untuk ${updatesByEmpId.size} karyawan! Total karyawan tetap ${employees.length} staf (akun IG tetap aman).`
    );
  };

  const handleApplyParsedSheet = () => {
    if (parsedSheetEmployees.length === 0) {
      setSyncMessage({
        type: 'error',
        text: 'Tidak ada data valid yang dapat diproses. Pastikan Anda menempel baris tabel dari Google Sheet.',
      });
      return;
    }

    if (syncMode === 'replace') {
      setEmployees(parsedSheetEmployees);
      setSyncMessage({
        type: 'success',
        text: `Sukses! Database diperbarui dengan ${parsedSheetEmployees.length} karyawan.`,
      });
    } else {
      setEmployees([...employees, ...parsedSheetEmployees]);
      setSyncMessage({
        type: 'success',
        text: `Sukses! ${parsedSheetEmployees.length} karyawan ditambahkan.`,
      });
    }

    setTimeout(() => {
      setIsSheetSyncOpen(false);
      setRawSheetText('');
      setSyncMessage(null);
    }, 1000);
  };

  const handleFetchSheetUrl = async () => {
    if (!sheetUrl.trim()) {
      setSyncMessage({ type: 'error', text: 'Masukkan tautan Google Sheet terlebih dahulu.' });
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);

    try {
      let targetUrl = sheetUrl.trim();
      const match = targetUrl.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && !targetUrl.includes('export?format=csv') && !targetUrl.includes('pub?output=csv')) {
        const id = match[1];
        const gidMatch = targetUrl.match(/gid=([0-9]+)/);
        const gid = gidMatch ? gidMatch[1] : '0';
        targetUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
      }

      const res = await fetch(targetUrl);
      if (!res.ok) {
        throw new Error(`Gagal mengambil data (HTTP ${res.status}). Gunakan metode Copy-Paste Langsung.`);
      }

      const text = await res.text();
      setRawSheetText(text);
      setSyncTab('paste');
      setSyncMessage({
        type: 'success',
        text: 'Data Google Sheets berhasil diunduh! Periksa pratinjau lalu klik Terapkan.',
      });
    } catch (err: any) {
      setSyncMessage({
        type: 'error',
        text: err.message || 'Gagal terhubung ke Google Sheet. Gunakan tab Copy-Paste Langsung.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Quota and social media completeness stats
  const quotaStats = useMemo(() => {
    const totalStaff = employees.length;
    const normalStaff = employees.filter((e) => e.status === 'Normal');
    const unmetQuota = employees.filter((e) => e.status === 'Normal' && !e.hasMetDailyQuota);
    const metQuota = employees.filter((e) => e.status === 'Normal' && Boolean(e.hasMetDailyQuota));
    const exemptStaff = employees.filter((e) => e.status !== 'Normal');
    const igFilled = employees.filter((e) => Boolean(e.username1?.trim())).length;
    const fbFilled = employees.filter((e) => Boolean(e.fbUsername1?.trim())).length;
    const missingFb = totalStaff - fbFilled;

    return {
      totalStaff,
      normalCount: normalStaff.length,
      unmetCount: unmetQuota.length,
      metCount: metQuota.length,
      exemptCount: exemptStaff.length,
      igFilled,
      fbFilled,
      missingFb,
      metPercent: normalStaff.length > 0 ? Math.round((metQuota.length / normalStaff.length) * 100) : 0,
    };
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return employees.filter((emp) => {
      const matchQuery =
        emp.nama.toLowerCase().includes(q) ||
        emp.username1.toLowerCase().includes(q) ||
        (emp.username2 && emp.username2.toLowerCase().includes(q)) ||
        (emp.fbUsername1 && emp.fbUsername1.toLowerCase().includes(q)) ||
        (emp.fbUsername2 && emp.fbUsername2.toLowerCase().includes(q)) ||
        emp.divisi.toLowerCase().includes(q);

      const matchDiv = selectedDivisi === 'ALL' || emp.divisi === selectedDivisi;
      const matchStatus = selectedStatus === 'ALL' || emp.status === selectedStatus;

      let matchQuota = true;
      if (selectedQuotaFilter === 'UNMET') {
        matchQuota = emp.status === 'Normal' && !emp.hasMetDailyQuota;
      } else if (selectedQuotaFilter === 'MET') {
        matchQuota = emp.status === 'Normal' && Boolean(emp.hasMetDailyQuota);
      } else if (selectedQuotaFilter === 'EXEMPT') {
        matchQuota = emp.status !== 'Normal';
      } else if (selectedQuotaFilter === 'MISSING_FB') {
        matchQuota = !emp.fbUsername1?.trim();
      }

      return matchQuery && matchDiv && matchStatus && matchQuota;
    });
  }, [employees, searchQuery, selectedDivisi, selectedStatus, selectedQuotaFilter]);

  const handleToggleEmployeeQuota = (id: string) => {
    setEmployees(
      employees.map((emp) =>
        emp.id === id ? { ...emp, hasMetDailyQuota: !emp.hasMetDailyQuota } : emp
      )
    );
  };

  const handleMarkAllMetQuota = (isMet: boolean) => {
    setEmployees(
      employees.map((emp) =>
        emp.status === 'Normal' ? { ...emp, hasMetDailyQuota: isMet } : emp
      )
    );
  };

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormDivisi(divisionList[0] || 'KASIR');
    setFormNama('');
    setFormUsername1('');
    setFormUsername2('');
    setFormFbUsername1('');
    setFormFbUsername2('');
    setFormStatus('Normal');
    setFormKeterangan('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormDivisi(emp.divisi);
    setFormNama(emp.nama);
    setFormUsername1(emp.username1 || '');
    setFormUsername2(emp.username2 || '');
    setFormFbUsername1(emp.fbUsername1 || '');
    setFormFbUsername2(emp.fbUsername2 || '');
    setFormStatus(emp.status);
    setFormKeterangan(emp.keterangan || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      setFormError('Nama karyawan wajib diisi.');
      return;
    }
    if (!formUsername1.trim() && !formFbUsername1.trim()) {
      setFormError('Isi minimal salah satu akun sosial media (Username IG 1 atau Akun FB 1).');
      return;
    }

    const cleanU1 = normalizeUsername(formUsername1);
    const cleanU2 = normalizeUsername(formUsername2);
    const cleanFb1 = formFbUsername1.trim();
    const cleanFb2 = formFbUsername2.trim();

    if (editingEmployee) {
      const updated = employees.map((emp) =>
        emp.id === editingEmployee.id
          ? {
              ...emp,
              divisi: formDivisi.trim().toUpperCase(),
              nama: formNama.trim(),
              username1: cleanU1,
              username2: cleanU2 || undefined,
              fbUsername1: cleanFb1 || undefined,
              fbUsername2: cleanFb2 || undefined,
              status: formStatus,
              keterangan: formKeterangan.trim() || undefined,
            }
          : emp
      );
      setEmployees(updated);
      showNotice('success', `Data karyawan "${formNama.trim()}" berhasil diperbarui.`);
    } else {
      const newEmp: Employee = {
        id: `EMP-${Date.now().toString().slice(-4)}`,
        divisi: formDivisi.trim().toUpperCase(),
        nama: formNama.trim(),
        username1: cleanU1,
        username2: cleanU2 || undefined,
        fbUsername1: cleanFb1 || undefined,
        fbUsername2: cleanFb2 || undefined,
        status: formStatus,
        keterangan: formKeterangan.trim() || undefined,
      };
      setEmployees([...employees, newEmp]);
      showNotice('success', `Karyawan baru "${formNama.trim()}" berhasil ditambahkan.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmDialog({
      title: 'Hapus Karyawan?',
      message: `Apakah Anda yakin ingin menghapus data karyawan "${name}" dari database?`,
      confirmLabel: 'Ya, Hapus',
      onConfirm: () => {
        setEmployees(employees.filter((emp) => emp.id !== id));
        setConfirmDialog(null);
        showNotice('info', `Data karyawan "${name}" telah dihapus.`);
      },
    });
  };

  const handleQuickStatusChange = (id: string, currentStatus: EmployeeStatus) => {
    const statuses: EmployeeStatus[] = ['Normal', 'Cuti', 'Off', 'Izin', 'Sakit', 'HP Hilang', 'Bebas'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    setEmployees(employees.map((emp) => (emp.id === id ? { ...emp, status: nextStatus } : emp)));
  };

  const handleResetToDefault = () => {
    setConfirmDialog({
      title: 'Reset ke Data Contoh Default?',
      message: 'Seluruh daftar karyawan (beserta contoh akun IG & FB bawaan) akan dikembalikan ke data awal.',
      confirmLabel: 'Ya, Reset Default',
      onConfirm: () => {
        setEmployees(DEFAULT_EMPLOYEES);
        setConfirmDialog(null);
        showNotice('success', 'Database karyawan dikembalikan ke data default.');
      },
    });
  };

  const handleExportCSV = () => {
    const headers = [
      'Divisi',
      'Nama Karyawan',
      'Username IG 1',
      'Username IG 2',
      'Status',
      'Keterangan',
      'Username FB 1',
      'Username FB 2',
    ];
    const rows = employees.map((e) => [
      `"${e.divisi}"`,
      `"${e.nama}"`,
      `"${e.username1 || ''}"`,
      `"${e.username2 || ''}"`,
      `"${e.status}"`,
      `"${e.keterangan || ''}"`,
      `"${e.fbUsername1 || ''}"`,
      `"${e.fbUsername2 || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Daftar_Karyawan_IG_FB_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/);
      const parsed: Employee[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((col) =>
          col.replace(/^"(.*)"$/, '$1').trim()
        );

        if (cols.length >= 3 && cols[1]) {
          parsed.push({
            id: `EMP-IMP-${i}`,
            divisi: cols[0]?.toUpperCase() || 'UMUM',
            nama: cols[1],
            username1: normalizeUsername(cols[2] || ''),
            username2: normalizeUsername(cols[3] || '') || undefined,
            status: (['Normal', 'Cuti', 'Off', 'Izin', 'Sakit', 'HP Hilang', 'Bebas'].includes(cols[4])
              ? cols[4]
              : 'Normal') as EmployeeStatus,
            keterangan: cols[5] || undefined,
            fbUsername1: cols[6] || undefined,
            fbUsername2: cols[7] || undefined,
          });
        }
      }

      if (parsed.length > 0) {
        setEmployees(parsed);
        showNotice('success', `Berhasil mengimpor ${parsed.length} data karyawan dari file CSV!`);
      } else {
        showNotice('error', 'Format file CSV tidak sesuai. Pastikan kolom sesuai template.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Inline Notification Banner */}
      {bannerNotice && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 shadow-xs ${
            bannerNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : bannerNotice.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerNotice.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{bannerNotice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerNotice(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-bold text-indigo-700 uppercase tracking-wider">
              Database Terpadu IG &amp; FB
            </span>
            <span>&bull;</span>
            <span>
              Total Tetap: <strong className="text-slate-900">{employees.length} Karyawan</strong> (1 Karyawan = Akun IG + Akun FB)
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Daftar Karyawan, Akun Instagram &amp; Akun Facebook
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Jumlah karyawan tidak berubah — setiap staf memiliki kolom <b>Username Instagram</b> dan <b>Username/Nama Facebook</b> terpisah. Gunakan tombol <b>Import Khusus Username FB</b> untuk mengisi akun FB massal ke staf yang sudah ada.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setRawFbImportText('');
              setManualFbRowTargetOverrides({});
              setIsFbImportOpen(true);
            }}
            className="px-3.5 py-2 bg-[#1877F2] hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.99]"
            title="Import khusus kolom Username/Nama Facebook ke karyawan yang sudah ada tanpa menambah/mengubah total karyawan"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Import Khusus Username FB</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRawSheetText('');
              setSyncMessage(null);
              setIsSheetSyncOpen(true);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.99]"
            title="Import data karyawan dari Google Sheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Import Sheet Karyawan</span>
          </button>

          <button
            id="btn-add-employee"
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.99]"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Tambah Staf</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-slate-200">
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
          >
            Reset Default
          </button>
        </div>
      </div>

      {/* Stats Grid: Total Staff, IG Coverage, FB Coverage, Quota */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Karyawan Tetap
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {quotaStats.totalStaff}
            </span>
            <span className="text-[11px] text-slate-500">
              {quotaStats.normalCount} Wajib Like &bull; {quotaStats.exemptCount} Bebas
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-pink-700 uppercase tracking-wider flex items-center gap-1">
              <Instagram className="w-3.5 h-3.5 text-pink-600" />
              <span>Akun Instagram Terdata</span>
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {quotaStats.igFilled}{' '}
              <span className="text-xs font-semibold text-slate-500">/ {quotaStats.totalStaff} Staf</span>
            </span>
            <span className="text-[11px] text-slate-500">Username IG terpisah dari FB</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
            <Instagram className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() =>
            setSelectedQuotaFilter(selectedQuotaFilter === 'MISSING_FB' ? 'ALL' : 'MISSING_FB')
          }
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
            selectedQuotaFilter === 'MISSING_FB'
              ? 'bg-blue-50 border-blue-400'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
          title="Klik untuk memfilter staf yang belum memiliki Username Facebook"
        >
          <div>
            <span className="text-[11px] font-bold text-[#1877F2] uppercase tracking-wider flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5 text-[#1877F2]" />
              <span>Akun Facebook Terdata</span>
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {quotaStats.fbFilled}{' '}
              <span className="text-xs font-semibold text-slate-500">/ {quotaStats.totalStaff} Staf</span>
            </span>
            <span className="text-[11px] font-medium text-blue-700">
              {quotaStats.missingFb > 0
                ? `${quotaStats.missingFb} belum diisi (Klik filter)`
                : 'Semua akun FB lengkap'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1877F2] flex items-center justify-center">
            <ThumbsUp className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setSelectedQuotaFilter(selectedQuotaFilter === 'UNMET' ? 'ALL' : 'UNMET')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs flex items-center justify-between ${
            quotaStats.unmetCount > 0
              ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/60'
              : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Belum Penuhi Kuota</span>
            </span>
            <span className="text-2xl font-black text-rose-700 mt-0.5 block">
              {quotaStats.unmetCount} <span className="text-xs font-semibold text-rose-600">Staf</span>
            </span>
            <span className="text-[11px] text-slate-500">
              {quotaStats.metCount} selesai ({quotaStats.metPercent}%)
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Target Setting & View Mode Toolbar */}
      <div className="bg-slate-900 p-4 rounded-xl text-white flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-sm border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          {/* Saklar Tampilan Akun */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setAccountViewFilter('both')}
              className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition-all ${
                accountViewFilter === 'both'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tampilkan IG &amp; FB
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountViewFilter('instagram');
                if (setLikePlatform) setLikePlatform('instagram');
              }}
              className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition-all flex items-center gap-1 ${
                accountViewFilter === 'instagram'
                  ? 'bg-pink-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Instagram className="w-3 h-3" />
              <span>Mode IG</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountViewFilter('facebook');
                if (setLikePlatform) setLikePlatform('facebook');
              }}
              className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition-all flex items-center gap-1 ${
                accountViewFilter === 'facebook'
                  ? 'bg-[#1877F2] text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              <span>Mode FB</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-amber-300">Target Harian:</span>
            <select
              value={dailyQuotaTarget}
              onChange={(e) => setDailyQuotaTarget(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value={7}>7 Postingan / Hari</option>
              <option value={5}>5 Postingan / Hari</option>
              <option value={3}>3 Postingan / Hari</option>
              <option value={1}>Minimal 1 Like / Post</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleMarkAllMetQuota(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Tandai Semua Selesai Kuota</span>
          </button>

          <button
            type="button"
            onClick={() => handleMarkAllMetQuota(false)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 border border-slate-700"
          >
            <RefreshCw className="w-3 h-3 text-slate-300" />
            <span>Reset Kuota Hari Ini</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, username IG, atau akun FB..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedQuotaFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedQuotaFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua ({employees.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedQuotaFilter('MISSING_FB')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedQuotaFilter === 'MISSING_FB'
                ? 'bg-[#1877F2] text-white'
                : 'bg-blue-50 text-[#1877F2] hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
            <span>Belum Isi FB ({quotaStats.missingFb})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedQuotaFilter('UNMET')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedQuotaFilter === 'UNMET'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <span>Belum Kuota ({quotaStats.unmetCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedQuotaFilter('MET')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedQuotaFilter === 'MET'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span>Selesai Kuota ({quotaStats.metCount})</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          <select
            value={selectedDivisi}
            onChange={(e) => setSelectedDivisi(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">Semua Divisi ({employees.length})</option>
            {divisionList.map((div) => (
              <option key={div} value={div}>
                {div} ({employees.filter((e) => e.divisi === div).length})
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="Normal">Normal (Wajib Like)</option>
            <option value="Cuti">Cuti</option>
            <option value="Off">Off (Libur)</option>
            <option value="Izin">Izin</option>
            <option value="Sakit">Sakit</option>
            <option value="HP Hilang">HP Hilang</option>
            <option value="Bebas">Bebas</option>
          </select>
        </div>
      </div>

      {/* Employee List Table showing distinct IG & FB Accounts per employee */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 uppercase text-[10px] tracking-wider">
                <th className="pb-2.5 px-2 font-semibold">Divisi</th>
                <th className="pb-2.5 px-2 font-semibold">Nama Karyawan</th>
                {accountViewFilter !== 'facebook' && (
                  <th className="pb-2.5 px-2 font-semibold text-pink-700">Akun Instagram (IG)</th>
                )}
                {accountViewFilter !== 'instagram' && (
                  <th className="pb-2.5 px-2 font-semibold text-[#1877F2]">Akun Facebook (FB)</th>
                )}
                <th className="pb-2.5 px-2 font-semibold text-center">Status Kerja</th>
                <th className="pb-2.5 px-2 font-semibold text-center">Kuota Like</th>
                <th className="pb-2.5 px-2 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => {
                  const isNormal = emp.status === 'Normal';
                  const isUnmet = isNormal && !emp.hasMetDailyQuota;
                  const isMet = isNormal && Boolean(emp.hasMetDailyQuota);

                  return (
                    <tr
                      key={emp.id}
                      className={`transition-colors ${
                        isUnmet
                          ? 'bg-rose-50/35 hover:bg-rose-50/70'
                          : isMet
                          ? 'bg-emerald-50/20 hover:bg-emerald-50/50'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-3 px-2 font-bold text-slate-700">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold">
                          {emp.divisi}
                        </span>
                      </td>

                      <td className="py-3 px-2 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isUnmet ? 'bg-rose-500' : isMet ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                          <span>{emp.nama}</span>
                        </div>
                        {emp.keterangan && (
                          <span className="text-[10px] font-normal text-slate-400 block pl-3.5">
                            {emp.keterangan}
                          </span>
                        )}
                      </td>

                      {/* INSTAGRAM COLUMN */}
                      {accountViewFilter !== 'facebook' && (
                        <td className="py-3 px-2">
                          {emp.username1 ? (
                            <div className="space-y-0.5">
                              <span className="font-mono text-pink-700 font-semibold block">
                                @{emp.username1}
                              </span>
                              {emp.username2 && (
                                <span className="font-mono text-[10px] text-slate-500 block">
                                  2: @{emp.username2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Belum diisi</span>
                          )}
                        </td>
                      )}

                      {/* FACEBOOK COLUMN */}
                      {accountViewFilter !== 'instagram' && (
                        <td className="py-3 px-2">
                          {emp.fbUsername1 ? (
                            <div className="space-y-0.5">
                              <span className="font-semibold text-[#1877F2] block">
                                {emp.fbUsername1}
                              </span>
                              {emp.fbUsername2 && (
                                <span className="text-[10px] text-slate-500 block">
                                  2: {emp.fbUsername2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(emp)}
                              className="text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                            >
                              + Isi Akun FB
                            </button>
                          )}
                        </td>
                      )}

                      <td className="py-3 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(emp.id, emp.status)}
                          title="Klik untuk ubah status kehadiran"
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                            emp.status === 'Normal'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-orange-50 text-orange-700 border border-orange-200'
                          }`}
                        >
                          {emp.status}
                        </button>
                      </td>

                      <td className="py-3 px-2 text-center">
                        {isNormal ? (
                          isUnmet ? (
                            <button
                              type="button"
                              onClick={() => handleToggleEmployeeQuota(emp.id)}
                              className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200 cursor-pointer"
                            >
                              Belum ({dailyQuotaTarget})
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleEmployeeQuota(emp.id)}
                              className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200 cursor-pointer"
                            >
                              Selesai
                            </button>
                          )
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400">
                            Bebas ({emp.status})
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Akun IG & FB Karyawan"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(emp.id, emp.nama)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Karyawan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Tidak ada data karyawan yang cocok dengan pencarian atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ADD / EDIT EMPLOYEE MODAL (WITH SEPARATE IG & FB FIELDS)  */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingEmployee ? 'Edit Akun IG & FB Karyawan' : 'Tambah Karyawan Baru'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  1 data karyawan memuat akun Instagram dan akun Facebook secara terpisah
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase mb-1 block">
                    Divisi / Departemen <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ADMIN NGK"
                    value={formDivisi}
                    onChange={(e) => setFormDivisi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold uppercase text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase mb-1 block">
                    Nama Karyawan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="BINTI"
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 font-semibold"
                  />
                </div>
              </div>

              {/* AKUN INSTAGRAM BOX */}
              <div className="p-3.5 rounded-xl bg-pink-50/50 border border-pink-200/80 space-y-2.5">
                <div className="flex items-center gap-1.5 text-pink-800 font-bold text-xs">
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  <span>Akun Instagram (Tanpa @)</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                      Username IG 1 (Utama)
                    </label>
                    <input
                      type="text"
                      placeholder="bintiandini"
                      value={formUsername1}
                      onChange={(e) => setFormUsername1(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none font-mono text-pink-700 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                      Username IG 2 (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="binti.second"
                      value={formUsername2}
                      onChange={(e) => setFormUsername2(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none font-mono text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* AKUN FACEBOOK BOX */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#1877F2] font-bold text-xs">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Akun Facebook (Nama Profil FB atau Link/Username FB)</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                      Nama / Username FB 1 (Utama)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Binti Andini"
                      value={formFbUsername1}
                      onChange={(e) => setFormFbUsername1(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-blue-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                      Akun FB 2 (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Akun FB kedua / link profil"
                      value={formFbUsername2}
                      onChange={(e) => setFormFbUsername2(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase mb-1 block">
                    Status Kehadiran
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as EmployeeStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="Normal">Normal (Wajib Like)</option>
                    <option value="Cuti">Cuti (Bebas Denda)</option>
                    <option value="Off">Off / Libur (Bebas Denda)</option>
                    <option value="Izin">Izin (Bebas Denda)</option>
                    <option value="Sakit">Sakit (Bebas Denda)</option>
                    <option value="HP Hilang">HP Hilang (Bebas Denda)</option>
                    <option value="Bebas">Bebas</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase mb-1 block">
                    Keterangan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Shift Pagi"
                    value={formKeterangan}
                    onChange={(e) => setFormKeterangan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  {editingEmployee ? 'Simpan Perubahan' : 'Tambah Karyawan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DEDICATED FACEBOOK USERNAME IMPORT MODAL                  */}
      {/* ========================================================= */}
      {isFbImportOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3.5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shadow-sm shrink-0">
                  <ThumbsUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Import Khusus Username / Nama Akun Facebook
                  </h3>
                  <p className="text-xs text-slate-500">
                    Total karyawan tetap <b>{employees.length} staf</b> (tidak menambah/mengubah jumlah karyawan &amp; tidak menimpa akun Instagram).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFbImportOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setFbImportTab('by_name')}
                className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${
                  fbImportTab === 'by_name'
                    ? 'bg-white text-[#1877F2] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Pasangkan Otomatis via Nama Karyawan (Sheet / WA)
              </button>
              <button
                type="button"
                onClick={() => setFbImportTab('by_order')}
                className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${
                  fbImportTab === 'by_order'
                    ? 'bg-white text-[#1877F2] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Tempel 1 Kolom Urut Baris Karyawan
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar text-xs">
              {fbImportTab === 'by_name' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="font-bold text-slate-700">
                      Tempel Daftar Nama Karyawan beserta Nama Akun Facebook-nya:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const sample = employees
                          .slice(0, 8)
                          .map(
                            (e) =>
                              `${e.divisi}\t${e.nama}\t${e.fbUsername1 || `${e.nama.charAt(0)}${e.nama.slice(1).toLowerCase()} Official`}`
                          )
                          .join('\n');
                        setRawFbImportText(sample);
                      }}
                      className="text-[11px] font-bold text-[#1877F2] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Isi Contoh Format dari Staf Anda</span>
                    </button>
                  </div>

                  <textarea
                    rows={5}
                    value={rawFbImportText}
                    onChange={(e) => setRawFbImportText(e.target.value)}
                    placeholder={`Mendukung copy-paste langsung dari Google Sheets / Excel / WhatsApp:\nBINTI - Binti Andini\nMEGA - Megawati Sun\nPUTRI FL\tPutri Rahayu\nFERY OPPO : Papa Athalla`}
                    className="w-full px-3.5 py-2.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500">
                    Pemisah otomatis: <b>Tab (Copy Sheet/Excel)</b>, tanda strip (<code>Nama - Akun FB</code>), titik dua (<code>Nama : Akun FB</code>), atau koma. Jika ada nama staf yang mirip/kembar, Anda dapat memilih staf yang tepat pada tabel pratinjau di bawah.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                    <div>
                      <span className="font-bold text-slate-800 block">
                        Pilih Urutan Divisi Target ({targetEmployeesForOrder.length} Staf):
                      </span>
                      <span className="text-[11px] text-slate-600">
                        Baris ke-1 akan masuk ke staf urutan ke-1, baris ke-2 ke staf urutan ke-2, dst.
                      </span>
                    </div>
                    <select
                      value={fbOrderDivisi}
                      onChange={(e) => setFbOrderDivisi(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-blue-300 rounded-lg font-bold text-slate-800 cursor-pointer"
                    >
                      <option value="ALL">Semua Divisi ({employees.length} Staf)</option>
                      {divisionList.map((div) => (
                        <option key={div} value={div}>
                          {div} ({employees.filter((e) => e.divisi === div).length} Staf)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50 max-h-44 overflow-y-auto custom-scrollbar">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                        Urutan Staf di Database:
                      </span>
                      <ol className="space-y-1 text-[11px] text-slate-700">
                        {targetEmployeesForOrder.map((e, i) => (
                          <li key={e.id} className="truncate">
                            <span className="font-mono text-slate-400 mr-1.5">{i + 1}.</span>
                            <strong className="text-slate-900">{e.nama}</strong>{' '}
                            <span className="text-[10px] text-slate-400">({e.divisi})</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <textarea
                      rows={6}
                      value={rawFbImportText}
                      onChange={(e) => setRawFbImportText(e.target.value)}
                      placeholder={`Tempel 1 kolom daftar Nama/Username Facebook sesuai urutan di samping (1 baris = 1 staf)...`}
                      className="w-full px-3 py-2.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* LIVE MAPPING PREVIEW TABLE */}
              {parsedFbImportRows.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Pratinjau Pemasangan Akun Facebook ({parsedFbImportRows.filter((r) => r.matchedEmployee).length} dari {parsedFbImportRows.length} baris siap disimpan)
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700">
                      Akun IG Tidak Berubah
                    </span>
                  </div>
                  <div className="max-h-56 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-600 uppercase text-[9px] font-bold sticky top-0">
                        <tr>
                          <th className="py-1.5 px-2.5">Input</th>
                          <th className="py-1.5 px-2.5">Karyawan di Database (Bisa Ubah Manual)</th>
                          <th className="py-1.5 px-2.5">IG Tetap</th>
                          <th className="py-1.5 px-2.5 text-[#1877F2]">Akun FB Baru</th>
                          <th className="py-1.5 px-2.5">Status Cocok</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedFbImportRows.map((row) => (
                          <tr
                            key={row.rowIndex}
                            className={
                              row.matchStatus === 'ambiguous'
                                ? 'bg-amber-50/70'
                                : row.matchStatus === 'not_found'
                                ? 'bg-rose-50/50'
                                : 'hover:bg-slate-50'
                            }
                          >
                            <td className="py-1.5 px-2.5 font-medium text-slate-700">
                              {row.rawInputName}
                            </td>
                            <td className="py-1.5 px-2.5">
                              {fbImportTab === 'by_name' ? (
                                <select
                                  value={row.matchedEmployee?.id || ''}
                                  onChange={(e) =>
                                    setManualFbRowTargetOverrides((prev) => ({
                                      ...prev,
                                      [row.rowIndex]: e.target.value,
                                    }))
                                  }
                                  className="px-2 py-1 rounded border border-slate-200 bg-white font-semibold text-slate-900 max-w-[210px] cursor-pointer"
                                >
                                  <option value="">-- Pilih / Abaikan --</option>
                                  {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                      {emp.nama} ({emp.divisi})
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="font-bold text-slate-900">
                                  {row.matchedEmployee
                                    ? `${row.matchedEmployee.nama} (${row.matchedEmployee.divisi})`
                                    : '-'}
                                </span>
                              )}
                              {row.note && (
                                <span className="block text-[10px] text-amber-800 mt-0.5">
                                  {row.note}
                                </span>
                              )}
                            </td>
                            <td className="py-1.5 px-2.5 font-mono text-pink-700">
                              {row.matchedEmployee?.username1
                                ? `@${row.matchedEmployee.username1}`
                                : '-'}
                            </td>
                            <td className="py-1.5 px-2.5 font-bold text-[#1877F2]">
                              {row.fb1}
                              {row.fb2 && (
                                <span className="block text-[10px] font-normal text-slate-500">
                                  2: {row.fb2}
                                </span>
                              )}
                            </td>
                            <td className="py-1.5 px-2.5">
                              {row.matchStatus === 'exact' && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                                  Cocok Tepat
                                </span>
                              )}
                              {row.matchStatus === 'similar' && (
                                <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-bold text-[10px]">
                                  Mirip
                                </span>
                              )}
                              {row.matchStatus === 'ambiguous' && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] inline-flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Cek Nama Mirip</span>
                                </span>
                              )}
                              {row.matchStatus === 'not_found' && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                                  Pilih Manual
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
              <span className="text-[11px] text-slate-500">
                Total karyawan tetap terjaga: <b>{employees.length} Staf</b>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFbImportOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplyFbImport}
                  disabled={parsedFbImportRows.filter((r) => r.matchedEmployee).length === 0}
                  className="px-5 py-2 bg-[#1877F2] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    Simpan Username FB ({parsedFbImportRows.filter((r) => r.matchedEmployee).length} Staf)
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GOOGLE SHEETS FULL EMPLOYEE IMPORT & SYNC MODAL           */}
      {/* ========================================================= */}
      {isSheetSyncOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Import Tabel Karyawan dari Google Sheet
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mendukung kolom IG maupun kolom gabungan IG + FB (akun FB yang sudah ada otomatis dipertahankan)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSheetSyncOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSyncTab('paste')}
                className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  syncTab === 'paste'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>1. Copy-Paste Tabel</span>
              </button>
              <button
                type="button"
                onClick={() => setSyncTab('url')}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  syncTab === 'url'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-4 h-4 text-indigo-600" />
                <span>2. Link Sheet URL</span>
              </button>
              <button
                type="button"
                onClick={() => setSyncTab('guide')}
                className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  syncTab === 'guide'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>3. Panduan</span>
              </button>
            </div>

            {syncMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                  syncMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}
              >
                {syncMessage.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{syncMessage.text}</span>
              </div>
            )}

            {syncTab === 'paste' && (
              <div className="space-y-4">
                <div>
                  <textarea
                    rows={6}
                    value={rawSheetText}
                    onChange={(e) => {
                      setRawSheetText(e.target.value);
                      setSyncMessage(null);
                    }}
                    placeholder={`Tempel baris tabel dari Google Sheet Anda:\nDivisi [Tab] Nama [Tab] Username IG 1 [Tab] IG 2 [Tab] Status [Tab] Ket [Tab] Username FB 1`}
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none custom-scrollbar"
                  />
                </div>

                {parsedSheetEmployees.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <span className="text-xs font-bold text-emerald-700 block">
                      Terdeteksi {parsedSheetEmployees.length} Karyawan Siap Diimport
                    </span>
                    <div className="max-h-40 overflow-y-auto custom-scrollbar border border-slate-200 rounded-lg bg-white">
                      <table className="w-full text-[11px] text-left">
                        <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[9px] sticky top-0">
                          <tr>
                            <th className="py-1 px-2">Divisi</th>
                            <th className="py-1 px-2">Nama</th>
                            <th className="py-1 px-2">IG 1</th>
                            <th className="py-1 px-2">FB 1</th>
                            <th className="py-1 px-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedSheetEmployees.slice(0, 10).map((emp, i) => (
                            <tr key={i}>
                              <td className="py-1 px-2 font-semibold text-slate-700">{emp.divisi}</td>
                              <td className="py-1 px-2 text-slate-900">{emp.nama}</td>
                              <td className="py-1 px-2 font-mono text-pink-700">@{emp.username1}</td>
                              <td className="py-1 px-2 text-[#1877F2]">{emp.fbUsername1 || '-'}</td>
                              <td className="py-1 px-2">{emp.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label
                    onClick={() => setSyncMode('replace')}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer ${
                      syncMode === 'replace'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="syncMode"
                      checked={syncMode === 'replace'}
                      onChange={() => setSyncMode('replace')}
                      className="mt-0.5"
                    />
                    <div>
                      <span>Ganti Semua Data (Replace)</span>
                      <p className="text-[11px] font-normal text-slate-500">
                        Perbarui seluruh tabel karyawan (akun FB yang cocok otomatis dipertahankan).
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setSyncMode('append')}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer ${
                      syncMode === 'append'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="syncMode"
                      checked={syncMode === 'append'}
                      onChange={() => setSyncMode('append')}
                      className="mt-0.5"
                    />
                    <div>
                      <span>Tambahkan Baris Baru (Append)</span>
                      <p className="text-[11px] font-normal text-slate-500">
                        Gabungkan ke daftar karyawan yang sudah ada.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsSheetSyncOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyParsedSheet}
                    disabled={parsedSheetEmployees.length === 0}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Terapkan ({parsedSheetEmployees.length} Karyawan)</span>
                  </button>
                </div>
              </div>
            )}

            {syncTab === 'url' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleFetchSheetUrl}
                    disabled={isSyncing || !sheetUrl.trim()}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isSyncing ? 'Mengambil...' : 'Tarik Data'}</span>
                  </button>
                </div>
              </div>
            )}

            {syncTab === 'guide' && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-slate-700 space-y-2">
                <p className="font-bold text-indigo-950">Tips Pemisahan Username IG &amp; FB:</p>
                <p>
                  Jika daftar karyawan sudah terisi dan Anda hanya ingin memasukkan daftar nama akun Facebook saja tanpa mengubah data karyawan lain, gunakan tombol biru <b>"Import Khusus Username FB"</b> di halaman Data Karyawan!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">{confirmDialog.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
