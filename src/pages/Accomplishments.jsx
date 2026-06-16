import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getFilteredCategories } from '@/lib/constants';
import VaultEntryCard from '@/components/vault/VaultEntryCard';

export default function Accomplishments() {
  const [user, setUser] = useState(null);
  const [catFilter, setCatFilter] = useState('all');

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: entries = [] } = useQuery({
    queryKey: ['accomplishments'],
    queryFn: () => base44.entities.UserEntry.filter({ entry_type: 'accomplishment' }, '-created_date'),
  });

  const christianEnabled = user?.christian_content || false;
  const categories = getFilteredCategories(christianEnabled);

  const filtered = entries.filter(e => {
    if (!christianEnabled && e.category === 'deep_faith') return false;
    if (catFilter !== 'all' && e.category !== catFilter) return false;
    return true;
  });

  return (
    <div className="md:ml-64">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-semibold text-foreground">Accomplishments</h1>
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
            <Award className="w-8 h-8 mx-auto mb-3 text-text-faint" />
            <p className="text-sm">No accomplishments logged yet. You have more wins than you think!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((entry, i) => (
              <VaultEntryCard key={entry.id} entry={entry} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}