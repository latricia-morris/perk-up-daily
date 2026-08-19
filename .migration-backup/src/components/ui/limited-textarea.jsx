import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

/**
 * Textarea with soft/hard character limits.
 * - Under soft:  shows character count faintly
 * - At/over soft: shows amber warning
 * - At hard:      shows red, blocks further input
 */
export default function LimitedTextarea({ value = '', onChange, softLimit, hardLimit, className, ...props }) {
  const len = value.length;
  const atHard = len >= hardLimit;
  const atSoft = len >= softLimit;

  const handleChange = (e) => {
    const next = e.target.value;
    if (next.length > hardLimit) return; // block beyond hard limit
    onChange(e);
  };

  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={handleChange}
        className={cn(
          atHard && 'border-destructive focus-visible:ring-destructive',
          atSoft && !atHard && 'border-amber-400 focus-visible:ring-amber-400',
          className
        )}
        maxLength={hardLimit}
        {...props}
      />
      <div className={cn(
        'text-right text-[11px] mt-1 tabular-nums',
        atHard ? 'text-destructive font-medium' : atSoft ? 'text-amber-600' : 'text-muted-foreground opacity-60'
      )}>
        {atHard
          ? `Maximum length reached (${hardLimit})`
          : atSoft
            ? `${len}/${hardLimit} — long entries may be truncated on tiles and graphics`
            : `${len}/${hardLimit}`
        }
      </div>
    </div>
  );
}