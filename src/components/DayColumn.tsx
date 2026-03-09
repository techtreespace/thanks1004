import { AnimatePresence, motion } from 'framer-motion';
import { Entry, Category } from '@/types';
import { EntryCard } from './EntryCard';
import { formatDisplayDate } from '@/lib/storage';
import { Feather } from 'lucide-react';

interface DayColumnProps {
  dateStr: string;
  entries: Entry[];
  carriedPrayers: Entry[];
  categories: Category[];
  onDelete: (id: string) => void;
  onMarkAnswered: (id: string) => void;
  isToday?: boolean;
}

export function DayColumn({
  dateStr,
  entries,
  carriedPrayers,
  categories,
  onDelete,
  onMarkAnswered,
  isToday = false,
}: DayColumnProps) {
  const getCat = (id: string) => categories.find((c) => c.id === id);
  const totalCount = entries.length + carriedPrayers.length;

  return (
    <div className="mb-6">
      {/* Date header */}
      <div className="flex items-center gap-2.5 mb-3 px-0.5">
        {isToday && (
          <span
            className="w-2 h-2 rounded-full shrink-0 animate-pulse"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          />
        )}
        <h2
          className={`font-display text-[15px] font-medium tracking-wide ${isToday ? 'text-foreground' : 'text-muted-foreground'}`}
        >
          {formatDisplayDate(dateStr)}
        </h2>
        <span className="text-[11px] text-muted-foreground/70 font-body">
          {new Date(dateStr).toLocaleDateString('ko-KR', { weekday: 'short' })}
        </span>
        {totalCount > 0 && (
          <span
            className="ml-auto text-[11px] font-body font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'hsl(var(--primary) / 0.08)',
              color: 'hsl(var(--primary))',
            }}
          >
            {totalCount}
          </span>
        )}
      </div>

      {/* Carried prayers (faded) */}
      {carriedPrayers.length > 0 && (
        <div className="mb-1">
          {carriedPrayers.map((e) => (
            <EntryCard
              key={`carried-${e.id}`}
              entry={e}
              category={getCat(e.categoryId)}
              onDelete={() => {}}
              onMarkAnswered={onMarkAnswered}
              isCarried
            />
          ))}
        </div>
      )}

      {/* Regular entries */}
      <AnimatePresence mode="popLayout">
        {entries.length === 0 && carriedPrayers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-dashed py-10 text-center"
            style={{ borderColor: 'hsl(var(--border) / 0.8)' }}
          >
            <Feather size={24} className="mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground/60 font-body">아직 기록이 없어요</p>
            <p className="text-xs text-muted-foreground/40 font-body mt-1">+ 버튼을 눌러 시작하세요</p>
          </motion.div>
        ) : (
          entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              category={getCat(entry.categoryId)}
              onDelete={onDelete}
              onMarkAnswered={onMarkAnswered}
            />
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
