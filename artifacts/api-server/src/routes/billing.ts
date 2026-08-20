import { Router } from "express";
import { requireAuth } from "../lib/auth";
import {
  createBillingPortalForUser,
  createCheckoutSessionForUser,
  getStripeBillingStatus,
  listWebPlans,
} from "../lib/stripeBilling";

const router: Router = Router();

router.get("/billing/plans", requireAuth, async (req, res): Promise<void> => {
  try {
    const plans = await listWebPlans();
    res.json({ plans });
  } catch (error) {
    req.log.error({ err: error }, "Unable to load Stripe billing plans");
    res.status(503).json({ error: "Web billing is not available yet. Please try again later." });
  }
});

router.get("/billing/status", requireAuth, async (req, res): Promise<void> => {
  try {
    // @ts-expect-error requireAuth attaches the database user to the request.
    const status = await getStripeBillingStatus(req.user);
    res.json(status);
  } catch (error) {
    req.log.error({ err: error }, "Unable to load Stripe billing status");
    res.status(503).json({ error: "Web billing is not available yet. Please try again later." });
  }
});

router.post("/billing/checkout", requireAuth, async (req, res): Promise<void> => {
  const priceId = req.body?.priceId;
  if (typeof priceId !== "string" || !priceId.startsWith("price_")) {
    res.status(400).json({ error: "A valid subscription price is required." });
    return;
  }

  try {
    // @ts-expect-error requireAuth attaches the database user to the request.
    const session = await createCheckoutSessionForUser(req.user, priceId);
    res.json(session);
  } catch (error) {
    req.log.error({ err: error }, "Unable to create Stripe Checkout session");
    res.status(503).json({ error: "Web billing is not available yet. Please try again later." });
  }
});

router.post("/billing/portal", requireAuth, async (req, res): Promise<void> => {
  try {
    // @ts-expect-error requireAuth attaches the database user to the request.
    const session = await createBillingPortalForUser(req.user);
    res.json(session);
  } catch (error) {
    req.log.error({ err: error }, "Unable to create Stripe billing portal session");
    res.status(503).json({ error: "Web billing is not available yet. Please try again later." });
  }
});

export default router;