import React, { useState, useMemo, ChangeEvent, FormEvent } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
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
  Link as LinkIcon
} from 'lucide-react';
import { Employee, EmployeeStatus } from '../types';
import { DEFAULT_EMPLOYEES } from '../data/defaultEmployees';

interface EmployeeManagerProps {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  onNavigateToRekap: () => void;
}

export function EmployeeManager({ employees, setEmployees, onNavigateToRekap }: EmployeeManagerProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDivisi, setSelectedDivisi] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State
  const [formDivisi, setFormDivisi] = useState<string>('KASIR');
  const [formNama, setFormNama] = useState<string>('');
  const [formUsername1, setFormUsername1] = useState<string>('');
  const [formUsername2, setFormUsername2] = useState<string>('');
  const [formStatus, setFormStatus] = useState<EmployeeStatus>('Normal');
  const [formKeterangan, setFormKeterangan] = useState<string>('');

  // Google Sheets Import & Sync Modal
  const [isSheetSyncOpen, setIsSheetSyncOpen] = useState<boolean>(false);
  const [syncTab, setSyncTab] = useState<'paste' | 'url' | 'guide'>('paste');
  const [rawSheetText, setRawSheetText] = useState<string>('');
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMode, setSyncMode] = useState<'replace' | 'append'>('replace');
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Parse raw pasted spreadsheet text
  const parsedSheetEmployees = useMemo(() => {
    if (!rawSheetText.trim()) return [];

    const lines = rawSheetText.trim().split(/\r?\n/);
    const results: Employee[] = [];

    const validStatuses: EmployeeStatus[] = ['Normal', 'Cuti', 'Off', 'Izin', 'Sakit', 'HP Hilang'];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Split by tab (standard for Google Sheets copy-paste) or comma / semicolon
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

      // Check if this line is header
      const firstCol = (cols[0] || '').toLowerCase();
      const secondCol = (cols[1] || '').toLowerCase();
      const thirdCol = (cols[2] || '').toLowerCase();
      if (
        firstCol.includes('divisi') ||
        firstCol.includes('departemen') ||
        firstCol.includes('department') ||
        firstCol === 'no' ||
        firstCol === 'no.' ||
        secondCol.includes('departemen') ||
        secondCol.includes('divisi') ||
        secondCol.includes('nama') ||
        thirdCol.includes('nama') ||
        firstCol.includes('nama')
      ) {
        return; // Skip header row
      }

      let divisi = 'UMUM';
      let nama = '';
      let username1 = '';
      let username2 = '';
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

      // Check if Column 0 is a row number (e.g. "1", "2", "3")
      const isFirstColNumber = /^\d+$/.test(cols[0]?.trim());

      if (isFirstColNumber && cols.length >= 4) {
        // Pattern: [No] [Divisi] [Nama] [Username 1] [Username 2] [Status] [Keterangan]
        divisi = cols[1]?.toUpperCase() || 'UMUM';
        nama = cols[2] || '';
        username1 = cols[3]?.replace(/^@+/, '').toLowerCase() || '';
        username2 = cols[4]?.replace(/^@+/, '').toLowerCase() || '';
        if (cols[5]) {
          status = matchStatus(cols[5]);
        }
        keterangan = cols.slice(6).join(', ').trim();
      } else if (cols.length >= 5) {
        // Pattern: [Divisi] [Nama] [Username 1] [Username 2] [Status] [Keterangan]
        divisi = cols[0]?.toUpperCase() || 'UMUM';
        nama = cols[1] || '';
        username1 = cols[2]?.replace(/^@+/, '').toLowerCase() || '';
        username2 = cols[3]?.replace(/^@+/, '').toLowerCase() || '';
        status = matchStatus(cols[4]);
        keterangan = cols.slice(5).join(', ').trim();
      } else if (cols.length === 4) {
        divisi = cols[0]?.toUpperCase() || 'UMUM';
        nama = cols[1] || '';
        username1 = cols[2]?.replace(/^@+/, '').toLowerCase() || '';
        const fourth = cols[3]?.trim();
        const detectedSt = matchStatus(fourth);
        if (detectedSt !== 'Normal' || fourth.toLowerCase() === 'normal') {
          status = detectedSt;
        } else {
          username2 = fourth?.replace(/^@+/, '').toLowerCase() || '';
        }
      } else if (cols.length === 3) {
        divisi = cols[0]?.toUpperCase() || 'UMUM';
        nama = cols[1] || '';
        username1 = cols[2]?.replace(/^@+/, '').toLowerCase() || '';
      } else if (cols.length === 2) {
        nama = cols[0] || '';
        username1 = cols[1]?.replace(/^@+/, '').toLowerCase() || '';
      } else if (cols.length === 1 && cols[0]) {
        nama = cols[0];
        username1 = cols[0].toLowerCase().replace(/\s+/g, '_');
      }

      if (nama.trim() || username1.trim()) {
        results.push({
          id: `EMP-SHT-${Date.now().toString().slice(-4)}-${index + 1}`,
          divisi: divisi.trim() || 'UMUM',
          nama: nama.trim() || username1,
          username1: username1.trim() || nama.toLowerCase().replace(/\s+/g, '_'),
          username2: username2.trim() || undefined,
          status,
          keterangan: keterangan.trim() || undefined,
        });
      }
    });

    return results;
  }, [rawSheetText]);

  // Apply parsed data to database
  const handleApplyParsedSheet = () => {
    if (parsedSheetEmployees.length === 0) {
      setSyncMessage({ type: 'error', text: 'Tidak ada data valid yang dapat diproses. Pastikan Anda menempel baris tabel dari Google Sheet.' });
      return;
    }

    if (syncMode === 'replace') {
      setEmployees(parsedSheetEmployees);
      setSyncMessage({ type: 'success', text: `Sukses! Seluruh database digantikan dengan ${parsedSheetEmployees.length} karyawan dari Google Sheet Anda.` });
    } else {
      setEmployees([...employees, ...parsedSheetEmployees]);
      setSyncMessage({ type: 'success', text: `Sukses! ${parsedSheetEmployees.length} karyawan baru ditambahkan ke database.` });
    }

    setTimeout(() => {
      setIsSheetSyncOpen(false);
      setRawSheetText('');
      setSyncMessage(null);
    }, 1200);
  };

  // Fetch live from Google Sheets URL (CSV Export link or Web App)
  const handleFetchSheetUrl = async () => {
    if (!sheetUrl.trim()) {
      setSyncMessage({ type: 'error', text: 'Masukkan tautan Google Sheet terlebih dahulu.' });
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);

    try {
      let targetUrl = sheetUrl.trim();
      
      // Auto convert standard Google Sheet URL to CSV export link if applicable
      // Example: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0 -> export?format=csv
      const match = targetUrl.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && !targetUrl.includes('export?format=csv') && !targetUrl.includes('pub?output=csv')) {
        const id = match[1];
        // check gid
        const gidMatch = targetUrl.match(/gid=([0-9]+)/);
        const gid = gidMatch ? gidMatch[1] : '0';
        targetUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
      }

      const res = await fetch(targetUrl);
      if (!res.ok) {
        throw new Error(`Gagal mengambil data (HTTP ${res.status}). Pastikan Google Sheet Anda diatur ke "Siapa saja yang memiliki link dapat melihat" atau gunakan metode Copy-Paste.`);
      }

      const text = await res.text();
      setRawSheetText(text);
      setSyncTab('paste');
      setSyncMessage({ type: 'success', text: 'Data Google Sheets berhasil diunduh! Silakan periksa pratinjau di bawah lalu klik Terapkan.' });
    } catch (err: any) {
      setSyncMessage({ 
        type: 'error', 
        text: err.message || 'Gagal terhubung ke Google Sheet. Kami menyarankan menggunakan tab "Copy-Paste Langsung" yang bekerja 100% instan tanpa perlu akses publik.' 
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Divisions list
  const divisionList = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => set.add(e.divisi));
    return Array.from(set).sort();
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchQuery =
        emp.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.username1.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.username2 && emp.username2.toLowerCase().includes(searchQuery.toLowerCase())) ||
        emp.divisi.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDiv = selectedDivisi === 'ALL' || emp.divisi === selectedDivisi;
      const matchStatus = selectedStatus === 'ALL' || emp.status === selectedStatus;

      return matchQuery && matchDiv && matchStatus;
    });
  }, [employees, searchQuery, selectedDivisi, selectedStatus]);

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormDivisi(divisionList[0] || 'KASIR');
    setFormNama('');
    setFormUsername1('');
    setFormUsername2('');
    setFormStatus('Normal');
    setFormKeterangan('');
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormDivisi(emp.divisi);
    setFormNama(emp.nama);
    setFormUsername1(emp.username1);
    setFormUsername2(emp.username2 || '');
    setFormStatus(emp.status);
    setFormKeterangan(emp.keterangan || '');
    setIsModalOpen(true);
  };

  // Save Add/Edit
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formUsername1.trim()) {
      alert('Nama karyawan dan Username 1 wajib diisi!');
      return;
    }

    const cleanU1 = formUsername1.trim().replace(/^@+/, '').toLowerCase();
    const cleanU2 = formUsername2.trim().replace(/^@+/, '').toLowerCase();

    if (editingEmployee) {
      // Update
      const updated = employees.map((emp) =>
        emp.id === editingEmployee.id
          ? {
              ...emp,
              divisi: formDivisi.trim().toUpperCase(),
              nama: formNama.trim(),
              username1: cleanU1,
              username2: cleanU2,
              status: formStatus,
              keterangan: formKeterangan.trim(),
            }
          : emp
      );
      setEmployees(updated);
    } else {
      // Create new
      const newEmp: Employee = {
        id: `EMP-${Date.now().toString().slice(-4)}`,
        divisi: formDivisi.trim().toUpperCase(),
        nama: formNama.trim(),
        username1: cleanU1,
        username2: cleanU2,
        status: formStatus,
        keterangan: formKeterangan.trim(),
      };
      setEmployees([...employees, newEmp]);
    }

    setIsModalOpen(false);
  };

  // Delete
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data karyawan "${name}"?`)) {
      setEmployees(employees.filter((emp) => emp.id !== id));
    }
  };

  // Quick toggle status
  const handleQuickStatusChange = (id: string, currentStatus: EmployeeStatus) => {
    const statuses: EmployeeStatus[] = ['Normal', 'Cuti', 'Off', 'Izin', 'Sakit', 'HP Hilang'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    setEmployees(
      employees.map((emp) => (emp.id === id ? { ...emp, status: nextStatus } : emp))
    );
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (confirm('Reset seluruh daftar karyawan kembali ke data contoh default?')) {
      setEmployees(DEFAULT_EMPLOYEES);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Divisi', 'Nama Karyawan', 'Username 1', 'Username 2', 'Status', 'Keterangan'];
    const rows = employees.map((e) => [
      `"${e.divisi}"`,
      `"${e.nama}"`,
      `"${e.username1}"`,
      `"${e.username2 || ''}"`,
      `"${e.status}"`,
      `"${e.keterangan || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Karyawan_Monitoring_Like_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import from CSV
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

        // Basic CSV regex split
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((col) =>
          col.replace(/^"(.*)"$/, '$1').trim()
        );

        if (cols.length >= 3 && cols[1]) {
          parsed.push({
            id: `EMP-IMP-${i}`,
            divisi: cols[0]?.toUpperCase() || 'UMUM',
            nama: cols[1],
            username1: cols[2]?.replace(/^@+/, '').toLowerCase() || '',
            username2: cols[3]?.replace(/^@+/, '').toLowerCase() || '',
            status: (['Normal', 'Cuti', 'Off', 'Izin', 'Sakit', 'HP Hilang'].includes(cols[4])
              ? cols[4]
              : 'Normal') as EmployeeStatus,
            keterangan: cols[5] || '',
          });
        }
      }

      if (parsed.length > 0) {
        setEmployees(parsed);
        alert(`Berhasil mengimpor ${parsed.length} data karyawan dari file CSV!`);
      } else {
        alert('Format file CSV tidak sesuai. Pastikan kolom sesuai template.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
              Sheet 'Daftar Karyawan'
            </span>
            <span className="text-xs text-slate-500">
              Total: <strong className="text-slate-800">{employees.length} Staff</strong>
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1 tracking-tight">
            Daftar &amp; Status Karyawan Retail
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Kelola data divisi, nama, username Instagram (utama &amp; cadangan), serta status kehadiran (Normal, Cuti, Off, dll).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setRawSheetText('');
              setSyncMessage(null);
              setIsSheetSyncOpen(true);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.99]"
            title="Import langsung dari Google Sheet Anda (Copy-Paste / Link)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Import dari Google Sheet</span>
          </button>

          <button
            id="btn-add-employee"
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.99]"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Tambah Manual</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-slate-200"
            title="Download file CSV untuk Google Sheets"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-slate-200">
            <Upload className="w-3.5 h-3.5" />
            <span>Import File CSV</span>
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
            title="Kembalikan ke data contoh toko retail"
          >
            Reset Default
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, divisi, atau username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        {/* Division & Status Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Divisi:</span>
          </div>
          <select
            value={selectedDivisi}
            onChange={(e) => setSelectedDivisi(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">Semua Divisi ({employees.length})</option>
            {divisionList.map((div) => {
              const count = employees.filter((e) => e.divisi === div).length;
              return (
                <option key={div} value={div}>
                  {div} ({count})
                </option>
              );
            })}
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
          </select>
        </div>
      </div>

      {/* Employee List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 uppercase text-[10px] tracking-wider">
                <th className="pb-2.5 font-semibold">Divisi</th>
                <th className="pb-2.5 font-semibold">Nama Karyawan</th>
                <th className="pb-2.5 font-semibold">Username IG 1</th>
                <th className="pb-2.5 font-semibold">Username IG 2</th>
                <th className="pb-2.5 font-semibold text-center">Status Kehadiran</th>
                <th className="pb-2.5 font-semibold">Keterangan</th>
                <th className="pb-2.5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 font-bold text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold">
                        {emp.divisi}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-slate-900">
                      {emp.nama}
                    </td>
                    <td className="py-2.5 font-mono text-indigo-600 font-medium">
                      @{emp.username1}
                    </td>
                    <td className="py-2.5 font-mono text-slate-500">
                      {emp.username2 ? `@${emp.username2}` : '-'}
                    </td>
                    <td className="py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(emp.id, emp.status)}
                        title="Klik untuk ubah status cepat (Normal -> Cuti -> Off, dll)"
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                          emp.status === 'Normal'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-orange-50 text-orange-700 border border-orange-100'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          emp.status === 'Normal' ? 'bg-emerald-500' : 'bg-orange-500'
                        }`} />
                        {emp.status}
                      </button>
                    </td>
                    <td className="py-2.5 text-slate-500 text-[11px]">
                      {emp.keterangan || '-'}
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Karyawan"
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
                ))
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
      {/* ADD / EDIT EMPLOYEE MODAL DIALOG                          */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block" htmlFor="emp-divisi">
                  Divisi / Departemen <span className="text-rose-500">*</span>
                </label>
                <input
                  id="emp-divisi"
                  type="text"
                  required
                  placeholder="Contoh: KASIR, PRAMUNIAGA, GUDANG, VM, SPV"
                  value={formDivisi}
                  onChange={(e) => setFormDivisi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold uppercase text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block" htmlFor="emp-nama">
                  Nama Lengkap Karyawan <span className="text-rose-500">*</span>
                </label>
                <input
                  id="emp-nama"
                  type="text"
                  required
                  placeholder="Contoh: Siti Rahmawati"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block" htmlFor="emp-u1">
                    Username IG 1 (Utama) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="emp-u1"
                    type="text"
                    required
                    placeholder="siti_rahma99"
                    value={formUsername1}
                    onChange={(e) => setFormUsername1(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-indigo-700 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block" htmlFor="emp-u2">
                    Username IG 2 (Opsional)
                  </label>
                  <input
                    id="emp-u2"
                    type="text"
                    placeholder="sitirahma.real"
                    value={formUsername2}
                    onChange={(e) => setFormUsername2(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block" htmlFor="emp-status">
                  Status Karyawan
                </label>
                <select
                  id="emp-status"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as EmployeeStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-slate-800 cursor-pointer"
                >
                  <option value="Normal">Normal (Wajib Like &amp; Kena Denda jika belum)</option>
                  <option value="Cuti">Cuti (Pengecualian / Bebas Denda)</option>
                  <option value="Off">Off / Libur (Pengecualian / Bebas Denda)</option>
                  <option value="Izin">Izin (Pengecualian / Bebas Denda)</option>
                  <option value="Sakit">Sakit (Pengecualian / Bebas Denda)</option>
                  <option value="HP Hilang">HP Hilang / Rusak (Pengecualian / Bebas Denda)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block" htmlFor="emp-ket">
                  Keterangan Tambahan (Opsional)
                </label>
                <input
                  id="emp-ket"
                  type="text"
                  placeholder="Contoh: Shift Pagi, Area Kasir 1"
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700"
                />
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
      {/* GOOGLE SHEETS IMPORT & SYNC MODAL                         */}
      {/* ========================================================= */}
      {isSheetSyncOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Import dari Google Sheet yang Sudah Ada
                  </h3>
                  <p className="text-xs text-slate-500">
                    Masukkan data daftar karyawan dari spreadsheet Anda ke dalam sistem
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSheetSyncOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
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
                <span>1. Copy-Paste dari Google Sheet (Paling Mudah)</span>
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
                <span>3. Pasang Langsung di Sheets</span>
              </button>
            </div>

            {/* Status Feedback Message */}
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

            {/* TAB 1: PASTE SPREADSHEET TABLE */}
            {syncTab === 'paste' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Tempel (Paste) Baris Tabel dari Google Sheet Anda:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setRawSheetText(`1\tUMUM / NGK\tYAYAK\tsuryarahmad64\t\tBebas
2\tADMIN NGK\tBINTI\tbintiandini\t\tNormal
3\tADMIN NGK\tMEGA\tmegawati.sun\t\tNormal
4\tADMIN NGK\tMYTHA\tmythalusia\t\tCuti
5\tADMIN NGK\tCHRISTIN\tchristinn.df\t\tNormal
6\tADMIN NGK\tTIARA\ttiaraindrianip\t\tNormal
13\tMS, FL & PROMOTOR NGK\tWAHYU MS\twahyusaputro2023\t\tNormal
18\tMS, FL & PROMOTOR NGK\tMUSTAIN FL\tmstn_12\t\tNormal
20\tMS, FL & PROMOTOR NGK\tDIMAS OPPO\tahm.dimasep\t\tNormal
22\tMS, FL & PROMOTOR NGK\tRENDY SAMSUNG\trxn1st\t\tNormal
26\tG1 ELEKT NGK\tBAYU\tbayusukmaaaa\t\tNormal`);
                      }}
                      className="text-[11px] text-emerald-700 hover:underline font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>Contoh Data KTSN Anda</span>
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    value={rawSheetText}
                    onChange={(e) => {
                      setRawSheetText(e.target.value);
                      setSyncMessage(null);
                    }}
                    placeholder={`Cara paling mudah:
1. Buka tab "Daftar Karyawan" di Google Sheet Anda (Data_Monitoring_Like_Karyawan_V5_KTSN).
2. Blok tabel karyawan (Ctrl+A atau seleksi cell baris 1 sampai baris terakhir).
3. Tekan Ctrl+C (Copy).
4. Klik di dalam kotak ini, lalu tekan Ctrl+V (Paste).
5. Klik tombol hijau "Terapkan" di bawah.`}
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none custom-scrollbar"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    * Otomatis membaca kolom No, Departemen/Divisi, Nama, Username IG 1 &amp; 2, serta Status Karyawan Anda.
                  </p>
                </div>

                {/* Live Parsed Preview */}
                {parsedSheetEmployees.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center gap-1.5 text-emerald-700">
                        <Check className="w-3.5 h-3.5" />
                        <span>Terdeteksi {parsedSheetEmployees.length} Karyawan Siap Diimport:</span>
                      </span>
                    </div>

                    <div className="max-h-40 overflow-y-auto custom-scrollbar border border-slate-200 rounded-lg bg-white">
                      <table className="w-full text-[11px] text-left">
                        <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[9px] sticky top-0">
                          <tr>
                            <th className="py-1 px-2">Divisi</th>
                            <th className="py-1 px-2">Nama</th>
                            <th className="py-1 px-2">IG 1</th>
                            <th className="py-1 px-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedSheetEmployees.slice(0, 10).map((emp, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="py-1 px-2 font-semibold text-slate-700">{emp.divisi}</td>
                              <td className="py-1 px-2 text-slate-900">{emp.nama}</td>
                              <td className="py-1 px-2 font-mono text-indigo-600">@{emp.username1}</td>
                              <td className="py-1 px-2">
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                  emp.status === 'Normal' ? 'text-emerald-700 bg-emerald-50' : 'text-orange-700 bg-orange-50'
                                }`}>
                                  {emp.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {parsedSheetEmployees.length > 10 && (
                      <p className="text-[10px] text-slate-400 text-right">
                        + {parsedSheetEmployees.length - 10} karyawan lainnya...
                      </p>
                    )}
                  </div>
                )}

                {/* Import Mode Options */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label
                    onClick={() => setSyncMode('replace')}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      syncMode === 'replace'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="syncMode"
                      checked={syncMode === 'replace'}
                      onChange={() => setSyncMode('replace')}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div>
                      <span>Ganti Semua Data (Replace)</span>
                      <p className="text-[11px] font-normal text-slate-500">
                        Kosongkan database lama dan isi murni dengan data Google Sheet ini.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setSyncMode('append')}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      syncMode === 'append'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="syncMode"
                      checked={syncMode === 'append'}
                      onChange={() => setSyncMode('append')}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div>
                      <span>Tambahkan ke Database (Append)</span>
                      <p className="text-[11px] font-normal text-slate-500">
                        Pertahankan data yang sudah ada dan gabungkan data baru ini.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Action Buttons */}
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
                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      parsedSheetEmployees.length > 0
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Terapkan ({parsedSheetEmployees.length} Karyawan)</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: FETCH VIA SPREADSHEET URL */}
            {syncTab === 'url' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Masukkan URL Google Sheet Anda:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sheetUrl}
                      onChange={(e) => setSheetUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                      className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleFetchSheetUrl}
                      disabled={isSyncing || !sheetUrl.trim()}
                      className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 text-white cursor-pointer ${
                        isSyncing || !sheetUrl.trim()
                          ? 'bg-slate-300 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'
                      }`}
                    >
                      {isSyncing ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>{isSyncing ? 'Mengambil...' : 'Tarik Data'}</span>
                    </button>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5">
                  <p className="font-bold flex items-center gap-1 text-amber-950">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Catatan Izin Akses Google Sheet:</span>
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Pastikan tombol <strong>Bagikan (Share)</strong> di Google Sheet Anda diatur ke <strong>"Siapa saja yang memiliki link dapat melihat (Viewer)"</strong> agar aplikasi dapat membaca baris data. Jika Sheet bersifat privat kantor, gunakan opsi <strong>"1. Copy-Paste dari Google Sheet"</strong> yang 100% instan dan tidak membutuhkan akses publik.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: GUIDE PASANG KE GOOGLE SHEET ANDA */}
            {syncTab === 'guide' && (
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-900 space-y-2.5">
                  <h4 className="font-bold text-indigo-950 text-sm">
                    Cara Menghubungkan Langsung ke File Google Sheet Anda:
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Jika Anda ingin aplikasi ini terpasang langsung di dalam Google Sheet Anda (sehingga setiap perubahan nama/status di Google Sheet langsung otomatis terbaca tanpa perlu copy-paste lagi):
                  </p>
                  <ol className="list-decimal pl-4 space-y-1.5 text-slate-700">
                    <li>Buka file <strong>Google Sheets</strong> yang sudah Anda miliki.</li>
                    <li>Pastikan nama tab lembar kerja bernama <code>Daftar Karyawan</code> (atau sesuaikan di script).</li>
                    <li>Klik menu di atas: <strong>Ekstensi &gt; Apps Script</strong>.</li>
                    <li>Buka menu <strong>"Kode Google Apps Script"</strong> di aplikasi ini, lalu salin <code>Code.gs</code> dan <code>Index.html</code> ke editor Apps Script Anda.</li>
                    <li>Klik <strong>Terapkan &gt; Penerapan Baru</strong> &gt; Tipe <strong>Aplikasi Web</strong> &gt; Siapa saja (Anyone).</li>
                    <li>Selesai! Anda akan memiliki Web App pribadi yang 100% tersambung ke Google Sheet Anda.</li>
                  </ol>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
