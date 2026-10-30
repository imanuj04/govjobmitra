# GovJobMitra – SEO + bilingual news ticker update

This folder is the complete static site plus a Cloudflare Pages Function.

## What's included
- Existing homepage and information pages (About, Privacy, Disclaimer, Contact)
- SEO metadata, canonical URLs, social preview metadata, WebSite schema
- `robots.txt` and `sitemap.xml`
- Hidden ad placement markers only; no AdSense script is loaded and no ads are shown
- Hindi and English scrolling headline ticker
- `functions/api/news.js` fetches RSS headlines server-side, deduplicates them and caches the response for 5 minutes

## Deploy to the existing Cloudflare Pages project
1. Extract this ZIP on your computer.
2. Open the GitHub repository connected to Cloudflare Pages.
3. Upload/replace the **contents of this folder** in the repository root. Do not upload the outer ZIP or create an extra nested `govjobmitra_update` folder.
4. Make sure the `functions` folder is included at the repository root, alongside `index.html` and `assets`.
5. Commit the changes to the `main` branch. Cloudflare Pages should build and deploy automatically.
6. When deployment completes, open `https://govjobmitra.pages.dev` and check both ticker rows.

## News ticker details
- The ticker displays headlines, publisher names and links to the original publisher. It does not copy full articles.
- Hindi and English feeds are displayed in separate scrolling rows. Hovering pauses the ticker; reduced-motion settings disable automatic movement.
- The API endpoint is `/api/news` and is implemented by the Pages Function in `functions/api/news.js`.
- RSS providers can change their feeds, block requests or change their terms. If a source stops working, its headlines will simply be absent until the feed is fixed.
- Before monetizing or using any publisher's feed commercially, check that publisher's current RSS/website terms and obtain permission where required. Attribution and a link do not automatically grant commercial republication rights.
- This is a headlines-only feed, not a verification service. Editorially verify important claims before creating GovJobMitra articles.

## Important
- The news ticker requires Cloudflare Pages Functions. Keep the `functions` directory at the repository root; do not move it inside `assets`.
- If your current Pages project is configured with a static-only deployment that does not deploy Functions, the `/api/news` endpoint will return 404. In that case, check the Pages Functions deployment logs before changing anything else.
- No live article CMS, admin dashboard, automated article generation or AdSense integration is included yet.
