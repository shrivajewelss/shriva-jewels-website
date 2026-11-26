// Writes public/sitemap.xml and public/robots.txt from live Supabase catalogue. Runs automatically before `npm run build`.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

function loadEnvFile() {
  if (!existsSync(".env")) return {};
  const out = {};
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq > 0) {
      out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
  }
  return out;
}

const envFile = loadEnvFile();
const DEFAULT_SITE = "https://www.shriva.store";
const site = (process.env.VITE_SITE_URL || envFile.VITE_SITE_URL || DEFAULT_SITE).trim().replace(/\/+$/, "");
const supabaseUrl = (process.env.VITE_SUPABASE_URL || envFile.VITE_SUPABASE_URL || "").trim().replace(/\/+$/, "");
const supabaseKey = (process.env.VITE_SUPABASE_ANON_KEY || envFile.VITE_SUPABASE_ANON_KEY || "").trim();

async function fetchSupabaseList(path) {
  if (!supabaseUrl || !supabaseKey) return [];
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const [categories, products] = await Promise.all([
  fetchSupabaseList("categories?select=slug&is_active=eq.true&order=sort_order.asc"),
  fetchSupabaseList("products?select=id,slug&status=eq.active&order=created_at.desc"),
]);

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
    path: `/product/${p.slug || p.id}`,
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
