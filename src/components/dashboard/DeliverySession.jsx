import { useState, useMemo } from 'react';
import { Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UpliftCard from '@/components/shared/UpliftCard';
import { getGreeting } from '@/lib/constants';

const TILES_PER_SESSION = 3;

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Check if an entry is an anniversary today (same month/day)
function isAnniversaryToday(entry) {
  if (!entry.entry_date) return false;
  const today = new Date();
  const d = new Date(entry.entry_date);
  return d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
}

// Get today's session cache from localStorage
function getSessionCache() {
  try {
    const raw = localStorage.getItem('perkup-session-cache');
    if (!raw) return null;
    const data = JSON.parse(raw);
    const today = new Date().toISOString().split('T')[0];
    if (data.date !== today) return null;
    return data; // { date, morning: [ids], midday: [ids] }
  } catch { return null; }
}

function saveSessionCache(session, ids) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const existing = getSessionCache() || { date: today };
    existing[session] = ids;
    existing.date = today;
    localStorage.setItem('perkup-session-cache', JSON.stringify(existing));
  } catch {}
}

/**
 * Select TILES_PER_SESSION items with content-type diversity.
 * Groups eligible content by content type, then picks 1 per type (3 different types).
 * Deprioritizes IDs already used in another session today.
 */
function selectDiverseTiles(pool, avoidIds = new Set(), shuffleSeed = 0) {
  // Normalize type field
  const typeOf = item => item.content_type || item.entry_type || 'unknown';
  const normalizeType = t => {
    if (t === 'accomplishment' || t === 'milestone') return 'life_win';
    if (t === 'encouragement_note') return 'personal_note';
    return t;
  };

  // Group by normalized content type
  const byType = {};
  for (const item of pool) {
    const type = normalizeType(typeOf(item));
    if (!byType[type]) byType[type] = [];
    byType[type].push(item);
  }

  // Shuffle within each type bucket, deprioritizing already-used IDs
  for (const type in byType) {
    byType[type] = shuffleArray(byType[type]).sort((a, b) => {
      const aUsed = avoidIds.has(a.id) ? 1 : 0;
      const bUsed = avoidIds.has(b.id) ? 1 : 0;
      return aUsed - bUsed;
    });
    // Anniversary entries bubble to top within their type
    byType[type].sort((a, b) => {
      const aAnn = isAnniversaryToday(a) ? -1 : 0;
      const bAnn = isAnniversaryToday(b) ? -1 : 0;
      return aAnn - bAnn;
    });
  }

  // Pick up to TILES_PER_SESSION different types
  const typeKeys = shuffleArray(Object.keys(byType));
  const picked = [];
  const usedTypes = new Set();

  for (const type of typeKeys) {
    if (picked.length >= TILES_PER_SESSION) break;
    if (usedTypes.has(type)) continue;
    const candidates = byType[type];
    if (candidates.length > 0) {
      picked.push(candidates[0]);
      usedTypes.add(type);
    }
  }

  // If we still need more (fewer than 3 types available), fill from remaining entries
  if (picked.length < TILES_PER_SESSION) {
    const pickedIds = new Set(picked.map(p => p.id));
    for (const type of typeKeys) {
      for (const item of byType[type] || []) {
        if (picked.length >= TILES_PER_SESSION) break;
        if (!pickedIds.has(item.id)) {
          picked.push(item);
          pickedIds.add(item.id);
        }
      }
      if (picked.length >= TILES_PER_SESSION) break;
    }
  }

  return picked;
}

export default function DeliverySession({ libraryItems, userEntries, categories, christianEnabled }) {
  const [shuffleKey, setShuffleKey] = useState(0);
  const { session: sessionName } = getGreeting();

  const tiles = useMemo(() => {
    const preferredCats = categories && categories.length > 0 ? new Set(categories) : null;

    const filterItem = (item) => {
      if (!christianEnabled && item.is_christian) return false;
      // Category filter is a soft preference, not a hard exclusion —
      // only filter when preferred cats are set AND the item has a category
      if (preferredCats && preferredCats.size > 0 && item.category && !preferredCats.has(item.category)) return false;
      return true;
    };

    const libPool = libraryItems
      .filter(item => item.status === 'active' && filterItem(item))
      .map(item => ({ ...item, source: 'library' }));

    const entryPool = userEntries
      .filter(entry => entry.status === 'active' && filterItem(entry))
      .map(entry => ({ ...entry, source: 'user_entry' }));

    const fullPool = [...entryPool, ...libPool];

    // Get IDs already used in the other session today to avoid cross-session repeats
    const cache = getSessionCache();
    const otherSession = sessionName === 'morning' ? 'midday' : 'morning';
    const avoidIds = new Set(cache?.[otherSession] || []);

    const selected = selectDiverseTiles(fullPool, avoidIds, shuffleKey);

    // Cache this session's IDs for today
    saveSessionCache(sessionName, selected.map(s => s.id));

    return selected;
  }, [libraryItems, userEntries, categories, christianEnabled, shuffleKey, sessionName]);

  if (tiles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No content available yet. Start by adding some entries!</p>
      </div>
    );
  }

  const [featured, ...supporting] = tiles;

  return (
    <div>
      <UpliftCard item={featured} featured source={featured.source} />

      {supporting.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {supporting.map((item, i) => (
            <UpliftCard key={`${shuffleKey}-${i}-${item.id}`} item={item} source={item.source} />
          ))}
        </div>
      )}

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