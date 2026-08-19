import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Upload, Loader2, Check, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

/**
 * Dialog shown when a user marks a vision_goal as "crushed_it".
 * Prefills the goal content into an editable life_win form,
 * then creates a life_win entry and deletes the original vision_goal.
 */
export default function CrushedItDialog({ entry, open, onClose, onSaved }) {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    body: entry?.body || entry?.title || '',
    entry_date: today,
    category: entry?.category || '',
    photo_url: entry?.photo_url || '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fireConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 70,
        origin: { x: 0 },
        colors: ['#FFAD09', '#F95826', '#2D6A4F', '#BA1650', '#8ECAE6'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 70,
        origin: { x: 1 },
        colors: ['#FFAD09', '#F95826', '#2D6A4F', '#BA1650', '#8ECAE6'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  // Fire confetti when dialog opens
  useEffect(() => {
    if (open) fireConfetti();
  }, [open]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, photo_url: file_url }));
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Create the life_win entry
      await base44.entities.UserEntry.create({
        entry_type: 'life_win',
        body: form.body,
        category: form.category,
        entry_date: form.entry_date,
        photo_url: form.photo_url || undefined,
        status: 'active',
      });
      // Delete the original vision_goal entry
      await base44.entities.UserEntry.delete(entry.id);
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['vision-goals'] });
      queryClient.invalidateQueries({ queryKey: ['user-entries'] });
      queryClient.invalidateQueries({ queryKey: ['life-wins'] });
      queryClient.invalidateQueries({ queryKey: ['vault-entries'] });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save crushed goal:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Let’s save this with your Life Wins</DialogTitle>
          <DialogDescription>
            You crushed it! Save this win so it lives on in your Life Wins timeline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Photo */}
          <div>
            {form.photo_url ? (
              <div className="relative">
                <img src={form.photo_url} alt="" className="w-full h-40 object-cover rounded-lg" />
                <button
                  onClick={() => setForm(prev => ({ ...prev, photo_url: '' }))}
                  className="absolute top-2 right-2 bg-foreground/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary/40 transition-colors">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                <span className="text-sm text-muted-foreground">{uploading ? 'Uploading...' : 'Add a photo'}</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
            <p className="text-[10px] text-muted-foreground mt-1 text-center">Tip: Use a wide/landscape photo to minimize cropping.</p>
          </div>

          {/* Body */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Your win</p>
            <Textarea
              value={form.body}
              onChange={e => setForm(prev => ({ ...prev, body: e.target.value }))}
              placeholder="Describe your win..."
              className="min-h-[80px] text-sm"
            />
          </div>

          {/* Date */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Date</p>
            <Input
              type="date"
              value={form.entry_date}
              onChange={e => setForm(prev => ({ ...prev, entry_date: e.target.value }))}
              className="text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !form.body}
              style={{ background: '#2D6A4F' }}
              className="text-white hover:opacity-90"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
              Save to Life Wins
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}