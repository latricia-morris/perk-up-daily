import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles } from 'lucide-react';
import { getFilteredCategories } from '@/lib/constants';
import VaultEntryCard from '@/components/vault/VaultEntryCard';
import SourceToggle from '@/components/shared/SourceToggle';

export default function Affirmations() {
  const [user, setUser] = useState(null);
  const [source, setSource] = useState('all');

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

  const allAffirmations = [
    ...(source !== 'library' ? userAffirmations.map(e => ({ ...e, source: 'yours' })) : []),
    ...(source !== 'mine' ? libraryAffirmations.map(e => ({ ...e, entry_type: 'affirmation', source: 'library' })) : []),
  ].filter(e => christianEnabled || e.category !== 'deep_faith');

  return (
    <div>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-semibold text-foreground">Affirmations</h1>
          <SourceToggle value={source} onChange={setSource} />
        </div>

        {allAffirmations.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-3 text-text-faint" />
            <p className="text-sm">No affirmations yet. Add your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allAffirmations.map((entry, i) => (
              entry.source === 'yours'
                ? <VaultEntryCard key={entry.id} entry={entry} index={i} christianEnabled={christianEnabled} />
                : (
                  <div key={entry.id} className="bg-card border border-border rounded-xl p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Library</p>
                    <p className="text-sm text-foreground leading-relaxed">{entry.body}</p>
                  </div>
                )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}