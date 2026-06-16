import { motion } from 'framer-motion';
import { getCategoryLabel } from '@/lib/constants';
import { Sparkles, BookOpen, Quote, Heart } from 'lucide-react';

const typeIcons = {
  quote: Quote,
  affirmation: Sparkles,
  scripture: BookOpen,
  encouragement_note: Heart,
  experience: Heart,
  blessing: Heart,
  accomplishment: Sparkles,
  milestone: Sparkles,
  personal_note: Quote,
};

export default function UpliftCard({ item, featured = false, source = 'library' }) {
  const contentType = item.content_type || item.entry_type;
  const Icon = typeIcons[contentType] || Sparkles;
  const body = item.body;
  const category = item.category;

  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-primary/8 border border-primary/20 rounded-2xl p-6 md:p-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-primary uppercase tracking-wider">
            {contentType?.replace(/_/g, ' ')}
          </span>
        </div>
        <p className="font-display text-xl md:text-2xl leading-relaxed text-foreground">
          {body}
        </p>
        {category && (
          <p className="text-xs text-muted-foreground mt-4">
            {getCategoryLabel(category)}
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          {item.title && (
            <p className="text-sm font-semibold text-foreground mb-1">{item.title}</p>
          )}
          <p className="text-sm text-foreground leading-relaxed line-clamp-3">{body}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {contentType?.replace(/_/g, ' ')}
            </span>
            {category && (
              <>
                <span className="text-text-faint">·</span>
                <span className="text-[10px] text-muted-foreground">
                  {getCategoryLabel(category)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}