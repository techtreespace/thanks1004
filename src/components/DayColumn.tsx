import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { Entry, Category } from '@/types';
import { EntryCard } from './EntryCard';
import { formatKoreanDate, formatDisplayDate, todayStr, addDays } from '@/lib/storage';

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

  return (
    <div className="mb-8">
      {/* Date header */}
      <div className="flex items-center gap-2 mb-3">
        {isToday && (
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'hsl(var(--primary))' }} />
        )}
        <h2
          className={`font-display text-base font-medium ${isToday ? 'text-foreground' : 'text-muted-foreground'}`}
        >
          {formatDisplayDate(dateStr)}
        </h2>
        <span className="text-xs text-muted-foreground font-body">
          {new Date(dateStr).toLocaleDateString('ko-KR', { weekday: 'short' })}
        </span>
        {entries.length > 0 && (
          <span className="ml-auto text-xs font-body text-muted-foreground">{entries.length}개</span>
        )}
      </div>

      {/* Carried prayers (faded) */}
      {carriedPrayers.length > 0 && (
        <div className="mb-2">
          {carriedPrayers.map((e) => (
            <div key={`carried-${e.id}`} className="mb-2">
              <EntryCard
                entry={e}
                category={getCat(e.categoryId)}
                onDelete={() => {}}
                onMarkAnswered={onMarkAnswered}
                isCarried
              />
            </div>
          ))}
        </div>
      )}

      {/* Regular entries */}
      <AnimatePresence mode="popLayout">
        {entries.length === 0 && carriedPrayers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-dashed border-border p-6 text-center"
          >
            <p className="text-sm text-muted-foreground font-body">아직 기록이 없어요</p>
          </motion.div>
        ) : (
          entries.map((entry) => (
            <motion.div key={entry.id} className="mb-2">
              <EntryCard
                entry={entry}
                category={getCat(entry.categoryId)}
                onDelete={onDelete}
                onMarkAnswered={onMarkAnswered}
              />
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
