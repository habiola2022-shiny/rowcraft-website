import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

import { validSignature } from "../netlify/functions/stripe-webhook.js";

const secret = "whsec_test_secret";

function signatureFor(body, timestamp) {
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

test("validates a current Stripe webhook signature", () => {
  const body = JSON.stringify({ type: "checkout.session.completed" });
  const timestamp = Math.floor(Date.now() / 1000);
  assert.equal(validSignature(body, signatureFor(body, timestamp), secret), true);
});

test("rejects altered or stale Stripe webhook payloads", () => {
  const body = JSON.stringify({ type: "checkout.session.completed" });
  const staleTimestamp = Math.floor(Date.now() / 1000) - 600;
  assert.equal(validSignature(body, signatureFor(body, staleTimestamp), secret), false);
  assert.equal(validSignature(`${body} `, signatureFor(body, staleTimestamp + 600, secret), secret), false);
});
