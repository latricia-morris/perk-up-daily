import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Loader2, Archive, CheckCircle2 } from 'lucide-react';
import CategoryBadge from '@/components/shared/CategoryBadge';
import { CATEGORIES } from '@/lib/constants';

export default function AdminMindsetPrompts() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ prompt: '', category: 'general', status: 'active' });
  const [saved, setSaved] = useState(false);

  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ['admin-mindset-prompts'],
    queryFn: () => base44.entities.ReflectionPrompt.list('-created_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ReflectionPrompt.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mindset-prompts'] });
      setForm({ prompt: '', category: 'general', status: 'active' });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ReflectionPrompt.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-mindset-prompts'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ReflectionPrompt.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-mindset-prompts'] }),
  });

  const handleSubmit = () => {
    if (!form.prompt.trim()) return;
    createMutation.mutate(form);
  };

  return (
    <div className="max-w-2xl">
      {/* Add new prompt */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-4">
        <h3 className="font-display text-sm font-semibold text-foreground">Add Mindset Training Prompt</h3>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Prompt</Label>
          <Textarea
            value={form.prompt}
            onChange={e => setForm(prev => ({ ...prev, prompt: e.target.value }))}
            placeholder="e.g. What's one thing going right in your life right now?"
            className="min-h-[80px]"
            maxLength={500}
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <Label className="text-sm font-medium mb-1.5 block">Category</Label>
            <Select value={form.category} onValueChange={v => setForm(prev => ({ ...prev, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label className="text-sm font-medium mb-1.5 block">Status</Label>
            <Select value={form.status} onValueChange={v => setForm(prev => ({ ...prev, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={createMutation.isPending || !form.prompt.trim()}
          className="w-full bg-primary hover:bg-primary/90"
          size="sm"
        >
          {createMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : saved ? (
            <CheckCircle2 className="w-4 h-4 mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          {saved ? 'Added!' : 'Add prompt'}
        </Button>
      </div>

      {/* Existing prompts */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">{prompts.length} prompts total</p>
          {prompts.map(prompt => (
            <div key={prompt.id} className="bg-card border border-border rounded-lg p-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{prompt.prompt}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  {prompt.category && prompt.category !== 'general' && (
                    <CategoryBadge category={prompt.category} />
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    prompt.status === 'active'
                      ? 'bg-secondary/20 text-secondary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {prompt.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateMutation.mutate({
                    id: prompt.id,
                    data: { status: prompt.status === 'active' ? 'archived' : 'active' }
                  })}
                  className="h-7 w-7 p-0"
                >
                  {prompt.status === 'active' ? <Archive className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(prompt.id)}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          {prompts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No prompts yet. Add one above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}