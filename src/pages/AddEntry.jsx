import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { getFilteredCategories } from '@/lib/constants';
import { getSchemaEntryTypes, buildEmptyForm, serializeEntry } from '@/lib/contentSchema';
import LimitedTextarea from '@/components/ui/limited-textarea';
import { getLimit } from '@/lib/storageLimits';
import { motion, AnimatePresence } from 'framer-motion';
import AIGuardDialog from '@/components/shared/AIGuardDialog';
import { SelectContent, SelectItem } from '@/components/ui/select';
import { MobileSelect } from '@/components/ui/mobile-select';

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
              background: '#D39A3B',
              color: '#2E2924',
              borderColor: '#D39A3B',
            } : {
              background: '#FFFCF2',
              color: '#6F655A',
              borderColor: '#E2D2B8',
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

  const handleTypeChange = (slug) => {
    setEntryType(slug);
    const today = new Date().toISOString().split('T')[0];
    const blank = buildEmptyForm(slug);
    // Default date for types that support it
    if (blank.hasOwnProperty('entry_date')) blank.entry_date = today;
    setForm(blank);
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
    (entryType === 'identity_swap' ? (form.body && form.old_belief) : form.body);

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
            <div             className="mb-6 p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #F6E9D2 0%, #FFFCF2 60%)', border: '1px solid #E6C27A' }}>
              <p className="font-display text-base font-semibold"               style={{ color: '#2E2924' }}>You're in. Add your first entry.</p>
              <p className="text-sm mt-1"               style={{ color: '#6F655A' }}>Log a win, a blessing, a memory — anything good. It'll be waiting for you tomorrow morning.</p>
            </div>
          )}
          <h1 className="font-display text-2xl font-semibold text-foreground mb-6">Add an entry</h1>

          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Type</Label>
              <ChipGroup
                options={entryTypes}
                value={entryType}
                onChange={handleTypeChange}
              />
            </div>

            <AnimatePresence>
              {entryType && (
                <motion.div
                  key="fields"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <EntryFormFields
                    entryType={entryType}
                    form={form}
                    setForm={setForm}
                    uploading={uploading}
                    onPhotoUpload={handlePhotoUpload}
                  />

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

                  <Button
                    onClick={checkAndSave}
                    disabled={createEntryMutation.isPending || !canSave}
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    {createEntryMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save entry
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <AIGuardDialog open={guardOpen} onChoice={handleGuardChoice} />
      </div>
    </div>
  );
}

/** Shared form fields component — driven entirely by the schema */
export function EntryFormFields({ entryType, form, setForm, uploading, onPhotoUpload }) {
  const f = (key) => form[key] ?? '';
  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  // Helper: LimitedTextarea wired to a specific field
  const LTA = ({ fieldKey, placeholder, className }) => {
    const lim = getLimit(entryType, fieldKey);
    return (
      <LimitedTextarea
        value={f(fieldKey)}
        onChange={set(fieldKey)}
        placeholder={placeholder}
        softLimit={lim.soft}
        hardLimit={lim.hard}
        className={className || 'min-h-[120px]'}
      />
    );
  };

  if (entryType === 'identity_swap') return (
    <>
      <div>
        <Label className="text-sm font-medium mb-1.5 block">My Old Lie-dentity</Label>
        <p className="text-xs text-muted-foreground mb-2">The false belief you're releasing</p>
        <LTA fieldKey="old_belief" placeholder="I used to believe that I..." className="min-h-[100px]" />
      </div>
      <div>
        <Label className="text-sm font-medium mb-1.5 block">My True Identity</Label>
        <p className="text-xs text-muted-foreground mb-2">The truth you're stepping into</p>
        <LTA fieldKey="body" placeholder="The truth is, I am..." className="min-h-[100px]" />
      </div>
    </>
  );

  if (entryType === 'quote') {
    const authorLim = getLimit(entryType, 'author');
    return (
      <>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Quote</Label>
          <LTA fieldKey="body" placeholder="The quote text..." />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Author <span className="text-muted-foreground">(optional)</span></Label>
          <Input
            value={f('author')}
            onChange={(e) => setForm(prev => ({ ...prev, author: e.target.value.slice(0, authorLim.hard) }))}
            placeholder="Who said it?"
            maxLength={authorLim.hard}
          />
        </div>
      </>
    );
  }

  if (entryType === 'scripture') {
    const refLim = getLimit(entryType, 'reference');
    return (
      <>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Scripture</Label>
          <LTA fieldKey="body" placeholder="The scripture text..." />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Reference <span className="text-muted-foreground">(optional)</span></Label>
          <Input
            value={f('reference')}
            onChange={(e) => setForm(prev => ({ ...prev, reference: e.target.value.slice(0, refLim.hard) }))}
            placeholder="e.g. Jeremiah 29:11 NIV"
            maxLength={refLim.hard}
          />
        </div>
      </>
    );
  }

  if (entryType === 'affirmation') return (
    <div>
      <Label className="text-sm font-medium mb-1.5 block">Affirmation</Label>
      <LTA fieldKey="body" placeholder="I am..." />
    </div>
  );

  // Memory, Blessing, Life Win, Note
  const labelMap = {
    experience: 'What happened?',
    blessing: 'Describe the blessing',
    life_win: 'What was the win?',
    personal_note: 'Note',
  };
  const placeholderMap = {
    experience: 'Tell the story...',
    blessing: 'What are you grateful for?',
    life_win: 'Describe your win...',
    personal_note: 'Write your note...',
  };
  const locLim = getLimit(entryType, 'location');

  return (
    <>
      <div>
        <Label className="text-sm font-medium mb-1.5 block">{labelMap[entryType] || 'Content'}</Label>
        <LTA fieldKey="body" placeholder={placeholderMap[entryType] || ''} />
      </div>
      {entryType === 'experience' && (
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Location <span className="text-muted-foreground">(optional)</span></Label>
          <Input
            value={f('location')}
            onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value.slice(0, locLim.hard) }))}
            placeholder="e.g. Yosemite, our kitchen, the backyard"
            maxLength={locLim.hard}
          />
        </div>
      )}
      <div>
        <Label className="text-sm font-medium mb-1.5 block">Date <span className="text-muted-foreground">(optional)</span></Label>
        <Input type="date" value={f('entry_date')} onChange={set('entry_date')} />
        <p className="text-xs text-muted-foreground mt-1">Add a date and this entry will surface as an anniversary.</p>
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
            <input type="file" accept="image/*" onChange={onPhotoUpload} className="hidden" />
          </label>
        )}
      </div>
    </>
  );
}