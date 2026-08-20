import Stripe from "stripe";

async function getStripeSecretKey(): Promise<string> {
  if (process.env.Stripe) {
    return process.env.Stripe;
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
      settings?: { secret_key?: string; api_key?: string; apiKey?: string; secret?: string };
    }>;
  };
  const settings = payload.items?.[0]?.settings;
  const secretKey = settings?.secret_key ?? settings?.api_key ?? settings?.apiKey ?? settings?.secret;
  if (!secretKey) {
    throw new Error("Stripe is connected but does not provide a secret key.");
  }
  return secretKey;
}

export async function getUncachableStripeClient(): Promise<Stripe> {
  return new Stripe(await getStripeSecretKey());
}