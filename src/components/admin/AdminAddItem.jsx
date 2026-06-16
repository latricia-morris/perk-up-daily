import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CONTENT_TYPES, CATEGORIES } from '@/lib/constants';
import { Check, Loader2 } from 'lucide-react';

export default function AdminAddItem() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    content_type: '',
    body: '',
    category: '',
    tags: '',
    status: 'active',
    scheduled_date: '',
  });
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.AppLibrary.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-library'] });
      setForm({ content_type: '', body: '', category: '', tags: '', status: 'active', scheduled_date: '' });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSubmit = () => {
    if (!form.content_type || !form.body || !form.category) return;
    mutation.mutate(form);
  };

  return (
    <div className="max-w-lg">
      <h2 className="font-display text-lg font-semibold mb-6">Add Library Item</h2>

      <div className="space-y-5">
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Content Type</Label>
          <Select value={form.content_type} onValueChange={v => setForm(prev => ({ ...prev, content_type: v }))}>
            <SelectTrigger><SelectValue placeholder="Choose type" /></SelectTrigger>
            <SelectContent>
              {CONTENT_TYPES.map(t => <SelectItem key={t.slug} value={t.slug}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-1.5 block">Category</Label>
          <Select value={form.category} onValueChange={v => setForm(prev => ({ ...prev, category: v }))}>
            <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-1.5 block">Body</Label>
          <Textarea
            value={form.body}
            onChange={e => setForm(prev => ({ ...prev, body: e.target.value }))}
            placeholder="The content text..."
            className="min-h-[100px]"
          />
        </div>

        <div>
          <Label className="text-sm font-medium mb-1.5 block">Tags <span className="text-muted-foreground">(optional)</span></Label>
          <Input value={form.tags} onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))} placeholder="morning, strength, hope" />
        </div>

        <div>
          <Label className="text-sm font-medium mb-1.5 block">Scheduled Date <span className="text-muted-foreground">(optional)</span></Label>
          <Input type="date" value={form.scheduled_date} onChange={e => setForm(prev => ({ ...prev, scheduled_date: e.target.value }))} />
          <p className="text-xs text-muted-foreground mt-1">If set, item goes active on this date.</p>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm">Active immediately</Label>
          <Switch
            checked={form.status === 'active'}
            onCheckedChange={v => setForm(prev => ({ ...prev, status: v ? 'active' : 'archived' }))}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={mutation.isPending || !form.body || !form.content_type || !form.category}
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
        >
          {mutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : saved ? (
            <Check className="w-4 h-4 mr-2" />
          ) : null}
          {saved ? 'Added!' : 'Add to library'}
        </Button>
      </div>
    </div>
  );
}