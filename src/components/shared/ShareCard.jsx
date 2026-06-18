import { useState } from 'react';
import { Share2, Copy, Check, Download, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';


const FORMATS = [
  { id: 'post',  label: 'Instagram Post',  sub: '1080 × 1080',  w: 1080, h: 1080 },
  { id: 'story', label: 'Instagram Story', sub: '1080 × 1920',  w: 1080, h: 1920 },
];

function resolveFields(item) {
  const entryType = item.entry_type || item.content_type;
  return {
    entryType,
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
 * No type label on social graphics — clean branded output only.
 */
async function renderCardToCanvas(item, w, h) {
  const { entryType, body, author, reference, old_belief, photo, location, date } = resolveFields(item);

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

  // ── Layout constants (all scaled to canvas width) ────────────────────────
  const EDGE_PAD    = scalePx(64, w);   // safe area: left/right edge padding
  const INNER_PAD   = scalePx(30, w);   // internal text block top/bottom padding
  const FOOTER_ZONE = scalePx(96, w);   // protected footer band height
  const BRAND_FONT  = Math.max(scalePx(30, w), scalePx(26, w)); // 28–30px target, 26px min
  const centerX     = w / 2;

  // ── Photo (top 50%, cover-cropped) ──────────────────────────────────────
  let photoDrawnH = 0;
  if (photo) {
    const img = await loadImage(photo);
    if (img) {
      const destW = w;
      const destH = Math.round(h * 0.50);
      const srcAspect = img.naturalWidth / img.naturalHeight;
      const destAspect = destW / destH;
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (srcAspect > destAspect) {
        sw = img.naturalHeight * destAspect;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        sh = img.naturalWidth / destAspect;
        sy = (img.naturalHeight - sh) / 2;
      }
      ctx.save();
      roundedRect(ctx, 0, 0, destW, destH, 20);
      ctx.clip();
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, destW, destH);
      ctx.restore();
      photoDrawnH = destH;
    }
  }

  // ── Branding footer (drawn last but zone reserved now) ───────────────────
  // Footer zone: bottom FOOTER_ZONE px of card.
  // Brand text sits vertically centered within the footer zone.
  const footerTop  = h - FOOTER_ZONE;
  const brandY     = footerTop + FOOTER_ZONE / 2 + BRAND_FONT * 0.35; // baseline center

  // ── Usable text area ─────────────────────────────────────────────────────
  // Top: below image (or card top) + inner pad
  // Bottom: above footer zone - inner pad
  const textAreaTop    = (photoDrawnH > 0 ? photoDrawnH : 0) + INNER_PAD;
  const textAreaBottom = footerTop - INNER_PAD;
  const textAreaH      = textAreaBottom - textAreaTop;
  const textWidth      = w - EDGE_PAD * 2;

  // ── Starting font size by character count ────────────────────────────────
  const isQuoteStyle = ['quote', 'scripture', 'affirmation'].includes(entryType);
  const displayBody  = isQuoteStyle ? `"${body}"` : body;
  const charCount    = displayBody.length;

  const BODY_FONT_MIN = scalePx(40, w);
  const ATTR_FONT_MIN = scalePx(26, w);

  let startBodyFont;
  if (charCount <= 120)      startBodyFont = scalePx(72, w);
  else if (charCount <= 220) startBodyFont = scalePx(64, w);
  else if (charCount <= 360) startBodyFont = scalePx(56, w);
  else                       startBodyFont = scalePx(48, w);

  // For photo cards cap the start size a bit more to leave room below image
  if (photoDrawnH > 0) startBodyFont = Math.min(startBodyFont, scalePx(56, w));

  let bodyFontSize = startBodyFont;
  let attrFontSize = scalePx(32, w); // target 30–34px

  // ── Attribution lines ─────────────────────────────────────────────────────
  const attrLines = [];
  if (entryType === 'quote' && author) attrLines.push(`— ${author}`);
  if (entryType === 'scripture' && reference) attrLines.push(reference);
  if (['experience', 'blessing', 'life_win', 'personal_note'].includes(entryType)) {
    const parts = [];
    if (location) parts.push(location);
    if (date) parts.push(new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    if (parts.length > 0) attrLines.push(parts.join(' • '));
  }

  // ── Measure helper ────────────────────────────────────────────────────────
  function measureBlockH(bodyFS, attrFS) {
    const bFont = entryType === 'identity_swap'
      ? `600 ${bodyFS}px 'Playfair Display', Georgia, serif`
      : `500 italic ${bodyFS}px 'Playfair Display', Georgia, serif`;
    ctx.font = bFont;
    const bLines = wrapText(ctx, displayBody, textWidth, bodyFS).length;

    let strikeH = 0;
    if (entryType === 'identity_swap' && old_belief) {
      const sfs = bodyFS * 0.75;
      ctx.font = `italic ${sfs}px 'Playfair Display', Georgia, serif`;
      const sl = wrapText(ctx, `"${old_belief}"`, textWidth, sfs).length;
      strikeH = sl * (sfs * 1.5) + scalePx(32, w);
    }

    const aGap = attrLines.length > 0 ? scalePx(24, w) + attrLines.length * (attrFS * 1.5) : 0;
    return strikeH + bLines * (bodyFS * 1.5) + aGap;
  }

  // ── Scale down to fit ─────────────────────────────────────────────────────
  while (measureBlockH(bodyFontSize, attrFontSize) > textAreaH) {
    if (bodyFontSize > BODY_FONT_MIN) {
      bodyFontSize = Math.max(bodyFontSize - scalePx(2, w), BODY_FONT_MIN);
    } else if (attrFontSize > ATTR_FONT_MIN) {
      attrFontSize = Math.max(attrFontSize - scalePx(2, w), ATTR_FONT_MIN);
    } else {
      break; // at floor — truncate below
    }
  }

  const bodyFont       = entryType === 'identity_swap'
    ? `600 ${bodyFontSize}px 'Playfair Display', Georgia, serif`
    : `500 italic ${bodyFontSize}px 'Playfair Display', Georgia, serif`;
  const lineHeight     = bodyFontSize * 1.5;
  const attrLineH      = attrFontSize * 1.5;
  const strikeFontSize = bodyFontSize * 0.75;
  const strikeLineH    = strikeFontSize * 1.5;

  // ── Final wrap ────────────────────────────────────────────────────────────
  ctx.font = bodyFont;
  let bodyLines = wrapText(ctx, displayBody, textWidth, bodyFontSize);

  let strikeLines = [];
  if (entryType === 'identity_swap' && old_belief) {
    ctx.font = `italic ${strikeFontSize}px 'Playfair Display', Georgia, serif`;
    strikeLines = wrapText(ctx, `"${old_belief}"`, textWidth, strikeFontSize);
  }

  // Truncate body lines if still overflowing at minimum sizes
  const strikeBlockH = strikeLines.length > 0 ? strikeLines.length * strikeLineH + scalePx(32, w) : 0;
  const attrBlockH   = attrLines.length > 0 ? scalePx(24, w) + attrLines.length * attrLineH : 0;
  const spaceForBody = textAreaH - strikeBlockH - attrBlockH;
  const maxBodyLines = Math.max(1, Math.floor(spaceForBody / lineHeight));
  if (bodyLines.length > maxBodyLines) {
    bodyLines = bodyLines.slice(0, maxBodyLines);
    const last = bodyLines[maxBodyLines - 1];
    // trim last line and append ellipsis
    const trimmed = last.replace(/[\s.…]+$/, '');
    ctx.font = bodyFont;
    let shortened = trimmed;
    while (ctx.measureText(shortened + '…').width > textWidth && shortened.length > 1) {
      shortened = shortened.slice(0, -1).trimEnd();
    }
    bodyLines[maxBodyLines - 1] = shortened + '…';
  }

  // ── Vertical centering of text block ─────────────────────────────────────
  const totalTextH = strikeBlockH + bodyLines.length * lineHeight + attrBlockH;
  const centerOffset = Math.max(0, (textAreaH - totalTextH) / 2);
  let cursor = textAreaTop + centerOffset;

  // ── Draw strikethrough block (identity_swap) ──────────────────────────────
  if (strikeLines.length > 0) {
    ctx.save();
    ctx.font = `italic ${strikeFontSize}px 'Playfair Display', Georgia, serif`;
    ctx.fillStyle = '#aaaaaa';
    ctx.textAlign = 'center';
    strikeLines.forEach((line, i) => {
      const y = cursor + i * strikeLineH + strikeFontSize;
      ctx.fillText(line, centerX, y);
      const tw = ctx.measureText(line).width;
      ctx.beginPath();
      ctx.strokeStyle = '#aaaaaa';
      ctx.lineWidth = scalePx(2, w);
      ctx.moveTo(centerX - tw / 2, y - strikeFontSize * 0.3);
      ctx.lineTo(centerX + tw / 2, y - strikeFontSize * 0.3);
      ctx.stroke();
    });
    ctx.restore();
    cursor += strikeLines.length * strikeLineH + scalePx(32, w);
  }

  // ── Draw main body ────────────────────────────────────────────────────────
  ctx.save();
  ctx.font = bodyFont;
  ctx.fillStyle = entryType === 'identity_swap' ? '#d4830a' : '#2c1e0f';
  ctx.textAlign = 'center';
  bodyLines.forEach((line, i) => {
    ctx.fillText(line, centerX, cursor + i * lineHeight + bodyFontSize);
  });
  ctx.restore();
  cursor += bodyLines.length * lineHeight;

  // ── Draw attribution ──────────────────────────────────────────────────────
  if (attrLines.length > 0) {
    cursor += scalePx(24, w);
    ctx.save();
    ctx.font = `400 ${attrFontSize}px 'DM Sans', sans-serif`;
    ctx.fillStyle = '#7a5c3a';
    ctx.textAlign = 'center';
    attrLines.forEach((line, i) => {
      ctx.fillText(line, centerX, cursor + i * attrLineH + attrFontSize);
    });
    ctx.restore();
  }

  // ── Branding footer ───────────────────────────────────────────────────────
  ctx.save();
  ctx.font = `500 ${BRAND_FONT}px 'DM Sans', sans-serif`;
  ctx.fillStyle = 'rgba(122,92,58,0.75)';
  ctx.textAlign = 'left';
  ctx.fillText('Perk Up Daily', EDGE_PAD, brandY);
  ctx.textAlign = 'right';
  ctx.fillText('perkupdaily.app', w - EDGE_PAD, brandY);
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