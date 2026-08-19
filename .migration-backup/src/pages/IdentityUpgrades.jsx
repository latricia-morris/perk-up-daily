import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeftRight } from 'lucide-react';
import { getSchema } from '@/lib/contentSchema';
import EntryTypePageShell from '@/components/vault/EntryTypePageShell';

export default function IdentityUpgrades() {
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: entries = [] } = useQuery({
    queryKey: ['entries-identity-upgrades'],
    queryFn: () => base44.entities.UserEntry.filter({ entry_type: 'identity_swap' }, '-created_date'),
  });

  return (
    <EntryTypePageShell title="Identity Upgrades" icon={ArrowLeftRight} entries={entries} user={user} emptyText="No identity upgrades yet. Release a lie, step into your truth." queryKey="entries-identity-upgrades" descriptor={getSchema('identity_swap')?.descriptor} />
  );
}