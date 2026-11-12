export type EmployeeStatus = 'Normal' | 'Cuti' | 'Off' | 'Izin' | 'Sakit' | 'HP Hilang' | 'Bebas';

export type LikePlatformMode = 'instagram' | 'facebook';

export interface Employee {
  id: string;
  divisi: string;
  nama: string;
  username1: string; // Akun Instagram 1 (Utama)
  username2?: string; // Akun Instagram 2 (Cadangan)
  fbUsername1?: string; // Akun / Nama Profil Facebook 1 (Utama)
  fbUsername2?: string; // Akun / Nama Profil Facebook 2 (Cadangan)
  status: EmployeeStatus;
  keterangan?: string;
  hasMetDailyQuota?: boolean; // Indikator apakah karyawan sudah memenuhi kuota like harian
  dailyLikesCount?: number; // Jumlah like hari ini (misal 0 s/d 7)
}

export interface EmployeeCheckResult {
  employee: Employee;
  hasLiked: boolean;
  matchedUsername?: string;
  matchType?: 'exact' | 'manual_confirmed';
  missingPlatformAccount?: boolean;
  isExempt: boolean; // Cuti, Off, etc.
  exemptReason?: string;
  isPenalized: boolean; // Normal & hasLiked === false
}

export type SimilarLikerConflictLevel = 'likely_same' | 'needs_check' | 'high_risk_different';

export interface SimilarLikerCandidate {
  id: string; // `${employee.id}::${likerNormalized}`
  likerRaw: string;
  likerNormalized: string;
  employee: Employee;
  comparedAgainst: string;
  comparedSource: 'fbUsername' | 'igUsername' | 'employeeName';
  similarityScore: number; // 0..100
  conflictLevel: SimilarLikerConflictLevel;
  reason: string;
  hasEmployeeCollision: boolean;
  conflictingEmployeeNames?: string[];
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
  platform: LikePlatformMode;
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
  similarCandidates: SimilarLikerCandidate[];
  unmappedPlatformEmployeesCount: number;
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

// ==========================================
// RECAP KONTEN TYPES (Manajemen Konten Harian)
// ==========================================
export type ContentProductionStatus =
  | 'Tinggal VO'
  | 'Belum/Tinggal Edit'
  | 'Done'
  | 'Take Video / Footage'
  | 'Scripting / Naskah'
  | 'Siap Post'
  | string;

export type ContentUploadStatus =
  | 'Sudah Upload'
  | 'Belum Upload';

export type ContentDivisi = 'Admin' | 'FL Elekt' | 'FL HP' | 'All Team';

export interface RecapKontenItem {
  id: string;
  talent: string; // e.g. "Amelia", "All Team"
  divisi?: ContentDivisi; // 'Admin' | 'FL Elekt' | 'FL HP' | 'All Team'
  jenisKonten: string; // e.g. "Konten Edukasi", "Review Produk", "Promo / Diskon"
  judulKonten: string; // e.g. "Sepeda Listrik Goda Sunray"
  statusProduksi: ContentProductionStatus; // "Tinggal VO", "Belum/Tinggal Edit", "Done"
  statusPost: ContentUploadStatus; // "Sudah Upload" | "Belum Upload"
  tanggal?: string; // "YYYY-MM-DD"
  linkPost?: string; // Link postingan Instagram / TikTok dsb
  catatan?: string; // Catatan tambahan
  createdAt: number;
  updatedAt: number;
}

// ==========================================
// INSTAGRAM FEED & CAROUSEL PLANNER TYPES
// ==========================================
export type IgGridRatio = '1:1' | '4:5';

export interface IgFeedItem {
  id: string;
  imageDataUrl: string; // aggressively compressed base64 JPEG/WebP
  thumbnailUrl?: string;
  fileSizeBytes: number; // to monitor storage
  title: string; // e.g. "Sepeda Listrik Goda Lemon"
  bodyCaption: string; // Isi utama postingan
  category: 'sepeda_listrik' | 'handphone' | 'elektronik' | 'promo_kredit' | 'custom';
  tagsInput: string; // e.g. "sepeda listrik, goda indonesia, goda sunray"
  customHashtags?: string; // e.g. "#sepedalistrik #godaindonesia"
  isCarousel?: boolean; // carousel multi-slide indicator
  carouselSlideCount?: number;
  postDate?: string;
  postTimeSlot?: string;
  status: 'draft' | 'ready' | 'posted';
  order: number;
  createdAt: number;
  updatedAt: number;
}




