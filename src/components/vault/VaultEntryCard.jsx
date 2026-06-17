import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Pencil, Trash2, X, Check, Upload, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { getEntryTypeLabel, getFilteredCategories, getFilteredEntryTypes } from '@/lib/constants';
import CategoryBadge from '@/components/shared/CategoryBadge';
import ShareCard from '@/components/shared/ShareCard';
import EntryDetailModal from '@/components/shared/EntryDetailModal';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function VaultEntryCard({ entry, index, christianEnabled }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [form, setForm] = useState({
    title: entry.title || '',
    body: entry.body || '',
    category: entry.category || '',
    entry_date: entry.entry_date || '',
    photo_url: entry.photo_url || '',
  });

  const categories = getFilteredCategories(christianEnabled);
  const entryTypes = getFilteredEntryTypes(christianEnabled);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.UserEntry.update(entry.id, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['vault-entries'] });
      const old = queryClient.getQueryData(['vault-entries']);
      queryClient.setQueryData(['vault-entries'], (prev) =>
        prev.map(e => e.id === entry.id ? { ...e, ...newData, updated_date: new Date().toISOString() } : e)
      );
      return old;
    },
    onSuccess: () => {
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ['vault-entries'] });
    },
    onError: (err, vars, context) => {
      if (context) queryClient.setQueryData(['vault-entries'], context);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.UserEntry.delete(entry.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['vault-entries'] });
      const old = queryClient.getQueryData(['vault-entries']);
      queryClient.setQueryData(['vault-entries'], (prev) =>
        prev.filter(e => e.id !== entry.id)
      );
      return old;
    },
    onError: (err, vars, context) => {
      if (context) queryClient.setQueryData(['vault-entries'], context);
    },
  });

  const handleSave = async () => {
    updateMutation.mutate(form);
  };

  const handleDelete = async () => {
    deleteMutation.mutate();
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, photo_url: file_url }));
    setUploading(false);
  };

  if (deleteMutation.isPending) return null;

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow"
    >
      {editing ? (
        <div className="space-y-3">
          <Input
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="Title (optional)"
            className="text-sm"
          />
          <Textarea
            value={form.body}
            onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
            className="min-h-[80px] text-sm"
          />
          <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={form.entry_date}
            onChange={e => setForm(p => ({ ...p, entry_date: e.target.value }))}
            className="text-sm"
          />

          {/* Photo */}
          {form.photo_url ? (
            <div className="relative">
              <img src={form.photo_url} alt="" className="w-full h-36 object-cover rounded-lg" />
              <button
                onClick={() => setForm(p => ({ ...p, photo_url: '' }))}
                className="absolute top-2 right-2 bg-foreground/50 text-background rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 border border-dashed border-border rounded-lg p-3 cursor-pointer hover:border-primary/40 transition-colors">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : <Upload className="w-4 h-4 text-muted-foreground" />}
              <span className="text-xs text-muted-foreground">{uploading ? 'Uploading...' : 'Attach a photo'}</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 text-xs text-muted-foreground px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-primary-foreground transition-colors"
              style={{ background: '#d4830a' }}
            >
              {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 cursor-pointer hover:opacity-75 transition-opacity" onClick={() => setDetailOpen(true)}>
          {(entry.photo_url || form.photo_url) && (
            <img
              src={form.photo_url || entry.photo_url}
              alt=""
              className="w-14 h-14 rounded-lg object-cover shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            {entry.entry_type === 'identity_swap' ? (
              <div className="space-y-2">
                {/* Old lie — struck through, faded */}
                {entry.old_belief && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">My Old Lie-dentity</p>
                    <p className="text-xs text-muted-foreground line-through leading-relaxed">{entry.old_belief}</p>
                  </div>
                )}
                {/* True identity — bold and clear */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#d4830a' }}>My True Identity</p>
                  <p className="text-sm font-semibold text-foreground leading-relaxed">{form.body || entry.body}</p>
                </div>
              </div>
            ) : (
              <>
                {(form.title || entry.title) && (
                  <p className="text-sm font-semibold text-foreground mb-0.5">{form.title || entry.title}</p>
                )}
                <p className="text-sm text-foreground leading-relaxed line-clamp-2">{form.body || entry.body}</p>
              </>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {getEntryTypeLabel(entry.entry_type)}
              </span>
              <CategoryBadge category={form.category || entry.category} />
              {(form.entry_date || entry.entry_date) && (
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(form.entry_date || entry.entry_date), 'MMM d, yyyy')}
                </span>
              )}
              {entry.status === 'draft' && (
                <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                  Draft
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1 ml-1 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <ShareCard item={{ ...entry, ...form }} />
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
    <AnimatePresence>
      {detailOpen && <EntryDetailModal item={entry} onClose={() => setDetailOpen(false)} />}
    </AnimatePresence>
    </>
  );
}