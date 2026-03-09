import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Entry, Category } from '@/types';
import { formatDate, getMonthDates, todayStr } from '@/lib/storage';

interface MonthlyCalendarProps {
  entries: Entry[];
  categories: Category[];
  onDayClick: (dateStr: string) => void;
}

function getYearMonth(dateStr: string) {
  return dateStr.slice(0, 7);
}

export function MonthlyCalendar({ entries, categories, onDayClick }: MonthlyCalendarProps) {
  const today = todayStr();
  const [yearMonth, setYearMonth] = useState(getYearMonth(today));

  const [year, month] = yearMonth.split('-').map(Number);

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1);
    setYearMonth(formatDate(d).slice(0, 7));
  };
  const nextMonth = () => {
    const d = new Date(year, month, 1);
    setYearMonth(formatDate(d).slice(0, 7));
  };

  const dates = getMonthDates(yearMonth);
  const firstDay = new Date(dates[0]).getDay(); // 0=Sun

  const entryMap = useMemo(() => {
    const m: Record<string, Entry[]> = {};
    entries.forEach((e) => {
      if (!m[e.date]) m[e.date] = [];
      m[e.date].push(e);
    });
    return m;
  }, [entries]);

  const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="rounded-2xl shadow-card overflow-hidden" style={{ backgroundColor: 'hsl(var(--card))' }}>
      {/* Month nav */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ChevronLeft size={18} className="text-muted-foreground" />
        </button>
        <h3 className="font-display text-base font-medium text-foreground">
          {year}년 {month}월
        </h3>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ChevronRight size={18} className="text-muted-foreground" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-border">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-body text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px p-2">
        {/* Empty cells */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {dates.map((dateStr) => {
          const day = new Date(dateStr).getDate();
          const dayEntries = entryMap[dateStr] ?? [];
          const isToday = dateStr === today;
          const hasEntries = dayEntries.length > 0;

          // Get unique category dots (max 3)
          const catDots = [
            ...new Set(dayEntries.map((e) => e.categoryId)),
          ].slice(0, 3);

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className="flex flex-col items-center py-2 px-1 rounded-xl transition-colors hover:bg-muted/60 min-h-[52px]"
            >
              <span
                className={`text-sm font-body font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors ${isToday ? 'text-primary-foreground' : hasEntries ? 'text-foreground' : 'text-muted-foreground'}`}
                style={isToday ? { backgroundColor: 'hsl(var(--primary))' } : {}}
              >
                {day}
              </span>
              {catDots.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {catDots.map((catId) => {
                    const cat = categories.find((c) => c.id === catId);
                    return cat ? (
                      <span
                        key={catId}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: `hsl(${cat.color})` }}
                      />
                    ) : null;
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
