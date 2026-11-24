import test from "node:test";
import assert from "node:assert/strict";

import { isPaidProductSession, PRODUCT_ID } from "../netlify/functions/lib/order.js";

process.env.PRODUCT_BLOB_KEY = "ico-data-protection-decisions-2026-11-24.zip";
process.env.PRODUCT_RELEASE_DATE = "2026-11-24";

const paidSession = {
  mode: "payment",
  payment_status: "paid",
  currency: "gbp",
  amount_total: 499,
  metadata: {
    product: PRODUCT_ID,
    blob_key: process.env.PRODUCT_BLOB_KEY,
    release: process.env.PRODUCT_RELEASE_DATE,
  },
};

test("accepts only a paid £4.99 GBP Rowcraft product session", () => {
  assert.equal(isPaidProductSession(paidSession), true);
});

test("rejects unpaid, differently priced, or unrelated sessions", () => {
  assert.equal(isPaidProductSession({ ...paidSession, payment_status: "unpaid" }), false);
  assert.equal(isPaidProductSession({ ...paidSession, amount_total: 4990 }), false);
  assert.equal(isPaidProductSession({
    ...paidSession,
    metadata: { ...paidSession.metadata, product: "other-product" },
  }), false);
  assert.equal(isPaidProductSession({
    ...paidSession,
    metadata: { ...paidSession.metadata, release: "2026-11-25" },
  }), false);
});
