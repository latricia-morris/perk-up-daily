import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryLabel } from '@/lib/constants';
import { Sparkles, BookOpen, Quote, Heart, Star, Trophy } from 'lucide-react';
import ShareCard from '@/components/shared/ShareCard';
import EntryDetailModal from '@/components/shared/EntryDetailModal';

const typeConfig = {
  quote:              { icon: Quote,    accent: '#2872a8', bg: 'rgba(40,114,168,0.08)',  label: 'Quote' },
  affirmation:        { icon: Sparkles, accent: '#c2567a', bg: 'rgba(194,86,122,0.08)',  label: 'Affirmation' },
  scripture:          { icon: BookOpen, accent: '#2872a8', bg: 'rgba(40,114,168,0.08)',  label: 'Scripture' },
  encouragement_note: { icon: Heart,    accent: '#d4830a', bg: 'rgba(212,131,10,0.08)',  label: 'Note' },
  experience:         { icon: Star,     accent: '#d4830a', bg: 'rgba(212,131,10,0.08)',  label: 'Memory' },
  blessing:           { icon: Heart,    accent: '#c2567a', bg: 'rgba(194,86,122,0.08)', label: 'Blessing' },
  life_win:           { icon: Trophy,   accent: '#4a7c59', bg: 'rgba(74,124,89,0.08)',   label: 'Life Win' },
  accomplishment:     { icon: Trophy,   accent: '#4a7c59', bg: 'rgba(74,124,89,0.08)',   label: 'Life Win' },
  milestone:          { icon: Trophy,   accent: '#9b59b6', bg: 'rgba(155,89,182,0.08)',  label: 'Life Win' },
  personal_note:      { icon: Quote,    accent: '#d4830a', bg: 'rgba(212,131,10,0.08)',  label: 'Note' },
};

const fallback = { icon: Sparkles, accent: '#d4830a', bg: 'rgba(212,131,10,0.08)', label: 'Entry' };

export default function UpliftCard({ item, featured = false, source = 'library' }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const contentType = item.content_type || item.entry_type;
  const cfg = typeConfig[contentType] || fallback;
  const { icon: Icon, accent, bg, label } = cfg;
  const body = item.body;
  const category = item.category;

  if (featured) {
    return (
      <>
      <motion.div
        onClick={() => setDetailOpen(true)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl p-6 md:p-8 cursor-pointer transition-shadow hover:shadow-lg"
        style={{
          background: `linear-gradient(135deg, rgba(212,131,10,0.14) 0%, #fffdf8 60%)`,
          border: '1px solid rgba(212,131,10,0.2)',
          boxShadow: '0 4px 24px rgba(212,131,10,0.10)',
        }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-40px', right: '-40px',
            width: '180px', height: '180px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,131,10,0.14) 0%, transparent 70%)',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>
              {label}
            </span>
          </div>
          <p className="font-display text-xl md:text-2xl italic leading-relaxed" style={{ color: '#2c1e0f' }}>
            "{body}"
          </p>
          {contentType === 'quote' && item.author ? (
            <p className="text-xs mt-3 font-medium" style={{ color: '#7a5c3a' }}>— {item.author}</p>
          ) : contentType === 'scripture' && item.author ? (
            <p className="text-xs mt-3 font-medium" style={{ color: '#7a5c3a' }}>{item.author}</p>
          ) : (contentType === 'life_win' || contentType === 'milestone') && item.entry_date ? (
            <p className="text-xs mt-3" style={{ color: '#c4a882' }}>
              {new Date(item.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          ) : contentType === 'experience' ? (
            <div className="text-xs mt-3" style={{ color: '#c4a882' }}>
              {item.location && item.entry_date && <p>{item.location}, {new Date(item.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
              {item.location && !item.entry_date && <p>{item.location}</p>}
              {!item.location && item.entry_date && <p>{new Date(item.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
            </div>
          ) : category ? (
            <p className="text-xs mt-3" style={{ color: '#c4a882' }}>{getCategoryLabel(category)}</p>
          ) : null}
          <div className="absolute bottom-4 right-4">
            <ShareCard item={item} />
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {detailOpen && <EntryDetailModal item={item} onClose={() => setDetailOpen(false)} />}
      </AnimatePresence>
      </>
    );
  }

  return (
    <>
    <motion.div
      onClick={() => setDetailOpen(true)}
      className="cursor-pointer"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl p-4 transition-shadow hover:shadow-md"
      style={{
        background: '#fffdf8',
        border: '1px solid rgba(44,30,15,0.07)',
        boxShadow: '0 1px 4px rgba(44,30,15,0.06)',
      }}
    >
      <div className="flex items-center gap-1.5 mb-2.5">
        <Icon className="w-3 h-3" style={{ color: accent }} />
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accent }}>
          {label}
        </span>
      </div>
      <p className="font-display text-sm italic leading-relaxed line-clamp-3" style={{ color: '#2c1e0f' }}>
        "{body}"
      </p>
      <div className="flex flex-col gap-2 mt-2">
        <div>
          {contentType === 'quote' && item.author ? (
            <p className="text-[10px] font-medium" style={{ color: '#7a5c3a' }}>— {item.author}</p>
          ) : contentType === 'scripture' && item.author ? (
            <p className="text-[10px] font-medium" style={{ color: '#7a5c3a' }}>{item.author}</p>
          ) : (contentType === 'life_win' || contentType === 'milestone') && item.entry_date ? (
            <p className="text-[10px]" style={{ color: '#c4a882' }}>
              {new Date(item.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          ) : contentType === 'experience' && (item.location || item.entry_date) ? (
            <p className="text-[10px]" style={{ color: '#c4a882' }}>
              {item.location && item.entry_date && `${item.location}, ${new Date(item.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
              {item.location && !item.entry_date && item.location}
              {!item.location && item.entry_date && new Date(item.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          ) : category ? (
            <p className="text-[10px]" style={{ color: '#c4a882' }}>{getCategoryLabel(category)}</p>
          ) : null}
        </div>
        <div className="self-end">
          <ShareCard item={item} />
        </div>
      </div>
      </motion.div>
      <AnimatePresence>
      {detailOpen && <EntryDetailModal item={item} onClose={() => setDetailOpen(false)} />}
      </AnimatePresence>
      </>
      );
      }