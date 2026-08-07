import { SosmedPostItem } from '../types';

export const DEFAULT_SOSMED_POSTS: SosmedPostItem[] = [
  // Posting 1 - Pagi
  {
    id: 'post-1-ig',
    platform: 'IG',
    contentType: 'Foto / Feed',
    timeSlot: 'Pagi',
    storeName: 'MEGA KTSN',
    title: 'GODA LEMON',
    url: 'https://www.instagram.com/p/DbsEJpwmnYy/',
    notes: 'Feed Promo Sepeda Listrik Goda 001 Lemon',
    isCompleted: true,
    order: 1
  },
  {
    id: 'post-1-fb',
    platform: 'FB',
    contentType: 'Foto / Feed',
    timeSlot: 'Pagi',
    storeName: 'MEGA KTSN',
    title: 'GODA LEMON',
    url: 'https://www.facebook.com/photo?fbid=122319601742025366&set=pb.61550760992075.-2207520000',
    notes: 'Mirroring dari Postingan IG Pagi',
    isCompleted: true,
    order: 2
  },

  // Posting 2 - Siang
  {
    id: 'post-2-ig',
    platform: 'IG',
    contentType: 'Reel / Video',
    timeSlot: 'Siang',
    storeName: 'MEGA KTSN',
    title: 'PERBEDAAN MESIN CUCI 1 TABUNG & 2 TABUNG',
    url: 'https://www.instagram.com/reel/C-xyz7890/',
    notes: 'Reel Edukasi Produk Mesin Cuci',
    isCompleted: true,
    order: 3
  },
  {
    id: 'post-2-fb',
    platform: 'FB',
    contentType: 'Reel / Video',
    timeSlot: 'Siang',
    storeName: 'MEGA KTSN',
    title: 'PERBEDAAN MESIN CUCI 1 TABUNG & 2 TABUNG',
    url: 'https://www.facebook.com/reel/2127416521509881?locale=id_ID',
    notes: 'Mirroring Reel Edukasi Facebook',
    isCompleted: true,
    order: 4
  },

  // Posting 3 - Sore / Malam
  {
    id: 'post-3-ig',
    platform: 'IG',
    contentType: 'Carousel',
    timeSlot: 'Sore / Malam',
    storeName: 'MEGA KTSN',
    title: 'PROMO MERDEKA ELEKTRONIK & HP',
    url: 'https://www.instagram.com/p/C-abc1234/',
    notes: 'Katalog Promo Diskon Cicilan 0%',
    isCompleted: false,
    order: 5
  },
  {
    id: 'post-3-fb',
    platform: 'FB',
    contentType: 'Carousel',
    timeSlot: 'Sore / Malam',
    storeName: 'MEGA KTSN',
    title: 'PROMO MERDEKA ELEKTRONIK & HP',
    url: 'https://www.facebook.com/photo?fbid=122319987654321',
    notes: 'Mirroring Katalog Promo Sore',
    isCompleted: false,
    order: 6
  },

  // Posting 4 - TikTok VT
  {
    id: 'post-4-tiktok',
    platform: 'TIKTOK',
    contentType: 'VT (Video TikTok)',
    timeSlot: 'Sore / Malam',
    storeName: 'MEGA KTSN',
    title: 'REVIEW SPIL HARGA SEPEDA LISTRIK GODA',
    url: 'https://www.tiktok.com/@megaelektronikktsn/video/7398123456789',
    notes: 'VT Trend TikTok Sound Viral',
    isCompleted: false,
    order: 7
  }
];

export const SOSMED_PLATFORM_CONFIG = {
  IG: {
    name: 'Instagram',
    prefix: 'POST IG',
    color: 'from-pink-500 via-purple-500 to-amber-500',
    badgeBg: 'bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 text-white',
    iconColor: 'text-pink-600',
    borderColor: 'border-pink-200',
    lightBg: 'bg-pink-50/70',
    accentColor: 'text-pink-700'
  },
  FB: {
    name: 'Facebook',
    prefix: 'POST FB',
    color: 'from-blue-600 to-indigo-600',
    badgeBg: 'bg-blue-600 text-white',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    lightBg: 'bg-blue-50/70',
    accentColor: 'text-blue-700'
  },
  TIKTOK: {
    name: 'TikTok',
    prefix: 'POST TIKTOK',
    color: 'from-slate-900 via-rose-500 to-cyan-400',
    badgeBg: 'bg-slate-900 text-white',
    iconColor: 'text-slate-900',
    borderColor: 'border-slate-300',
    lightBg: 'bg-slate-100',
    accentColor: 'text-slate-900'
  },
  YOUTUBE: {
    name: 'YouTube Shorts',
    prefix: 'POST YT',
    color: 'from-red-600 to-rose-700',
    badgeBg: 'bg-red-600 text-white',
    iconColor: 'text-red-600',
    borderColor: 'border-red-200',
    lightBg: 'bg-red-50/70',
    accentColor: 'text-red-700'
  },
  THREAD: {
    name: 'Threads',
    prefix: 'POST THREAD',
    color: 'from-slate-800 to-black',
    badgeBg: 'bg-black text-white',
    iconColor: 'text-black',
    borderColor: 'border-slate-200',
    lightBg: 'bg-slate-50',
    accentColor: 'text-slate-900'
  },
  OTHER: {
    name: 'Platform Lainnya',
    prefix: 'POST',
    color: 'from-indigo-600 to-purple-600',
    badgeBg: 'bg-indigo-600 text-white',
    iconColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    lightBg: 'bg-indigo-50/70',
    accentColor: 'text-indigo-700'
  }
};
