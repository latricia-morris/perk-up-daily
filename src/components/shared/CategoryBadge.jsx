import { getCategoryLabel } from '@/lib/constants';

const colorMap = {
  deep_faith: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  rich_relationships: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  strong_body: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  clear_mind: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  strong_business: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  sound_money: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
};

export default function CategoryBadge({ category, size = 'sm' }) {
  const classes = colorMap[category] || 'bg-muted text-muted-foreground';
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${classes} ${sizeClasses}`}>
      {getCategoryLabel(category)}
    </span>
  );
}