import { useState } from 'react';
import { Share2, X, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PRIVATE_TYPES = ['experience', 'blessing', 'personal_note'];

function buildCanvas(item, format = 'square') {
  const W = 1080;
  const H = format === 'story' ? 1920 : 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  const bg = ctx.createRadialGradient(W * 0.35, H * 0.35, 0, W * 0.5, H * 0.5, W * 0.8);
  bg.addColorStop(0, '#FFF8E8');
  bg.addColorStop(0.6, '#FDF8F0');
  bg.addColorStop(1, '#F5EDD8');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle glow
  const glow = ctx.createRadialGradient(W * 0.7, H * 0.2, 0, W * 0.7, H * 0.2, W * 0.4);
  glow.addColorStop(0, 'rgba(232,168,56,0.18)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const bodyType = item.content_type || item.entry_type;
  const isQuote = bodyType === 'quote' || bodyType === 'affirmation' || bodyType === 'scripture';

  // Content area
  const padX = W * 0.12;
  const centerY = H * 0.5;

  // Opening quote mark
  if (isQuote) {
    ctx.font = `bold ${W * 0.18}px Georgia, serif`;
    ctx.fillStyle = 'rgba(212,131,10,0.13)';
    ctx.fillText('\u201C', padX - W * 0.03, centerY - W * 0.12);
  }

  // Body text — wrap
  const maxWidth = W - padX * 2;
  const bodyFontSize = H === 1920 ? 72 : 58;
  ctx.font = `italic ${bodyFontSize}px 'Playfair Display', Georgia, serif`;
  ctx.fillStyle = '#2c1e0f';
  ctx.textAlign = 'center';

  const words = (item.body || '').split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  // Clamp to ~6 lines
  const displayed = lines.slice(0, 6);
  const lineH = bodyFontSize * 1.5;
  const totalH = displayed.length * lineH;
  let startY = centerY - totalH / 2 + bodyFontSize;

  if (format === 'story') startY = H * 0.42 - totalH / 2 + bodyFontSize;

  displayed.forEach((l, i) => {
    ctx.fillText(l, W / 2, startY + i * lineH);
  });

  // Author
  if (item.author) {
    ctx.font = `500 ${bodyFontSize * 0.48}px 'DM Sans', system-ui, sans-serif`;
    ctx.fillStyle = '#7a5c3a';
    ctx.textAlign = 'center';
    ctx.fillText(`— ${item.author}`, W / 2, startY + displayed.length * lineH + bodyFontSize * 0.7);
  }

  // Bottom bar
  const barY = H - 90;
  ctx.font = `600 32px 'DM Sans', system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(44,30,15,0.35)';
  ctx.textAlign = 'left';
  ctx.fillText('Perk Up Daily', padX, barY);

  ctx.textAlign = 'right';
  ctx.font = `400 28px 'DM Sans', system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(44,30,15,0.25)';
  ctx.fillText('perkupdaily.app', W - padX, barY);

  return canvas;
}

export default function ShareCard({ item }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [format, setFormat] = useState('square');

  const isPrivate = PRIVATE_TYPES.includes(item.content_type || item.entry_type);

  const handleOpen = () => {
    if (isPrivate) {
      setConfirming(true);
    } else {
      setOpen(true);
    }
  };

  const doShare = async (fmt) => {
    const canvas = buildCanvas(item, fmt);
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'perkupdaily-share.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Perk Up Daily' });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'perkupdaily-share.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  };

  return (
    <>
      <button
        onClick={handleOpen}
        title="Share"
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>

      {/* Privacy confirmation */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(44,30,15,0.4)' }}>
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Heads up</p>
                <p className="text-sm text-muted-foreground mt-1">This will be visible publicly. Still want to share?</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                size="sm"
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => { setConfirming(false); setOpen(true); }}
              >
                Yes, share
              </Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Share format picker */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(44,30,15,0.4)' }}>
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-foreground">Share to Social</p>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { id: 'square', label: 'Post', sub: '1080 × 1080' },
                { id: 'story', label: 'Story', sub: '1080 × 1920' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className="p-4 rounded-xl border text-left transition-all"
                  style={format === f.id ? {
                    background: '#FDE8C0',
                    borderColor: '#d4830a',
                  } : {
                    background: '#FDF8F0',
                    borderColor: '#e2d5c0',
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: '#2c1e0f' }}>{f.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#7a5c3a' }}>{f.sub}</p>
                </button>
              ))}
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 gap-2"
              onClick={() => { doShare(format); setOpen(false); }}
            >
              <Download className="w-4 h-4" />
              Generate &amp; Share
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Your branded graphic will be ready to post to Instagram, Facebook, X, or anywhere.
            </p>
          </div>
        </div>
      )}
    </>
  );
}