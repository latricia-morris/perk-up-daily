import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { getFilteredCategories } from '@/lib/constants';
import { getSchemaEntryTypes, buildEmptyForm, serializeEntry, getSchema } from '@/lib/contentSchema';
import { motion, AnimatePresence } from 'framer-motion';
import AIGuardDialog from '@/components/shared/AIGuardDialog';
import { SelectContent, SelectItem } from '@/components/ui/select';
import { MobileSelect } from '@/components/ui/mobile-select';
import EntryFormFields from '@/components/entry/EntryFormFields';

const catColors = {
  deep_faith:         { bg: '#37154A', color: '#FFFCF2' },
  rich_relationships: { bg: '#C43911', color: '#FFFCF2' },
  strong_body:        { bg: '#F78F00', color: '#2F2C29' },
  clear_mind:         { bg: '#0F2459', color: '#FFFCF2' },
  strong_business:    { bg: '#75003C', color: '#FFFCF2' },
  sound_money:        { bg: '#E6A037', color: '#2F2C29' },
};

function ChipGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const selected = value === opt.slug;
        const schema = getSchema(opt.slug);
        const typeColor = schema?.color;
        return (
          <button
            key={opt.slug}
            type="button"
            onClick={() => onChange(selected ? '' : opt.slug)}
            className="h-11 px-4 rounded-full text-sm font-medium transition-all border"
            style={selected ? {
              background: typeColor || '#E6A037',
              color: '#fff',
              borderColor: typeColor || '#E6A037',
            } : {
              background: '#FDF8F0',
              color: '#2F2C29',
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
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const isFirst = urlParams.get('first') === '1';
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entryType, setEntryType] = useState('');
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const [guardOpen, setGuardOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(null);

  const createEntryMutation = useMutation({
    mutationFn: (payload) => base44.entities.UserEntry.create(payload),
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: ['vault-entries'] });
      const previousEntries = queryClient.getQueryData(['vault-entries']) || [];
      queryClient.setQueryData(['vault-entries'], [...previousEntries, { ...newEntry, id: 'temp-' + Date.now() }]);
      return { previousEntries };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-entries'] });
      if (isFirst) {
        window.location.href = '/dashboard';
      } else {
        navigate(-1);
      }
    },
    onError: (err, newEntry, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(['vault-entries'], context.previousEntries);
      }
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser || null);
      } catch (err) {
        setUser(null);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const christianEnabled = user?.christian_content || false;
  const aiGuardEnabled = user?.ai_guard_enabled !== false;
  const entryTypes = getSchemaEntryTypes(christianEnabled);
  const categories = getFilteredCategories(christianEnabled);

  const handleTypeChange = async (slug) => {
    setEntryType(slug);
    const today = new Date().toISOString().split('T')[0];
    const blank = buildEmptyForm(slug);
    // Default date for types that support it
    if (blank.hasOwnProperty('entry_date')) blank.entry_date = today;
    setForm(blank);

    // Fetch a reflection prompt if reflection type is selected
    if (slug === 'reflection') {
      try {
        const prompts = await base44.entities.ReflectionPrompt.filter({ status: 'active' }, '-created_date', 50);
        if (prompts.length > 0) {
          const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
          setCurrentPrompt(randomPrompt);
          setForm(prev => ({ ...prev, prompt_id: randomPrompt.id }));
        }
      } catch (err) {
        console.error('Failed to fetch reflection prompt:', err);
      }
    }
  };

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

  const canSave = entryType && form.category &&
    (entryType === 'identity_swap' ? (form.body && form.old_belief) : form.body)  &&
    (entryType !== 'reflection' || form.body);

  const checkAndSave = async () => {
    if (!canSave) return;
    if (aiGuardEnabled && entryType !== 'identity_swap') {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this personal journal entry for tone. Is it negative, bitter, heavy, resentful, shameful, self-attacking, or clearly not uplifting? Answer with just "positive" or "negative". Entry: "${form.body}"`,
        response_json_schema: {
          type: 'object',
          properties: { tone: { type: 'string', enum: ['positive', 'negative'] } },
        },
      });
      if (result.tone === 'negative') {
        setGuardOpen(true);
        return;
      }
    }
    await saveEntry('active');
  };

  const saveEntry = async (status = 'active') => {
    const payload = { ...serializeEntry(entryType, form), status };
    createEntryMutation.mutate(payload);
  };

  const handleGuardChoice = async (choice) => {
    setGuardOpen(false);
    if (choice === 'keep') {
      await saveEntry('active');
    } else if (choice === 'reframe') {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Reframe this journal entry with a positive, encouraging lens. Keep the core meaning but shift the tone to be uplifting. Be warm and direct, not cheesy. Return just the reframed text. Original: "${form.body}"`,
      });
      setForm(prev => ({ ...prev, body: result }));
    } else if (choice === 'draft') {
      await saveEntry('draft');
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-6 py-8 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <div className="max-w-lg mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {isFirst && (
            <div className="mb-6 p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #fde8c0 0%, #fffdf8 60%)', border: '1px solid #f5d680' }}>
              <p className="font-display text-base font-semibold" style={{ color: '#2c1e0f' }}>You're in. Add your first entry.</p>
              <p className="text-sm mt-1" style={{ color: '#7a5c3a' }}>Log a win, a blessing, a memory — anything good. It'll be waiting for you tomorrow morning.</p>
            </div>
          )}
          <h1 className="font-display text-2xl font-semibold text-foreground mb-2">Let's get Perky</h1>
          <p className="text-sm text-muted-foreground mb-6">What would you like to add to your sweet stash?</p>

          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Type</Label>
              <ChipGroup
                options={entryTypes}
                value={entryType}
                onChange={handleTypeChange}
              />
            </div>

            {entryType && (
              <div className="space-y-6 animate-fade-up">
                <EntryFormFields
                  entryType={entryType}
                  form={form}
                  setForm={setForm}
                  uploading={uploading}
                  onPhotoUpload={handlePhotoUpload}
                  currentPrompt={currentPrompt}
                  descriptor={getSchema(entryType)?.descriptor}
                />

                {entryType !== 'reflection' && (
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Category</Label>
                    <div className="hidden md:block">
                      <ChipGroup
                        options={categories}
                        value={form.category}
                        onChange={v => setForm(prev => ({ ...prev, category: v }))}
                      />
                    </div>
                    <div className="md:hidden">
                      <MobileSelect
                        value={form.category}
                        onValueChange={v => setForm(prev => ({ ...prev, category: v }))}
                      >
                        {categories.map(cat => (
                          <SelectItem key={cat.slug} value={cat.slug}>{cat.label}</SelectItem>
                        ))}
                      </MobileSelect>
                    </div>
                  </div>
                )}

                <Button
                  onClick={checkAndSave}
                  disabled={createEntryMutation.isPending || !canSave}
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  {createEntryMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save entry
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        <AIGuardDialog open={guardOpen} onChoice={handleGuardChoice} />
      </div>
    </div>
  );
}