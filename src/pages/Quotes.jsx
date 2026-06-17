import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Quote as QuoteIcon } from 'lucide-react';
import VaultEntryCard from '@/components/vault/VaultEntryCard';
import UpliftCard from '@/components/shared/UpliftCard';
import SourceToggle from '@/components/shared/SourceToggle';

export default function Quotes() {
  const [user, setUser] = useState(null);
  const [source, setSource] = useState('all');

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: userQuotes = [] } = useQuery({
    queryKey: ['entries-quotes'],
    queryFn: () => base44.entities.UserEntry.filter({ entry_type: 'quote' }, '-created_date'),
  });

  const { data: libraryQuotes = [] } = useQuery({
    queryKey: ['library-quotes'],
    queryFn: () => base44.entities.AppLibrary.filter({ content_type: 'quote', status: 'active' }),
  });

  const christianEnabled = user?.christian_content || false;

  const allQuotes = [
    ...(source !== 'library' ? userQuotes.map(e => ({ ...e, source: 'yours' })) : []),
    ...(source !== 'mine' ? libraryQuotes.map(e => ({ ...e, entry_type: 'quote', source: 'library' })) : []),
  ].filter(e => christianEnabled || e.category !== 'deep_faith');

  return (
    <div>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-semibold text-foreground">Quotes</h1>
          <SourceToggle value={source} onChange={setSource} />
        </div>

        {allQuotes.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <QuoteIcon className="w-8 h-8 mx-auto mb-3 text-text-faint" />
            <p className="text-sm">No quotes yet. Add one that moves you.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allQuotes.map((entry, i) => (
              entry.source === 'yours'
                ? <VaultEntryCard key={entry.id} entry={entry} index={i} christianEnabled={christianEnabled} />
                : <UpliftCard key={entry.id} item={entry} source="library" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}