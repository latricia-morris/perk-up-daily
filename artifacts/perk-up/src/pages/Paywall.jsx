import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles, Sun } from "lucide-react";
import { base44 } from "@/api/base44Client";

const perks = [
  "Daily rhythm and reminders to keep life upbeat",
  "Unlimited personal entries in your vault",
  "Life wins and milestone tracking",
  "A curated library of quotes and affirmations",
  "Optional faith-based content",
];

export default function Paywall() {
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workingPlan, setWorkingPlan] = useState(null);
  const [error, setError] = useState("");
  const checkoutState = searchParams.get("checkout");

  const refreshBilling = async () => {
    setLoading(true);
    setError("");
    try {
      const [plansResponse, statusResponse] = await Promise.all([
        base44.billing.listPlans(),
        base44.billing.status(),
      ]);
      setPlans(plansResponse.plans || []);
      setStatus(statusResponse);
    } catch (requestError) {
      setError(requestError.message || "We could not load subscription options.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBilling();
  }, []);

  useEffect(() => {
    if (checkoutState !== "success") return undefined;
    const retry = window.setTimeout(refreshBilling, 2500);
    return () => window.clearTimeout(retry);
  }, [checkoutState]);

  const beginCheckout = async (plan) => {
    setWorkingPlan(plan.id);
    setError("");
    try {
      const session = await base44.billing.startCheckout(plan.id);
      window.location.assign(session.url);
    } catch (requestError) {
      setError(requestError.message || "We could not start secure checkout.");
      setWorkingPlan(null);
    }
  };

  const manageBilling = async () => {
    setWorkingPlan("portal");
    setError("");
    try {
      const session = await base44.billing.openPortal();
      window.location.assign(session.url);
    } catch (requestError) {
      setError(requestError.message || "We could not open billing management.");
      setWorkingPlan(null);
    }
  };

  const formatPlanPrice = (plan) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: plan.currency?.toUpperCase() || "USD",
  }).format(plan.amount / 100);

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
            Choose a flexible web plan. Native app purchases remain managed separately.
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

        {checkoutState === "success" && (
          <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 text-center mb-5">
            <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Thanks for subscribing!</p>
            <p className="text-xs text-muted-foreground mt-1">
              We are confirming your subscription now. This page will update shortly.
            </p>
          </div>
        )}

        {checkoutState === "cancelled" && (
          <div className="rounded-2xl bg-muted/60 border border-border p-4 text-center mb-5">
            <p className="text-sm font-medium text-foreground">Checkout was cancelled</p>
            <p className="text-xs text-muted-foreground mt-1">No payment was made.</p>
          </div>
        )}

        {status?.isPremium ? (
          <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 text-center mb-5">
            <p className="text-sm font-medium text-foreground">
              Your web subscription is {status.cancelAtPeriodEnd ? "set to end" : "active"}.
            </p>
            {status.accessEndsAt && (
              <p className="text-xs text-muted-foreground mt-1">
                {status.cancelAtPeriodEnd ? "Access ends" : "Renews"} {new Date(status.accessEndsAt).toLocaleDateString()}.
              </p>
            )}
            <Button className="w-full mt-4" variant="outline" onClick={manageBilling} disabled={workingPlan === "portal"}>
              {workingPlan === "portal" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Manage web subscription
            </Button>
          </div>
        ) : loading ? (
          <div className="rounded-2xl bg-muted/60 border border-border p-5 text-center mb-5">
            <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
          </div>
        ) : plans.length ? (
          <div className="space-y-3 mb-5">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => beginCheckout(plan)}
                disabled={workingPlan !== null}
                className="w-full rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 disabled:opacity-60"
              >
                <span className="flex items-center justify-between gap-4">
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {plan.interval === "year" ? "Annual" : "Monthly"} Premium
                    </span>
                    <span className="block text-xs text-muted-foreground mt-1">
                      {formatPlanPrice(plan)} / {plan.interval === "year" ? "year" : "month"}
                    </span>
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {workingPlan === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Choose"}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-muted/60 border border-border p-4 text-center mb-5">
            <p className="text-sm font-medium text-foreground">Plans are not available right now</p>
            <p className="text-xs text-muted-foreground mt-1">Please try again in a moment.</p>
          </div>
        )}

        {error && <p className="text-sm text-destructive text-center mb-4">{error}</p>}

        <Button className="w-full bg-primary hover:bg-primary/90" size="lg" variant={status?.isPremium ? "outline" : "default"} onClick={() => { window.location.href = "/dashboard"; }}>
          Continue to dashboard
        </Button>
      </motion.div>
    </div>
  );
}