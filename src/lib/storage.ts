import { Category, Entry, DEFAULT_CATEGORIES } from '@/types';

const ENTRIES_KEY = 'thanks_entries';
const CATEGORIES_KEY = 'thanks_categories';

// ── Entries ────────────────────────────────────────────────────────────────

export function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: Entry[]): void {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function addEntry(entry: Entry): void {
  const entries = loadEntries();
  entries.unshift(entry);
  saveEntries(entries);
}

export function updateEntry(id: string, patch: Partial<Entry>): void {
  const entries = loadEntries();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx !== -1) {
    entries[idx] = { ...entries[idx], ...patch };
    saveEntries(entries);
  }
}

export function deleteEntry(id: string): void {
  const entries = loadEntries().filter((e) => e.id !== id);
  saveEntries(entries);
}

// ── Categories ─────────────────────────────────────────────────────────────

export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(cats: Category[]): void {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
}

export function addCategory(cat: Category): void {
  const cats = loadCategories();
  cats.push(cat);
  saveCategories(cats);
}

export function deleteCategory(id: string): void {
  const cats = loadCategories().filter((c) => c.id !== id);
  saveCategories(cats);
}

// ── Date Helpers ──────────────────────────────────────────────────────────

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function todayStr(): string {
  return formatDate(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function diffDays(from: string, to: string): number {
  const a = new Date(from);
  const b = new Date(to);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getWeekDates(referenceDate: string): string[] {
  const ref = new Date(referenceDate);
  const day = ref.getDay(); // 0=Sun
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return formatDate(d);
  });
}

export function getMonthDates(yearMonth: string): string[] {
  const [year, month] = yearMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = String(i + 1).padStart(2, '0');
    return `${yearMonth}-${d}`;
  });
}

export function formatDisplayDate(dateStr: string): string {
  const today = todayStr();
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);

  if (dateStr === today) return '오늘';
  if (dateStr === yesterday) return '어제';
  if (dateStr === tomorrow) return '내일';

  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function formatKoreanDate(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}
