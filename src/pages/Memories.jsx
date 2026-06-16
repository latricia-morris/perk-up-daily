import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Image } from 'lucide-react';
import CategoryBadge from '@/components/shared/CategoryBadge';
import EntryTypePageShell from '@/components/vault/EntryTypePageShell';

export default function Memories() {
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: entries = [] } = useQuery({
    queryKey: ['entries-memories'],
    queryFn: () => base44.entities.UserEntry.filter({ entry_type: 'experience' }, '-created_date'),
  });

  return (
    <EntryTypePageShell title="Memories" icon={Image} entries={entries} user={user} emptyText="No memories yet. Log your first one." queryKey="entries-memories" />
  );
}