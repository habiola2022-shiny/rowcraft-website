export function createCheckoutSessionParams({ siteUrl, productId, blobKey, release }) {
  return new URLSearchParams({
    mode: "payment",
    success_url: `${siteUrl}/purchase-success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/demo.html#purchase`,
    "line_items[0][price_data][currency]": "gbp",
    "line_items[0][price_data][unit_amount]": "499",
    "line_items[0][price_data][tax_behavior]": "inclusive",
    "line_items[0][price_data][product_data][name]": "ICO Data Protection Decisions Database",
    "line_items[0][price_data][product_data][description]": "An independent Rowcraft compilation of 107,167 unique published ICO complaint-case records from eight source CSVs. Standardised, deduplicated CSV with source notes; not an official ICO product.",
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
