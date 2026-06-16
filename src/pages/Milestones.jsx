import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getFilteredCategories, getCategoryLabel } from '@/lib/constants';
import CategoryBadge from '@/components/shared/CategoryBadge';
import { Trophy } from 'lucide-react';

export default function Milestones() {
  const [user, setUser] = useState(null);
  const [catFilter, setCatFilter] = useState('all');

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: entries = [] } = useQuery({
    queryKey: ['life-wins'],
    queryFn: async () => {
      // Fetch all three legacy types plus new life_win
      const [wins, accomplishments, milestones] = await Promise.all([
        base44.entities.UserEntry.filter({ entry_type: 'life_win' }, '-created_date'),
        base44.entities.UserEntry.filter({ entry_type: 'accomplishment' }, '-created_date'),
        base44.entities.UserEntry.filter({ entry_type: 'milestone' }, '-created_date'),
      ]);
      return [...wins, ...accomplishments, ...milestones]
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
  });

  const christianEnabled = user?.christian_content || false;
  const categories = getFilteredCategories(christianEnabled);

  const filtered = entries.filter(e => {
    if (!christianEnabled && e.category === 'deep_faith') return false;
    if (catFilter !== 'all' && e.category !== catFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-semibold text-foreground">Life Wins</h1>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Trophy className="w-8 h-8 mx-auto mb-3 text-text-faint" />
            <p className="text-sm">No life wins yet. Log your first win to start your timeline.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-6">
              {filtered.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="relative pl-10"
                >
                  <div className="absolute left-2.5 top-4 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex gap-3">
                      {entry.photo_url && (
                        <img src={entry.photo_url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{entry.title || 'Life Win'}</p>
                        {entry.body && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{entry.body}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <CategoryBadge category={entry.category} />
                          {entry.entry_date && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(entry.entry_date), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}