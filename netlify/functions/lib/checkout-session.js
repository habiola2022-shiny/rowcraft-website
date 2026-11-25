export function createCheckoutSessionParams({ siteUrl, productId, blobKey, release }) {
  return new URLSearchParams({
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
    billing_address_collection: "auto",
    "tax_id_collection[enabled]": "true",
    "metadata[product]": productId,
    "metadata[blob_key]": blobKey,
    "metadata[release]": release,
    "payment_intent_data[metadata][product]": productId,
  });
}
