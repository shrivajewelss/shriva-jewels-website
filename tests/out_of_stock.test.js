import test from "node:test";
import assert from "node:assert/strict";
import { validateBooking } from "../server/validation/booking.js";

const productsById = {
  "crystal-bezel-tennis-bracelet": { id: "crystal-bezel-tennis-bracelet", code: "p65", name: "Crystal Bezel Tennis Bracelet", price: 450, inStock: true },
  "triple-layer-chain-crystal-bangle": { id: "triple-layer-chain-crystal-bangle", code: "p66", name: "Triple Layer Chain & Crystal Bangle", price: 380, inStock: true },
};
const products = Object.values(productsById);

test("all products have a valid boolean inStock property", () => {
  assert.ok(products.length > 0);
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
      { id: "crystal-bezel-tennis-bracelet", quantity: 1 },
      { id: "triple-layer-chain-crystal-bangle", quantity: 1 },
    ],
  };

  const result = validateBooking(payloadValid, productsById);
  assert.equal(result.ok, true);
  assert.equal(result.value.items.length, 2);
});

test("server validation rejects booking containing out of stock products", () => {
  // Temporarily toggle a product to out of stock to test validation guard
  const target = productsById["triple-layer-chain-crystal-bangle"];
  const original = target.inStock;
  target.inStock = false;

  try {
    const payloadWithOOS = {
      name: "Meera Dholu",
      mobile: "9898384604",
      idempotencyKey: "test-oos-key-12345",
      items: [
        { id: "crystal-bezel-tennis-bracelet", quantity: 1 }, // in stock
        { id: "triple-layer-chain-crystal-bangle", quantity: 1 }, // out of stock
      ],
    };

    const result = validateBooking(payloadWithOOS, productsById);
    assert.equal(result.ok, false);
    assert.ok(result.errors.items, "Should return items error for out of stock product");
  } finally {
    target.inStock = original;
  }
});
