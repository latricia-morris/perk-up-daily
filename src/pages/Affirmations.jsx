import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getFilteredCategories } from '@/lib/constants';
import VaultEntryCard from '@/components/vault/VaultEntryCard';

export default function Affirmations() {
  const [user, setUser] = useState(null);
  const [catFilter, setCatFilter] = useState('all');

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: userAffirmations = [] } = useQuery({
    queryKey: ['user-affirmations'],
    queryFn: () => base44.entities.UserEntry.filter({ entry_type: 'affirmation' }, '-created_date'),
  });

  const { data: libraryAffirmations = [] } = useQuery({
    queryKey: ['library-affirmations'],
    queryFn: () => base44.entities.AppLibrary.filter({ content_type: 'affirmation', status: 'active' }),
  });

  const christianEnabled = user?.christian_content || false;
  const categories = getFilteredCategories(christianEnabled);

  const allAffirmations = [
    ...userAffirmations.map(e => ({ ...e, source: 'yours' })),
    ...libraryAffirmations.map(e => ({ ...e, entry_type: 'affirmation', source: 'library' })),
  ].filter(e => {
    if (!christianEnabled && e.category === 'deep_faith') return false;
    if (catFilter !== 'all' && e.category !== catFilter) return false;
    return true;
  });

  return (
    <div className="md:ml-64">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-semibold text-foreground">Affirmations</h1>
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

        {allAffirmations.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-3 text-text-faint" />
            <p className="text-sm">No affirmations yet. Add your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allAffirmations.map((entry, i) => (
              <VaultEntryCard key={entry.id} entry={entry} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}