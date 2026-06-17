import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';

export default function ShareCard({ item, isDetailView = false }) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const generateShareImage = async (dimensions = '1080x1920') => {
    setSharing(true);
    try {
      // Create a temporary container for the card
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
      container.style.padding = '20px';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.justifyContent = 'center';
      container.style.alignItems = 'center';
      container.style.fontFamily = "'DM Sans', sans-serif";
      container.style.color = '#2c1e0f';
      container.style.textAlign = 'center';

      // Photo section (if exists)
      if (item.photo_url) {
        const photoHeight = height * 0.5;
        const img = document.createElement('img');
        img.src = item.photo_url;
        img.style.width = '100%';
        img.style.height = `${photoHeight}px`;
        img.style.objectFit = 'cover';
        img.style.objectPosition = 'center';
        img.style.borderRadius = '12px';
        img.style.marginBottom = '20px';
        container.appendChild(img);
      }

      // Content section
      const content = document.createElement('div');
      content.style.flex = '1';
      content.style.display = 'flex';
      content.style.flexDirection = 'column';
      content.style.justifyContent = 'center';
      content.style.padding = '0 20px';
      content.style.overflow = 'hidden';

      // Type label
      const label = document.createElement('p');
      label.textContent = item.entry_type === 'quote' ? 'Quote' : 
                          item.entry_type === 'scripture' ? 'Scripture' :
                          item.entry_type === 'affirmation' ? 'Affirmation' :
                          item.entry_type === 'blessing' ? 'Blessing' :
                          item.entry_type === 'life_win' ? 'Life Win' : 'Entry';
      label.style.fontSize = '12px';
      label.style.fontWeight = 'bold';
      label.style.letterSpacing = '1px';
      label.style.color = '#d4830a';
      label.style.marginBottom = '12px';
      label.style.textTransform = 'uppercase';
      content.appendChild(label);

      // Body text
      const body = document.createElement('p');
      body.textContent = item.body;
      body.style.fontSize = '24px';
      body.style.fontStyle = 'italic';
      body.style.lineHeight = '1.6';
      body.style.marginBottom = '12px';
      body.style.fontFamily = "'Playfair Display', serif";
      content.appendChild(body);

      // Attribution
      if ((item.entry_type === 'quote' || item.entry_type === 'scripture') && item.title) {
        const author = document.createElement('p');
        author.textContent = item.entry_type === 'quote' ? `— ${item.title}` : item.title;
        author.style.fontSize = '14px';
        author.style.color = '#7a5c3a';
        author.style.marginTop = '8px';
        content.appendChild(author);
      }

      // Branding footer
      const footer = document.createElement('p');
      footer.textContent = 'Perk Up Daily';
      footer.style.fontSize = '12px';
      footer.style.color = '#c4a882';
      footer.style.marginTop = '16px';
      content.appendChild(footer);

      container.appendChild(content);
      document.body.appendChild(container);

      // Generate image
      const canvas = await html2canvas(container, {
        scale: 1,
        backgroundColor: null,
      });

      // Download the image
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `perk-up-${Date.now()}.png`;
      link.click();

      document.body.removeChild(container);
    } catch (error) {
      console.error('Failed to generate share image:', error);
    } finally {
      setSharing(false);
    }
  };

  const handleCopyText = () => {
    const text = `"${item.body}"${item.title ? ` — ${item.title}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          onClick={() => generateShareImage('1080x1920')}
          disabled={sharing}
          variant="ghost"
          size="sm"
          className="text-xs"
        >
          <Share2 className="w-4 h-4 mr-1" />
          {sharing ? 'Creating...' : 'Share'}
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => generateShareImage('1080x1920')}
      disabled={sharing}
      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title="Share entry"
    >
      <Share2 className="w-3.5 h-3.5" />
    </button>
  );
}