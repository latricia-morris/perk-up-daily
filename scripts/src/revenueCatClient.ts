import { createClient } from "@replit/revenuecat-sdk/client";
import { ReplitConnectors } from "@replit/connectors-sdk";

/**
 * Returns a RevenueCat SDK client authenticated through the Replit
 * connectors proxy. The proxy injects auth tokens automatically, so we
 * never handle the RevenueCat secret key directly.
 */
export async function getUncachableRevenueCatClient() {
  const connectors = new ReplitConnectors();

  const proxyFetch = (async (input: string | URL | Request, init?: RequestInit) => {
    let url: string;
    let method: string | undefined;
    let headers: Record<string, string> | undefined;
    let body: string | undefined;

    if (typeof input === "object" && input !== null && "url" in input) {
      // Request object — extract everything from it
      const request = input as Request;
      url = request.url;
      method = init?.method ?? request.method;
      const headerObj: Record<string, string> = {};
      request.headers.forEach((v, k) => { headerObj[k] = v; });
      headers = headerObj;
      const text = await request.clone().text();
      body = text.length > 0 ? text : undefined;
    } else {
      url = typeof input === "string" ? input : input.toString();
      method = init?.method ?? "GET";
      if (init?.headers) {
        const headerObj: Record<string, string> = {};
        new Headers(init.headers).forEach((v, k) => { headerObj[k] = v; });
        headers = headerObj;
      }
      body = typeof init?.body === "string" ? init.body : undefined;
    }

    // Path relative to https://api.revenuecat.com (keep the /v2 prefix)
    const path = url.replace(/^https?:\/\/[^/]+/, "");
    return connectors.proxy("revenuecat", path, { method, headers, body });
  }) as typeof fetch;

  return createClient({
    baseUrl: "https://api.revenuecat.com/v2",
    fetch: proxyFetch,
  });
}
