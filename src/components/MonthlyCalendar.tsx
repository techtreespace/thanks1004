import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Entry, Category } from '@/types';
import { formatDate, getMonthDates, todayStr } from '@/lib/storage';
import { EntryCard } from './EntryCard';

interface MonthlyCalendarProps {
  entries: Entry[];
  categories: Category[];
  onDayClick: (dateStr: string) => void;
  onDelete: (id: string) => void;
  onMarkAnswered: (id: string) => void;
}

function getYearMonth(dateStr: string) {
  return dateStr.slice(0, 7);
}

export function MonthlyCalendar({
  entries,
  categories,
  onDayClick,
  onDelete,
  onMarkAnswered,
}: MonthlyCalendarProps) {
  const today = todayStr();
  const [yearMonth, setYearMonth] = useState(getYearMonth(today));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [year, month] = yearMonth.split('-').map(Number);

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1);
    setYearMonth(formatDate(d).slice(0, 7));
    setSelectedDate(null);
  };
  const nextMonth = () => {
    const d = new Date(year, month, 1);
    setYearMonth(formatDate(d).slice(0, 7));
    setSelectedDate(null);
  };

  const dates = getMonthDates(yearMonth);
  const firstDay = new Date(dates[0]).getDay(); // 0=Sun

  // Build entry map for the month
  const entryMap = useMemo(() => {
    const m: Record<string, Entry[]> = {};
    entries.forEach((e) => {
      if (!m[e.recordDate]) m[e.recordDate] = [];
      m[e.recordDate].push(e);
    });
    return m;
  }, [entries]);

  // Month-level stats for the legend
  const monthStats = useMemo(() => {
    const counts: Record<string, number> = {};
    dates.forEach((d) => {
      (entryMap[d] ?? []).forEach((e) => {
        counts[e.categoryId] = (counts[e.categoryId] ?? 0) + 1;
      });
    });
    return counts;
  }, [dates, entryMap]);

  const activeCategories = categories.filter((c) => (monthStats[c.id] ?? 0) > 0);

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr));
    onDayClick(dateStr);
  };

  const selectedEntries = selectedDate ? (entryMap[selectedDate] ?? []) : [];

  const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="space-y-4">
      {/* Calendar card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'hsl(var(--card))', boxShadow: 'var(--shadow-card)' }}
      >
        {/* Month nav */}
        <div className="flex items-center justify-between px-4 py-3.5">
          <button
            onClick={prevMonth}
            className="p-2 -ml-1 rounded-xl active:scale-90 transition-transform"
          >
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <h3 className="font-display text-[15px] font-medium text-foreground">
            {year}년 {month}월
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 -mr-1 rounded-xl active:scale-90 transition-transform"
          >
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 px-2">
          {DAY_LABELS.map((d, i) => (
            <div
              key={d}
              className="py-1.5 text-center text-[11px] font-body font-medium"
              style={{
                color:
                  i === 0
                    ? 'hsl(0 50% 55%)'
                    : i === 6
                      ? 'hsl(220 55% 55%)'
                      : 'hsl(var(--muted-foreground))',
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 px-1.5 pb-2">
          {/* Empty leading cells */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {dates.map((dateStr) => {
            const day = new Date(dateStr).getDate();
            const dayOfWeek = new Date(dateStr).getDay();
            const dayEntries = entryMap[dateStr] ?? [];
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const hasEntries = dayEntries.length > 0;
            const isFuture = dateStr > today;

            // Group entries by category, count per category
            const catCounts: { catId: string; count: number }[] = [];
            const seen = new Set<string>();
            dayEntries.forEach((e) => {
              if (!seen.has(e.categoryId)) {
                seen.add(e.categoryId);
                catCounts.push({
                  catId: e.categoryId,
                  count: dayEntries.filter((x) => x.categoryId === e.categoryId).length,
                });
              }
            });

            // Show individual dots for each entry (max 6)
            const dots = dayEntries.slice(0, 6).map((e) => {
              const cat = categories.find((c) => c.id === e.categoryId);
              return cat ? cat.color : 'var(--muted-foreground)';
            });

            return (
              <button
                key={dateStr}
                onClick={() => handleDateSelect(dateStr)}
                className="relative flex flex-col items-center justify-start rounded-xl transition-all active:scale-90 py-1"
                style={{
                  aspectRatio: '1',
                  backgroundColor: isSelected
                    ? 'hsl(var(--primary) / 0.08)'
                    : 'transparent',
                  opacity: isFuture ? 0.4 : 1,
                }}
              >
                {/* Day number */}
                <span
                  className="text-[13px] font-body font-medium w-7 h-7 flex items-center justify-center rounded-full transition-all"
                  style={{
                    backgroundColor: isToday
                      ? 'hsl(var(--primary))'
                      : isSelected
                        ? 'hsl(var(--primary) / 0.15)'
                        : 'transparent',
                    color: isToday
                      ? 'hsl(var(--primary-foreground))'
                      : isSelected
                        ? 'hsl(var(--primary))'
                        : dayOfWeek === 0
                          ? 'hsl(0 40% 52%)'
                          : dayOfWeek === 6
                            ? 'hsl(220 45% 52%)'
                            : hasEntries
                              ? 'hsl(var(--foreground))'
                              : 'hsl(var(--muted-foreground) / 0.6)',
                    fontWeight: hasEntries ? 600 : 400,
                  }}
                >
                  {day}
                </span>

                {/* Color dots grid */}
                {dots.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-[2px] mt-0.5 max-w-[22px]">
                    {dots.map((color, i) => (
                      <span
                        key={i}
                        className="w-[5px] h-[5px] rounded-full"
                        style={{ backgroundColor: `hsl(${color})` }}
                      />
                    ))}
                  </div>
                )}

                {/* Emotional intensity ring for many entries */}
                {dayEntries.length >= 3 && !isToday && (
                  <div
                    className="absolute inset-0.5 rounded-xl pointer-events-none"
                    style={{
                      border: `1.5px solid hsl(${catCounts[0] ? categories.find((c) => c.id === catCounts[0].catId)?.color ?? 'var(--border)' : 'var(--border)'} / 0.25)`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Category legend */}
        {activeCategories.length > 0 && (
          <div
            className="px-4 py-3 flex flex-wrap gap-x-4 gap-y-1.5"
            style={{ borderTop: '1px solid hsl(var(--border) / 0.5)' }}
          >
            {activeCategories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: `hsl(${cat.color})` }}
                />
                <span className="text-[11px] font-body text-muted-foreground">
                  {cat.emoji} {cat.name}
                  <span className="ml-1 font-medium text-foreground/70">
                    {monthStats[cat.id]}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected day entries */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Date header */}
            <div className="flex items-center gap-2 mb-3 px-0.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    selectedDate === today
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted-foreground) / 0.4)',
                }}
              />
              <h3 className="font-display text-[15px] font-medium text-foreground">
                {new Date(selectedDate).toLocaleDateString('ko-KR', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </h3>
              <span className="ml-auto text-[11px] font-body text-muted-foreground">
                {selectedEntries.length > 0 ? `${selectedEntries.length}개` : ''}
              </span>
            </div>

            {selectedEntries.length > 0 ? (
              <div className="space-y-0">
                {selectedEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    category={categories.find((c) => c.id === entry.categoryId)}
                    onDelete={onDelete}
                    onMarkAnswered={onMarkAnswered}
                  />
                ))}
              </div>
            ) : (
              <div
                className="rounded-2xl py-10 text-center border border-dashed"
                style={{ borderColor: 'hsl(var(--border) / 0.6)' }}
              >
                <p className="text-sm text-muted-foreground/60 font-body">이 날의 기록이 없어요</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
