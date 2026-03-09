import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Entry, Category, DEFAULT_CATEGORY_IDS } from '@/types';

type TimeRange = '7d' | '30d' | 'all';

interface StatsViewProps {
  entries: Entry[];
  categories: Category[];
}

function getDaysAgoStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

export function StatsView({ entries, categories }: StatsViewProps) {
  const [range, setRange] = useState<TimeRange>('all');

  const filtered = useMemo(() => {
    if (range === 'all') return entries;
    const cutoff = getDaysAgoStr(range === '7d' ? 7 : 30);
    return entries.filter((e) => e.recordDate >= cutoff);
  }, [entries, range]);

  const stats = useMemo(() => {
    const byCategory: Record<string, number> = {};
    categories.forEach((c) => (byCategory[c.id] = 0));
    filtered.forEach((e) => {
      if (byCategory[e.categoryId] !== undefined) {
        byCategory[e.categoryId]++;
      } else {
        byCategory[e.categoryId] = 1;
      }
    });

    const prayers = filtered.filter((e) => e.categoryId === DEFAULT_CATEGORY_IDS.PRAYER);
    const answered = prayers.filter((e) => e.isAnswered);
    const unanswered = prayers.filter((e) => !e.isAnswered);

    const durations = answered
      .filter((e) => e.answerDays !== undefined)
      .map((e) => e.answerDays!);
    const avgDays = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

    return { byCategory, answered: answered.length, unanswered: unanswered.length, avgDays, total: filtered.length };
  }, [filtered, categories]);

  const maxCount = Math.max(...Object.values(stats.byCategory), 1);

  const ranges: { key: TimeRange; label: string }[] = [
    { key: '7d', label: '7일' },
    { key: '30d', label: '30일' },
    { key: 'all', label: '전체' },
  ];

  const prayerTotal = stats.answered + stats.unanswered;
  const answeredPct = prayerTotal > 0 ? Math.round((stats.answered / prayerTotal) * 100) : 0;

  return (
    <div className="space-y-5 pb-8">
      {/* Time range selector */}
      <div className="flex gap-2">
        {ranges.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className="flex-1 py-2 rounded-xl text-xs font-body font-medium transition-all"
            style={{
              backgroundColor: range === r.key ? 'hsl(var(--primary))' : 'hsl(var(--card))',
              color: range === r.key ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
              boxShadow: range === r.key ? 'var(--shadow-soft)' : 'none',
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Total summary */}
      <motion.div
        key={`total-${range}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 shadow-card"
        style={{ background: 'var(--gradient-card)' }}
      >
        <p className="text-xs text-muted-foreground font-body mb-1">
          {range === '7d' ? '최근 7일' : range === '30d' ? '최근 30일' : '전체'} 기록
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-display font-medium text-foreground">{stats.total}</span>
          <span className="text-sm text-muted-foreground font-body">개</span>
        </div>
      </motion.div>

      {/* Category bars */}
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
                transition={{ delay: i * 0.05 }}
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
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `hsl(${cat.color} / 0.12)` }}>
                  <motion.div
                    key={`bar-${cat.id}-${range}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: i * 0.05 + 0.15, duration: 0.5, ease: 'easeOut' }}
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

        {/* Answered / Unanswered donut-style bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 shadow-soft mb-3"
          style={{ backgroundColor: 'hsl(var(--card))' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-body text-muted-foreground">응답률</span>
            <span className="text-xs font-body font-semibold text-foreground">
              {prayerTotal > 0 ? `${answeredPct}%` : '-'}
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex" style={{ backgroundColor: 'hsl(var(--muted))' }}>
            {prayerTotal > 0 && (
              <>
                <motion.div
                  key={`ans-${range}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${answeredPct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-l-full"
                  style={{ backgroundColor: 'hsl(142 55% 42%)' }}
                />
                <motion.div
                  key={`unans-${range}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${100 - answeredPct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                  className="h-full rounded-r-full"
                  style={{ backgroundColor: 'hsl(220 60% 62%)' }}
                />
              </>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(142 55% 42%)' }} />
              <span className="text-[11px] font-body text-muted-foreground">응답됨</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(220 60% 62%)' }} />
              <span className="text-[11px] font-body text-muted-foreground">기도 중</span>
            </div>
          </div>
        </motion.div>

        {/* Stat cards */}
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
