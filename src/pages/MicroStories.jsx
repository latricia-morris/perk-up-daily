import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Image } from 'lucide-react';
import { getSchema } from '@/lib/contentSchema';
import CategoryBadge from '@/components/shared/CategoryBadge';
import EntryTypePageShell from '@/components/vault/EntryTypePageShell';

export default function MicroStories() {
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: entries = [] } = useQuery({
    queryKey: ['entries-micro-stories'],
    queryFn: () => base44.entities.UserEntry.filter({ entry_type: 'experience' }, '-created_date'),
  });

  return (
    <EntryTypePageShell title="Micro-Stories" icon={Image} entries={entries} user={user} emptyText="No micro-stories yet. Log your first one." queryKey="entries-micro-stories" descriptor={getSchema('experience')?.descriptor} />
  );
}