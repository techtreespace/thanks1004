import { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Trash2, CheckCircle2, Clock, Heart } from 'lucide-react';
import { Entry, Category, DEFAULT_CATEGORY_IDS } from '@/types';
import { CategoryBadge } from './CategoryBadge';

interface EntryCardProps {
  entry: Entry;
  category: Category | undefined;
  onDelete: (id: string) => void;
  onMarkAnswered?: (id: string) => void;
  isCarried?: boolean;
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
  const isPrayer = category?.id === DEFAULT_CATEGORY_IDS.PRAYER;
  const [swiped, setSwiped] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const timeStr = new Date(entry.createdAt).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -80) {
      setSwiped(true);
    } else {
      setSwiped(false);
    }
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(entry.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -200, transition: { duration: 0.25 } }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative overflow-hidden rounded-2xl mb-3"
    >
      {/* Delete action behind card */}
      <div
        className="absolute inset-0 flex items-center justify-end px-5 rounded-2xl"
        style={{ backgroundColor: 'hsl(var(--destructive) / 0.9)' }}
      >
        <button onClick={handleDelete} className="flex items-center gap-1.5 text-sm font-body font-medium" style={{ color: 'hsl(0 0% 100%)' }}>
          <Trash2 size={16} />
          {confirmDelete ? '확인' : '삭제'}
        </button>
      </div>

      {/* Card content (swipeable) */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={{ x: swiped ? -90 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        onTap={() => swiped && setSwiped(false)}
        className={`relative rounded-2xl shadow-card overflow-hidden ${isCarried ? 'opacity-50' : ''}`}
        style={{ background: 'var(--gradient-card)', touchAction: 'pan-y' }}
      >
        {/* Color accent bar */}
        {category && (
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px]"
            style={{ backgroundColor: `hsl(${category.color})` }}
          />
        )}

        <div className="pl-4 pr-4 pt-3.5 pb-3">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              {category && <CategoryBadge category={category} size="sm" />}
              
              {/* Prayer status badges */}
              {isPrayer && entry.isAnswered && (
                <span
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-body font-medium"
                  style={{
                    backgroundColor: 'hsl(152 55% 50% / 0.12)',
                    color: 'hsl(152 55% 36%)',
                    border: '1px solid hsl(152 55% 50% / 0.2)',
                  }}
                >
                  <CheckCircle2 size={10} />
                  응답됨
                </span>
              )}
              {isPrayer && !entry.isAnswered && isCarried && (
                <span
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-body"
                  style={{
                    backgroundColor: 'hsl(220 50% 60% / 0.1)',
                    color: 'hsl(220 45% 52%)',
                    border: '1px solid hsl(220 50% 60% / 0.15)',
                  }}
                >
                  <Heart size={9} />
                  계속 기도 중
                </span>
              )}
            </div>
            
            {/* Time */}
            <span className="text-[11px] text-muted-foreground font-body shrink-0">
              {showDate ? `${entry.recordDate.slice(5).replace('-', '/')} ${timeStr}` : timeStr}
            </span>
          </div>

          {/* Photo */}
          {entry.imageUrl && (
            <div className="mb-2.5 -mx-1 rounded-xl overflow-hidden">
              <img
                src={entry.imageUrl}
                alt="기록 사진"
                className="w-full max-h-48 object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Content */}
          <p className="text-[14px] leading-[1.75] font-body whitespace-pre-wrap" style={{ color: 'hsl(var(--foreground) / 0.88)' }}>
            {entry.content}
          </p>

          {/* Prayer answered info */}
          {isPrayer && entry.isAnswered && entry.answerDays !== undefined && (
            <div
              className="mt-2 flex items-center gap-1.5 text-[11px] font-body font-medium"
              style={{ color: 'hsl(152 55% 36%)' }}
            >
              <CheckCircle2 size={11} />
              <span>
                {entry.answerDays === 0 ? '같은 날 응답됨' : `${entry.answerDays}일 만에 응답됨`}
              </span>
            </div>
          )}

          {/* Prayer mark answered button */}
          {isPrayer && !entry.isAnswered && onMarkAnswered && !isCarried && (
            <div className="mt-2.5">
              <button
                onClick={() => onMarkAnswered(entry.id)}
                className="text-[12px] font-body font-medium px-3 py-1.5 rounded-xl transition-all active:scale-95"
                style={{
                  backgroundColor: 'hsl(220 60% 62% / 0.1)',
                  color: 'hsl(220 55% 50%)',
                  border: '1px solid hsl(220 60% 62% / 0.2)',
                }}
              >
                🙏 응답 표시
              </button>
            </div>
          )}

          {/* Carried prayer - mark answered */}
          {isPrayer && !entry.isAnswered && onMarkAnswered && isCarried && (
            <div className="mt-2.5">
              <button
                onClick={() => onMarkAnswered(entry.id)}
                className="text-[12px] font-body font-medium px-3 py-1.5 rounded-xl transition-all active:scale-95"
                style={{
                  backgroundColor: 'hsl(152 50% 45% / 0.1)',
                  color: 'hsl(152 50% 38%)',
                  border: '1px solid hsl(152 50% 45% / 0.18)',
                }}
              >
                ✨ 응답됨으로 표시
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
