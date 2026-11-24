import { getStore } from "@netlify/blobs";

export const PRODUCT_ID = "ico-data-protection-csv";

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required Netlify environment variable: ${name}`);
  }
  return value;
}

export function isPaidProductSession(session) {
  return session?.mode === "payment"
    && session?.payment_status === "paid"
    && session?.currency === "gbp"
    && session?.amount_total === 499
    && session?.metadata?.product === PRODUCT_ID
    && session?.metadata?.release === requiredEnv("PRODUCT_RELEASE_DATE")
    && session?.metadata?.blob_key === requiredEnv("PRODUCT_BLOB_KEY");
}

export async function fetchPaidSession(sessionId) {
  if (typeof sessionId !== "string" || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    throw new Error("A valid Stripe Checkout session ID is required.");
  }

  const response = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { headers: { Authorization: `Bearer ${requiredEnv("STRIPE_SECRET_KEY")}` } },
  );
  const session = await response.json();
  if (!response.ok) {
    throw new Error(`Stripe could not verify this order (HTTP ${response.status}).`);
  }
  if (!isPaidProductSession(session)) {
    throw new Error("This order is not a paid Rowcraft CSV purchase.");
  }
  return session;
}

export async function getProductArchive() {
  const store = getStore(requiredEnv("PRODUCT_BLOB_STORE"));
  const archive = await store.get(requiredEnv("PRODUCT_BLOB_KEY"), { type: "arrayBuffer" });
  if (!archive) {
    throw new Error("The paid data file is not available in secure storage.");
  }
  return Buffer.from(archive);
}

export async function emailProduct(session, eventId) {
  const email = session.customer_details?.email ?? session.customer_email;
  if (!email) {
    throw new Error("Stripe did not provide a customer email for this paid order.");
  }

  const archive = await getProductArchive();
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requiredEnv("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `rowcraft-order-${session.id}`,
    },
    body: JSON.stringify({
      from: requiredEnv("RESEND_FROM_EMAIL"),
      to: [email],
      subject: "Your Rowcraft ICO data CSV",
      text: [
        "Thanks for your purchase.",
        "",
        "Your ZIP attachment contains the combined ICO data protection decisions CSV and its source notes.",
        "The compilation contains 107,167 records, deduplicated by case reference, from the ICO source files current to 24 November 2026.",
        "",
        "A complaint or case outcome is not, by itself, proof of wrongdoing. The outcome labels are practical groupings of source decision details, not legal advice.",
        "",
        "Source attribution and reuse notes are included in README.txt inside the ZIP.",
        "If you need help, reply to this email or contact hello@rowcraftdata.com.",
      ].join("\n"),
      attachments: [{
        filename: "rowcraft-ico-data-protection-decisions.zip",
        content: archive.toString("base64"),
      }],
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    console.error("Resend rejected paid-order email", {
      eventId,
      sessionId: session.id,
      status: response.status,
      response: body.slice(0, 1000),
    });
    throw new Error(`Resend could not deliver the purchase email (HTTP ${response.status}).`);
  }
}
