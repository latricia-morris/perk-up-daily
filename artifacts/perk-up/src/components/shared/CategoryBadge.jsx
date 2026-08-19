import { getCategoryLabel } from '@/lib/constants';

// Rich accent pops on a warm cream base — dark accents get light text, light accents get dark text
const colorMap = {
  deep_faith:         { bg: '#37154A', color: '#FFFCF2' },  // deep plum
  rich_relationships: { bg: '#C43911', color: '#FFFCF2' },  // ember red
  strong_body:        { bg: '#F78F00', color: '#2F2C29' },  // honey amber
  clear_mind:         { bg: '#0F2459', color: '#FFFCF2' },  // deep navy
  strong_business:    { bg: '#75003C', color: '#FFFCF2' },  // deep burgundy
  sound_money:        { bg: '#E6A037', color: '#2F2C29' },  // warm gold
};

export default function CategoryBadge({ category, size = 'sm' }) {
  const colors = colorMap[category] || { bg: '#E6A037', color: '#2F2C29' };
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2.5 py-1' : 'text-xs px-3 py-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses}`}
      style={{ backgroundColor: colors.bg, color: colors.color }}
    >
      {getCategoryLabel(category)}
    </span>
  );
}