import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { submitBooking } from "../utils/booking.js";
import { validateForm } from "../utils/validation.js";

const newKey = () => (crypto.randomUUID ? crypto.randomUUID() : `k${Date.now()}${Math.random().toString(36).slice(2)}`);

function Field({ id, label, optional, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}{optional && <span className="font-normal text-muted"> (optional)</span>}</label>
      {children}
      {error && <p id={`${id}-err`} className="mt-1.5 text-sm text-red-700" role="alert">{error}</p>}
    </div>
  );
}

export default function BookingForm({ onNameChange }) {
  const { lines, clear } = useCart();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", mobile: "", deliveryPreference: "", address: "", note: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);   // synchronous guard against double-clicks
  const keyRef = useRef({ sig: "", key: newKey() });

  // A new idempotency key whenever the request content changes; the same key is reused for retries of identical content.
  const items = lines.map((l) => ({ id: l.id, quantity: l.quantity }));
  const sig = JSON.stringify({ items, f });
  if (keyRef.current.sig !== sig) keyRef.current = { sig, key: keyRef.current.sig === "" ? keyRef.current.key : newKey() };

  useEffect(() => { onNameChange?.(f.name); }, [f.name, onNameChange]);
  const set = (k) => (e) => { setF((s) => ({ ...s, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };

  async function onSubmit(e) {
    e.preventDefault();
    if (busyRef.current) return;
    const v = validateForm(f);
    setErrors(v); setSubmitError("");
    if (Object.keys(v).length) { document.getElementById(`bk-${Object.keys(v)[0]}`)?.focus(); return; }
    busyRef.current = true; setBusy(true);
    try {
      const { booking } = await submitBooking({
        name: f.name, mobile: f.mobile, deliveryPreference: f.deliveryPreference || undefined,
        address: f.deliveryPreference === "delivery" ? f.address : undefined, note: f.note || undefined,
        items, idempotencyKey: keyRef.current.key,
      });
      clear(); // only after the server confirmed the booking is saved
      navigate(`/booking-success/${booking.reference}?t=${encodeURIComponent(booking.accessToken)}`, { replace: true });
    } catch (err) {
      if (err.fieldErrors) setErrors(err.fieldErrors);
      setSubmitError(err.message);
      busyRef.current = false; setBusy(false);
    }
  }

  const err = (k) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `bk-${k}-err` } : {});

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-lg border border-line bg-white p-5">
      <h2 className="text-2xl">Your details</h2>
      <Field id="bk-name" label="Name" error={errors.name}>
        <input id="bk-name" className="field" autoComplete="name" value={f.name} onChange={set("name")} {...err("name")} />
      </Field>
      <Field id="bk-mobile" label="WhatsApp / mobile number" error={errors.mobile}>
        <input id="bk-mobile" className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" value={f.mobile} onChange={set("mobile")} {...err("mobile")} />
      </Field>
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Delivery or collection<span className="font-normal text-muted"> (optional)</span></legend>
        <div className="flex gap-5 text-sm">
          {[["", "No preference"], ["collection", "Collection"], ["delivery", "Delivery"]].map(([v, l]) => (
            <label key={v} className="flex items-center gap-2"><input type="radio" name="pref" className="accent-[var(--maroon)]" checked={f.deliveryPreference === v} onChange={() => setF((s) => ({ ...s, deliveryPreference: v }))} />{l}</label>
          ))}
        </div>
      </fieldset>
      {f.deliveryPreference === "delivery" && (
        <Field id="bk-address" label="Delivery address" error={errors.address}>
          <textarea id="bk-address" rows={3} maxLength={300} className="field h-auto py-3" autoComplete="street-address" value={f.address} onChange={set("address")} {...err("address")} />
        </Field>
      )}
      <Field id="bk-note" label="Note" optional>
        <textarea id="bk-note" rows={3} maxLength={500} className="field h-auto py-3" value={f.note} onChange={set("note")} />
      </Field>
      {submitError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{submitError}</p>}
      <button type="submit" className="btn btn-primary w-full" disabled={busy || lines.length === 0} aria-busy={busy}>
        {busy ? "Sending your request…" : "Send booking request"}
      </button>
    </form>
  );
}
