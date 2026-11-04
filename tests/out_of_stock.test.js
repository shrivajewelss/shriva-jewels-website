import test from "node:test";
import assert from "node:assert/strict";
import { products, productsById } from "../src/data/products.js";
import { validateBooking } from "../server/validation/booking.js";

test("all products have a valid boolean inStock property", () => {
  assert.equal(products.length, 88);
  for (const product of products) {
    assert.equal(typeof product.inStock, "boolean", `Product ${product.id} must have boolean inStock`);
  }
});

test("designated out of stock items have inStock === false", () => {
  const oosSample = ["p68", "p79", "p83", "p85", "1154807-p18", "1183816-p56"];
  for (const id of oosSample) {
    const product = productsById[id];
    assert.ok(product, `Product ${id} should exist`);
    assert.equal(product.inStock, false, `Product ${id} should be out of stock`);
  }
});

test("majority of catalogue remains in stock", () => {
  const inStockCount = products.filter((p) => p.inStock === true).length;
  const outOfStockCount = products.filter((p) => p.inStock === false).length;
  assert.ok(inStockCount > 80, "Most products must be available");
  assert.ok(outOfStockCount > 0, "Some products must be marked out of stock");
});

test("server validation rejects booking containing out of stock products", () => {
  const payloadWithOOS = {
    name: "Meera Dholu",
    mobile: "9898384604",
    idempotencyKey: "test-oos-key-12345",
    items: [
      { id: "1129685-p02", quantity: 1 }, // in stock
      { id: "p68", quantity: 1 },        // out of stock
    ],
  };

  const result = validateBooking(payloadWithOOS);
  assert.equal(result.ok, false);
  assert.ok(result.errors.items, "Should return items error for out of stock product");
});

test("server validation accepts booking when all items are in stock", () => {
  const payloadValid = {
    name: "Meera Dholu",
    mobile: "9898384604",
    idempotencyKey: "test-valid-key-12345",
    items: [
      { id: "1129685-p02", quantity: 1 }, // in stock
      { id: "p65", quantity: 1 },        // in stock
    ],
  };

  const result = validateBooking(payloadValid);
  assert.equal(result.ok, true);
  assert.equal(result.value.items.length, 2);
});

