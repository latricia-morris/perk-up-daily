import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CategoryBadge from '@/components/shared/CategoryBadge';
import { getFilteredCategories } from '@/lib/constants';
import { PROGRESS_STAGES, getStageLabel } from '@/lib/visionGoals';

/**
 * Library card for Vision & Goals entries.
 * Layout:
 *   line 1: title
 *   line 2: body preview
 *   line 3 left: entered date | line 3 right: target date
 *   line 4: category
 */
export default function VisionGoalCard({ entry, index, christianEnabled }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    title: entry.title || '',
    body: entry.body || '',
    target_date: entry.target_date || '',
    progress_stage: entry.progress_stage || 'looking_ahead',
    category: entry.category || '',
  });

  const categories = getFilteredCategories(christianEnabled);

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.UserEntry.update(entry.id, form);
    setSaving(false);
    setEditing(false);
    queryClient.invalidateQueries({ queryKey: ['vision-goals'] });
    queryClient.invalidateQueries({ queryKey: ['user-entries'] });
  };

  const handleDelete = async () => {
    setDeleting(true);
    await base44.entities.UserEntry.delete(entry.id);
    queryClient.invalidateQueries({ queryKey: ['vision-goals'] });
    queryClient.invalidateQueries({ queryKey: ['user-entries'] });
  };

  if (deleting) return null;

  const enteredDate = entry.created_date ? format(new Date(entry.created_date), 'MMM d, yyyy') : '';
  const targetDate = entry.target_date ? format(new Date(entry.target_date), 'MMM d, yyyy') : '';
  const stageLabel = getStageLabel(entry.progress_stage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: (index || 0) * 0.03 }}
      className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow"
    >
      {editing ? (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Title</p>
            <Input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="What's the vision?"
              className="text-sm"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Description</p>
            <Textarea
              value={form.body}
              onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
              placeholder="Why does this matter to you?"
              className="min-h-[80px] text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Target date</p>
              <Input
                type="date"
                value={form.target_date}
                onChange={e => setForm(p => ({ ...p, target_date: e.target.value }))}
                className="text-sm"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Stage</p>
              <Select value={form.progress_stage} onValueChange={v => setForm(p => ({ ...p, progress_stage: v }))}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROGRESS_STAGES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
            <SelectTrigger className="text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-xs text-muted-foreground px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">
              <X className="w-3 h-3" /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white transition-colors" style={{ background: '#2D6A4F' }}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <div className="flex-1 min-w-0">
            {/* Line 1: title */}
            <p className="text-sm font-semibold text-foreground leading-snug">{entry.title || 'Untitled vision'}</p>

            {/* Line 2: body preview */}
            {entry.body && (
              <p className="text-sm text-muted-foreground leading-relaxed mt-1 line-clamp-2">{entry.body}</p>
            )}

            {/* Line 3: entered date (left) | target date (right) */}
            <div className="flex items-center justify-between mt-2 gap-3">
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {enteredDate ? `📝 ${enteredDate}` : ''}
              </span>
              <span className="text-[10px] font-medium whitespace-nowrap" style={{ color: '#2D6A4F' }}>
                {targetDate ? `🎯 ${targetDate}` : ''}
              </span>
            </div>

            {/* Line 4: category + stage */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <CategoryBadge category={entry.category} />
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(45,106,79,0.12)', color: '#2D6A4F' }}>
                {stageLabel}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 ml-1 shrink-0">
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleDelete} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}