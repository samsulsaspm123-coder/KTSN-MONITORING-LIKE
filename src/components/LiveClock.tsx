import { useState, useEffect, memo } from 'react';
import { Calendar, Clock } from 'lucide-react';

export const LiveClock = memo(function LiveClock() {
  const [time, setTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatIndonesianDate = (date: Date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${dayNum} ${monthName} ${year}`;
  };

  const formatIndonesianTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds} WIB`;
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs transition-colors"
      title="Waktu dan Tanggal Sistem Saat Ini"
    >
      {/* Full Day and Date in Indonesian */}
      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-bold">
        <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <span>{formatIndonesianDate(time)}</span>
      </div>

      {/* Subtle Divider */}
      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />

      {/* Live Ticking Time */}
      <div className="flex items-center gap-1.5 font-mono font-black text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 shadow-2xs">
        <Clock className="w-3 h-3 text-emerald-500 shrink-0" />
        <span>{formatIndonesianTime(time)}</span>
      </div>
    </div>
  );
});
