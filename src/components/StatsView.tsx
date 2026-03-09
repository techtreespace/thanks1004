import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Entry, Category, DEFAULT_CATEGORY_IDS } from '@/types';

interface StatsViewProps {
  entries: Entry[];
  categories: Category[];
}

export function StatsView({ entries, categories }: StatsViewProps) {
  const stats = useMemo(() => {
    const byCategory: Record<string, number> = {};
    categories.forEach((c) => (byCategory[c.id] = 0));
    entries.forEach((e) => {
      if (byCategory[e.categoryId] !== undefined) {
        byCategory[e.categoryId]++;
      } else {
        byCategory[e.categoryId] = 1;
      }
    });

    const prayers = entries.filter((e) => e.categoryId === DEFAULT_CATEGORY_IDS.PRAYER);
    const answered = prayers.filter((e) => e.isAnswered);
    const unanswered = prayers.filter((e) => !e.isAnswered);

    const durations = answered
      .filter((e) => e.answerDays !== undefined)
      .map((e) => e.answerDays!);
    const avgDays = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

    return { byCategory, answered: answered.length, unanswered: unanswered.length, avgDays, total: entries.length };
  }, [entries, categories]);

  const maxCount = Math.max(...Object.values(stats.byCategory), 1);

  return (
    <div className="space-y-6 pb-8">
      {/* Total */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 shadow-card"
        style={{ background: 'var(--gradient-card)' }}
      >
        <p className="text-xs text-muted-foreground font-body mb-1">전체 기록</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-display font-medium text-foreground">{stats.total}</span>
          <span className="text-sm text-muted-foreground font-body">개</span>
        </div>
      </motion.div>

      {/* By category */}
      <div>
        <h3 className="text-sm font-body font-medium text-muted-foreground mb-3">카테고리별</h3>
        <div className="space-y-3">
          {categories.map((cat, i) => {
            const count = stats.byCategory[cat.id] ?? 0;
            const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl p-4 shadow-soft"
                style={{ backgroundColor: 'hsl(var(--card))' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{cat.emoji}</span>
                    <span className="text-sm font-body font-medium text-foreground">{cat.name}</span>
                  </div>
                  <span className="text-sm font-body font-semibold" style={{ color: `hsl(${cat.color})` }}>
                    {count}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `hsl(${cat.color} / 0.15)` }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: i * 0.06 + 0.2, duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: `hsl(${cat.color})` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Prayer stats */}
      <div>
        <h3 className="text-sm font-body font-medium text-muted-foreground mb-3">기도 통계</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '응답됨', value: stats.answered, color: '142 55% 42%' },
            { label: '기도 중', value: stats.unanswered, color: '220 60% 62%' },
            { label: '평균 응답', value: stats.avgDays !== null ? `${stats.avgDays}일` : '-', color: '34 80% 52%' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl p-4 text-center shadow-soft"
              style={{ backgroundColor: 'hsl(var(--card))' }}
            >
              <p
                className="text-2xl font-display font-medium"
                style={{ color: `hsl(${item.color})` }}
              >
                {item.value}
              </p>
              <p className="text-xs text-muted-foreground font-body mt-1">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
