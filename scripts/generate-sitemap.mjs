// Writes public/sitemap.xml and public/robots.txt from the catalogue. Runs automatically before `npm run build`.
import { writeFileSync } from "node:fs";
import { products } from "../src/data/products.js";
import { categories } from "../src/data/categories.js";

const DEFAULT_SITE = "https://www.shriva.store";
const site = (process.env.VITE_SITE_URL || DEFAULT_SITE).trim().replace(/\/+$/, "");

const today = new Date().toISOString().split("T")[0];

const routes = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/products", changefreq: "daily", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  ...categories.map((c) => ({
    path: `/category/${c.slug}`,
    changefreq: "weekly",
    priority: "0.8",
  })),
  ...products.map((p) => ({
    path: `/product/${p.id}`,
    changefreq: "weekly",
    priority: "0.7",
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${site}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

writeFileSync("public/sitemap.xml", xml);
writeFileSync(
  "public/robots.txt",
  `User-agent: *\nAllow: /\nDisallow: /cart\nDisallow: /booking-success/\nDisallow: /api/\n\nSitemap: ${site}/sitemap.xml\n`
);

console.log(`sitemap.xml: ${routes.length} URLs generated for ${site}`);
