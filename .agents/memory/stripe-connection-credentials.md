---
name: Stripe connection credentials
description: Replit Stripe checkout requires a server-side Stripe API key from the connection.
---

The web Stripe integration needs a connection that exposes a server-side Stripe API key to application code; a healthy connector with agent-only assignments is not sufficient for Checkout, managed webhooks, or price synchronization.

**Why:** The Stripe SDK and `stripe-replit-sync` need this credential to create Checkout sessions and verify managed webhooks. Do not replace it with a manually pasted secret.

**How to apply:** If the app reports that Stripe is connected but lacks a secret key, have the owner update the existing Stripe integration through Replit’s Integrations UI. Do not use OAuth reauthorization for this API-key connection and never ask the owner to paste the key into chat.