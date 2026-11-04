import test from "node:test";
import assert from "node:assert/strict";
import {
  GA_MEASUREMENT_ID,
  initGA,
  trackEvent,
  trackPageView,
  trackViewItem,
  trackAddToCart,
  trackRemoveFromCart,
  trackBeginCheckout,
  trackBookingRequest,
} from "../src/utils/analytics.js";

test("analytics functions do not throw in node / headless environment without window", () => {
  assert.doesNotThrow(() => initGA());
  assert.doesNotThrow(() => trackEvent("test_event", { foo: "bar" }));
  assert.doesNotThrow(() => trackPageView("/products", "Shop All"));
  assert.doesNotThrow(() => trackViewItem({ id: "p01", name: "Ring", price: 500, category: "rings" }));
  assert.doesNotThrow(() => trackAddToCart({ id: "p01", name: "Ring", price: 500, category: "rings" }, 2));
  assert.doesNotThrow(() => trackRemoveFromCart({ id: "p01", name: "Ring", price: 500, category: "rings" }, 1));
  assert.doesNotThrow(() => trackBeginCheckout([{ product: { id: "p01", price: 500 }, quantity: 1 }], 500));
  assert.doesNotThrow(() =>
    trackBookingRequest({
      method: "whatsapp_form",
      customer: { name: "Priya", city: "Surat" },
      lines: [{ product: { id: "p01", price: 500 }, quantity: 1 }],
      subtotal: 500,
    })
  );
});

test("trackEvent safely handles missing gtag", () => {
  assert.equal(typeof trackEvent, "function");
  assert.equal(typeof trackPageView, "function");
  assert.equal(typeof trackViewItem, "function");
  assert.equal(typeof trackAddToCart, "function");
  assert.equal(typeof trackRemoveFromCart, "function");
  assert.equal(typeof trackBeginCheckout, "function");
  assert.equal(typeof trackBookingRequest, "function");
});
