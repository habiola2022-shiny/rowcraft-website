# Rowcraft website — ICO dataset version 1

This is an editable static website draft. Open the folder in VS Code (or another IDE) and edit `index.html` and `demo.html` directly.

## Preview locally

The simplest option is to open `index.html` in your browser. For a local web server, run:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Pages

- `index.html` — Rowcraft homepage and ICO CSV collection offer.
- `demo.html` — embedded Streamlit ICO explorer and CSV collection offer.

## Current limitations — important

- The £4.99 price is displayed as proposed pricing. No payment provider, checkout or automated file delivery is connected. The buttons currently open an email enquiry so visitors are not led to believe they can pay online yet.
- The CSV download itself is not included in this website folder. Add it only after confirming the exact files, compilation date, source terms and the handling of any personal data.
- The approximate record count and source description should be checked against the actual release before launch.
- The ICO app is embedded from the existing Streamlit URL. It remains hosted separately.
- The website uses Google Fonts, so the fonts require an internet connection; fallback fonts will be used if unavailable.

## Before publishing

1. Test both pages on desktop and mobile.
2. Verify the ICO source terms and data protection position for the exact files being redistributed.
3. Confirm the release date and record count.
4. Implement and test payment plus secure download delivery before changing the enquiry links into purchase buttons.
5. Keep the current live Netlify site unchanged until this draft has been reviewed.
