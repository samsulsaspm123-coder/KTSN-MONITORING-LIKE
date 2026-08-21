export type EmployeeStatus = 'Normal' | 'Cuti' | 'Off' | 'Izin' | 'Sakit' | 'HP Hilang' | 'Bebas';

export interface Employee {
  id: string;
  divisi: string;
  nama: string;
  username1: string;
  username2?: string;
  status: EmployeeStatus;
  keterangan?: string;
  hasMetDailyQuota?: boolean; // Indikator apakah karyawan sudah memenuhi kuota like harian
  dailyLikesCount?: number; // Jumlah like hari ini (misal 0 s/d 7)
}

export interface EmployeeCheckResult {
  employee: Employee;
  hasLiked: boolean;
  matchedUsername?: string;
  isExempt: boolean; // Cuti, Off, etc.
  exemptReason?: string;
  isPenalized: boolean; // Normal & hasLiked === false
}

export interface DivisionSummary {
  divisi: string;
  totalKaryawan: number;
  wajibLike: number;
  sudahLike: number;
  denda: number;
  exempt: number;
  penalizedEmployees: Employee[];
  likedEmployees: EmployeeCheckResult[];
  exemptEmployees: EmployeeCheckResult[];
}

export interface LikersProcessResult {
  tanggalStr: string;
  urlPost: string;
  storeCode: string;
  totalLikersInput: number;
  totalUniqueUsernames: number;
  totalKaryawan: number;
  totalWajibLike: number;
  totalSudahLike: number;
  totalDenda: number;
  totalExempt: number;
  divisionSummaries: DivisionSummary[];
  allResults: EmployeeCheckResult[];
  waTextOutput: string;
  unrecognizedLikersCount: number;
  unrecognizedLikers: string[];
}

export interface SheetConfig {
  sheetId: string;
  sheetName: string;
  webAppUrl: string;
  autoSync: boolean;
  lastSync?: string;
}

export type FontFamilyId =
  | 'jakarta'
  | 'inter'
  | 'poppins'
  | 'outfit'
  | 'dmsans'
  | 'nunito'
  | 'lexend'
  | 'sora'
  | 'jetbrains';

export type FontSizeScale = 'compact' | 'normal' | 'comfortable' | 'large';

export type ThemeMode = 'light' | 'dark';

export interface FontOption {
  id: FontFamilyId;
  name: string;
  category: string;
  cssFamily: string;
  sample: string;
  description: string;
  tag?: string;
}

export type SocialPlatform = 'IG' | 'FB' | 'TIKTOK' | 'YOUTUBE' | 'THREAD' | 'OTHER';

export type PostContentType = 'Foto / Feed' | 'Reel / Video' | 'Carousel' | 'Story' | 'VT (Video TikTok)';

export type TimeSlot = 'Pagi' | 'Siang' | 'Sore / Malam' | 'Custom';

export interface SosmedPostItem {
  id: string;
  platform: SocialPlatform;
  contentType: PostContentType;
  timeSlot: TimeSlot;
  storeName: string; // e.g. "MEGA KTSN"
  title: string; // e.g. "GODA LEMON" or "PERBEDAAN MESIN CUCI"
  url: string; // e.g. "https://www.instagram.com/p/DbsEJpwmnYy/"
  screenshotUrl?: string; // base64 data url from clipboard or file
  screenshotFileName?: string;
  notes?: string;
  isCompleted: boolean;
  order: number;
}



