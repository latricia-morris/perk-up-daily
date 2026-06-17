import { useState } from 'react';
import { Share2, Copy, Check, Download, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getSchema, getDisplayLabel } from '@/lib/contentSchema';

const FORMATS = [
  { id: 'post',  label: 'Instagram Post',  sub: '1080 × 1080',  w: 1080, h: 1080 },
  { id: 'story', label: 'Instagram Story', sub: '1080 × 1920',  w: 1080, h: 1920 },
];

function resolveFields(item) {
  const entryType = item.entry_type || item.content_type;
  return {
    entryType,
    label: getDisplayLabel(entryType, item.category),
    body: item.body || '',
    author: item.author || null,
    reference: item.reference || null,
    old_belief: item.old_belief || null,
    photo: item.photo_url || null,
    location: item.location || null,
    date: item.entry_date || null,
  };
}

/**
 * Draw the social card onto a canvas directly.
 * This avoids html2canvas object-fit bugs — we draw everything manually.
 */
async function renderCardToCanvas(item, w, h) {
  const { entryType, label, body, author, reference, old_belief, photo, location, date } = resolveFields(item);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, 'rgba(212,131,10,0.18)');
  grad.addColorStop(0.6, '#fffdf8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const PAD = 60;
  let cursor = PAD;

  // Photo: draw top 50% of card, cover-cropped, with rounded corners
  if (photo) {
    const photoH = Math.round(h * 0.50);
    const img = await loadImage(photo);
    if (img) {
      const destW = w;
      const destH = photoH;
      const srcAspect = img.naturalWidth / img.naturalHeight;
      const destAspect = destW / destH;
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (srcAspect > destAspect) {
        // Wider than frame — crop sides
        sw = img.naturalHeight * destAspect;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        // Taller than frame — crop top/bottom
        sh = img.naturalWidth / destAspect;
        sy = (img.naturalHeight - sh) / 2;
      }
      // Rounded clip
      const radius = 20;
      ctx.save();
      roundedRect(ctx, 0, 0, destW, destH, radius);
      ctx.clip();
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, destW, destH);
      ctx.restore();
      cursor = photoH + 36;
    } else {
      cursor = PAD;
    }
  }

  const contentTop = cursor;
  const contentH = h - contentTop - PAD;
  const centerX = w / 2;

  // Type label
  ctx.save();
  ctx.font = `bold ${scalePx(22, w)}px 'DM Sans', sans-serif`;
  ctx.fillStyle = '#d4830a';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '3px';
  ctx.fillText(label.toUpperCase(), centerX, contentTop + scalePx(36, w));
  ctx.restore();

  let textCursor = contentTop + scalePx(80, w);

  // Identity swap — strikethrough old belief first
  if (entryType === 'identity_swap' && old_belief) {
    const strikeLines = wrapText(ctx, `"${old_belief}"`, w - PAD * 2, scalePx(28, w));
    ctx.save();
    ctx.font = `italic ${scalePx(28, w)}px 'Playfair Display', Georgia, serif`;
    ctx.fillStyle = '#aaaaaa';
    ctx.textAlign = 'center';
    strikeLines.forEach((line, i) => {
      const y = textCursor + i * scalePx(40, w);
      ctx.fillText(line, centerX, y);
      const tw = ctx.measureText(line).width;
      ctx.beginPath();
      ctx.strokeStyle = '#aaaaaa';
      ctx.lineWidth = 2;
      ctx.moveTo(centerX - tw / 2, y - scalePx(10, w));
      ctx.lineTo(centerX + tw / 2, y - scalePx(10, w));
      ctx.stroke();
    });
    ctx.restore();
    textCursor += strikeLines.length * scalePx(40, w) + scalePx(20, w);
  }

  // Main body text
  const isQuoteStyle = ['quote', 'scripture', 'affirmation'].includes(entryType);
  const displayBody = isQuoteStyle ? `"${body}"` : body;
  const bodyFontSize = h === 1080 ? scalePx(34, w) : scalePx(38, w);
  ctx.save();
  ctx.font = `${entryType === 'affirmation' ? '600' : '500'} italic ${bodyFontSize}px 'Playfair Display', Georgia, serif`;
  if (entryType === 'identity_swap') {
    ctx.fillStyle = '#d4830a';
    ctx.font = `600 ${bodyFontSize}px 'Playfair Display', Georgia, serif`;
  } else {
    ctx.fillStyle = '#2c1e0f';
  }
  ctx.textAlign = 'center';
  const bodyLines = wrapText(ctx, displayBody, w - PAD * 2, bodyFontSize);
  bodyLines.forEach((line, i) => {
    ctx.fillText(line, centerX, textCursor + i * (bodyFontSize * 1.55));
  });
  ctx.restore();
  textCursor += bodyLines.length * (bodyFontSize * 1.55) + scalePx(24, w);

  // Attribution / secondary fields
  ctx.save();
  ctx.font = `${scalePx(24, w)}px 'DM Sans', sans-serif`;
  ctx.fillStyle = '#7a5c3a';
  ctx.textAlign = 'center';

  if (entryType === 'quote' && author) {
    ctx.fillText(`— ${author}`, centerX, textCursor);
    textCursor += scalePx(38, w);
  }
  if (entryType === 'scripture' && reference) {
    ctx.fillText(reference, centerX, textCursor);
    textCursor += scalePx(38, w);
  }

  const metaParts = [];
  if (['experience', 'blessing', 'life_win', 'personal_note'].includes(entryType)) {
    if (location) metaParts.push(location);
    if (date) metaParts.push(new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  }
  if (metaParts.length > 0) {
    ctx.fillStyle = '#c4a882';
    ctx.font = `${scalePx(20, w)}px 'DM Sans', sans-serif`;
    ctx.fillText(metaParts.join(' • '), centerX, textCursor);
  }
  ctx.restore();

  // Branding — bottom center
  ctx.save();
  ctx.font = `500 ${scalePx(22, w)}px 'DM Sans', sans-serif`;
  ctx.fillStyle = 'rgba(196,168,130,0.85)';
  ctx.textAlign = 'center';
  ctx.fillText('✦  Perk Up Daily  ✦', centerX, h - PAD + scalePx(4, w));
  ctx.restore();

  return canvas;
}

function scalePx(base, canvasW) {
  // base size is designed for 1080px width
  return Math.round((base / 1080) * canvasW);
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrapText(ctx, text, maxWidth, fontSize) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Main component ──────────────────────────────────────────────────────────

export default function ShareCard({ item, isDetailView = false }) {
  const [step, setStep] = useState('idle'); // idle | format | generating | preview | error
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [previewCanvas, setPreviewCanvas] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const open = step !== 'idle';

  const handleOpenShare = (e) => {
    if (e) e.stopPropagation();
    setStep('format');
    setPreviewDataUrl(null);
    setPreviewCanvas(null);
    setErrorMsg('');
  };

  const handleSelectFormat = async (fmt) => {
    setSelectedFormat(fmt);
    setStep('generating');
    try {
      const canvas = await renderCardToCanvas(item, fmt.w, fmt.h);
      const dataUrl = canvas.toDataURL('image/png');
      setPreviewCanvas(canvas);
      setPreviewDataUrl(dataUrl);
      setStep('preview');
    } catch (err) {
      console.error('Card generation failed:', err);
      setErrorMsg('Could not generate the graphic. Please try again.');
      setStep('error');
    }
  };

  const handleNativeShare = async (e) => {
    e.stopPropagation();
    if (!previewCanvas) return;
    try {
      const blob = await new Promise(res => previewCanvas.toBlob(res, 'image/png'));
      const file = new File([blob], 'perk-up-daily.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          text: 'My Perk Up Daily',
        });
      } else {
        // Fallback: download
        handleDownload();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
        handleDownload();
      }
    }
  };

  const handleDownload = (e) => {
    if (e) e.stopPropagation();
    if (!previewDataUrl) return;
    const link = document.createElement('a');
    link.href = previewDataUrl;
    link.download = `perk-up-daily-${Date.now()}.png`;
    link.click();
  };

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    setStep('idle');
    setPreviewDataUrl(null);
    setPreviewCanvas(null);
  };

  const handleCopyText = (e) => {
    e.stopPropagation();
    const { entryType, body, author, reference, old_belief, location, date } = resolveFields(item);
    const parts = [];
    if (entryType === 'identity_swap') {
      if (old_belief) parts.push(`Old belief: "${old_belief}"`);
      parts.push(`New truth: "${body}"`);
    } else if (entryType === 'quote') {
      parts.push(`"${body}"`);
      if (author) parts.push(`— ${author}`);
    } else if (entryType === 'scripture') {
      parts.push(`"${body}"`);
      if (reference) parts.push(reference);
    } else {
      parts.push(body);
      if (location) parts.push(location);
      if (date) parts.push(new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    }
    navigator.clipboard.writeText(parts.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  // ── Tile button (compact, used on UpliftCard) ────────────────────────────
  const TileButton = (
    <button
      onClick={handleOpenShare}
      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title="Share entry"
    >
      <Share2 className="w-3.5 h-3.5" />
    </button>
  );

  // ── Detail view buttons (used in EntryDetailModal) ───────────────────────
  const DetailButtons = (
    <div className="flex gap-2">
      <Button onClick={handleCopyText} variant="ghost" size="sm" className="text-xs">
        {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
        {copied ? 'Copied' : 'Copy'}
      </Button>
      <Button onClick={handleOpenShare} variant="ghost" size="sm" className="text-xs">
        <Share2 className="w-4 h-4 mr-1" />
        Share
      </Button>
    </div>
  );

  return (
    <>
      {isDetailView ? DetailButtons : TileButton}

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent
          className="max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Step: format selector ── */}
          {step === 'format' && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">Share as…</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground -mt-1">Choose a format for your social graphic.</p>
              <div className="flex flex-col gap-3 mt-2">
                {FORMATS.map(fmt => (
                  <button
                    key={fmt.id}
                    onClick={() => handleSelectFormat(fmt)}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 flex items-center justify-center rounded-lg bg-muted"
                      style={{ width: fmt.id === 'post' ? 40 : 28, height: fmt.id === 'post' ? 40 : 48 }}>
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{fmt.label}</p>
                      <p className="text-xs text-muted-foreground">{fmt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Step: generating ── */}
          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Creating your graphic…</p>
            </div>
          )}

          {/* ── Step: preview ── */}
          {step === 'preview' && previewDataUrl && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">Preview</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center my-2">
                <img
                  src={previewDataUrl}
                  alt="Share preview"
                  className="rounded-xl border border-border shadow-md"
                  style={{ maxHeight: '55vh', width: 'auto', maxWidth: '100%' }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setStep('format')}
                >
                  ← Change format
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  title="Save image"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={handleNativeShare}
                >
                  <Share2 className="w-4 h-4 mr-1.5" />
                  {canNativeShare ? 'Share' : 'Save'}
                </Button>
              </div>
            </>
          )}

          {/* ── Step: error ── */}
          {step === 'error' && (
            <>
              <DialogHeader>
                <DialogTitle>Something went wrong</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">Close</Button>
                <Button onClick={() => handleSelectFormat(selectedFormat)} className="flex-1">Try again</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}