import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bug, Loader2, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function BugReportSection({ user }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    report_type: 'bug',
  });

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.BugReport.create(data),
    onSuccess: () => {
      setForm({ title: '', description: '', report_type: 'bug' });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setExpanded(false);
    },
  });

  const handleSubmit = () => {
    if (!form.title.trim() || !form.description.trim()) return;
    mutation.mutate({
      ...form,
      reporter_id: user?.id,
      reporter_email: user?.email,
      reporter_name: user?.full_name,
      page_url: window.location.pathname,
    });
  };

  return (
    <section>
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Help & Feedback</h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-4 transition-colors hover:bg-accent/30"
        >
          <div className="flex items-center gap-2 flex-1 text-left">
            <Bug className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Report an issue or suggest a feature</p>
              <p className="text-xs text-muted-foreground mt-0.5">Spotted a bug? Have an idea? Let us know.</p>
            </div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-border">
            <div className="pt-4">
              <Label className="text-sm font-medium mb-1.5 block">Type</Label>
              <Select value={form.report_type} onValueChange={v => setForm(prev => ({ ...prev, report_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug / Issue</SelectItem>
                  <SelectItem value="feature_request">Feature Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-1.5 block">Summary</Label>
              <Input
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief summary of the issue"
                maxLength={120}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1.5 block">Details</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What happened? What did you expect? Any steps to reproduce?"
                className="min-h-[100px]"
                maxLength={2000}
              />
            </div>

            {saved && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="w-4 h-4" /> Thank you! Your report has been submitted.
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={mutation.isPending || !form.title.trim() || !form.description.trim()}
              className="w-full bg-primary hover:bg-primary/90"
              size="sm"
            >
              {mutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {mutation.isPending ? 'Submitting…' : 'Submit report'}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}