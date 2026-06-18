import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Pencil, Trash2, X, Check, Upload, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { getEntryTypeLabel, getFilteredCategories } from '@/lib/constants';
import { buildFormFromEntry, serializeEntry } from '@/lib/contentSchema';
import CategoryBadge from '@/components/shared/CategoryBadge';
import ShareCard from '@/components/shared/ShareCard';
import EntryDetailModal from '@/components/shared/EntryDetailModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EntryFormFields } from '@/pages/AddEntry';

export default function VaultEntryCard({ entry, index, christianEnabled, isLibrary = false }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // Build form state from canonical schema
  const [form, setForm] = useState(() => buildFormFromEntry(entry));

  const categories = getFilteredCategories(christianEnabled);
  const entryType = entry.entry_type || entry.content_type;

  const updateMutation = useMutation({
    mutationFn: (data) => {
      if (isLibrary) {
        return base44.entities.AppLibrary.update(entry.id, {
          author: data.author,
          body: data.body,
          category: data.category,
          is_christian: entry.is_christian,
        });
      }
      const payload = serializeEntry(entryType, data);
      delete payload.entry_type; // don't overwrite type on update
      return base44.entities.UserEntry.update(entry.id, payload);
    },
    onMutate: async (newData) => {
      const key = isLibrary ? 'admin-library' : 'vault-entries';
      await queryClient.cancelQueries({ queryKey: [key] });
      const old = queryClient.getQueryData([key]);
      queryClient.setQueryData([key], (prev) =>
        prev.map(e => e.id === entry.id ? { ...e, ...newData, updated_date: new Date().toISOString() } : e)
      );
      return old;
    },
    onSuccess: () => {
      setEditing(false);
      const key = isLibrary ? 'admin-library' : 'vault-entries';
      queryClient.invalidateQueries({ queryKey: [key] });
    },
    onError: (err, vars, context) => {
      const key = isLibrary ? 'admin-library' : 'vault-entries';
      if (context) queryClient.setQueryData([key], context);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => isLibrary ? base44.entities.AppLibrary.delete(entry.id) : base44.entities.UserEntry.delete(entry.id),
    onMutate: async () => {
      const key = isLibrary ? 'admin-library' : 'vault-entries';
      await queryClient.cancelQueries({ queryKey: [key] });
      const old = queryClient.getQueryData([key]);
      queryClient.setQueryData([key], (prev) => prev.filter(e => e.id !== entry.id));
      return old;
    },
    onError: (err, vars, context) => {
      const key = isLibrary ? 'admin-library' : 'vault-entries';
      if (context) queryClient.setQueryData([key], context);
    },
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, photo_url: file_url }));
    setUploading(false);
  };

  if (deleteMutation.isPending) return null;

  // Canonical display values
  const displayBody = form.body || entry.body;
  const displayAuthor = form.author || entry.author;
  const displayReference = form.reference || entry.reference;
  const displayPhoto = form.photo_url || entry.photo_url;
  const displayDate = form.entry_date || entry.entry_date;

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
            <EntryFormFields
              entryType={entryType}
              form={form}
              setForm={setForm}
              uploading={uploading}
              onPhotoUpload={handlePhotoUpload}
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

            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1 text-xs text-muted-foreground px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <X className="w-3 h-3" /> Cancel
              </button>
              <button
                onClick={() => updateMutation.mutate(form)}
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
            {displayPhoto && (
              <img src={displayPhoto} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              {entryType === 'identity_swap' ? (
                <div className="space-y-2">
                  {entry.old_belief && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">My Old Lie-dentity</p>
                      <p className="text-xs text-muted-foreground line-through leading-relaxed">{entry.old_belief}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#d4830a' }}>My True Identity</p>
                    <p className="text-sm font-semibold text-foreground leading-relaxed">{displayBody}</p>
                  </div>
                </div>
              ) : (
                <>
                  {(entryType === 'quote' && displayAuthor) && (
                    <p className="text-sm font-semibold text-foreground mb-0.5">{displayAuthor}</p>
                  )}
                  {(entryType === 'scripture' && displayReference) && (
                    <p className="text-sm font-semibold text-foreground mb-0.5">{displayReference}</p>
                  )}
                  <p className="text-sm text-foreground leading-relaxed line-clamp-2">{displayBody}</p>
                </>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {getEntryTypeLabel(entryType)}
                </span>
                <CategoryBadge category={form.category || entry.category} />
                {displayDate && (
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(displayDate), 'MMM d, yyyy')}
                  </span>
                )}
                {entry.status === 'draft' && (
                  <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Draft</span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1 ml-1 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setEditing(true); }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <ShareCard item={{ ...entry, ...form }} />
              <button
                onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(); }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-[#9a3552] hover:bg-[#9a3552]/10 transition-colors"
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