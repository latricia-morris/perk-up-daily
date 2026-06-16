import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PenLine, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getFilteredCategories } from '@/lib/constants';

const PROMPTS = [
  'What was one good thing that happened today?',
  'Who showed up for you today, even in a small way?',
  'What did you do well today?',
  'What moment today are you glad happened?',
  'What felt like a win today, big or small?',
  'What are you grateful for from today?',
];

export default function EveningPrompt({ christianEnabled }) {
  const navigate = useNavigate();
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const categories = getFilteredCategories(christianEnabled);

  // Pick a stable prompt for the session
  const prompt = PROMPTS[new Date().getDate() % PROMPTS.length];

  const handleSave = async () => {
    if (!body.trim() || !category) return;
    setSaving(true);
    await base44.entities.UserEntry.create({
      entry_type: 'experience',
      body: body.trim(),
      category,
      entry_date: new Date().toISOString().split('T')[0],
      status: 'active',
    });
    setSaving(false);
    setSaved(true);
  };

  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-8 text-center bg-card"
        style={{
          background: 'linear-gradient(135deg, rgba(232,168,56,0.14) 0%, hsl(var(--card)) 60%)',
          border: '1px solid hsl(var(--border))',
        }}
      >
        <p className="font-display text-xl font-semibold mb-2" style={{ color: '#2c1e0f' }}>
          Captured.
        </p>
        <p className="text-sm mb-6" style={{ color: '#7a5c3a' }}>
          That's the good stuff. It'll find you again when you need it.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setBody(''); setCategory(''); setSaved(false); }}
          >
            Add another
          </Button>
          <Button
            size="sm"
            style={{ background: '#d4830a', color: '#fef9f2' }}
            onClick={() => navigate('/vault')}
          >
            View vault <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 bg-card"
      style={{
        background: 'linear-gradient(135deg, rgba(232,168,56,0.14) 0%, hsl(var(--card)) 60%)',
        border: '1px solid hsl(var(--border))',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <PenLine className="w-4 h-4" style={{ color: '#d4830a' }} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#d4830a' }}>
          Evening Reflection
        </span>
      </div>

      <p className="font-display text-lg font-semibold mb-5" style={{ color: '#2c1e0f' }}>
        {prompt}
      </p>

      <div className="space-y-3">
        <Textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Write it down..."
          className="min-h-[90px] bg-white/70 border-amber-200 focus:border-primary"
        />

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-white/70 border-amber-200">
            <SelectValue placeholder="Which area of life?" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(c => (
              <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleSave}
          disabled={saving || !body.trim() || !category}
          className="w-full"
          style={{ background: '#d4830a', color: '#fef9f2' }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save to vault
        </Button>
      </div>
    </motion.div>
  );
}