import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { getFilteredEntryTypes, getFilteredCategories } from '@/lib/constants';
import { motion } from 'framer-motion';
import AIGuardDialog from '@/components/shared/AIGuardDialog';

function ChipGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const selected = value === opt.slug;
        return (
          <button
            key={opt.slug}
            type="button"
            onClick={() => onChange(selected ? '' : opt.slug)}
            className="h-11 px-4 rounded-full text-sm font-medium transition-all border"
            style={selected ? {
              background: '#E8A838',
              color: '#2c1e0f',
              borderColor: '#E8A838',
            } : {
              background: '#FDF8F0',
              color: '#7a5c3a',
              borderColor: '#e2d5c0',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function AddEntry() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const isFirst = urlParams.get('first') === '1';
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    entry_type: '',
    title: '',
    body: '',
    category: '',
    entry_date: '',
    tags: '',
    photo_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [guardOpen, setGuardOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const christianEnabled = user?.christian_content || false;
  const aiGuardEnabled = user?.ai_guard_enabled !== false;
  const entryTypes = getFilteredEntryTypes(christianEnabled);
  const categories = getFilteredCategories(christianEnabled);

  const resizeImage = (file, maxPx = 1200) => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const { width, height } = img;
        const scale = width > height ? maxPx / width : maxPx / height;
        const w = scale < 1 ? Math.round(width * scale) : width;
        const h = scale < 1 ? Math.round(height * scale) : height;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.82);
      };
      img.src = url;
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const resized = await resizeImage(file);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: resized });
    setForm(prev => ({ ...prev, photo_url: file_url }));
    setUploading(false);
  };

  const checkAndSave = async () => {
    if (!form.body || !form.category || !form.entry_type) return;

    if (aiGuardEnabled) {
      setSaving(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this personal journal entry for tone. Is it negative, bitter, heavy, resentful, shameful, self-attacking, or clearly not uplifting? Answer with just "positive" or "negative". Entry: "${form.body}"`,
        response_json_schema: {
          type: 'object',
          properties: { tone: { type: 'string', enum: ['positive', 'negative'] } },
        },
      });
      setSaving(false);

      if (result.tone === 'negative') {
        setGuardOpen(true);
        return;
      }
    }

    await saveEntry('active');
  };

  const saveEntry = async (status = 'active') => {
    setSaving(true);
    await base44.entities.UserEntry.create({ ...form, status });
    setSaving(false);
    if (isFirst) {
      window.location.href = '/dashboard';
    } else {
      navigate(-1);
    }
  };

  const handleGuardChoice = async (choice) => {
    setGuardOpen(false);
    if (choice === 'keep') {
      await saveEntry('active');
    } else if (choice === 'reframe') {
      setSaving(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Reframe this journal entry with a positive, encouraging lens. Keep the core meaning but shift the tone to be uplifting. Be warm and direct, not cheesy. Return just the reframed text. Original: "${form.body}"`,
      });
      setForm(prev => ({ ...prev, body: result }));
      setSaving(false);
    } else if (choice === 'draft') {
      await saveEntry('draft');
    }
  };

  return (
    <div className="md:ml-64">
      <div className="max-w-lg mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {isFirst && (
            <div className="mb-6 p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #fde8c0 0%, #fffdf8 60%)', border: '1px solid #f5d680' }}>
              <p className="font-display text-base font-semibold" style={{ color: '#2c1e0f' }}>You're in. Add your first entry.</p>
              <p className="text-sm mt-1" style={{ color: '#7a5c3a' }}>Log a win, a blessing, a memory — anything good. It'll be waiting for you tomorrow morning.</p>
            </div>
          )}
          <h1 className="font-display text-2xl font-semibold text-foreground mb-6">Add an entry</h1>

          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Type</Label>
              <ChipGroup
                options={entryTypes}
                value={form.entry_type}
                onChange={v => setForm(prev => ({ ...prev, entry_type: v }))}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Category</Label>
              <ChipGroup
                options={categories}
                value={form.category}
                onChange={v => setForm(prev => ({ ...prev, category: v }))}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1.5 block">Title <span className="text-muted-foreground">(optional)</span></Label>
              <Input value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Give it a name" />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1.5 block">Body</Label>
              <Textarea
                value={form.body}
                onChange={e => setForm(prev => ({ ...prev, body: e.target.value }))}
                placeholder="What happened? What are you grateful for?"
                className="min-h-[120px]"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1.5 block">Date <span className="text-muted-foreground">(optional)</span></Label>
              <Input type="date" value={form.entry_date} onChange={e => setForm(prev => ({ ...prev, entry_date: e.target.value }))} />
              <p className="text-xs text-muted-foreground mt-1">Add a date and this entry will surface as an anniversary.</p>
            </div>

            <div>
              <Label className="text-sm font-medium mb-1.5 block">Tags <span className="text-muted-foreground">(optional)</span></Label>
              <Input value={form.tags} onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))} placeholder="family, career, health" />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1.5 block">Photo <span className="text-muted-foreground">(optional)</span></Label>
              {form.photo_url ? (
                <div className="relative">
                  <img src={form.photo_url} alt="" className="w-full h-48 object-cover rounded-lg" />
                  <button onClick={() => setForm(prev => ({ ...prev, photo_url: '' }))} className="absolute top-2 right-2 bg-foreground/50 text-background rounded-full w-6 h-6 flex items-center justify-center text-xs">×</button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary/40 transition-colors">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                  <span className="text-sm text-muted-foreground">{uploading ? 'Uploading...' : 'Upload a photo'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
            </div>

            <Button
              onClick={checkAndSave}
              disabled={saving || !form.body || !form.category || !form.entry_type}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save entry
            </Button>
          </div>
        </motion.div>

        <AIGuardDialog open={guardOpen} onChoice={handleGuardChoice} />
      </div>
    </div>
  );
}