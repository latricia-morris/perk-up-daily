import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Share2 } from 'lucide-react';
import { getCategoryLabel } from '@/lib/constants';
import ShareCard from '@/components/shared/ShareCard';

const typeConfig = {
  quote: { label: 'Quote' },
  affirmation: { label: 'Affirmation' },
  scripture: { label: 'Scripture' },
  experience: { label: 'Memory' },
  blessing: { label: 'Blessing' },
  life_win: { label: 'Life Win' },
  accomplishment: { label: 'Life Win' },
  milestone: { label: 'Life Win' },
  personal_note: { label: 'Note' },
  identity_swap: { label: 'Identity Upgrade' },
};

export default function EntryDetailModal({ item, onClose }) {
  const contentType = item.entry_type;
  const cfg = typeConfig[contentType] || { label: 'Entry' };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        style={{
          background: 'linear-gradient(135deg, rgba(212,131,10,0.08) 0%, #fffdf8 60%)',
          border: '1px solid rgba(212,131,10,0.15)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 md:p-12 flex flex-col items-center text-center">
          {/* Type label */}
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#d4830a' }}>
            {cfg.label}
          </p>

          {/* Photo if present */}
          {item.photo_url && (
            <img
              src={item.photo_url}
              alt=""
              className="w-full max-w-sm rounded-xl object-cover mb-6 max-h-64"
            />
          )}

          {/* Body text */}
          {item.entry_type === 'identity_swap' ? (
            <div className="space-y-6 w-full">
              {item.old_belief && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    My Old Lie-dentity
                  </p>
                  <p className="text-base line-through text-muted-foreground leading-relaxed">
                    {item.old_belief}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#d4830a' }}>
                  My True Identity
                </p>
                <p className="text-xl font-display italic leading-relaxed" style={{ color: '#2c1e0f' }}>
                  {item.body}
                </p>
              </div>
            </div>
          ) : (
            <p
              className="text-base font-display italic leading-relaxed max-w-xl"
              style={{ color: '#2c1e0f', fontSize: '16px' }}
            >
              {item.body}
            </p>
          )}

          {/* Attribution/metadata */}
          <div className="mt-8 space-y-2 text-sm">
            {contentType === 'quote' && item.title && (
              <p style={{ color: '#7a5c3a' }}>— {item.title}</p>
            )}
            {contentType === 'scripture' && item.title && (
              <p style={{ color: '#7a5c3a' }}>{item.title}</p>
            )}
            {(contentType === 'life_win' || contentType === 'accomplishment' || contentType === 'milestone') && item.entry_date && (
              <p style={{ color: '#c4a882' }}>
                {new Date(item.entry_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
            {contentType === 'experience' && (
              <div style={{ color: '#c4a882' }}>
                {item.location && item.entry_date && (
                  <p>
                    {item.location} • {new Date(item.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
                {item.location && !item.entry_date && <p>{item.location}</p>}
                {!item.location && item.entry_date && (
                  <p>{new Date(item.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                )}
              </div>
            )}
            {item.category && (
              <p style={{ color: '#c4a882' }}>{getCategoryLabel(item.category)}</p>
            )}
          </div>

          {/* Share button */}
          <div className="mt-8 flex justify-center">
            <ShareCard item={item} isDetailView />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}