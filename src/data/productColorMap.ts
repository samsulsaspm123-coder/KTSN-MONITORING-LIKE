// Color Mapping for Electronics Social Media Design Schedule
// Matches the exact visual styling and palette of Google Spreadsheet "ELEKTRONIK"

export interface ProductColorStyle {
  id: string;
  name: string;
  bgHex: string;
  textHex: string;
  tailwindBg: string;
  tailwindText: string;
  borderHex?: string;
  categoryGroup?: 'gadget' | 'pendingin' | 'dapur' | 'entertainment' | 'promo' | 'status';
}

export const PRODUCT_COLOR_PALETTE: Record<string, ProductColorStyle> = {
  'SEPEDA LISTRIK': {
    id: 'sepeda_listrik',
    name: 'SEPEDA LISTRIK',
    bgHex: '#b8860b', // Gold / Dark Ochre
    textHex: '#ffffff',
    tailwindBg: 'bg-[#b8860b]',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'dapur',
  },
  'LAPTOP': {
    id: 'laptop',
    name: 'LAPTOP',
    bgHex: '#e040fb', // Vivid Neon Magenta / Fuchsia
    textHex: '#000000',
    tailwindBg: 'bg-[#e040fb]',
    tailwindText: 'text-slate-950 font-black',
    categoryGroup: 'gadget',
  },
  'HP': {
    id: 'hp',
    name: 'HP',
    bgHex: '#ffab91', // Soft Coral Peach
    textHex: '#3e2723',
    tailwindBg: 'bg-[#ffab91]',
    tailwindText: 'text-[#3e2723] font-bold',
    categoryGroup: 'gadget',
  },
  'TV': {
    id: 'tv',
    name: 'TV',
    bgHex: '#b2ebf2', // Soft Ice Cyan
    textHex: '#004d40',
    tailwindBg: 'bg-[#b2ebf2]',
    tailwindText: 'text-[#004d40] font-bold',
    categoryGroup: 'entertainment',
  },
  'KULKAS': {
    id: 'kulkas',
    name: 'KULKAS',
    bgHex: '#81d4fa', // Sky Blue
    textHex: '#01579b',
    tailwindBg: 'bg-[#81d4fa]',
    tailwindText: 'text-[#01579b] font-bold',
    categoryGroup: 'pendingin',
  },
  'MESIN CUCI': {
    id: 'mesin_cuci',
    name: 'MESIN CUCI',
    bgHex: '#f48fb1', // Pastel Pink
    textHex: '#880e4f',
    tailwindBg: 'bg-[#f48fb1]',
    tailwindText: 'text-[#880e4f] font-bold',
    categoryGroup: 'pendingin',
  },
  'AC': {
    id: 'ac',
    name: 'AC',
    bgHex: '#a5d6a7', // Pale Mint Green
    textHex: '#1b5e20',
    tailwindBg: 'bg-[#a5d6a7]',
    tailwindText: 'text-[#1b5e20] font-bold',
    categoryGroup: 'pendingin',
  },
  'MAGIC COM': {
    id: 'magic_com',
    name: 'MAGIC COM',
    bgHex: '#ffb74d', // Mandarin Orange
    textHex: '#e65100',
    tailwindBg: 'bg-[#ffb74d]',
    tailwindText: 'text-[#e65100] font-bold',
    categoryGroup: 'dapur',
  },
  'SHOWCASE': {
    id: 'showcase',
    name: 'SHOWCASE',
    bgHex: '#ffcc80', // Peach Amber
    textHex: '#e65100',
    tailwindBg: 'bg-[#ffcc80]',
    tailwindText: 'text-[#e65100] font-bold',
    categoryGroup: 'pendingin',
  },
  'KOMPOR': {
    id: 'kompor',
    name: 'KOMPOR',
    bgHex: '#4caf50', // Leaf Green
    textHex: '#ffffff',
    tailwindBg: 'bg-[#4caf50]',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'dapur',
  },
  'BLENDER': {
    id: 'blender',
    name: 'BLENDER',
    bgHex: '#2e7d32', // Forest Dark Green
    textHex: '#ffffff',
    tailwindBg: 'bg-[#2e7d32]',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'dapur',
  },
  'CHOPPER': {
    id: 'chopper',
    name: 'CHOPPER',
    bgHex: '#2e7d32', // Forest Dark Green
    textHex: '#ffffff',
    tailwindBg: 'bg-[#2e7d32]',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'dapur',
  },
  'SETRIKA': {
    id: 'setrika',
    name: 'SETRIKA',
    bgHex: '#33691e', // Dark Olive Green
    textHex: '#ffffff',
    tailwindBg: 'bg-[#33691e]',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'dapur',
  },
  'KIPAS': {
    id: 'kipas',
    name: 'KIPAS',
    bgHex: '#64b5f6', // Light Cerulean Blue
    textHex: '#0d47a1',
    tailwindBg: 'bg-[#64b5f6]',
    tailwindText: 'text-[#0d47a1] font-bold',
    categoryGroup: 'dapur',
  },
  'OVEN': {
    id: 'oven',
    name: 'OVEN',
    bgHex: '#ffe0b2', // Light Biscuit Warm Cream
    textHex: '#bf360c',
    tailwindBg: 'bg-[#ffe0b2]',
    tailwindText: 'text-[#bf360c] font-bold',
    categoryGroup: 'dapur',
  },
  'AIR FRYER': {
    id: 'air_fryer',
    name: 'AIR FRYER',
    bgHex: '#80cbc4', // Soft Turquoise
    textHex: '#004d40',
    tailwindBg: 'bg-[#80cbc4]',
    tailwindText: 'text-[#004d40] font-bold',
    categoryGroup: 'dapur',
  },
  'AIRFRYER': {
    id: 'airfryer',
    name: 'AIRFRYER',
    bgHex: '#80cbc4',
    textHex: '#004d40',
    tailwindBg: 'bg-[#80cbc4]',
    tailwindText: 'text-[#004d40] font-bold',
    categoryGroup: 'dapur',
  },
  'DISPENSER': {
    id: 'dispenser',
    name: 'DISPENSER',
    bgHex: '#ce93d8', // Light Lilac Purple
    textHex: '#4a148c',
    tailwindBg: 'bg-[#ce93d8]',
    tailwindText: 'text-[#4a148c] font-bold',
    categoryGroup: 'dapur',
  },
  'PRINTER': {
    id: 'printer',
    name: 'PRINTER',
    bgHex: '#d7ccc8', // Sand / Stone
    textHex: '#3e2723',
    tailwindBg: 'bg-[#d7ccc8]',
    tailwindText: 'text-[#3e2723] font-bold',
    categoryGroup: 'gadget',
  },
  'SPEAKER': {
    id: 'speaker',
    name: 'SPEAKER',
    bgHex: '#cfd8dc', // Light Slate / Cool Gray
    textHex: '#263238',
    tailwindBg: 'bg-[#cfd8dc]',
    tailwindText: 'text-[#263238] font-bold',
    categoryGroup: 'gadget',
  },
  'AKSESORIS': {
    id: 'aksesoris',
    name: 'AKSESORIS',
    bgHex: '#e1bee7', // Light Purple
    textHex: '#4a148c',
    tailwindBg: 'bg-[#e1bee7]',
    tailwindText: 'text-[#4a148c] font-bold',
    categoryGroup: 'gadget',
  },
  'WATER HEATER': {
    id: 'water_heater',
    name: 'WATER HEATER',
    bgHex: '#ff8a65', // Sunset Coral
    textHex: '#bf360c',
    tailwindBg: 'bg-[#ff8a65]',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'dapur',
  },
  'FREEZER BOX': {
    id: 'freezer_box',
    name: 'FREEZER BOX',
    bgHex: '#4a148c', // Deep Dark Purple Maroon
    textHex: '#ffffff',
    tailwindBg: 'bg-[#4a148c]',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'pendingin',
  },
  'FREEZER': {
    id: 'freezer',
    name: 'FREEZER',
    bgHex: '#4a148c',
    textHex: '#ffffff',
    tailwindBg: 'bg-[#4a148c]',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'pendingin',
  },
  // PROMO CATEGORIES
  'B2 PROMO KREDIT': {
    id: 'b2_promo_kredit',
    name: 'B2 PROMO KREDIT',
    bgHex: '#1565c0', // Royal Cobalt Blue
    textHex: '#ffffff',
    tailwindBg: 'bg-[#1565c0]',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'promo',
  },
  'B2 KREDIT 0%': {
    id: 'b2_kredit_0',
    name: 'B2 KREDIT 0%',
    bgHex: '#1565c0',
    textHex: '#ffffff',
    tailwindBg: 'bg-[#1565c0]',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'promo',
  },
  'B2 PROMO SHARP': {
    id: 'b2_promo_sharp',
    name: 'B2 PROMO SHARP',
    bgHex: '#1565c0',
    textHex: '#ffffff',
    tailwindBg: 'bg-[#1565c0]',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'promo',
  },
  'B2 TESTIMONI PROMO SHARP': {
    id: 'b2_testimoni_sharp',
    name: 'B2 TESTIMONI PROMO SHARP',
    bgHex: '#1565c0',
    textHex: '#ffffff',
    tailwindBg: 'bg-[#1565c0]',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'promo',
  },
  'B2 PROMO HARP': {
    id: 'b2_promo_harp',
    name: 'B2 PROMO HARP',
    bgHex: '#1565c0',
    textHex: '#ffffff',
    tailwindBg: 'bg-[#1565c0]',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'promo',
  },
  'B2 SPAYLATER': {
    id: 'b2_spaylater',
    name: 'B2 SPAYLATER',
    bgHex: '#1565c0',
    textHex: '#ffffff',
    tailwindBg: 'bg-[#1565c0]',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'promo',
  },
  'B2 BUY ONE GET ONE': {
    id: 'b2_buy_one',
    name: 'B2 BUY ONE GET ONE',
    bgHex: '#1565c0',
    textHex: '#ffffff',
    tailwindBg: 'bg-[#1565c0]',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'promo',
  },
  'B2 TESTIMONI': {
    id: 'b2_testimoni',
    name: 'B2 TESTIMONI',
    bgHex: '#1565c0',
    textHex: '#ffffff',
    tailwindBg: 'bg-[#1565c0]',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'promo',
  },
  'B2 POP PROMO': {
    id: 'b2_pop_promo',
    name: 'B2 POP PROMO',
    bgHex: '#1565c0',
    textHex: '#ffffff',
    tailwindBg: 'bg-[#1565c0]',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'promo',
  },
  'B2 PROMO KARTINI': {
    id: 'b2_promo_kartini',
    name: 'B2 PROMO KARTINI',
    bgHex: '#1565c0',
    textHex: '#ffffff',
    tailwindBg: 'bg-[#1565c0]',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'promo',
  },
  'B2 PROMO': {
    id: 'b2_promo',
    name: 'B2 PROMO',
    bgHex: '#1565c0',
    textHex: '#ffffff',
    tailwindBg: 'bg-[#1565c0]',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'promo',
  },
  'PRE ORDER SAMSUNG': {
    id: 'pre_order_samsung',
    name: 'PRE ORDER SAMSUNG',
    bgHex: '#ffcc80',
    textHex: '#e65100',
    tailwindBg: 'bg-[#ffcc80]',
    tailwindText: 'text-[#e65100] font-bold',
    categoryGroup: 'promo',
  },
  // SPECIAL OPERATIONAL / STORE STATUS
  'LIBUR': {
    id: 'libur',
    name: 'LIBUR',
    bgHex: '#d50000', // Signal Bright Red
    textHex: '#ffffff',
    tailwindBg: 'bg-[#d50000]',
    tailwindText: 'text-white font-black',
    categoryGroup: 'status',
  },
  'CLOSE STORE': {
    id: 'close_store',
    name: 'CLOSE STORE',
    bgHex: '#d50000',
    textHex: '#ffffff',
    tailwindBg: 'bg-[#d50000]',
    tailwindText: 'text-white font-black',
    categoryGroup: 'status',
  },
  'OPEN STORE': {
    id: 'open_store',
    name: 'OPEN STORE',
    bgHex: '#ffd600', // Bright Yellow
    textHex: '#000000',
    tailwindBg: 'bg-[#ffd600]',
    tailwindText: 'text-slate-950 font-black',
    categoryGroup: 'status',
  },
  'KUNJUNGAN': {
    id: 'kunjungan',
    name: 'KUNJUNGAN',
    bgHex: '#e0e0e0', // Neutral Light Gray
    textHex: '#212121',
    tailwindBg: 'bg-[#e0e0e0]',
    tailwindText: 'text-slate-800 font-bold',
    categoryGroup: 'status',
  },
};

// Fallback style for unknown items
export const DEFAULT_PRODUCT_STYLE: ProductColorStyle = {
  id: 'default',
  name: 'ELEKTRONIK',
  bgHex: '#0f766e',
  textHex: '#ffffff',
  tailwindBg: 'bg-teal-700',
  tailwindText: 'text-white font-bold',
  categoryGroup: 'dapur',
};

// Preset lists for convenient UI selection
export const PROMO_PRESETS: string[] = [
  'B2 PROMO KREDIT',
  'B2 KREDIT 0%',
  'B2 SPAYLATER',
  'B2 BUY ONE GET ONE',
  'B2 TESTIMONI',
  'B2 POP PROMO',
  'B2 PROMO KARTINI',
  'PROMO GAJIAN',
  'PROMO MERDEKA',
  'PROMO CASHBACK',
  'PROMO DISKON 50%',
  'PROMO TUKAR TAMBAH',
  'PRE ORDER',
  'CLEARANCE SALE',
  'FLASH SALE',
];

export const ELECTRONIC_GROUPS = {
  gadget: {
    title: '📱 Gadget & Aksesoris',
    items: ['HP', 'LAPTOP', 'PRINTER', 'SPEAKER', 'AKSESORIS'],
  },
  pendingin: {
    title: '❄️ Pendingin & Produk Besar',
    items: ['KULKAS', 'MESIN CUCI', 'AC', 'SHOWCASE', 'FREEZER BOX'],
  },
  dapur: {
    title: '🍳 Dapur & Rumah Tangga',
    items: [
      'SEPEDA LISTRIK',
      'MAGIC COM',
      'KOMPOR',
      'DISPENSER',
      'BLENDER',
      'CHOPPER',
      'OVEN',
      'SETRIKA',
      'KIPAS',
      'AIR FRYER',
      'WATER HEATER',
    ],
  },
  entertainment: {
    title: '📺 Entertainment',
    items: ['TV'],
  },
  promo: {
    title: '🏷️ Promo & Banner',
    items: PROMO_PRESETS,
  },
};

/**
 * Normalizes any category / task name and matches to its designated color palette.
 * Supports:
 * - Exact category matches
 * - Dynamic new promos (e.g., "PROMO GAJIAN", "B2 PROMO MERDEKA", "CASHBACK 100RB") -> Royal Cobalt Blue
 * - Extended home appliances and accessories
 * - Dynamic custom categories (always preserves name and gives crisp badge styling)
 */
export function getProductColorStyle(rawName: string): ProductColorStyle {
  if (!rawName) return DEFAULT_PRODUCT_STYLE;

  let clean = rawName.trim().toUpperCase();

  // Strip "DESAIN " prefix if present
  if (clean.startsWith('DESAIN ')) {
    clean = clean.replace(/^DESAIN\s+/, '').trim();
  }

  // Exact Match in palette
  if (PRODUCT_COLOR_PALETTE[clean]) {
    return PRODUCT_COLOR_PALETTE[clean];
  }

  // 1. Promo & Banner detection (including new / custom promos)
  const isPromoKeyword =
    clean.includes('PROMO') ||
    clean.includes('KREDIT') ||
    clean.includes('DISKON') ||
    clean.includes('DISCOUNT') ||
    clean.includes('CASHBACK') ||
    clean.includes('SPAYLATER') ||
    clean.includes('TESTIMONI') ||
    clean.includes('VOUCHER') ||
    clean.includes('PRE ORDER') ||
    clean.includes('BUY ONE') ||
    clean.includes('GAJIAN') ||
    clean.includes('PAYDAY') ||
    clean.includes('MERDEKA') ||
    clean.includes('LEBARAN') ||
    clean.includes('NATAL') ||
    clean.includes('IMLEK') ||
    clean.includes('HARBOLNAS') ||
    clean.includes('FLASH SALE') ||
    clean.includes('CLEARANCE') ||
    clean.includes('BUNDLING') ||
    clean.includes('POTONGAN') ||
    clean.includes('HADIAH') ||
    clean.startsWith('B2');

  if (isPromoKeyword) {
    return {
      id: `promo_${clean.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name: clean,
      bgHex: '#1565c0', // Royal Cobalt Blue matching Google Sheets promo cells
      textHex: '#ffffff',
      tailwindBg: 'bg-[#1565c0]',
      tailwindText: 'text-white font-bold',
      categoryGroup: 'promo',
    };
  }

  // 2. Partial Match Rules for Electronic Products
  if (clean.includes('SEPEDA') || clean.includes('GODA') || clean.includes('UWINFLY') || clean.includes('EXOTIC') || clean.includes('PACIFIC')) {
    return PRODUCT_COLOR_PALETTE['SEPEDA LISTRIK'];
  }
  if (clean.includes('LAPTOP') || clean.includes('NOTEBOOK') || clean.includes('MACBOOK') || clean.includes('PC')) {
    return PRODUCT_COLOR_PALETTE['LAPTOP'];
  }
  if (clean.includes('SHOWCASE') || clean.includes('CHILLER')) {
    return PRODUCT_COLOR_PALETTE['SHOWCASE'];
  }
  if (clean.includes('FREEZER')) {
    return PRODUCT_COLOR_PALETTE['FREEZER BOX'];
  }
  if (clean.includes('KULKAS') || clean.includes('LEMARI ES')) {
    return PRODUCT_COLOR_PALETTE['KULKAS'];
  }
  if (clean.includes('MESIN CUCI') || clean.includes('WASHER') || clean.includes('DRYER') || (clean.includes('CUCI') && !clean.includes('PIRING'))) {
    return PRODUCT_COLOR_PALETTE['MESIN CUCI'];
  }
  if (clean.includes('MAGIC COM') || clean.includes('RICE COOKER') || clean.includes('MAGIC JAR') || clean.includes('PENANAK NASI')) {
    return PRODUCT_COLOR_PALETTE['MAGIC COM'];
  }
  if (clean.includes('KOMPOR') || clean.includes('COMPOR') || clean.includes('INDUCTION') || clean.includes('KOMPOR LISTRIK')) {
    return PRODUCT_COLOR_PALETTE['KOMPOR'];
  }
  if (clean.includes('BLENDER') || clean.includes('JUICER') || clean.includes('JUISER')) {
    return PRODUCT_COLOR_PALETTE['BLENDER'];
  }
  if (clean.includes('CHOPPER') || clean.includes('FOOD PROCESSOR') || clean.includes('GRINDER')) {
    return PRODUCT_COLOR_PALETTE['CHOPPER'];
  }
  if (clean.includes('SETRIKA') || clean.includes('STEAMER') || clean.includes('GOSOKAN')) {
    return PRODUCT_COLOR_PALETTE['SETRIKA'];
  }
  if (clean.includes('KIPAS') || clean.includes('FAN')) {
    return PRODUCT_COLOR_PALETTE['KIPAS'];
  }
  if (clean.includes('OVEN') || clean.includes('MICROWAVE') || clean.includes('TOASTER') || clean.includes('PANGGANGAN')) {
    return PRODUCT_COLOR_PALETTE['OVEN'];
  }
  if (clean.includes('AIR FRYER') || clean.includes('AIRFRYER') || clean.includes('AIR FYER')) {
    return PRODUCT_COLOR_PALETTE['AIR FRYER'];
  }
  if (clean.includes('WATER HEATER') || clean.includes('PEMANAS AIR')) {
    return PRODUCT_COLOR_PALETTE['WATER HEATER'];
  }
  if (clean.includes('DISPENSER')) {
    return PRODUCT_COLOR_PALETTE['DISPENSER'];
  }
  if (clean.includes('PRINTER') || clean.includes('SCANNER')) {
    return PRODUCT_COLOR_PALETTE['PRINTER'];
  }
  if (clean.includes('SPEAKER') || clean.includes('AUDIO') || clean.includes('SOUNDBAR') || clean.includes('HEADSET') || clean.includes('EARPHONE') || clean.includes('TWS')) {
    return PRODUCT_COLOR_PALETTE['SPEAKER'];
  }
  if (clean.includes('AKSES') || clean.includes('POWERBANK') || clean.includes('SMARTWATCH') || clean.includes('CHARGER') || clean.includes('CAS') || clean.includes('KABEL')) {
    return PRODUCT_COLOR_PALETTE['AKSESORIS'];
  }
  if (clean.includes('LIBUR') || clean.includes('CLOSE')) {
    return PRODUCT_COLOR_PALETTE['LIBUR'];
  }
  if (clean.includes('OPEN')) {
    return PRODUCT_COLOR_PALETTE['OPEN STORE'];
  }
  if (clean.includes('KUNJUNGAN')) {
    return PRODUCT_COLOR_PALETTE['KUNJUNGAN'];
  }
  if (clean.includes('AC') || clean.includes('AIR CONDITIONER') || clean.includes('AIR COOLER')) {
    return PRODUCT_COLOR_PALETTE['AC'];
  }
  if (clean.includes('TV') || clean.includes('TELEVISI') || clean.includes('SMART TV') || clean.includes('ANDROID TV') || clean.includes('LED TV')) {
    return PRODUCT_COLOR_PALETTE['TV'];
  }
  if (clean.includes('HP') || clean.includes('HANDPHONE') || clean.includes('SMARTPHONE') || clean.includes('TABLET') || clean.includes('IPAD')) {
    return PRODUCT_COLOR_PALETTE['HP'];
  }

  // Dynamic clean badge for any user-defined product
  return {
    id: `custom_${clean.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    name: clean,
    bgHex: '#00897b', // Elegant Emerald Teal
    textHex: '#ffffff',
    tailwindBg: 'bg-teal-600',
    tailwindText: 'text-white font-bold',
    categoryGroup: 'dapur',
  };
}

export const ALL_CLEAN_CATEGORIES: string[] = Object.keys(PRODUCT_COLOR_PALETTE).filter(
  (c) => !['LIBUR', 'CLOSE STORE', 'OPEN STORE', 'KUNJUNGAN'].includes(c)
);
