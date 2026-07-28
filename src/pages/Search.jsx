import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search as SearchIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import CategoryBadge from '@/components/shared/CategoryBadge';
import EntryDetailModal from '@/components/shared/EntryDetailModal';
import { getEntryTypeLabel } from '@/lib/constants';

function matchesQuery(item, q) {
  const lower = q.toLowerCase();
  return [item.body, item.title, item.author, item.old_belief, item.location]
    .filter(Boolean)
    .some(field => field.toLowerCase().includes(lower));
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [user, setUser] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: userEntries = [] } = useQuery({
    queryKey: ['all-user-entries'],
    queryFn: () => base44.entities.UserEntry.list('-created_date', 500),
  });

  const { data: libraryItems = [] } = useQuery({
    queryKey: ['all-library-items'],
    queryFn: () => base44.entities.AppLibrary.filter({ status: 'active' }, '-created_date', 500),
  });

  const christianEnabled = user?.christian_content || false;

  const combined = [
    ...userEntries.map(e => ({ ...e, _source: 'yours' })),
    ...libraryItems.map(e => ({ ...e, entry_type: e.content_type, _source: 'library' })),
  ].filter(e => christianEnabled || e.category !== 'deep_faith');

  const results = query.trim().length >= 2
    ? combined.filter(item => matchesQuery(item, query))
    : [];

  return (
    <div>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-foreground mb-6">Search</h1>

        {/* Search input */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search entries, quotes, affirmations..."
            className="w-full pl-9 pr-9 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results */}
        {query.trim().length < 2 ? (
          <p className="text-center text-muted-foreground text-sm py-12">Type at least 2 characters to search</p>
        ) : results.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-12">No results for "{query}"</p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-2">{results.length} result{results.length !== 1 ? 's' : ''}</p>
            <AnimatePresence>
              {results.map((item, i) => (
                <motion.div
                  key={`${item._source}-${item.id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  onClick={() => setSelectedItem(item)}
                  className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  {item.entry_type === 'identity_swap' ? (
                    <div className="space-y-1.5">
                      {item.old_belief && (
                        <p className="text-xs text-muted-foreground line-through">{item.old_belief}</p>
                      )}
                      <p className="text-sm font-semibold text-foreground">{item.body}</p>
                    </div>
                  ) : (
                    <>
                      {(item.title || item.author) && (
                        <p className="text-xs font-semibold text-muted-foreground mb-0.5">{item.title || item.author}</p>
                      )}
                      <p className="text-sm text-foreground leading-relaxed line-clamp-3">{item.body}</p>
                    </>
                  )}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-1">
                      {getEntryTypeLabel(item.entry_type)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {item._source === 'library' ? '· Library' : '· Yours'}
                    </span>
                    <CategoryBadge category={item.category} />
                    {item.location && (
                      <span className="text-[10px] text-muted-foreground">📍 {item.location}</span>
                    )}
                    {item.entry_date && (
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(item.entry_date), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedItem && <EntryDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      </AnimatePresence>
    </div>
  );
}