import { useEffect, useState } from "react";
import { MessageCircle, Copy, Check, ExternalLink } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import {
  BUSINESS_WHATSAPP_NUMBER,
  generateBookingMessage,
  copyToClipboard,
} from "../utils/booking.js";
import { validateForm } from "../utils/validation.js";

function Field({ id, label, optional, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {optional ? (
          <span className="font-normal text-muted"> (optional)</span>
        ) : (
          <span className="text-red-700" aria-hidden="true"> *</span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function BookingForm({ onNameChange }) {
  const { lines } = useCart();
  const [f, setF] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    onNameChange?.(f.name);
  }, [f.name, onNameChange]);

  const set = (k) => (e) => {
    const val = e.target.value;
    setF((s) => ({ ...s, [k]: val }));
    setErrors((x) => ({ ...x, [k]: undefined }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    const v = validateForm(f);
    setErrors(v);

    const errorKeys = Object.keys(v);
    if (errorKeys.length > 0) {
      document.getElementById(`bk-${errorKeys[0]}`)?.focus();
      return;
    }

    if (lines.length === 0) return;

    const businessNumber = BUSINESS_WHATSAPP_NUMBER;
    const message = generateBookingMessage({ customer: f, lines });
    const whatsappUrl = `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;

    try {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } catch {
      // Handled gracefully via notice and manual open/copy buttons
    }

    setNotice({ message, whatsappUrl });
    setCopied(false);
  }

  async function handleCopy() {
    if (!notice?.message) return;
    const ok = await copyToClipboard(notice.message);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  }

  const err = (k) =>
    errors[k] ? { "aria-invalid": true, "aria-describedby": `bk-${k}-err` } : {};

  return (
      <form
        onSubmit={onSubmit}
        noValidate
        className="space-y-4 rounded-lg border border-line bg-white p-5"
      >
        <h2 className="text-2xl">Your details</h2>

          <Field id="bk-name" label="Full name" error={errors.name}>
            <input
              id="bk-name"
              className="field"
              autoComplete="name"
              placeholder="e.g. Priya Sharma"
              value={f.name}
              onChange={set("name")}
              {...err("name")}
            />
          </Field>

            <Field id="bk-mobile" label="Mobile number" error={errors.mobile}>
              <input
                id="bk-mobile"
                className="field"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="e.g. 98983 84604"
                value={f.mobile}
                onChange={set("mobile")}
                {...err("mobile")}
              />
            </Field>

                <Field id="bk-email" label="Email address" error={errors.email}>
                  <input
                    id="bk-email"
                    className="field"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="e.g. priya@example.com"
                    value={f.email}
                    onChange={set("email")}
                    {...err("email")}
                  />
                </Field>

                <Field id="bk-address" label="Complete address" optional>
                  <textarea
                    id="bk-address"
                    rows={2}
                    maxLength={300}
                    className="field h-auto py-2.5"
                    autoComplete="street-address"
                    placeholder="Flat / House no., building, street, area"
                    value={f.address}
                    onChange={set("address")}
                  />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field id="bk-city" label="City" optional>
                    <input
                      id="bk-city"
                      className="field"
                      autoComplete="address-level2"
                      placeholder="e.g. Surat"
                      value={f.city}
                      onChange={set("city")}
                    />
                  </Field>
                  <Field id="bk-state" label="State" optional>
                    <input
                      id="bk-state"
                      className="field"
                      autoComplete="address-level1"
                      placeholder="e.g. Gujarat"
                      value={f.state}
                      onChange={set("state")}
                    />
                  </Field>
                </div>

                <Field id="bk-pincode" label="PIN code" optional error={errors.pincode}>
                  <input
                    id="bk-pincode"
                    className="field"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="postal-code"
                    placeholder="e.g. 395007"
                    value={f.pincode}
                    onChange={set("pincode")}
                    {...err("pincode")}
                  />
                </Field>

                <Field id="bk-message" label="Additional message" optional>
                  <textarea
                    id="bk-message"
                    rows={3}
                    maxLength={500}
                    className="field h-auto py-2.5"
                    placeholder="Any special requests or instructions..."
                    value={f.message}
                    onChange={set("message")}
                  />
                </Field>

                {notice && (
                  <div
                    className="space-y-3 rounded-lg border border-maroon/20 bg-sand/60 p-4 text-ink"
                    role="status"
                  >
                    <div className="flex items-start gap-2.5">
                      <MessageCircle
                        className="mt-0.5 h-5 w-5 shrink-0 text-maroon"
                        aria-hidden="true"
                      />
                      <div className="space-y-1">
                        <p className="font-medium text-maroon">
                          Your booking message is ready in WhatsApp. Please press Send to submit your request.
                        </p>
                        <p className="text-xs leading-relaxed text-muted">
                          WhatsApp opened in a new tab. If it did not open automatically, tap below to open it or copy your message.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href={notice.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary inline-flex h-10 px-4 text-xs"
                      >
                        <ExternalLink size={14} aria-hidden="true" /> Open in WhatsApp
                      </a>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="btn btn-outline inline-flex h-10 px-4 text-xs"
                      >
                        {copied ? (
                          <>
                            <Check size={14} className="text-emerald-700" aria-hidden="true" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={14} aria-hidden="true" /> Copy booking message
                          </>
                        )}
                      </button>
                    </div>

                    {copied && (
                      <p className="text-xs font-medium text-emerald-800" role="status">
                        ✓ Booking message copied to clipboard.
                      </p>
                    )}
                  </div>
            )}

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={lines.length === 0}
              >
                Request for Booking
              </button>
            </form>
            );
}
