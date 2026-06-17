import { useState } from 'react';
import { Share2, Copy, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import html2canvas from 'html2canvas';
import { getSchema } from '@/lib/contentSchema';

/**
 * Canonical field resolver — reads from the correct field per content type.
 * Never falls back to `title` for author/reference.
 */
function resolveFields(item) {
  const entryType = item.entry_type || item.content_type;
  const schema = getSchema(entryType);
  return {
    entryType,
    label: schema?.label || entryType,
    body: item.body || '',
    author: item.author || null,
    reference: item.reference || null,
    old_belief: item.old_belief || null,
    photo: item.photo_url || null,
    location: item.location || null,
    date: item.entry_date || null,
  };
}

function buildSocialCard(item, width, height) {
  const { entryType, label, body, author, reference, old_belief, photo, location, date } = resolveFields(item);

  const PADDING = 30;
  const photoHeight = photo ? height * 0.5 : 0;

  const container = document.createElement('div');
  container.style.cssText = `
    width: ${width}px;
    height: ${height}px;
    position: fixed;
    left: -9999px;
    top: -9999px;
    background: linear-gradient(135deg, rgba(212,131,10,0.14) 0%, #fffdf8 60%);
    padding: ${PADDING}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: 'DM Sans', sans-serif;
    color: #2c1e0f;
    text-align: center;
    box-sizing: border-box;
    gap: 0;
  `;

  // Photo frame — 50% height, full width, cover
  if (photo) {
    const frame = document.createElement('div');
    frame.style.cssText = `
      width: 100%;
      height: ${photoHeight - PADDING}px;
      overflow: hidden;
      position: relative;
      border-radius: 12px;
      flex-shrink: 0;
      margin-bottom: 20px;
    `;
    const img = document.createElement('img');
    img.src = photo;
    img.crossOrigin = 'anonymous';
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center center;
      display: block;
    `;
    frame.appendChild(img);
    container.appendChild(frame);
  }

  // Content area
  const content = document.createElement('div');
  const contentHeight = height - PADDING * 2 - photoHeight;
  content.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    height: ${contentHeight}px;
    overflow: hidden;
    gap: 14px;
  `;

  // Type label
  const typeLabel = document.createElement('p');
  typeLabel.textContent = label.toUpperCase();
  typeLabel.style.cssText = `font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #d4830a; text-transform: uppercase; margin: 0;`;
  content.appendChild(typeLabel);

  // Main body text
  const bodyEl = document.createElement('p');
  bodyEl.textContent = ['quote', 'scripture', 'affirmation'].includes(entryType) ? `"${body}"` : body;
  bodyEl.style.cssText = `
    font-size: 18px;
    font-weight: ${entryType === 'affirmation' ? '600' : '500'};
    font-style: ${['quote', 'scripture'].includes(entryType) ? 'italic' : 'normal'};
    line-height: 1.6;
    color: #2c1e0f;
    margin: 0;
    font-family: 'Playfair Display', serif;
  `;
  content.appendChild(bodyEl);

  // Type-specific secondary fields
  if (entryType === 'quote' && author) {
    const el = document.createElement('p');
    el.textContent = `— ${author}`;
    el.style.cssText = `font-size: 13px; color: #7a5c3a; margin: 0;`;
    content.appendChild(el);
  }

  if (entryType === 'scripture' && reference) {
    const el = document.createElement('p');
    el.textContent = reference;
    el.style.cssText = `font-size: 13px; color: #7a5c3a; margin: 0;`;
    content.appendChild(el);
  }

  if (entryType === 'identity_swap' && old_belief) {
    // Prepend the old belief above body — rebuild order
    const strikeEl = document.createElement('p');
    strikeEl.textContent = `"${old_belief}"`;
    strikeEl.style.cssText = `font-size: 14px; text-decoration: line-through; color: #9a9a9a; font-style: italic; line-height: 1.5; margin: 0;`;
    // Insert before bodyEl
    content.insertBefore(strikeEl, bodyEl);
    bodyEl.style.color = '#d4830a';
    bodyEl.style.fontWeight = '600';
  }

  if (['experience', 'blessing', 'life_win', 'personal_note'].includes(entryType)) {
    const parts = [];
    if (location) parts.push(location);
    if (date) parts.push(new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    if (parts.length > 0) {
      const metaEl = document.createElement('p');
      metaEl.textContent = parts.join(' • ');
      metaEl.style.cssText = `font-size: 12px; color: #c4a882; margin: 0;`;
      content.appendChild(metaEl);
    }
  }

  // Branding footer
  const footer = document.createElement('p');
  footer.textContent = 'Perk Up Daily';
  footer.style.cssText = `font-size: 12px; color: #c4a882; margin: 0; margin-top: auto; padding-top: 12px;`;
  content.appendChild(footer);

  container.appendChild(content);
  return container;
}

export default function ShareCard({ item, isDetailView = false }) {
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [generating, setGenerating] = useState(false);

  const generateShareImage = async (dimensions = '1080x1920', forPreview = false) => {
    setGenerating(true);
    try {
      const [width, height] = dimensions === '1080x1920' ? [1080, 1920] : [1080, 1080];
      const container = buildSocialCard(item, width, height);
      document.body.appendChild(container);

      // Wait for image to load
      const img = container.querySelector('img');
      if (img) {
        await new Promise((resolve) => {
          if (img.complete) return resolve();
          img.onload = resolve;
          img.onerror = resolve;
        });
      }

      const canvas = await html2canvas(container, {
        scale: 1,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const imageData = canvas.toDataURL('image/png');
      document.body.removeChild(container);

      if (forPreview) {
        setPreviewImage(imageData);
      } else {
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `perk-up-${Date.now()}.png`;
        link.click();
      }
    } catch (error) {
      console.error('Failed to generate share image:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyText = () => {
    const { body, author, reference } = resolveFields(item);
    const suffix = author ? ` — ${author}` : reference ? ` — ${reference}` : '';
    navigator.clipboard.writeText(`"${body}"${suffix}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenShare = async () => {
    setPreviewOpen(true);
    await generateShareImage('1080x1920', true);
  };

  const handleDownload = async () => {
    if (previewImage) {
      const link = document.createElement('a');
      link.href = previewImage;
      link.download = `perk-up-${Date.now()}.png`;
      link.click();
      setPreviewOpen(false);
      setPreviewImage(null);
    }
  };

  if (isDetailView) {
    return (
      <div className="flex gap-2">
        <Button onClick={handleCopyText} variant="ghost" size="sm" className="text-xs">
          {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button onClick={handleOpenShare} disabled={generating} variant="ghost" size="sm" className="text-xs">
          <Share2 className="w-4 h-4 mr-1" />
          {generating ? 'Creating...' : 'Share'}
        </Button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); handleOpenShare(); }}
        disabled={generating}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Share entry"
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewImage && (
              <div className="flex justify-center">
                <img src={previewImage} alt="Preview" className="max-w-xs rounded-lg border border-border" />
              </div>
            )}
            {!previewImage && generating && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
              </div>
            )}
            {previewImage && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPreviewOpen(false)} className="flex-1">Cancel</Button>
                <Button onClick={handleDownload} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />Download
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}