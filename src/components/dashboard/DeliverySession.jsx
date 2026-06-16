import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UpliftCard from '@/components/shared/UpliftCard';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function DeliverySession({ libraryItems, userEntries, categories, christianEnabled }) {
  const [shuffleKey, setShuffleKey] = useState(0);

  const allContent = useMemo(() => {
    const validCategories = new Set(categories);
    
    const filteredLibrary = libraryItems.filter(item => {
      if (!christianEnabled && item.category === 'deep_faith') return false;
      if (!christianEnabled && item.content_type === 'scripture') return false;
      if (validCategories.size > 0 && !validCategories.has(item.category)) return false;
      return item.status === 'active';
    });

    const filteredEntries = userEntries.filter(entry => {
      if (!christianEnabled && entry.category === 'deep_faith') return false;
      if (!christianEnabled && entry.entry_type === 'scripture') return false;
      if (validCategories.size > 0 && !validCategories.has(entry.category)) return false;
      return entry.status === 'active';
    });

    return { library: filteredLibrary, entries: filteredEntries };
  }, [libraryItems, userEntries, categories, christianEnabled]);

  const session = useMemo(() => {
    const pool = [
      ...allContent.library.map(item => ({ ...item, source: 'library' })),
      ...allContent.entries.map(item => ({ ...item, source: 'user_entry' })),
    ];

    const shuffled = shuffleArray(pool);

    // Featured: prefer quotes, affirmations, scriptures
    const featuredTypes = ['quote', 'affirmation', 'scripture'];
    const featuredIdx = shuffled.findIndex(item =>
      featuredTypes.includes(item.content_type || item.entry_type)
    );

    let featured, supporting;
    if (featuredIdx >= 0) {
      featured = shuffled[featuredIdx];
      supporting = shuffled.filter((_, i) => i !== featuredIdx).slice(0, 4);
    } else {
      featured = shuffled[0];
      supporting = shuffled.slice(1, 5);
    }

    return { featured, supporting };
  }, [allContent, shuffleKey]);

  if (!session.featured) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No content available yet. Start by adding some entries!</p>
      </div>
    );
  }

  return (
    <div>
      <UpliftCard item={session.featured} featured source={session.featured.source} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {session.supporting.map((item, i) => (
          <UpliftCard key={`${shuffleKey}-${i}`} item={item} source={item.source} />
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShuffleKey(k => k + 1)}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Shuffle className="w-4 h-4" />
          Shuffle
        </Button>
      </div>
    </div>
  );
}