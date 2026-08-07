import { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  AlertTriangle,
  BellRing,
  Send,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  X,
  ArrowRight,
  ShieldAlert,
  Flame,
  CheckCircle2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Share2
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface GlobalMilestonePopupProps {
  activeTab: ActiveTab;
  onNavigateToSosmed: () => void;
  storeName?: string;
  onCopyReport?: () => void;
}

export type MilestoneTimeMode = 'live' | 'test-1530' | 'test-1540' | 'test-1615' | 'test-overdue';

export function GlobalMilestonePopup({
  activeTab,
  onNavigateToSosmed,
  storeName = 'MEGA KTSN',
  onCopyReport,
}: GlobalMilestonePopupProps) {
  const [timeMode, setTimeMode] = useState<MilestoneTimeMode>('live');
  const [simulatedDate, setSimulatedDate] = useState<Date>(new Date());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isDismissedForSession, setIsDismissedForSession] = useState<boolean>(false);

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (timeMode === 'live') {
        setSimulatedDate(new Date());
      } else {
        setSimulatedDate((prev) => new Date(prev.getTime() + 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeMode]);

  // Set test simulation times
  const handleSetTestTime = (mode: MilestoneTimeMode) => {
    setTimeMode(mode);
    setIsDismissedForSession(false);
    setIsMinimized(false);
    const now = new Date();
    if (mode === 'live') {
      setSimulatedDate(now);
    } else if (mode === 'test-1530') {
      const d = new Date(now);
      d.setHours(15, 32, 0);
      setSimulatedDate(d);
    } else if (mode === 'test-1540') {
      const d = new Date(now);
      d.setHours(15, 45, 0);
      setSimulatedDate(d);
    } else if (mode === 'test-1615') {
      const d = new Date(now);
      d.setHours(16, 10, 0);
      setSimulatedDate(d);
    } else if (mode === 'test-overdue') {
      const d = new Date(now);
      d.setHours(16, 20, 0);
      setSimulatedDate(d);
    }
  };

  // Helper sound chime
  const playAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25); // A5
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Ignore
    }
  };

  // Sound trigger on phase change
  useEffect(() => {
    if (soundEnabled && (timeMode === 'test-1540' || timeMode === 'test-overdue')) {
      playAlertChime();
    }
  }, [timeMode, soundEnabled]);

  const hours = simulatedDate.getHours();
  const minutes = simulatedDate.getMinutes();
  const seconds = simulatedDate.getSeconds();
  const totalMinutesNow = hours * 60 + minutes + seconds / 60;

  // Key Milestones in minutes from midnight
  const M_15_30 = 15 * 60 + 30; // 930 min (Post Terakhir Tayang)
  const M_15_40 = 15 * 60 + 40; // 940 min (Laporan Web App Harus Sudah Lengkap)
  const M_16_15 = 16 * 60 + 15; // 975 min (DEADLINE Laporan Masuk Grup WA)

  // Status calculation
  const isPostTerakhirPassed = totalMinutesNow >= M_15_30; // >= 15:30
  const isWebReportReminderActive = totalMinutesNow >= M_15_40 && totalMinutesNow < M_16_15; // 15:40 - 16:15
  const isDeadlinePassed = totalMinutesNow >= M_16_15; // >= 16:15

  // Should show popup? Triggered when 15:40 or 16:15 milestone is reached
  const isMilestoneAlertActive = isWebReportReminderActive || isDeadlinePassed;

  // Format countdown string
  const formatCountdown = (targetMinutes: number) => {
    const diffSeconds = Math.round((targetMinutes - totalMinutesNow) * 60);
    if (diffSeconds <= 0) return '00:00';
    const m = Math.floor(diffSeconds / 60);
    const s = diffSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const countdownTo1615 = useMemo(() => formatCountdown(M_16_15), [totalMinutesNow]);

  const timeFormatted = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')} WIB`;

  // If dismissed or not active, return null
  if (!isMilestoneAlertActive || isDismissedForSession) {
    return null;
  }

  // Phase Definition
  const isOverdue = isDeadlinePassed;

  return (
    <aside aria-label="Pengingat Milestone Posting" className="fixed bottom-4 right-4 z-50 max-w-lg w-[calc(100vw-2rem)] sm:w-auto transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
      {/* ========================================================= */}
      {/* MINIMIZED FLOATING PILL                                    */}
      {/* ========================================================= */}
      {isMinimized ? (
        <div
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl border cursor-pointer backdrop-blur-md transition-all hover:scale-105 ${
            isOverdue
              ? 'bg-rose-900/95 text-white border-rose-400 shadow-rose-900/50 animate-pulse'
              : 'bg-amber-900/95 text-white border-amber-400 shadow-amber-900/50'
          }`}
          title="Klik untuk membuka pengingat laporan lengkap"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-black tracking-wide">
            {isOverdue ? '🚨 DEADLINE 16:15 WA TERLEWATI!' : '⏰ 15:40 PENGINGAT LAPORAN WEB APP'}
          </span>
          <span className="font-mono text-[11px] bg-black/40 px-2 py-0.5 rounded-full">
            {timeFormatted}
          </span>
          <ChevronUp className="w-4 h-4 text-amber-300 ml-1" />
        </div>
      ) : (
        /* ========================================================= */
        /* FULL EXPANDED POPUP CARD (HIGH CONTRAST & VISIBILITY)     */
        /* ========================================================= */
        <div
          className={`rounded-2xl p-4.5 sm:p-5 shadow-2xl border transition-all ${
            isOverdue
              ? 'bg-gradient-to-br from-rose-950 via-slate-900 to-red-950 text-white border-rose-500 shadow-rose-950/60 ring-2 ring-rose-500/50'
              : 'bg-gradient-to-br from-amber-950 via-slate-900 to-orange-950 text-white border-amber-400 shadow-amber-950/60 ring-2 ring-amber-400/50'
          }`}
        >
          {/* Header Row: Live Clock + Urgent Title + Control Buttons */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-sm ${
                  isOverdue
                    ? 'bg-rose-600 text-white animate-bounce'
                    : 'bg-amber-400 text-amber-950 animate-pulse'
                }`}
              >
                {isOverdue ? <ShieldAlert className="w-5 h-5" /> : <BellRing className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      isOverdue
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-400 text-amber-950'
                    }`}
                  >
                    {isOverdue ? '🚨 DEADLINE 16:15 WA' : '⚠️ PENGINGAT 15:40 WEB APP'}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-300">
                    {timeFormatted}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5 leading-snug">
                  {isOverdue
                    ? 'Laporan Wajib Masuk ke Grup WhatsApp!'
                    : 'Laporan Web App Harus Sudah Lengkap!'}
                </h3>
              </div>
            </div>

            {/* Right Header Buttons: Sound, Minimize, Close */}
            <div className="flex items-center gap-1 shrink-0 text-slate-400">
              <button
                type="button"
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) playAlertChime();
                }}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title={soundEnabled ? 'Matikan nada dering' : 'Aktifkan nada dering'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-amber-300" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Kecilkan (Minimize) pengingat ke pojok"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsDismissedForSession(true)}
                className="p-1.5 hover:text-rose-300 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Tutup pengingat sementara"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description & Deadline Countdown Info */}
          <div className="mt-3 text-xs text-slate-200 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5 space-y-1.5">
            <p>
              {isOverdue ? (
                <span className="text-rose-300 font-bold">
                  ⚠️ Jam sudah melewati 16:15 WIB. Rekap 7 postingan sosmed dan link WAJIB segera dikirim ke Grup WhatsApp sekarang agar tidak terlambat.
                </span>
              ) : (
                <span>
                  ⏰ <b>10 Menit pasca post terakhir (15:30) tayang:</b> Seluruh data 7 postingan di web app harus sudah lengkap terisi sebelum deadline masuk grup WA pada <b>16:15 WIB</b>.
                </span>
              )}
            </p>
            
            <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
              <span>Sisa Waktu Menuju Deadline 16:15:</span>
              <span
                className={`font-mono font-black px-2 py-0.5 rounded ${
                  isOverdue
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                }`}
              >
                {isOverdue ? 'LEWAT DEADLINE' : `-${countdownTo1615}`}
              </span>
            </div>
          </div>

          {/* Time Simulation Tester Bar inside Popup */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
            <span className="text-slate-400 font-medium">Uji Waktu Simulasi:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSetTestTime('live')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  timeMode === 'live'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                Real-time
              </button>
              <button
                type="button"
                onClick={() => handleSetTestTime('test-1540')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  timeMode === 'test-1540'
                    ? 'bg-amber-400 text-amber-950 font-black'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                15:45 (Alert 15:40)
              </button>
              <button
                type="button"
                onClick={() => handleSetTestTime('test-overdue')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  timeMode === 'test-overdue'
                    ? 'bg-rose-600 text-white font-black'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                16:20 (Deadline)
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onNavigateToSosmed();
                setIsMinimized(true);
              }}
              className="flex-1 min-w-[160px] px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Buka Laporan Sosmed (7 Post)</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>

            {onCopyReport && (
              <button
                type="button"
                onClick={onCopyReport}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer border border-white/20 flex items-center gap-1"
                title="Salin rekap postingan harian langsung ke clipboard"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Salin Rekap</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-300 transition-all cursor-pointer"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
