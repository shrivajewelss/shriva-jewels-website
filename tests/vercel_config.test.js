import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

test("vercel.json exists, is valid JSON, and has correct SPA rewrites", () => {
  const path = join(process.cwd(), "vercel.json");
  assert.ok(existsSync(path), "vercel.json must exist in project root");

  const content = readFileSync(path, "utf-8");
  const config = JSON.parse(content);

  assert.equal(config.framework, "vite");
  assert.equal(config.outputDirectory, "dist");

  // Redirects
  assert.ok(Array.isArray(config.redirects), "redirects should be an array");
  const shopRedirect = config.redirects.find((r) => r.source === "/shop");
  assert.ok(shopRedirect, "Redirect for /shop must exist");
  assert.equal(shopRedirect.destination, "/products");

  // Rewrites
  assert.ok(Array.isArray(config.rewrites), "rewrites should be an array");
  const spaRewrite = config.rewrites.find((r) => r.source === "/(.*)" || r.source === "/:path*");
  assert.ok(spaRewrite, "SPA catch-all rewrite rule must exist");
  assert.equal(spaRewrite.destination, "/index.html");
});

