import React, { useState } from 'react';
import {
  Type,
  X,
  Check,
  Sparkles,
  RefreshCw,
  Sliders,
  Eye,
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { FontFamilyId, FontSizeScale } from '../types';
import { FONT_OPTIONS, FONT_SIZE_SCALES } from '../data/fontOptions';

interface FontPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFont: FontFamilyId;
  onSelectFont: (fontId: FontFamilyId) => void;
  currentSize: FontSizeScale;
  onSelectSize: (size: FontSizeScale) => void;
}

export function FontPickerModal({
  isOpen,
  onClose,
  currentFont,
  onSelectFont,
  currentSize,
  onSelectSize,
}: FontPickerModalProps) {
  const [customPreviewText, setCustomPreviewText] = useState<string>('Sistem Rekap Like Instagram KTSN - Rp 10.000');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!isOpen) return null;

  const currentFontObj = FONT_OPTIONS.find((f) => f.id === currentFont) || FONT_OPTIONS[0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 via-purple-50/50 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>Pengaturan Font &amp; Tipografi Aplikasi</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                  9 Pilihan Font
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Pilih font yang paling nyaman dan enak dibaca sesuai selera Anda. Tersimpan otomatis di browser.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 custom-scrollbar">
          
          {/* Active Font Showcase Card */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl shadow-md border border-indigo-900/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                  Font Aktif Saat Ini:
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-white text-xs font-bold border border-indigo-400/30">
                  {currentFontObj.name}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">{currentFontObj.category}</span>
            </div>

            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 space-y-1.5">
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                <Eye className="w-3 h-3 text-indigo-300" />
                <span>Live Preview Teks:</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-white tracking-wide" style={{ fontFamily: currentFontObj.cssFamily }}>
                {customPreviewText}
              </p>
              <p className="text-xs text-indigo-200 leading-relaxed font-normal" style={{ fontFamily: currentFontObj.cssFamily }}>
                Total 75 Karyawan &bull; 62 Sudah Like &bull; 5 Cuti/Off &bull; 8 Denda Rp 80.000 &bull; WhatsApp Otomatis
              </p>
            </div>

            {/* Test input text */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-300 shrink-0">Coba ketik kata:</span>
              <input
                type="text"
                value={customPreviewText}
                onChange={(e) => setCustomPreviewText(e.target.value)}
                placeholder="Ketik teks untuk melihat preview font..."
                className="w-full px-3 py-1.5 text-xs bg-black/40 border border-indigo-500/40 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-sans"
              />
            </div>
          </div>

          {/* Size Scale Selector */}
          <div className="space-y-2.5">
            <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ukuran Tampilan (Zoom Skala Font)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {FONT_SIZE_SCALES.map((scale) => (
                <button
                  key={scale.id}
                  onClick={() => onSelectSize(scale.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    currentSize === scale.id
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-xs ${currentSize === scale.id ? 'text-indigo-900' : 'text-slate-900'}`}>
                      {scale.name}
                    </span>
                    {currentSize === scale.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <span className="text-[10px] text-slate-500">{scale.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font List Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <Type className="w-3.5 h-3.5 text-indigo-600" />
                <span>Pilihan Jenis Font (Klik untuk Mengubah)</span>
              </label>
              <button
                onClick={() => {
                  onSelectFont('jakarta');
                  onSelectSize('normal');
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer transition-colors"
                title="Kembalikan ke font default Plus Jakarta Sans"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset ke Default</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {FONT_OPTIONS.map((font) => {
                const isSelected = currentFont === font.id;
                return (
                  <div
                    key={font.id}
                    onClick={() => onSelectFont(font.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/70 hover:shadow-xs'
                    }`}
                  >
                    {/* Top Row */}
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors"
                          style={{ fontFamily: font.cssFamily }}
                        >
                          {font.name}
                        </span>
                        {font.tag && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[9px] font-bold">
                            {font.tag}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 block mb-2 font-sans">
                        {font.category}
                      </span>

                      {/* Live Text Sample */}
                      <div
                        className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg mb-2 text-slate-800"
                        style={{ fontFamily: font.cssFamily }}
                      >
                        <p className="text-xs font-bold leading-snug">
                          {customPreviewText || font.sample}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-1">
                          ABCDEFGHIJKLM 1234567890
                        </p>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                        {font.description}
                      </p>
                    </div>

                    {/* Bottom Indicator */}
                    <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between font-sans">
                      <span className="text-[10px] text-slate-400">
                        {isSelected ? 'Sedang Digunakan' : 'Klik untuk Terapkan'}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-300 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-600 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Font langsung diterapkan ke seluruh halaman aplikasi dan tersimpan permanen.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-sm"
          >
            Selesai &amp; Gunakan Font Ini
          </button>
        </div>

      </div>
    </div>
  );
}
