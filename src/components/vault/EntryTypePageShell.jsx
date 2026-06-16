import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import CategoryBadge from '@/components/shared/CategoryBadge';
import { Link } from 'react-router-dom';
import { PlusCircle, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

function EntryCard({ entry, index, queryKey }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    title: entry.title || '',
    body: entry.body || '',
    old_belief: entry.old_belief || '',
  });

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.UserEntry.update(entry.id, form);
    setSaving(false);
    setEditing(false);
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  };

  const handleDelete = async () => {
    setDeleting(true);
    await base44.entities.UserEntry.delete(entry.id);
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  };

  if (deleting) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="bg-card border border-border rounded-xl p-4"
    >
      {editing ? (
        <div className="space-y-3">
          {entry.entry_type === 'identity_swap' ? (
            <>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">My Old Lie-dentity</p>
                <Textarea value={form.old_belief} onChange={e => setForm(p => ({ ...p, old_belief: e.target.value }))} className="min-h-[70px] text-sm" />
              </div>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: '#d4830a' }}>My True Identity</p>
                <Textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} className="min-h-[70px] text-sm" />
              </div>
            </>
          ) : (
            <>
              {(entry.entry_type === 'quote' || entry.entry_type === 'scripture') && (
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder={entry.entry_type === 'quote' ? 'Author' : 'Reference'} className="text-sm" />
              )}
              <Textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} className="min-h-[80px] text-sm" />
            </>
          )}
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-xs text-muted-foreground px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">
              <X className="w-3 h-3" /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-primary-foreground transition-colors" style={{ background: '#d4830a' }}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <div className="flex-1 min-w-0">
            {entry.entry_type === 'identity_swap' ? (
              <div className="space-y-2">
                {entry.old_belief && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">My Old Lie-dentity</p>
                    <p className="text-xs text-muted-foreground line-through leading-relaxed">{entry.old_belief}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#d4830a' }}>My True Identity</p>
                  <p className="text-sm font-semibold text-foreground leading-relaxed">{entry.body}</p>
                </div>
              </div>
            ) : (
              <>
                {entry.photo_url && <img src={entry.photo_url} alt="" className="w-full h-40 object-cover rounded-lg mb-3" />}
                {(form.title || entry.title) && <p className="text-sm font-semibold text-foreground mb-0.5">{form.title || entry.title}</p>}
                <p className="text-sm text-foreground leading-relaxed">{entry.body}</p>
              </>
            )}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <CategoryBadge category={entry.category} />
              {entry.location && (
                <span className="text-[10px] text-muted-foreground">📍 {entry.location}</span>
              )}
              {entry.entry_date && (
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(entry.entry_date), 'MMM d, yyyy')}
                </span>
              )}
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

export default function EntryTypePageShell({ title, icon: Icon, entries, user, emptyText, queryKey }) {
  return (
    <div>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-semibold text-foreground">{title}</h1>
          <Link to="/add-entry" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            <PlusCircle className="w-4 h-4" /> Add
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Icon className="w-8 h-8 mx-auto mb-3 text-text-faint" />
            <p className="text-sm">{emptyText}</p>
            <Link to="/add-entry" className="inline-block mt-4 text-sm text-primary underline">
              Add your first entry →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {entries.map((entry, i) => (
                <EntryCard key={entry.id} entry={entry} index={i} queryKey={queryKey} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}