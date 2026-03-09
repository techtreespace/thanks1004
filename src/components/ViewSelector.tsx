import { ViewMode } from '@/types';
import { motion } from 'framer-motion';
import { useI18n, TranslationKey } from '@/lib/i18n';

interface ViewSelectorProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

const VIEW_KEYS: { id: ViewMode; key: TranslationKey }[] = [
  { id: 'today', key: 'nav.today' },
  { id: 'yesterday-today', key: 'nav.yesterdayToday' },
  { id: 'today-tomorrow', key: 'nav.todayTomorrow' },
  { id: 'weekly', key: 'nav.weekly' },
  { id: 'monthly', key: 'nav.monthly' },
  { id: 'stats', key: 'nav.stats' },
];

export function ViewSelector({ view, onChange }: ViewSelectorProps) {
  const { t } = useI18n();

  return (
    <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none -mx-1 px-1">
      {VIEW_KEYS.map((v) => {
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
              {t(v.key)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
