import { useSyncExternalStore } from 'react';

export interface MilestoneSettings {
  enabled: boolean;
  lastPost: string; // jam post terakhir tayang (HH:MM)
  reminder: string; // jam pengingat laporan web app (HH:MM)
  deadline: string; // jam deadline laporan masuk grup WA (HH:MM)
}

export const DEFAULT_MILESTONE: MilestoneSettings = {
  enabled: true,
  lastPost: '15:30',
  reminder: '15:40',
  deadline: '16:15',
};

const KEY = 'likemonitor_milestone_v1';
const listeners = new Set<() => void>();

function load(): MilestoneSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_MILESTONE, ...JSON.parse(raw) };
  } catch {
    // abaikan
  }
  return DEFAULT_MILESTONE;
}

let current = load();

export function saveMilestone(patch: Partial<MilestoneSettings>) {
  current = { ...current, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // abaikan
  }
  listeners.forEach((l) => l());
}

export function useMilestoneSettings(): MilestoneSettings {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
  );
}

export function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
