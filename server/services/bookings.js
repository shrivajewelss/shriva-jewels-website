import { randomBytes, timingSafeEqual } from "node:crypto";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L
const rand = (n) => Array.from(randomBytes(n), (b) => ALPHABET[b % ALPHABET.length]).join("");
const MAX_ATTEMPTS = 5;

function newReference() {
  const d = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(2, 10).replace(/-/g, "");
  return `SJ-${d}-${rand(4)}`;
}

function rowToBooking(r) {
  return {
    reference: r.reference, createdAt: r.created_at, name: r.customer_name, mobile: r.customer_mobile,
    deliveryPreference: r.delivery_preference, address: r.address, note: r.note,
    items: JSON.parse(r.items_json), subtotal: r.subtotal, status: r.status,
    notification: { status: r.notification_status, attempts: r.notification_attempts, sentAt: r.notification_sent_at },
  };
}

export function createBookingService(db, provider, log = console) {
  const byKey = db.prepare("SELECT * FROM bookings WHERE idempotency_key = ?");
  const byRef = db.prepare("SELECT * FROM bookings WHERE reference = ?");
  const insert = db.prepare(`INSERT INTO bookings
    (reference, access_token, idempotency_key, created_at, customer_name, customer_mobile, delivery_preference, address, note, items_json, subtotal)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  // Atomic claim: only one caller can move a booking to 'sending' → no duplicate notifications.
  const claim = db.prepare(`UPDATE bookings SET notification_status='sending', notification_last_attempt_at=?,
    notification_attempts = notification_attempts + 1
    WHERE reference=? AND notification_status IN ('pending','failed') AND notification_attempts < ?`);
  const markSent = db.prepare(`UPDATE bookings SET notification_status=?, notification_message_id=?, notification_sent_at=?, notification_error=NULL WHERE reference=?`);
  const markFailed = db.prepare(`UPDATE bookings SET notification_status='failed', notification_error=? WHERE reference=?`);
  const pendingRows = db.prepare(`SELECT reference FROM bookings WHERE notification_status IN ('pending','failed')
    AND notification_attempts < ? AND (notification_last_attempt_at IS NULL OR notification_last_attempt_at < ?)`);

  async function notify(reference) {
    const now = new Date().toISOString();
    const { changes } = claim.run(now, reference, MAX_ATTEMPTS);
    if (!changes) return; // already sent / being sent / exhausted
    const booking = rowToBooking(byRef.get(reference));
    try {
      const { messageId } = await provider.send(booking);
      markSent.run(provider.name === "mock" ? "mock" : "sent", messageId, new Date().toISOString(), reference);
    } catch (err) {
      log.error(`[whatsapp] notification failed for ${reference}: ${err.message}`);
      markFailed.run(String(err.message).slice(0, 500), reference);
    }
  }

  return {
    /** Persist first; notify second. Booking success never depends on WhatsApp. */
    async create(v) {
      const existing = byKey.get(v.idempotencyKey);
      if (existing) return { duplicate: true, row: existing };
      let ref, token = rand(24);
      for (let i = 0; i < 5; i++) {
        ref = newReference();
        try {
          insert.run(ref, token, v.idempotencyKey, new Date().toISOString(), v.name, v.mobile,
            v.deliveryPreference, v.address, v.note, JSON.stringify(v.items), v.subtotal);
          break;
        } catch (e) {
          if (/idempotency_key/.test(e.message)) return { duplicate: true, row: byKey.get(v.idempotencyKey) };
          if (i === 4 || !/reference/.test(e.message)) throw e;
        }
      }
      notify(ref).catch((e) => log.error("[notify]", e)); // fire-and-forget; status recorded in DB
      return { duplicate: false, row: byRef.get(ref) };
    },
    /** Returns the booking only if the access token matches (constant-time). */
    getAuthorized(reference, token) {
      const row = byRef.get(String(reference));
      if (!row || typeof token !== "string") return null;
      const a = Buffer.from(row.access_token), b = Buffer.from(token);
      return a.length === b.length && timingSafeEqual(a, b) ? row : null;
    },
    toPublic: (row) => rowToBooking(row),
    async retryPending(olderThanMs = 60_000) {
      const cutoff = new Date(Date.now() - olderThanMs).toISOString();
      for (const { reference } of pendingRows.all(MAX_ATTEMPTS, cutoff)) await notify(reference);
    },
    notify,
  };
}
