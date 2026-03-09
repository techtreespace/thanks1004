import { useState, useCallback } from 'react';
import { Category, DEFAULT_CATEGORIES } from '@/types';
import {
  loadCategories,
  addCategory as storageAdd,
  deleteCategory as storageDelete,
  saveCategories,
  generateId,
} from '@/lib/storage';

const PRESET_COLORS = [
  '168 55% 45%',
  '280 55% 58%',
  '12 80% 55%',
  '198 70% 48%',
  '340 65% 55%',
  '55 85% 48%',
  '160 60% 42%',
  '270 50% 62%',
];

const PRESET_EMOJIS = ['🌸', '🌈', '🍀', '💫', '🌙', '🔥', '🌊', '🎵', '💌', '🦋', '🌻', '⭐'];

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());

  const refresh = useCallback(() => {
    setCategories(loadCategories());
  }, []);

  const addCategory = useCallback((name: string, emoji: string, color?: string) => {
    const customCats = loadCategories().filter((c) => !c.isDefault);
    const cat: Category = {
      id: generateId(),
      name,
      emoji,
      color: color ?? PRESET_COLORS[customCats.length % PRESET_COLORS.length],
      isDefault: false,
    };
    storageAdd(cat);
    setCategories(loadCategories());
    return cat;
  }, []);

  const deleteCategory = useCallback((id: string) => {
    const cats = loadCategories().find((c) => c.id === id);
    if (cats?.isDefault) return; // cannot delete defaults
    storageDelete(id);
    setCategories(loadCategories());
  }, []);

  const resetToDefaults = useCallback(() => {
    saveCategories(DEFAULT_CATEGORIES);
    setCategories(DEFAULT_CATEGORIES);
  }, []);

  return {
    categories,
    addCategory,
    deleteCategory,
    resetToDefaults,
    refresh,
    PRESET_COLORS,
    PRESET_EMOJIS,
  };
}
