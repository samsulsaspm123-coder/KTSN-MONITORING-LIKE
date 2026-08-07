import { FontOption } from '../types';

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'jakarta',
    name: 'Plus Jakarta Sans',
    category: 'Geometric Clean & Modern',
    cssFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sample: 'Monitoring Instagram & Rekap WA KTSN',
    description: 'Font resmi modern berstandar teknologi. Sangat tajam, proporsional, dan nyaman di mata.',
    tag: 'Rekomendasi Utama'
  },
  {
    id: 'inter',
    name: 'Inter',
    category: 'Universal UI Standard',
    cssFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sample: 'Sistem Deteksi Like Karyawan Retail',
    description: 'Standar emas tipografi aplikasi web modern di seluruh dunia. Netral, presisi, dan sangat jernih.',
    tag: 'Paling Populer'
  },
  {
    id: 'poppins',
    name: 'Poppins',
    category: 'Rounded Geometric',
    cssFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sample: 'Rekapitulasi Divisi & Karyawan Denda',
    description: 'Karakter membulat yang ramah, elegan, dan estetik. Sangat disukai untuk dashboard modern.',
    tag: 'Elegan'
  },
  {
    id: 'outfit',
    name: 'Outfit',
    category: 'Contemporary Tech',
    cssFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sample: 'Otomasi Google Apps Script & Sheets',
    description: 'Huruf modern kekinian dengan kesan mewah dan rapi. Sangat nyaman untuk angka dan teks.',
    tag: 'Modern'
  },
  {
    id: 'dmsans',
    name: 'DM Sans',
    category: 'Minimalist Corporate',
    cssFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sample: 'Laporan Harian WhatsApp & Spreadsheet',
    description: 'Bersih, seimbang, dan formal tanpa kaku. Cocok untuk laporan manajemen dan rekap data.',
    tag: 'Profesional'
  },
  {
    id: 'nunito',
    name: 'Nunito',
    category: 'Soft Rounded & Relaxing',
    cssFamily: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sample: 'Daftar Like Karyawan & Status Cuti',
    description: 'Kurva ujung huruf lembut yang sangat nyaman dibaca berlama-lama tanpa membuat mata cepat lelah.',
    tag: 'Lembut di Mata'
  },
  {
    id: 'lexend',
    name: 'Lexend',
    category: 'High-Readability / Fast Read',
    cssFamily: "'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sample: 'Pencocokan Username 1 & Username 2',
    description: 'Didesain oleh pakar tipografi untuk meningkatkan kecepatan dan kenyamanan membaca data tabel.',
    tag: 'Ekstra Jelas'
  },
  {
    id: 'sora',
    name: 'Sora',
    category: 'Futuristic & Bold',
    cssFamily: "'Sora', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sample: 'Ekstensi Chrome & Bookmarklet 1-Klik',
    description: 'Huruf futuristik dengan garis geometris tegas. Memberi kesan canggih dan berkelas.',
    tag: 'Futuristik'
  },
  {
    id: 'jetbrains',
    name: 'JetBrains Mono',
    category: 'Developer & Data Monospace',
    cssFamily: "'JetBrains Mono', monospace",
    sample: 'const likers = IG_EXPORTER.parse();',
    description: 'Huruf monospace khusus programmer dan data analyst. Angka dan kolom teks sejajar sempurna.',
    tag: 'Monospace Code'
  }
];

export const FONT_SIZE_SCALES: { id: 'compact' | 'normal' | 'comfortable' | 'large'; name: string; desc: string; zoomClass: string }[] = [
  {
    id: 'compact',
    name: 'Kompak (90%)',
    desc: 'Tampilan lebih padat untuk layar kecil',
    zoomClass: 'text-[13px]'
  },
  {
    id: 'normal',
    name: 'Standar (100%)',
    desc: 'Ukuran ideal seimbang untuk semua monitor',
    zoomClass: 'text-[14px]'
  },
  {
    id: 'comfortable',
    name: 'Nyaman (+10%)',
    desc: 'Teks sedikit lebih besar dan mudah dibaca',
    zoomClass: 'text-[15px]'
  },
  {
    id: 'large',
    name: 'Besar (+20%)',
    desc: 'Sangat jelas untuk presentasi atau HP',
    zoomClass: 'text-[16px]'
  }
];
