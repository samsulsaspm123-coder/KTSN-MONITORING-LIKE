import {
  Employee,
  EmployeeCheckResult,
  DivisionSummary,
  LikersProcessResult,
  LikePlatformMode,
  SimilarLikerCandidate,
  SimilarLikerConflictLevel,
} from '../types';

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
    .replace(/[^\w._]/g, ''); // keep valid IG username characters
}

export interface ParsedFbIdentity {
  rawDisplay: string; // Clean human-readable name (e.g. "Binti Andini")
  normPhrase: string; // Lowercase single-spaced letters/numbers (e.g. "binti andini")
  normCompact: string; // Lowercase alphanumeric compact (e.g. "bintiandini")
  slug: string; // Optional profile username / id from URL or (@slug)
}

/**
 * Parses a Facebook account string (display name, profile URL, or "Display Name [slug]")
 * into normalized representations so matching works whether user inputs full name or URL/username.
 */
export function parseFacebookIdentity(input: string): ParsedFbIdentity {
  if (!input) {
    return { rawDisplay: '', normPhrase: '', normCompact: '', slug: '' };
  }

  let working = input.trim();
  let extractedSlug = '';

  // 1. Check for embedded [slug] or (@fb:slug) from our FB extractor
  const bracketMatch = working.match(/^(.*?)\s*(?:\[@?([a-zA-Z0-9._-]+)\]|\(@fb:([a-zA-Z0-9._-]+)\))$/i);
  if (bracketMatch) {
    working = bracketMatch[1].trim();
    extractedSlug = (bracketMatch[2] || bracketMatch[3] || '').toLowerCase();
  }

  // 2. Check if input itself is a Facebook URL
  if (/facebook\.com\//i.test(working) || /^fb\.com\//i.test(working)) {
    try {
      const normalizedUrl = working.startsWith('http') ? working : `https://${working}`;
      const urlObj = new URL(normalizedUrl);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);

      if (urlObj.pathname.includes('profile.php')) {
        const idParam = urlObj.searchParams.get('id');
        if (idParam) {
          extractedSlug = `id:${idParam.trim()}`;
          working = extractedSlug;
        }
      } else if (pathParts[0]?.toLowerCase() === 'people' && pathParts[1]) {
        const personName = decodeURIComponent(pathParts[1]).replace(/[-_]+/g, ' ').trim();
        working = personName;
        if (pathParts[2]) {
          extractedSlug = `id:${pathParts[2]}`;
        }
      } else if (pathParts[0]) {
        extractedSlug = decodeURIComponent(pathParts[0]).trim().toLowerCase();
        working = extractedSlug;
      }
    } catch {
      const simpleMatch = working.match(/(?:facebook|fb)\.com\/([a-zA-Z0-9._-]+)/i);
      if (simpleMatch && simpleMatch[1]) {
        extractedSlug = simpleMatch[1].toLowerCase();
        working = extractedSlug;
      }
    }
  }

  const cleanDisplay = working
    .replace(/^@+/, '')
    .replace(/\s+/g, ' ')
    .trim();

  const normPhrase = cleanDisplay
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const normCompact = normPhrase.replace(/\s+/g, '');

  return {
    rawDisplay: cleanDisplay,
    normPhrase,
    normCompact,
    slug: extractedSlug,
  };
}

/**
 * Parses raw text input into a set of unique Instagram usernames
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

  const lines = text.split(/[\r\n,;\t]+/);

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const urlMatch = trimmedLine.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
    if (urlMatch && urlMatch[1]) {
      const u = normalizeUsername(urlMatch[1]);
      if (u && !ignoredWords.has(u)) {
        foundUsernames.add(u);
        continue;
      }
    }

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
 * Parses raw text input into unique Facebook liker entries (preserving full names with spaces!)
 * Filters out Facebook Reactions modal UI buttons, mutual friend labels, and counters.
 */
export function extractFacebookLikersFromRawText(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return [];

  const text = rawText.trim();
  const resultList: string[] = [];
  const seenKeys = new Set<string>();

  const addCandidate = (rawItem: string) => {
    const parsed = parseFacebookIdentity(rawItem);
    if (!parsed.rawDisplay || parsed.normCompact.length < 2) return;
    const dedupeKey = parsed.slug ? `${parsed.normPhrase}|${parsed.slug}` : parsed.normPhrase;
    if (!dedupeKey || seenKeys.has(dedupeKey)) return;
    seenKeys.add(dedupeKey);
    resultList.push(parsed.slug && parsed.slug !== parsed.rawDisplay.toLowerCase()
      ? `${parsed.rawDisplay} [${parsed.slug}]`
      : parsed.rawDisplay);
  };

  // JSON array support
  if (text.startsWith('[') && text.endsWith(']')) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (typeof item === 'string') {
            addCandidate(item);
          } else if (item && typeof item === 'object') {
            const obj = item as Record<string, unknown>;
            const nameVal = String(obj.name || obj.username || '').trim();
            const slugVal = String(obj.slug || '').trim();
            if (nameVal) {
              addCandidate(slugVal ? `${nameVal} [${slugVal}]` : nameVal);
            }
          }
        }
        if (resultList.length > 0) return resultList;
      }
    } catch {
      // Fallback to text line parsing
    }
  }

  const fbUiExactNoise = new Set([
    'semua', 'all', 'suka', 'like', 'likes', 'super', 'love', 'peduli', 'care',
    'haha', 'wow', 'sedih', 'sad', 'marah', 'angry',
    'tambah jadi teman', 'tambah teman', 'tambahkan teman', 'add friend',
    'batalkan permintaan', 'cancel request', 'permintaan terkirim', 'request sent',
    'ikuti', 'follow', 'mengikuti', 'following', 'diikuti',
    'kirim pesan', 'message', 'teman', 'friends', 'tutup', 'close',
    'lainnya', 'more', 'lihat selengkapnya', 'see more',
    'tanggapan', 'reactions', 'orang yang menanggapi', 'people who reacted',
    'anda', 'you', 'facebook', 'terverifikasi', 'verified', 'undangan terkirim', 'invite', 'undang'
  ]);

  // Split by newlines or semicolons (and commas ONLY when there are no newlines or if comma-separated single line)
  const hasNewline = /[\r\n]/.test(text);
  const rawChunks = hasNewline
    ? text.split(/[\r\n;]+/)
    : text.split(/[,;]+/);

  for (const chunk of rawChunks) {
    const trimmed = chunk
      .replace(/^[•\-*>\d.)\s]+(?=[A-Za-z@])/g, '') // strip leading bullet/numbering if pasted from list
      .trim();

    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();
    if (fbUiExactNoise.has(lower)) continue;

    // Ignore mutual friends subtitles ("1 teman bersama", "24 mutual friends", "Teman bersama: ...")
    if (/^\d+\s*(teman bersama|mutual friend)/i.test(lower)) continue;
    if (/^(teman bersama|mutual friend)/i.test(lower)) continue;

    // Ignore pure reaction counts ("12", "1,4 rb", "2.5K")
    if (/^\d+([.,]\d+)?\s*(rb|jt|k|m)?$/i.test(lower)) continue;

    // Ignore relative time labels ("2 j", "15 mnt", "3 hr", "Kemarin")
    if (/^\d+\s*(dtk|mnt|jam|j|hr|h|mgg|bln|thn|s|m|d|w|y)$/i.test(lower)) continue;

    // Ignore generic status phrases on FB profiles inside dialogs
    if (/^(bekerja di|tinggal di|belajar di|dari |works at|lives in|studied at|followed by|diikuti oleh)/i.test(lower)) {
      continue;
    }

    if (trimmed.length > 75 && !trimmed.includes('facebook.com')) continue;

    addCandidate(trimmed);
  }

  return resultList;
}

/**
 * Unified platform-aware likers extractor
 */
export function extractLikersByPlatform(
  rawText: string,
  platform: LikePlatformMode = 'instagram'
): string[] {
  if (platform === 'facebook') {
    return extractFacebookLikersFromRawText(rawText);
  }
  return extractUsernamesFromRawText(rawText);
}

/**
 * Strips retail role/brand/branch tags from an employee's database name
 * so "PUTRI FL" -> "putri", "DIMAS OPPO" -> "dimas", "WAHYU MS" -> "wahyu"
 */
export function cleanEmployeePersonName(rawName: string): string {
  if (!rawName) return '';
  const roleStopWords = new Set([
    'ms', 'fl', 'spg', 'spm', 'promotor', 'promoter', 'sales',
    'admin', 'adm', 'kasir', 'elekt', 'elektronik', 'hp',
    'ngk', 'nganjuk', 'wrj', 'warujayeng', 'ktsn', 'kertosono', 'kts', 'wr',
    'oppo', 'vivo', 'samsung', 'realme', 'xiaomi', 'infinix', 'tecno', 'iphone', 'apple',
    'sharp', 'polytron', 'lg', 'aqua', 'changhong', 'tcl', 'hisense', 'gree', 'daikin',
    'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'umum', 'ho', 'pusat', 'driver', 'gudang', 'helper'
  ]);

  const tokens = rawName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const filtered = tokens.filter((t) => !roleStopWords.has(t));
  // If all tokens were stripped (rare), fall back to original first token
  if (filtered.length === 0 && tokens.length > 0) {
    return tokens[0];
  }
  return filtered.join(' ');
}

/**
 * Computes normalized Levenshtein similarity between two strings (0.0 to 1.0)
 */
export function stringSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const lenA = a.length;
  const lenB = b.length;
  if (lenA === 0 || lenB === 0) return 0;

  const prev = new Array<number>(lenB + 1);
  const curr = new Array<number>(lenB + 1);

  for (let j = 0; j <= lenB; j++) prev[j] = j;

  for (let i = 1; i <= lenA; i++) {
    curr[0] = i;
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost
      );
    }
    for (let j = 0; j <= lenB; j++) prev[j] = curr[j];
  }

  const distance = prev[lenB];
  return Math.max(0, 1 - distance / Math.max(lenA, lenB));
}

/**
 * Evaluates similarity & false-positive risk ("Nama Mirip Tapi Beda Orang")
 * between a single unrecognized liker and an employee's registered data.
 */
function evaluateLikerAgainstEmployee(
  likerRaw: string,
  emp: Employee,
  platform: LikePlatformMode
): {
  score: number;
  comparedAgainst: string;
  comparedSource: 'fbUsername' | 'igUsername' | 'employeeName';
  conflictLevel: SimilarLikerConflictLevel;
  reason: string;
  sharedPrimaryToken: string;
} | null {
  const likerFb = parseFacebookIdentity(likerRaw);
  const likerPhrase = platform === 'facebook'
    ? likerFb.normPhrase
    : normalizeUsername(likerRaw).replace(/[._]+/g, ' ').trim();
  const likerCompact = platform === 'facebook'
    ? likerFb.normCompact
    : normalizeUsername(likerRaw).replace(/[._\d]+/g, '');
  const likerTokens = likerPhrase.split(/\s+/).filter((t) => t.length >= 2);

  if (!likerCompact || likerCompact.length < 3) return null;

  // Build candidate reference fields from Employee
  const targets: Array<{
    label: string;
    rawHandle?: string;
    phrase: string;
    compact: string;
    source: 'fbUsername' | 'igUsername' | 'employeeName';
  }> = [];

  if (emp.fbUsername1) {
    const p = parseFacebookIdentity(emp.fbUsername1);
    if (p.normCompact) {
      targets.push({ label: emp.fbUsername1, phrase: p.normPhrase, compact: p.normCompact, source: 'fbUsername' });
    }
  }
  if (emp.fbUsername2) {
    const p = parseFacebookIdentity(emp.fbUsername2);
    if (p.normCompact) {
      targets.push({ label: emp.fbUsername2, phrase: p.normPhrase, compact: p.normCompact, source: 'fbUsername' });
    }
  }

  const cleanedEmpName = cleanEmployeePersonName(emp.nama);
  if (cleanedEmpName) {
    targets.push({
      label: emp.nama,
      phrase: cleanedEmpName,
      compact: cleanedEmpName.replace(/\s+/g, ''),
      source: 'employeeName',
    });
  }

  if (emp.username1) {
    const uClean = normalizeUsername(emp.username1);
    const uLetters = uClean.replace(/[._\d]+/g, '');
    if (uClean.length >= 2) {
      targets.push({
        label: `@${emp.username1}`,
        rawHandle: uClean,
        phrase: uClean.replace(/[._]+/g, ' ').trim(),
        compact: uLetters || uClean,
        source: 'igUsername',
      });
    }
  }

  if (emp.username2) {
    const uClean2 = normalizeUsername(emp.username2);
    const uLetters2 = uClean2.replace(/[._\d]+/g, '');
    if (uClean2.length >= 2) {
      targets.push({
        label: `@${emp.username2} (Cadangan)`,
        rawHandle: uClean2,
        phrase: uClean2.replace(/[._]+/g, ' ').trim(),
        compact: uLetters2 || uClean2,
        source: 'igUsername',
      });
    }
  }

  let bestMatch: {
    score: number;
    comparedAgainst: string;
    comparedSource: 'fbUsername' | 'igUsername' | 'employeeName';
    conflictLevel: SimilarLikerConflictLevel;
    reason: string;
    sharedPrimaryToken: string;
  } | null = null;

  for (const target of targets) {
    const targetTokens = target.phrase.split(/\s+/).filter((t) => t.length >= 2);
    const compactSim = stringSimilarity(likerCompact, target.compact);
    const phraseSim = stringSimilarity(likerPhrase, target.phrase);

    // Find shared tokens (exact or very high >= 0.86 typo match for tokens >= 4 chars)
    const matchedPairs: Array<{ lt: string; tt: string; sim: number }> = [];
    for (const tt of targetTokens) {
      for (const lt of likerTokens) {
        const tSim = stringSimilarity(lt, tt);
        if (lt === tt || (tt.length >= 4 && lt.length >= 4 && tSim >= 0.85)) {
          matchedPairs.push({ lt, tt, sim: tSim });
        }
      }
    }

    // Check substring containment for compact handles (e.g. "bintiandini" vs "bintiandiniputri")
    const hasStrongCompactContainment =
      target.compact.length >= 5 &&
      likerCompact.length >= 5 &&
      (likerCompact.includes(target.compact) || target.compact.includes(likerCompact));

    const normLikerHandle = normalizeUsername(likerRaw);
    const handleSim = (target as any).rawHandle
      ? stringSimilarity(normLikerHandle, (target as any).rawHandle)
      : 0;

    // Direct check for handle variations (e.g. 'budi_id' vs 'budi_id_', trailing underscores, single dot)
    const isDirectHandleVariation =
      (target as any).rawHandle &&
      (normLikerHandle.startsWith((target as any).rawHandle) ||
        (target as any).rawHandle.startsWith(normLikerHandle) ||
        normLikerHandle.replace(/[._]/g, '') === (target as any).rawHandle.replace(/[._]/g, '')) &&
      Math.abs(normLikerHandle.length - (target as any).rawHandle.length) <= 3;

    // Determine if this pair is similar enough to even consider
    const maxRawSim = Math.max(compactSim, phraseSim, handleSim);
    if (
      matchedPairs.length === 0 &&
      maxRawSim < 0.74 &&
      !hasStrongCompactContainment &&
      !isDirectHandleVariation
    ) {
      continue;
    }

    let score = Math.round(maxRawSim * 100);
    if (isDirectHandleVariation && score < 88) {
      score = 90;
    }
    let conflictLevel: SimilarLikerConflictLevel = 'needs_check';
    let reason = '';
    const sharedToken = matchedPairs[0]?.tt || target.compact;

    // CASE 1: Both target and liker have >= 2 words, share a word (e.g. first name),
    // BUT their other words are clearly DIFFERENT (e.g. "Bayu Sukma" vs "Bayu Setiawan")!
    if (targetTokens.length >= 2 && likerTokens.length >= 2 && matchedPairs.length > 0) {
      const matchedTargetSet = new Set(matchedPairs.map((m) => m.tt));
      const matchedLikerSet = new Set(matchedPairs.map((m) => m.lt));
      const unmatchedTarget = targetTokens.filter((t) => !matchedTargetSet.has(t));
      const unmatchedLiker = likerTokens.filter((t) => !matchedLikerSet.has(t));

      if (unmatchedTarget.length > 0 && unmatchedLiker.length > 0) {
        // Check if unmatched tokens are actually abbreviations/prefixes (e.g. "Putri R" vs "Putri Rahayu")
        const isAbbrev = unmatchedTarget.some((ut) =>
          unmatchedLiker.some((ul) => ul.startsWith(ut) || ut.startsWith(ul) || stringSimilarity(ut, ul) >= 0.72)
        );

        if (!isAbbrev) {
          score = Math.max(score, 68);
          conflictLevel = 'high_risk_different';
          reason = `Nama "${matchedPairs[0].lt}" mirip dengan ${target.label}, TETAPI kata "${unmatchedLiker.join(' ')}" berbeda dengan "${unmatchedTarget.join(' ')}" — awas orang berbeda!`;
        } else {
          score = Math.max(score, 86);
          conflictLevel = 'likely_same';
          reason = `Nama utama cocok dan singkatan/akhiran selaras dengan ${target.label}.`;
        }
      } else {
        // All tokens of one side matched the other (e.g. "Tiara Indriani" vs "Tiara Indriani Putri")
        score = Math.max(score, 89);
        conflictLevel = target.source === 'fbUsername' && platform === 'facebook' ? 'likely_same' : 'needs_check';
        reason = `Seluruh kata kunci pada ${target.label} cocok dengan nama akun yang like.`;
      }
    }
    // CASE 2: Target only has 1 word (e.g. employee name "BAYU" or "PUTRI") and liker has multiple words ("Bayu Setiawan")
    else if (targetTokens.length === 1 && likerTokens.length >= 2 && matchedPairs.length > 0) {
      // Avoid noisy tiny 3-letter partial matches unless first token matches
      if (targetTokens[0].length < 4 && likerTokens[0] !== targetTokens[0]) {
        continue;
      }
      score = Math.max(score, 76);
      conflictLevel = 'needs_check';
      const extraWords = likerTokens.filter((t) => t !== matchedPairs[0].lt).join(' ');
      reason = `Kata "${matchedPairs[0].lt}" sama dengan ${target.label}, namun ada nama tambahan "${extraWords}" — pastikan bukan orang lain yang namanya kebetulan sama.`;
    }
    // CASE 3: Compact / full string or handle is nearly identical (typo / punctuation e.g. budi_id vs budi_id_)
    else if (isDirectHandleVariation || maxRawSim >= 0.84 || (compactSim === 1 && target.compact.length >= 4)) {
      score = Math.max(score, isDirectHandleVariation ? 92 : Math.round(maxRawSim * 100));
      conflictLevel = score >= 90 ? 'likely_same' : 'needs_check';
      if (isDirectHandleVariation) {
        reason = `Username "${normLikerHandle}" sangat mirip (${score}%) dengan ${target.label} (hanya beda simbol/akhiran seperti '_' atau '.'). Disarankan gabungkan data jika benar milik ${emp.nama}.`;
      } else {
        reason =
          target.source === 'igUsername'
            ? `Nama akun sangat mirip (${score}%) dengan username IG karyawan (${target.label}).`
            : `Penulisan nama sangat mirip (${score}%) dengan data ${target.label}.`;
      }
    }
    // CASE 4: Substring handle containment (e.g. "bintiandini" inside "bintiandini99")
    else if (hasStrongCompactContainment) {
      score = Math.max(score, 82);
      conflictLevel = 'needs_check';
      reason = `Memuat unsur nama/username "${target.label}" — cek apakah ini akun kedua/baru milik karyawan.`;
    } else {
      continue;
    }

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = {
        score: Math.min(99, score),
        comparedAgainst: target.label,
        comparedSource: target.source,
        conflictLevel,
        reason,
        sharedPrimaryToken: sharedToken,
      };
    }
  }

  return bestMatch;
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

export function getBranchRank(divisionName: string): number {
  const d = (divisionName || '').toUpperCase().trim();
  if (d.includes('NGK') || d.includes('NGANJUK')) return 1;
  if (d.includes('WRJ') || d.includes('WARU') || /\bWR\b/.test(d) || d.endsWith(' WR') || d.includes(' WR ')) return 2;
  if (d.includes('KTSN') || d.includes('KERTOSONO') || /\bKTS\b/.test(d) || d.endsWith(' KTS') || d.includes(' KTS ')) return 3;
  if (d.includes('EXTERNAL') || d.includes('EKSTERNAL')) return 90;
  if (d.includes('UMUM') || d.includes('HO') || d.includes('PUSAT') || d.includes('MANAGEMENT')) return 95;
  return 50;
}

export function getRoleRank(divisionName: string): number {
  const d = (divisionName || '').toUpperCase().trim();
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
  if (/\bG1\b/.test(d) || d.includes('G 1') || d.includes('GRUP 1') || d.includes('GROUP 1')) return 3;
  if (/\bG2\b/.test(d) || d.includes('G 2') || d.includes('GRUP 2') || d.includes('GROUP 2')) return 4;
  if (/\bG3\b/.test(d) || d.includes('G 3') || d.includes('GRUP 3') || d.includes('GROUP 3')) return 5;
  if (/\bG4\b/.test(d) || d.includes('G 4') || d.includes('GRUP 4') || d.includes('GROUP 4')) return 6;
  if (/\bG5\b/.test(d) || d.includes('G 5') || d.includes('GRUP 5') || d.includes('GROUP 5')) return 7;
  if (/\bG6\b/.test(d) || d.includes('G 6') || d.includes('GRUP 6') || d.includes('GROUP 6')) return 8;
  if (d.includes('ELEKT') || d.includes('ELECTRONIC') || d.includes('ELEKTRONIK')) return 10;
  if (d.includes('FURNITURE') || d.includes('MEBEL') || d.includes('MATRASS') || d.includes('SPRINGBED')) return 15;
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
  if (d.includes('KASIR')) return 25;
  return 30;
}

export function compareDivisions(a: string, b: string): number {
  const branchA = getBranchRank(a);
  const branchB = getBranchRank(b);
  if (branchA !== branchB) return branchA - branchB;

  const roleA = getRoleRank(a);
  const roleB = getRoleRank(b);
  if (roleA !== roleB) return roleA - roleB;

  return a.localeCompare(b);
}

/**
 * Main processing engine supporting both Instagram & Facebook modes,
 * unlisted/unrecognized liker tracking, and similarity + false-positive disambiguation.
 */
export function processLikersData({
  urlPost,
  rawLikersText,
  employees,
  customDate,
  storeCode = 'KTSN',
  platform = 'instagram',
  manualConfirmedMap = {},
  rejectedPairKeys = [],
}: {
  urlPost: string;
  rawLikersText: string;
  employees: Employee[];
  customDate?: string;
  storeCode?: string;
  platform?: LikePlatformMode;
  manualConfirmedMap?: Record<string, string>; // employeeId -> likerRaw confirmed manually by user
  rejectedPairKeys?: string[]; // array of `${empId}::${likerNorm}` marked as "Beda Orang"
}): LikersProcessResult {
  const cleanPostUrl = (urlPost || '').trim();
  const dateStr = customDate || formatDateIndo(new Date());
  const extractedLikers = extractLikersByPlatform(rawLikersText, platform);
  const rejectedSet = new Set(rejectedPairKeys);

  const allResults: EmployeeCheckResult[] = [];
  const consumedLikerRawSet = new Set<string>();
  let unmappedPlatformEmployeesCount = 0;

  if (platform === 'instagram') {
    // Build lookup map: normalized IG username -> original extracted string
    const igLikerMap = new Map<string, string>();
    for (const raw of extractedLikers) {
      const norm = normalizeUsername(raw);
      if (norm && !igLikerMap.has(norm)) {
        igLikerMap.set(norm, raw);
      }
    }

    for (const emp of employees) {
      const u1 = normalizeUsername(emp.username1);
      const u2 = normalizeUsername(emp.username2 || '');
      if (!u1 && !u2) unmappedPlatformEmployeesCount++;

      const manualLiker = manualConfirmedMap[emp.id];
      const manualNorm = manualLiker ? normalizeUsername(manualLiker) : '';

      const hasLikedU1 = u1 ? igLikerMap.has(u1) : false;
      const hasLikedU2 = u2 ? igLikerMap.has(u2) : false;
      const hasManual = manualNorm ? igLikerMap.has(manualNorm) : false;

      const hasLiked = hasLikedU1 || hasLikedU2 || hasManual;
      let matchedUsername: string | undefined;
      let matchType: 'exact' | 'manual_confirmed' | undefined;

      if (hasLikedU1) {
        matchedUsername = emp.username1;
        matchType = 'exact';
        consumedLikerRawSet.add(igLikerMap.get(u1)!);
      } else if (hasLikedU2) {
        matchedUsername = emp.username2;
        matchType = 'exact';
        consumedLikerRawSet.add(igLikerMap.get(u2)!);
      } else if (hasManual) {
        matchedUsername = manualLiker;
        matchType = 'manual_confirmed';
        consumedLikerRawSet.add(igLikerMap.get(manualNorm)!);
      }

      const isExempt = emp.status !== 'Normal';
      const isPenalized = !isExempt && !hasLiked;

      allResults.push({
        employee: emp,
        hasLiked,
        matchedUsername,
        matchType,
        missingPlatformAccount: !u1 && !u2,
        isExempt,
        exemptReason: isExempt ? emp.status : undefined,
        isPenalized,
      });
    }
  } else {
    // FACEBOOK MODE
    const fbParsedLikers = extractedLikers.map((raw) => ({
      raw,
      parsed: parseFacebookIdentity(raw),
    }));

    for (const emp of employees) {
      const fb1 = parseFacebookIdentity(emp.fbUsername1 || '');
      const fb2 = parseFacebookIdentity(emp.fbUsername2 || '');
      const hasFbAccountConfigured = Boolean(fb1.normCompact || fb2.normCompact);
      if (!hasFbAccountConfigured) {
        unmappedPlatformEmployeesCount++;
      }

      const manualLiker = manualConfirmedMap[emp.id];
      const manualParsed = manualLiker ? parseFacebookIdentity(manualLiker) : null;

      let matchedLikerObj: { raw: string; parsed: ParsedFbIdentity } | undefined;
      let matchType: 'exact' | 'manual_confirmed' | undefined;

      const matchesIdentity = (
        target: ParsedFbIdentity,
        candidate: ParsedFbIdentity
      ): boolean => {
        if (!target.normCompact || !candidate.normCompact) return false;
        // Exact full phrase match (e.g. "binti andini" === "binti andini")
        if (target.normPhrase && candidate.normPhrase && target.normPhrase === candidate.normPhrase) {
          return true;
        }
        // Exact slug match (e.g. profile URL username "binti.andini" === [binti.andini])
        if (target.slug && candidate.slug && target.slug === candidate.slug) {
          return true;
        }
        if (target.slug && target.slug === candidate.normCompact) {
          return true;
        }
        if (candidate.slug && candidate.slug === target.normPhrase.replace(/\s+/g, '.')) {
          return true;
        }
        // Exact compact match ONLY when multi-char >= 5 (e.g. "bintiandini" === "Binti Andini")
        if (target.normCompact.length >= 5 && target.normCompact === candidate.normCompact) {
          return true;
        }
        return false;
      };

      for (const item of fbParsedLikers) {
        if (matchesIdentity(fb1, item.parsed)) {
          matchedLikerObj = item;
          matchType = 'exact';
          break;
        }
        if (matchesIdentity(fb2, item.parsed)) {
          matchedLikerObj = item;
          matchType = 'exact';
          break;
        }
      }

      if (!matchedLikerObj && manualParsed && manualParsed.normCompact) {
        for (const item of fbParsedLikers) {
          if (matchesIdentity(manualParsed, item.parsed) || item.raw === manualLiker) {
            matchedLikerObj = item;
            matchType = 'manual_confirmed';
            break;
          }
        }
      }

      const hasLiked = Boolean(matchedLikerObj);
      if (matchedLikerObj) {
        consumedLikerRawSet.add(matchedLikerObj.raw);
      }

      const isExempt = emp.status !== 'Normal';
      const isPenalized = !isExempt && !hasLiked;

      allResults.push({
        employee: emp,
        hasLiked,
        matchedUsername: matchedLikerObj ? matchedLikerObj.parsed.rawDisplay : undefined,
        matchType,
        missingPlatformAccount: !hasFbAccountConfigured,
        isExempt,
        exemptReason: isExempt ? emp.status : undefined,
        isPenalized,
      });
    }
  }

  // Unrecognized / Unlisted Likers (accounts that liked the post but are NOT matched to any employee)
  const unrecognizedLikers: string[] = [];
  for (const raw of extractedLikers) {
    if (!consumedLikerRawSet.has(raw)) {
      if (platform === 'facebook') {
        const p = parseFacebookIdentity(raw);
        unrecognizedLikers.push(p.rawDisplay || raw);
      } else {
        unrecognizedLikers.push(normalizeUsername(raw));
      }
    }
  }
  unrecognizedLikers.sort((a, b) => a.localeCompare(b));

  // Compute Smart Similarity & Disambiguation Candidates between unrecognizedLikers and unliked employees
  // Also check ALL employees to detect multi-employee name collisions ("Nama Mirip Tapi Beda Orang")!
  const unlikedResults = allResults.filter((r) => !r.hasLiked);
  const similarCandidates: SimilarLikerCandidate[] = [];

  for (const likerItem of unrecognizedLikers) {
    const likerNormKey =
      platform === 'facebook'
        ? parseFacebookIdentity(likerItem).normCompact
        : normalizeUsername(likerItem);

    if (!likerNormKey) continue;

    // Check which employees across the ENTIRE roster have a similar name to detect collisions
    const allMatchingEmployees: Array<{
      emp: Employee;
      hasAlreadyLiked: boolean;
      evalRes: NonNullable<ReturnType<typeof evaluateLikerAgainstEmployee>>;
    }> = [];

    for (const res of allResults) {
      const evalRes = evaluateLikerAgainstEmployee(likerItem, res.employee, platform);
      if (evalRes) {
        allMatchingEmployees.push({
          emp: res.employee,
          hasAlreadyLiked: res.hasLiked,
          evalRes,
        });
      }
    }

    // For each unliked employee that matched, create a candidate with collision awareness
    for (const unliked of unlikedResults) {
      const candidateKey = `${unliked.employee.id}::${likerNormKey}`;
      if (rejectedSet.has(candidateKey)) continue;

      const matchEntry = allMatchingEmployees.find((m) => m.emp.id === unliked.employee.id);
      if (!matchEntry) continue;

      const otherCollisions = allMatchingEmployees
        .filter((m) => m.emp.id !== unliked.employee.id)
        .map((m) => `${m.emp.nama} (${m.emp.divisi}${m.hasAlreadyLiked ? ' - Sudah Like' : ''})`);

      const hasCollision = otherCollisions.length > 0;
      let finalConflict: SimilarLikerConflictLevel = matchEntry.evalRes.conflictLevel;
      let finalReason = matchEntry.evalRes.reason;

      if (hasCollision && finalConflict === 'likely_same') {
        finalConflict = 'needs_check';
      }
      if (hasCollision) {
        finalReason += ` Perhatian: Nama ini juga mirip dengan staf lain (${otherCollisions.join(', ')}).`;
      }

      similarCandidates.push({
        id: candidateKey,
        likerRaw: likerItem,
        likerNormalized: likerNormKey,
        employee: unliked.employee,
        comparedAgainst: matchEntry.evalRes.comparedAgainst,
        comparedSource: matchEntry.evalRes.comparedSource,
        similarityScore: matchEntry.evalRes.score,
        conflictLevel: finalConflict,
        reason: finalReason,
        hasEmployeeCollision: hasCollision,
        conflictingEmployeeNames: hasCollision ? otherCollisions : undefined,
      });
    }
  }

  // Sort similarCandidates: likely_same first, then needs_check, then high_risk_different, then by score desc
  const rankConflict: Record<SimilarLikerConflictLevel, number> = {
    likely_same: 1,
    needs_check: 2,
    high_risk_different: 3,
  };
  similarCandidates.sort((a, b) => {
    const rDiff = rankConflict[a.conflictLevel] - rankConflict[b.conflictLevel];
    if (rDiff !== 0) return rDiff;
    return b.similarityScore - a.similarityScore;
  });

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
  const divisionKeys = Array.from(divisionMap.keys()).sort(compareDivisions);

  for (const div of divisionKeys) {
    const items = divisionMap.get(div)!;
    const totalKaryawan = items.length;
    const exemptItems = items.filter((i) => i.isExempt);
    const normalItems = items.filter((i) => !i.isExempt);
    const likedItems = items.filter((i) => i.hasLiked);
    const penalizedEmployees = normalItems.filter((i) => !i.hasLiked).map((i) => i.employee);

    divisionSummaries.push({
      divisi: div,
      totalKaryawan,
      wajibLike: normalItems.length,
      sudahLike: normalItems.filter((i) => i.hasLiked).length,
      denda: penalizedEmployees.length,
      exempt: exemptItems.length,
      penalizedEmployees,
      likedEmployees: likedItems,
      exemptEmployees: exemptItems,
    });
  }

  // Generate WhatsApp Message
  const waLines: string[] = [];
  const headerLabel =
    platform === 'facebook'
      ? `DATA LIKE FACEBOOK ${dateStr} ${storeCode.trim()}`
      : `DATA LIKE ${dateStr} ${storeCode.trim()}`;
  waLines.push(headerLabel);
  if (cleanPostUrl) {
    waLines.push(cleanPostUrl);
  }
  waLines.push('');

  let hasAnyPenalty = false;

  for (const summary of divisionSummaries) {
    if (summary.penalizedEmployees.length > 0) {
      hasAnyPenalty = true;
      waLines.push(`#${summary.divisi}`);
      for (const emp of summary.penalizedEmployees) {
        waLines.push(` • ${emp.nama}`);
      }
      waLines.push('');
    }
  }

  if (!hasAnyPenalty) {
    waLines.push('LIKE DONE');
  }

  const waTextOutput = waLines.join('\n').trim();

  const totalKaryawan = allResults.length;
  const totalWajibLike = allResults.filter((r) => !r.isExempt).length;
  const totalSudahLike = allResults.filter((r) => !r.isExempt && r.hasLiked).length;
  const totalDenda = allResults.filter((r) => r.isPenalized).length;
  const totalExempt = allResults.filter((r) => r.isExempt).length;

  return {
    platform,
    tanggalStr: dateStr,
    urlPost: cleanPostUrl,
    storeCode,
    totalLikersInput: extractedLikers.length,
    totalUniqueUsernames: extractedLikers.length,
    totalKaryawan,
    totalWajibLike,
    totalSudahLike,
    totalDenda,
    totalExempt,
    divisionSummaries,
    allResults,
    waTextOutput,
    unrecognizedLikersCount: unrecognizedLikers.length,
    unrecognizedLikers,
    similarCandidates,
    unmappedPlatformEmployeesCount,
  };
}

/**
 * Smart matcher used when bulk-importing Facebook usernames onto existing employees
 * without altering total employee count. Detects exact matches, fuzzy matches, and ambiguous name collisions.
 */
export function matchEmployeeByNameForImport(
  rawNameInput: string,
  rawDivisiInput: string,
  employees: Employee[]
): {
  matchedEmployee: Employee | null;
  matchStatus: 'exact' | 'similar' | 'ambiguous' | 'not_found';
  candidates: Employee[];
  note?: string;
} {
  const cleanIn = rawNameInput.trim().toLowerCase().replace(/\s+/g, ' ');
  const strippedIn = cleanEmployeePersonName(rawNameInput);
  const cleanDiv = rawDivisiInput.trim().toUpperCase();

  if (!cleanIn) {
    return { matchedEmployee: null, matchStatus: 'not_found', candidates: [] };
  }

  // 1. Exact full name match (with optional division tie-breaker)
  const exactFull = employees.filter(
    (e) => e.nama.trim().toLowerCase().replace(/\s+/g, ' ') === cleanIn
  );
  if (exactFull.length === 1) {
    return { matchedEmployee: exactFull[0], matchStatus: 'exact', candidates: exactFull };
  }
  if (exactFull.length > 1) {
    if (cleanDiv) {
      const divExact = exactFull.find((e) => e.divisi.toUpperCase().includes(cleanDiv) || cleanDiv.includes(e.divisi.toUpperCase()));
      if (divExact) {
        return { matchedEmployee: divExact, matchStatus: 'exact', candidates: exactFull };
      }
    }
    return {
      matchedEmployee: exactFull[0],
      matchStatus: 'ambiguous',
      candidates: exactFull,
      note: `Ada ${exactFull.length} karyawan bernama "${rawNameInput}" — pastikan pilih divisi yang tepat.`,
    };
  }

  // 2. Match against stripped person name (e.g. "Putri" matches "PUTRI FL", "Dimas" matches "DIMAS OPPO")
  if (strippedIn) {
    const strippedMatches = employees.filter(
      (e) => cleanEmployeePersonName(e.nama) === strippedIn
    );
    if (strippedMatches.length === 1) {
      return {
        matchedEmployee: strippedMatches[0],
        matchStatus: 'exact',
        candidates: strippedMatches,
      };
    }
    if (strippedMatches.length > 1) {
      if (cleanDiv) {
        const divFiltered = strippedMatches.filter(
          (e) => e.divisi.toUpperCase().includes(cleanDiv) || cleanDiv.includes(e.divisi.toUpperCase())
        );
        if (divFiltered.length === 1) {
          return { matchedEmployee: divFiltered[0], matchStatus: 'exact', candidates: strippedMatches };
        }
      }
      return {
        matchedEmployee: strippedMatches[0],
        matchStatus: 'ambiguous',
        candidates: strippedMatches,
        note: `Ada ${strippedMatches.length} karyawan dengan nama mirip (${strippedMatches.map((s) => `${s.nama} [${s.divisi}]`).join(', ')}) — silakan pilih manual.`,
      };
    }
  }

  // 3. Fuzzy / Token similarity search
  const scored: Array<{ emp: Employee; score: number }> = [];
  for (const emp of employees) {
    const empClean = emp.nama.trim().toLowerCase();
    const empStripped = cleanEmployeePersonName(emp.nama);
    const s1 = stringSimilarity(cleanIn, empClean);
    const s2 = strippedIn && empStripped ? stringSimilarity(strippedIn, empStripped) : 0;
    const tokenHit =
      strippedIn.length >= 3 &&
      empStripped.split(/\s+/).some((t) => t === strippedIn || strippedIn.split(/\s+/).includes(t));
    const best = Math.max(s1, s2, tokenHit ? 0.82 : 0);
    if (best >= 0.75) {
      scored.push({ emp, score: best });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  if (scored.length === 1) {
    return {
      matchedEmployee: scored[0].emp,
      matchStatus: 'similar',
      candidates: [scored[0].emp],
      note: `Dicocokkan berdasarkan kemiripan nama dengan "${scored[0].emp.nama}"`,
    };
  }
  if (scored.length > 1) {
    return {
      matchedEmployee: scored[0].emp,
      matchStatus: 'ambiguous',
      candidates: scored.map((s) => s.emp),
      note: `Ditemukan beberapa nama karyawan yang mirip — cek pilihan karyawan sebelum simpan.`,
    };
  }

  return { matchedEmployee: null, matchStatus: 'not_found', candidates: [] };
}

/**
 * Creates a direct WhatsApp share URL
 */
export function generateWhatsAppLink(text: string): string {
  const encoded = encodeURIComponent(text);
  return `https://api.whatsapp.com/send?text=${encoded}`;
}
