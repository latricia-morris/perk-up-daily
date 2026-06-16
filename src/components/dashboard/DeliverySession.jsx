import { useState, useMemo } from 'react';
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

// Weighted random pick — items in preferred categories appear ~3x more often
function weightedShuffle(arr, preferredCategories) {
  if (!preferredCategories || preferredCategories.length === 0) return shuffleArray(arr);
  const preferred = new Set(preferredCategories);
  const weighted = arr.flatMap(item =>
    preferred.has(item.category) ? [item, item, item] : [item]
  );
  return shuffleArray(weighted).filter((item, idx, self) =>
    self.findIndex(x => x.id === item.id) === idx
  );
}

// Check if an entry is an anniversary today (same month/day)
function isAnniversaryToday(entry) {
  if (!entry.entry_date) return false;
  const today = new Date();
  const d = new Date(entry.entry_date);
  return d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
}

// Get yesterday's seen IDs from localStorage to avoid same-day-in-a-row repeats
function getYesterdaySeenIds() {
  try {
    const raw = localStorage.getItem('perkup-yesterday-delivery');
    if (!raw) return new Set();
    const { date, ids } = JSON.parse(raw);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    if (date === yStr) return new Set(ids);
  } catch {}
  return new Set();
}

function saveTodaySeenIds(ids) {
  try {
    const today = new Date().toISOString().split('T')[0];
    // Shift today → yesterday slot next load
    localStorage.setItem('perkup-yesterday-delivery', JSON.stringify({ date: today, ids }));
  } catch {}
}

export default function DeliverySession({ libraryItems, userEntries, categories, christianEnabled }) {
  const [shuffleKey, setShuffleKey] = useState(0);

  const session = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const preferredCats = categories && categories.length > 0 ? new Set(categories) : null;
    const yesterdayIds = getYesterdaySeenIds();

    // --- Filter both pools ---
     const filterItem = (item, typeField) => {
       if (!christianEnabled && item.is_christian) return false;
       if (preferredCats && preferredCats.size > 0 && !preferredCats.has(item.category)) return false;
       return true;
     };

    const libPool = libraryItems
      .filter(item => item.status === 'active' && filterItem(item, 'content_type'))
      .map(item => ({ ...item, source: 'library' }));

    const entryPool = userEntries
      .filter(entry => entry.status === 'active' && filterItem(entry, 'entry_type'))
      .map(entry => ({ ...entry, source: 'user_entry' }));

    // --- Anniversary entries surface first ---
    const anniversaryEntries = entryPool.filter(isAnniversaryToday);
    const regularEntries = entryPool.filter(e => !isAnniversaryToday(e));

    // --- Ratio: more personal entries as vault grows ---
    // 0 entries → 0% personal; 5+ entries → 40%; 15+ → 60%; 30+ → 80%
    const totalPersonal = entryPool.length;
    const targetPersonalCount = totalPersonal === 0 ? 0
      : totalPersonal < 5 ? 1
      : totalPersonal < 15 ? 2
      : totalPersonal < 30 ? 3
      : 4;

    const SESSION_SIZE = 5; // 1 featured + 4 supporting

    // Shuffle with category weighting
    const shuffledEntries = weightedShuffle([...anniversaryEntries, ...regularEntries], categories);
    const shuffledLib = weightedShuffle(libPool, categories);

    // Deprioritize items seen yesterday
    const sortFn = (a, b) => {
      const aYest = yesterdayIds.has(a.id) ? 1 : 0;
      const bYest = yesterdayIds.has(b.id) ? 1 : 0;
      return aYest - bYest;
    };
    shuffledEntries.sort(sortFn);
    shuffledLib.sort(sortFn);

    // Pick personal entries up to target, fill rest from library, no duplicates
    const picked = [];
    const pickedIds = new Set();

    const addItem = (item) => {
      if (pickedIds.has(item.id)) return false;
      picked.push(item);
      pickedIds.add(item.id);
      return true;
    };

    // Always include anniversary entries first
    anniversaryEntries.forEach(addItem);

    // Fill personal slots
    let personalAdded = anniversaryEntries.length;
    for (const e of shuffledEntries) {
      if (personalAdded >= targetPersonalCount || picked.length >= SESSION_SIZE) break;
      if (!anniversaryEntries.find(a => a.id === e.id)) {
        if (addItem(e)) personalAdded++;
      }
    }

    // Fill remaining from library
    for (const lib of shuffledLib) {
      if (picked.length >= SESSION_SIZE) break;
      addItem(lib);
    }

    // If still short (tiny library + few entries), pull more personal entries
    for (const e of shuffledEntries) {
      if (picked.length >= SESSION_SIZE) break;
      addItem(e);
    }

    // Save today's seen IDs for tomorrow's dedup
    saveTodaySeenIds(picked.map(p => p.id));

    // --- Pick featured: prefer quote/affirmation/scripture ---
    const featuredTypes = new Set(['quote', 'affirmation', 'scripture']);
    const featuredIdx = picked.findIndex(item =>
      featuredTypes.has(item.content_type || item.entry_type)
    );

    let featured, supporting;
    if (featuredIdx >= 0) {
      featured = picked[featuredIdx];
      supporting = picked.filter((_, i) => i !== featuredIdx);
    } else {
      featured = picked[0];
      supporting = picked.slice(1);
    }

    return { featured, supporting };
  }, [libraryItems, userEntries, categories, christianEnabled, shuffleKey]);

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
          <UpliftCard key={`${shuffleKey}-${i}-${item.id}`} item={item} source={item.source} />
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