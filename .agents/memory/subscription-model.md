---
name: Web and mobile subscription model
description: Product decision governing web Stripe and native RevenueCat subscription behavior.
---

Web subscriptions are enabled through Stripe with monthly and annual plans from the connected Stripe product. Native mobile purchases remain separate through RevenueCat. A subscription from either provider can grant premium access, and a cancellation from one provider must not revoke access still granted by the other.

**Why:** The product decision changed to support direct web checkout while retaining native app-store billing.

**How to apply:** Keep Stripe customer and subscription references separate from RevenueCat metadata. Aggregate entitlement from both provider states rather than treating either source as authoritative. Surface web billing management only for Stripe subscriptions; native purchase messaging must continue to point to the relevant app store.

For web Checkout, retries must resolve to the same pending purchase rather than creating another purchasable subscription session.

**Why:** Network responses and database writes can fail after Stripe has accepted a create request; changing the idempotency key or replacing the session could leave multiple payable sessions.

**How to apply:** Use Stripe idempotency and preserve the pending-purchase identity across retry paths; do not release it based on an arbitrary local timeout.