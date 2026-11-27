import { useEffect, useState } from 'react';
import { BellRing, ChevronDown, ChevronUp, Copy, Share2, ShieldAlert, X } from 'lucide-react';
import { toMinutes, useMilestoneSettings } from '../lib/milestoneSettings';

interface GlobalMilestonePopupProps {
  activeTab?: string;
  onNavigateToSosmed: () => void;
  storeName?: string;
  onCopyReport?: () => void;
}

export type MilestoneTimeMode = 'live' | 'test-1530' | 'test-1540' | 'test-1615' | 'test-overdue';
type Phase = 'idle' | 'reminder' | 'overdue';

const pad = (n: number) => String(n).padStart(2, '0');

function formatRemaining(sec: number) {
  if (sec >= 3600) return `${Math.floor(sec / 3600)} j ${Math.floor((sec % 3600) / 60)} m`;
  return `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`;
}

export function GlobalMilestonePopup({ onNavigateToSosmed, onCopyReport }: GlobalMilestonePopupProps) {
  const s = useMilestoneSettings();
  const [now, setNow] = useState(() => new Date());
  const [preview, setPreview] = useState<Phase | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [dismissed, setDismissed] = useState<Phase | null>(null);

  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const deadlineMin = toMinutes(s.deadline);

  let livePhase: Phase = 'idle';
  if (nowMin >= deadlineMin) livePhase = 'overdue';
  else if (nowMin >= toMinutes(s.reminder)) livePhase = 'reminder';
  const phase = preview ?? livePhase;
  const active = s.enabled && phase !== 'idle';

  // Detik berjalan hanya saat popup tampil, selain itu cek tiap 20 detik
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), active ? 1000 : 20000);
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => {
    setNow(new Date());
  }, [s.reminder, s.deadline]);

  // Tombol "Coba" di pengaturan
  useEffect(() => {
    const onPreview = (e: Event) => {
      setPreview((e as CustomEvent<Phase>).detail);
      setDismissed(null);
      setMinimized(false);
    };
    window.addEventListener('milestone-preview', onPreview);
    return () => window.removeEventListener('milestone-preview', onPreview);
  }, []);

  // Fase baru = popup muncul lagi dalam ukuran penuh
  useEffect(() => {
    setMinimized(false);
  }, [phase]);

  if (!s.enabled || phase === 'idle' || dismissed === phase) return null;

  const overdue = phase === 'overdue';
  const remaining = formatRemaining(Math.max(0, Math.round((deadlineMin - nowMin) * 60)));
  const clock = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const close = () => {
    if (preview) setPreview(null);
    else setDismissed(phase);
  };

  const dot = overdue ? 'bg-rose-500' : 'bg-amber-500';
  const chip = overdue
    ? 'bg-rose-50 text-rose-800 border-rose-200'
    : 'bg-amber-50 text-amber-800 border-amber-200';

  return (
    <aside
      aria-label="Pengingat laporan harian"
      className="fixed bottom-20 right-4 z-50 w-[calc(100vw-2rem)] sm:w-[360px]"
    >
      {minimized ? (
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="ml-auto flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-md cursor-pointer"
        >
          <span className={`h-2 w-2 rounded-full ${dot}`} />
          {overdue ? `Lewat deadline ${s.deadline}` : `Deadline ${s.deadline} · ${remaining}`}
          <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
        </button>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${chip}`}>
                {overdue ? <ShieldAlert className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-snug text-slate-900">
                  {overdue ? 'Laporan harus masuk grup WhatsApp' : 'Laporan web app harus sudah lengkap'}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {overdue
                    ? `Sudah lewat ${s.deadline}. Kirim rekap postingan ke grup WhatsApp sekarang.`
                    : `Post terakhir tayang ${s.lastPost}. Lengkapi data di web app sebelum deadline ${s.deadline}.`}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center text-slate-400">
              <button type="button" onClick={() => setMinimized(true)} title="Kecilkan" className="rounded-lg p-1.5 hover:bg-slate-100 cursor-pointer">
                <ChevronDown className="h-4 w-4" />
              </button>
              <button type="button" onClick={close} title="Tutup" className="rounded-lg p-1.5 hover:bg-slate-100 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <span>{overdue ? 'Sekarang' : `Menuju deadline ${s.deadline}`}</span>
            <span className={`rounded-md border px-2 py-0.5 font-mono font-semibold ${chip}`}>
              {overdue ? clock : `-${remaining}`}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                onNavigateToSosmed();
                setMinimized(true);
              }}
              className="flex flex-1 min-w-[150px] items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" />
              Buka laporan sosmed
            </button>
            {onCopyReport && (
              <button
                type="button"
                onClick={onCopyReport}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                Salin rekap
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
