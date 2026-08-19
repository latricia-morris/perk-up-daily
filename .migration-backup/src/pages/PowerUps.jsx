import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Zap as ZapIcon } from 'lucide-react';
import VaultEntryCard from '@/components/vault/VaultEntryCard';
import UpliftCard from '@/components/shared/UpliftCard';
import SourceToggle from '@/components/shared/SourceToggle';
import { getSchema } from '@/lib/contentSchema';

export default function PowerUps() {
  const [user, setUser] = useState(null);
  const [source, setSource] = useState('all');

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  // Query both power_up and legacy quote entries
  const { data: userPowerUps = [] } = useQuery({
    queryKey: ['entries-power-ups'],
    queryFn: async () => {
      const [powerUps, quotes] = await Promise.all([
        base44.entities.UserEntry.filter({ entry_type: 'power_up' }, '-created_date'),
        base44.entities.UserEntry.filter({ entry_type: 'quote' }, '-created_date'),
      ]);
      return [...powerUps, ...quotes].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
  });

  const { data: libraryPowerUps = [] } = useQuery({
    queryKey: ['library-power-ups'],
    queryFn: async () => {
      const [powerUps, quotes] = await Promise.all([
        base44.entities.AppLibrary.filter({ content_type: 'power_up', status: 'active' }),
        base44.entities.AppLibrary.filter({ content_type: 'quote', status: 'active' }),
      ]);
      return [...powerUps, ...quotes];
    },
  });

  const christianEnabled = user?.christian_content || false;

  const allPowerUps = [
    ...(source !== 'library' ? userPowerUps.map(e => ({ ...e, source: 'yours' })) : []),
    ...(source !== 'mine' ? libraryPowerUps.map(e => ({ ...e, entry_type: 'power_up', source: 'library' })) : []),
  ].filter(e => christianEnabled || e.category !== 'deep_faith');

  return (
    <div>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-display text-2xl font-semibold text-foreground">Power-Ups</h1>
          <SourceToggle value={source} onChange={setSource} />
        </div>
        <p className="text-sm mb-6" style={{ color: '#7a5c3a' }}>{getSchema('power_up')?.descriptor}</p>

        {allPowerUps.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ZapIcon className="w-8 h-8 mx-auto mb-3 text-text-faint" />
            <p className="text-sm">No Power-Ups yet. Add one that moves you.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allPowerUps.map((entry, i) => (
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