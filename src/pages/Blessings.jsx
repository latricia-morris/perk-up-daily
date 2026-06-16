import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Heart } from 'lucide-react';
import EntryTypePageShell from '@/components/vault/EntryTypePageShell';

export default function Blessings() {
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: entries = [] } = useQuery({
    queryKey: ['entries-blessings'],
    queryFn: () => base44.entities.UserEntry.filter({ entry_type: 'blessing' }, '-created_date'),
  });

  return (
    <EntryTypePageShell title="Blessings" icon={Heart} entries={entries} user={user} emptyText="No blessings logged yet. Start capturing what you're grateful for." queryKey="entries-blessings" />
  );
}