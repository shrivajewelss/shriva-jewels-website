// Writes public/sitemap.xml and public/robots.txt from the catalogue. Runs automatically before `npm run build`.
import { writeFileSync } from "node:fs";
import { products } from "../src/data/products.js";
import { categories } from "../src/data/categories.js";

const site = (process.env.VITE_SITE_URL || "").replace(/\/$/, "");
if (!site) console.warn("VITE_SITE_URL is not set — sitemap URLs will be relative. Set it for production.");
const paths = ["/", "/products", ...categories.map((c) => `/category/${c.slug}`), ...products.map((p) => `/product/${p.id}`)];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${site}${p}</loc></url>`).join("\n")}\n</urlset>\n`;
writeFileSync("public/sitemap.xml", xml);
writeFileSync("public/robots.txt", `User-agent: *\nAllow: /\nDisallow: /cart\nDisallow: /booking-success/\nDisallow: /api/\n${site ? `\nSitemap: ${site}/sitemap.xml\n` : ""}`);
console.log(`sitemap.xml: ${paths.length} URLs`);
