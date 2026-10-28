import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink, hasWhatsAppNumber } from "../utils/booking.js";

/** Customer-initiated wa.me message. Separate from (and not a replacement for) the server notification. */
export default function WhatsAppButton({ lines, subtotal, name, className = "btn btn-outline w-full" }) {
  if (!hasWhatsAppNumber) return null;
  return (
    <a href={buildWhatsAppLink(lines, subtotal, name)} target="_blank" rel="noopener noreferrer" className={className}>
      <MessageCircle size={18} strokeWidth={1.5} aria-hidden="true" /> Message us on WhatsApp instead
    </a>
  );
}
