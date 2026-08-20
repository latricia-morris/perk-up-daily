import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Smartphone, Sun } from "lucide-react";

const perks = [
  "Daily rhythm and reminders to keep life upbeat",
  "Unlimited personal entries in your vault",
  "Life wins and milestone tracking",
  "A curated library of quotes and affirmations",
  "Optional faith-based content",
];

export default function Paywall() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sun className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
            Perk Up Premium
          </h2>
          <p className="text-muted-foreground text-sm">
            Premium subscriptions are planned for future Perk Up Daily mobile apps.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 mb-6 space-y-3">
          {perks.map((perk) => (
            <div key={perk} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm text-foreground">{perk}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-muted/60 border border-border p-4 text-center mb-5">
          <Smartphone className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">Free web access is available now</p>
          <p className="text-xs text-muted-foreground mt-1">
            Purchases and billing management are not available in this web preview.
          </p>
        </div>

        <Button className="w-full bg-primary hover:bg-primary/90" size="lg" onClick={() => { window.location.href = "/dashboard"; }}>
          Continue with free access
        </Button>
      </motion.div>
    </div>
  );
}