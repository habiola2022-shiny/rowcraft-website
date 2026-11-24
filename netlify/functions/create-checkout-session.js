import { json, PRODUCT_ID, requiredEnv } from "./lib/order.js";

export default async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Use POST to start checkout." }, 405);
  }

  const siteUrl = requiredEnv("SITE_URL").replace(/\/$/, "");
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).origin !== new URL(siteUrl).origin) {
    return json({ error: "Checkout must be started from the Rowcraft website." }, 403);
  }

  const blobKey = requiredEnv("PRODUCT_BLOB_KEY");
  const release = requiredEnv("PRODUCT_RELEASE_DATE");
  const params = new URLSearchParams({
    mode: "payment",
    "success_url": `${siteUrl}/purchase-success.html?session_id={CHECKOUT_SESSION_ID}`,
    "cancel_url": `${siteUrl}/demo.html#purchase`,
    "line_items[0][price_data][currency]": "gbp",
    "line_items[0][price_data][unit_amount]": "499",
    "line_items[0][price_data][product_data][name]": "ICO Data Protection Decisions CSV",
    "line_items[0][price_data][product_data][description]": "A combined, standardised compilation of publicly available ICO case data.",
    "line_items[0][quantity]": "1",
    "metadata[product]": PRODUCT_ID,
    "metadata[blob_key]": blobKey,
    "metadata[release]": release,
    "payment_intent_data[metadata][product]": PRODUCT_ID,
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
