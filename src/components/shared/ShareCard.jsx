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
      content.style.overflow = 'hidden';
      content.style.gap = '16px';

      // Type label
      const label = document.createElement('p');
      label.textContent = item.entry_type === 'quote' ? 'QUOTE' : 
                          item.entry_type === 'scripture' ? 'SCRIPTURE' :
                          item.entry_type === 'affirmation' ? 'AFFIRMATION' :
                          item.entry_type === 'blessing' ? 'BLESSING' :
                          item.entry_type === 'life_win' ? 'LIFE WIN' :
                          item.entry_type === 'experience' ? 'MEMORY' :
                          item.entry_type === 'personal_note' ? 'NOTE' :
                          item.entry_type === 'identity_swap' ? 'IDENTITY UPGRADE' : 'ENTRY';
      label.style.fontSize = '11px';
      label.style.fontWeight = 'bold';
      label.style.letterSpacing = '2px';
      label.style.color = '#d4830a';
      label.style.textTransform = 'uppercase';
      label.style.margin = '0';
      content.appendChild(label);

      // Title (if exists, for entries with custom titles like identity_swap)
      const titleToShow = item.title || item.author;
      if (titleToShow && item.entry_type !== 'quote' && item.entry_type !== 'scripture' && item.entry_type !== 'life_win' && item.entry_type !== 'experience' && item.entry_type !== 'blessing') {
        const title = document.createElement('p');
        title.textContent = titleToShow;
        title.style.fontSize = '20px';
        title.style.fontWeight = '600';
        title.style.lineHeight = '1.4';
        title.style.margin = '0';
        title.style.fontFamily = "'Playfair Display', serif";
        content.appendChild(title);
      }

      // Body text
      const body = document.createElement('p');
      body.textContent = item.body;
      body.style.fontSize = '20px';
      body.style.fontStyle = item.entry_type === 'quote' || item.entry_type === 'scripture' ? 'italic' : 'normal';
      body.style.lineHeight = '1.6';
      body.style.margin = '0';
      body.style.fontFamily = item.entry_type === 'quote' || item.entry_type === 'scripture' ? "'Playfair Display', serif" : "'DM Sans', sans-serif";
      body.style.color = '#2c1e0f';
      content.appendChild(body);

      // Attribution (author/reference for quotes and scriptures)
      const attribution = item.title || item.author;
      if ((item.entry_type === 'quote' || item.entry_type === 'scripture') && attribution) {
        const author = document.createElement('p');
        author.textContent = item.entry_type === 'quote' ? `— ${attribution}` : attribution;
        author.style.fontSize = '13px';
        author.style.color = '#7a5c3a';
        author.style.margin = '0';
        author.style.fontStyle = 'normal';
        content.appendChild(author);
      }

      // Metadata row (category, date, location)
      const metaRow = document.createElement('div');
      metaRow.style.display = 'flex';
      metaRow.style.gap = '12px';
      metaRow.style.flexWrap = 'wrap';
      metaRow.style.justifyContent = 'center';
      metaRow.style.fontSize = '11px';
      metaRow.style.color = '#7a5c3a';
      metaRow.style.margin = '0';

      const categoryMap = {
        deep_faith: 'Deep Faith',
        rich_relationships: 'Rich Relationships',
        strong_body: 'Healthy Body',
        clear_mind: 'Sound Mind',
        strong_business: 'Legacy Business',
        sound_money: 'Financial Freedom'
      };

      if (item.category) {
        metaRow.textContent += (categoryMap[item.category] || item.category);
      }
      if (item.entry_date) {
        if (metaRow.textContent) metaRow.textContent += ' • ';
        metaRow.textContent += format(new Date(item.entry_date), 'MMM d, yyyy');
      }
      if (item.location) {
        if (metaRow.textContent) metaRow.textContent += ' • ';
        metaRow.textContent += item.location;
      }

      if (metaRow.textContent) {
        content.appendChild(metaRow);
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