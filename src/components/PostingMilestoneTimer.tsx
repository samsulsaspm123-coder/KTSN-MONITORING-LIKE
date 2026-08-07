import { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  BellRing,
  Send,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowRight,
  ShieldAlert,
  Flame,
  CheckSquare
} from 'lucide-react';
import { SosmedPostItem } from '../types';

interface PostingMilestoneTimerProps {
  posts: SosmedPostItem[];
  storeName?: string;
  onCopyReport?: () => void;
  onShareWhatsApp?: () => void;
  onCompleteAllPosts?: () => void;
}

export type TimeMode = 'live' | 'test-1530' | 'test-1540' | 'test-1615' | 'test-overdue';

export function PostingMilestoneTimer({
  posts,
  storeName = 'MEGA KTSN',
  onCopyReport,
  onShareWhatsApp,
  onCompleteAllPosts
}: PostingMilestoneTimerProps) {
  const [timeMode, setTimeMode] = useState<TimeMode>('live');
  const [simulatedDate, setSimulatedDate] = useState<Date>(new Date());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (timeMode === 'live') {
        setSimulatedDate(new Date());
      } else {
        // Advance simulated time slightly for realistic feeling
        setSimulatedDate((prev) => new Date(prev.getTime() + 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeMode]);

  // Set test times
  const handleSetTestTime = (mode: TimeMode) => {
    setTimeMode(mode);
    setIsDismissed(false);
    const now = new Date();
    if (mode === 'live') {
      setSimulatedDate(now);
    } else if (mode === 'test-1530') {
      // 15:32 (Setelah post terakhir tayang)
      const d = new Date(now);
      d.setHours(15, 32, 10);
      setSimulatedDate(d);
    } else if (mode === 'test-1540') {
      // 15:45 (Pengingat 15:40 aktif, menuju deadline 16:15)
      const d = new Date(now);
      d.setHours(15, 45, 0);
      setSimulatedDate(d);
    } else if (mode === 'test-1615') {
      // 16:10 (5 menit sebelum deadline 16:15)
      const d = new Date(now);
      d.setHours(16, 10, 0);
      setSimulatedDate(d);
    } else if (mode === 'test-overdue') {
      // 16:20 (Lewat deadline 16:15)
      const d = new Date(now);
      d.setHours(16, 20, 0);
      setSimulatedDate(d);
    }
  };

  // Helper sound chime using Web Audio API
  const playAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Ignore
    }
  };

  // Calculate current minutes from midnight
  const hours = simulatedDate.getHours();
  const minutes = simulatedDate.getMinutes();
  const seconds = simulatedDate.getSeconds();
  const totalMinutesNow = hours * 60 + minutes + seconds / 60;

  // Key Milestones in minutes
  const M_15_30 = 15 * 60 + 30; // 930 min (Post Terakhir Tayang)
  const M_15_40 = 15 * 60 + 40; // 940 min (Laporan Web App Harus Sudah Lengkap)
  const M_16_15 = 16 * 60 + 15; // 975 min (DEADLINE Laporan Masuk Grup WA)

  // Status calculation
  const isPostTerakhirPassed = totalMinutesNow >= M_15_30; // >= 15:30
  const isWebReportReminderActive = totalMinutesNow >= M_15_40 && totalMinutesNow < M_16_15; // 15:40 - 16:15
  const isDeadlinePassed = totalMinutesNow >= M_16_15; // >= 16:15

  // Completed posts count
  const completedCount = posts.filter((p) => p.isCompleted).length;
  const isAllPostsDone = posts.length > 0 && completedCount === posts.length;

  // Format countdown string to 15:40
  const formatCountdown = (targetMinutes: number) => {
    const diffSeconds = Math.round((targetMinutes - totalMinutesNow) * 60);
    if (diffSeconds <= 0) return '00:00';
    const m = Math.floor(diffSeconds / 60);
    const s = diffSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Countdown to 15:40 & 16:15
  const countdownTo1540 = useMemo(() => formatCountdown(M_15_40), [totalMinutesNow]);
  const countdownTo1615 = useMemo(() => formatCountdown(M_16_15), [totalMinutesNow]);

  // Phase Definition
  let currentPhase: 'before-1530' | 'between-1530-1540' | 'reminder-1540' | 'overdue-1615' = 'before-1530';
  if (isDeadlinePassed) {
    currentPhase = 'overdue-1615';
  } else if (isWebReportReminderActive) {
    currentPhase = 'reminder-1540';
  } else if (isPostTerakhirPassed) {
    currentPhase = 'between-1530-1540';
  } else {
    currentPhase = 'before-1530';
  }

  const timeStringFormatted = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')} WIB`;

  return (
    <div className="space-y-3">
      {/* ========================================================= */}
      {/* MAIN VISUAL ALERT BANNER (High Visibility)               */}
      {/* ========================================================= */}
      <div
        className={`rounded-2xl p-5 border shadow-md transition-all duration-300 ${
          currentPhase === 'overdue-1615'
            ? 'bg-gradient-to-r from-rose-900 via-red-900 to-rose-950 text-white border-rose-500/60 shadow-rose-900/30'
            : currentPhase === 'reminder-1540'
            ? 'bg-gradient-to-r from-amber-900 via-orange-900 to-amber-950 text-white border-amber-400/80 shadow-amber-900/30 animate-pulse-subtle'
            : currentPhase === 'between-1530-1540'
            ? 'bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white border-indigo-500/40 shadow-indigo-950/30'
            : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-700/60'
        }`}
      >
        {/* Top Header: Clock + Status Phase + Test Simulator Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3.5 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Clock Badge */}
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
              <Clock
                className={`w-4 h-4 ${
                  currentPhase === 'overdue-1615'
                    ? 'text-rose-400 animate-spin-slow'
                    : currentPhase === 'reminder-1540'
                    ? 'text-amber-300 animate-bounce'
                    : 'text-indigo-400'
                }`}
              />
              <span className="font-mono font-black text-sm tracking-wider text-white">
                {timeStringFormatted}
              </span>
              {timeMode !== 'live' && (
                <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-1.5 py-0.5 rounded uppercase">
                  Mode Simulasi
                </span>
              )}
            </div>

            {/* Current Phase Status Badge */}
            {currentPhase === 'overdue-1615' && (
              <span className="px-3 py-1 rounded-lg text-xs font-black bg-rose-500 text-white flex items-center gap-1.5 shadow-sm uppercase tracking-wide animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>🚨 DEADLINE 16:15 TERLEWATI! Wajib Kirim WA Sekarang</span>
              </span>
            )}

            {currentPhase === 'reminder-1540' && (
              <span className="px-3 py-1 rounded-lg text-xs font-black bg-amber-400 text-amber-950 flex items-center gap-1.5 shadow-sm uppercase tracking-wide">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-950" />
                <span>⚠️ PENGINGAT 15:40: Laporan Web App Harus Sudah Lengkap!</span>
              </span>
            )}

            {currentPhase === 'between-1530-1540' && (
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-indigo-300" />
                <span>⏳ Post Terakhir (15:30) Tayang • Segera Input Laporan Sebelum 15:40</span>
              </span>
            )}

            {currentPhase === 'before-1530' && (
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Jadwal Posting Normal • Post Terakhir: 15:30 WIB</span>
              </span>
            )}
          </div>

          {/* Time Simulation Tool Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1">Uji Visual Waktu:</span>
            <button
              type="button"
              onClick={() => handleSetTestTime('live')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                timeMode === 'live'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
              title="Gunakan jam asli saat ini"
            >
              Real-time
            </button>
            <button
              type="button"
              onClick={() => handleSetTestTime('test-1530')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                timeMode === 'test-1530'
                  ? 'bg-indigo-500 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
              title="Simulasi jam 15:32 (Saat post 7 tayang)"
            >
              15:32
            </button>
            <button
              type="button"
              onClick={() => handleSetTestTime('test-1540')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                timeMode === 'test-1540'
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
              title="Simulasi jam 15:45 (Peringatan laporan web app 15:40 aktif!)"
            >
              15:45 (Alert 15:40)
            </button>
            <button
              type="button"
              onClick={() => handleSetTestTime('test-1615')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                timeMode === 'test-1615'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
              title="Simulasi jam 16:10 (5 menit sebelum deadline WA)"
            >
              16:10
            </button>
            <button
              type="button"
              onClick={() => handleSetTestTime('test-overdue')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                timeMode === 'test-overdue'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
              title="Simulasi jam 16:20 (Lewat deadline WA)"
            >
              16:20 (Lewat 16:15)
            </button>

            {/* Sound toggle */}
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playAlertChime();
              }}
              className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer ml-1"
              title={soundEnabled ? 'Bunyikan nada tes' : 'Aktifkan tes suara'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-300" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 3 Milestone Progress Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
          
          {/* MILESTONE 1: 15:30 */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              isPostTerakhirPassed
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                : 'bg-black/20 border-white/10 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Milestone 1 • Jam 15:30
              </span>
              {isPostTerakhirPassed ? (
                <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Selesai</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                  Menunggu
                </span>
              )}
            </div>
            <h4 className="text-sm font-extrabold text-white mt-1">
              📢 Post Terakhir (Post 7) Tayang
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Auto-timer postingan sosmed terakhir telah tayang otomatis di medsos.
            </p>
          </div>

          {/* MILESTONE 2: 15:40 (PENGINGAT UTAMA LAPORAN WEB APP) */}
          <div
            className={`p-3.5 rounded-xl border relative overflow-hidden transition-all ${
              isWebReportReminderActive || (isDeadlinePassed && !isAllPostsDone)
                ? 'bg-amber-950/60 border-amber-400 text-amber-100 shadow-md ring-2 ring-amber-400/40'
                : totalMinutesNow >= M_15_40 && isAllPostsDone
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                : 'bg-black/20 border-white/10 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Milestone 2 • Jam 15:40</span>
              </span>
              {totalMinutesNow >= M_15_40 ? (
                isAllPostsDone ? (
                  <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                    ✅ 7/7 Lengkap
                  </span>
                ) : (
                  <span className="text-[10px] font-black bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full animate-pulse">
                    ⚠️ Wajib Lengkapi!
                  </span>
                )
              ) : (
                <span className="text-[10px] font-mono font-bold bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full">
                  -{countdownTo1540}
                </span>
              )}
            </div>
            <h4 className="text-sm font-extrabold text-white mt-1">
              ⚠️ Laporan Web App Harus Sudah Selesai!
            </h4>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              10 menit pasca post 15:30, seluruh 7 postingan wajib sudah terisi di web app agar tidak terlupa.
            </p>
            <div className="mt-2 text-[11px] font-bold text-amber-300 flex items-center justify-between">
              <span>Status Terisi:</span>
              <span className="bg-black/40 px-2 py-0.5 rounded">
                {completedCount} / {posts.length} Post Selesai
              </span>
            </div>
          </div>

          {/* MILESTONE 3: 16:15 (DEADLINE WAJIB GRUP WA) */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              isDeadlinePassed
                ? 'bg-rose-950/60 border-rose-500 text-rose-100 shadow-md ring-2 ring-rose-500/50'
                : isWebReportReminderActive
                ? 'bg-orange-950/40 border-orange-400/40 text-orange-100'
                : 'bg-black/20 border-white/10 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Milestone 3 • Jam 16:15</span>
              </span>
              {isDeadlinePassed ? (
                <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full animate-bounce">
                  🚨 Lewat Deadline!
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold bg-rose-900/60 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full">
                  Sisa: {countdownTo1615}
                </span>
              )}
            </div>
            <h4 className="text-sm font-extrabold text-white mt-1">
              🚨 Deadline Laporan Masuk Grup WA
            </h4>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              Laporan harian rekap 7 postingan WAJIB sudah dikirim ke Grup WhatsApp sebelum 16:15 WIB.
            </p>
          </div>

        </div>

        {/* Dynamic Action Bar if Reminder is Triggered */}
        {(currentPhase === 'reminder-1540' || currentPhase === 'overdue-1615' || !isAllPostsDone) && (
          <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-bold shrink-0">
                <BellRing className="w-4 h-4 animate-swing" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {currentPhase === 'overdue-1615'
                    ? 'Sudah melewati jam 16:15! Segera kirimkan laporan ke grup sekarang.'
                    : currentPhase === 'reminder-1540'
                    ? 'Jam 15:40 telah tiba! Laporan 7 postingan harus sudah lengkap di web app.'
                    : 'Siapkan laporan 7 postingan agar siap dikirim tepat waktu sebelum 16:15.'}
                </p>
                <p className="text-[11px] text-amber-200/90 font-medium">
                  {completedCount < posts.length
                    ? `Masih ada ${posts.length - completedCount} postingan yang belum ditandai tayang.`
                    : '✅ Semua 7 postingan sudah siap! Langsung salin & share ke WhatsApp.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {completedCount < posts.length && onCompleteAllPosts && (
                <button
                  type="button"
                  onClick={onCompleteAllPosts}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-amber-950 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Tandai 7 Post Selesai</span>
                </button>
              )}

              {onCopyReport && (
                <button
                  type="button"
                  onClick={onCopyReport}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer border border-white/20 flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Salin Rekap Harian</span>
                </button>
              )}

              {onShareWhatsApp && (
                <button
                  type="button"
                  onClick={onShareWhatsApp}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-white transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim ke Grup WA</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
