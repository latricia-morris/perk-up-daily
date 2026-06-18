import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryLabel } from '@/lib/constants';
import { getSchema, getDisplayLabel } from '@/lib/contentSchema';
import { Sparkles, BookOpen, Quote, Heart, Star, Trophy } from 'lucide-react';

const categoryColors = {
  deep_faith:         { bg: '#37154A', color: '#FFFCF2' },
  rich_relationships: { bg: '#C43911', color: '#FFFCF2' },
  strong_body:        { bg: '#F78F00', color: '#2F2C29' },
  clear_mind:         { bg: '#0F2459', color: '#FFFCF2' },
  strong_business:    { bg: '#75003C', color: '#FFFCF2' },
  sound_money:        { bg: '#E6A037', color: '#2F2C29' },
};
import ShareCard from '@/components/shared/ShareCard';
import EntryDetailModal from '@/components/shared/EntryDetailModal';

const typeConfig = {
  quote:              { icon: Quote,    accent: '#D0902D', bg: 'rgba(208,144,45,0.08)' },
  affirmation:        { icon: Sparkles, accent: '#E6A037', bg: 'rgba(230,160,55,0.08)' },
  scripture:          { icon: BookOpen, accent: '#D0902D', bg: 'rgba(208,144,45,0.08)' },
  encouragement_note: { icon: Heart,    accent: '#E6A037', bg: 'rgba(230,160,55,0.08)' },
  personal_note:      { icon: Quote,    accent: '#D0902D', bg: 'rgba(208,144,45,0.08)' },
  experience:         { icon: Star,     accent: '#E6A037', bg: 'rgba(230,160,55,0.08)' },
  blessing:           { icon: Heart,    accent: '#D0902D', bg: 'rgba(208,144,45,0.08)' },
  life_win:           { icon: Trophy,   accent: '#E6A037', bg: 'rgba(230,160,55,0.08)' },
  accomplishment:     { icon: Trophy,   accent: '#E6A037', bg: 'rgba(230,160,55,0.08)' },
  milestone:          { icon: Trophy,   accent: '#D0902D', bg: 'rgba(208,144,45,0.08)' },
  identity_swap:      { icon: Sparkles, accent: '#E6A037', bg: 'rgba(230,160,55,0.08)' },
};

const fallback = { icon: Sparkles, accent: '#d4830a', bg: 'rgba(212,131,10,0.08)' };

/**
 * Canonical field resolver — reads from the correct field per content type.
 */
function resolveDisplayFields(item) {
  const entryType = item.content_type || item.entry_type;
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
    category: item.category || null,
  };
}

/** Renders ALL populated secondary fields for a tile, per content type — never early-returns */
function TileSubline({ fields, size = 'sm' }) {
  const { entryType, author, reference, location, date, category } = fields;
  const textClass = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const lines = [];

  if (entryType === 'quote' && author) {
    lines.push(<p key="author" className={`${textClass} font-medium`} style={{ color: '#7a5c3a' }}>— {author}</p>);
  }
  if (entryType === 'scripture' && reference) {
    lines.push(<p key="reference" className={`${textClass} font-medium`} style={{ color: '#7a5c3a' }}>{reference}</p>);
  }
  if (entryType === 'experience') {
    const parts = [];
    if (location) parts.push(location);
    if (date) parts.push(new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    if (parts.length) lines.push(<p key="meta" className={`${textClass}`} style={{ color: '#c4a882' }}>{parts.join(' • ')}</p>);
  }
  if (['life_win', 'milestone', 'blessing', 'personal_note'].includes(entryType) && date) {
    lines.push(<p key="date" className={`${textClass}`} style={{ color: '#c4a882' }}>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>);
  }
  if (!lines.length && category) {
    const catStyle = categoryColors[category] || { bg: '#E6A037', color: '#2F2C29' };
    lines.push(
      <span
        key="category"
        className={`${textClass} inline-flex items-center rounded-full font-medium px-2 py-0.5`}
        style={{ backgroundColor: catStyle.bg, color: catStyle.color }}
      >
        {getCategoryLabel(category)}
      </span>
    );
  }

  if (!lines.length) return null;
  return <div className="flex flex-col gap-0.5 mt-2">{lines}</div>;
}

export default function UpliftCard({ item, featured = false }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const fields = resolveDisplayFields(item);
  const { entryType, label, body, photo } = fields;
  const cfg = typeConfig[entryType] || fallback;
  const { icon: Icon, accent } = cfg;

  if (featured) {
    return (
      <>
        <motion.div
          onClick={() => setDetailOpen(true)}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl cursor-pointer transition-shadow hover:shadow-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(212,131,10,0.14) 0%, #fffdf8 60%)',
            border: '1px solid rgba(212,131,10,0.2)',
            boxShadow: '0 4px 24px rgba(212,131,10,0.10)',
          }}
        >
          {/* Photo — full width, 50% of card height when present */}
          {photo && (
            <div className="w-full overflow-hidden" style={{ height: '240px' }}>
              <img
                src={photo}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', display: 'block' }}
              />
            </div>
          )}

          <div className="p-6 md:p-8 relative">
            <div
              className="absolute pointer-events-none"
              style={{ top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,131,10,0.14) 0%, transparent 70%)' }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>{label}</span>
              </div>

              {entryType === 'identity_swap' && fields.old_belief ? (
                <>
                  <p className="font-display text-base italic line-through mb-3" style={{ color: '#9a9a9a' }}>"{fields.old_belief}"</p>
                  <p className="font-display text-xl md:text-2xl font-semibold leading-relaxed" style={{ color: '#d4830a' }}>"{body}"</p>
                </>
              ) : (
                <p className="font-display text-xl md:text-2xl italic leading-relaxed" style={{ color: '#2c1e0f' }}>"{body}"</p>
              )}

              <TileSubline fields={fields} size="base" />

              <div className="absolute bottom-0 right-0">
                <ShareCard item={item} />
              </div>
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
        className="cursor-pointer rounded-xl p-4 transition-shadow hover:shadow-md"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ background: '#fffdf8', border: '1px solid rgba(44,30,15,0.07)', boxShadow: '0 1px 4px rgba(44,30,15,0.06)' }}
      >
        {/* Photo thumbnail */}
        {photo && (
          <div className="w-full overflow-hidden rounded-lg mb-3" style={{ height: '120px' }}>
            <img
              src={photo}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', display: 'block' }}
            />
          </div>
        )}

        <div className="flex items-center gap-1.5 mb-2.5">
          <Icon className="w-3 h-3" style={{ color: accent }} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accent }}>{label}</span>
        </div>

        {entryType === 'identity_swap' && fields.old_belief ? (
          <>
            <p className="font-display text-xs italic line-through mb-1 line-clamp-2" style={{ color: '#9a9a9a' }}>"{fields.old_belief}"</p>
            <p className="font-display text-sm font-semibold leading-relaxed line-clamp-2" style={{ color: '#d4830a' }}>"{body}"</p>
          </>
        ) : (
          <p className="font-display text-sm italic leading-relaxed line-clamp-3" style={{ color: '#2c1e0f' }}>"{body}"</p>
        )}

        <div className="flex flex-col gap-2 mt-2">
          <TileSubline fields={fields} size="sm" />
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