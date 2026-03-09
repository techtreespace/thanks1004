import { Category } from '@/types';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
  showEmoji?: boolean;
}

export function CategoryBadge({ category, size = 'md', showEmoji = true }: CategoryBadgeProps) {
  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-body font-medium ${sizes[size]}`}
      style={{
        backgroundColor: `hsl(${category.color} / 0.12)`,
        color: `hsl(${category.color})`,
        border: `1px solid hsl(${category.color} / 0.25)`,
      }}
    >
      {showEmoji && <span>{category.emoji}</span>}
      <span>{category.name}</span>
    </span>
  );
}
