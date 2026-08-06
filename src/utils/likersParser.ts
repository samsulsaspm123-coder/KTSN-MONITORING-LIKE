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

  // Sort divisions alphabetically or keep standard retail order
  const divisionKeys = Array.from(divisionMap.keys()).sort((a, b) => a.localeCompare(b));

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
