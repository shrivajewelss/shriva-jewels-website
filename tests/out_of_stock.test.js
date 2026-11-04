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

test("server validation accepts booking when all items are in stock", () => {
  const payloadValid = {
    name: "Meera Dholu",
    mobile: "9898384604",
    idempotencyKey: "test-valid-key-12345",
    items: [
      { id: "1129685-p02", quantity: 1 },
      { id: "p65", quantity: 1 },
    ],
  };

  const result = validateBooking(payloadValid);
  assert.equal(result.ok, true);
  assert.equal(result.value.items.length, 2);
});

test("server validation rejects booking containing out of stock products", () => {
  // Temporarily toggle a product to out of stock to test validation guard
  const target = productsById["p68"];
  const original = target.inStock;
  target.inStock = false;

  try {
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
  } finally {
    target.inStock = original;
  }
});
