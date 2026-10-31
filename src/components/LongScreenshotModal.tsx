import React, { useState, useRef, useMemo } from 'react';
import html2canvas from 'html2canvas';
import {
  Camera,
  Download,
  Copy,
  Check,
  X,
  Instagram,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  ThumbsUp,
} from 'lucide-react';
import { LikersProcessResult, Employee, LikePlatformMode } from '../types';

interface LongScreenshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: LikersProcessResult | null;
  employees: Employee[];
  storeCode: string;
  urlPost: string;
  platform?: LikePlatformMode;
}

type FilterMode = 'liked_employees' | 'all_likers' | 'penalized_employees';
type ThemeMode = 'dark' | 'light';

export const LongScreenshotModal: React.FC<LongScreenshotModalProps> = ({
  isOpen,
  onClose,
  result,
  storeCode,
  urlPost,
  platform = 'instagram',
}) => {
  const activePlatform: LikePlatformMode = result?.platform || platform;
  const isFb = activePlatform === 'facebook';

  const [filterMode, setFilterMode] = useState<FilterMode>('liked_employees');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [includeHeaderBadge, setIncludeHeaderBadge] = useState<boolean>(true);
  const [includeDivisionBadge, setIncludeDivisionBadge] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(0.85);

  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  const displayItems = useMemo(() => {
    if (!result) return [];

    if (filterMode === 'liked_employees') {
      return result.allResults
        .filter((item) => item.hasLiked && !item.isExempt)
        .map((item) => ({
          username: isFb
            ? item.matchedUsername || item.employee.fbUsername1 || item.employee.nama
            : item.matchedUsername || item.employee.username1,
          name: item.employee.nama,
          divisi: item.employee.divisi,
          isEmployee: true,
          status: 'Liked',
          isPenalized: false,
        }));
    }

    if (filterMode === 'penalized_employees') {
      return result.allResults
        .filter((item) => item.isPenalized)
        .map((item) => ({
          username: isFb
            ? item.employee.fbUsername1 || item.employee.nama
            : item.employee.username1,
          name: item.employee.nama,
          divisi: item.employee.divisi,
          isEmployee: true,
          status: 'Denda (Belum Like)',
          isPenalized: true,
        }));
    }

    const list: Array<{
      username: string;
      name: string;
      divisi?: string;
      isEmployee: boolean;
      status: string;
      isPenalized: boolean;
    }> = [];

    result.allResults
      .filter((item) => item.hasLiked)
      .forEach((item) => {
        list.push({
          username: isFb
            ? item.matchedUsername || item.employee.fbUsername1 || item.employee.nama
            : item.matchedUsername || item.employee.username1,
          name: item.employee.nama,
          divisi: item.employee.divisi,
          isEmployee: true,
          status: 'Liked',
          isPenalized: false,
        });
      });

    if (result.unrecognizedLikers && result.unrecognizedLikers.length > 0) {
      result.unrecognizedLikers.forEach((u) => {
        list.push({
          username: u,
          name: isFb ? 'Akun Facebook Publik' : u,
          isEmployee: false,
          status: 'Eksternal',
          isPenalized: false,
        });
      });
    }

    return list;
  }, [result, filterMode, isFb]);

  const getAvatarGradient = (username: string) => {
    const gradients = isFb
      ? [
          'from-blue-600 to-indigo-700',
          'from-sky-500 to-blue-700',
          'from-indigo-500 to-blue-600',
          'from-cyan-600 to-blue-700',
        ]
      : [
          'from-fuchsia-500 via-rose-500 to-amber-500',
          'from-purple-600 to-indigo-600',
          'from-cyan-500 to-blue-600',
          'from-emerald-500 to-teal-700',
          'from-rose-500 to-orange-500',
          'from-violet-600 to-pink-600',
          'from-blue-600 to-indigo-800',
        ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  const handleDownloadPNG = async () => {
    if (!previewContainerRef.current) return;
    setIsExporting(true);
    setErrorMsg(null);

    try {
      const element = previewContainerRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: themeMode === 'dark' ? (isFb ? '#242526' : '#262626') : '#ffffff',
        logging: false,
        windowWidth: 800,
      });

      const dateStr = result?.tanggalStr?.replace(/\//g, '-') || new Date().toISOString().slice(0, 10);
      const fileName = `screenshot-panjang-like-${isFb ? 'fb' : 'ig'}-${storeCode.toLowerCase()}-${dateStr}.png`;

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export screenshot PNG:', err);
      setErrorMsg('Gagal membuat gambar screenshot panjang. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImageToClipboard = async () => {
    if (!previewContainerRef.current) return;
    setIsExporting(true);
    setErrorMsg(null);

    try {
      const element = previewContainerRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: themeMode === 'dark' ? (isFb ? '#242526' : '#262626') : '#ffffff',
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2500);
        } catch {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `screenshot-panjang-like-${isFb ? 'fb' : 'ig'}-${storeCode}.png`;
          link.click();
          URL.revokeObjectURL(url);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2500);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to copy screenshot image:', err);
      setErrorMsg('Gagal menyalin gambar ke clipboard. Gunakan tombol Download PNG.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
                isFb
                  ? 'bg-[#1877F2] shadow-blue-500/20'
                  : 'bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-600 shadow-pink-500/20'
              }`}
            >
              {isFb ? <ThumbsUp className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Screenshot Panjang Otomatis Bukti Like {isFb ? 'Facebook' : 'Instagram'}
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                    isFb
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                  }`}
                >
                  {isFb ? 'Mode Facebook' : 'Mode Instagram'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Solusi tanpa screen recording HP atau aplikasi pihak ke-3. Siap dilampirkan ke laporan!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Filter Toolbar */}
        <div className="px-5 py-3 bg-slate-800/60 border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setFilterMode('liked_employees')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterMode === 'liked_employees'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Karyawan Sudah Like ({result ? result.allResults.filter((r) => r.hasLiked && !r.isExempt).length : 0})
            </button>
            <button
              onClick={() => setFilterMode('all_likers')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterMode === 'all_likers'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua Likers ({displayItems.length})
            </button>
            <button
              onClick={() => setFilterMode('penalized_employees')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filterMode === 'penalized_employees'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Daftar Denda ({result ? result.totalDenda : 0})
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-slate-700/60">
              <button
                onClick={() => setThemeMode('dark')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  themeMode === 'dark' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dark {isFb ? 'FB' : 'IG'}
              </button>
              <button
                onClick={() => setThemeMode('light')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  themeMode === 'light' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Light {isFb ? 'FB' : 'IG'}
              </button>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-[11px] bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700/40 select-none">
              <input
                type="checkbox"
                checked={includeHeaderBadge}
                onChange={(e) => setIncludeHeaderBadge(e.target.checked)}
                className="rounded accent-indigo-600"
              />
              <span>Header Toko</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-[11px] bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700/40 select-none">
              <input
                type="checkbox"
                checked={includeDivisionBadge}
                onChange={(e) => setIncludeDivisionBadge(e.target.checked)}
                className="rounded accent-indigo-600"
              />
              <span>Badge Divisi</span>
            </label>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoomScale(Math.max(0.5, zoomScale - 0.1))}
              className="p-1.5 bg-slate-900/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-slate-400 font-mono w-9 text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale(Math.min(1.2, zoomScale + 0.1))}
              className="p-1.5 bg-slate-900/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="px-5 py-2 bg-rose-950/80 border-b border-rose-800 text-rose-200 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Center Preview Viewport */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-slate-950/60 flex justify-center custom-scrollbar">
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-3">
              <AlertTriangle className="w-10 h-10 text-amber-400" />
              <p className="font-bold text-white text-sm">Tidak ada data likers untuk mode ini</p>
              <p className="text-xs max-w-sm">
                Silakan tempel daftar likers terlebih dahulu di menu Rekap Like atau pilih mode <strong>Semua Likers</strong>.
              </p>
            </div>
          ) : (
            <div
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="w-[410px] shrink-0"
            >
              <div
                ref={previewContainerRef}
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                }}
                className={`w-[410px] rounded-2xl overflow-hidden shadow-2xl border ${
                  themeMode === 'dark'
                    ? isFb
                      ? 'bg-[#242526] text-white border-[#3a3b3c]'
                      : 'bg-[#262626] text-white border-[#363636]'
                    : 'bg-white text-slate-900 border-slate-200'
                }`}
              >
                {includeHeaderBadge && (
                  <div
                    className={`px-4 py-2.5 text-center border-b ${
                      themeMode === 'dark'
                        ? 'bg-[#1a1a1a] border-[#333333]'
                        : isFb
                        ? 'bg-blue-50 border-blue-100'
                        : 'bg-indigo-50 border-indigo-100'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <p
                        className={`text-[11px] font-bold uppercase tracking-wider ${
                          themeMode === 'dark'
                            ? isFb
                              ? 'text-blue-400'
                              : 'text-indigo-400'
                            : isFb
                            ? 'text-blue-700'
                            : 'text-indigo-700'
                        }`}
                      >
                        BUKTI SCREENSHOT PANJANG LIKE {isFb ? 'FACEBOOK' : 'INSTAGRAM'}
                      </p>
                    </div>
                    <p
                      className={`text-[10px] font-semibold mt-0.5 ${
                        themeMode === 'dark' ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {storeCode} • Tanggal: {result?.tanggalStr || new Date().toLocaleDateString('id-ID')} • Total: {displayItems.length} Akun
                    </p>
                    {urlPost && (
                      <p
                        className={`text-[9px] font-mono truncate mt-0.5 ${
                          themeMode === 'dark' ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {urlPost}
                      </p>
                    )}
                  </div>
                )}

                {/* Modal Header */}
                <div
                  className={`h-12 px-4 flex items-center justify-between border-b relative select-none ${
                    themeMode === 'dark'
                      ? isFb
                        ? 'border-[#3a3b3c] bg-[#242526]'
                        : 'border-[#363636] bg-[#262626]'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {isFb ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#1877F2] border-b-2 border-[#1877F2] py-3">
                        Semua {displayItems.length}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        👍 ❤️
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-6 flex items-center justify-center text-pink-500">
                        <Instagram className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-base tracking-tight">Likes</h4>
                    </>
                  )}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      themeMode === 'dark' ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </div>
                </div>

                {/* List of Likers Rows */}
                <div className="divide-y-0 py-2">
                  {displayItems.map((item, idx) => (
                    <div
                      key={`${item.username}-${idx}`}
                      className={`px-4 py-2.5 flex items-center justify-between transition-colors ${
                        themeMode === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="relative shrink-0">
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-tr shadow-xs ${getAvatarGradient(
                              item.username
                            )}`}
                          >
                            {item.username.slice(0, 2).toUpperCase()}
                          </div>
                          {isFb && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#1877F2] text-white text-[9px] flex items-center justify-center ring-2 ring-[#242526]">
                              👍
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-sm leading-tight truncate">
                              {item.username}
                            </span>
                            {includeDivisionBadge && item.divisi && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                                  themeMode === 'dark'
                                    ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50'
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                }`}
                              >
                                {item.divisi}
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-xs block leading-tight truncate mt-0.5 ${
                              themeMode === 'dark' ? 'text-[#a8a8a8]' : 'text-slate-500'
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <button
                          type="button"
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors select-none ${
                            isFb
                              ? themeMode === 'dark'
                                ? 'bg-[#3a3b3c] text-slate-200'
                                : 'bg-slate-200 text-slate-800'
                              : 'bg-[#0095f6] text-white'
                          }`}
                        >
                          {isFb ? 'Tambah Teman' : 'Follow'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className={`px-4 py-3 text-center border-t text-[11px] ${
                    themeMode === 'dark'
                      ? 'border-[#363636] bg-[#1f1f1f] text-slate-400'
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                  }`}
                >
                  <p className="font-medium">
                    {isFb ? 'Facebook Reactions' : 'Instagram Likers'} Monitoring Engine • Total {displayItems.length} Akun
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="px-5 py-3.5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Format PNG Retina 2x Resolusi Tinggi (Tajam saat dikirim ke WA)</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyImageToClipboard}
              disabled={isExporting || displayItems.length === 0}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                copiedImage
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              {copiedImage ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-indigo-400" />}
              <span>{copiedImage ? 'Gambar Tersalin!' : 'Salin Gambar ke Clipboard'}</span>
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={isExporting || displayItems.length === 0}
              className={`flex-1 sm:flex-initial px-5 py-2.5 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 ${
                isFb
                  ? 'bg-[#1877F2] hover:bg-blue-700 shadow-blue-600/25'
                  : 'bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-pink-600/25'
              }`}
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Membuat Screenshot PNG...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Screenshot Panjang (PNG HD)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
