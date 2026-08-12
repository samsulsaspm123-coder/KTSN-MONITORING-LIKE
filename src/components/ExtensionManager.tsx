import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Globe,
  Chrome,
  Terminal,
  Bookmark,
  ExternalLink,
  Sparkles,
  Info,
  CheckCircle2,
  FolderArchive,
  ArrowRight,
  ShieldCheck,
  FileCode,
  Zap,
  Play
} from 'lucide-react';
import JSZip from 'jszip';
import {
  CHROME_EXTENSION_MANIFEST,
  CHROME_EXTENSION_POPUP_HTML,
  CHROME_EXTENSION_POPUP_JS,
  CHROME_EXTENSION_CONTENT_JS,
  BOOKMARKLET_CODE,
  CHROME_EXTENSION_README
} from '../data/extensionFiles';
import { INSTAGRAM_CONSOLE_SCRIPT } from '../data/gasCodeSnippets';

interface ExtensionManagerProps {
  compactMode?: boolean;
  onNavigateToRekap?: () => void;
  onImportLikersToRekap?: (text: string) => void;
}

export function ExtensionManager({ compactMode = false, onNavigateToRekap }: ExtensionManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'extension-zip' | 'bookmarklet' | 'console-script' | 'file-preview'>('extension-zip');
  const [activeFilePreview, setActiveFilePreview] = useState<'manifest' | 'popup-html' | 'popup-js' | 'readme'>('manifest');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState<boolean>(false);
  const [copiedFile, setCopiedFile] = useState<boolean>(false);
  const [testIgUrl, setTestIgUrl] = useState<string>('https://www.instagram.com/p/DAxKj2-z9Yw/');

  // Handle Download Extension as ZIP
  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const zip = new JSZip();

      // Add files to zip
      zip.file('manifest.json', CHROME_EXTENSION_MANIFEST);
      zip.file('popup.html', CHROME_EXTENSION_POPUP_HTML);
      zip.file('popup.js', CHROME_EXTENSION_POPUP_JS);
      zip.file('content.js', CHROME_EXTENSION_CONTENT_JS);
      zip.file('README.md', CHROME_EXTENSION_README);

      // Generate blob
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Trigger download
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'IG-Liker-Exporter-Chrome-Extension.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy Bookmarklet
  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(BOOKMARKLET_CODE);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2000);
  };

  // Copy Current File Preview
  const handleCopyFile = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const getActiveFileContent = () => {
    switch (activeFilePreview) {
      case 'manifest':
        return CHROME_EXTENSION_MANIFEST;
      case 'popup-html':
        return CHROME_EXTENSION_POPUP_HTML;
      case 'popup-js':
        return CHROME_EXTENSION_POPUP_JS;
      case 'readme':
        return CHROME_EXTENSION_README;
      default:
        return CHROME_EXTENSION_MANIFEST;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Chrome className="w-3.5 h-3.5" />
            <span>Fitur Ekstensi Browser &amp; Bookmarklet 1-Klik</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Ekstrak Likers Instagram Otomatis via Ekstensi Browser
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Sama seperti ekstensi <i>Instagram Follower/Liker Export Tool</i>, kini Anda bisa mengekstrak ratusan username likers langsung dari postingan Instagram dengan 1-klik, 100% aman tanpa minta password, dan otomatis tersinkron ke Web App Monitoring ini.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Menyiapkan File ZIP...' : 'Unduh Ekstensi Chrome (.ZIP)'}</span>
            </button>

            <button
              onClick={() => setActiveSubTab('bookmarklet')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span>Pakai Bookmarklet (Tanpa Install)</span>
            </button>

            {onNavigateToRekap && (
              <button
                onClick={onNavigateToRekap}
                className="px-4 py-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/40 flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Buka Generator Rekap &rarr;</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSubTab('extension-zip')}
          className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'extension-zip'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Chrome className="w-4 h-4" />
          <span>1. Ekstensi Chrome (.ZIP)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bookmarklet')}
          className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'bookmarklet'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4 text-amber-500" />
          <span>2. 1-Klik Bookmarklet (Instan)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('console-script')}
          className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'console-script'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>3. Script F12 Console</span>
        </button>

        <button
          onClick={() => setActiveSubTab('file-preview')}
          className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'file-preview'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>4. Source Code Ekstensi</span>
        </button>
      </div>

      {/* TAB CONTENT 1: CHROME EXTENSION (.ZIP) */}
      {activeSubTab === 'extension-zip' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Step-by-Step Installation */}
          <div className="lg:col-span-2 space-y-4">
            
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Cara Pasang Ekstensi Chrome (Hanya 15 Detik)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bisa digunakan di Google Chrome, Microsoft Edge, Brave, dan Opera.
                  </p>
                </div>
                <button
                  onClick={handleDownloadZip}
                  disabled={isDownloading}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ZIP</span>
                </button>
              </div>

              {/* Steps */}
              <div className="space-y-3 pt-2">
                <div className="flex gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-1">
                    <strong className="text-slate-900 text-xs block">Unduh &amp; Ekstrak File ZIP</strong>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Klik tombol <b>"Unduh Ekstensi Chrome (.ZIP)"</b> di atas, lalu ekstrak/unzip folder tersebut di komputer Anda (misal ke folder <code>Documents/IG-Liker-Exporter</code>).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="space-y-1">
                    <strong className="text-slate-900 text-xs block">Buka Halaman Ekstensi Browser</strong>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Buka tab baru di browser Anda dan ketik:
                    </p>
                    <div className="bg-slate-900 text-emerald-400 p-2 rounded-lg font-mono text-[11px]">
                      chrome://extensions &nbsp;&nbsp;<span className="text-slate-400">(atau edge://extensions jika pakai Edge)</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-1">
                    <strong className="text-slate-900 text-xs block">Nyalakan Developer Mode &amp; Load Unpacked</strong>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Aktifkan toggle <b>"Developer mode" (Mode Pengembang)</b> di pojok kanan atas browser &gt; Klik tombol <b>"Load unpacked" (Muat yang belum dibongkar)</b> di pojok kiri atas &gt; Pilih folder yang sudah Anda ekstrak tadi.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="space-y-1">
                    <strong className="text-emerald-900 text-xs block">Selesai! Ikon Ekstensi Siap Digunakan</strong>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Kini saat Anda membuka postingan Instagram dan mengklik jumlah Like, cukup klik ikon ekstensi ⚡ <b>IG Liker Exporter</b> di toolbar browser Anda untuk mengekstrak ratusan username likers dalam 3 detik!
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Right Col: Why Extension vs Scraper Bot */}
          <div className="space-y-4">
            
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Kenapa Pakai Ekstensi Browser?</span>
              </h4>
              
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><b>100% Aman &amp; Anti-Banned:</b> Ekstensi berjalan di browser Anda sendiri memanfaatkan sesi login resmi Instagram.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><b>Tanpa Minta Password:</b> Tidak memerlukan login akun sekunder atau password Instagram Anda.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><b>Auto-Scroll Modal:</b> Otomatis menggulir ke bawah hingga semua ratusan orang yang like berhasil tertangkap.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><b>1-Klik Salin ke Web App:</b> Hasil langsung disalin ke Clipboard dan siap dianalisis di Rekapitulasi WA.</span>
                </li>
              </ul>
            </div>

            {/* Test Post Helper */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 space-y-3">
              <h4 className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-indigo-600" />
                <span>Uji Coba Postingan Instagram</span>
              </h4>
              <p className="text-xs text-indigo-950">
                Masukkan link postingan Instagram toko Anda untuk langsung membuka tab Instagram:
              </p>
              <input
                type="text"
                value={testIgUrl}
                onChange={(e) => setTestIgUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-indigo-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://www.instagram.com/p/..."
              />
              <a
                href={testIgUrl || 'https://www.instagram.com'}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Buka Postingan di Tab Baru</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>
      )}

      {/* TAB CONTENT 2: 1-KLIK BOOKMARKLET */}
      {activeSubTab === 'bookmarklet' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-500" />
                <span>Bookmarklet: Ekstensi 1-Klik Tanpa Perlu Install Apapun</span>
              </h3>
              <p className="text-xs text-slate-500">
                Cukup seret (drag &amp; drop) tombol di bawah ke Bookmark Bar browser Anda.
              </p>
            </div>

            <button
              onClick={handleCopyBookmarklet}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {copiedBookmarklet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedBookmarklet ? 'Kode Bookmarklet Tersalin!' : 'Salin Kode Bookmarklet'}</span>
            </button>
          </div>

          {/* Drag & Drop Target Area */}
          <div className="p-6 bg-gradient-to-r from-amber-50 via-indigo-50 to-amber-50 border-2 border-dashed border-amber-300 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
            <p className="text-xs text-slate-600 font-medium">
              👉 <b>Seret tombol biru di bawah ini</b> langsung ke <b>Bookmarks Bar (Bilah Bookmark)</b> browser Anda:
            </p>

            <a
              href={BOOKMARKLET_CODE}
              onClick={(e) => {
                e.preventDefault();
                alert('💡 Untuk memasang: Seret (drag & drop) tombol ini ke Bookmarks Bar browser Anda (Ctrl+Shift+B jika belum muncul bar-nya).');
              }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
              title="Seret saya ke Bookmark Bar browser Anda!"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>⚡ Ekstrak Likers IG</span>
            </a>

            <p className="text-[11px] text-slate-500 max-w-md">
              (Jika Bookmarks Bar belum muncul, tekan <b>Ctrl + Shift + B</b> di Chrome / Edge untuk menampilkannya).
            </p>
          </div>

          {/* Cara Pakai Bookmarklet */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="block text-slate-900 text-xs">1. Buka Postingan IG</strong>
              <p className="text-[11px] text-slate-600">
                Buka postingan Instagram di browser lalu klik tulisan jumlah <b>"Likes/Suka"</b>.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="block text-slate-900 text-xs">2. Klik Bookmark</strong>
              <p className="text-[11px] text-slate-600">
                Klik tombol <b>⚡ Ekstrak Likers IG</b> di baris bookmark browser Anda.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="block text-slate-900 text-xs">3. Paste di Web App</strong>
              <p className="text-[11px] text-slate-600">
                Semua username otomatis tersalin ke Clipboard. Tinggal tekan <b>Ctrl+V</b> di Generator Rekap!
              </p>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT 3: CONSOLE SCRIPT F12 */}
      {activeSubTab === 'console-script' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <span>Script F12 Console 1-Klik (Paling Ringan &amp; Instan)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Script otomatis yang men-scroll modal likes sampai habis dan menyalin ke clipboard.
              </p>
            </div>

            <button
              onClick={() => handleCopyFile(INSTAGRAM_CONSOLE_SCRIPT)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {copiedFile ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFile ? 'Script Tersalin!' : 'Salin Script Console'}</span>
            </button>
          </div>

          <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs max-h-72 overflow-y-auto custom-scrollbar border border-slate-800 select-all">
            <pre className="whitespace-pre">{INSTAGRAM_CONSOLE_SCRIPT}</pre>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: FILE PREVIEW */}
      {activeSubTab === 'file-preview' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Source Code File Ekstensi Chrome
              </h3>
              <p className="text-xs text-slate-500">
                Bisa Anda lihat atau salin langsung per file jika ingin membuat foldernya secara manual.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyFile(getActiveFileContent())}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Salin File Ini</span>
              </button>

              <button
                onClick={handleDownloadZip}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh ZIP</span>
              </button>
            </div>
          </div>

          {/* File selector pills */}
          <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveFilePreview('manifest')}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                activeFilePreview === 'manifest' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              manifest.json
            </button>
            <button
              onClick={() => setActiveFilePreview('popup-html')}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                activeFilePreview === 'popup-html' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              popup.html
            </button>
            <button
              onClick={() => setActiveFilePreview('popup-js')}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                activeFilePreview === 'popup-js' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              popup.js
            </button>
            <button
              onClick={() => setActiveFilePreview('readme')}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                activeFilePreview === 'readme' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              README.md
            </button>
          </div>

          {/* Code Viewer */}
          <div className="bg-slate-950 text-indigo-300 p-4 rounded-xl font-mono text-xs max-h-80 overflow-y-auto custom-scrollbar border border-slate-800 select-all">
            <pre className="whitespace-pre">{getActiveFileContent()}</pre>
          </div>
        </div>
      )}

    </div>
  );
}
