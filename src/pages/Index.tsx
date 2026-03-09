import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { ViewMode } from '@/types';
import { useEntries } from '@/hooks/useEntries';
import { useCategories } from '@/hooks/useCategories';
import { todayStr, addDays } from '@/lib/storage';

import { ViewSelector } from '@/components/ViewSelector';
import { DayColumn } from '@/components/DayColumn';
import { WeeklyView } from '@/components/WeeklyView';
import { MonthlyCalendar } from '@/components/MonthlyCalendar';
import { StatsView } from '@/components/StatsView';
import { AddEntryModal } from '@/components/AddEntryModal';
import { AddCategoryModal } from '@/components/AddCategoryModal';
import { EntryCard } from '@/components/EntryCard';

const Index = () => {
  const { entries, addEntry, deleteEntry, markPrayerAnswered } = useEntries();
  const { categories, addCategory, PRESET_COLORS, PRESET_EMOJIS } = useCategories();

  const [view, setView] = useState<ViewMode>('today');
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const today = todayStr();
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);

  const entriesByDate = useMemo(() => {
    const m: Record<string, typeof entries> = {};
    entries.forEach((e) => {
      if (!m[e.date]) m[e.date] = [];
      m[e.date].push(e);
    });
    return m;
  }, [entries]);

  // Unanswered prayers from past days carry to today
  const carriedPrayers = useMemo(
    () =>
      entries.filter(
        (e) => e.categoryId === 'prayer' && !e.isAnswered && e.date < today
      ),
    [entries, today]
  );

  const handleAddEntry = (data: Parameters<typeof addEntry>[0]) => {
    addEntry({ ...data, date: selectedDay ?? data.date ?? today });
    setSelectedDay(null);
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDay(dateStr);
    setShowAddEntry(true);
  };

  const renderView = () => {
    switch (view) {
      case 'today':
        return (
          <DayColumn
            dateStr={today}
            entries={entriesByDate[today] ?? []}
            carriedPrayers={carriedPrayers}
            categories={categories}
            onDelete={deleteEntry}
            onMarkAnswered={markPrayerAnswered}
            isToday
          />
        );

      case 'yesterday-today':
        return (
          <>
            <DayColumn
              dateStr={yesterday}
              entries={entriesByDate[yesterday] ?? []}
              carriedPrayers={[]}
              categories={categories}
              onDelete={deleteEntry}
              onMarkAnswered={markPrayerAnswered}
            />
            <DayColumn
              dateStr={today}
              entries={entriesByDate[today] ?? []}
              carriedPrayers={carriedPrayers}
              categories={categories}
              onDelete={deleteEntry}
              onMarkAnswered={markPrayerAnswered}
              isToday
            />
          </>
        );

      case 'today-tomorrow':
        return (
          <>
            <DayColumn
              dateStr={today}
              entries={entriesByDate[today] ?? []}
              carriedPrayers={carriedPrayers}
              categories={categories}
              onDelete={deleteEntry}
              onMarkAnswered={markPrayerAnswered}
              isToday
            />
            <DayColumn
              dateStr={tomorrow}
              entries={entriesByDate[tomorrow] ?? []}
              carriedPrayers={[]}
              categories={categories}
              onDelete={deleteEntry}
              onMarkAnswered={markPrayerAnswered}
            />
          </>
        );

      case 'weekly':
        return (
          <WeeklyView
            entries={entries}
            categories={categories}
            onDelete={deleteEntry}
            onMarkAnswered={markPrayerAnswered}
          />
        );

      case 'monthly':
        return (
          <div className="space-y-6">
            <MonthlyCalendar
              entries={entries}
              categories={categories}
              onDayClick={handleDayClick}
            />
            {/* Show entries for clicked day */}
            {selectedDay && (
              <div className="mt-4">
                <h3 className="font-display text-base font-medium text-foreground mb-3">
                  {new Date(selectedDay).toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </h3>
                <AnimatePresence mode="popLayout">
                  {(entriesByDate[selectedDay] ?? []).length > 0 ? (
                    (entriesByDate[selectedDay] ?? []).map((entry) => (
                      <motion.div key={entry.id} className="mb-2">
                        <EntryCard
                          entry={entry}
                          category={categories.find((c) => c.id === entry.categoryId)}
                          onDelete={deleteEntry}
                          onMarkAnswered={markPrayerAnswered}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground font-body">
                      이 날의 기록이 없습니다
                    </p>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        );

      case 'stats':
        return <StatsView entries={entries} categories={categories} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen gradient-hero font-body" style={{ background: 'var(--gradient-warm)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-lg py-4 px-4" style={{ backgroundColor: 'hsl(var(--background) / 0.8)' }}>
        <div className="max-w-lg mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-2xl font-medium text-foreground mb-4"
          >
            Thanks.
          </motion.h1>
          <ViewSelector view={view} onChange={setView} />
        </div>
      </header>

      {/* Content */}
      <main className="px-4 pb-28 pt-2">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.3 }}
        onClick={() => {
          setSelectedDay(null);
          setShowAddEntry(true);
        }}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full flex items-center justify-center shadow-float transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: 'hsl(var(--primary))' }}
        aria-label="새 기록 추가"
      >
        <Plus size={26} className="text-primary-foreground" />
      </motion.button>

      {/* Modals */}
      <AddEntryModal
        open={showAddEntry}
        onClose={() => {
          setShowAddEntry(false);
          setSelectedDay(null);
        }}
        categories={categories}
        onSubmit={handleAddEntry}
        defaultDate={selectedDay ?? today}
        onAddCategory={() => {
          setShowAddEntry(false);
          setShowAddCategory(true);
        }}
      />

      <AddCategoryModal
        open={showAddCategory}
        onClose={() => {
          setShowAddCategory(false);
          setShowAddEntry(true);
        }}
        onSubmit={addCategory}
        presetEmojis={PRESET_EMOJIS}
        presetColors={PRESET_COLORS}
      />
    </div>
  );
};

export default Index;
