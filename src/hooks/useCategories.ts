import { useState, useCallback } from 'react';
import { Category, DEFAULT_CATEGORIES } from '@/types';
import {
  loadCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  saveCategories,
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
    const cat = createCategory({
      name,
      emoji,
      color: color ?? PRESET_COLORS[customCats.length % PRESET_COLORS.length],
    });
    setCategories(loadCategories());
    return cat;
  }, []);

  const editCategory = useCallback((id: string, patch: { name?: string; emoji?: string; color?: string }) => {
    const category = loadCategories().find((c) => c.id === id);
    if (!category || category.isDefault) return null; // Cannot edit default categories
    
    updateCategory(id, patch);
    setCategories(loadCategories());
  }, []);

  const removeCategory = useCallback((id: string) => {
    const category = loadCategories().find((c) => c.id === id);
    if (!category || category.isDefault) return false; // Cannot delete default categories
    
    deleteCategory(id);
    setCategories(loadCategories());
    return true;
  }, []);

  const resetToDefaults = useCallback(() => {
    saveCategories(DEFAULT_CATEGORIES);
    setCategories(DEFAULT_CATEGORIES);
  }, []);

  return {
    categories,
    addCategory,
    editCategory,
    deleteCategory: removeCategory,
    resetToDefaults,
    refresh,
    PRESET_COLORS,
    PRESET_EMOJIS,
  };
}
