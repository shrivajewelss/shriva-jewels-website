# Shriva Jewels — React + Vite + Tailwind storefront with no-login WhatsApp booking

Browse → add to bag → send a booking request. No accounts, no online payment. Bookings are saved by a small Node API, which then notifies your business WhatsApp number through the official WhatsApp Business Cloud API.

> **Read `docs/REFERENCE_AUDIT.md` and the "QA report" below first** — they state exactly what was and was not verified (the visual design could not be measured against the live site, and the frontend has not yet been built with Vite).

## Requirements
Node **22.13+** (the server uses the built-in `node:sqlite`, `fetch` and `http`; it has **zero runtime dependencies**). Package manager: npm.

## Run locally
```bash
npm install
cp .env.example .env        # defaults work: WhatsApp runs in "mock" mode
npm run dev                 # Vite on :5173 (proxies /api) + API on :8787
```
Open http://localhost:5173. Other commands: `npm test` (server tests), `npm run build`, `npm start` (production: serves `dist/` + API on one port), `npm run lint:syntax` (needs `esbuild`; `ESBUILD=/path/to/esbuild`).

## Routes
`/` · `/products` (with `/shop` redirect) · `/category/:categorySlug` (earrings, necklaces, rings, bracelets, anklets) · `/product/:productId` (e.g. `1129685-p02`) · `/cart` (bag + booking form) · `/booking-success/:reference?t=<token>` · `*` → 404. `/cart` and `/booking-success` are `noindex` and disallowed in robots.txt. Direct URLs/refresh work in production because the server falls back to `index.html`.

API: `POST /api/bookings`, `GET /api/bookings/:ref?token=…` (token is returned only to the submitter), `GET /api/health`. There is deliberately **no list endpoint**.

## How booking works
1. Cart (`localStorage`, only `{id, quantity}`) → form (name, Indian mobile; optional delivery/collection, address, note).
2. `POST /api/bookings` sends **only product ids + quantities**. The server re-prices everything from `src/data/products.js`, validates/sanitises, saves, generates `SJ-YYMMDD-XXXX`, and returns **201 as soon as the row is saved**.
3. Notification is sent afterwards and tracked per booking: `pending → sending → sent | failed | mock`. A failed WhatsApp call never loses or fails the booking; failures are retried every minute (max 5 attempts) with an atomic claim so a booking can't be notified twice.
4. Double-submit protection: button disabled + synchronous guard + per-request idempotency key (same key ⇒ same booking). The cart is cleared only after the server confirms the save.
5. The bag also offers an optional **customer-initiated** `wa.me` button (needs `VITE_WHATSAPP_NUMBER`). It is separate from the automatic business notification.

## Configure WhatsApp (real notifications — **pending your credentials**)
Not verified against Meta's live API (no credentials were available). Steps:
1. Create a Meta Business account and complete business verification; add the **WhatsApp** product in a Meta developer app.
2. Register a **sender** phone number in WhatsApp Manager (it becomes a Cloud API number — it can't be used in the regular WhatsApp app at the same time). The **receiving** number (`WHATSAPP_BUSINESS_NUMBER`) should be a different WhatsApp number you actually read.
3. Create a permanent **system-user access token** with `whatsapp_business_messaging` permission.
4. Business-initiated messages need an **approved template**. Create a *Utility* template, e.g. name `shriva_new_booking`, language `en`, body with 7 variables:
   `New Shriva Jewels booking {{1}}. Customer: {{2}} ({{3}}). Items: {{4}}. Subtotal: {{5}}. Delivery: {{6}}. Note: {{7}}. Status: awaiting availability confirmation.`
   (Variables are filled in that order by `templateParams()` in `server/services/whatsapp.js`; they must be single-line.)
5. Set `.env`: `WHATSAPP_PROVIDER=cloud`, `WHATSAPP_BUSINESS_NUMBER`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_BOOKING_TEMPLATE_NAME=shriva_new_booking`. Without a template name the server sends your full multi-line message as free text, which WhatsApp only delivers inside a 24-hour window after the recipient last messaged the sender.
6. Submit a test booking and check `notification_status` (`sent` = accepted by WhatsApp; `failed` rows hold the API error in `notification_error`). Costs: Meta bills per template message — check current India pricing in WhatsApp Manager.

Until then `WHATSAPP_PROVIDER=mock` logs the formatted message and records `mock` (never `sent`). If `cloud` is selected with missing credentials the server logs a warning and falls back to mock.

Message format sent as free text matches your brief (`NEW SHRIVA JEWELS BOOKING`, reference, IST date, customer, items with code/qty/unit/line total, subtotal, delivery preference, note, status).

## Database
SQLite file at `DATABASE_PATH` (default `./data/shriva.db`, git-ignored), created automatically. Choose SQLite because it needs no extra service; **it needs a persistent disk/volume** (not serverless). To use PostgreSQL instead, replace `server/database/db.js` and the prepared statements in `server/services/bookings.js` — the rest is storage-agnostic. View bookings: `sqlite3 data/shriva.db "select reference,customer_name,subtotal,notification_status from bookings order by id desc"`.

## Deploy
Any Node host with a persistent disk (a small VPS, Render, Railway, Fly.io):
```bash
npm ci && VITE_SITE_URL=https://your-domain npm run build   # also writes sitemap.xml + robots.txt
npm start                                                    # one process: static site + /api
```
Set the env vars from `.env.example` on the host (secrets only there, never `VITE_*`), mount a volume at `DATABASE_PATH`, terminate HTTPS at the platform/proxy. Static-only hosts (Netlify/Vercel static) can't run the API.

## Add or update products
Edit `src/data/products.js` (one line per piece: `id`, `code`, `name`, `price`, `category`, `image`) and drop the image into `public/images/products/`. `id` must be unique (`<code>-p<NN>`; codes may repeat). The server reads the same file — restart it after changes. Update `FEATURED` in `components/FeaturedSection.jsx` for homepage picks. The "63 pieces" counts are computed automatically.

## Environment variables
See `.env.example` (documented). Public: `VITE_SITE_URL`, `VITE_INSTAGRAM_URL`, `VITE_WHATSAPP_NUMBER`. Secret/server: `PORT`, `DATABASE_PATH`, `BOOKING_RATE_LIMIT`, `WHATSAPP_*`.

## Brand assets
`public/brand/shriva-logo.png` and `shriva-logo-light.png` are transparent versions derived from your supplied logo JPEG (ink colour extracted from the original; alpha from the paper-to-ink contrast). Product images are extracted from your catalogue PDF (resized to ≤900px wide JPEG; 63 files ≈ 6.7 MB).

## QA report (actual results, nothing fabricated)
**Run and passed**
* `npm test` — 8/8 server tests: catalogue integrity (63 unique ids); Indian mobile normalisation; booking persisted with **server-recomputed totals** (client-sent prices ignored); validation (bad phone, missing name, empty bag, unknown product, qty 0/-3/1.5, delivery without address); duplicate/concurrent submit ⇒ 1 row, 1 WhatsApp call; WhatsApp 401 ⇒ booking still saved, status `failed`, error stored, later retry ⇒ `sent`, exactly one send; token-gated retrieval and no list endpoint; rate limit (429) and 413 on oversized body.
* All 20+ source files parse (esbuild); the app bundles with every local import/export resolving.
* Server-side-render smoke test of 9 routes with stand-ins for `react-router-dom`/`lucide-react` (React 19.2): `/` (8 featured cards), `/products` (63), `/category/earrings` (16), `/product/1129685-p02`, `/cart` (restored from storage, invalid stored id dropped), booking-success, plus unknown category/product/route ⇒ 404. No React warnings after fixing two attribute issues the test found.

**NOT done — I could not do these here (no network, so no `npm install`, no browser)**
* `npm install` / `vite build` of the frontend, Tailwind class compilation — **not run**; expect to fix small issues on first build.
* Any browser testing, screenshots, side-by-side/visual comparison at 1440/1280/768/390/320, mobile menu behaviour, keyboard/screen-reader and contrast audit, Lighthouse.
* The 20-step end-to-end browser scenario (steps involving the UI: navigation, add/remove, refresh persistence, mobile booking). The server half of steps 10–18 is covered by the API tests above.
* Real WhatsApp delivery (no credentials). The Cloud API request shape is implemented from Meta's documented format but is **untested against Meta**.
* Pixel-fidelity: see the audit — fonts/colours/spacing are approximations.

## Known differences / open items
Design tokens and fonts approximated · category-card images use catalogue photos (reference's choice unverified) · bag page and success page are built from the brief (reference `/cart` couldn't be inspected) · duplicate codes & price outliers in the catalogue need your confirmation · Instagram tiles are catalogue photos linking to the profile (as on the reference) · external things still needed: WhatsApp Business verification + sender number + template + token, a host with persistent storage, a domain.
# shriva-jewels-website
# shriva-jewels-website
