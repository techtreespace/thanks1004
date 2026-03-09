import { motion } from 'framer-motion';
import { Trash2, CheckCircle2, Clock } from 'lucide-react';
import { Entry, Category } from '@/types';
import { CategoryBadge } from './CategoryBadge';
import { diffDays, todayStr } from '@/lib/storage';

interface EntryCardProps {
  entry: Entry;
  category: Category | undefined;
  onDelete: (id: string) => void;
  onMarkAnswered?: (id: string) => void;
  isCarried?: boolean; // faded prayer from previous day
  showDate?: boolean;
}

export function EntryCard({
  entry,
  category,
  onDelete,
  onMarkAnswered,
  isCarried = false,
  showDate = false,
}: EntryCardProps) {
  const isPrayer = category?.id === 'prayer';
  const daysPassed = entry.answeredAt
    ? diffDays(entry.date, entry.answeredAt.split('T')[0])
    : null;

  const timeStr = new Date(entry.createdAt).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isCarried ? 0.55 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative rounded-xl shadow-card overflow-hidden group ${isCarried ? 'entry-carried' : ''}`}
      style={{ background: 'var(--gradient-card)' }}
    >
      {/* Color accent bar */}
      {category && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
          style={{ backgroundColor: `hsl(${category.color})` }}
        />
      )}

      <div className="pl-4 pr-4 pt-4 pb-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {category && <CategoryBadge category={category} size="sm" />}
            {isPrayer && entry.isAnswered && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-body font-medium"
                style={{ backgroundColor: 'hsl(142 55% 45% / 0.12)', color: 'hsl(142 55% 38%)', border: '1px solid hsl(142 55% 45% / 0.25)' }}>
                <CheckCircle2 size={10} />
                응답됨
              </span>
            )}
            {isPrayer && !entry.isAnswered && isCarried && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-body"
                style={{ backgroundColor: 'hsl(40 30% 90%)', color: 'hsl(35 25% 48%)' }}>
                <Clock size={10} />
                이어짐
              </span>
            )}
          </div>
          <button
            onClick={() => onDelete(entry.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            aria-label="삭제"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Photo */}
        {entry.photo && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img src={entry.photo} alt="기록 사진" className="w-full max-h-52 object-cover" />
          </div>
        )}

        {/* Content */}
        <p className="text-sm leading-relaxed font-body text-foreground/90 whitespace-pre-wrap">
          {entry.content}
        </p>

        {/* Prayer answered info */}
        {isPrayer && entry.isAnswered && daysPassed !== null && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-body"
            style={{ color: 'hsl(142 55% 38%)' }}>
            <CheckCircle2 size={12} />
            <span>{daysPassed === 0 ? '같은 날 응답' : `${daysPassed}일 만에 응답됨`}</span>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-body">
            {showDate
              ? `${entry.date.slice(5).replace('-', '/')} ${timeStr}`
              : timeStr}
          </span>
          {/* Mark as answered button */}
          {isPrayer && !entry.isAnswered && onMarkAnswered && (
            <button
              onClick={() => onMarkAnswered(entry.id)}
              className="text-xs font-body font-medium px-3 py-1 rounded-full transition-all"
              style={{
                backgroundColor: 'hsl(220 60% 62% / 0.12)',
                color: 'hsl(220 60% 52%)',
                border: '1px solid hsl(220 60% 62% / 0.3)',
              }}
            >
              응답 표시
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
