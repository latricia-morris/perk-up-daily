import { useState } from 'react';
import { Share2, Copy, Check, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';

export default function ShareCard({ item, isDetailView = false }) {
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('1080x1920');
  const [previewImage, setPreviewImage] = useState(null);
  const [generating, setGenerating] = useState(false);

  const generateShareImage = async (dimensions = '1080x1920', preview = false) => {
    setGenerating(true);
    try {
      const container = document.createElement('div');
      const [width, height] = dimensions === '1080x1920' 
        ? [1080, 1920] 
        : [1080, 1080];

      const photoHeight = item.photo_url ? height * 0.5 : 0;
      const availableHeight = height - 80 - photoHeight; // 80px for padding

      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.background = 'linear-gradient(135deg, rgba(212,131,10,0.14) 0%, #fffdf8 60%)';
      container.style.padding = '40px';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.justifyContent = 'flex-start';
      container.style.alignItems = 'center';
      container.style.fontFamily = "'DM Sans', sans-serif";
      container.style.color = '#2c1e0f';
      container.style.textAlign = 'center';
      container.style.boxSizing = 'border-box';
      container.style.gap = '20px';

      // Photo section (if exists) — 50% of card height, full width
      if (item.photo_url) {
        const photoHeight = height * 0.5;
        const photoContainer = document.createElement('div');
        photoContainer.style.width = '100%';
        photoContainer.style.height = `${photoHeight}px`;
        photoContainer.style.overflow = 'hidden';
        photoContainer.style.borderRadius = '12px';
        
        const img = document.createElement('img');
        img.src = item.photo_url;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.objectPosition = 'center';
        photoContainer.appendChild(img);
        container.appendChild(photoContainer);
      }

      // Content section
      const content = document.createElement('div');
      content.style.flex = '1';
      content.style.display = 'flex';
      content.style.flexDirection = 'column';
      content.style.justifyContent = 'flex-start';
      content.style.alignItems = 'center';
      content.style.width = '100%';
      content.style.maxHeight = `${availableHeight}px`;
      content.style.overflow = 'hidden';
      content.style.gap = '16px';

      const contentType = item.entry_type || item.content_type;

      // Type label
      const label = document.createElement('p');
      label.textContent = contentType === 'quote' ? 'QUOTE' : 
                         contentType === 'scripture' ? 'SCRIPTURE' :
                         contentType === 'affirmation' ? 'AFFIRMATION' :
                         contentType === 'blessing' ? 'BLESSING' :
                         contentType === 'life_win' || contentType === 'accomplishment' || contentType === 'milestone' ? 'LIFE WIN' :
                         contentType === 'experience' ? 'MEMORY' :
                         contentType === 'personal_note' || contentType === 'encouragement_note' ? 'NOTE' :
                         contentType === 'identity_swap' ? 'IDENTITY UPGRADE' : 'ENTRY';
      label.style.fontSize = '11px';
      label.style.fontWeight = 'bold';
      label.style.letterSpacing = '2px';
      label.style.color = '#d4830a';
      label.style.textTransform = 'uppercase';
      label.style.margin = '0';
      content.appendChild(label);

      // QUOTE: Show quote text + author
      if (contentType === 'quote') {
       const quoteEl = document.createElement('p');
       quoteEl.textContent = `"${item.body}"`;
       quoteEl.style.fontSize = '18px';
       quoteEl.style.fontWeight = '600';
       quoteEl.style.fontStyle = 'italic';
       quoteEl.style.lineHeight = '1.6';
       quoteEl.style.color = '#2c1e0f';
       quoteEl.style.margin = '0';
       quoteEl.style.fontFamily = "'Playfair Display', serif";
       content.appendChild(quoteEl);

       if (item.title || item.author) {
         const authorEl = document.createElement('p');
         authorEl.textContent = `— ${item.title || item.author}`;
         authorEl.style.fontSize = '13px';
         authorEl.style.color = '#7a5c3a';
         authorEl.style.margin = '0';
         authorEl.style.marginTop = '8px';
         content.appendChild(authorEl);
       }
      }

      // SCRIPTURE: Show text + reference
      if (contentType === 'scripture') {
       const scriptureEl = document.createElement('p');
       scriptureEl.textContent = item.body;
       scriptureEl.style.fontSize = '18px';
       scriptureEl.style.fontStyle = 'italic';
       scriptureEl.style.lineHeight = '1.6';
       scriptureEl.style.color = '#2c1e0f';
       scriptureEl.style.margin = '0';
       scriptureEl.style.fontFamily = "'Playfair Display', serif";
       content.appendChild(scriptureEl);

       if (item.title || item.author) {
         const refEl = document.createElement('p');
         refEl.textContent = item.title || item.author;
         refEl.style.fontSize = '13px';
         refEl.style.color = '#7a5c3a';
         refEl.style.margin = '0';
         refEl.style.marginTop = '8px';
         content.appendChild(refEl);
       }
      }

      // AFFIRMATION: Just the text
      if (contentType === 'affirmation') {
       const affEl = document.createElement('p');
       affEl.textContent = item.body;
       affEl.style.fontSize = '20px';
       affEl.style.fontWeight = '600';
       affEl.style.lineHeight = '1.6';
       affEl.style.color = '#2c1e0f';
       affEl.style.margin = '0';
       content.appendChild(affEl);
      }

      // IDENTITY SWAP: Old lie + new truth
      if (contentType === 'identity_swap') {
       if (item.old_belief) {
         const oldEl = document.createElement('p');
         oldEl.textContent = `"${item.old_belief}"`;
         oldEl.style.fontSize = '14px';
         oldEl.style.textDecoration = 'line-through';
         oldEl.style.color = '#9a9a9a';
         oldEl.style.fontStyle = 'italic';
         oldEl.style.lineHeight = '1.5';
         oldEl.style.margin = '0';
         content.appendChild(oldEl);
       }

       if (item.body) {
         const newEl = document.createElement('p');
         newEl.textContent = `"${item.body}"`;
         newEl.style.fontSize = '18px';
         newEl.style.fontWeight = '600';
         newEl.style.color = '#d4830a';
         newEl.style.lineHeight = '1.6';
         newEl.style.margin = '0';
         newEl.style.marginTop = '12px';
         content.appendChild(newEl);
       }
      }

      // MEMORY/BLESSING/LIFE WIN: Body + metadata
      if (['experience', 'blessing', 'life_win'].includes(contentType)) {
       const bodyEl = document.createElement('p');
       bodyEl.textContent = item.body;
       bodyEl.style.fontSize = '18px';
       bodyEl.style.lineHeight = '1.6';
       bodyEl.style.color = '#2c1e0f';
       bodyEl.style.margin = '0';
       content.appendChild(bodyEl);

       if (item.location || item.entry_date) {
         const metaEl = document.createElement('p');
         const parts = [];
         if (item.location) parts.push(item.location);
         if (item.entry_date) parts.push(new Date(item.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
         metaEl.textContent = parts.join(' • ');
         metaEl.style.fontSize = '12px';
         metaEl.style.color = '#c4a882';
         metaEl.style.marginTop = '8px';
         metaEl.style.margin = '0';
         content.appendChild(metaEl);
       }
      }



      // Branding footer
      const footer = document.createElement('p');
      footer.textContent = 'Perk Up Daily';
      footer.style.fontSize = '12px';
      footer.style.color = '#c4a882';
      footer.style.marginTop = '12px';
      footer.style.margin = '0';
      content.appendChild(footer);

      container.appendChild(content);
      document.body.appendChild(container);

      // Generate image
      const canvas = await html2canvas(container, {
        scale: 1,
        backgroundColor: null,
        logging: false,
      });

      const imageData = canvas.toDataURL('image/png');

      if (preview) {
        setPreviewImage(imageData);
      } else {
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `perk-up-${Date.now()}.png`;
        link.click();
      }

      document.body.removeChild(container);
    } catch (error) {
      console.error('Failed to generate share image:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyText = () => {
    const text = `"${item.body}"${item.title ? ` — ${item.title}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenShare = async () => {
    setPreviewOpen(true);
    await generateShareImage(selectedFormat, true);
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
        <Button
          onClick={handleCopyText}
          variant="ghost"
          size="sm"
          className="text-xs"
        >
          {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button
          onClick={handleOpenShare}
          disabled={generating}
          variant="ghost"
          size="sm"
          className="text-xs"
        >
          <Share2 className="w-4 h-4 mr-1" />
          {generating ? 'Creating...' : 'Share'}
        </Button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleOpenShare}
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
                <Button variant="outline" onClick={() => setPreviewOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleDownload} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}