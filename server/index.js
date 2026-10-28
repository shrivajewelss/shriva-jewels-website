import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { openDatabase } from "./database/db.js";
import { createProvider } from "./services/whatsapp.js";
import { createBookingService } from "./services/bookings.js";
import { bookingRoutes } from "./routes/bookings.js";

export function buildApp(cfg = config, log = console) {
  const db = openDatabase(cfg.databasePath);
  const provider = createProvider(cfg.whatsapp, log);
  const service = createBookingService(db, provider, log);
  const routes = bookingRoutes(service, cfg.rateLimit);
  const dist = resolve("dist");
  const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
    ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".txt": "text/plain", ".xml": "application/xml", ".ico": "image/x-icon", ".webp": "image/webp" };

  const send = (res, status, json) => {
    res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    res.end(JSON.stringify(json));
  };
  const readBody = (req) => new Promise((ok, fail) => {
    let size = 0; const chunks = [];
    req.on("data", (c) => { size += c.length; if (size > 32_768) { fail(Object.assign(new Error("too large"), { code: 413 })); } else chunks.push(c); });
    req.on("end", () => { try { ok(JSON.parse(Buffer.concat(chunks).toString() || "{}")); } catch { fail(Object.assign(new Error("bad json"), { code: 400 })); } });
    req.on("error", fail);
  });

  async function serveStatic(req, res, pathname) {
    let file = normalize(join(dist, pathname));
    if (!file.startsWith(dist)) { res.writeHead(403); return res.end(); }
    let ok = await stat(file).then((s) => s.isFile()).catch(() => false);
    const isAsset = extname(pathname) !== "";
    if (!ok && isAsset) { res.writeHead(404); return res.end("Not found"); }
    if (!ok) file = join(dist, "index.html"); // SPA fallback so direct URLs & refresh work
    try {
      const data = await readFile(file);
      const long = file.includes("/assets/") || file.includes("/images/");
      res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream",
        "Cache-Control": long ? "public, max-age=31536000, immutable" : "no-cache" });
      res.end(data);
    } catch { res.writeHead(404); res.end("Build the frontend first: npm run build"); }
  }

  const server = createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "DENY");
    const url = new URL(req.url, "http://x");
    const ip = (req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "").trim();
    try {
      if (url.pathname === "/api/health") return send(res, 200, { ok: true, whatsappProvider: provider.name });
      if (url.pathname === "/api/bookings" && req.method === "POST") {
        const r = await routes.create({ body: await readBody(req), ip });
        return send(res, r.status, r.json);
      }
      const m = url.pathname.match(/^\/api\/bookings\/([A-Z0-9-]{6,30})$/);
      if (m && req.method === "GET") {
        const r = routes.get({ ref: m[1], token: url.searchParams.get("token") });
        return send(res, r.status, r.json);
      }
      if (url.pathname.startsWith("/api/")) return send(res, 404, { error: "not_found" }); // no list endpoint exists
      if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405); return res.end(); }
      return serveStatic(req, res, decodeURIComponent(url.pathname));
    } catch (e) {
      if (e.code === 413 || e.code === 400) {
        res.setHeader("Connection", "close");
        res.on("finish", () => req.destroy()); // stop reading an oversized upload after answering
        return send(res, e.code, { error: "bad_request" });
      }
      log.error(e); send(res, 500, { error: "server_error" });
    }
  });

  const timer = setInterval(() => service.retryPending().catch((e) => log.error("[retry]", e)), 60_000);
  timer.unref();
  return { server, db, service, provider, close: () => { clearInterval(timer); server.closeAllConnections?.(); server.close(); db.close(); } };
}

const isMain = process.argv[1] && resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();
if (isMain) {
  const app = buildApp();
  app.server.listen(config.port, () => console.log(`Shriva server on :${config.port} (WhatsApp provider: ${app.provider.name})`));
}
