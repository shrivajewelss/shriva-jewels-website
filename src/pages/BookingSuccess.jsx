import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { fetchBooking } from "../utils/booking.js";
import { formatPrice } from "../utils/currency.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function BookingSuccess() {
  usePageMeta({ title: "Booking request received — Shriva Jewels", noindex: true });
  const { bookingReference } = useParams();
  const [params] = useSearchParams();
  const token = params.get("t");
  const [state, setState] = useState({ status: "loading", booking: null });

  useEffect(() => {
    let live = true;
    if (!token) { setState({ status: "missing", booking: null }); return; }
    fetchBooking(bookingReference, token)
      .then((b) => live && setState(b ? { status: "ok", booking: b } : { status: "missing", booking: null }))
      .catch(() => live && setState({ status: "error", booking: null }));
    return () => { live = false; };
  }, [bookingReference, token]);

  if (state.status === "loading") return <div className="container-page"><LoadingState label="Loading your booking…" /></div>;
  if (state.status !== "ok") {
    return (
      <div className="container-page">
        <EmptyState title="We couldn't load this booking">
          <p>{state.status === "error" ? "Something went wrong. Please refresh to try again." : "The link may be incomplete or expired."}</p>
          <Link to="/products" className="btn btn-primary mt-6">Back to the collection</Link>
        </EmptyState>
      </div>
    );
  }
  const b = state.booking;
  return (
    <div className="container-page max-w-2xl pt-12 sm:pt-16">
      <CheckCircle2 size={44} strokeWidth={1.25} className="text-maroon" aria-hidden="true" />
      <h1 className="mt-4 text-5xl">Booking request received</h1>
      <p className="mt-3 text-ink/80">Thank you, {b.name}. We'll confirm availability with you personally on WhatsApp at +91 {b.mobile}. No payment is needed now.</p>
      <p className="mt-6 rounded-lg bg-sand p-4 text-sm">Booking reference <strong className="ml-1 text-base tracking-wider text-maroon">{b.reference}</strong></p>
      <ul className="mt-6 divide-y divide-line border-y border-line text-sm">
        {b.items.map((i) => (
          <li key={i.id} className="flex justify-between gap-4 py-3"><span>{i.name} <span className="text-muted">· Code {i.code} · {formatPrice(i.unitPrice)} × {i.quantity}</span></span><span>{formatPrice(i.lineTotal)}</span></li>
        ))}
      </ul>
      <p className="mt-4 flex justify-between font-medium"><span>Subtotal</span><span className="text-maroon">{formatPrice(b.subtotal)}</span></p>
      <p className="mt-2 text-xs text-muted">Status: awaiting availability confirmation. Keep your reference handy if you contact us.</p>
      {b.notification.status === "failed" && (
        <p className="mt-4 rounded-lg bg-sand p-3 text-sm">Your request is safely saved. Our alert to the shop is delayed and will be retried automatically — you can also message us on Instagram and quote your reference.</p>
      )}
      <Link to="/products" className="btn btn-primary mt-8">Continue shopping</Link>
    </div>
  );
}
