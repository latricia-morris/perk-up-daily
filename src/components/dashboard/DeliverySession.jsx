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
    const libraryPool = shuffleArray(allContent.library.map(item => ({ ...item, source: 'library' })));
    const entryPool = shuffleArray(allContent.entries.map(item => ({ ...item, source: 'user_entry' })));

    // Interleave: alternate library and user entries so neither dominates
    const interleaved = [];
    const maxLen = Math.max(libraryPool.length, entryPool.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < libraryPool.length) interleaved.push(libraryPool[i]);
      if (i < entryPool.length) interleaved.push(entryPool[i]);
    }

    // Featured: prefer library quotes/affirmations/scriptures for the spotlight
    const featuredTypes = ['quote', 'affirmation', 'scripture'];
    const featuredIdx = interleaved.findIndex(item =>
      featuredTypes.includes(item.content_type || item.entry_type)
    );

    let featured, supporting;
    if (featuredIdx >= 0) {
      featured = interleaved[featuredIdx];
      supporting = interleaved.filter((_, i) => i !== featuredIdx).slice(0, 4);
    } else {
      featured = interleaved[0];
      supporting = interleaved.slice(1, 5);
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