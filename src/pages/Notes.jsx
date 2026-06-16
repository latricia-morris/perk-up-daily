import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText } from 'lucide-react';
import EntryTypePageShell from '@/components/vault/EntryTypePageShell';

export default function Notes() {
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: entries = [] } = useQuery({
    queryKey: ['entries-notes'],
    queryFn: () => base44.entities.UserEntry.filter({ entry_type: 'personal_note' }, '-created_date'),
  });

  return (
    <EntryTypePageShell title="Notes" icon={FileText} entries={entries} user={user} emptyText="No notes yet. Write something worth remembering." queryKey="entries-notes" />
  );
}