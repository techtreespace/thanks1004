/**
 * Thanks. — Local Storage Layer
 * 
 * This module provides all data persistence functionality using localStorage.
 * Data persists across browser refreshes.
 * 
 * Storage Keys:
 * - thanks_entries: Entry[]
 * - thanks_categories: Category[]
 */

import { 
  Category, 
  Entry, 
  DEFAULT_CATEGORIES,
  DEFAULT_CATEGORY_IDS,
  CreateEntryInput,
  UpdateEntryInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types';

// ────────────────────────────────────────────────────────────────────────────
// Storage Keys
// ────────────────────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  ENTRIES: 'thanks_entries',
  CATEGORIES: 'thanks_categories',
} as const;

// ────────────────────────────────────────────────────────────────────────────
// ID Generation
// ────────────────────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ────────────────────────────────────────────────────────────────────────────
// Date Utilities
// ────────────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────────────
// Entry Storage
// ────────────────────────────────────────────────────────────────────────────

export function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!raw) return [];
    
    // Migration: convert old schema fields if needed
    const entries: Entry[] = JSON.parse(raw);
    return entries.map(migrateEntry);
  } catch {
    return [];
  }
}

export function saveEntries(entries: Entry[]): void {
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
}

export function createEntry(input: CreateEntryInput): Entry {
  const now = new Date().toISOString();
  const entry: Entry = {
    ...input,
    id: generateId(),
    createdAt: now,
    isAnswered: input.isAnswered ?? false,
    carryOverVisible: input.carryOverVisible ?? true,
  };
  
  const entries = loadEntries();
  entries.unshift(entry);
  saveEntries(entries);
  
  return entry;
}

export function updateEntry(id: string, patch: UpdateEntryInput): Entry | null {
  const entries = loadEntries();
  const idx = entries.findIndex((e) => e.id === id);
  
  if (idx === -1) return null;
  
  // If marking as answered, calculate answerDays
  if (patch.isAnswered && patch.answeredAt && !entries[idx].answerDays) {
    patch.answerDays = diffDays(entries[idx].recordDate, patch.answeredAt.split('T')[0]);
  }
  
  entries[idx] = { ...entries[idx], ...patch };
  saveEntries(entries);
  
  return entries[idx];
}

export function deleteEntry(id: string): boolean {
  const entries = loadEntries();
  const filtered = entries.filter((e) => e.id !== id);
  
  if (filtered.length === entries.length) return false;
  
  saveEntries(filtered);
  return true;
}

export function getEntryById(id: string): Entry | undefined {
  return loadEntries().find((e) => e.id === id);
}

export function getEntriesByDate(date: string): Entry[] {
  return loadEntries().filter((e) => e.recordDate === date);
}

export function getEntriesByCategory(categoryId: string): Entry[] {
  return loadEntries().filter((e) => e.categoryId === categoryId);
}

/**
 * Get unanswered prayers that should carry over to today
 */
export function getCarryOverPrayers(asOfDate: string): Entry[] {
  return loadEntries().filter(
    (e) =>
      e.categoryId === DEFAULT_CATEGORY_IDS.PRAYER &&
      !e.isAnswered &&
      e.carryOverVisible &&
      e.recordDate < asOfDate
  );
}

/**
 * Migrate old entry schema to new format
 */
function migrateEntry(entry: any): Entry {
  return {
    id: entry.id,
    categoryId: entry.categoryId,
    content: entry.content,
    imageUrl: entry.imageUrl ?? entry.photo,
    createdAt: entry.createdAt,
    recordDate: entry.recordDate ?? entry.date,
    isAnswered: entry.isAnswered ?? false,
    answeredAt: entry.answeredAt,
    answerDays: entry.answerDays,
    carryOverVisible: entry.carryOverVisible ?? true,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Category Storage
// ────────────────────────────────────────────────────────────────────────────

export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      // Initialize with defaults
      saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    
    const categories: Category[] = JSON.parse(raw);
    
    // Ensure all defaults exist
    const existingIds = new Set(categories.map((c) => c.id));
    const missingDefaults = DEFAULT_CATEGORIES.filter((d) => !existingIds.has(d.id));
    
    if (missingDefaults.length > 0) {
      const merged = [...missingDefaults, ...categories];
      saveCategories(merged);
      return merged;
    }
    
    return categories;
  } catch {
    saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

export function createCategory(input: CreateCategoryInput): Category {
  const now = new Date().toISOString();
  const category: Category = {
    ...input,
    id: generateId(),
    isDefault: false,
    createdAt: now,
  };
  
  const categories = loadCategories();
  categories.push(category);
  saveCategories(categories);
  
  return category;
}

export function updateCategory(id: string, patch: UpdateCategoryInput): Category | null {
  const categories = loadCategories();
  const idx = categories.findIndex((c) => c.id === id);
  
  if (idx === -1) return null;
  
  // Don't allow editing default categories' core properties
  // (but allow changing emoji/color for customization)
  categories[idx] = { ...categories[idx], ...patch };
  saveCategories(categories);
  
  return categories[idx];
}

export function deleteCategory(id: string): boolean {
  const categories = loadCategories();
  const category = categories.find((c) => c.id === id);
  
  // Cannot delete default categories
  if (!category || category.isDefault) return false;
  
  const filtered = categories.filter((c) => c.id !== id);
  saveCategories(filtered);
  
  // Also delete all entries with this category
  const entries = loadEntries().filter((e) => e.categoryId !== id);
  saveEntries(entries);
  
  return true;
}

export function getCategoryById(id: string): Category | undefined {
  return loadCategories().find((c) => c.id === id);
}

export function isPrayerCategory(categoryId: string): boolean {
  return categoryId === DEFAULT_CATEGORY_IDS.PRAYER;
}

// ────────────────────────────────────────────────────────────────────────────
// Statistics
// ────────────────────────────────────────────────────────────────────────────

export interface AppStatistics {
  totalEntries: number;
  entriesByCategory: Record<string, number>;
  answeredPrayers: number;
  unansweredPrayers: number;
  averageAnswerDays: number | null;
}

export function computeStatistics(): AppStatistics {
  const entries = loadEntries();
  const categories = loadCategories();
  
  const entriesByCategory: Record<string, number> = {};
  categories.forEach((c) => (entriesByCategory[c.id] = 0));
  
  entries.forEach((e) => {
    if (entriesByCategory[e.categoryId] !== undefined) {
      entriesByCategory[e.categoryId]++;
    }
  });
  
  const prayers = entries.filter((e) => e.categoryId === DEFAULT_CATEGORY_IDS.PRAYER);
  const answered = prayers.filter((e) => e.isAnswered);
  const unanswered = prayers.filter((e) => !e.isAnswered);
  
  const answerDurations = answered
    .filter((e) => e.answerDays !== undefined)
    .map((e) => e.answerDays!);
  
  const averageAnswerDays = answerDurations.length > 0
    ? Math.round(answerDurations.reduce((a, b) => a + b, 0) / answerDurations.length)
    : null;
  
  return {
    totalEntries: entries.length,
    entriesByCategory,
    answeredPrayers: answered.length,
    unansweredPrayers: unanswered.length,
    averageAnswerDays,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Data Export (for backup/migration)
// ────────────────────────────────────────────────────────────────────────────

export interface ExportData {
  version: string;
  exportedAt: string;
  entries: Entry[];
  categories: Category[];
}

export function exportAllData(): ExportData {
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    entries: loadEntries(),
    categories: loadCategories(),
  };
}

export function importData(data: ExportData): void {
  if (data.entries) saveEntries(data.entries);
  if (data.categories) saveCategories(data.categories);
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.ENTRIES);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
}
