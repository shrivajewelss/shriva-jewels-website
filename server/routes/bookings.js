import { validateBooking } from "../validation/booking.js";

export function bookingRoutes(service, rateLimit) {
  const hits = new Map();
  const limited = (ip) => {
    const now = Date.now();
    const arr = (hits.get(ip) || []).filter((t) => now - t < rateLimit.windowMs);
    if (arr.length >= rateLimit.max) { hits.set(ip, arr); return true; }
    arr.push(now); hits.set(ip, arr); return false;
  };
  const view = (row) => ({ ...service.toPublic(row), accessToken: row.access_token });

  return {
    // POST /api/bookings
    async create({ body, ip }) {
      const v = validateBooking(body);
      if (!v.ok) return { status: 400, json: { error: "validation_failed", errors: v.errors } };
      if (limited(ip)) return { status: 429, json: { error: "rate_limited", message: "Too many requests. Please try again later." } };
      try {
        const { duplicate, row } = await service.create(v.value);
        return { status: duplicate ? 200 : 201, json: { duplicate, booking: view(row) } };
      } catch (e) {
        console.error("[booking] persist failed:", e);
        return { status: 500, json: { error: "persist_failed", message: "We couldn't save your booking. Your bag is untouched — please try again." } };
      }
    },
    // GET /api/bookings/:ref?token=...   (token returned only to the submitter; refs alone reveal nothing)
    get({ ref, token }) {
      const row = service.getAuthorized(ref, token);
      return row ? { status: 200, json: { booking: service.toPublic(row) } } : { status: 404, json: { error: "not_found" } };
    },
  };
}
