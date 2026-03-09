import { ViewMode } from '@/types';
import { motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';

interface ViewSelectorProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

const VIEWS: { id: ViewMode; label: string; icon?: React.ReactNode }[] = [
  { id: 'today', label: '오늘' },
  { id: 'yesterday-today', label: '어제·오늘' },
  { id: 'today-tomorrow', label: '오늘·내일' },
  { id: 'weekly', label: '주간' },
  { id: 'monthly', label: '월간' },
  { id: 'stats', label: '통계' },
];

export function ViewSelector({ view, onChange }: ViewSelectorProps) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none -mx-1 px-1">
      {VIEWS.map((v) => {
        const active = view === v.id;
        return (
          <button
            key={v.id}
            onClick={() => onChange(v.id)}
            className="relative shrink-0 px-3 py-1.5 rounded-xl text-[13px] font-body font-medium transition-colors active:scale-95"
          >
            {active && (
              <motion.span
                layoutId="view-pill"
                className="absolute inset-0 rounded-xl"
                style={{ backgroundColor: 'hsl(var(--primary))' }}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
            <span
              className="relative z-10 transition-colors"
              style={{ color: active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))' }}
            >
              {v.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
