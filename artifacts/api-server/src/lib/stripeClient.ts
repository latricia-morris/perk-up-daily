import Stripe from "stripe";
import { StripeSync } from "stripe-replit-sync";

type StripeCredentials = {
  secretKey: string;
  webhookSecret?: string;
};

async function getStripeCredentials(): Promise<StripeCredentials> {
  const workspaceSecret = process.env.STRIPE_LIVE_SECRET_KEY ?? process.env.Stripe;
  if (workspaceSecret) {
    return {
      secretKey: workspaceSecret,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    };
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const identity = process.env.REPL_IDENTITY
    ? `repl ${process.env.REPL_IDENTITY}`
    : process.env.WEB_REPL_RENEWAL
      ? `depl ${process.env.WEB_REPL_RENEWAL}`
      : null;

  if (!hostname || !identity) {
    throw new Error("Stripe is not available in this runtime. Connect it through Replit Integrations.");
  }

  const response = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=stripe`,
    {
      headers: { Accept: "application/json", X_REPLIT_TOKEN: identity },
      signal: AbortSignal.timeout(10_000),
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to load Stripe connection credentials (${response.status}).`);
  }

  const payload = await response.json() as {
    items?: Array<{
      settings?: {
        secret_key?: string;
        api_key?: string;
        apiKey?: string;
        secret?: string;
        webhook_secret?: string;
      };
    }>;
  };
  const settings = payload.items?.[0]?.settings;
  const secretKey = settings?.secret_key ?? settings?.api_key ?? settings?.apiKey ?? settings?.secret;
  if (!secretKey) {
    const availableFields = Object.keys(settings ?? {}).sort().join(", ") || "none";
    throw new Error(`Stripe is connected but does not provide a secret key (available fields: ${availableFields}).`);
  }

  return {
    secretKey,
    webhookSecret: settings?.webhook_secret,
  };
}

export async function getUncachableStripeClient(): Promise<Stripe> {
  const { secretKey } = await getStripeCredentials();
  return new Stripe(secretKey);
}

export async function getStripeSync(): Promise<StripeSync> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for Stripe synchronization.");
  }

  const { secretKey, webhookSecret } = await getStripeCredentials();
  return new StripeSync({
    poolConfig: { connectionString: databaseUrl },
    stripeSecretKey: secretKey,
    stripeWebhookSecret: webhookSecret ?? "",
  });
}