export type EmployeeStatus = 'Normal' | 'Cuti' | 'Off' | 'Izin' | 'Sakit' | 'HP Hilang' | 'Bebas';

export interface Employee {
  id: string;
  divisi: string;
  nama: string;
  username1: string;
  username2?: string;
  status: EmployeeStatus;
  keterangan?: string;
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
}

export interface SheetConfig {
  sheetId: string;
  sheetName: string;
  webAppUrl: string;
  autoSync: boolean;
  lastSync?: string;
}
