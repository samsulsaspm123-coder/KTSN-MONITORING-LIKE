import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  Check,
  Copy,
  ExternalLink,
  Zap,
  Globe,
  AlertCircle,
  RefreshCw,
  Code2,
  CheckCircle2,
  HelpCircle,
  Link as LinkIcon,
  X
} from 'lucide-react';
import { generateGoogleAppsScriptForDesignSync } from '../data/spreadsheetMatrixData';

interface SheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  webAppUrl: string;
  onSaveWebAppUrl: (url: string) => void;
  autoSyncEnabled: boolean;
  onToggleAutoSync: (enabled: boolean) => void;
  onTestConnection: () => Promise<boolean>;
  onPushAllWeeksToCloud?: () => Promise<boolean>;
  isSyncing: boolean;
}

export function SheetsSyncModal({
  isOpen,
  onClose,
  webAppUrl,
  onSaveWebAppUrl,
  autoSyncEnabled,
  onToggleAutoSync,
  onTestConnection,
  onPushAllWeeksToCloud,
  isSyncing,
}: SheetsSyncModalProps) {
  const [inputUrl, setInputUrl] = useState(webAppUrl);
  const [activeTab, setActiveTab] = useState<'settings' | 'code' | 'guide'>('settings');
  const [copiedCode, setCopiedCode] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const scriptCode = generateGoogleAppsScriptForDesignSync();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(scriptCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSave = () => {
    onSaveWebAppUrl(inputUrl.trim());
    onClose();
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const ok = await onTestConnection();
      if (ok) {
        setTestResult({
          success: true,
          message: 'Koneksi Google Sheets Apps Script Berhasil Terhubung!',
        });
      } else {
        setTestResult({
          success: false,
          message: 'Gagal terhubung. Pastikan Web App di-deploy dengan akses "Anyone" (Siapa Saja).',
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Error menghubungi endpoint. Periksa URL Web App Anda.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Sinkronisasi Google Spreadsheet Realtime</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-black uppercase">
                  LIVE API
                </span>
              </h3>
              <p className="text-xs text-emerald-200/80">
                Sheet &quot;ELEKTRONIK&quot; &bull; Pewarnaan Produk Otomatis &bull; 2-Way Sync
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Pengaturan & URL Web App
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-emerald-600 text-emerald-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Script Google Apps Script (Code.gs)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Panduan 1 Menit
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>URL Web App Google Apps Script (Exec Endpoint)</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    (Dihasilkan dari Deploy &gt; New deployment &gt; Web app)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Saat diisi, setiap Anda men-generate atau mengklik tombol <strong>&quot;Sync ke Spreadsheet&quot;</strong>, data item desain otomatis dikirim dan diwarnai di sheet <code>ELEKTRONIK</code>.
                </p>
              </div>

              {/* Auto Sync Toggle */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>Auto-Sync Realtime Saat Generate</span>
                  </h4>
                  <p className="text-[11px] text-emerald-800/80">
                    Otomatis kirim item desain harian ke Google Sheets setiap kali tombol &quot;Generate&quot; diklik.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSyncEnabled}
                    onChange={(e) => onToggleAutoSync(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Test Connection Button & Result */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRunTest}
                  disabled={isTesting || !inputUrl}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Menguji Koneksi...' : 'Uji Koneksi Google Sheets'}</span>
                </button>

                {onPushAllWeeksToCloud && (
                  <button
                    type="button"
                    disabled={isSyncing || !inputUrl}
                    onClick={async () => {
                      setPushStatus('Mengirim data...');
                      const ok = await onPushAllWeeksToCloud();
                      if (ok) {
                        setPushStatus('Sukses! Seluruh 6 minggu terkirim ke Google Sheets.');
                        setTimeout(() => setPushStatus(null), 4000);
                      } else {
                        setPushStatus('Gagal mengirim. Periksa URL Web App Anda.');
                        setTimeout(() => setPushStatus(null), 4000);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                  >
                    <span>🚀 Push Seluruh Matriks 6 Minggu ke Sheets Sekarang</span>
                  </button>
                )}
              </div>

              {pushStatus && (
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{pushStatus}</span>
                </div>
              )}

              {testResult && (
                <div
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Salin script di bawah ini ke <strong>Extensions &gt; Apps Script</strong> di Spreadsheet Google Anda:
                </p>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Tersalin!' : 'Salin Script'}</span>
                </button>
              </div>

              <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 font-mono text-[11px] overflow-x-auto max-h-72 border border-slate-800 select-all">
                <pre>{scriptCode}</pre>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <h4 className="font-black text-emerald-950 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">⭐</span>
                  CARA PALING CEPAT (1-KLIK DI GOOGLE SHEETS):
                </h4>
                <ol className="list-decimal pl-5 space-y-1 text-slate-700">
                  <li>Buka Google Spreadsheet Anda, lalu klik menu <strong>Ekstensi &gt; Apps Script</strong>.</li>
                  <li>Tempelkan kode dari tab <strong>Script Google Apps Script</strong> di atas ke file <code>Code.gs</code>.</li>
                  <li>Di toolbar atas Apps Script, pilih fungsi <strong><code>setupFullElectronicSchedule</code></strong> lalu klik tombol ▶️ <strong>Jalankan (Run)</strong>.</li>
                  <li>Selesai! Seluruh tabel 6 minggu, baris tanggal hitam, dan warna produk otomatis langsung terisi rapi!</li>
                </ol>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">🌐</span>
                  CARA SINKRONISASI REALTIME OTOMATIS (WEB APP):
                </h4>
                <ol className="list-decimal pl-5 space-y-1 text-slate-600">
                  <li>Di Apps Script, klik tombol biru <strong>Deploy &gt; New deployment (Kelola deployment baru)</strong>.</li>
                  <li>Pilih tipe <strong>Web app</strong>.</li>
                  <li>Atur <em>Execute as</em>: <strong>Me (email Anda)</strong> dan <em>Who has access</em>: <strong>Anyone (Siapa saja)</strong>.</li>
                  <li>Klik <strong>Deploy</strong>, lalu salin URL Web App dan tempelkan ke tab <strong>Pengaturan &amp; URL Web App</strong> di modal ini.</li>
                  <li>Klik tombol <strong>&quot;🚀 Push Seluruh Matriks 6 Minggu ke Sheets Sekarang&quot;</strong>.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-md transition-colors"
          >
            Simpan Pengaturan
          </button>
        </div>
      </motion.div>
    </div>
  );
}
