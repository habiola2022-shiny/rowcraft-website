import test from "node:test";
import assert from "node:assert/strict";

import {
  createCheckoutSessionParams,
  parseBusinessInvoiceRequest,
} from "../netlify/functions/lib/checkout-session.js";

const checkoutOptions = {
  siteUrl: "https://www.rowcraftdata.com",
  productId: "ico-data-protection-csv",
  blobKey: "ico-data-protection-decisions-2026-11-24.zip",
  release: "2026-11-24",
};

test("creates a tax-inclusive £4.99 Checkout session without an invoice by default", () => {
  const params = createCheckoutSessionParams({
    ...checkoutOptions,
    businessInvoice: false,
  });

  assert.equal(params.get("line_items[0][price_data][unit_amount]"), "499");
  assert.equal(params.get("line_items[0][price_data][tax_behavior]"), "inclusive");
  assert.equal(params.get("automatic_tax[enabled]"), "true");
  assert.equal(params.get("billing_address_collection"), "auto");
  assert.equal(params.get("metadata[product]"), checkoutOptions.productId);
  assert.equal(params.get("invoice_creation[enabled]"), null);
  assert.equal(params.get("tax_id_collection[enabled]"), null);
});

test("creates a paid invoice and collects business tax details when requested", () => {
  const params = createCheckoutSessionParams({
    ...checkoutOptions,
    businessInvoice: true,
  });

  assert.equal(params.get("invoice_creation[enabled]"), "true");
  assert.equal(params.get("tax_id_collection[enabled]"), "true");
  assert.equal(params.get("customer_creation"), "always");
  assert.equal(params.get("billing_address_collection"), "required");
  assert.equal(
    params.get("invoice_creation[invoice_data][rendering_options][amount_tax_display]"),
    "include_inclusive_tax",
  );
  assert.equal(params.get("metadata[business_invoice_requested]"), "true");
});

test("accepts only a JSON boolean for business invoice requests", () => {
  assert.equal(parseBusinessInvoiceRequest(""), false);
  assert.equal(parseBusinessInvoiceRequest('{"businessInvoice":true}'), true);
  assert.equal(parseBusinessInvoiceRequest('{"businessInvoice":false}'), false);
  assert.throws(() => parseBusinessInvoiceRequest("{"), /valid JSON/);
  assert.throws(() => parseBusinessInvoiceRequest("[]"), /JSON object/);
  assert.throws(() => parseBusinessInvoiceRequest('{"businessInvoice":"true"}'), /true or false/);
});
