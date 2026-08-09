// Master Data & Cleaning Engine for Daily Electronics Social Media Design Schedule
// Strict Rule: NO BRAND / MERK / MODEL / SIZE. Only generic electronics categories.

export interface CategoryGroup {
  id: string;
  name: string;
  badgeColor: string;
  items: string[];
}

export const ALLOWED_CATEGORIES: CategoryGroup[] = [
  {
    id: 'gadget',
    name: 'Gadget & Aksesoris',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    items: ['HP', 'LAPTOP', 'AKSESORIS', 'SPEAKER', 'PRINTER'],
  },
  {
    id: 'pendingin',
    name: 'Pendingin & Elektronik Besar',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    items: ['KULKAS', 'MESIN CUCI', 'AC', 'SHOWCASE', 'FREEZER', 'FREEZER BOX', 'WATER HEATER'],
  },
  {
    id: 'dapur',
    name: 'Dapur & Elektronik Kecil / Lokal',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
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
    ],
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Audio-Visual',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    items: ['TV'],
  },
  {
    id: 'promo',
    name: 'Banner & Promo (B2)',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    items: [
      'B2 PROMO KREDIT',
      'B2 KREDIT 0%',
      'B2 BUY ONE GET ONE',
      'B2 TESTIMONI',
      'B2 PROMO',
      'B2 POP PROMO',
      'B2 PROMO KARTINI',
      'B2 SPAYLATER',
    ],
  },
];

// Flat list of all authorized generic categories
export const ALL_CLEAN_CATEGORIES: string[] = ALLOWED_CATEGORIES.flatMap((c) => c.items);

// Banned brand keywords that must be stripped
export const BANNED_BRANDS = [
  'samsung',
  'sharp',
  'polytron',
  'vivo',
  'realme',
  'infinix',
  'oppo',
  'xiaomi',
  'redmi',
  'aqua',
  'daikin',
  'panasonic',
  'lg',
  'tcl',
  'modena',
  'maspion',
  'sanken',
  'rinnai',
  'miyako',
  'kirin',
  'philips',
  'yongma',
  'cosmos',
  'lenovo',
  'asus',
  'acer',
  'hp laptop',
  'goda lemon',
  'goda mecha',
  'goda',
  'robot',
  'vivan',
  'uwinfly',
  'exotic',
  'pacific',
  'gea',
  'speed',
];

/**
 * Intelligent Brand Cleaner Function:
 * Strips brands, sizes, models, and returns clean generic category or promo name.
 * Respects strict rule: NO BRANDS (Samsung, Sharp, Polytron, etc.)
 */
export function sanitizeToGenericCategory(raw: string): string {
  if (!raw) return 'HP';
  let clean = raw.trim().toUpperCase();

  // Strip "DESAIN " prefix if present
  if (clean.startsWith('DESAIN ')) {
    clean = clean.replace(/^DESAIN\s+/, '').trim();
  }

  // Strip brand keywords
  for (const b of BANNED_BRANDS) {
    const regex = new RegExp(`\\b${b.toUpperCase()}\\b`, 'gi');
    clean = clean.replace(regex, '').trim();
  }
  // Strip common size/model keywords e.g. "50 INCH", "2 PINTU", "1/2 PK", "1 PK", "128GB", "8GB"
  clean = clean.replace(/\b\d+\s*(INCH|INC|PK|PINTU|GB|RAM|LITER|KG|WATT)\b/gi, '').trim();
  clean = clean.replace(/\s{2,}/g, ' ');

  if (!clean) return 'HP';

  // 1. Promos and Special Campaigns
  const isPromo =
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
    clean.startsWith('B2');

  if (isPromo) {
    if (clean.includes('KREDIT 0%') || clean.includes('0%')) return 'B2 KREDIT 0%';
    if (clean.includes('PROMO KREDIT') || clean.includes('KREDIT')) return 'B2 PROMO KREDIT';
    if (clean.includes('SPAYLATER')) return 'B2 SPAYLATER';
    if (clean.includes('BUY ONE') || clean.includes('BUY 1')) return 'B2 BUY ONE GET ONE';
    if (clean.includes('TESTIMONI')) return 'B2 TESTIMONI';
    if (clean.includes('KARTINI')) return 'B2 PROMO KARTINI';
    if (clean.includes('POP PROMO')) return 'B2 POP PROMO';
    if (clean.startsWith('B2')) return clean;
    // For custom promo e.g. "PROMO MERDEKA", "PROMO GAJIAN", "PROMO CASHBACK"
    return clean.startsWith('B2 ') ? clean : `B2 ${clean}`;
  }

  // 2. Specific appliance detection
  if (clean.includes('SEPEDA') || clean.includes('GODA') || clean.includes('UWINFLY') || clean.includes('EXOTIC') || clean.includes('PACIFIC')) return 'SEPEDA LISTRIK';
  if (clean.includes('RICE COOKER') || clean.includes('MAGIC COM') || clean.includes('MAGIC JAR') || clean.includes('PENANAK NASI')) return 'MAGIC COM';
  if (clean.includes('KOMPOR') || clean.includes('COMPOR') || clean.includes('INDUCTION')) return 'KOMPOR';
  if (clean.includes('DISPENSER')) return 'DISPENSER';
  if (clean.includes('BLENDER') || clean.includes('JUICER')) return 'BLENDER';
  if (clean.includes('CHOPPER') || clean.includes('FOOD PROCESSOR') || clean.includes('GRINDER')) return 'CHOPPER';
  if (clean.includes('OVEN') || clean.includes('MICROWAVE') || clean.includes('TOASTER')) return 'OVEN';
  if (clean.includes('SETRIKA') || clean.includes('STEAMER') || clean.includes('GOSOKAN')) return 'SETRIKA';
  if (clean.includes('KIPAS') || clean.includes('FAN')) return 'KIPAS';
  if (clean.includes('AIR FRYER') || clean.includes('AIRFRYER') || clean.includes('AIR FYER')) return 'AIR FRYER';
  if (clean.includes('WATER HEATER') || clean.includes('PEMANAS AIR')) return 'WATER HEATER';
  if (clean.includes('SHOWCASE') || clean.includes('CHILLER')) return 'SHOWCASE';
  if (clean.includes('FREEZER BOX')) return 'FREEZER BOX';
  if (clean.includes('FREEZER')) return 'FREEZER';
  if (clean.includes('MESIN CUCI') || clean.includes('WASHER') || clean.includes('DRYER') || (clean.includes('CUCI') && !clean.includes('PIRING'))) return 'MESIN CUCI';
  if (clean.includes('KULKAS') || clean.includes('LEMARI ES')) return 'KULKAS';
  if ((clean.includes('AC') || clean.includes('AIR CONDITIONER') || clean.includes('AIR COOLER')) && !clean.includes('AKSES')) return 'AC';
  if (clean.includes('GOOGLE TV') || clean.includes('TV') || clean.includes('TELEVISI') || clean.includes('SMART TV') || clean.includes('ANDROID TV') || clean.includes('LED TV')) return 'TV';
  if (clean.includes('LAPTOP') || clean.includes('NOTEBOOK') || clean.includes('MACBOOK') || clean.includes('PC')) return 'LAPTOP';
  if (clean.includes('PRINTER') || clean.includes('SCANNER')) return 'PRINTER';
  if (clean.includes('SPEAKER') || clean.includes('AUDIO') || clean.includes('SOUNDBAR') || clean.includes('HEADSET') || clean.includes('EARPHONE') || clean.includes('TWS')) return 'SPEAKER';
  if (clean.includes('AKSES') || clean.includes('POWERBANK') || clean.includes('SMARTWATCH') || clean.includes('CHARGER') || clean.includes('CAS') || clean.includes('KABEL')) return 'AKSESORIS';
  if (clean.includes('HP') || clean.includes('HANDPHONE') || clean.includes('SMARTPHONE') || clean.includes('TABLET') || clean.includes('IPAD')) return 'HP';

  // If user typed a custom electronics product, return clean formatted
  return clean || 'HP';
}

/**
 * Intelligent detector for user inputs.
 * Distinguishes between:
 * 1. Design Slots (Electronics products, promos, tasks with "DESAIN") -> should get color badge and sync to spreadsheet
 * 2. Section Headers (e.g. "DESAIN ELEKTRONIK/HOME APPIANCE") -> normal text separator
 * 3. Plain operational tasks (e.g. "CEK LIKE SORE", "POST STORY IG") -> normal task
 */
export function detectTaskType(input: string): {
  isDesignSlot: boolean;
  category?: string;
  cleanText: string;
  isPromo: boolean;
} {
  if (!input || !input.trim()) {
    return { isDesignSlot: false, cleanText: '', isPromo: false };
  }

  const rawUpper = input.trim().toUpperCase();

  // 1. Check if it's the standard WhatsApp section header divider
  if (
    rawUpper.includes('DESAIN ELEKTRONIK/HOME APPIANCE') ||
    rawUpper.includes('DESAIN ELEKTRONIK / HOME APPIANCE') ||
    rawUpper.includes('DESAIN ELEKTRONIK/HOME APPLIANCE') ||
    rawUpper.includes('DESAIN ELEKTRONIK / HOME APPLIANCE')
  ) {
    return {
      isDesignSlot: false,
      cleanText: 'DESAIN ELEKTRONIK/HOME APPIANCE',
      isPromo: false,
    };
  }

  // 2. Check for explicit "DESAIN" prefix or keyword
  const hasDesainKeyword = rawUpper.startsWith('DESAIN ') || rawUpper === 'DESAIN' || (rawUpper.includes('DESAIN') && !rawUpper.includes('ELEKTRONIK/HOME'));

  // 3. Check for promo keywords
  const isPromoKeyword =
    rawUpper.includes('PROMO') ||
    rawUpper.includes('KREDIT') ||
    rawUpper.includes('DISKON') ||
    rawUpper.includes('DISCOUNT') ||
    rawUpper.includes('CASHBACK') ||
    rawUpper.includes('SPAYLATER') ||
    rawUpper.includes('TESTIMONI') ||
    rawUpper.includes('VOUCHER') ||
    rawUpper.includes('PRE ORDER') ||
    rawUpper.includes('BUY ONE') ||
    rawUpper.includes('GAJIAN') ||
    rawUpper.includes('PAYDAY') ||
    rawUpper.includes('MERDEKA') ||
    rawUpper.includes('LEBARAN') ||
    rawUpper.includes('NATAL') ||
    rawUpper.includes('IMLEK') ||
    rawUpper.includes('HARBOLNAS') ||
    rawUpper.includes('FLASH SALE') ||
    rawUpper.includes('CLEARANCE') ||
    rawUpper.includes('BUNDLING') ||
    rawUpper.startsWith('B2');

  // 4. Check for electronics keywords
  const isElectronicKeyword =
    rawUpper.includes('TV') ||
    rawUpper.includes('KULKAS') ||
    rawUpper.includes('MESIN CUCI') ||
    rawUpper.includes('AC') ||
    rawUpper.includes('SEPEDA LISTRIK') ||
    rawUpper.includes('SEPEDA') ||
    rawUpper.includes('LAPTOP') ||
    rawUpper.includes('HP') ||
    rawUpper.includes('HANDPHONE') ||
    rawUpper.includes('SMARTPHONE') ||
    rawUpper.includes('SPEAKER') ||
    rawUpper.includes('PRINTER') ||
    rawUpper.includes('KOMPOR') ||
    rawUpper.includes('MAGIC COM') ||
    rawUpper.includes('RICE COOKER') ||
    rawUpper.includes('DISPENSER') ||
    rawUpper.includes('BLENDER') ||
    rawUpper.includes('CHOPPER') ||
    rawUpper.includes('OVEN') ||
    rawUpper.includes('SETRIKA') ||
    rawUpper.includes('KIPAS') ||
    rawUpper.includes('AIR FRYER') ||
    rawUpper.includes('AIRFRYER') ||
    rawUpper.includes('SHOWCASE') ||
    rawUpper.includes('FREEZER') ||
    rawUpper.includes('WATER HEATER') ||
    rawUpper.includes('AKSESORIS') ||
    rawUpper.includes('POWERBANK') ||
    rawUpper.includes('SMARTWATCH') ||
    rawUpper.includes('HEADSET') ||
    rawUpper.includes('SOUNDBAR');

  // If it has DESAIN keyword, is a promo, or is an electronic product:
  if (hasDesainKeyword || isPromoKeyword || isElectronicKeyword) {
    let rawCategory = rawUpper;
    if (rawCategory.startsWith('DESAIN ')) {
      rawCategory = rawCategory.replace(/^DESAIN\s+/, '').trim();
    }

    const sanitizedCategory = sanitizeToGenericCategory(rawCategory);
    const formattedTaskText = formatToDesignTaskText(sanitizedCategory);

    return {
      isDesignSlot: true,
      category: sanitizedCategory,
      cleanText: formattedTaskText,
      isPromo: isPromoKeyword,
    };
  }

  // Otherwise, it's a standard operational task
  return {
    isDesignSlot: false,
    cleanText: rawUpper,
    isPromo: false,
  };
}

/**
 * Master Queue of balanced daily sets (derived directly from real store design queues).
 * Every day is guaranteed strictly generic, brand-free, and has 3 to 4 varied categories.
 */
export const MASTER_SCHEDULE_QUEUE: string[][] = [
  // Day 1 (Senin)
  ['TV', 'SEPEDA LISTRIK', 'AC', 'KULKAS'],
  // Day 2 (Selasa)
  ['MAGIC COM', 'SHOWCASE', 'MESIN CUCI', 'HP'],
  // Day 3 (Rabu)
  ['B2 SPAYLATER', 'HP', 'TV', 'LAPTOP'],
  // Day 4 (Kamis)
  ['KULKAS', 'SEPEDA LISTRIK', 'TV', 'AC'],
  // Day 5 (Jumat)
  ['MESIN CUCI', 'MAGIC COM', 'SHOWCASE', 'OVEN'],
  // Day 6 (Sabtu)
  ['HP', 'MESIN CUCI', 'WATER HEATER', 'LAPTOP'],
  // Day 7 (Minggu - Guaranteed B2 Promo Kredit)
  ['B2 PROMO KREDIT', 'KULKAS', 'SEPEDA LISTRIK', 'TV'],
  // Day 8 (Senin)
  ['B2 KREDIT 0%', 'LAPTOP', 'MESIN CUCI', 'HP'],
  // Day 9 (Selasa)
  ['MAGIC COM', 'SHOWCASE', 'KOMPOR', 'DISPENSER'],
  // Day 10 (Rabu)
  ['AC', 'KULKAS', 'TV', 'OVEN'],
  // Day 11 (Kamis)
  ['B2 KREDIT 0%', 'LAPTOP', 'MESIN CUCI', 'SEPEDA LISTRIK'],
  // Day 12 (Jumat)
  ['DISPENSER', 'KOMPOR', 'MAGIC COM', 'AC'],
  // Day 13 (Sabtu)
  ['HP', 'MESIN CUCI', 'SPEAKER', 'AIR FRYER'],
  // Day 14 (Minggu - Guaranteed B2 Promo Kredit)
  ['B2 PROMO KREDIT', 'SEPEDA LISTRIK', 'TV', 'AKSESORIS'],
  // Day 15 (Senin)
  ['B2 KREDIT 0%', 'LAPTOP', 'MESIN CUCI', 'HP'],
  // Day 16 (Selasa)
  ['SHOWCASE', 'KOMPOR', 'SEPEDA LISTRIK', 'AC'],
  // Day 17 (Rabu)
  ['TV', 'KULKAS', 'AKSESORIS', 'MESIN CUCI'],
  // Day 18 (Kamis)
  ['LAPTOP', 'SEPEDA LISTRIK', 'B2 BUY ONE GET ONE', 'MAGIC COM'],
  // Day 19 (Jumat)
  ['HP', 'TV', 'KULKAS', 'MESIN CUCI'],
  // Day 20 (Sabtu)
  ['SEPEDA LISTRIK', 'KULKAS', 'AKSESORIS', 'TV'],
  // Day 21 (Minggu - Guaranteed B2 Promo Kredit)
  ['B2 PROMO KREDIT', 'LAPTOP', 'SEPEDA LISTRIK', 'AIR FRYER'],
  // Day 22 (Senin)
  ['HP', 'FREEZER', 'OVEN', 'AC'],
  // Day 23 (Selasa)
  ['DISPENSER', 'TV', 'KULKAS', 'MAGIC COM'],
  // Day 24 (Rabu)
  ['LAPTOP', 'MESIN CUCI', 'SEPEDA LISTRIK', 'MAGIC COM'],
  // Day 25 (Kamis)
  ['HP', 'AC', 'OVEN', 'B2 PROMO'],
  // Day 26 (Jumat)
  ['SHOWCASE', 'MAGIC COM', 'LAPTOP', 'KIPAS'],
  // Day 27 (Sabtu)
  ['OVEN', 'BLENDER', 'KIPAS', 'SETRIKA'],
  // Day 28 (Minggu - Guaranteed B2 Promo Kredit)
  ['B2 PROMO KREDIT', 'SEPEDA LISTRIK', 'KULKAS', 'TV'],
];

export interface DesignHistoryRecord {
  id: string;
  timestamp: string; // ISO string
  dateLabel: string; // e.g. "Sabtu, 08/08/2026"
  dayOfWeek: string; // e.g. "Sabtu"
  items: string[];
  wasShifted: boolean;
  skippedDays: number;
  statusText: string;
  source: 'auto-generate' | 'reroll' | 'manual';
}

/**
 * Format Indonesian Day and Date String
 * Returns e.g. "Sabtu, 08/08/2026"
 */
export function formatIndonesianDate(date: Date = new Date()): {
  fullLabel: string;
  dayName: string;
  dateStr: string;
  isoDate: string;
  isSunday: boolean;
} {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
  const dayIndex = date.getDay();
  const dayName = days[dayIndex];
  const isSunday = dayIndex === 0;

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  const dateStr = `${dd}/${mm}/${yyyy}`;
  const isoDate = `${yyyy}-${mm}-${dd}`;
  const fullLabel = `${dayName}, ${dateStr}`;

  return { fullLabel, dayName, dateStr, isoDate, isSunday };
}

export interface PlanningTaskItem {
  id: string;
  text: string;
  isDesignSlot?: boolean;
  isCompleted?: boolean;
  category?: string;
}

export const DEFAULT_PRE_TASKS: string[] = [
  'CEK LIKE SOSMED PAGI',
  'CEK DM IG, FB DAN TIKTOK MEGA KTSN',
  'POST FEED DI FB DAN IG',
  'POST STORY IG',
  'POST STORY FB',
  'POST TIKTOK KTSN',
  'DESAIN ELEKTRONIK/HOME APPIANCE',
];

export const DEFAULT_POST_TASKS: string[] = [
  'CEK LIKE SORE',
  'EDIT VIDIO',
  'CEK DM IG FB TIKTOK SORE HARI',
  'REPORT LINK POSTINGAN',
];

/**
 * Format category to design task name:
 * e.g. "B2 PROMO KREDIT" -> "DESAIN PROMO KREDIT"
 * e.g. "SEPEDA LISTRIK" -> "DESAIN SEPEDA LISTRIK"
 * e.g. "KULKAS" -> "DESAIN KULKAS"
 */
export function formatToDesignTaskText(categoryName: string): string {
  if (!categoryName) return 'DESAIN ELEKTRONIK';
  let clean = categoryName.trim().toUpperCase();
  // Strip "B2 " prefix if exists
  if (clean.startsWith('B2 ')) {
    clean = clean.replace(/^B2\s+/, '');
  }
  // Ensure "DESAIN " prefix
  if (!clean.startsWith('DESAIN')) {
    clean = `DESAIN ${clean}`;
  }
  return clean;
}

/**
 * Generates formatted Planning WhatsApp Text matching exact screenshots:
 * 
 * PLANNING AKTIFITAS HARIAN [NAME] [DD-MM-YYYY]
 * 
 * • CEK LIKE SOSMED PAGI
 * • CEK DM IG, FB DAN TIKTOK MEGA KTSN
 * • POST FEED DI FB DAN IG
 * • POST STORY IG
 * • POST STORY FB
 * • POST TIKTOK KTSN
 * • DESAIN ELEKTRONIK/HOME APPIANCE
 * • DESAIN PROMO KREDIT
 * • DESAIN SEPEDA LISTRIK
 * • DESAIN KULKAS
 * • CEK LIKE SORE
 * • EDIT VIDIO
 * • CEK DM IG FB TIKTOK SORE HARI
 * • REPORT LINK POSTINGAN
 */
export function buildPlanningWhatsAppMessage(
  employeeName: string,
  formattedDateHyphen: string, // e.g. "09-08-2026"
  tasks: PlanningTaskItem[],
  mode: 'plain' | 'checked' | 'dynamic' = 'dynamic'
): string {
  const header = `PLANNING AKTIFITAS HARIAN ${(employeeName || 'SAMSUL').trim().toUpperCase()} ${formattedDateHyphen}`;

  const taskLines = tasks.map((task) => {
    const cleanText = task.text.trim().toUpperCase();
    let suffix = '';
    if (mode === 'checked') {
      suffix = ' ✅';
    } else if (mode === 'dynamic' && task.isCompleted) {
      suffix = ' ✅';
    }
    return `• ${cleanText}${suffix}`;
  });

  return `${header}\n\n${taskLines.join('\n')}`;
}

/**
 * Format date to DD-MM-YYYY with hyphens (e.g. "09-08-2026")
 */
export function formatHyphenDate(date: Date = new Date()): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

