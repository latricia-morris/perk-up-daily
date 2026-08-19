import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, RefreshCw, FileText } from 'lucide-react';

export default function AIGuardDialog({ open, onChoice }) {
  return (
    <Dialog open={open} onOpenChange={() => onChoice('draft')}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Is this the kind of memory you want resurfaced on a hard morning?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            We noticed this entry might carry some heaviness. You have a few options:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-3"
            onClick={() => onChoice('keep')}
          >
            <Heart className="w-4 h-4 text-secondary shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium">Keep it as a resilience win</p>
              <p className="text-xs text-muted-foreground">Include it in your deliveries as-is</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-3"
            onClick={() => onChoice('reframe')}
          >
            <RefreshCw className="w-4 h-4 text-primary shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium">Reframe it with a positive lens</p>
              <p className="text-xs text-muted-foreground">Let us suggest a brighter version</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-3"
            onClick={() => onChoice('draft')}
          >
            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium">Save as a private draft</p>
              <p className="text-xs text-muted-foreground">Kept safe but not included in deliveries</p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}