# Reference audit — https://shriva-jewels.lovable.app/

**Method and limits.** This audit was done by fetching the live pages' rendered text, metadata, links and image URLs. **No browser, screenshot, computed-style or DOM-measurement tool was available**, so everything visual (exact colours, fonts, sizes, spacing, breakpoints, hover/animation behaviour, header scroll behaviour, the cart page's interactive layout) is **UNVERIFIED** and is listed as such below. Nothing here was invented: where something could not be inspected it is marked.

## Routes (all discovered through the site's own navigation and links)
| Route | Verified | Notes |
|---|---|---|
| `/` | content ✔ | Sections in order: announcement bar → header → hero → Shop by category → Featured Jewellery (8) → Our story → Why Shriva Jewels → Instagram → footer |
| `/shop` | content ✔ | "Shop All", category pills (All + 5), search "Search by name or code", "63 pieces", Sort (Catalogue order / Price: low to high / Price: high to low), 63 cards |
| `/category/{earrings,necklaces,rings,bracelets,anklets}` | earrings ✔ (16 pieces); others derived | Same layout as /shop. Counts: earrings 16, necklaces 17, rings 17, bracelets 11, anklets 2 = 63 |
| `/product/{code}-p{NN}` | one page ✔ | Breadcrumb (category link), image, category label, name, "PRODUCT CODE · {code}", ₹ price, quantity (default 1), Add to Cart, "View bag" link, booking note, "You may also like" = next 4 pieces of same category |
| `/cart` | **unverified** | Served as a client-rendered shell ("Loading your bag…"). Layout, empty state and booking behaviour could not be seen. Built from the brief. |
| `/booking-success/:ref` | n/a | Does not exist on the reference; added per the brief. |
| unknown routes | unverified | Custom 404 built. |

## Exact strings preserved
Announcement "Book your favourites on WhatsApp · No sign-up needed"; "The Shriva Collection"; hero "Jewellery That *Speaks* Your Style" (the word *Speaks* is emphasised in the live markup); hero description; buttons "Explore Collection" (→ `#collections`) and "Shop Now" (→ `/shop`); "Shop by category" / "Find Your Piece"; the five category names + descriptions; "Handpicked" / "Featured Jewellery" / "View all 63 pieces"; "Our story" / "Made to make you feel special" + paragraph + CTA "Discover the collection"; "Why Shriva Jewels" / "Simple, personal shopping" + four benefits; "Follow along" / "@shriva._jewels" / "Follow on Instagram"; footer blurb "Jewellery that speaks your style. Browse, add to your bag and send us a booking request on WhatsApp.", Shop + Contact lists, "© 2026 Shriva Jewels".

## Page titles / meta (verified)
Home "Shriva Jewels — Jewellery That Speaks Your Style" · Shop "Shop All Jewellery — Shriva Jewels" · Category "Earrings — Shriva Jewels" · Product "Gemstone Hand Chain (1129685) — Shriva Jewels" · Cart "Your Bag — Shriva Jewels". Descriptions and OG tags copied where visible.

## Navigation map
Header: logo→/, Home, Shop All, Earrings, Necklaces, Rings, Bracelets, Anklets, cart icon→/cart. Footer Shop: Shop All + 5 categories. Footer Contact: @shriva._jewels (Instagram, new tab), Your bag. Instagram tiles (p04, p22, p42, p09, p32, p56) all link to the profile.

## Unverified / not inspectable
Colour palette · font families, weights, sizes, letter-spacing · container widths and section spacing · hero image composition proportions · category-card image choice and overlay style · button/card dimensions and radius · hover, focus and transition behaviour · whether the header is sticky · mobile menu behaviour and breakpoints · cart badge appearance · benefit icons (Lucide icons chosen by me) · /cart page · form validation and success states · screenshots at 1440/1280/768/390/320.

## What I chose where the reference could not be measured
Design tokens in `src/styles/index.css` are derived from the supplied logo (maroon `#62190D`, warm cream/sand). Fonts: Cormorant Garamond (display) + Jost (body) as a close-guess pairing. **These are approximations, not measurements.** To close the gap, open DevTools on the live site, read computed styles, and update the CSS variables / `tailwind.config.js` — the whole site follows from those tokens.

## Catalogue data audit (supplied PDF vs live site)
* The PDF has 64 pages: a cover + 63 products, each with only **price and code** (no names, no categories). Names and category membership come from the live site (matched 1:1 by page number: live image `pNN.jpg` = PDF page NN). Images were extracted from the PDF itself and visually checked against the live product order.
* ⚠ **Duplicate codes in the catalogue** (also duplicated on the live site): `1154807` (p04 anklet ₹280 and p18 ear climber ₹280), `1183807` (p29 hoops ₹180, p49 ring ₹119, p64 ring ₹180), `1183812` (p52 ₹299 and p53 ₹339). These look like typos. I kept them as supplied and use `id = code-pNN` as the unique key, so the cart/booking are unaffected. **Please confirm the correct codes** and fix them in `src/data/products.js`.
* ⚠ Price outliers to double-check: p36 Leaf Drop Pendant ₹99, p49 Ruby Halo Ring ₹119.
* The "Edit with Lovable" badge on the live site is not part of the brand and is intentionally omitted.
