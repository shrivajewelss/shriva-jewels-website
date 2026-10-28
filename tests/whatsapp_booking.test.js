import test from "node:test";
import assert from "node:assert/strict";
import {
  BUSINESS_WHATSAPP_NUMBER,
  generateBookingMessage,
  buildWhatsAppUrl,
  copyToClipboard,
} from "../src/utils/booking.js";
import {
  normalizeIndianMobile,
  validateEmail,
  validateForm,
} from "../src/utils/validation.js";
import { products } from "../src/data/products.js";

test("Business WhatsApp number and destination URL", () => {
  assert.equal(BUSINESS_WHATSAPP_NUMBER, "919898384604");

  const sampleMsg = "Hello World";
  const url = buildWhatsAppUrl(sampleMsg);
  assert.equal(url, "https://wa.me/919898384604?text=Hello%20World");
  assert.ok(url.startsWith("https://wa.me/919898384604"));
});

test("Validation: required fields (name, mobile, email)", () => {
  // Missing all fields
  let errors = validateForm({});
  assert.ok(errors.name, "Name error should be present");
  assert.ok(errors.mobile, "Mobile error should be present");
  assert.ok(errors.email, "Email error should be present");

  // Invalid name
  errors = validateForm({ name: "A", mobile: "9898384604", email: "test@example.com" });
  assert.ok(errors.name);

  // Invalid mobile
  for (const badMobile of ["12345", "5898384604", "98983846041", "abcdefghij"]) {
    errors = validateForm({ name: "Priya Sharma", mobile: badMobile, email: "test@example.com" });
    assert.ok(errors.mobile, `Mobile "${badMobile}" should fail validation`);
  }

  // Valid mobile variations
  for (const goodMobile of ["9898384604", "+91 98983 84604", "09898384604", "+91-9898384604"]) {
    errors = validateForm({ name: "Priya Sharma", mobile: goodMobile, email: "test@example.com" });
    assert.equal(errors.mobile, undefined, `Mobile "${goodMobile}" should pass validation`);
  }

  // Invalid email
  for (const badEmail of ["not-an-email", "test@", "@example.com", "test@domain", "test space@domain.com"]) {
    errors = validateForm({ name: "Priya Sharma", mobile: "9898384604", email: badEmail });
    assert.ok(errors.email, `Email "${badEmail}" should fail validation`);
  }

  // Valid email
  errors = validateForm({ name: "Priya Sharma", mobile: "9898384604", email: "priya.sharma@example.com" });
  assert.deepEqual(errors, {});
});

test("Validation: optional PIN code", () => {
  // Empty is valid (optional)
  let errors = validateForm({ name: "Priya", mobile: "9898384604", email: "p@example.com", pincode: "" });
  assert.equal(errors.pincode, undefined);

  // Invalid PIN code (5 digits or letters)
  errors = validateForm({ name: "Priya", mobile: "9898384604", email: "p@example.com", pincode: "39500" });
  assert.ok(errors.pincode);

  errors = validateForm({ name: "Priya", mobile: "9898384604", email: "p@example.com", pincode: "39500A" });
  assert.ok(errors.pincode);

  // Valid 6-digit PIN code
  errors = validateForm({ name: "Priya", mobile: "9898384604", email: "p@example.com", pincode: "395007" });
  assert.equal(errors.pincode, undefined);
});

test("Generate booking message with multiple products and quantities", () => {
  const p1 = products[0]; // Gemstone Hand Chain, code 1129685, price 320
  const p2 = products[1]; // Floral Hand Chain, code 1159780, price 320
  const p3 = products[2]; // Flower Charm Anklet, code 1154807, price 280

  const lines = [
    { product: p1, quantity: 2 },
    { product: p2, quantity: 1 },
    { product: p3, quantity: 3 },
  ];

  const customer = {
    name: "Aarav Patel",
    mobile: "+91 98983 84604",
    email: "aarav@example.com",
    address: "B-404, Shivalik Residency, Adajan",
    city: "Surat",
    state: "Gujarat",
    pincode: "395009",
    message: "Please deliver before Friday.",
  };

  const message = generateBookingMessage({ customer, lines });

  // 1. Header
  assert.ok(message.includes("*SHRIVA JEWELS — NEW BOOKING REQUEST*"));

  // 2. Customer Details
  assert.ok(message.includes("*Customer Details*"));
  assert.ok(message.includes("• Name: Aarav Patel"));
  assert.ok(message.includes("• Mobile: 9898384604"));
  assert.ok(message.includes("• Email: aarav@example.com"));
  assert.ok(message.includes("• Address: B-404, Shivalik Residency, Adajan"));
  assert.ok(message.includes("• City: Surat"));
  assert.ok(message.includes("• State: Gujarat"));
  assert.ok(message.includes("• PIN Code: 395009"));
  assert.ok(message.includes("• Additional Message: Please deliver before Friday."));

  // 3. Products
  assert.ok(message.includes("*Requested Products*"));
  // Product 1
  assert.ok(message.includes(p1.name));
  assert.ok(message.includes(`Product Code: ${p1.code}`));
  assert.ok(message.includes("Quantity: 2"));
  assert.ok(message.includes("Unit Price: ₹320"));
  assert.ok(message.includes("Line Subtotal: ₹640"));

  // Product 2
  assert.ok(message.includes(p2.name));
  assert.ok(message.includes(`Product Code: ${p2.code}`));
  assert.ok(message.includes("Quantity: 1"));
  assert.ok(message.includes("Unit Price: ₹320"));
  assert.ok(message.includes("Line Subtotal: ₹320"));

  // Product 3
  assert.ok(message.includes(p3.name));
  assert.ok(message.includes(`Product Code: ${p3.code}`));
  assert.ok(message.includes("Quantity: 3"));
  assert.ok(message.includes("Unit Price: ₹280"));
  assert.ok(message.includes("Line Subtotal: ₹840"));

  // 4. Totals: 2 + 1 + 3 = 6 pieces; 640 + 320 + 840 = 1800 INR
  assert.ok(message.includes("*Total Pieces:* 6"));
  assert.ok(message.includes("*Grand Total:* ₹1,800"));
});

test("Generate booking message with omitted optional fields", () => {
  const p = products[3]; // Crystal Drop Anklet, code 1142639, price 200
  const lines = [{ product: p, quantity: 1 }];

  const customer = {
    name: "Sneha Kapadia",
    mobile: "9876543210",
    email: "sneha@example.com",
    // No address, city, state, pincode, or message
  };

  const message = generateBookingMessage({ customer, lines });

  assert.ok(message.includes("• Name: Sneha Kapadia"));
  assert.ok(message.includes("• Mobile: 9876543210"));
  assert.ok(message.includes("• Email: sneha@example.com"));

  assert.ok(!message.includes("• Address:"));
  assert.ok(!message.includes("• City:"));
  assert.ok(!message.includes("• State:"));
  assert.ok(!message.includes("• PIN Code:"));
  assert.ok(!message.includes("• Additional Message:"));

  assert.ok(message.includes("*Total Pieces:* 1"));
  assert.ok(message.includes("*Grand Total:* ₹200"));
});

test("URL encoding round-trip preserves special characters, spaces, and INR symbols", () => {
  const p = products[0];
  const lines = [{ product: p, quantity: 2 }];
  const customer = {
    name: "Dia & Co.",
    mobile: "9898384604",
    email: "dia+orders@example.com",
    message: "Special request: 100% authentic silver & stones / handle with care! #1",
  };

  const message = generateBookingMessage({ customer, lines });
  const url = buildWhatsAppUrl(message);

  assert.ok(url.startsWith("https://wa.me/919898384604?text="));

  const encodedText = url.replace("https://wa.me/919898384604?text=", "");
  const decodedText = decodeURIComponent(encodedText);

  assert.equal(decodedText, message);
  assert.ok(decodedText.includes("Dia & Co."));
  assert.ok(decodedText.includes("dia+orders@example.com"));
  assert.ok(decodedText.includes("100% authentic silver & stones / handle with care! #1"));
  assert.ok(decodedText.includes("₹320"));
  assert.ok(decodedText.includes("₹640"));
});

test("Copy to clipboard fallback does not throw in headless environment", async () => {
  const result = await copyToClipboard("test booking message");
  assert.equal(typeof result, "boolean");
});

