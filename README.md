# Rowcraft website

Rowcraft's public-data website, deployed on Netlify. The ICO explorer is hosted separately on Streamlit and embedded in `demo.html`.

## Preview locally

The simplest option is to open `index.html` in your browser. For a local web server, run:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Pages

- `index.html` — Rowcraft homepage and ICO CSV collection offer.
- `demo.html` — embedded Streamlit ICO explorer and CSV collection offer.
- `purchase-success.html` — post-checkout download and order status.

## ICO CSV checkout and delivery

Checkout uses Stripe Checkout. After a successful payment the buyer can download the ZIP from the success page; a Stripe webhook sends the same archive to the checkout email using Resend. The ZIP is held in private Netlify Blobs, not in this public repository.

Production Netlify Functions require these environment variables:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `SITE_URL`
- `PRODUCT_BLOB_STORE`
- `PRODUCT_BLOB_KEY`
- `PRODUCT_RELEASE_DATE`

Set secret values only in Netlify's environment-variable settings; never put them in Git or chat. Configure the Stripe webhook at `/api/stripe-webhook` for `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Enable the payment methods supported by the Stripe account in its payment-method settings; methods shown at checkout depend on account configuration, buyer location and device.

The current release is the ZIP named `ico-data-protection-decisions-2026-11-24.zip` in the `rowcraft-products` Blob store. To replace it, generate and review the release with the `rowcraft-data` exporter, upload the new ZIP privately to Netlify Blobs, then update the matching product key and release date in Netlify. Do not commit the CSV or ZIP to this public repository.

Before accepting live payments, verify the release source terms and data-protection position, confirm the record count and release date, configure any applicable tax settings, and test checkout, download and email delivery with Stripe test mode.

The website uses Google Fonts, so the fonts require an internet connection; fallback fonts will be used if unavailable.
