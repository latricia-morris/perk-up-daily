import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getFilteredEntryTypes, getFilteredCategories, getEntryTypeLabel } from '@/lib/constants';
import CategoryBadge from '@/components/shared/CategoryBadge';
import VaultEntryCard from '@/components/vault/VaultEntryCard';

export default function Vault() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: entries = [] } = useQuery({
    queryKey: ['vault-entries'],
    queryFn: () => base44.entities.UserEntry.list('-created_date'),
  });

  const christianEnabled = user?.christian_content || false;
  const entryTypes = getFilteredEntryTypes(christianEnabled);
  const categories = getFilteredCategories(christianEnabled);

  const filtered = entries.filter(e => {
    if (typeFilter !== 'all' && e.entry_type !== typeFilter) return false;
    if (catFilter !== 'all' && e.category !== catFilter) return false;
    if (!christianEnabled && e.category === 'deep_faith') return false;
    if (!christianEnabled && e.entry_type === 'scripture') return false;
    if (search) {
      const s = search.toLowerCase();
      return (e.title?.toLowerCase().includes(s) || e.body?.toLowerCase().includes(s));
    }
    return true;
  });

  return (
    <div className="md:ml-64">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-foreground mb-6">Your Vault</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search entries..."
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {entryTypes.map(t => (
                <SelectItem key={t.slug} value={t.slug}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-full sm:w-44">
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

        {/* Results */}
        <p className="text-xs text-muted-foreground mb-4">{filtered.length} entries</p>
        
        <div className="space-y-3">
          {filtered.map((entry, i) => (
            <VaultEntryCard key={entry.id} entry={entry} index={i} christianEnabled={christianEnabled} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-sm">No entries found. Start adding some good stuff!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}