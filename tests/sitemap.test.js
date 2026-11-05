import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

test("sitemap.xml exists, is valid xml, and references https://www.shriva.store", () => {
  assert.ok(existsSync("public/sitemap.xml"));
  const content = readFileSync("public/sitemap.xml", "utf8");

  assert.ok(content.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(content.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
  assert.ok(content.includes("<loc>https://www.shriva.store/</loc>"));
  assert.ok(content.includes("<loc>https://www.shriva.store/products</loc>"));
  assert.ok(content.includes("<loc>https://www.shriva.store/about</loc>"));
  assert.ok(content.includes("<loc>https://www.shriva.store/category/earrings</loc>"));
  assert.ok(content.includes("<loc>https://www.shriva.store/product/p65</loc>"));

  // No relative or empty loc tags
  assert.ok(!content.includes("<loc>/</loc>"));
  assert.ok(!content.includes("<loc>/products</loc>"));
});

test("robots.txt references https://www.shriva.store/sitemap.xml", () => {
  assert.ok(existsSync("public/robots.txt"));
  const content = readFileSync("public/robots.txt", "utf8");
  assert.ok(content.includes("Sitemap: https://www.shriva.store/sitemap.xml"));
});

