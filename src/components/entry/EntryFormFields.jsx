import { memo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2 } from 'lucide-react';
import LimitedTextarea from '@/components/ui/limited-textarea';
import { getLimit } from '@/lib/storageLimits';

/** Stable LimitedTextarea wrapper — defined OUTSIDE the parent so its identity
 *  never changes between renders. This is what stops the keyboard from closing. */
const LimitedField = memo(function LimitedField({ value, onChange, placeholder, softLimit, hardLimit, className }) {
  return (
    <LimitedTextarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      softLimit={softLimit}
      hardLimit={hardLimit}
      className={className}
    />
  );
});

/** Shared form fields component — driven entirely by the schema.
 *  Lives in its own file so it never gets re-created on parent re-renders,
 *  which prevents input focus loss (keyboard closing) on mobile. */
function EntryFormFields({ entryType, form, setForm, uploading, onPhotoUpload, currentPrompt, descriptor }) {
  const f = (key) => form[key] ?? '';
  const set = useCallback((key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value })), [setForm]);

  // Render a LimitedTextarea bound to a form field, without re-creating a component type
  const renderField = (fieldKey, placeholder, className, useDescriptor = false) => {
    const lim = getLimit(entryType, fieldKey);
    const finalPlaceholder = useDescriptor && descriptor ? descriptor : placeholder;
    return (
      <LimitedField
        value={f(fieldKey)}
        onChange={set(fieldKey)}
        placeholder={finalPlaceholder}
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
        {renderField('old_belief', 'I used to believe that I...', 'min-h-[100px]', false)}
      </div>
      <div>
        <Label className="text-sm font-medium mb-1.5 block">My True Identity</Label>
        {renderField('body', 'The truth is, I am...', 'min-h-[100px]', true)}
      </div>
    </>
  );

  if (entryType === 'quote') {
    const authorLim = getLimit(entryType, 'author');
    return (
      <>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Quote</Label>
          {renderField('body', 'The quote text...', undefined, true)}
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
          {renderField('body', 'The scripture text...', undefined, true)}
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
      {renderField('body', 'I am...', undefined, true)}
    </div>
  );

  if (entryType === 'reflection') return (
    <>
      <div>
        {currentPrompt ? (
          <p className="font-display text-lg italic leading-relaxed mb-4" style={{ color: '#2c1e0f' }}>
            {currentPrompt.prompt}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">Loading prompt...</p>
        )}
      </div>
      <div>
        <Label className="text-sm font-medium mb-1.5 block">Your knee-jerk response</Label>
        {renderField('body', 'Write your response...', 'min-h-[140px]', false)}
      </div>
    </>
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
        {renderField('body', placeholderMap[entryType] || '', undefined, true)}
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

export default memo(EntryFormFields);