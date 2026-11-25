import { json, PRODUCT_ID, requiredEnv } from "./lib/order.js";
import { createCheckoutSessionParams, parseBusinessInvoiceRequest } from "./lib/checkout-session.js";

export default async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Use POST to start checkout." }, 405);
  }

  const siteUrl = requiredEnv("SITE_URL").replace(/\/$/, "");
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).origin !== new URL(siteUrl).origin) {
    return json({ error: "Checkout must be started from the Rowcraft website." }, 403);
  }

  let businessInvoice;
  try {
    businessInvoice = parseBusinessInvoiceRequest(await request.text());
  } catch (error) {
    return json({ error: error.message }, 400);
  }

  const blobKey = requiredEnv("PRODUCT_BLOB_KEY");
  const release = requiredEnv("PRODUCT_RELEASE_DATE");
  const params = createCheckoutSessionParams({
    siteUrl,
    productId: PRODUCT_ID,
    blobKey,
    release,
    businessInvoice,
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requiredEnv("STRIPE_SECRET_KEY")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const result = await response.json();
  if (!response.ok || !result.url) {
    console.error("Stripe Checkout session creation failed", {
      status: response.status,
      message: result.error?.message,
    });
    return json({ error: "Secure checkout is temporarily unavailable. Please try again later." }, 502);
  }
  return json({ url: result.url });
};
