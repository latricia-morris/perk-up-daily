import { useState, useEffect } from 'react';
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
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    content_type: '',
    body: '',
    author: '',
    category: '',
    is_christian: false,
    status: 'active',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u));
  }, []);

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.AppLibrary.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-library'] });
      setForm({ 
        content_type: '', 
        body: '', 
        author: user?.full_name || '', 
        category: '', 
        is_christian: false, 
        status: 'active' 
      });
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
          {form.content_type === 'power_up' && (
            <p className="text-xs text-muted-foreground mt-1">Power-Ups should not receive more than one daily unless users shuffle to it.</p>
          )}
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
          <Label className="text-sm font-medium mb-1.5 block">
            Author / Attribution
            {form.content_type === 'quote' && <span className="text-destructive ml-1">*</span>}
            {form.content_type === 'power_up' && <span className="text-muted-foreground ml-1">(auto-filled with your name)</span>}
            {form.content_type !== 'quote' && form.content_type !== 'power_up' && <span className="text-muted-foreground ml-1">(optional)</span>}
          </Label>
          <Input
            value={form.author}
            onChange={e => setForm(prev => ({ ...prev, author: e.target.value }))}
            placeholder={
              form.content_type === 'scripture' ? 'e.g. Jeremiah 29:11 NIV' : 
              form.content_type === 'power_up' ? user?.full_name || 'Author name' :
              'Author name'
            }
          />
          {form.content_type === 'scripture' && (
            <p className="text-xs text-muted-foreground mt-1">Use the Bible reference as the author (e.g. John 3:16 NIV)</p>
          )}
          {form.content_type === 'power_up' && (
            <p className="text-xs text-muted-foreground mt-1">Leave blank to exclude author attribution on the card.</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm">Christian content</Label>
          <Switch
            checked={form.is_christian}
            onCheckedChange={v => setForm(prev => ({ ...prev, is_christian: v }))}
          />
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