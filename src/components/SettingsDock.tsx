import { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { ACCENTS, AccentId, getAccent, setAccent } from '../lib/appearance';
import { saveMilestone, toMinutes, useMilestoneSettings } from '../lib/milestoneSettings';

const TIME_FIELDS = [
  { key: 'lastPost', label: 'Post terakhir tayang' },
  { key: 'reminder', label: 'Pengingat laporan web app' },
  { key: 'deadline', label: 'Deadline laporan ke grup WA' },
] as const;

export function SettingsDock() {
  const [open, setOpen] = useState(false);
  const [accent, setAccentState] = useState<AccentId>(getAccent);
  const s = useMilestoneSettings();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const pick = (id: AccentId) => {
    setAccent(id);
    setAccentState(id);
  };

  const tryPhase = (phase: 'reminder' | 'overdue') => {
    window.dispatchEvent(new CustomEvent('milestone-preview', { detail: phase }));
    setOpen(false);
  };

  const invalid = toMinutes(s.reminder) >= toMinutes(s.deadline);

  return (
    <div ref={ref} className="relative">
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-[300px] rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
          <p className="text-xs font-semibold text-slate-900">Warna tampilan</p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => pick(a.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2 text-[11px] font-medium cursor-pointer ${
                  accent === a.id ? 'border-slate-400 bg-slate-50 text-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex">
                  {a.colors.map((c, i) => (
                    <span key={c} className={`h-3.5 w-3.5 rounded-full border border-white ${i ? '-ml-1' : ''}`} style={{ background: c }} />
                  ))}
                </span>
                {a.name}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-900">Pengingat laporan</p>
            <button
              type="button"
              role="switch"
              aria-checked={s.enabled}
              onClick={() => saveMilestone({ enabled: !s.enabled })}
              className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer ${s.enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${s.enabled ? 'left-[18px]' : 'left-0.5'}`} />
            </button>
          </div>

          <div className={`mt-2 space-y-2 ${s.enabled ? '' : 'opacity-50 pointer-events-none'}`}>
            {TIME_FIELDS.map((f) => (
              <label key={f.key} className="flex items-center justify-between gap-3 text-xs text-slate-600">
                {f.label}
                <input
                  type="time"
                  value={s[f.key]}
                  onChange={(e) => e.target.value && saveMilestone({ [f.key]: e.target.value })}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-900"
                />
              </label>
            ))}
            {invalid && <p className="text-[11px] text-rose-700">Jam pengingat harus lebih awal dari deadline.</p>}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => tryPhase('reminder')} className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                Coba pengingat
              </button>
              <button type="button" onClick={() => tryPhase('overdue')} className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                Coba deadline
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-md cursor-pointer hover:scale-105 transition-transform"
        title="Warna tampilan & jam pengingat"
      >
        <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-600" />
        <span className="hidden sm:inline">Pengaturan</span>
      </button>
    </div>
  );
}
