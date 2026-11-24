import { createHmac, timingSafeEqual } from "node:crypto";
import { emailProduct, fetchPaidSession, json, PRODUCT_ID, requiredEnv } from "./lib/order.js";

export function validSignature(body, signatureHeader, secret) {
  const parts = signatureHeader.split(",").map((part) => part.split("=", 2));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || signatures.length === 0 || !/^\d+$/.test(timestamp)) {
    return false;
  }
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest();
  return signatures.some((signature) => {
    if (!/^[a-f0-9]{64}$/i.test(signature)) {
      return false;
    }
    return timingSafeEqual(expected, Buffer.from(signature, "hex"));
  });
}

export default async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Use POST for Stripe webhooks." }, 405);
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature || !validSignature(body, signature, requiredEnv("STRIPE_WEBHOOK_SECRET"))) {
    return json({ error: "Invalid Stripe webhook signature." }, 400);
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return json({ error: "Invalid Stripe webhook payload." }, 400);
  }

  const supportedEvents = new Set([
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
  ]);
  if (!supportedEvents.has(event.type)) {
    return json({ received: true });
  }

  const sessionId = event.data?.object?.id;
  if (event.data?.object?.metadata?.product !== PRODUCT_ID) {
    return json({ received: true });
  }

  try {
    const session = await fetchPaidSession(sessionId);
    await emailProduct(session, event.id);
    return json({ received: true });
  } catch (error) {
    console.error("Stripe paid-order fulfillment failed", {
      eventId: event.id,
      sessionId,
      message: error.message,
    });
    return json({ error: "Purchase email delivery failed; Stripe will retry this webhook." }, 500);
  }
};
