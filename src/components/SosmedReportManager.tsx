import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Instagram,
  Facebook,
  Share2,
  Copy,
  Check,
  Send,
  ExternalLink,
  Plus,
  Trash2,
  Sparkles,
  Clipboard,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRightLeft,
  AlertCircle,
  HelpCircle,
  Download,
  Info,
  Clock,
  Store,
  RefreshCw,
  Eye,
  FileText,
  Smartphone,
  Video,
  X,
  Upload,
  Zap,
  CheckSquare,
  Square,
  Wand2,
  MousePointerClick,
  FileCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { SosmedPostItem, SocialPlatform, PostContentType, TimeSlot } from '../types';
import { DEFAULT_SOSMED_POSTS, SOSMED_PLATFORM_CONFIG } from '../data/defaultSosmedPosts';
import { PostingMilestoneTimer } from './PostingMilestoneTimer';

const LOCAL_STORAGE_KEY_SOSMED = 'likemonitor_sosmed_posts_v1';
const LOCAL_STORAGE_KEY_STORE_NAME = 'likemonitor_sosmed_store_name_v1';

interface SosmedReportManagerProps {
  storeCode?: string;
}

export function SosmedReportManager({ storeCode = 'MEGA KTSN' }: SosmedReportManagerProps) {
  // Store branding / prefix name
  const [storeName, setStoreName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_STORE_NAME);
      if (saved) return saved;
    } catch {
      // Fallback
    }
    return storeCode ? `MEGA ${storeCode.replace('MEGA', '').trim() || 'KTSN'}` : 'MEGA KTSN';
  });

  // Date selection
  const [reportDate, setReportDate] = useState<string>(() => {
    const d = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  });

  // Posts array state with persistence
  const [posts, setPosts] = useState<SosmedPostItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SOSMED);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SOSMED_POSTS;
  });

  // Active filter tab
  const [filterSlot, setFilterSlot] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');

  // Copied indicator states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedImageId, setCopiedImageId] = useState<string | null>(null);
  const [copiedComboId, setCopiedComboId] = useState<string | null>(null);

  // Floating Combo Toast helper for WhatsApp paste
  const [activeComboToast, setActiveComboToast] = useState<{
    post: SosmedPostItem;
    text: string;
    hasImage: boolean;
  } | null>(null);
  const [isToastCaptionCopied, setIsToastCaptionCopied] = useState<boolean>(false);

  // Active Modal for Adding New Post
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>('IG');
  const [newContentType, setNewContentType] = useState<PostContentType>('Foto / Feed');
  const [newTimeSlot, setNewTimeSlot] = useState<TimeSlot>('Pagi');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newUrl, setNewUrl] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [newAutoMirror, setNewAutoMirror] = useState<boolean>(true);
  const [addModalError, setAddModalError] = useState<string | null>(null);

  // Explanation Modal
  const [isExplainModalOpen, setIsExplainModalOpen] = useState<boolean>(false);

  // Lightbox Modal for screenshot
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // Active focused card for paste
  const [activePasteCardId, setActivePasteCardId] = useState<string | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SOSMED, JSON.stringify(posts));
    } catch {
      // Ignore
    }
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_STORE_NAME, storeName);
    } catch {
      // Ignore
    }
  }, [storeName]);

  // Global paste handler to paste screenshot directly into active card
  useEffect(() => {
    const handleWindowPaste = (e: ClipboardEvent) => {
      if (!activePasteCardId) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64 = event.target?.result as string;
              updatePost(activePasteCardId, {
                screenshotUrl: base64,
                screenshotFileName: `screenshot-${Date.now()}.png`
              });
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handleWindowPaste);
    return () => window.removeEventListener('paste', handleWindowPaste);
  }, [activePasteCardId]);

  // Helper to generate an automatic stylish branded screenshot mockup
  const generateMockupScreenshot = (post: SosmedPostItem) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sName = post.storeName || storeName || 'MEGA KTSN';
    const isIG = post.platform === 'IG';
    const isFB = post.platform === 'FB';
    const isTT = post.platform === 'TIKTOK';

    // 1. Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    if (isIG) {
      gradient.addColorStop(0, '#833ab4');
      gradient.addColorStop(0.5, '#fd1d1d');
      gradient.addColorStop(1, '#fcb045');
    } else if (isFB) {
      gradient.addColorStop(0, '#1877f2');
      gradient.addColorStop(1, '#0c4a9e');
    } else if (isTT) {
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.5, '#fe2c55');
      gradient.addColorStop(1, '#25f4ee');
    } else {
      gradient.addColorStop(0, '#4f46e5');
      gradient.addColorStop(1, '#7c3aed');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // 2. Dark inner container
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.roundRect ? ctx.roundRect(60, 60, 960, 960, 40) : ctx.fillRect(60, 60, 960, 960);
    ctx.fill();

    // 3. Top Platform Badge & Header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`${post.platform} POSTINGAN OFFICIAL • ${post.timeSlot.toUpperCase()}`, 110, 150);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '28px sans-serif';
    ctx.fillText(`${reportDate} • ${sName}`, 110, 195);

    // 4. White Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(110, 230);
    ctx.lineTo(970, 230);
    ctx.stroke();

    // 5. Store / Product Headline Box
    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 64px sans-serif';
    const cleanTitle = (post.title || 'PRODUK / PROMO TERBARU').toUpperCase();
    ctx.fillText(cleanTitle.length > 25 ? cleanTitle.substring(0, 25) + '...' : cleanTitle, 110, 340);

    // Subtitle / Store Tag
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText(`POST ${post.platform} ${sName}`, 110, 400);

    // 6. Center Visual Mockup Graphic
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.roundRect ? ctx.roundRect(110, 450, 860, 360, 24) : ctx.fillRect(110, 450, 860, 360);
    ctx.fill();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Inner icon & text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('📸 BUKTI POSTINGAN SOSMED TAYANG', 160, 530);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '26px monospace';
    const displayUrl = post.url || `https://${post.platform.toLowerCase()}.com/p/...`;
    ctx.fillText(displayUrl.length > 50 ? displayUrl.substring(0, 50) + '...' : displayUrl, 160, 600);

    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`✓ Format: POST ${post.platform} ${sName}, ${cleanTitle}`, 160, 670);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 24px sans-serif';
    ctx.fillText(`Kategori: ${post.contentType} | Jadwal: ${post.timeSlot}`, 160, 730);

    // 7. Footer Brand
    ctx.fillStyle = '#f8fafc';
    ctx.font = '900 36px sans-serif';
    ctx.fillText(`MEGA ELEKTRONIK & HP ${sName}`, 110, 890);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '24px sans-serif';
    ctx.fillText('Laporan Harian Tim Desainer & Marketing', 110, 935);

    const base64 = canvas.toDataURL('image/png');
    updatePost(post.id, {
      screenshotUrl: base64,
      screenshotFileName: `Mockup-SS-${post.platform}-${cleanTitle.replace(/\s+/g, '_')}.png`
    });
  };

  // Update a post item
  const updatePost = (id: string, updates: Partial<SosmedPostItem>) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  // Delete a post
  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  // Toggle completed status
  const toggleCompleted = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isCompleted: !p.isCompleted } : p))
    );
  };

  // 1-Click Mirroring to other platform (e.g. IG -> FB or FB -> IG)
  const mirrorPost = (post: SosmedPostItem) => {
    const targetPlatform: SocialPlatform = post.platform === 'IG' ? 'FB' : 'IG';
    const mirrored: SosmedPostItem = {
      id: `post-${Date.now()}`,
      platform: targetPlatform,
      contentType: post.contentType,
      timeSlot: post.timeSlot,
      storeName: post.storeName || storeName,
      title: post.title,
      url: '', // User will paste the specific FB/IG link
      screenshotUrl: post.screenshotUrl, // Share same screenshot if applicable
      notes: `Mirroring dari ${post.platform} (${post.title})`,
      isCompleted: false,
      order: posts.length + 1
    };

    setPosts((prev) => [...prev, mirrored]);
  };

  // Add new post
  const handleAddNewPost = () => {
    if (!newTitle.trim()) {
      setAddModalError('Silakan masukkan nama/judul postingan (contoh: GODA LEMON)');
      return;
    }
    setAddModalError(null);

    const cleanTitle = newTitle.trim().toUpperCase();
    const cleanStore = (storeName || 'MEGA KTSN').trim().toUpperCase();

    const primaryPost: SosmedPostItem = {
      id: `post-${Date.now()}`,
      platform: newPlatform,
      contentType: newContentType,
      timeSlot: newTimeSlot,
      storeName: cleanStore,
      title: cleanTitle,
      url: newUrl.trim(),
      notes: newNotes.trim(),
      isCompleted: false,
      order: posts.length + 1
    };

    const newPostsList = [...posts, primaryPost];

    // If auto mirror is checked and platform is IG, create FB mirror counterpart
    if (newAutoMirror && (newPlatform === 'IG' || newPlatform === 'FB')) {
      const mirrorPlatform: SocialPlatform = newPlatform === 'IG' ? 'FB' : 'IG';
      const mirrorPostItem: SosmedPostItem = {
        id: `post-${Date.now() + 1}`,
        platform: mirrorPlatform,
        contentType: newContentType,
        timeSlot: newTimeSlot,
        storeName: cleanStore,
        title: cleanTitle,
        url: '',
        notes: `Mirroring ${mirrorPlatform} (${cleanTitle})`,
        isCompleted: false,
        order: posts.length + 2
      };
      newPostsList.push(mirrorPostItem);
    }

    setPosts(newPostsList);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewUrl('');
    setNewNotes('');
  };

  // Reset to default daily 7 posts
  const handleResetToDefault = () => {
    if (window.confirm('Reset daftar postingan ke template rutin 7 postingan harian (Pagi, Siang, Sore)?')) {
      const resetList = DEFAULT_SOSMED_POSTS.map((p, idx) => ({
        ...p,
        id: `post-default-${idx}-${Date.now()}`,
        storeName: storeName,
        isCompleted: false
      }));
      setPosts(resetList);
    }
  };

  // Format single post message for WhatsApp (Struktur Huruf Besar Semua untuk Header Judul Produk)
  const formatPostText = (post: SosmedPostItem): string => {
    const config = SOSMED_PLATFORM_CONFIG[post.platform] || SOSMED_PLATFORM_CONFIG.OTHER;
    const prefix = (config.prefix || 'POST').toUpperCase();
    const sName = (post.storeName || storeName || 'MEGA KTSN').trim().toUpperCase();
    const titleText = (post.title || 'PRODUK / PROMO TERBARU').trim().toUpperCase();
    const urlText = post.url ? post.url.trim() : '(Link belum diisi)';

    return `${prefix} ${sName}, ${titleText}\n${urlText}`;
  };

  // =========================================================================
  // ⚡ 1-KLIK SALIN PAKET LENGKAP 3-IN-1 (GAMBAR + JUDUL + LINK)
  // =========================================================================
  const handleCopyCombo = async (post: SosmedPostItem) => {
    const formattedText = formatPostText(post);

    // If there is no screenshot yet, auto-generate mockup first so user gets real image!
    let currentScreenshot = post.screenshotUrl;
    if (!currentScreenshot) {
      generateMockupScreenshot(post);
      // We will copy text first and prompt user
    }

    try {
      if (post.screenshotUrl && navigator.clipboard && (window as any).ClipboardItem) {
        const res = await fetch(post.screenshotUrl);
        const imageBlob = await res.blob();
        const textBlob = new Blob([formattedText], { type: 'text/plain' });
        const htmlBlob = new Blob([
          `<div><p><strong>${formattedText.replace(/\n/g, '<br/>')}</strong></p><img src="${post.screenshotUrl}" alt="${post.title}" /></div>`
        ], { type: 'text/html' });

        try {
          // Attempt Multi-MIME clipboard item (Image + Text + HTML)
          await navigator.clipboard.write([
            new (window as any).ClipboardItem({
              [imageBlob.type]: imageBlob,
              'text/plain': textBlob,
              'text/html': htmlBlob
            })
          ]);
        } catch {
          // Fallback: copy image directly
          await navigator.clipboard.write([
            new (window as any).ClipboardItem({
              [imageBlob.type]: imageBlob
            })
          ]);
        }

        setCopiedComboId(post.id);
        setActiveComboToast({
          post,
          text: formattedText,
          hasImage: true
        });
        setTimeout(() => setCopiedComboId(null), 3000);
      } else {
        // Fallback: Copy plain text and show floating helper
        await navigator.clipboard.writeText(formattedText);
        setCopiedId(post.id);
        setActiveComboToast({
          post,
          text: formattedText,
          hasImage: false
        });
        setTimeout(() => setCopiedId(null), 3000);
      }
    } catch {
      // Fallback standard text
      await navigator.clipboard.writeText(formattedText);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 3000);
    }
  };

  // =========================================================================
  // 📤 NATIVE WEB SHARE API (KIRIM GAMBAR + CAPTION LANGSUNG 1-KLIK KE WA)
  // =========================================================================
  const handleNativeShare = async (post: SosmedPostItem) => {
    const formattedText = formatPostText(post);
    const cleanPlat = (post.platform ? `POST ${post.platform}` : 'POST').toUpperCase();
    const cleanStore = (post.storeName || storeName || 'MEGA KTSN').trim().toUpperCase();
    const cleanTitle = (post.title || 'PRODUK / PROMO TERBARU').trim().toUpperCase();

    try {
      if (post.screenshotUrl && navigator.canShare) {
        const res = await fetch(post.screenshotUrl);
        const blob = await res.blob();
        const file = new File([blob], `SS-${post.platform}-${cleanTitle.replace(/\s+/g, '_')}.png`, {
          type: blob.type
        });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${cleanPlat} ${cleanStore}, ${cleanTitle}`,
            text: formattedText,
            files: [file]
          });
          return;
        }
      }

      // Fallback: open WhatsApp link with text
      const encoded = encodeURIComponent(formattedText);
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    } catch {
      // User cancelled or fallback
      const encoded = encodeURIComponent(formattedText);
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  // Copy single post text (Caption saja) - Langsung tersalin tanpa pop-up mengganggu
  const handleCopySinglePost = (post: SosmedPostItem) => {
    const text = formatPostText(post);
    navigator.clipboard.writeText(text);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Share single post directly to WhatsApp
  const handleShareToWhatsApp = (post: SosmedPostItem) => {
    const text = formatPostText(post);
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Copy single post image to clipboard
  const handleCopyImage = async (post: SosmedPostItem) => {
    if (!post.screenshotUrl) return;
    try {
      // Convert base64 / blob to image blob
      const res = await fetch(post.screenshotUrl);
      const blob = await res.blob();
      if (navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({ [blob.type]: blob })
        ]);
        setCopiedImageId(post.id);
        setTimeout(() => setCopiedImageId(null), 2500);
      }
    } catch {
      // Fallback
    }
  };

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, postId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        updatePost(postId, {
          screenshotUrl: base64,
          screenshotFileName: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate full daily summary report text
  const fullDailyReportText = useMemo(() => {
    const completedCount = posts.filter((p) => p.isCompleted).length;
    const sNameHeader = (storeName || 'MEGA KTSN').trim().toUpperCase();
    let text = `📢 *LAPORAN POSTING SOSMED - ${sNameHeader}*\n`;
    text += `📅 *${reportDate}*\n`;
    text += `🎯 Total: ${posts.length} Postingan (${completedCount} Tayang)\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━\n`;

    posts.forEach((post, index) => {
      const config = SOSMED_PLATFORM_CONFIG[post.platform] || SOSMED_PLATFORM_CONFIG.OTHER;
      const prefix = (config.prefix || 'POST').toUpperCase();
      const sName = (post.storeName || storeName || 'MEGA KTSN').trim().toUpperCase();
      const titleText = (post.title || 'PRODUK / PROMO TERBARU').trim().toUpperCase();
      const checkMark = post.isCompleted ? '✅' : '⏳';
      text += `*${index + 1}. ${prefix} ${sName}, ${titleText}* ${checkMark}\n`;
      text += `${post.url ? post.url.trim() : '(Link menyusul)'}\n\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `✅ *Laporan harian tim desainer & marketing sosmed.*`;
    return text;
  }, [posts, storeName, reportDate]);

  // Copy full daily report
  const handleCopyFullReport = () => {
    navigator.clipboard.writeText(fullDailyReportText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Share full daily report to WhatsApp
  const handleShareFullReportWA = () => {
    const encoded = encodeURIComponent(fullDailyReportText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (filterSlot !== 'all' && post.timeSlot !== filterSlot) return false;
      if (filterPlatform !== 'all' && post.platform !== filterPlatform) return false;
      return true;
    });
  }, [posts, filterSlot, filterPlatform]);

  const completedCount = posts.filter((p) => p.isCompleted).length;
  const progressPercent = posts.length > 0 ? Math.round((completedCount / posts.length) * 100) : 0;

  return (
    <div className="space-y-6 relative pb-16">
      
      {/* Top Banner & Header Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-xl border border-indigo-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Left Title & Store Info */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30 text-xs font-bold flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold flex items-center gap-1.5">
                <Facebook className="w-3.5 h-3.5" />
                <span>Facebook</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                <span>TikTok VT</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold">
                ⚡ 3-in-1 Combo Ready
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Laporan Posting Sosmed Harian</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-400 text-amber-950">
                Format Grup WA
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Format otomatis 3-in-1: <code className="bg-black/50 text-amber-300 px-1.5 py-0.5 rounded font-mono text-[11px]">POST IG MEGA KTSN, GODA LEMON</code> + Link URL + Lampiran Foto Screenshot untuk dishare ke Grup WhatsApp Desainer / Marketing.
            </p>
          </div>

          {/* Right Quick Controls & Counter */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0">
            
            {/* Daily Progress Widget */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 w-full sm:w-auto min-w-[240px]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Target Posting Hari Ini:</span>
                </span>
                <span className="font-mono font-bold text-amber-300">
                  {completedCount} / {posts.length} Post
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span>{progressPercent}% Siap Kirim</span>
                <span>{posts.length - completedCount} Menunggu</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsExplainModalOpen(true)}
                className="px-3 py-1.5 bg-indigo-600/70 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold border border-indigo-400/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Penjelasan cara kerja salin 3-in-1 dan WhatsApp Web"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-200" />
                <span>Kenapa Gambar &amp; Teks Terpisah?</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Postingan</span>
              </button>
            </div>

          </div>

        </div>

        {/* Setting Toolbar: Store Name & Date */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-lg border border-white/10">
              <Store className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400 font-medium">Toko:</span>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="MEGA KTSN"
                className="bg-transparent text-white font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded px-1 w-28 uppercase text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-lg border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 font-medium">Tanggal:</span>
              <input
                type="text"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded px-1 w-48 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefault}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset ke daftar standar 7 postingan per hari"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset 7 Postingan Harian</span>
            </button>
          </div>
        </div>
      </div>

      {/* DAILY POSTING MILESTONE & TIME DEADLINE REMINDER */}
      <PostingMilestoneTimer
        posts={posts}
        storeName={storeName}
        onCopyReport={handleCopyFullReport}
        onShareWhatsApp={handleShareFullReportWA}
        onCompleteAllPosts={() => {
          setPosts(posts.map((p) => ({ ...p, isCompleted: true })));
        }}
      />

      {/* QUICK STEP GUIDE: HOW TO PASTE 3-IN-1 IN WHATSAPP IN 2 SECONDS */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4 rounded-2xl border border-indigo-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Cara Tercepat Kirim 3 Sekaligus (Judul + Link + Screenshot) ke WhatsApp:</span>
            </div>
            <p className="text-[11px] text-indigo-900/80 leading-relaxed">
              <b>Opsi 1 (Paling Mudah):</b> Klik tombol <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold text-[10px]">⚡ 1-Klik Salin Paket 3-in-1</span> &rarr; Di WhatsApp Web tekan <kbd className="bg-white px-1 rounded border border-indigo-200 font-mono text-[10px]">Ctrl + V</kbd> (Foto langsung muncul di WhatsApp) &rarr; Lalu klik <i>"Tempel Keterangan"</i> di WhatsApp!
            </p>
          </div>

          <button
            onClick={() => setIsExplainModalOpen(true)}
            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>Buka Diagram Alur WhatsApp</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Filter Tabs & Bulk Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Waktu:</span>
          </span>

          {['all', 'Pagi', 'Siang', 'Sore / Malam'].map((slot) => (
            <button
              key={slot}
              onClick={() => setFilterSlot(slot)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterSlot === slot
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {slot === 'all' ? `Semua Waktu (${posts.length})` : slot}
            </button>
          ))}

          <span className="text-slate-300 mx-1">|</span>

          {['all', 'IG', 'FB', 'TIKTOK'].map((plat) => (
            <button
              key={plat}
              onClick={() => setFilterPlatform(plat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterPlatform === plat
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {plat === 'all' ? 'Semua Sosmed' : plat}
            </button>
          ))}
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyFullReport}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              copiedAll
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
            title="Salin rekap seluruh 7 postingan sekaligus dalam 1 format rapi"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5 text-slate-600" />}
            <span>{copiedAll ? 'Rekap Tersalin!' : 'Salin Rekap Harian (7 Post)'}</span>
          </button>

          <button
            onClick={handleShareFullReportWA}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Buka WhatsApp dengan seluruh rekap 7 postingan terisi otomatis"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Rekap ke WA</span>
          </button>
        </div>

      </div>

      {/* Grid of Post Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPosts.map((post, idx) => {
          const config = SOSMED_PLATFORM_CONFIG[post.platform] || SOSMED_PLATFORM_CONFIG.OTHER;
          const formattedText = formatPostText(post);
          const isCopied = copiedId === post.id;
          const isImageCopied = copiedImageId === post.id;
          const isComboCopied = copiedComboId === post.id;
          const isCardActive = activePasteCardId === post.id;

          return (
            <div
              key={post.id}
              onClick={() => setActivePasteCardId(post.id)}
              className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden relative ${
                post.isCompleted
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : isCardActive
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-indigo-300'
              }`}
            >
              
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wide flex items-center gap-1 shadow-2xs ${config.badgeBg}`}>
                    {post.platform === 'IG' && <Instagram className="w-3 h-3" />}
                    {post.platform === 'FB' && <Facebook className="w-3 h-3" />}
                    {post.platform === 'TIKTOK' && <Video className="w-3 h-3" />}
                    <span>{config.prefix} {post.storeName || storeName}</span>
                  </span>

                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {post.timeSlot}
                  </span>

                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    {post.contentType}
                  </span>
                </div>

                {/* Right Header Checkbox & Delete */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCompleted(post.id);
                    }}
                    className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                      post.isCompleted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                    title="Tandai status tayang"
                  >
                    {post.isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sudah Tayang</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5 text-slate-400" />
                        <span>Menunggu</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePost(post.id);
                    }}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                    title="Hapus postingan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Body (Inputs & Data) */}
              <div className="p-4 space-y-3.5 text-xs">
                
                {/* Judul Postingan / Produk */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <span>Nama / Judul Postingan:</span>
                    </label>
                    <span className="text-[10px] text-indigo-600 font-semibold">
                      Format: {(config.prefix || 'POST').toUpperCase()} {(post.storeName || storeName || 'MEGA KTSN').trim().toUpperCase()}, [NAMA]
                    </span>
                  </div>
                  <input
                    type="text"
                    value={post.title}
                    onChange={(e) => updatePost(post.id, { title: e.target.value.toUpperCase() })}
                    placeholder="Contoh: GODA LEMON atau PERBEDAAN MESIN CUCI"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all uppercase"
                  />
                </div>

                {/* Link URL Postingan */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <span>Link URL Postingan:</span>
                    </label>
                    {post.url && (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Buka Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={post.url}
                      onChange={(e) => updatePost(post.id, { url: e.target.value })}
                      placeholder={
                        post.platform === 'IG'
                          ? 'https://www.instagram.com/p/...'
                          : post.platform === 'FB'
                          ? 'https://www.facebook.com/photo?fbid=...'
                          : 'https://www.tiktok.com/@.../video/...'
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all pr-20"
                    />
                    
                    {/* Mirroring Helper button (IG <-> FB) */}
                    {(post.platform === 'IG' || post.platform === 'FB') && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          mirrorPost(post);
                        }}
                        className="absolute right-1.5 text-[10px] font-bold px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                        title={`Duplikat ke ${post.platform === 'IG' ? 'Facebook' : 'Instagram'} dengan judul yang sama`}
                      >
                        <ArrowRightLeft className="w-2.5 h-2.5" />
                        <span>Mirror {post.platform === 'IG' ? 'FB' : 'IG'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Screenshot Attachment Zone (Drag, Drop, Paste Ctrl+V, or Auto Mockup) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Lampiran Bukti Screenshot (SS Postingan):</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Bisa Ctrl+V Paste langsung
                    </span>
                  </div>

                  {post.screenshotUrl ? (
                    <div className="relative group bg-slate-900 rounded-xl overflow-hidden border border-slate-300 p-2.5 flex items-center gap-3">
                      
                      {/* Image Thumbnail with Drag Support */}
                      <img
                        src={post.screenshotUrl}
                        alt={`SS ${post.title}`}
                        draggable="true"
                        title="Bisa ditarik (drag & drop) langsung ke chat WhatsApp Web!"
                        className="w-20 h-20 object-cover rounded-lg border border-slate-700 cursor-grab active:cursor-grabbing shrink-0 hover:opacity-90 transition-all shadow-md"
                        onClick={() => setLightboxImage({ url: post.screenshotUrl!, title: post.title })}
                      />

                      {/* Image Details & Quick Actions */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold text-white truncate max-w-[140px]">
                            {post.screenshotFileName || `Screenshot ${post.title}.png`}
                          </p>
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-bold">
                            Foto Siap Salin
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-300 flex items-center gap-1 font-medium">
                          <span>💡 Tips: Klik &amp; Tarik (Drag) foto ini langsung ke WhatsApp Web!</span>
                        </p>

                        <div className="flex items-center gap-1.5 pt-0.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyImage(post);
                            }}
                            className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors flex items-center gap-1 cursor-pointer ${
                              isImageCopied
                                ? 'bg-emerald-500 text-white border-emerald-400'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
                            }`}
                            title="Salin gambar ke clipboard agar bisa langsung Ctrl+V di WhatsApp"
                          >
                            <Copy className="w-2.5 h-2.5" />
                            <span>{isImageCopied ? 'Gambar Tersalin!' : 'Salin Gambar'}</span>
                          </button>

                          <a
                            href={post.screenshotUrl}
                            download={`SS-${post.platform}-${post.title.replace(/\s+/g, '_')}.png`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors flex items-center gap-1"
                            title="Unduh file gambar"
                          >
                            <Download className="w-2.5 h-2.5" />
                            <span>Unduh</span>
                          </a>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updatePost(post.id, { screenshotUrl: undefined, screenshotFileName: undefined });
                            }}
                            className="text-[10px] text-rose-400 hover:text-rose-300 px-1.5 py-1 cursor-pointer ml-auto"
                            title="Hapus screenshot ini"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Dropzone / Paste Zone + Auto Mockup Generator Button */
                    <div className="space-y-1.5">
                      <label
                        className={`border-2 border-dashed rounded-xl p-3 text-center block cursor-pointer transition-all ${
                          isCardActive
                            ? 'border-indigo-400 bg-indigo-50/50'
                            : 'border-slate-300 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/30'
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, post.id)}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center gap-1 text-slate-500">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <ImageIcon className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-[11px] font-bold text-slate-700">
                            {isCardActive ? 'Klik kartu ini & Tekan Ctrl+V (Paste SS)' : 'Klik untuk Upload SS atau Tekan Ctrl+V'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Ambil SS dengan <kbd className="px-1 py-0.2 bg-slate-200 rounded text-slate-700 font-mono">Win + Shift + S</kbd> lalu langsung tempel disini
                          </p>
                        </div>
                      </label>

                      {/* Quick Mockup Generator button if no SS */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          generateMockupScreenshot(post);
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="Buat kartu bukti postingan otomatis dengan judul dan toko Anda"
                      >
                        <Wand2 className="w-3 h-3 text-indigo-600" />
                        <span>Belum sempat screenshot? Klik untuk Buat Gambar Mockup Otomatis</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Formatted Output Box (What will be sent to WhatsApp) */}
                <div className="bg-slate-900 text-white rounded-xl p-3 font-mono text-[11px] border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-sans font-bold mb-1">
                    <span className="flex items-center gap-1 text-indigo-300">
                      <FileText className="w-3 h-3" />
                      <span>Output Pesan Grup WhatsApp:</span>
                    </span>
                    <span className="text-emerald-400 font-normal">Format Standar (Huruf Besar Semua)</span>
                  </div>

                  <p className="text-amber-300 font-bold tracking-wide uppercase">
                    {(config.prefix || 'POST').toUpperCase()} {(post.storeName || storeName || 'MEGA KTSN').trim().toUpperCase()}, {(post.title || 'PRODUK / PROMO TERBARU').trim().toUpperCase()}
                  </p>
                  <p className="text-indigo-200 truncate underline">
                    {post.url || 'https://www.instagram.com/p/...'}
                  </p>
                </div>

              </div>

              {/* Card Footer Actions (THE NEW 3-IN-1 COMBO & SHARE CONTROLS) */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <span className="font-bold">#{post.order || idx + 1}</span>
                  <span>&bull; {post.timeSlot}</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  
                  {/* 1. THE HERO BUTTON: 3-IN-1 COMBO COPY (GAMBAR + TEKS + LINK) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCombo(post);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isComboCopied
                        ? 'bg-emerald-600 text-white shadow-emerald-200'
                        : 'bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white shadow-sm'
                    }`}
                    title="Salin Foto Screenshot DAN Teks Judul + Link sekaligus!"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                    <span>{isComboCopied ? 'Paket 3-in-1 Tersalin!' : '⚡ 1-Klik Salin 3-in-1 (Foto + Teks)'}</span>
                  </button>

                  {/* 2. COPY TEXT ONLY */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopySinglePost(post);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer shadow-2xs ${
                      isCopied
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                    title="Salin teks judul + link saja"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                    <span>{isCopied ? 'Teks Tersalin' : 'Salin Teks'}</span>
                  </button>

                  {/* 3. NATIVE SHARE BUTTON */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNativeShare(post);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                    title="Kirim gambar dan caption langsung via WhatsApp"
                  >
                    <Send className="w-3 h-3" />
                    <span>Kirim WA</span>
                  </button>

                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Daily Full WhatsApp Preview & Archival Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Preview Gabungan Rekap Harian (Semua 7 Postingan)
              </h3>
              <p className="text-xs text-slate-500">
                Gunakan format ini jika ingin mengirimkan seluruh rangkuman postingan hari ini dalam 1 pesan di akhir shift.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFullReport}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                copiedAll
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copiedAll ? 'Seluruh Rekap Tersalin!' : 'Salin Seluruh Rekap'}</span>
            </button>

            <button
              onClick={handleShareFullReportWA}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Share ke Grup WA</span>
            </button>
          </div>
        </div>

        {/* Formatted Textarea Preview */}
        <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap border border-slate-800 max-h-72 overflow-y-auto custom-scrollbar">
          {fullDailyReportText}
        </div>
      </div>

      {/* ========================================================= */}
      {/* FLOATING ACTION TOAST FOR INSTANT WHATSAPP PASTE          */}
      {/* ========================================================= */}
      {activeComboToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 text-white rounded-2xl shadow-2xl border border-indigo-500/50 p-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-emerald-400 flex items-center gap-1">
                  <span>Paket 3-in-1 Siap di Clipboard!</span>
                </h4>
                <p className="text-[11px] text-slate-300 font-semibold uppercase">
                  {activeComboToast.post.platform} • {(activeComboToast.post.title || '').toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveComboToast(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-2.5 p-2 bg-slate-800/90 rounded-lg text-[11px] text-slate-200 border border-slate-700 space-y-1">
            <p className="font-bold text-amber-300">
              👉 Langkah Menempelkan di WhatsApp:
            </p>
            <ol className="list-decimal pl-4 space-y-0.5 text-[10px] text-slate-300">
              <li>Buka WhatsApp Web &rarr; Tekan <kbd className="bg-slate-700 px-1 rounded font-mono">Ctrl + V</kbd> (Foto SS langsung muncul).</li>
              <li>Klik tombol di bawah ini jika ingin menempelkan teks Judul + Link di kolom caption WhatsApp:</li>
            </ol>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(activeComboToast.text);
                setIsToastCaptionCopied(true);
                setTimeout(() => {
                  setIsToastCaptionCopied(false);
                }, 2000);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                isToastCaptionCopied
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
              title="Salin caption langsung ke clipboard"
            >
              {isToastCaptionCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                  <span>✓ Caption Tersalin! (Tekan Ctrl+V di WA)</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Salin Keterangan (Caption) Saja</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                handleShareToWhatsApp(activeComboToast.post);
              }}
              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Buka WA</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD NEW POST                                       */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Tambah Postingan Baru ke Jadwal
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Masukkan judul postingan, link, dan opsi mirroring otomatis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              
              {/* Platform Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5 uppercase tracking-wider text-[11px]">
                  Platform Sosial Media:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['IG', 'FB', 'TIKTOK'] as SocialPlatform[]).map((p) => {
                    const cfg = SOSMED_PLATFORM_CONFIG[p];
                    const isSelected = newPlatform === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewPlatform(p)}
                        className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-xs ring-1 ring-indigo-500'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                        }`}
                      >
                        {p === 'IG' && <Instagram className="w-4 h-4 text-pink-600" />}
                        {p === 'FB' && <Facebook className="w-4 h-4 text-blue-600" />}
                        {p === 'TIKTOK' && <Video className="w-4 h-4 text-slate-900" />}
                        <span className="text-xs">{cfg.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slot & Content Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                    Waktu Tayang:
                  </label>
                  <select
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value as TimeSlot)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Pagi">Pagi (Post 1)</option>
                    <option value="Siang">Siang (Post 2)</option>
                    <option value="Sore / Malam">Sore / Malam (Post 3)</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                    Format Konten:
                  </label>
                  <select
                    value={newContentType}
                    onChange={(e) => setNewContentType(e.target.value as PostContentType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Foto / Feed">Foto / Single Feed</option>
                    <option value="Reel / Video">Reel / Video</option>
                    <option value="Carousel">Carousel Multi Foto</option>
                    <option value="Story">Story</option>
                    <option value="VT (Video TikTok)">VT TikTok</option>
                  </select>
                </div>
              </div>

              {/* Judul Postingan */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 text-[11px] uppercase tracking-wider">
                  Nama / Judul Postingan (Wajib):
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value.toUpperCase());
                    if (addModalError) setAddModalError(null);
                  }}
                  placeholder="Contoh: GODA LEMON atau PERBEDAAN MESIN CUCI"
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg font-bold text-slate-900 focus:bg-white focus:ring-2 focus:outline-none uppercase text-xs ${
                    addModalError
                      ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/50'
                      : 'border-slate-200 focus:ring-indigo-500'
                  }`}
                />
                {addModalError && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">
                    {addModalError}
                  </p>
                )}
              </div>

              {/* Link Postingan */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 text-[11px] uppercase tracking-wider">
                  Link URL Postingan:
                </label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://www.instagram.com/p/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs"
                />
              </div>

              {/* Auto Mirror Checkbox */}
              {(newPlatform === 'IG' || newPlatform === 'FB') && (
                <label className="flex items-center gap-2 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAutoMirror}
                    onChange={(e) => setNewAutoMirror(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-indigo-900 block">
                      Otomatis buatkan pasangan Mirroring ({newPlatform === 'IG' ? 'Facebook' : 'Instagram'})
                    </span>
                    <span className="text-[11px] text-indigo-700">
                      Menghemat waktu agar tidak perlu input judul dua kali untuk IG &amp; FB.
                    </span>
                  </div>
                </label>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddNewPost}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer text-xs shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simpan Postingan</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EXPLANATION & HONEST TECHNICAL LIMITS              */}
      {/* ========================================================= */}
      {isExplainModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50 via-indigo-50 to-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-200">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span>Penjelasan Jujur: Kenapa Gambar &amp; Teks Bekerja Seperti Ini di WhatsApp</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Panduan teknis dan solusi 1-klik yang telah kami buatkan untuk mempermudah Anda.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExplainModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 custom-scrollbar leading-relaxed">
              
              {/* Box 1: Why WhatsApp Web handles images and text in 2 layers */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Kenapa Saat Tekan Ctrl+V di WhatsApp Web, Gambar Masuk tapi Keterangan Terpisah?</span>
                </div>
                
                <div className="space-y-2 text-amber-950 text-xs">
                  <p>
                    Secara teknis di web browser (Chrome/Edge/Firefox) dan protokol <b>WhatsApp Web</b>:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    <li>
                      <b>Media Gambar (Foto/SS):</b> Ketika clipboard berisi file gambar, saat Anda tekan <kbd className="bg-white px-1 border rounded">Ctrl + V</kbd> di WhatsApp, WhatsApp langsung membuka jendela <i>Preview Media / Pengiriman Foto</i>.
                    </li>
                    <li>
                      <b>Kolom Keterangan (Caption):</b> Di jendela preview foto WhatsApp, WhatsApp menyediakan kotak input teks di bawah foto bertuliskan <i>"Tambahkan keterangan..."</i>.
                    </li>
                    <li>
                      <b>Browser Sandbox Security:</b> Browser tidak mengizinkan website luar menyisipkan file biner foto langsung ke dalam baris teks biasa tanpa melewati jendela media WhatsApp demi keamanan mencegah virus/injeksi spam otomatis.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Box 2: Solusi 3-in-1 yang sudah kami buatkan */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>3 Cara Super Cepat yang Sudah Kami Sediakan:</span>
                </div>
                <div className="space-y-2 text-emerald-950 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
                    <p className="font-bold text-emerald-900">
                      1. Tombol ⚡ 1-Klik Salin 3-in-1 (Rekomendasi Utama)
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      Menyalin Foto ke clipboard &amp; memunculkan floating toolbar caption. Di WhatsApp Web tinggal <kbd className="bg-slate-100 px-1 border rounded">Ctrl + V</kbd> (foto langsung masuk) lalu paste captionnya!
                    </p>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
                    <p className="font-bold text-emerald-900">
                      2. Fitur Drag &amp; Drop (Tarik Foto Langsung ke WA)
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      Anda bisa langsung menahan (klik &amp; drag) gambar di kartu dan melepasnya di jendela obrolan WhatsApp Web.
                    </p>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-emerald-200">
                    <p className="font-bold text-emerald-900">
                      3. Fitur Buat Mockup SS Otomatis (Jika Belum Sempat Screenshot)
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      Klik tombol <i>"Buat Mockup Otomatis"</i> jika Anda belum sempat mengambil screenshot &mdash; sistem akan langsung merender kartu bukti postingan cantik siap kirim.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsExplainModalOpen(false)}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-xs"
              >
                Saya Paham &amp; Lanjutkan
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: LIGHTBOX SCREENSHOT PREVIEW                        */}
      {/* ========================================================= */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 p-2">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="max-h-[82vh] w-auto mx-auto object-contain rounded-xl"
            />
            <div className="p-3 text-center text-white text-xs font-bold bg-slate-950/80">
              {lightboxImage.title}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}