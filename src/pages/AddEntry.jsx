import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { getFilteredEntryTypes, getFilteredCategories } from '@/lib/constants';
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

const NO_PHOTO_TYPES = ['quote', 'scripture', 'affirmation', 'personal_note', 'identity_swap'];

export default function AddEntry() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const isFirst = urlParams.get('first') === '1';
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    entry_type: '',
    title: '',
    body: '',
    old_belief: '',
    category: '',
    entry_date: '',
    location: '',
    photo_url: '',
  });
  const [uploading, setUploading] = useState(false);
  const [guardOpen, setGuardOpen] = useState(false);

  const createEntryMutation = useMutation({
    mutationFn: (payload) => base44.entities.UserEntry.create(payload),
    onMutate: async (newEntry) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['vault-entries'] });
      
      // Get previous data
      const previousEntries = queryClient.getQueryData(['vault-entries']) || [];
      
      // Optimistically update cache
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
      // Revert on error
      if (context?.previousEntries) {
        queryClient.setQueryData(['vault-entries'], context.previousEntries);
      }
    },
  });

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => {
        setUser(null);
        navigate('/login');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const christianEnabled = user?.christian_content || false;
  const aiGuardEnabled = user?.ai_guard_enabled !== false;
  const entryTypes = getFilteredEntryTypes(christianEnabled);
  const categories = getFilteredCategories(christianEnabled);

  const typeSelected = !!form.entry_type;
  const showPhoto = typeSelected && !NO_PHOTO_TYPES.includes(form.entry_type);
  const isIdentitySwap = form.entry_type === 'identity_swap';

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

  const getDefaultDateForType = (entryType) => {
    if (['experience', 'life_win', 'milestone', 'accomplishment', 'blessing'].includes(entryType)) {
      const today = new Date();
      return today.toISOString().split('T')[0];
    }
    return '';
  };

  // For identity swap, body = new truth, old_belief = old lie
  const canSave = form.entry_type && form.category &&
    (isIdentitySwap ? (form.body && form.old_belief) : form.body);

  const checkAndSave = async () => {
    if (!canSave) return;

    if (aiGuardEnabled && !isIdentitySwap) {
      createEntryMutation.mutate(form, {
        onMutate: async () => {
          // Keep UI responsive during guard check
        },
      });

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
    const payload = { ...form, status };
    if (['quote', 'scripture'].includes(form.entry_type) && form.title) {
      payload.author = form.title;
      payload.title = '';
    }
    createEntryMutation.mutate(payload, {
      onMutate: async () => {
        // UI updates immediately, then syncs with backend
      },
    });
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
          <h1 className="font-display text-2xl font-semibold text-foreground mb-6">Add an entry</h1>

          <div className="space-y-6">

            {/* Step 1: Type — always visible */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Type</Label>
              <ChipGroup
                options={entryTypes}
                value={form.entry_type}
                onChange={v => setForm(prev => ({
                  entry_type: v,
                  title: '',
                  body: '',
                  old_belief: '',
                  category: '',
                  entry_date: getDefaultDateForType(v),
                  photo_url: '',
                }))}
              />
            </div>

            {/* Steps 2+: only show once type is selected */}
            <AnimatePresence>
              {typeSelected && (
                <motion.div
                  key="fields"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* Identity Swap fields */}
                  {isIdentitySwap && (
                    <>
                      <div>
                        <Label className="text-sm font-medium mb-1.5 block">My Old Lie-dentity</Label>
                        <p className="text-xs text-muted-foreground mb-2">The false belief you're releasing</p>
                        <Textarea
                          value={form.old_belief}
                          onChange={e => setForm(prev => ({ ...prev, old_belief: e.target.value }))}
                          placeholder="I used to believe that I..."
                          className="min-h-[100px]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-1.5 block">My True Identity</Label>
                        <p className="text-xs text-muted-foreground mb-2">The truth you're stepping into</p>
                        <Textarea
                          value={form.body}
                          onChange={e => setForm(prev => ({ ...prev, body: e.target.value }))}
                          placeholder="The truth is, I am..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </>
                  )}

                  {/* Quote fields */}
                  {form.entry_type === 'quote' && (
                    <>
                      <div>
                        <Label className="text-sm font-medium mb-1.5 block">Quote</Label>
                        <Textarea
                          value={form.body}
                          onChange={e => setForm(prev => ({ ...prev, body: e.target.value }))}
                          placeholder="The quote text..."
                          className="min-h-[120px]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-1.5 block">Author</Label>
                        <Input value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Who said it?" />
                      </div>
                    </>
                  )}

                  {/* Scripture fields */}
                  {form.entry_type === 'scripture' && (
                    <>
                      <div>
                        <Label className="text-sm font-medium mb-1.5 block">Scripture</Label>
                        <Textarea
                          value={form.body}
                          onChange={e => setForm(prev => ({ ...prev, body: e.target.value }))}
                          placeholder="The scripture text..."
                          className="min-h-[120px]"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-1.5 block">Reference</Label>
                        <Input value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Jeremiah 29:11 NIV" />
                      </div>
                    </>
                  )}

                  {/* Affirmation */}
                  {form.entry_type === 'affirmation' && (
                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">Affirmation</Label>
                      <Textarea
                        value={form.body}
                        onChange={e => setForm(prev => ({ ...prev, body: e.target.value }))}
                        placeholder="I am..."
                        className="min-h-[120px]"
                      />
                    </div>
                  )}

                  {/* Memory-type fields */}
                  {form.entry_type && !['quote', 'scripture', 'affirmation', 'identity_swap'].includes(form.entry_type) && (
                    <>
                      <div>
                        <Label className="text-sm font-medium mb-1.5 block">
                          {form.entry_type === 'life_win' ? 'What was the win?' : form.entry_type === 'blessing' ? 'Describe the blessing' : 'What happened?'}
                        </Label>
                        <Textarea
                          value={form.body}
                          onChange={e => setForm(prev => ({ ...prev, body: e.target.value }))}
                          placeholder={form.entry_type === 'life_win' ? 'Describe your win...' : form.entry_type === 'blessing' ? 'What are you grateful for?' : 'Tell the story...'}
                          className="min-h-[120px]"
                        />
                      </div>
                      {form.entry_type === 'experience' && (
                        <div>
                          <Label className="text-sm font-medium mb-1.5 block">Location <span className="text-muted-foreground">(optional)</span></Label>
                          <Input value={form.location} onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))} placeholder="e.g. Yosemite, our kitchen, the backyard" />
                        </div>
                      )}
                      <div>
                        <Label className="text-sm font-medium mb-1.5 block">Date <span className="text-muted-foreground">(optional)</span></Label>
                        <Input type="date" value={form.entry_date} onChange={e => setForm(prev => ({ ...prev, entry_date: e.target.value }))} />
                        <p className="text-xs text-muted-foreground mt-1">Add a date and this entry will surface as an anniversary.</p>
                      </div>
                      {showPhoto && (
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
                      )}
                    </>
                  )}

                  {/* Category — always last before save */}
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