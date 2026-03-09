import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Entry, Category, DEFAULT_CATEGORY_IDS } from '@/types';
import { getWeekDates, todayStr, addDays } from '@/lib/storage';
import { DayColumn } from './DayColumn';

interface WeeklyViewProps {
  entries: Entry[];
  categories: Category[];
  onDelete: (id: string) => void;
  onMarkAnswered: (id: string) => void;
}

export function WeeklyView({ entries, categories, onDelete, onMarkAnswered }: WeeklyViewProps) {
  const today = todayStr();
  const [weekStart, setWeekStart] = useState(() => {
    const dates = getWeekDates(today);
    return dates[0];
  });

  const dates = getWeekDates(weekStart);

  const prevWeek = () => setWeekStart(addDays(weekStart, -7));
  const nextWeek = () => setWeekStart(addDays(weekStart, 7));

  const entriesByDate = useMemo(() => {
    const m: Record<string, Entry[]> = {};
    entries.forEach((e) => {
      if (!m[e.recordDate]) m[e.recordDate] = [];
      m[e.recordDate].push(e);
    });
    return m;
  }, [entries]);

  // Unanswered prayers carry forward
  const getCarried = (dateStr: string) => {
    return entries.filter(
      (e) =>
        e.categoryId === DEFAULT_CATEGORY_IDS.PRAYER &&
        !e.isAnswered &&
        e.carryOverVisible &&
        e.recordDate < dateStr
    );
  };

  const start = new Date(dates[0]);
  const end = new Date(dates[6]);

  return (
    <div>
      {/* Week nav */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={prevWeek} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ChevronLeft size={18} className="text-muted-foreground" />
        </button>
        <p className="font-body text-sm text-muted-foreground">
          {start.getMonth() + 1}월 {start.getDate()}일 – {end.getMonth() + 1}월 {end.getDate()}일
        </p>
        <button onClick={nextWeek} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ChevronRight size={18} className="text-muted-foreground" />
        </button>
      </div>

      {dates.map((d) => (
        <DayColumn
          key={d}
          dateStr={d}
          entries={entriesByDate[d] ?? []}
          carriedPrayers={d === today ? getCarried(d) : []}
          categories={categories}
          onDelete={onDelete}
          onMarkAnswered={onMarkAnswered}
          isToday={d === today}
        />
      ))}
    </div>
  );
}
