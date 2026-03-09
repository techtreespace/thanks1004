import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { ViewMode, DEFAULT_CATEGORY_IDS } from '@/types';
import { useEntries, AddEntryData } from '@/hooks/useEntries';
import { useCategories } from '@/hooks/useCategories';
import { todayStr, addDays, formatKoreanDate } from '@/lib/storage';

import { ViewSelector } from '@/components/ViewSelector';
import { DayColumn } from '@/components/DayColumn';
import { WeeklyView } from '@/components/WeeklyView';
import { MonthlyCalendar } from '@/components/MonthlyCalendar';
import { StatsView } from '@/components/StatsView';
import { AddEntryModal } from '@/components/AddEntryModal';
import { AddCategoryModal } from '@/components/AddCategoryModal';
import { EntryCard } from '@/components/EntryCard';
import { InstallPrompt } from '@/components/InstallPrompt';

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
      if (!m[e.recordDate]) m[e.recordDate] = [];
      m[e.recordDate].push(e);
    });
    return m;
  }, [entries]);

  const carriedPrayers = useMemo(
    () =>
      entries.filter(
        (e) =>
          e.categoryId === DEFAULT_CATEGORY_IDS.PRAYER &&
          !e.isAnswered &&
          e.carryOverVisible &&
          e.recordDate < today
      ),
    [entries, today]
  );

  const handleAddEntry = (data: AddEntryData) => {
    addEntry({
      ...data,
      recordDate: selectedDay ?? data.recordDate ?? today,
    });
    setSelectedDay(null);
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDay(dateStr);
    setShowAddEntry(true);
  };

  // Today's greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 6 ? '고요한 밤' : hour < 12 ? '좋은 아침' : hour < 18 ? '따뜻한 오후' : '편안한 저녁';

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
            {selectedDay && (
              <div className="mt-4">
                <h3 className="font-display text-[15px] font-medium text-foreground mb-3">
                  {new Date(selectedDay).toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </h3>
                <AnimatePresence mode="popLayout">
                  {(entriesByDate[selectedDay] ?? []).length > 0 ? (
                    (entriesByDate[selectedDay] ?? []).map((entry) => (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        category={categories.find((c) => c.id === entry.categoryId)}
                        onDelete={deleteEntry}
                        onMarkAnswered={markPrayerAnswered}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground font-body py-6 text-center">
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
    <div className="min-h-screen font-body" style={{ background: 'var(--gradient-warm)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 pt-3 pb-3 px-4"
        style={{
          backgroundColor: 'hsl(var(--background) / 0.85)',
          backdropFilter: 'blur(16px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.5)',
        }}
      >
        <div className="max-w-lg mx-auto">
          {/* Top row */}
          <div className="flex items-baseline justify-between mb-3">
            <motion.h1
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-[22px] font-medium text-foreground"
            >
              Thanks.
            </motion.h1>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-[12px] font-body text-muted-foreground/70"
            >
              {greeting} ✦
            </motion.span>
          </div>
          <ViewSelector view={view} onChange={setView} />
        </div>
      </header>

      {/* Content */}
      <main className="px-4 pb-28 pt-4">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* FAB */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
        <div className="max-w-lg mx-auto flex justify-end p-5">
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.4 }}
            onClick={() => {
              setSelectedDay(null);
              setShowAddEntry(true);
            }}
            className="pointer-events-auto w-14 h-14 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'hsl(var(--primary))',
              boxShadow: 'var(--shadow-float)',
            }}
            aria-label="새 기록 추가"
          >
            <Plus size={24} className="text-primary-foreground" strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>

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

      <InstallPrompt />
    </div>
  );
};

export default Index;
