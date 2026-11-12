import React, { useState, useEffect, useRef, useMemo, ChangeEvent, DragEvent } from 'react';
import {
  Grid,
  Upload,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Maximize2,
  SlidersHorizontal,
  Plus,
  RefreshCw,
  Hash,
  FileText,
  Instagram,
  GripVertical,
  Layers,
  ArrowUp,
  ArrowDown,
  Info,
  ExternalLink,
  ChevronRight,
  Eye,
  CheckCircle2,
  Calendar,
  Zap,
} from 'lucide-react';
import { IgFeedItem, IgGridRatio } from '../types';
import {
  STORE_CAPTION_FOOTER_TEMPLATE,
  buildCaptionFooter,
  buildFullCaption,
  generateLightweightCaption,
  compressImageToMinimalBase64,
  getInitialFeedPlannerItems,
  detectProductFromText,
} from '../utils/feedPlannerUtils';

const LOCAL_STORAGE_KEY_FEED = 'likemonitor_ig_feed_items_v1';
const LOCAL_STORAGE_KEY_RATIO = 'likemonitor_ig_feed_ratio_v1';

interface InstagramFeedPlannerProps {
  storeCode?: string;
  compactMode?: boolean;
}

export function InstagramFeedPlanner({
  storeCode = 'KTSN',
  compactMode = false,
}: InstagramFeedPlannerProps) {
  // Feed Items List persisted in LocalStorage
  const [feedItems, setFeedItems] = useState<IgFeedItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_FEED);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse feed items from LocalStorage', e);
    }
    return getInitialFeedPlannerItems();
  });

  // Grid ratio: 1:1 (Square Classic) vs 4:5 (Portrait 1080x1350)
  const [gridRatio, setGridRatio] = useState<IgGridRatio>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_RATIO);
      if (saved === '1:1' || saved === '4:5') return saved;
    } catch {
      // fallback
    }
    return '1:1';
  });

  // Active / Selected tile for Caption Editor Drawer
  const [selectedItemId, setSelectedItemId] = useState<string | null>(() => {
    return feedItems[0]?.id || null;
  });

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Uploading / compressing state
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressionStats, setCompressionStats] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [copiedFooterOnly, setCopiedFooterOnly] = useState<boolean>(false);
  const [showFooterPreviewModal, setShowFooterPreviewModal] = useState<boolean>(false);

  // Quick caption generator inputs inside editor drawer
  const [genCategory, setGenCategory] = useState<'sepeda_listrik' | 'handphone' | 'elektronik' | 'promo_kredit' | 'custom'>('sepeda_listrik');
  const [genBrand, setGenBrand] = useState<string>('Goda');
  const [genFeature, setGenFeature] = useState<string>('Baterai 48V, Bunga 0% & Garansi Resmi');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_FEED, JSON.stringify(feedItems));
    } catch (e) {
      console.warn('Failed to save feed items to LocalStorage', e);
    }
  }, [feedItems]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_RATIO, gridRatio);
    } catch {
      // ignore
    }
  }, [gridRatio]);

  // Selected item object
  const selectedItem = useMemo(() => {
    return feedItems.find((item) => item.id === selectedItemId) || null;
  }, [feedItems, selectedItemId]);

  // Synchronize caption generator inputs with the selected item's detected product
  useEffect(() => {
    if (selectedItem) {
      const detection = detectProductFromText(selectedItem.title);
      setGenCategory(selectedItem.category || detection.category);
      setGenBrand(detection.brand || (selectedItem.category === 'sepeda_listrik' ? 'Goda' : 'Miyako'));
      setGenFeature(detection.productType || 'Produk Garansi Resmi & Promo Kredit 0%');
    }
  }, [selectedItemId]);

  // Total storage footprint of feed images in KB
  const totalStorageKb = useMemo(() => {
    const bytes = feedItems.reduce((acc, item) => acc + (item.fileSizeBytes || (item.imageDataUrl.length * 3) / 4), 0);
    return Math.round(bytes / 1024);
  }, [feedItems]);

  // Handle file drop / upload with aggressive client-side compression
  const processImageFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsCompressing(true);

    try {
      const newItems: IgFeedItem[] = [];
      let totalOriginalBytes = 0;
      let totalCompressedBytes = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        totalOriginalBytes += file.size;

        // Aggressively compress down to max 480px & 0.55 quality (ideal for feed grid preview)
        const { dataUrl, sizeBytes } = await compressImageToMinimalBase64(file, 480, 0.55);
        totalCompressedBytes += sizeBytes;

        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');

        // Smart automatic product & brand detection from file name
        const detection = detectProductFromText(cleanName);

        const defaultGen = generateLightweightCaption({
          category: detection.category,
          title: cleanName,
          brand: detection.brand,
          featureOrPromo: detection.productType,
        });

        const item: IgFeedItem = {
          id: `feed-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          imageDataUrl: dataUrl,
          fileSizeBytes: sizeBytes,
          title: cleanName,
          bodyCaption: defaultGen.bodyCaption,
          category: detection.category,
          tagsInput: detection.brand ? `${detection.brand}, ${cleanName}` : cleanName,
          customHashtags: defaultGen.hashtags,
          isCarousel: false,
          carouselSlideCount: 1,
          status: 'ready',
          order: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        newItems.push(item);
      }

      if (newItems.length > 0) {
        // Prepend new images so newest posts appear at top-left, matching IG feed chronology
        setFeedItems((prev) => {
          const updated = [...newItems, ...prev];
          return updated.map((it, idx) => ({ ...it, order: idx }));
        });
        setSelectedItemId(newItems[0].id);

        const savedRatio = Math.round((1 - totalCompressedBytes / Math.max(1, totalOriginalBytes)) * 100);
        setCompressionStats(
          `Kompresi Berhasil: ${newItems.length} gambar dikompres dari ${(totalOriginalBytes / 1024).toFixed(
            0
          )} KB menjadi ${(totalCompressedBytes / 1024).toFixed(0)} KB (Hemat ${savedRatio}% memori)!`
        );
        setTimeout(() => setCompressionStats(null), 5000);
      }
    } catch (err) {
      console.error('Error compressing feed images:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processImageFiles(e.target.files);
      e.target.value = '';
    }
  };

  // Drag and drop ordering between tiles
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setFeedItems((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(draggedIndex, 1);
      copy.splice(targetIndex, 0, moved);
      return copy.map((it, idx) => ({ ...it, order: idx }));
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Move tile up / down with buttons for accessibility
  const handleMoveItem = (index: number, direction: 'prev' | 'next') => {
    const targetIndex = direction === 'prev' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= feedItems.length) return;

    setFeedItems((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy.map((it, idx) => ({ ...it, order: idx }));
    });
  };

  // Update selected item fields
  const handleUpdateSelectedItem = (patch: Partial<IgFeedItem>) => {
    if (!selectedItemId) return;

    // If user changes title, intelligently update category and sync generator inputs
    let augmentedPatch = { ...patch };
    if (patch.title !== undefined) {
      const detection = detectProductFromText(patch.title);
      augmentedPatch.category = detection.category;
      setGenCategory(detection.category);
      if (detection.brand) setGenBrand(detection.brand);
      if (detection.productType) setGenFeature(detection.productType);
    }

    setFeedItems((prev) =>
      prev.map((item) => (item.id === selectedItemId ? { ...item, ...augmentedPatch, updatedAt: Date.now() } : item))
    );
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    setFeedItems((prev) => {
      const filtered = prev.filter((it) => it.id !== id);
      return filtered.map((it, idx) => ({ ...it, order: idx }));
    });
    if (selectedItemId === id) {
      const nextRemaining = feedItems.find((it) => it.id !== id);
      setSelectedItemId(nextRemaining ? nextRemaining.id : null);
    }
  };

  // 1-Click Generate caption for selected item
  const handleApplyGeneratedCaption = () => {
    if (!selectedItem) return;
    const gen = generateLightweightCaption({
      category: genCategory,
      title: selectedItem.title || 'Produk Spesial Mega',
      brand: genBrand,
      featureOrPromo: genFeature,
    });

    handleUpdateSelectedItem({
      category: genCategory,
      bodyCaption: gen.bodyCaption,
      customHashtags: gen.hashtags,
    });
  };

  // Copy complete ready-to-post caption (Body + Footer + Hashtags)
  const handleCopyCompleteCaption = () => {
    if (!selectedItem) return;
    const full = buildFullCaption(selectedItem.bodyCaption, selectedItem.customHashtags);
    navigator.clipboard.writeText(full).then(() => {
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2200);
    });
  };

  // Copy template footer only
  const handleCopyFooterOnly = () => {
    const hashtags = selectedItem?.customHashtags || '';
    const footer = buildCaptionFooter(hashtags);
    navigator.clipboard.writeText(footer).then(() => {
      setCopiedFooterOnly(true);
      setTimeout(() => setCopiedFooterOnly(false), 2000);
    });
  };

  // Reset to initial dummy layout
  const handleResetToDummy = () => {
    const initial = getInitialFeedPlannerItems();
    setFeedItems(initial);
    setSelectedItemId(initial[0].id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200 uppercase tracking-wider flex items-center gap-1">
              <Instagram className="w-3 h-3" />
              <span>Instagram Feed &amp; Carousel Planner</span>
            </span>
            <span className="text-xs text-slate-500">
              Total Grid: <strong className="text-slate-800">{feedItems.length} Postingan</strong>
            </span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ⚡ Terkompresi (~{totalStorageKb} KB)
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Perencanaan Tampilan Feed Instagram &amp; Generator Caption Toko
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Drag &amp; drop untuk mengatur susunan 3 kolom foto/carousel agar feed rapi sebelum posting. Gambar otomatis
            dikompres maksimal agar sangat ringan di storage, lengkap dengan footer resmi Mega Elektronik &amp; hashtag kontekstual.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Ratio switcher: 1:1 Square vs 4:5 Portrait */}
          <div className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setGridRatio('1:1')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                gridRatio === '1:1' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
              title="Rasio 1:1 (Persegi Standar IG)"
            >
              1:1 Kotak
            </button>
            <button
              type="button"
              onClick={() => setGridRatio('4:5')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                gridRatio === '4:5' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
              title="Rasio 4:5 (Potret Vertikal Feed IG)"
            >
              4:5 Potret
            </button>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCompressing}
            className="px-3.5 py-2 bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {isCompressing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            <span>Tambah Foto Feed</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />

          <button
            type="button"
            onClick={() => setShowFooterPreviewModal(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title="Lihat template footer wajib dan hashtag toko"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Format Footer</span>
          </button>
        </div>
      </div>

      {/* Compression stats banner */}
      {compressionStats && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{compressionStats}</span>
          </div>
          <button
            type="button"
            onClick={() => setCompressionStats(null)}
            className="text-emerald-700 hover:text-emerald-900 text-[11px] font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Main Layout: 3-Column Feed Preview Grid (Left) & Caption Editor Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT: 3-COLUMN INSTAGRAM FEED GRID (DRAG & DROP)          */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-4">
            {/* Header info */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-pink-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Pratinjau Grid Feed 3 Kolom (Urutan Posting)
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>💡 Seret (drag) foto untuk mengubah posisi urutan feed</span>
              </div>
            </div>

            {/* Drop Zone Callout */}
            <div
              ref={dropZoneRef}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  processImageFiles(e.dataTransfer.files);
                }
              }}
              className="p-4 border-2 border-dashed border-pink-200 hover:border-pink-400 bg-pink-50/40 hover:bg-pink-50/80 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-9 h-9 rounded-full bg-pink-100 group-hover:bg-pink-200 text-pink-600 flex items-center justify-center transition-colors">
                <Upload className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Tarik &amp; Lepas (Drag &amp; Drop) Foto ke Sini atau Klik untuk Upload
              </p>
              <p className="text-[11px] text-slate-500 max-w-md">
                Otomatis dikompres maksimal (hanya ~20 KB per foto) agar muat ratusan foto tanpa bikin lambat browser.
              </p>
            </div>

            {/* 3-Column Instagram Feed Container */}
            <div className="bg-slate-50/80 p-3 sm:p-4 rounded-xl border border-slate-200">
              {feedItems.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {feedItems.map((item, index) => {
                    const isSelected = selectedItemId === item.id;
                    const isDragged = draggedIndex === index;
                    const isOver = dragOverIndex === index;

                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={() => handleDrop(index)}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`group relative rounded-lg overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing select-none ${
                          isSelected
                            ? 'border-pink-500 ring-2 ring-pink-300 shadow-md scale-[1.01]'
                            : 'border-slate-200 hover:border-pink-300 hover:shadow-sm'
                        } ${isDragged ? 'opacity-30 scale-95' : 'opacity-100'} ${
                          isOver ? 'border-indigo-500 ring-2 ring-indigo-300' : ''
                        }`}
                      >
                        {/* Aspect Ratio Box */}
                        <div
                          className={`w-full overflow-hidden bg-slate-900 flex items-center justify-center relative ${
                            gridRatio === '4:5' ? 'aspect-[4/5]' : 'aspect-square'
                          }`}
                        >
                          <img
                            src={item.imageDataUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 pointer-events-none"
                            loading="lazy"
                          />

                          {/* Order Badge at Top Left */}
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono font-black text-white flex items-center gap-1 shadow-xs">
                            <span>#{index + 1}</span>
                          </div>

                          {/* Carousel indicator badge if slide */}
                          {item.isCarousel && (
                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] font-bold text-amber-300 flex items-center gap-1 shadow-xs">
                              <Layers className="w-2.5 h-2.5" />
                              <span>{item.carouselSlideCount || 3}</span>
                            </div>
                          )}

                          {/* Hover Overlay with Quick Reorder Controls */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <div className="flex items-center justify-end gap-1">
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveItem(index, 'prev');
                                  }}
                                  className="p-1 rounded bg-black/60 hover:bg-black/90 text-white cursor-pointer"
                                  title="Geser ke kiri / sebelumnya"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                              )}
                              {index < feedItems.length - 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveItem(index, 'next');
                                  }}
                                  className="p-1 rounded bg-black/60 hover:bg-black/90 text-white cursor-pointer"
                                  title="Geser ke kanan / selanjutnya"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem(item.id);
                                }}
                                className="p-1 rounded bg-rose-600/80 hover:bg-rose-700 text-white cursor-pointer"
                                title="Hapus foto ini dari feed"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="text-white">
                              <p className="text-[11px] font-bold truncate leading-tight">{item.title}</p>
                              <span className="text-[9px] text-pink-300 font-medium">Klik untuk edit caption &rarr;</span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Label Tile */}
                        <div className="p-1.5 bg-white text-slate-800 flex items-center justify-between text-[10px]">
                          <span className="font-semibold truncate max-w-[90px]">{item.title}</span>
                          <span
                            className={`px-1 py-0.2 rounded text-[9px] font-bold uppercase ${
                              item.category === 'sepeda_listrik'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : item.category === 'handphone'
                                ? 'bg-pink-50 text-pink-700 border border-pink-200'
                                : item.category === 'promo_kredit'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {item.category === 'sepeda_listrik'
                              ? 'Sepeda'
                              : item.category === 'handphone'
                              ? 'HP'
                              : item.category === 'promo_kredit'
                              ? 'Kredit 0%'
                              : 'Elektronik'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Instagram className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">Belum ada foto di grid feed.</p>
                  <button
                    type="button"
                    onClick={handleResetToDummy}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Muat Contoh Layout 9 Kotak (3x3)
                  </button>
                </div>
              )}
            </div>

            {/* Footer reset button */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span>{feedItems.length} foto dalam feed</span>
              <button
                type="button"
                onClick={handleResetToDummy}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset ke Contoh 3x3</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT: CAPTION EDITOR DRAWER & FOOTER GENERATOR           */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Editor Caption Postingan Terpilih
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    2 Bagian: Isi Konten + Footer Wajib Toko &amp; Hashtag
                  </p>
                </div>
              </div>

              {selectedItem && (
                <button
                  type="button"
                  onClick={handleCopyCompleteCaption}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    copiedCaption
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                  title="Salin caption lengkap (Isi + Footer + Hashtag)"
                >
                  {copiedCaption ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCaption ? 'Tersalin!' : 'Salin Caption'}</span>
                </button>
              )}
            </div>

            {selectedItem ? (
              <div className="space-y-4">
                {/* Active Tile Preview Snippet */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-300">
                    <img
                      src={selectedItem.imageDataUrl}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Slide / Urutan #{feedItems.findIndex((it) => it.id === selectedItem.id) + 1}
                      </span>
                      <label className="inline-flex items-center gap-1 text-[10px] text-slate-600 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={selectedItem.isCarousel || false}
                          onChange={(e) =>
                            handleUpdateSelectedItem({
                              isCarousel: e.target.checked,
                              carouselSlideCount: e.target.checked ? selectedItem.carouselSlideCount || 3 : 1,
                            })
                          }
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span>Multi-slide Carousel</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={selectedItem.title}
                      onChange={(e) => handleUpdateSelectedItem({ title: e.target.value })}
                      placeholder="Judul postingan / nama produk..."
                      className="w-full text-xs font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quick Caption Generator Widget */}
                <div className="p-3 bg-gradient-to-br from-indigo-50/70 to-pink-50/50 border border-indigo-100 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                      <span>Generator Ringan Caption &amp; Hashtag</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyGeneratedCaption}
                      className="text-[11px] font-bold text-indigo-700 bg-white hover:bg-indigo-50 px-2 py-1 rounded border border-indigo-200 cursor-pointer flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>Terapkan Otomatis</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Kategori Produk</label>
                      <select
                        value={genCategory}
                        onChange={(e) => {
                          const cat = e.target.value as any;
                          setGenCategory(cat);
                          let defaultBrand = genBrand;
                          if (cat === 'sepeda_listrik') defaultBrand = 'Goda';
                          else if (cat === 'handphone') defaultBrand = 'Oppo';
                          else if (cat === 'elektronik') defaultBrand = 'Miyako';
                          else if (cat === 'promo_kredit') defaultBrand = '';
                          setGenBrand(defaultBrand);
                          handleUpdateSelectedItem({ category: cat });
                        }}
                        className="w-full text-xs bg-white px-2 py-1 rounded border border-slate-200 font-medium text-slate-800"
                      >
                        <option value="elektronik">Elektronik (Blender, Kulkas, TV, dll)</option>
                        <option value="sepeda_listrik">Sepeda Listrik (Goda, Uwinfly, dll)</option>
                        <option value="handphone">Handphone / Gadget (Oppo, Samsung, dll)</option>
                        <option value="promo_kredit">Promo Kredit &amp; Angsuran 0%</option>
                        <option value="custom">Kustom Umum</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Merk / Brand</label>
                      <input
                        type="text"
                        value={genBrand}
                        onChange={(e) => setGenBrand(e.target.value)}
                        placeholder="e.g. Goda / Sanken"
                        className="w-full text-xs bg-white px-2 py-1 rounded border border-slate-200 font-medium text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 1: Body Caption Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                      <span>Bagian Isi Postingan (Sesuai Gambar)</span>
                    </label>
                  </div>
                  <textarea
                    rows={4}
                    value={selectedItem.bodyCaption}
                    onChange={(e) => handleUpdateSelectedItem({ bodyCaption: e.target.value })}
                    placeholder="Tuliskan isi caption postingan (penjelasan produk, promo, cara pemesanan)..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 leading-relaxed font-sans"
                  />
                </div>

                {/* Section 2: Dynamic Hashtags Input for Footer */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-pink-600" />
                      <span>Hashtag di Dalam Footer (Disesuaikan Produk)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Contoh: #sepedalistrik #godaindonesia</span>
                  </div>
                  <textarea
                    rows={2}
                    value={selectedItem.customHashtags || ''}
                    onChange={(e) => handleUpdateSelectedItem({ customHashtags: e.target.value })}
                    placeholder="#megaelektronik #sepedalistrik #godaindonesia #nganjukhits"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-pink-700 font-mono"
                  />
                </div>

                {/* Section 3: Readonly Footer Template Box */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                      <span>Bagian Footer Template (Otomatis Menempel)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleCopyFooterOnly}
                      className="text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                    >
                      {copiedFooterOnly ? 'Footer Tersalin!' : 'Salin Footer Saja'}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] max-h-36 overflow-y-auto custom-scrollbar border border-slate-800 whitespace-pre-wrap leading-relaxed select-all">
                    {buildCaptionFooter(selectedItem.customHashtags)}
                  </div>
                </div>

                {/* Big Copy Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCopyCompleteCaption}
                    className={`w-full py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                      copiedCaption
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white'
                    }`}
                  >
                    {copiedCaption ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>
                      {copiedCaption
                        ? 'Semua Caption & Footer Berhasil Disalin!'
                        : 'Salin Seluruh Caption (Isi + Footer + Hashtag)'}
                    </span>
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-1">
                    * Format caption sudah siap langsung ditempel (Ctrl + V) ke Instagram / Meta Business Suite.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Klik salah satu foto di sebelah kiri untuk melihat dan menyalin caption.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Template Preview Modal */}
      {showFooterPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-pink-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Template Footer Wajib Postingan Mega Elektronik
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFooterPreviewModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar space-y-3 text-xs text-slate-700">
              <p className="text-slate-600">
                Footer ini otomatis diselipkan di bagian bawah setiap caption. Hashtag di baris paling bawah akan otomatis berganti sesuai produk pada postingan (misal sepeda listrik, handphone, kulkas, dll).
              </p>

              <div className="p-4 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[11px] whitespace-pre-wrap leading-relaxed select-all">
                {STORE_CAPTION_FOOTER_TEMPLATE.replace(
                  '{{HASHTAGS}}',
                  '#megaelektronik #sepedalistrik #godaindonesia #nganjukhits #promokredit\n#nganjuk24jam'
                )}
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowFooterPreviewModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
