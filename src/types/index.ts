/**
 * Thanks. — Local Data Schema
 * 
 * This file defines all TypeScript interfaces for the app's data model.
 * All data is stored locally using localStorage.
 */

// ────────────────────────────────────────────────────────────────────────────
// Entry
// ────────────────────────────────────────────────────────────────────────────

export interface Entry {
  /** Unique identifier (timestamp + random string) */
  id: string;
  
  /** Category ID this entry belongs to */
  categoryId: string;
  
  /** Text content of the entry */
  content: string;
  
  /** Optional image as base64 data URL (local storage) */
  imageUrl?: string;
  
  /** ISO datetime when the entry was created */
  createdAt: string;
  
  /** Date this entry is recorded for (YYYY-MM-DD format) */
  recordDate: string;
  
  /** Whether this prayer has been answered (only applicable for prayer category) */
  isAnswered: boolean;
  
  /** ISO datetime when the prayer was answered */
  answeredAt?: string;
  
  /** Number of days between creation and answer (computed and stored) */
  answerDays?: number;
  
  /** Whether this entry should appear in carry-over view (for unanswered prayers) */
  carryOverVisible: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// Category
// ────────────────────────────────────────────────────────────────────────────

export interface Category {
  /** Unique identifier */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Emoji icon for the category */
  emoji: string;
  
  /** HSL color string (e.g., "34 80% 52%") */
  color: string;
  
  /** Whether this is a system default category (cannot be deleted) */
  isDefault: boolean;
  
  /** ISO datetime when the category was created */
  createdAt: string;
}

// ────────────────────────────────────────────────────────────────────────────
// View Mode
// ────────────────────────────────────────────────────────────────────────────

export type ViewMode = 
  | 'today' 
  | 'yesterday-today' 
  | 'today-tomorrow' 
  | 'weekly' 
  | 'monthly' 
  | 'stats';

// ────────────────────────────────────────────────────────────────────────────
// Default Categories
// ────────────────────────────────────────────────────────────────────────────

export const DEFAULT_CATEGORY_IDS = {
  GRATITUDE: 'gratitude',
  PRAYER: 'prayer',
  SADNESS: 'sadness',
  JOY: 'joy',
} as const;

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: DEFAULT_CATEGORY_IDS.GRATITUDE,
    name: '감사',
    emoji: '🌿',
    color: '34 80% 52%',
    isDefault: true,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: DEFAULT_CATEGORY_IDS.PRAYER,
    name: '기도',
    emoji: '🕊️',
    color: '220 60% 62%',
    isDefault: true,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: DEFAULT_CATEGORY_IDS.SADNESS,
    name: '슬픔',
    emoji: '🌧️',
    color: '210 30% 55%',
    isDefault: true,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: DEFAULT_CATEGORY_IDS.JOY,
    name: '기쁨',
    emoji: '✨',
    color: '42 90% 52%',
    isDefault: true,
    createdAt: new Date(0).toISOString(),
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Utility Types
// ────────────────────────────────────────────────────────────────────────────

export type CreateEntryInput = Omit<Entry, 'id' | 'createdAt' | 'answerDays'>;

export type UpdateEntryInput = Partial<Omit<Entry, 'id' | 'createdAt'>>;

export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt' | 'isDefault'>;

export type UpdateCategoryInput = Partial<Pick<Category, 'name' | 'emoji' | 'color'>>;
