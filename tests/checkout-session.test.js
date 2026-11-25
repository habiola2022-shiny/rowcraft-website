import test from "node:test";
import assert from "node:assert/strict";

import { createCheckoutSessionParams } from "../netlify/functions/lib/checkout-session.js";

const checkoutOptions = {
  siteUrl: "https://www.rowcraftdata.com",
  productId: "ico-data-protection-csv",
  blobKey: "ico-data-protection-decisions-2026-11-24.zip",
  release: "2026-11-24",
};

test("creates a tax-inclusive £4.99 Checkout session without invoice creation", () => {
  const params = createCheckoutSessionParams({
    ...checkoutOptions,
  });

  assert.equal(params.get("line_items[0][price_data][unit_amount]"), "499");
  assert.equal(params.get("line_items[0][price_data][tax_behavior]"), "inclusive");
  assert.equal(params.get("automatic_tax[enabled]"), "true");
  assert.equal(params.get("billing_address_collection"), "auto");
  assert.equal(params.get("tax_id_collection[enabled]"), "true");
  assert.equal(params.get("metadata[product]"), checkoutOptions.productId);
  assert.equal(params.get("invoice_creation[enabled]"), null);
});
