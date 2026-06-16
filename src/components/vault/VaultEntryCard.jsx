import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { getEntryTypeLabel } from '@/lib/constants';
import CategoryBadge from '@/components/shared/CategoryBadge';

export default function VaultEntryCard({ entry, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow"
    >
      <div className="flex gap-3">
        {entry.photo_url && (
          <img
            src={entry.photo_url}
            alt=""
            className="w-14 h-14 rounded-lg object-cover shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          {entry.title && (
            <p className="text-sm font-semibold text-foreground mb-0.5">{entry.title}</p>
          )}
          <p className="text-sm text-foreground leading-relaxed line-clamp-2">{entry.body}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {getEntryTypeLabel(entry.entry_type)}
            </span>
            <CategoryBadge category={entry.category} />
            {entry.entry_date && (
              <span className="text-[10px] text-muted-foreground">
                {format(new Date(entry.entry_date), 'MMM d, yyyy')}
              </span>
            )}
            {entry.status === 'draft' && (
              <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                Draft
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}