import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink, hasWhatsAppNumber } from "../utils/booking.js";
import { trackBookingRequest } from "../utils/analytics.js";

/** Customer-initiated wa.me message. Separate from (and not a replacement for) the server notification. */
export default function WhatsAppButton({ lines, subtotal, name, className = "btn btn-outline w-full" }) {
  if (!hasWhatsAppNumber) return null;
  const hasUnavailable = (lines || []).some((l) => l.product?.inStock === false);
  if (hasUnavailable) return null;

  const handleClick = () => {
    trackBookingRequest({
      method: "whatsapp_direct_button",
      customer: { name },
      lines,
      subtotal,
    });
  };

  return (
    <a
      href={buildWhatsAppLink(lines, subtotal, name)}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <MessageCircle size={18} strokeWidth={1.5} aria-hidden="true" /> Message us on WhatsApp instead
    </a>
  );
}
