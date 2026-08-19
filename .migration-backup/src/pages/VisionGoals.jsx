import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getSchema } from '@/lib/contentSchema';
import { getFilteredCategories } from '@/lib/constants';
import { sortByTargetDate } from '@/lib/visionGoals';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import VisionGoalCard from '@/components/vision/VisionGoalCard';
import { Target, PlusCircle } from 'lucide-react';

export default function VisionGoals() {
  const [user, setUser] = useState(null);
  const [catFilter, setCatFilter] = useState('all');

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: entries = [] } = useQuery({
    queryKey: ['vision-goals'],
    queryFn: () => base44.entities.UserEntry.filter({ entry_type: 'vision_goal' }, '-created_date'),
  });

  const christianEnabled = user?.christian_content || false;
  const categories = getFilteredCategories(christianEnabled);

  const filtered = entries.filter(e => {
    if (!christianEnabled && e.category === 'deep_faith') return false;
    if (catFilter !== 'all' && e.category !== catFilter) return false;
    return true;
  });

  const sorted = sortByTargetDate(filtered);

  return (
    <div>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-display text-2xl font-semibold text-foreground">Vision & Goals</h1>
          <Link to="/add-entry" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            <PlusCircle className="w-4 h-4" /> Add
          </Link>
        </div>
        <p className="text-sm mb-6" style={{ color: '#7a5c3a' }}>{getSchema('vision_goal')?.descriptor}</p>

        {/* Category filter */}
        <div className="mb-6">
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Target className="w-8 h-8 mx-auto mb-3 text-text-faint" />
            <p className="text-sm">No visions yet. What are you chasing?</p>
            <Link to="/add-entry" className="inline-block mt-4 text-sm text-primary underline">
              Add your first vision →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((entry, i) => (
              <VisionGoalCard key={entry.id} entry={entry} index={i} christianEnabled={christianEnabled} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}