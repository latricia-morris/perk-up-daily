import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Navigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { getSchema } from '@/lib/contentSchema';
import VaultEntryCard from '@/components/vault/VaultEntryCard';
import UpliftCard from '@/components/shared/UpliftCard';
import SourceToggle from '@/components/shared/SourceToggle';

export default function Scriptures() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('all');

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setLoading(false); });
  }, []);

  const { data: userScriptures = [] } = useQuery({
    queryKey: ['user-scriptures'],
    queryFn: () => base44.entities.UserEntry.filter({ entry_type: 'scripture' }, '-created_date'),
  });

  const { data: libraryScriptures = [] } = useQuery({
    queryKey: ['library-scriptures'],
    queryFn: () => base44.entities.AppLibrary.filter({ content_type: 'scripture', status: 'active' }),
  });

  if (loading) return null;
  if (!user?.christian_content) return <Navigate to="/dashboard" replace />;

  const allScriptures = [
    ...(source !== 'library' ? userScriptures.map(e => ({ ...e, source: 'yours' })) : []),
    ...(source !== 'mine' ? libraryScriptures.map(e => ({ ...e, entry_type: 'scripture', source: 'library' })) : []),
  ];

  return (
    <div>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-display text-2xl font-semibold text-foreground">Scriptures</h1>
          <SourceToggle value={source} onChange={setSource} />
        </div>
        <p className="text-sm mb-6" style={{ color: '#7a5c3a' }}>{getSchema('scripture')?.descriptor}</p>

        {allScriptures.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="w-8 h-8 mx-auto mb-3 text-text-faint" />
            <p className="text-sm">No scriptures saved yet. Add one from your reading today.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allScriptures.map((entry, i) => (
              entry.source === 'yours'
                ? <VaultEntryCard key={entry.id} entry={entry} index={i} christianEnabled={true} />
                : <UpliftCard key={entry.id} item={entry} source="library" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}