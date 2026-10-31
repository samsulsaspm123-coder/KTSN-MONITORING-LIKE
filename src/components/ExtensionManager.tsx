import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Copy,
  Check,
  Chrome,
  Terminal,
  Bookmark,
  ExternalLink,
  Info,
  CheckCircle2,
  ShieldCheck,
  FileCode,
  Zap,
  Instagram,
  ThumbsUp,
} from 'lucide-react';
import {
  CHROME_EXTENSION_MANIFEST,
  CHROME_EXTENSION_POPUP_HTML,
  CHROME_EXTENSION_POPUP_JS,
  BOOKMARKLET_CODE,
  FACEBOOK_BOOKMARKLET_CODE,
  CHROME_EXTENSION_README,
  downloadExtensionZip,
} from '../data/extensionFiles';
import { INSTAGRAM_CONSOLE_SCRIPT, FACEBOOK_CONSOLE_SCRIPT } from '../data/gasCodeSnippets';
import { LikePlatformMode } from '../types';

interface ExtensionManagerProps {
  compactMode?: boolean;
  likePlatform?: LikePlatformMode;
  setLikePlatform?: (mode: LikePlatformMode) => void;
  onNavigateToRekap?: () => void;
  onImportLikersToRekap?: (text: string) => void;
}

export function ExtensionManager({
  likePlatform: externalPlatform,
  setLikePlatform: setExternalPlatform,
  onNavigateToRekap,
}: ExtensionManagerProps) {
  const [localPlatform, setLocalPlatform] = useState<LikePlatformMode>('instagram');
  const activePlatform = externalPlatform || localPlatform;
  const handlePlatformSwitch = (mode: LikePlatformMode) => {
    if (setExternalPlatform) setExternalPlatform(mode);
    setLocalPlatform(mode);
  };

  const isFb = activePlatform === 'facebook';

  const [activeSubTab, setActiveSubTab] = useState<'extension-zip' | 'bookmarklet' | 'console-script' | 'file-preview'>('bookmarklet');
  const [activeFilePreview, setActiveFilePreview] = useState<'manifest' | 'popup-html' | 'popup-js' | 'readme'>('manifest');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState<boolean>(false);
  const [copiedFile, setCopiedFile] = useState<boolean>(false);
  const [testPostUrl, setTestPostUrl] = useState<string>('https://www.instagram.com/p/DAxKj2-z9Yw/');

  const bookmarkletAnchorRef = useRef<HTMLAnchorElement | null>(null);

  const activeBookmarkletCode = isFb ? FACEBOOK_BOOKMARKLET_CODE : BOOKMARKLET_CODE;
  const activeConsoleScript = isFb ? FACEBOOK_CONSOLE_SCRIPT : INSTAGRAM_CONSOLE_SCRIPT;

  useEffect(() => {
    if (activeSubTab === 'bookmarklet' && bookmarkletAnchorRef.current) {
      bookmarkletAnchorRef.current.setAttribute('href', activeBookmarkletCode);
    }
  }, [activeSubTab, activeBookmarkletCode]);

  useEffect(() => {
    setTestPostUrl(
      isFb
        ? 'https://www.facebook.com/'
        : 'https://www.instagram.com/p/DAxKj2-z9Yw/'
    );
  }, [isFb]);

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      await downloadExtensionZip();
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(activeBookmarkletCode);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2000);
  };

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
      {/* Header Banner with Unified IG / FB Switcher */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="max-w-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Chrome className="w-4 h-4 text-amber-400" />
              <span>Ekstensi Chrome Universal v2.0 &amp; Bookmarklet 1-Klik</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Ekstrak Akun Like {isFb ? 'Facebook' : 'Instagram'} Otomatis
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Satu menu terpadu dengan <b>Saklar Mode Instagram &amp; Facebook</b>. Gunakan Bookmarklet sesuai platform yang sedang dicek, atau pasang 1 Ekstensi Chrome v2.0 yang otomatis bekerja di Instagram maupun Facebook!
            </p>
          </div>

          {/* SAKLAR PEMBEDA MODE IG / FB */}
          <div className="bg-slate-950/90 p-2 rounded-xl border border-slate-700 shrink-0 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 block">
              Saklar Mode Ekstraktor:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handlePlatformSwitch('instagram')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  !isFb
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Mode Instagram</span>
              </button>
              <button
                type="button"
                onClick={() => handlePlatformSwitch('facebook')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isFb
                    ? 'bg-[#1877F2] text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Mode Facebook</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-5 mt-5 border-t border-slate-800">
          <button
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Menyiapkan File ZIP...' : 'Unduh Ekstensi Chrome v2.0 (IG + FB .ZIP)'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bookmarklet')}
            className={`px-4 py-2.5 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
              isFb ? 'bg-[#1877F2] hover:bg-blue-600' : 'bg-pink-600 hover:bg-pink-500'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Bookmarklet Khusus {isFb ? 'Facebook' : 'Instagram'}</span>
          </button>

          {onNavigateToRekap && (
            <button
              onClick={onNavigateToRekap}
              className="px-4 py-2.5 bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/40 flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>Buka Rekap Like ({isFb ? 'Mode FB' : 'Mode IG'}) &rarr;</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSubTab('bookmarklet')}
          className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'bookmarklet'
              ? isFb
                ? 'border-[#1877F2] text-[#1877F2] bg-blue-50/60 rounded-t-lg'
                : 'border-pink-600 text-pink-600 bg-pink-50/60 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4 text-amber-500" />
          <span>1. Bookmarklet {isFb ? 'Facebook' : 'Instagram'} (Tanpa Install)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('extension-zip')}
          className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'extension-zip'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Chrome className="w-4 h-4" />
          <span>2. Ekstensi Chrome v2.0 (Bisa IG &amp; FB Sekaligus)</span>
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
          <span>3. Script F12 Console ({isFb ? 'Facebook' : 'Instagram'})</span>
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
          <span>4. Source Code Ekstensi v2.0</span>
        </button>
      </div>

      {/* TAB CONTENT 1: 1-KLIK BOOKMARKLET (SWITCHES BETWEEN IG & FB) */}
      {activeSubTab === 'bookmarklet' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                {isFb ? (
                  <ThumbsUp className="w-4 h-4 text-[#1877F2]" />
                ) : (
                  <Instagram className="w-4 h-4 text-pink-600" />
                )}
                <span>
                  Bookmarklet Khusus {isFb ? 'Facebook (Reactions / Tanggapan)' : 'Instagram (Likes / Suka)'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isFb
                  ? 'Dirancang khusus membaca jendela popup Semua Tanggapan (👍❤️) di Facebook Web tanpa gagal.'
                  : 'Dirancang khusus membaca jendela popup Likes di Instagram Web.'}
              </p>
            </div>

            <button
              onClick={handleCopyBookmarklet}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {copiedBookmarklet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>
                {copiedBookmarklet
                  ? `Kode Bookmarklet ${isFb ? 'FB' : 'IG'} Tersalin!`
                  : `Salin Kode Bookmarklet ${isFb ? 'FB' : 'IG'}`}
              </span>
            </button>
          </div>

          {/* Drag & Drop Target Area */}
          <div
            className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center space-y-3 ${
              isFb
                ? 'bg-blue-50/60 border-blue-300'
                : 'bg-pink-50/50 border-pink-300'
            }`}
          >
            <p className="text-xs text-slate-700 font-medium">
              Seret tombol di bawah ini ke <b>Bookmarks Bar (Ctrl + Shift + B)</b> browser Anda, atau klik untuk salin kodenya:
            </p>

            <a
              ref={bookmarkletAnchorRef}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleCopyBookmarklet();
              }}
              className={`px-6 py-3 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform ${
                isFb ? 'bg-[#1877F2] hover:bg-blue-700' : 'bg-pink-600 hover:bg-pink-700'
              }`}
              title="Seret ke Bookmark Bar atau klik untuk salin kodenya"
            >
              {copiedBookmarklet ? (
                <Check className="w-4 h-4 text-emerald-300" />
              ) : isFb ? (
                <ThumbsUp className="w-4 h-4 text-white" />
              ) : (
                <Zap className="w-4 h-4 text-amber-300" />
              )}
              <span>
                {copiedBookmarklet
                  ? `Kode Bookmarklet ${isFb ? 'Facebook' : 'Instagram'} Tersalin!`
                  : isFb
                  ? '👍 Ekstrak Likers FB (Seret / Klik Salin)'
                  : '⚡ Ekstrak Likers IG (Seret / Klik Salin)'}
              </span>
            </a>

            <div className="text-[11px] text-slate-600 max-w-xl space-y-1">
              <p>
                Tips: Anda bisa menyimpan 2 bookmark berdampingan di Chrome Bar: satu <b>⚡ Ekstrak Likers IG</b> dan satu <b>👍 Ekstrak Likers FB</b>!
              </p>
              <p className="text-[10px] text-slate-500">
                Cara pasang manual: Klik tombol di atas untuk salin kode &gt; Tekan <b>Ctrl + Shift + O</b> &gt; Klik titik 3 kanan atas &gt; <i>Add new bookmark</i> &gt; Tempel kode di kolom URL &gt; Simpan.
              </p>
            </div>
          </div>

          {/* Cara Pakai */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                <span>{isFb ? 'Buka Tanggapan Postingan FB' : 'Buka Modal Likes IG'}</span>
              </div>
              <p className="text-[11px] text-slate-600">
                {isFb
                  ? 'Buka postingan di Facebook Web, lalu klik angka/ikon jempol & hati (👍❤️) di bawah postingan hingga daftar nama orang muncul.'
                  : 'Buka postingan di Instagram Web, lalu klik tulisan jumlah "Likes/Suka" hingga daftar username muncul.'}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Klik Bookmark {isFb ? 'FB' : 'IG'}</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Klik bookmark <b>{isFb ? '👍 Ekstrak Likers FB' : '⚡ Ekstrak Likers IG'}</b> di bilah atas browser. Panel melayang akan otomatis menggulir daftar sampai habis.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">3</span>
                <span>Paste di Rekap ({isFb ? 'Mode FB' : 'Mode IG'})</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Daftar akun otomatis tersalin ke Clipboard. Buka menu Rekap Like WA, pastikan saklar di <b>{isFb ? 'Mode Facebook' : 'Mode Instagram'}</b>, lalu klik <b>Tempel dari Clipboard</b>!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: CHROME EXTENSION (.ZIP) */}
      {activeSubTab === 'extension-zip' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Ekstensi Chrome v2.0 Universal (Instagram + Facebook Jadi Satu)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Jika sebelumnya Anda memakai ekstensi lama (v1.1 khusus IG), silakan unduh versi v2.0 ini dan timpa/muat ulang di <code>chrome://extensions</code>.
                  </p>
                </div>
                <button
                  onClick={handleDownloadZip}
                  disabled={isDownloading}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ZIP v2.0</span>
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-1">
                    <strong className="text-slate-900 text-xs block">Unduh &amp; Ekstrak Folder ZIP v2.0</strong>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Klik tombol <b>Download ZIP v2.0</b> di atas lalu ekstrak ke folder komputer Anda.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="space-y-1">
                    <strong className="text-slate-900 text-xs block">Pasang via Load Unpacked di Chrome / Edge</strong>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Buka <code>chrome://extensions</code> &gt; Aktifkan <b>Developer mode</b> &gt; Klik <b>Load unpacked</b> &gt; Pilih folder ekstrak tadi.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-1">
                    <strong className="text-emerald-900 text-xs block">Otomatis Mengenali Tab Instagram &amp; Facebook!</strong>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Saat diklik di tab Facebook, saklar di dalam popup ekstensi otomatis berpindah ke <b>Mode Facebook</b> dan siap mengekstrak daftar tanggapan/like beserta Screenshot Panjangnya!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Keunggulan v2.0 (IG + FB)</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><b>Deteksi Scroll Facebook Pintar:</b> Membaca dialog Reactions terbaru Facebook dan menyaring tombol "Tambah Teman / Teman Bersama".</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><b>Tangkap Nama + Username URL FB:</b> Mengambil nama profil FB sekaligus username URL agar pencocokan karyawan lebih akurat.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><b>100% Aman Tanpa Login Pihak Ke-3:</b> Bekerja murni di tab browser Anda sendiri.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-indigo-600" />
                <span>Buka Postingan {isFb ? 'Facebook' : 'Instagram'}</span>
              </h4>
              <input
                type="text"
                value={testPostUrl}
                onChange={(e) => setTestPostUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={isFb ? 'https://www.facebook.com/...' : 'https://www.instagram.com/p/...'}
              />
              <a
                href={testPostUrl || (isFb ? 'https://www.facebook.com' : 'https://www.instagram.com')}
                target="_blank"
                rel="noreferrer"
                className={`w-full py-2 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  isFb ? 'bg-[#1877F2] hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <span>Buka di Tab Baru</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: CONSOLE SCRIPT F12 */}
      {activeSubTab === 'console-script' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <span>
                  Script F12 Console 1-Klik — Mode {isFb ? 'Facebook Reactions' : 'Instagram Likes'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {isFb
                  ? 'Buka popup Tanggapan/Like di Facebook Web > Tekan F12 (Console) > Paste script ini & Enter.'
                  : 'Buka popup Likes di Instagram Web > Tekan F12 (Console) > Paste script ini & Enter.'}
              </p>
            </div>

            <button
              onClick={() => handleCopyFile(activeConsoleScript)}
              className={`px-3.5 py-2 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm ${
                isFb ? 'bg-[#1877F2] hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {copiedFile ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFile ? 'Script Tersalin!' : `Salin Script Console ${isFb ? 'FB' : 'IG'}`}</span>
            </button>
          </div>

          <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs max-h-72 overflow-y-auto custom-scrollbar border border-slate-800 select-all">
            <pre className="whitespace-pre">{activeConsoleScript}</pre>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: FILE PREVIEW */}
      {activeSubTab === 'file-preview' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Source Code File Ekstensi Chrome v2.0 (IG &amp; FB)
              </h3>
              <p className="text-xs text-slate-500">
                Kode sumber lengkap ekstensi universal v2.0.
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
                <span>Unduh ZIP v2.0</span>
              </button>
            </div>
          </div>

          <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
            {(['manifest', 'popup-html', 'popup-js', 'readme'] as const).map((fileKey) => (
              <button
                key={fileKey}
                onClick={() => setActiveFilePreview(fileKey)}
                className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                  activeFilePreview === fileKey
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {fileKey === 'manifest'
                  ? 'manifest.json'
                  : fileKey === 'popup-html'
                  ? 'popup.html'
                  : fileKey === 'popup-js'
                  ? 'popup.js'
                  : 'README.md'}
              </button>
            ))}
          </div>

          <div className="bg-slate-950 text-indigo-300 p-4 rounded-xl font-mono text-xs max-h-80 overflow-y-auto custom-scrollbar border border-slate-800 select-all">
            <pre className="whitespace-pre">{getActiveFileContent()}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
