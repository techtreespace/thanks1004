export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string; // hsl string
  isDefault: boolean;
}

export interface Entry {
  id: string;
  categoryId: string;
  content: string;
  photo?: string; // base64 data URL
  createdAt: string; // ISO datetime
  date: string; // YYYY-MM-DD (the "journal date" this entry belongs to)
  // Prayer-specific
  isAnswered?: boolean;
  answeredAt?: string; // ISO datetime
}

export type ViewMode = 'today' | 'yesterday-today' | 'today-tomorrow' | 'weekly' | 'monthly' | 'stats';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'gratitude',
    name: '감사',
    emoji: '🌿',
    color: '34 80% 52%',
    isDefault: true,
  },
  {
    id: 'prayer',
    name: '기도',
    emoji: '🕊️',
    color: '220 60% 62%',
    isDefault: true,
  },
  {
    id: 'sadness',
    name: '슬픔',
    emoji: '🌧️',
    color: '210 30% 55%',
    isDefault: true,
  },
  {
    id: 'joy',
    name: '기쁨',
    emoji: '✨',
    color: '42 90% 52%',
    isDefault: true,
  },
];
