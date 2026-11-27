export const ACCENTS = [
  { id: 'indigo', name: 'Bawaan', colors: ['#6366d1', '#7e5bc4', '#c0508a'] },
  { id: 'green', name: 'Hijau', colors: ['#2b805c', '#557d2d', '#25827f'] },
  { id: 'red', name: 'Merah', colors: ['#c8484d', '#b45a22', '#a0710e'] },
  { id: 'blue', name: 'Biru', colors: ['#3f74cc', '#2279b5', '#1d7f90'] },
] as const;

export type AccentId = (typeof ACCENTS)[number]['id'];

const KEY = 'likemonitor_accent_v1';

export function getAccent(): AccentId {
  try {
    const saved = localStorage.getItem(KEY);
    if (ACCENTS.some((a) => a.id === saved)) return saved as AccentId;
  } catch {
    // abaikan
  }
  return 'indigo';
}

export function setAccent(id: AccentId) {
  document.documentElement.dataset.accent = id;
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // abaikan
  }
}

export function applySavedAccent() {
  document.documentElement.dataset.accent = getAccent();
}
