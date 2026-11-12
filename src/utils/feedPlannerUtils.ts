import { IgFeedItem } from '../types';

/**
 * Standard footer required on all social media posts with dynamic hashtags replacement.
 */
export const STORE_CAPTION_FOOTER_TEMPLATE = `bisa Kredit? JELAS BISA!
Nikmati promo Bunga 0% dan Admin 0% hanya di Mega Elektronik. Prosesnya kilat, nggak pakai ribet!

Dapatkan produk impianmu sekarang juga. Kami menjamin:
✅ PASTI PALING MURAH di kelasnya!
✅ 100% BERGARANSI PABRIK RESMI

📱 Konsultasi & Pemesanan (WhatsApp):
👉 Admin HP & Laptop: 08113285200

🏢 Kunjungi Store Kami:
📍 CV. MEGA Elektronik & Handphone Kertosono
(Lokasi strategis: Depan Masjid Al-Falah Kertosono, Nganjuk - JATIM)

📍 Our Locations:
🏠 Pusat: MEGA Elektronik & Handphone
🏬 Cabang WRJ: MEGA Elektronik & Handphone WRJ
🏬 Cabang KTSN: CV. MEGA Elektronik & Handphone KTSN(Depan Masjid Al-Falah Kertosono)

🔗 Stay Connected with Us:
📸 IG: @megaelektronikdanhandphonektsn
🔵 FB: MEGA Elektronik & Handphone KTSN
🎬 TikTok: @cv.megaelektronikktsn
🎥 YouTube: cv.mega official

{{HASHTAGS}}`;

/**
 * Default hashtags fallback
 */
export const DEFAULT_HASHTAGS_LINE =
  '#megaelektronik #magiccom #sankenindonesia #nganjukhits #promoelektronik #promokredit\n#nganjuk24jam';

/**
 * Builds the complete footer with contextual hashtags based on product / tags
 */
export function buildCaptionFooter(customHashtagsText?: string): string {
  const hashtags = (customHashtagsText || '').trim() || DEFAULT_HASHTAGS_LINE;
  return STORE_CAPTION_FOOTER_TEMPLATE.replace('{{HASHTAGS}}', hashtags);
}

/**
 * Assembles the full copyable caption: [Body Caption] + 2 newlines + [Footer with hashtags]
 */
export function buildFullCaption(bodyCaption: string, customHashtagsText?: string): string {
  const cleanBody = (bodyCaption || '').trim();
  const footer = buildCaptionFooter(customHashtagsText);
  if (!cleanBody) {
    return footer;
  }
  return `${cleanBody}\n\n${footer}`;
}

export type FeedCategoryType = 'sepeda_listrik' | 'handphone' | 'elektronik' | 'promo_kredit' | 'custom';

export interface ProductDetectionResult {
  category: FeedCategoryType;
  brand: string;
  productType: string;
  confidence: number;
}

/**
 * Smart automatic product & brand detector from image file name or title.
 * Detects specific appliances (blender, magic com, kulkas, mesin cuci, tv, ac, dispenser, mixer, kipas, oven),
 * gadgets & phones (iphone, samsung, oppo, vivo, realme, infinix, xiaomi, laptop),
 * electric bikes (goda, uwinfly, exotic, pacific, selis, sunray, lemon, sepeda listrik),
 * and credit promos (kredit, promo 0%, angsuran, bungan 0%).
 */
export function detectProductFromText(rawText: string): ProductDetectionResult {
  const text = (rawText || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = text.split(/\s+/).filter(Boolean);

  // 1. Detect Brand
  const knownBrands: Record<string, string> = {
    goda: 'Goda',
    uwinfly: 'Uwinfly',
    exotic: 'Exotic',
    pacific: 'Pacific',
    selis: 'Selis',
    sunray: 'Goda',
    lemon: 'Goda',
    oppo: 'Oppo',
    vivo: 'Vivo',
    samsung: 'Samsung',
    realme: 'Realme',
    xiaomi: 'Xiaomi',
    redmi: 'Xiaomi',
    infinix: 'Infinix',
    tecno: 'Tecno',
    apple: 'Apple',
    iphone: 'Apple',
    asus: 'Asus',
    lenovo: 'Lenovo',
    acer: 'Acer',
    hp: 'HP',
    sanken: 'Sanken',
    sharp: 'Sharp',
    polytron: 'Polytron',
    panasonic: 'Panasonic',
    philips: 'Philips',
    miyako: 'Miyako',
    cosmos: 'Cosmos',
    maspion: 'Maspion',
    aqua: 'Aqua',
    lg: 'LG',
    tcl: 'TCL',
    changhong: 'Changhong',
    hisense: 'Hisense',
    daikin: 'Daikin',
    gree: 'Gree',
    rinnai: 'Rinnai',
    quantum: 'Quantum',
    yongma: 'Yong Ma',
    oxone: 'Oxone',
  };

  let detectedBrand = '';
  for (const token of tokens) {
    if (knownBrands[token]) {
      detectedBrand = knownBrands[token];
      break;
    }
  }

  // 2. Check Specific Product Keywords
  // Small & Home Appliances (Blender, Magic Com, Mixer, Kulkas, etc.)
  const isBlender = /\b(blender|jus|juice|chopper|grinder|juicer)\b/i.test(text);
  const isRiceCooker = /\b(magic\s*com|rice\s*cooker|penanak\s*nasi|magiccom)\b/i.test(text);
  const isKulkas = /\b(kulkas|lemari\s*es|freezer|showcase|chiller)\b/i.test(text);
  const isMesinCuci = /\b(mesin\s*cuci|washing\s*machine|laundry|washer)\b/i.test(text);
  const isTV = /\b(tv|televisi|smart\s*tv|led\s*tv|android\s*tv)\b/i.test(text);
  const isAC = /\b(ac|air\s*conditioner|pendingin)\b/i.test(text);
  const isDispenser = /\b(dispenser|galon)\b/i.test(text);
  const isKipas = /\b(kipas|fan|stand\s*fan)\b/i.test(text);
  const isSetrika = /\b(setrika|iron|dry\s*iron)\b/i.test(text);
  const isKompor = /\b(kompor|gas|kompor\s*gas|stove)\b/i.test(text);
  const isSpeaker = /\b(speaker|soundbar|audio|subwoofer|karaoke)\b/i.test(text);

  // Electric Bike keywords
  const isSepedaListrik = /\b(sepeda|sepedalistrik|ebike|e\s*bike|goda|uwinfly|exotic|pacific|selis|sunray|lemon|motor\s*listrik|moped)\b/i.test(
    text
  );

  // Phone / Gadget keywords
  const isHandphone = /\b(hp|handphone|smartphone|ponsel|telepon|gadget|iphone|android|galaxy|reno|redmi|ram|rom|kamera)\b/i.test(
    text
  );

  // Promo / Credit keywords
  const isPromoKredit = /\b(promo|kredit|bunga\s*0|admin\s*0|angsuran|cicilan|acc|fif|spektra|kredivo|home\s*credit|hci)\b/i.test(
    text
  );

  // Hierarchy of classification:
  // Appliances first if specific appliance matched (e.g. "blender" should NEVER be sepeda listrik!)
  if (
    isBlender ||
    isRiceCooker ||
    isKulkas ||
    isMesinCuci ||
    isTV ||
    isAC ||
    isDispenser ||
    isKipas ||
    isSetrika ||
    isKompor ||
    isSpeaker ||
    /\b(elektronik|electronic|perabot|dapur)\b/i.test(text)
  ) {
    let pType = 'Elektronik Rumah';
    if (isBlender) pType = 'Blender';
    else if (isRiceCooker) pType = 'Magic Com';
    else if (isKulkas) pType = 'Kulkas';
    else if (isMesinCuci) pType = 'Mesin Cuci';
    else if (isTV) pType = 'Smart TV';
    else if (isAC) pType = 'Air Conditioner (AC)';
    else if (isDispenser) pType = 'Dispenser';
    else if (isKipas) pType = 'Kipas Angin';
    else if (isKompor) pType = 'Kompor Gas';

    return {
      category: 'elektronik',
      brand: detectedBrand || (isBlender ? 'Miyako' : isRiceCooker ? 'Sanken' : 'Sharp'),
      productType: pType,
      confidence: 95,
    };
  }

  // Next check Sepeda Listrik
  if (isSepedaListrik && !isHandphone) {
    return {
      category: 'sepeda_listrik',
      brand: detectedBrand || 'Goda',
      productType: 'Sepeda Listrik',
      confidence: 90,
    };
  }

  // Next check Phone
  if (isHandphone) {
    return {
      category: 'handphone',
      brand: detectedBrand || 'Oppo',
      productType: 'Smartphone',
      confidence: 85,
    };
  }

  // Next check Promo Kredit
  if (isPromoKredit) {
    return {
      category: 'promo_kredit',
      brand: detectedBrand || '',
      productType: 'Promo Kredit 0%',
      confidence: 80,
    };
  }

  return {
    category: 'elektronik',
    brand: detectedBrand || 'Mega',
    productType: 'Produk Elektronik',
    confidence: 50,
  };
}

/**
 * Lightweight preset caption generator based on topic and product title
 */
export interface CaptionGeneratePreset {
  category: FeedCategoryType;
  title: string;
  brand?: string;
  featureOrPromo?: string;
}

export function generateLightweightCaption(preset: CaptionGeneratePreset): {
  bodyCaption: string;
  hashtags: string;
} {
  const title = (preset.title || '').trim() || 'Produk Unggulan Mega';
  const brand = (preset.brand || '').trim();
  const feature = (preset.featureOrPromo || '').trim();

  const brandClean = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
  const titleLower = title.toLowerCase();

  let body = '';
  let hashtags = '';

  switch (preset.category) {
    case 'sepeda_listrik': {
      const brandTag = brandClean ? `#${brandClean}indonesia` : '#godaindonesia';
      body = `🛵 ${title.toUpperCase()} — Solusi Hemat & Nyaman Buat Aktivitas Harianmu! ⚡✨

Mau keliling kota, belanja santai, atau antar jemput anak tanpa mikir bensin? ${title} siap jadi andalan!
Desainnya stylish, tarikan enteng, dan baterainya awet banget.

${feature ? `🌟 Keunggulan Utama: ${feature}\n` : ''}
Yuk miliki sekarang dengan cicilan super ringan tanpa beban!`;

      hashtags = `#megaelektronik #sepedalistrik ${brandTag} #sepedalistrikmurah #nganjukhits #promokredit\n#nganjuk24jam #kertosono`;
      break;
    }

    case 'handphone': {
      const brandTag = brandClean ? `#${brandClean}indonesia` : '#hpmurah';
      body = `📱 UPGRADE HP IMPIANMU BERSAMA ${title.toUpperCase()}! 🔥📸

Lagi cari smartphone dengan kamera jernih, baterai tahan seharian, dan performa anti lemot? ${title} pilihan paling pas buat kamu!
${feature ? `✨ Fitur Unggulan: ${feature}\n` : ''}
Langsung bawa pulang hari ini dengan cicilan 0% dan garansi resmi pabrik 100%!`;

      hashtags = `#megaelektronik #gadgetnganjuk ${brandTag} #hpterbaru #nganjukhits #promokredit\n#nganjuk24jam #kertosono`;
      break;
    }

    case 'elektronik': {
      // Differentiate specifically between Blender, Magic Com, Kulkas, Mesin Cuci, TV, AC
      const isBlender = /\b(blender|chopper|juicer|jus)\b/i.test(titleLower);
      const isRiceCooker = /\b(magic\s*com|rice\s*cooker|magiccom)\b/i.test(titleLower);
      const isKulkas = /\b(kulkas|lemari\s*es|freezer)\b/i.test(titleLower);
      const isMesinCuci = /\b(mesin\s*cuci|washer)\b/i.test(titleLower);
      const isTV = /\b(tv|televisi|led)\b/i.test(titleLower);

      if (isBlender) {
        const brandTag = brandClean ? `#${brandClean}indonesia` : '#miyakoindonesia';
        body = `🍹 BIKIN JUS & BUMBU MAKIN CEPAT & HALUS DENGAN ${title.toUpperCase()}! 🌪️✨

Gak perlu ribet ulek bumbu atau mau bikin jus segar tiap hari! Pisau tajam berbahan stainless steel food grade, motor kuat bertenaga, dan wadah anti pecah.
${feature ? `💡 Fitur: ${feature}\n` : 'Mata pisau tajam, hemat listrik, dan mudah dibersihkan.\n'}
Dapatkan produk original bergaransi resmi hanya di CV. Mega Elektronik Kertosono!`;

        hashtags = `#megaelektronik #blender ${brandTag} #blenderbumbu #jusbuah #nganjukhits #promoelektronik\n#nganjuk24jam`;
      } else if (isRiceCooker) {
        const brandTag = brandClean ? `#${brandClean}indonesia` : '#sankenindonesia';
        body = `🍚 NASI PULEN, HANGAT & TIDAK CEPAT BASI DENGAN ${title.toUpperCase()}! 🌾✨

Masak nasi lebih praktis, matang merata, dan panci anti lengket yang aman untuk kesehatan keluarga.
${feature ? `💡 Fitur: ${feature}\n` : 'Panci anti lengket berkualitas, 3D heating system, hemat listrik.\n'}
Yuk miliki sekarang dengan harga promo terbaik di Mega Elektronik!`;

        hashtags = `#megaelektronik #magiccom ${brandTag} #ricecooker #nganjukhits #promoelektronik #promokredit\n#nganjuk24jam`;
      } else if (isKulkas) {
        const brandTag = brandClean ? `#${brandClean}indonesia` : '#sharpindonesia';
        body = `❄️ SAYUR & BUAH SEGAR TAHAN LAMA DENGAN ${title.toUpperCase()}! 🥦🍎

Kapasitas lega, pendinginan merata sampai ke sudut, dan teknologi inverter hemat listrik!
${feature ? `💡 Fitur: ${feature}\n` : 'Ruang freezer luas, anti bau, hemat listrik.\n'}
Bisa kredit bunga 0% proses kilat di Mega Elektronik!`;

        hashtags = `#megaelektronik #kulkas ${brandTag} #kulkasinverter #nganjukhits #promoelektronik #promokredit\n#nganjuk24jam`;
      } else if (isMesinCuci) {
        const brandTag = brandClean ? `#${brandClean}indonesia` : '#polytronindonesia';
        body = `🧺 CUCIAN BERSIH KILAT TANPA MERUSAK PAKAIAN BERSAMA ${title.toUpperCase()}! 👕✨

Pusaran air kuat mampu mengangkat noda membandel sekaligus mengeringkan lebih cepat.
${feature ? `💡 Fitur: ${feature}\n` : 'Tabung stainless tahan karat, hemat air dan listrik.\n'}
Dapatkan promo cicilan spesial hanya di CV. Mega Elektronik!`;

        hashtags = `#megaelektronik #mesincuci ${brandTag} #nganjukhits #promoelektronik #promokredit\n#nganjuk24jam`;
      } else if (isTV) {
        const brandTag = brandClean ? `#${brandClean}indonesia` : '#tclindonesia';
        body = `📺 NONTON FILM & YOUTUBE MAKIN SERU DI ${title.toUpperCase()}! 🍿🎬

Gambar jernih resolusi tajam dengan warna memukau dan audio bioskop yang menggelegar!
${feature ? `💡 Fitur: ${feature}\n` : 'Smart TV OS, Google TV, bezel tipis elegan.\n'}
Upgrade hiburan keluarga sekarang juga di Mega Elektronik!`;

        hashtags = `#megaelektronik #smarttv ${brandTag} #tvdigital #nganjukhits #promoelektronik #promokredit\n#nganjuk24jam`;
      } else {
        const brandTag = brandClean ? `#${brandClean}indonesia` : '#elektronikrumahtangga';
        body = `✨ RUMAH MAKIN NYAMAN & PRAKTIS DENGAN ${title.toUpperCase()}! 🏠❄️

Bikin kegiatan di rumah makin mudah dan hemat listrik. Kualitas terjamin dari brand terpercaya dengan daya tahan nomor satu!
${feature ? `💡 Spesifikasi: ${feature}\n` : ''}
Stok terbatas! Dapatkan harga spesial promo bulan ini di Mega Elektronik!`;

        hashtags = `#megaelektronik #elektronikmurah ${brandTag} #nganjukhits #promoelektronik #promokredit\n#nganjuk24jam`;
      }
      break;
    }

    case 'promo_kredit': {
      body = `🎉 PROMO SPESIAL BUNGA 0% & ADMIN 0% — SEMUA BISA KREDIT! 💳✨

Impian punya produk elektronik, gadget, atau sepeda listrik baru kini makin gampang diraih!
Tanpa jaminan ribet, proses cepat kilat hitungan menit langsung ACC!
${feature ? `📌 Promo: ${feature}\n` : 'Promo bunga 0% dan admin 0% cicilan super ringan!\n'}
Yuk buruan merapat ke CV. Mega Elektronik Kertosono sebelum kuota promo habis!`;

      hashtags = `#megaelektronik #promokredit #kreditbunga0 #kreditcepat #nganjukhits #promoelektronik\n#nganjuk24jam`;
      break;
    }

    case 'custom':
    default: {
      body = `✨ Rekomendasi Terbaik Hari Ini: ${title}!

Dapatkan penawaran terbaik dan produk 100% original bergaransi resmi hanya di Mega Elektronik.
${feature ? `Detail: ${feature}\n` : ''}`;

      hashtags = DEFAULT_HASHTAGS_LINE;
      break;
    }
  }

  return {
    bodyCaption: body,
    hashtags,
  };
}

/**
 * Aggressively compresses an image File or Data URL in the browser
 * to keep LocalStorage footprint negligible (target: ~15KB - 40KB per preview tile).
 * Resizes to max 480px and applies JPEG compression at 0.55 quality.
 */
export async function compressImageToMinimalBase64(
  fileOrDataUrl: File | string,
  maxDimension = 480,
  quality = 0.55
): Promise<{ dataUrl: string; sizeBytes: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context not available'));
        return;
      }

      // Fill white background for transparent PNGs
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Export as compressed JPEG
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      const sizeBytes = Math.round((compressedDataUrl.length * 3) / 4);

      resolve({
        dataUrl: compressedDataUrl,
        sizeBytes,
      });
    };

    img.onerror = (err) => reject(err);

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          img.src = e.target.result;
        } else {
          reject(new Error('Failed to read file as data URL'));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

/**
 * Generates initial realistic dummy feed tiles so user gets an immediate rich 3x3 layout
 */
export function getInitialFeedPlannerItems(): IgFeedItem[] {
  const sampleColors = [
    { bg: '#2563eb', accent: '#60a5fa', text: 'GODA SUNRAY', cat: 'sepeda_listrik' as const, brand: 'Goda' },
    { bg: '#ec4899', accent: '#f472b6', text: 'OPPO RENO 12', cat: 'handphone' as const, brand: 'Oppo' },
    { bg: '#8b5cf6', accent: '#a78bfa', text: 'BLENDER MIYAKO 2 IN 1', cat: 'elektronik' as const, brand: 'Miyako' },
    { bg: '#10b981', accent: '#34d399', text: 'PROMO KREDIT 0%', cat: 'promo_kredit' as const, brand: '' },
    { bg: '#f59e0b', accent: '#fbbf24', text: 'KULKAS 2 PINTU INVERTER', cat: 'elektronik' as const, brand: 'Sharp' },
    { bg: '#06b6d4', accent: '#22d3ee', text: 'GODA LEMON', cat: 'sepeda_listrik' as const, brand: 'Goda' },
    { bg: '#6366f1', accent: '#818cf8', text: 'SAMSUNG GALAXY A55', cat: 'handphone' as const, brand: 'Samsung' },
    { bg: '#ef4444', accent: '#f87171', text: 'MAGIC COM DIGITAL', cat: 'elektronik' as const, brand: 'Sanken' },
    { bg: '#14b8a6', accent: '#2dd4bf', text: 'MESIN CUCI POLYTRON', cat: 'elektronik' as const, brand: 'Polytron' },
  ];

  return sampleColors.map((item, idx) => {
    // Generate a lightweight inline SVG data URL for crisp placeholders
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="g${idx}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${item.bg}"/>
          <stop offset="100%" stop-color="${item.accent}"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#g${idx})"/>
      <circle cx="200" cy="170" r="60" fill="white" opacity="0.2"/>
      <text x="200" y="180" font-family="sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle">MEGA</text>
      <rect x="40" y="270" width="320" height="60" rx="12" fill="white" opacity="0.95"/>
      <text x="200" y="308" font-family="sans-serif" font-size="16" font-weight="900" fill="#0f172a" text-anchor="middle">${item.text}</text>
      <text x="200" y="360" font-family="sans-serif" font-size="12" font-weight="bold" fill="white" text-anchor="middle" letter-spacing="1">SLIDE #${idx + 1}</text>
    </svg>`;

    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    const gen = generateLightweightCaption({
      category: item.cat,
      title: item.text,
      brand: item.brand,
    });

    return {
      id: `sample-feed-${idx + 1}`,
      imageDataUrl: dataUrl,
      fileSizeBytes: 1200,
      title: item.text,
      bodyCaption: gen.bodyCaption,
      category: item.cat,
      tagsInput: item.brand ? `${item.brand}, ${item.text}` : item.text,
      customHashtags: gen.hashtags,
      isCarousel: idx % 3 === 0,
      carouselSlideCount: idx % 3 === 0 ? 3 : 1,
      postDate: '',
      status: 'ready',
      order: idx,
      createdAt: Date.now() - (9 - idx) * 3600000,
      updatedAt: Date.now(),
    };
  });
}
