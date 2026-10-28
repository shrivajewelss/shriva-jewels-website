import test from "node:test";
import assert from "node:assert/strict";
import { buildApp } from "../server/index.js";
import { normalizeIndianMobile } from "../server/validation/booking.js";
import { products } from "../src/data/products.js";

const silent = { info() {}, warn() {}, error() {} };
const cfg = (wa = {}, rl = 50) => ({
  port: 0, databasePath: ":memory:", rateLimit: { windowMs: 3600e3, max: rl },
  whatsapp: { provider: "mock", businessNumber: "919999999999", accessToken: "", phoneNumberId: "", templateName: "", templateLang: "en", apiVersion: "v21.0", ...wa },
});
async function start(c) {
  const app = buildApp(c, silent);
  await new Promise((r) => app.server.listen(0, r));
  const base = `http://127.0.0.1:${app.server.address().port}`;
  return { app, base, post: (b) => fetch(base + "/api/bookings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) }) };
}
const valid = (o = {}) => ({ name: "Asha Patel", mobile: "98765 43210", idempotencyKey: "key-" + Math.random().toString(36).slice(2, 12),
  items: [{ id: "1129685-p02", quantity: 2 }, { id: "1198987-p36", quantity: 1 }], ...o });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test("catalogue integrity: 63 unique ids, positive integer prices", () => {
  assert.equal(products.length, 63);
  assert.equal(new Set(products.map((p) => p.id)).size, 63);
  assert.ok(products.every((p) => Number.isInteger(p.price) && p.price > 0));
});

test("Indian mobile normalisation", () => {
  assert.equal(normalizeIndianMobile("+91 98765-43210"), "9876543210");
  assert.equal(normalizeIndianMobile("09876543210"), "9876543210");
  for (const bad of ["12345", "5876543210", "98765432101", "abcdefghij", ""]) assert.equal(normalizeIndianMobile(bad), null);
});

test("booking persisted; totals come from server catalogue, not client", async () => {
  const { app, post, base } = await start(cfg());
  const res = await post(valid({ items: [{ id: "1129685-p02", quantity: 2, price: 1, unitPrice: 1 }, { id: "1198987-p36", quantity: 1 }], subtotal: 1 }));
  assert.equal(res.status, 201);
  const { booking } = await res.json();
  assert.match(booking.reference, /^SJ-\d{6}-[A-Z0-9]{4}$/);
  assert.equal(booking.subtotal, 320 * 2 + 99);
  assert.equal(booking.items[0].unitPrice, 320);
  const row = app.db.prepare("SELECT * FROM bookings WHERE reference=?").get(booking.reference);
  assert.equal(row.customer_mobile, "9876543210");
  await wait(50);
  const r2 = await (await fetch(`${base}/api/bookings/${booking.reference}?token=${booking.accessToken}`)).json();
  assert.equal(r2.booking.notification.status, "mock"); // mock is never reported as "sent"
  app.close();
});

test("validation: bad phone, missing name, empty/invalid items, unknown product, qty bounds", async () => {
  const { app, post } = await start(cfg());
  let r = await post(valid({ mobile: "12345" })); assert.equal(r.status, 400); assert.ok((await r.json()).errors.mobile);
  r = await post(valid({ name: "" })); assert.ok((await r.json()).errors.name);
  r = await post(valid({ items: [] })); assert.ok((await r.json()).errors.items);
  r = await post(valid({ items: [{ id: "nope", quantity: 1 }] })); assert.ok((await r.json()).errors.items);
  r = await post(valid({ items: [{ id: "1129685-p02", quantity: 0 }] })); assert.equal(r.status, 400);
  r = await post(valid({ items: [{ id: "1129685-p02", quantity: -3 }] })); assert.equal(r.status, 400);
  r = await post(valid({ items: [{ id: "1129685-p02", quantity: 1.5 }] })); assert.equal(r.status, 400);
  r = await post(valid({ deliveryPreference: "delivery" })); assert.ok((await r.json()).errors.address);
  assert.equal(app.db.prepare("SELECT COUNT(*) c FROM bookings").get().c, 0);
  app.close();
});

test("duplicate submission (same idempotency key) returns same booking, one row, one notification", async () => {
  let calls = 0;
  const orig = globalThis.fetch;
  const { app, post, base } = await start(cfg({ provider: "cloud", accessToken: "t", phoneNumberId: "1", templateName: "shriva_booking" }));
  const body = valid();
  globalThis.fetch = async (u, o) => { if (String(u).includes("graph.facebook.com")) { calls++; return new Response(JSON.stringify({ messages: [{ id: "wamid.X" }] }), { status: 200 }); } return orig(u, o); };
  const [a, b] = await Promise.all([post(body), post(body)]);
  const ja = await a.json(), jb = await b.json();
  assert.equal(ja.booking.reference, jb.booking.reference);
  assert.equal(app.db.prepare("SELECT COUNT(*) c FROM bookings").get().c, 1);
  await wait(100);
  assert.equal(calls, 1);
  const g = await (await fetch(`${base}/api/bookings/${ja.booking.reference}?token=${ja.booking.accessToken}`)).json();
  assert.equal(g.booking.notification.status, "sent");
  globalThis.fetch = orig; app.close();
});

test("WhatsApp failure: booking stays saved, status=failed, later retry succeeds, no duplicate", async () => {
  const orig = globalThis.fetch; let mode = "fail", sends = 0, lastBody;
  const { app, post, base } = await start(cfg({ provider: "cloud", accessToken: "t", phoneNumberId: "1" }));
  globalThis.fetch = async (u, o) => {
    if (!String(u).includes("graph.facebook.com")) return orig(u, o);
    lastBody = JSON.parse(o.body);
    if (mode === "fail") return new Response(JSON.stringify({ error: { message: "token expired" } }), { status: 401 });
    sends++; return new Response(JSON.stringify({ messages: [{ id: "wamid.OK" }] }), { status: 200 });
  };
  const res = await post(valid()); assert.equal(res.status, 201); // success despite WhatsApp failing
  const { booking } = await res.json(); await wait(100);
  const row = () => app.db.prepare("SELECT * FROM bookings WHERE reference=?").get(booking.reference);
  assert.equal(row().notification_status, "failed"); assert.match(row().notification_error, /token expired/);
  assert.equal(lastBody.type, "text"); assert.match(lastBody.text.body, /NEW SHRIVA JEWELS BOOKING/); assert.match(lastBody.text.body, /Subtotal: ₹739/);
  mode = "ok"; await app.service.retryPending(0); await app.service.retryPending(0);
  assert.equal(row().notification_status, "sent"); assert.equal(sends, 1);
  globalThis.fetch = orig; app.close();
});

test("booking access requires token; no list endpoint; reference alone reveals nothing", async () => {
  const { app, post, base } = await start(cfg());
  const { booking } = await (await post(valid())).json();
  assert.equal((await fetch(`${base}/api/bookings/${booking.reference}`)).status, 404);
  assert.equal((await fetch(`${base}/api/bookings/${booking.reference}?token=WRONG`)).status, 404);
  assert.equal((await fetch(`${base}/api/bookings/${booking.reference}?token=${booking.accessToken}`)).status, 200);
  assert.equal((await fetch(`${base}/api/bookings`)).status, 404);
  app.close();
});

test("rate limiting and oversized body", async () => {
  const { app, post, base } = await start(cfg({}, 2));
  assert.equal((await post(valid())).status, 201); assert.equal((await post(valid())).status, 201);
  assert.equal((await post(valid())).status, 429);
  const big = await fetch(base + "/api/bookings", { method: "POST", body: JSON.stringify({ note: "x".repeat(40000) }) });
  assert.equal(big.status, 413);
  app.close();
});
