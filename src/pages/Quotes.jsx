import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Quote } from 'lucide-react';
import EntryTypePageShell from '@/components/vault/EntryTypePageShell';

export default function Quotes() {
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: entries = [] } = useQuery({
    queryKey: ['entries-quotes'],
    queryFn: () => base44.entities.UserEntry.filter({ entry_type: 'quote' }, '-created_date'),
  });

  return (
    <EntryTypePageShell title="Quotes" icon={Quote} entries={entries} user={user} emptyText="No quotes saved yet. Add one that moves you." />
  );
}