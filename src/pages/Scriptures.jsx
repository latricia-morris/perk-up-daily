import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Navigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import VaultEntryCard from '@/components/vault/VaultEntryCard';

export default function Scriptures() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    ...userScriptures.map(e => ({ ...e, source: 'yours' })),
    ...libraryScriptures.map(e => ({ ...e, entry_type: 'scripture', source: 'library' })),
  ];

  return (
    <div className="md:ml-64">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-foreground mb-6">Scriptures</h1>

        {allScriptures.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="w-8 h-8 mx-auto mb-3 text-text-faint" />
            <p className="text-sm">No scriptures saved yet. Add one from your reading today.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allScriptures.map((entry, i) => (
              <VaultEntryCard key={entry.id} entry={entry} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}