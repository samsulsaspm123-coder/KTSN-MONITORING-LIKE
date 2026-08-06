import { useState } from 'react';
import { 
  Code, 
  Copy, 
  Check, 
  Download, 
  FileSpreadsheet, 
  Terminal, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  GAS_CODE_GS, 
  GAS_INDEX_HTML, 
  INSTAGRAM_CONSOLE_SCRIPT, 
  SHEETS_TEMPLATE_STRUCTURE 
} from '../data/gasCodeSnippets';

interface GasDeployGuideProps {
  defaultTab?: 'code-gs' | 'index-html' | 'sheet-template' | 'step-by-step' | 'console-ig';
}

export function GasDeployGuide({ defaultTab = 'code-gs' }: GasDeployGuideProps) {
  const [subTab, setSubTab] = useState<'code-gs' | 'index-html' | 'sheet-template' | 'step-by-step' | 'console-ig'>(
    defaultTab
  );

  const [copiedCodeGs, setCopiedCodeGs] = useState<boolean>(false);
  const [copiedIndexHtml, setCopiedIndexHtml] = useState<boolean>(false);
  const [copiedConsole, setCopiedConsole] = useState<boolean>(false);

  // Copy Code.gs
  const handleCopyCodeGs = () => {
    navigator.clipboard.writeText(GAS_CODE_GS).then(() => {
      setCopiedCodeGs(true);
      setTimeout(() => setCopiedCodeGs(false), 2000);
    });
  };

  // Copy Index.html
  const handleCopyIndexHtml = () => {
    navigator.clipboard.writeText(GAS_INDEX_HTML).then(() => {
      setCopiedIndexHtml(true);
      setTimeout(() => setCopiedIndexHtml(false), 2000);
    });
  };

  // Copy Console IG script
  const handleCopyConsole = () => {
    navigator.clipboard.writeText(INSTAGRAM_CONSOLE_SCRIPT).then(() => {
      setCopiedConsole(true);
      setTimeout(() => setCopiedConsole(false), 2000);
    });
  };

  // Download files
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Paket Deployment Google Apps Script (100% Gratis)
            </span>
            <span className="text-xs text-slate-400">&bull; Native Google Workspace</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Kode Lengkap Google Apps Script & Panduan Pasang
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Semua kode Apps Script (Backend <code>Code.gs</code> dan Frontend <code>Index.html</code>) siap disalin ke Google Sheets untuk dijalankan sebagai Web App cloud gratis selamanya.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadFile(GAS_CODE_GS, 'Code.gs', 'text/javascript')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Code.gs</span>
          </button>

          <button
            onClick={() => downloadFile(GAS_INDEX_HTML, 'Index.html', 'text/html')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Index.html</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex overflow-x-auto p-1 bg-slate-100/80 rounded-xl max-w-full space-x-1 text-xs font-bold">
        <button
          onClick={() => setSubTab('code-gs')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            subTab === 'code-gs'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code className="w-4 h-4 text-indigo-600" />
          <span>1. Backend (Code.gs)</span>
        </button>

        <button
          onClick={() => setSubTab('index-html')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            subTab === 'index-html'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-pink-600" />
          <span>2. Frontend (Index.html)</span>
        </button>

        <button
          onClick={() => setSubTab('sheet-template')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            subTab === 'sheet-template'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>3. Struktur Google Sheets</span>
        </button>

        <button
          onClick={() => setSubTab('step-by-step')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            subTab === 'step-by-step'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span>4. Panduan Deploy & Izin Akses</span>
        </button>

        <button
          onClick={() => setSubTab('console-ig')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            subTab === 'console-ig'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4 text-slate-800" />
          <span>5. Script Console IG</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CODE.GS                                            */}
      {/* ========================================================= */}
      {subTab === 'code-gs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between border-b border-slate-800 text-white">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono font-bold text-slate-300 ml-2">Code.gs (Apps Script Backend)</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyCodeGs}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                {copiedCodeGs ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode Code.gs</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[600px] custom-scrollbar select-all">
            <pre className="leading-relaxed whitespace-pre">{GAS_CODE_GS}</pre>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: INDEX.HTML                                         */}
      {/* ========================================================= */}
      {subTab === 'index-html' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between border-b border-slate-800 text-white">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono font-bold text-slate-300 ml-2">Index.html (Apps Script HTML Interface)</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyIndexHtml}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                {copiedIndexHtml ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode Index.html</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[600px] custom-scrollbar select-all">
            <pre className="leading-relaxed whitespace-pre">{GAS_INDEX_HTML}</pre>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: GOOGLE SHEETS TEMPLATE STRUCTURE                   */}
      {/* ========================================================= */}
      {subTab === 'sheet-template' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>Struktur Sheet: 'Daftar Karyawan'</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Buat Sheet baru di Google Spreadsheet Anda dan beri nama tab persis <strong>Daftar Karyawan</strong> dengan susunan kolom berikut:
            </p>
          </div>

          {/* Table of columns */}
          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-bold w-16 text-center">Kolom</th>
                  <th className="py-3 px-4 font-bold w-40">Nama Header (Baris 1)</th>
                  <th className="py-3 px-4 font-bold w-48">Contoh Nilai</th>
                  <th className="py-3 px-4 font-bold">Penjelasan & Ketentuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SHEETS_TEMPLATE_STRUCTURE.map((col) => (
                  <tr key={col.column} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold font-mono text-center bg-slate-50 text-indigo-700">
                      {col.column}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {col.header}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-700 bg-emerald-50/50">
                      {col.sample}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {col.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Data Validation Info */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 space-y-2">
            <h4 className="font-bold flex items-center space-x-1.5 text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Validasi Dropdown Kolom E (Status):</span>
            </h4>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              Buat validasi dropdown pada kolom E dengan opsi: <code>Normal, Cuti, Off, Izin, Sakit, HP Hilang</code>.<br />
              Skrip secara cerdas hanya akan mengenakan denda pada karyawan dengan status <strong>Normal</strong> yang belum like postingan.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: STEP BY STEP DEPLOY & PERMISSIONS GUIDE            */}
      {/* ========================================================= */}
      {subTab === 'step-by-step' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Petunjuk Langkah Demi Langkah Memasang & Men-deploy Web App</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ikuti panduan berikut untuk memasang Web App di Google Sheets tanpa biaya server (100% Gratis).
            </p>
          </div>

          {/* Steps Timeline */}
          <div className="space-y-4">
            
            {/* Step 1 */}
            <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-900">Buka Google Sheets Baru</h4>
                <p className="text-slate-600">
                  Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold">sheets.new</a> di browser Anda. Beri judul spreadsheet, misalnya: <code>Data Monitoring Like Karyawan Retail</code>.
                </p>
                <p className="text-slate-500 text-[11px]">
                  Beri nama tab pertama persis <code>Daftar Karyawan</code> dan isi kolom sesuai struktur (atau gunakan tombol Export CSV dari menu Karyawan lalu impor ke Sheet).
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-900">Buka Menu Ekstensi &gt; Apps Script</h4>
                <p className="text-slate-600">
                  Pada bilah menu atas Google Sheets, klik menu <strong>Ekstensi (Extensions)</strong> &gt; pilih <strong>Apps Script</strong>. Tab editor skrip baru akan terbuka.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-900">Paste Kode Backend (Code.gs)</h4>
                <p className="text-slate-600">
                  Di file default <code>Code.gs</code>, hapus semua kode bawaan, lalu paste seluruh isi kode dari tab <strong>1. Backend (Code.gs)</strong> di atas.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                4
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-900">Buat File HTML Baru Bernama "Index"</h4>
                <p className="text-slate-600">
                  Di panel kiri editor Apps Script, klik tombol <strong>+ (Tambah file)</strong> &gt; pilih <strong>HTML</strong> &gt; beri nama <code>Index</code> (tanpa .html).
                </p>
                <p className="text-slate-500 text-[11px]">
                  Hapus isi file Index.html bawaan dan paste seluruh isi kode dari tab <strong>2. Frontend (Index.html)</strong>.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                5
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-900">Deploy sebagai Web App (Penerapan Baru)</h4>
                <p className="text-slate-600">
                  Klik tombol biru <strong>Deploy (Terapkan)</strong> di pojok kanan atas &gt; pilih <strong>New deployment (Penerapan baru)</strong>.
                </p>
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-[11px] space-y-1.5 mt-2">
                  <div className="font-bold text-indigo-900">⚙️ Atur Konfigurasi Penerapan:</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    <li><strong>Pilih jenis:</strong> Klik icon gerigi &gt; pilih <strong>Web App (Aplikasi Web)</strong></li>
                    <li><strong>Description:</strong> <code>Monitoring Like IG v1</code></li>
                    <li><strong>Execute as (Jalankan sebagai):</strong> <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Me (Email Anda)</span></li>
                    <li><strong>Who has access (Siapa yang memiliki akses):</strong> <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">Anyone (Siapa saja)</span></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 6: Permissions authorization guide */}
            <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                6
              </div>
              <div className="space-y-1 text-xs text-amber-950">
                <h4 className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Pengaturan Izin Akses (Authorization Permissions)</span>
                </h4>
                <p className="text-amber-900 leading-relaxed">
                  Saat pertama kali klik Deploy, Google akan meminta konfirmasi izin akses spreadsheet:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-amber-900 mt-1">
                  <li>Klik <strong>Review Permissions (Tinjau Izin)</strong>.</li>
                  <li>Pilih akun Google Anda.</li>
                  <li>Jika muncul peringatan <em>"Google hasn't verified this app"</em>, klik teks kecil <strong>Advanced (Lanjutan)</strong> di bagian bawah.</li>
                  <li>Klik link <strong>Go to (nama project) (unsafe)</strong>.</li>
                  <li>Klik tombol <strong>Allow (Izinkan)</strong>.</li>
                </ol>
              </div>
            </div>

            {/* Step 7 */}
            <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                7
              </div>
              <div className="space-y-1 text-xs text-emerald-950">
                <h4 className="font-bold">Salin URL Web App & Siap Digunakan!</h4>
                <p className="text-emerald-900">
                  Google Apps Script akan menghasilkan <strong>Web App URL</strong> (contoh: <code>https://script.google.com/macros/s/.../exec</code>). Salin URL tersebut dan bagikan ke tim supervisor atau simpan sebagai bookmark.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: SCRIPT CONSOLE IG                                  */}
      {/* ========================================================= */}
      {subTab === 'console-ig' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-indigo-600" />
              <span>Script Console Ekstraksi Likers Instagram Otomatis</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Gunakan script ini di Google Chrome / Edge untuk mengekstrak seluruh username dari modal likers Instagram hanya dalam 1 detik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">1. Buka Modal Likers</span>
              <p className="text-slate-600 text-[11px]">Buka postingan di Instagram Web, lalu klik jumlah "Likes/Suka".</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">2. Buka DevTools (F12)</span>
              <p className="text-slate-600 text-[11px]">Tekan <strong>F12</strong> &gt; klik tab <strong>Console</strong>.</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">3. Paste & Enter</span>
              <p className="text-slate-600 text-[11px]">Paste kode di bawah ini lalu tekan Enter. Likers langsung tersalin ke clipboard!</p>
            </div>
          </div>

          <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
            <div className="px-4 py-2.5 bg-slate-900 flex items-center justify-between border-b border-slate-800">
              <span className="text-xs font-mono text-slate-300 font-semibold">instagram-extractor.js</span>
              <button
                onClick={handleCopyConsole}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-all"
              >
                {copiedConsole ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Script Console</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-4 text-emerald-400 font-mono text-xs overflow-x-auto custom-scrollbar select-all">
              <pre className="whitespace-pre leading-relaxed">{INSTAGRAM_CONSOLE_SCRIPT}</pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
