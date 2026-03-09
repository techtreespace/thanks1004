import { useState, useCallback } from 'react';
import { Entry } from '@/types';
import {
  loadEntries,
  addEntry as storageAdd,
  updateEntry as storageUpdate,
  deleteEntry as storageDelete,
  generateId,
  todayStr,
} from '@/lib/storage';

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>(() => loadEntries());

  const refresh = useCallback(() => {
    setEntries(loadEntries());
  }, []);

  const addEntry = useCallback(
    (data: Omit<Entry, 'id' | 'createdAt' | 'date'> & { date?: string }) => {
      const now = new Date().toISOString();
      const entry: Entry = {
        ...data,
        id: generateId(),
        createdAt: now,
        date: data.date ?? todayStr(),
      };
      storageAdd(entry);
      setEntries(loadEntries());
      return entry;
    },
    []
  );

  const updateEntry = useCallback((id: string, patch: Partial<Entry>) => {
    storageUpdate(id, patch);
    setEntries(loadEntries());
  }, []);

  const deleteEntry = useCallback((id: string) => {
    storageDelete(id);
    setEntries(loadEntries());
  }, []);

  const markPrayerAnswered = useCallback(
    (id: string) => {
      updateEntry(id, { isAnswered: true, answeredAt: new Date().toISOString() });
    },
    [updateEntry]
  );

  return { entries, addEntry, updateEntry, deleteEntry, markPrayerAnswered, refresh };
}
