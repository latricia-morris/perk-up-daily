import { motion } from 'framer-motion';
import { format } from 'date-fns';
import CategoryBadge from '@/components/shared/CategoryBadge';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

export default function EntryTypePageShell({ title, icon: Icon, entries, user, emptyText }) {
  return (
    <div>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-semibold text-foreground">{title}</h1>
          <Link
            to="/add-entry"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Add
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Icon className="w-8 h-8 mx-auto mb-3 text-text-faint" />
            <p className="text-sm">{emptyText}</p>
            <Link to="/add-entry" className="inline-block mt-4 text-sm text-primary underline">
              Add your first entry →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="bg-card border border-border rounded-xl p-4"
              >
                {entry.entry_type === 'identity_swap' ? (
                  <div className="space-y-2">
                    {entry.old_belief && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">My Old Lie-dentity</p>
                        <p className="text-xs text-muted-foreground line-through leading-relaxed">{entry.old_belief}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#d4830a' }}>My True Identity</p>
                      <p className="text-sm font-semibold text-foreground leading-relaxed">{entry.body}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {entry.photo_url && (
                      <img src={entry.photo_url} alt="" className="w-full h-40 object-cover rounded-lg mb-3" />
                    )}
                    {entry.title && (
                      <p className="text-sm font-semibold text-foreground mb-0.5">{entry.title}</p>
                    )}
                    <p className="text-sm text-foreground leading-relaxed">{entry.body}</p>
                  </>
                )}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <CategoryBadge category={entry.category} />
                  {entry.entry_date && (
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(entry.entry_date), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}