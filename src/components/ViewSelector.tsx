import { ViewMode } from '@/types';
import { motion } from 'framer-motion';

interface ViewSelectorProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: 'today', label: '오늘' },
  { id: 'yesterday-today', label: '어제·오늘' },
  { id: 'today-tomorrow', label: '오늘·내일' },
  { id: 'weekly', label: '주간' },
  { id: 'monthly', label: '월간' },
  { id: 'stats', label: '통계' },
];

export function ViewSelector({ view, onChange }: ViewSelectorProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
      {VIEWS.map((v) => {
        const active = view === v.id;
        return (
          <button
            key={v.id}
            onClick={() => onChange(v.id)}
            className="relative snap-start shrink-0 px-3.5 py-1.5 rounded-full text-sm font-body font-medium transition-colors"
            style={
              active
                ? { color: 'hsl(var(--primary-foreground))' }
                : { color: 'hsl(var(--muted-foreground))' }
            }
          >
            {active && (
              <motion.span
                layoutId="view-pill"
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: 'hsl(var(--primary))' }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            <span className="relative z-10">{v.label}</span>
          </button>
        );
      })}
    </div>
  );
}
