export function parseBusinessInvoiceRequest(bodyText) {
  if (!bodyText.trim()) {
    return false;
  }

  let body;
  try {
    body = JSON.parse(bodyText);
  } catch {
    throw new Error("Checkout request must contain valid JSON.");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Checkout request must be a JSON object.");
  }
  if (body.businessInvoice !== undefined && typeof body.businessInvoice !== "boolean") {
    throw new Error("businessInvoice must be true or false.");
  }

  return body.businessInvoice === true;
}

export function createCheckoutSessionParams({ siteUrl, productId, blobKey, release, businessInvoice }) {
  const params = new URLSearchParams({
    mode: "payment",
    success_url: `${siteUrl}/purchase-success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/demo.html#purchase`,
    "line_items[0][price_data][currency]": "gbp",
    "line_items[0][price_data][unit_amount]": "499",
    "line_items[0][price_data][tax_behavior]": "inclusive",
    "line_items[0][price_data][product_data][name]": "ICO Data Protection Decisions CSV",
    "line_items[0][price_data][product_data][description]": "A combined, standardised compilation of publicly available ICO case data.",
    "line_items[0][quantity]": "1",
    "automatic_tax[enabled]": "true",
    billing_address_collection: businessInvoice ? "required" : "auto",
    "metadata[product]": productId,
    "metadata[blob_key]": blobKey,
    "metadata[release]": release,
    "metadata[business_invoice_requested]": String(businessInvoice),
    "payment_intent_data[metadata][product]": productId,
  });

  if (businessInvoice) {
    params.set("customer_creation", "always");
    params.set("tax_id_collection[enabled]", "true");
    params.set("invoice_creation[enabled]", "true");
    params.set("invoice_creation[invoice_data][description]", "ICO data protection decisions CSV");
    params.set(
      "invoice_creation[invoice_data][rendering_options][amount_tax_display]",
      "include_inclusive_tax",
    );
  }

  return params;
}
