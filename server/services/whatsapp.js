/**
 * WhatsApp notification providers.
 *  - "cloud": official WhatsApp Business Cloud API (Meta). Needs real credentials.
 *  - "mock":  logs the message only. Notification status is recorded as "mock" – never "sent".
 * A provider returns { messageId } on success and THROWS on failure.
 */
const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const oneLine = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

export function formatBookingText(b) {
  const when = new Date(b.createdAt).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short",
  });
  const lines = [
    "NEW SHRIVA JEWELS BOOKING", "",
    `Booking Reference: ${b.reference}`, `Date: ${when} IST`, "",
    "CUSTOMER", `Name: ${b.name}`, `Mobile: +91 ${b.mobile}`, "", "ITEMS",
  ];
  for (const i of b.items) {
    lines.push(`${i.name} | Code: ${i.code}`, `Quantity: ${i.quantity}`,
      `Unit Price: ${inr(i.unitPrice)}`, `Line Total: ${inr(i.lineTotal)}`, "");
  }
  lines.push(`Subtotal: ${inr(b.subtotal)}`,
    `Delivery Preference: ${b.deliveryPreference ?? "Not specified"}${b.address ? ` (${b.address})` : ""}`,
    `Customer Note: ${b.note ?? "—"}`, "", "Status: Awaiting availability confirmation.");
  return lines.join("\n");
}

/** Template parameters must be single-line text (WhatsApp rejects newlines/tabs in params). */
export function templateParams(b) {
  const items = b.items.map((i) => `${i.name} (Code ${i.code}) x${i.quantity} = ${inr(i.lineTotal)}`).join("; ");
  const delivery = `${b.deliveryPreference ?? "Not specified"}${b.address ? `: ${b.address}` : ""}`;
  return [b.reference, b.name, `+91 ${b.mobile}`, items, inr(b.subtotal), delivery, b.note ?? "None"]
    .map((v) => oneLine(v).slice(0, 900) || "-");
}

export function createProvider(cfg, log = console) {
  if (cfg.provider === "cloud") {
    const missing = ["accessToken", "phoneNumberId", "businessNumber"].filter((k) => !cfg[k]);
    if (missing.length) {
      log.warn(`[whatsapp] provider=cloud but missing: ${missing.join(", ")} — falling back to mock`);
    } else {
      return {
        name: "cloud",
        async send(booking) {
          const url = `https://graph.facebook.com/${cfg.apiVersion}/${cfg.phoneNumberId}/messages`;
          const to = String(cfg.businessNumber).replace(/\D/g, "");
          const payload = cfg.templateName
            ? { messaging_product: "whatsapp", to, type: "template", template: {
                name: cfg.templateName, language: { code: cfg.templateLang },
                components: [{ type: "body", parameters: templateParams(booking).map((text) => ({ type: "text", text })) }] } }
            // Free-form text only delivers inside the 24h customer-service window. See README.
            : { messaging_product: "whatsapp", to, type: "text", text: { body: formatBookingText(booking) } };
          const res = await fetch(url, {
            method: "POST",
            headers: { Authorization: `Bearer ${cfg.accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(15000),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(`WhatsApp API ${res.status}: ${data?.error?.message ?? "unknown error"}`);
          return { messageId: data?.messages?.[0]?.id ?? null };
        },
      };
    }
  }
  return {
    name: "mock",
    async send(booking) {
      log.info(`[whatsapp:mock] would notify ${cfg.businessNumber || "(no number set)"}:\n${formatBookingText(booking)}`);
      return { messageId: null };
    },
  };
}
