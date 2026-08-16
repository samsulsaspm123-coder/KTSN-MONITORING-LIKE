import { Employee, EmployeeCheckResult, DivisionSummary, LikersProcessResult } from '../types';

/**
 * Normalizes an Instagram username for consistent matching
 */
export function normalizeUsername(username: string): string {
  if (!username) return '';
  return username
    .trim()
    .toLowerCase()
    .replace(/^@+/, '') // remove leading @
    .replace(/[\s\r\n\t]+/g, '') // remove whitespace
    .replace(/[^\w._]/g, ''); // keep valid IG username characters (letters, numbers, periods, underscores)
}

/**
 * Parses raw text input into a set of unique Instagram usernames
 * Handles:
 * - Direct copy from Instagram Likers dialog (e.g. "username\nFull Name\nFollowing")
 * - Comma separated: "user1, user2, user3"
 * - Space / newline separated lists
 * - Pasted JSON array
 * - URLs (e.g. instagram.com/username)
 */
export function extractUsernamesFromRawText(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return [];

  const text = rawText.trim();
  const foundUsernames = new Set<string>();

  // If input looks like JSON
  if (text.startsWith('[') && text.endsWith(']')) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (typeof item === 'string') {
            const clean = normalizeUsername(item);
            if (clean) foundUsernames.add(clean);
          } else if (item && typeof item === 'object' && 'username' in item) {
            const clean = normalizeUsername(String((item as Record<string, unknown>).username));
            if (clean) foundUsernames.add(clean);
          }
        }
        if (foundUsernames.size > 0) {
          return Array.from(foundUsernames);
        }
      }
    } catch {
      // Continue to regex parsing if JSON parse fails
    }
  }

  // Common IG words to ignore when users paste entire UI blocks
  const ignoredWords = new Set([
    'follow', 'following', 'ikuti', 'mengikuti', 'hapus', 'remove',
    'verified', 'terverifikasi', 'likes', 'suka', 'search', 'cari',
    'instagram', 'loading', 'profile', 'profil', 'edit', 'bagikan', 'share',
    'mutual', 'suggested', 'disarankan', 'message', 'kirim', 'pesan',
    'http', 'https', 'www', 'com', 'undefined', 'null', 'true', 'false'
  ]);

  // Split by common delimiters: newlines, commas, semicolons, tabs, spaces
  const lines = text.split(/[\r\n,;\t]+/);

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Check if line contains URL like instagram.com/username
    const urlMatch = trimmedLine.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
    if (urlMatch && urlMatch[1]) {
      const u = normalizeUsername(urlMatch[1]);
      if (u && !ignoredWords.has(u)) {
        foundUsernames.add(u);
        continue;
      }
    }

    // Split words inside line if line contains space
    const tokens = trimmedLine.split(/\s+/);
    for (const token of tokens) {
      const clean = normalizeUsername(token);
      if (clean && clean.length >= 2 && !ignoredWords.has(clean)) {
        foundUsernames.add(clean);
      }
    }
  }

  return Array.from(foundUsernames);
}

/**
 * Formats a Date object to Indonesian DD/MM/YYYY format
 */
export function formatDateIndo(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Gets branch priority rank:
 * 1: NGK (Nganjuk)
 * 2: WRJ / WR (Warujayeng)
 * 3: KTSN / KTS (Kertosono)
 * 50: Other retail branches
 * 90: EXTERNAL / EKSTERNAL
 * 95: UMUM / PUSAT / HO / LAINNYA
 */
export function getBranchRank(divisionName: string): number {
  const d = (divisionName || '').toUpperCase().trim();
  
  // 1. NGK / Nganjuk
  if (d.includes('NGK') || d.includes('NGANJUK')) {
    return 1;
  }
  
  // 2. WRJ / Warujayeng / WR
  if (d.includes('WRJ') || d.includes('WARU') || /\bWR\b/.test(d) || d.endsWith(' WR') || d.includes(' WR ')) {
    return 2;
  }
  
  // 3. KTSN / Kertosono / KTS
  if (d.includes('KTSN') || d.includes('KERTOSONO') || /\bKTS\b/.test(d) || d.endsWith(' KTS') || d.includes(' KTS ')) {
    return 3;
  }

  // 4. External / Eksternal
  if (d.includes('EXTERNAL') || d.includes('EKSTERNAL')) {
    return 90;
  }

  // 5. Umum / Kantor Pusat / HO
  if (d.includes('UMUM') || d.includes('HO') || d.includes('PUSAT') || d.includes('MANAGEMENT')) {
    return 95;
  }

  return 50;
}

/**
 * Gets role/sub-category priority rank within branch:
 * 1: ADMIN, KASIR, OFFICE, KANTOR, ADM
 * 2: MS, FL, PROMOTOR, SALES, SPG, SPM
 * 3: G1 ELEKT / GRUP 1
 * 4: G2 ELEKT / GRUP 2
 * 5: G3 ELEKT / GRUP 3
 * 6: G4 ELEKT / GRUP 4
 * 7: G5 ELEKT / GRUP 5
 * 8: G6 ELEKT / GRUP 6
 * 10: ELEKT / ELEKTRONIK / ELECTRONIC (General)
 * 15: FURNITURE / MEBEL / MATRASS / SPRINGBED
 * 20: LOGISTIK / GUDANG / DRIVER / HELPER / PENGIRIMAN
 * 30: Others
 */
export function getRoleRank(divisionName: string): number {
  const d = (divisionName || '').toUpperCase().trim();

  // Admin & Management
  if (
    d.includes('ADMIN') ||
    d.includes('ADM') ||
    d.includes('KANTOR') ||
    d.includes('OFFICE') ||
    d.includes('HRD') ||
    d.includes('FINANCE') ||
    d.includes('KEUANGAN')
  ) {
    return 1;
  }

  // MS, FL, Promotor, Sales
  if (
    d.includes('MS') ||
    d.includes('FL') ||
    d.includes('PROMOTOR') ||
    d.includes('PROMOTER') ||
    d.includes('SPG') ||
    d.includes('SPM') ||
    d.includes('SALES')
  ) {
    return 2;
  }

  // G1 .. G6 Group Electronics
  if (/\bG1\b/.test(d) || d.includes('G 1') || d.includes('GRUP 1') || d.includes('GROUP 1')) return 3;
  if (/\bG2\b/.test(d) || d.includes('G 2') || d.includes('GRUP 2') || d.includes('GROUP 2')) return 4;
  if (/\bG3\b/.test(d) || d.includes('G 3') || d.includes('GRUP 3') || d.includes('GROUP 3')) return 5;
  if (/\bG4\b/.test(d) || d.includes('G 4') || d.includes('GRUP 4') || d.includes('GROUP 4')) return 6;
  if (/\bG5\b/.test(d) || d.includes('G 5') || d.includes('GRUP 5') || d.includes('GROUP 5')) return 7;
  if (/\bG6\b/.test(d) || d.includes('G 6') || d.includes('GRUP 6') || d.includes('GROUP 6')) return 8;

  // General Elektronik
  if (d.includes('ELEKT') || d.includes('ELECTRONIC') || d.includes('ELEKTRONIK')) {
    return 10;
  }

  // Furniture / Mebel
  if (d.includes('FURNITURE') || d.includes('MEBEL') || d.includes('MATRASS') || d.includes('SPRINGBED')) {
    return 15;
  }

  // Logistik / Pengiriman
  if (
    d.includes('LOGISTIK') ||
    d.includes('GUDANG') ||
    d.includes('DRIVER') ||
    d.includes('HELPER') ||
    d.includes('PENGIRIMAN') ||
    d.includes('EKSPEDISI')
  ) {
    return 20;
  }

  if (d.includes('KASIR')) {
    return 25;
  }

  return 30;
}

/**
 * Comparator to sort division names:
 * 1. Branch priority: NGK (1) -> WRJ (2) -> KTSN (3) -> Other branches (50) -> EXTERNAL (90) -> UMUM (95)
 * 2. Role priority: ADMIN (1) -> MS/FL/PROMOTOR (2) -> G1 (3) -> G2 (4) -> G3 (5) -> G4 (6) -> ELEKT (10) -> ...
 * 3. Alphabetical tie-breaker
 */
export function compareDivisions(a: string, b: string): number {
  const branchA = getBranchRank(a);
  const branchB = getBranchRank(b);
  if (branchA !== branchB) {
    return branchA - branchB;
  }

  const roleA = getRoleRank(a);
  const roleB = getRoleRank(b);
  if (roleA !== roleB) {
    return roleA - roleB;
  }

  return a.localeCompare(b);
}

/**
 * Main processing engine:
 * Compares likers against employees, applies status exemption rules,
 * groups penalized employees by Division, and produces the WhatsApp text.
 */
export function processLikersData({
  urlPost,
  rawLikersText,
  employees,
  customDate,
  storeCode = 'KTSN',
}: {
  urlPost: string;
  rawLikersText: string;
  employees: Employee[];
  customDate?: string;
  storeCode?: string;
}): LikersProcessResult {
  const cleanPostUrl = (urlPost || '').trim();
  const dateStr = customDate || formatDateIndo(new Date());
  const extractedLikers = extractUsernamesFromRawText(rawLikersText);
  const likerSet = new Set(extractedLikers.map(u => normalizeUsername(u)));

  const allResults: EmployeeCheckResult[] = [];
  const recognizedEmployeeLikers = new Set<string>();

  for (const emp of employees) {
    const u1 = normalizeUsername(emp.username1);
    const u2 = normalizeUsername(emp.username2 || '');

    const hasLikedU1 = u1 ? likerSet.has(u1) : false;
    const hasLikedU2 = u2 ? likerSet.has(u2) : false;
    const hasLiked = hasLikedU1 || hasLikedU2;

    const matchedUsername = hasLikedU1 ? emp.username1 : (hasLikedU2 ? emp.username2 : undefined);
    if (hasLiked && matchedUsername) {
      recognizedEmployeeLikers.add(normalizeUsername(matchedUsername));
    }

    const isExempt = emp.status !== 'Normal';
    const isPenalized = !isExempt && !hasLiked;

    allResults.push({
      employee: emp,
      hasLiked,
      matchedUsername,
      isExempt,
      exemptReason: isExempt ? emp.status : undefined,
      isPenalized,
    });
  }

  // Group by Division
  const divisionMap = new Map<string, EmployeeCheckResult[]>();
  for (const res of allResults) {
    const div = (res.employee.divisi || 'UMUM').trim().toUpperCase();
    if (!divisionMap.has(div)) {
      divisionMap.set(div, []);
    }
    divisionMap.get(div)!.push(res);
  }

  const divisionSummaries: DivisionSummary[] = [];

  // Sort divisions with branch priority (NGK -> WRJ -> KTSN -> Others) & role hierarchy (ADMIN -> MS/FL -> G1 -> G2 -> ...)
  const divisionKeys = Array.from(divisionMap.keys()).sort(compareDivisions);

  for (const div of divisionKeys) {
    const items = divisionMap.get(div)!;
    const totalKaryawan = items.length;
    const exemptItems = items.filter(i => i.isExempt);
    const normalItems = items.filter(i => !i.isExempt);
    const likedItems = items.filter(i => i.hasLiked);
    const penalizedEmployees = normalItems.filter(i => !i.hasLiked).map(i => i.employee);

    divisionSummaries.push({
      divisi: div,
      totalKaryawan,
      wajibLike: normalItems.length,
      sudahLike: normalItems.filter(i => i.hasLiked).length,
      denda: penalizedEmployees.length,
      exempt: exemptItems.length,
      penalizedEmployees,
      likedEmployees: likedItems,
      exemptEmployees: exemptItems,
    });
  }

  // Generate WhatsApp Message according to exact requested specifications:
  // DATA LIKE [DD/MM/YYYY Hari Ini] KTSN
  // [URL Postingan]
  //
  // #[NAMA DIVISI]
  //  • [NAMA KARYAWAN 1]
  //  • [NAMA KARYAWAN 2]
  const waLines: string[] = [];
  waLines.push(`DATA LIKE ${dateStr} ${storeCode.trim()}`);
  waLines.push(cleanPostUrl || 'https://www.instagram.com/p/...');
  waLines.push(''); // Empty line

  let hasAnyPenalty = false;

  for (const summary of divisionSummaries) {
    if (summary.penalizedEmployees.length > 0) {
      hasAnyPenalty = true;
      waLines.push(`#${summary.divisi}`);
      for (const emp of summary.penalizedEmployees) {
        waLines.push(` • ${emp.nama}`);
      }
      waLines.push(''); // spacing between divisions
    }
  }

  if (!hasAnyPenalty) {
    waLines.push('LIKE DONE');
  }

  const waTextOutput = waLines.join('\n').trim();

  // Summary numbers
  const totalKaryawan = allResults.length;
  const totalWajibLike = allResults.filter(r => !r.isExempt).length;
  const totalSudahLike = allResults.filter(r => !r.isExempt && r.hasLiked).length;
  const totalDenda = allResults.filter(r => r.isPenalized).length;
  const totalExempt = allResults.filter(r => r.isExempt).length;

  let unrecognizedLikersCount = 0;
  for (const liker of likerSet) {
    if (!recognizedEmployeeLikers.has(liker)) {
      unrecognizedLikersCount++;
    }
  }

  return {
    tanggalStr: dateStr,
    urlPost: cleanPostUrl,
    storeCode,
    totalLikersInput: extractedLikers.length,
    totalUniqueUsernames: likerSet.size,
    totalKaryawan,
    totalWajibLike,
    totalSudahLike,
    totalDenda,
    totalExempt,
    divisionSummaries,
    allResults,
    waTextOutput,
    unrecognizedLikersCount,
  };
}

/**
 * Creates a direct WhatsApp share URL
 */
export function generateWhatsAppLink(text: string): string {
  const encoded = encodeURIComponent(text);
  return `https://api.whatsapp.com/send?text=${encoded}`;
}
