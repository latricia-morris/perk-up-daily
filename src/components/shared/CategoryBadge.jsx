import { getCategoryLabel } from '@/lib/constants';

// Warm honey-amber palette — no pink, blue, or purple
const colorMap = {
  deep_faith:         { bg: '#E8A838', color: '#2E2924' },
  rich_relationships: { bg: '#C98A2E', color: '#2E2924' },
  strong_body:        { bg: '#D9B15F', color: '#2E2924' },
  clear_mind:         { bg: '#C9A06A', color: '#2E2924' },
  strong_business:    { bg: '#E9D7B8', color: '#2E2924' },
  sound_money:        { bg: '#8C6239', color: '#FFF8EC' },
};

export default function CategoryBadge({ category, size = 'sm' }) {
  const colors = colorMap[category] || { bg: '#E9D7B8', color: '#2E2924' };
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses}`}
      style={{ backgroundColor: colors.bg, color: colors.color }}
    >
      {getCategoryLabel(category)}
    </span>
  );
}