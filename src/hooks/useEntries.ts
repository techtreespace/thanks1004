import { useState, useCallback } from 'react';
import { Entry } from '@/types';
import {
  loadEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  todayStr,
  diffDays,
} from '@/lib/storage';

export interface AddEntryData {
  categoryId: string;
  content: string;
  imageUrl?: string;
  recordDate?: string;
}

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>(() => loadEntries());

  const refresh = useCallback(() => {
    setEntries(loadEntries());
  }, []);

  const addEntry = useCallback((data: AddEntryData) => {
    const entry = createEntry({
      categoryId: data.categoryId,
      content: data.content,
      imageUrl: data.imageUrl,
      recordDate: data.recordDate ?? todayStr(),
      isAnswered: false,
      carryOverVisible: true,
    });
    setEntries(loadEntries());
    return entry;
  }, []);

  const editEntry = useCallback((id: string, patch: Partial<Entry>) => {
    updateEntry(id, patch);
    setEntries(loadEntries());
  }, []);

  const removeEntry = useCallback((id: string) => {
    deleteEntry(id);
    setEntries(loadEntries());
  }, []);

  const markPrayerAnswered = useCallback((id: string) => {
    const now = new Date().toISOString();
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    
    const answerDays = diffDays(entry.recordDate, now.split('T')[0]);
    updateEntry(id, { 
      isAnswered: true, 
      answeredAt: now,
      answerDays,
    });
    setEntries(loadEntries());
  }, [entries]);

  const hideCarryOver = useCallback((id: string) => {
    updateEntry(id, { carryOverVisible: false });
    setEntries(loadEntries());
  }, []);

  return { 
    entries, 
    addEntry, 
    updateEntry: editEntry, 
    deleteEntry: removeEntry, 
    markPrayerAnswered,
    hideCarryOver,
    refresh,
  };
}
