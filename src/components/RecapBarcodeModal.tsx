import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Smartphone,
  Copy,
  Check,
  Download,
  X,
  Send,
  FileText,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Camera
} from 'lucide-react';
import { LikersProcessResult } from '../types';
import { generateWhatsAppLink } from '../utils/likersParser';

interface RecapBarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: LikersProcessResult | null;
}

type BarcodeMode = 'wa_link' | 'plain_text' | 'compact_fines';

export const RecapBarcodeModal: React.FC<RecapBarcodeModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const [mode, setMode] = useState<BarcodeMode>('wa_link');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate compact fines text if requested
  const getCompactFinesText = (res: LikersProcessResult): string => {
    if (res.totalDenda === 0) {
      return `DATA LIKE ${res.tanggalStr} ${res.storeCode}\n${res.urlPost || ''}\n\nSELURUH KARYAWAN SUDAH LIKE (LIKE DONE)\nTotal Denda: 0 Personel`.trim();
    }

    const lines: string[] = [];
    lines.push(`DENDA LIKE IG [${res.tanggalStr}] ${res.storeCode}`);
    if (res.urlPost) {
      lines.push(res.urlPost);
    }
    lines.push('');

    for (const div of res.divisionSummaries) {
      if (div.penalizedEmployees.length > 0) {
        lines.push(`#${div.divisi}`);
        for (const emp of div.penalizedEmployees) {
          lines.push(` • ${emp.nama}`);
        }
        lines.push('');
      }
    }

    lines.push(`Total Denda: ${res.totalDenda} Personel`);
    return lines.join('\n').trim();
  };

  // Determine current active text based on mode
  const getActiveText = (): string => {
    if (!result) return '';
    if (mode === 'compact_fines') {
      return getCompactFinesText(result);
    }
    return result.waTextOutput;
  };

  // Determine what string to encode into the QR code
  const getEncodedPayload = (): string => {
    const text = getActiveText();
    if (!text) return '';

    if (mode === 'wa_link') {
      return generateWhatsAppLink(text);
    }
    return text;
  };

  // Generate QR Code whenever result, mode, or modal open status changes
  useEffect(() => {
    if (!isOpen || !result) return;

    let isMounted = true;
    setIsGenerating(true);
    setErrorMsg(null);

    const payload = getEncodedPayload();

    if (!payload) {
      setIsGenerating(false);
      return;
    }

    // Attempt generation with Low error correction to maximize data capacity
    QRCode.toDataURL(payload, {
      width: 380,
      margin: 2,
      errorCorrectionLevel: 'L',
      color: {
        dark: '#0f172a', // slate-900
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.warn('QR Code generation with wa_link failed, fallback to plain text:', err);
        // If wa_link was too long (due to url encoding), fallback to plain text
        if (mode === 'wa_link') {
          const fallbackText = getActiveText();
          QRCode.toDataURL(fallbackText, {
            width: 380,
            margin: 2,
            errorCorrectionLevel: 'L',
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
          })
            .then((url) => {
              if (isMounted) {
                setQrDataUrl(url);
                setMode('plain_text');
                setErrorMsg('Ukuran tautan WhatsApp terlalu panjang, otomatis dialihkan ke mode Teks Polos agar mudah dipindai kamera HP.');
                setIsGenerating(false);
              }
            })
            .catch((innerErr) => {
              if (isMounted) {
                setErrorMsg('Teks rekap terlalu panjang untuk barcode. Silakan pilih mode "Khusus Denda Saja".');
                setIsGenerating(false);
              }
            });
        } else {
          if (isMounted) {
            setErrorMsg('Data terlalu panjang untuk dijadikan 1 barcode. Pilih mode "Khusus Denda Saja" yang lebih ringkas.');
            setIsGenerating(false);
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, result, mode]);

  if (!isOpen || !result) return null;

  const currentPayload = getEncodedPayload();
  const currentText = getActiveText();

  // Copy text handler
  const handleCopyText = () => {
    if (!currentText) return;
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download QR Code PNG
  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `Barcode-Rekap-Like-${result.storeCode}-${result.tanggalStr.replace(/\//g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Barcode Hasil Rekap Like</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-400/30">
                  Scan ke HP
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Pindahkan hasil rekap ke WhatsApp HP tanpa perlu buka WA di laptop
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar text-slate-700 text-xs">
          
          {/* Status summary banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Toko / Tanggal</span>
                <span className="font-bold text-slate-800 text-xs">{result.storeCode} • {result.tanggalStr}</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Kena Denda</span>
                <span className={`font-bold text-xs ${result.totalDenda > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {result.totalDenda > 0 ? `${result.totalDenda} Orang Kena Denda` : '0 Denda (LIKE DONE)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              <span>Arahkan kamera HP ke barcode</span>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
              Pilih Format Barcode untuk HP:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
              
              <button
                type="button"
                onClick={() => setMode('wa_link')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                  mode === 'wa_link'
                    ? 'bg-white text-indigo-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Buka Langsung WA</span>
                </div>
                <span className="text-[9px] text-slate-400 font-normal">Kamera HP auto buka WA</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('plain_text')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                  mode === 'plain_text'
                    ? 'bg-white text-indigo-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Teks Polos Rekap</span>
                </div>
                <span className="text-[9px] text-slate-400 font-normal">Kamera HP ada tombol Salin</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('compact_fines')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                  mode === 'compact_fines'
                    ? 'bg-white text-indigo-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Khusus Denda Saja</span>
                </div>
                <span className="text-[9px] text-slate-400 font-normal">Format ringkas &amp; cepat</span>
              </button>

            </div>
          </div>

          {/* Error Message if any */}
          {errorMsg && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Barcode Visual Container */}
          <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 shadow-inner">
            
            <div className="relative p-3 bg-white rounded-2xl shadow-md border-2 border-slate-100 flex items-center justify-center min-h-[260px] min-w-[260px]">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center gap-2 p-8 text-slate-400">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold">Membuat Barcode QR...</span>
                </div>
              ) : qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Barcode Hasil Rekap Like"
                  className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-lg"
                />
              ) : (
                <div className="text-center p-6 text-slate-400">
                  <QrCode className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <span>Barcode tidak tersedia</span>
                </div>
              )}

              {/* Badge overlay on bottom */}
              <div className="absolute -bottom-3 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-slate-700">
                <Camera className="w-3 h-3 text-emerald-400" />
                <span>
                  {mode === 'wa_link'
                    ? 'Scan & Langsung Buka Chat WA HP'
                    : mode === 'compact_fines'
                    ? 'Scan Khusus Daftar Denda'
                    : 'Scan & Salin Teks di HP'}
                </span>
              </div>
            </div>

            {/* Practical steps under barcode */}
            <div className="mt-6 w-full bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 text-[11px] text-indigo-950 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                <span>3 Langkah Cepat Pindahkan ke HP:</span>
              </div>
              <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                <li>Buka aplikasi <b>Kamera bawaan HP</b> Anda (atau Google Lens / Pemindai Barcode).</li>
                <li>Arahkan lensa kamera HP ke barcode di atas layar laptop.</li>
                <li>
                  {mode === 'wa_link' ? (
                    <>Ketuk notifikasi <b>"Buka di WhatsApp"</b> yang muncul di layar HP &rarr; teks denda langsung terisi dan siap dikirim ke grup!</>
                  ) : (
                    <>Ketuk tombol <b>"Salin Teks"</b> di layar HP &rarr; buka WhatsApp HP Anda dan tempel pesan ke grup!</>
                  )}
                </li>
              </ol>
            </div>

          </div>

          {/* Preview of text inside barcode */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Isi Teks Rekap yang Dibawa Barcode:</span>
              </span>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
              </button>
            </div>

            <div className="bg-slate-900 text-indigo-300 font-mono text-[11px] p-3 rounded-xl max-h-28 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800 custom-scrollbar select-all">
              {currentText}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadQR}
            disabled={!qrDataUrl}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            title="Simpan gambar barcode ke file PNG di laptop"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Unduh Barcode (PNG)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Teks Tersalin!' : 'Salin Teks Rekap'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
