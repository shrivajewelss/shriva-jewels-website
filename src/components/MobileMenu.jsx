import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, Link } from "react-router-dom";
import { X, Instagram, Facebook, Phone, Mail, MessageCircle } from "lucide-react";
import { navLinks } from "./Header.jsx";
import {
  INSTAGRAM_URL,
  FACEBOOK_URL,
  PINTEREST_URL,
  BUSINESS_WHATSAPP_NUMBER,
  CONTACT_PHONE,
  CONTACT_PHONE_RAW,
  CONTACT_EMAIL,
} from "../utils/booking.js";

function PinterestIcon({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.057.242-.191.293-.441.177-1.649-.766-2.679-3.171-2.679-5.105 0-4.156 3.02-7.973 8.711-7.973 4.573 0 8.128 3.259 8.128 7.615 0 4.544-2.864 8.2-6.84 8.2-1.336 0-2.592-.695-3.022-1.514l-.823 3.136c-.297 1.144-1.1 2.578-1.639 3.454C9.882 23.824 10.925 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  );
}

/** Slide-in menu rendered via Portal: Esc closes, focus is trapped, body scroll locked, route change closes. */
export default function MobileMenu({ open, onClose }) {
  const panel = useRef(null);
  const { pathname } = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const opener = document.activeElement;
    document.body.style.overflow = "hidden";

    const focusables = () => panel.current?.querySelectorAll("a[href], button") || [];
    const elements = focusables();
    if (elements.length > 0) {
      elements[0].focus();
    }

    const onKey = (e) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab") return;
      const f = focusables();
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const content = (
    <div
      id="mobile-menu"
      className={`fixed inset-0 z-[100] lg:hidden ${
        open ? "pointer-events-auto visible" : "pointer-events-none invisible"
      }`}
      aria-hidden={!open}
    >
      {/* Dimmed backdrop covering full viewport */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over drawer panel with solid cream background */}
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        tabIndex={-1}
        className={`fixed inset-y-0 left-0 z-[101] flex w-[85%] max-w-sm flex-col bg-[#faf5ee] shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex h-16 sm:h-20 items-center justify-between border-b border-line px-5 sm:px-6">
          <Link to="/" onClick={onClose} aria-label="Shriva Jewels — home" className="shrink-0">
            <img
              src="/brand/shriva-logo.png"
              alt="Shriva Jewels"
              width="830"
              height="481"
              className="h-10 sm:h-12 w-auto"
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-maroon hover:bg-sand/60 transition-colors"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* Drawer Links */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
          <nav aria-label="Mobile Navigation" className="flex flex-col divide-y divide-line/60">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `flex items-center justify-between py-3.5 font-display text-2xl transition-colors ${
                    isActive ? "text-maroon font-semibold" : "text-ink hover:text-maroon"
                  }`
                }
              >
                <span>{l.label}</span>
                <span className="font-sans text-xs text-muted/60">→</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-line bg-sand/40 p-5 text-sm text-ink/80 space-y-3.5">
          <div className="space-y-1.5 text-xs">
            <a
              href={`tel:${CONTACT_PHONE_RAW}`}
              className="flex items-center gap-2 text-ink hover:text-maroon transition-colors"
            >
              <Phone size={14} className="text-maroon shrink-0" aria-hidden="true" />
              <span>{CONTACT_PHONE}</span>
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-2 text-ink hover:text-maroon transition-colors break-all"
            >
              <Mail size={14} className="text-maroon shrink-0" aria-hidden="true" />
              <span>{CONTACT_EMAIL}</span>
            </a>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-line/50">
            <a
              href={`https://wa.me/${BUSINESS_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-maroon hover:underline underline-offset-4"
            >
              <MessageCircle size={15} strokeWidth={1.5} aria-hidden="true" />
              <span>WhatsApp Booking</span>
            </a>

            <div className="flex items-center gap-2">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-cream text-maroon hover:bg-maroon hover:text-cream transition-colors"
              >
                <Instagram size={14} strokeWidth={1.5} aria-hidden="true" />
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-cream text-maroon hover:bg-maroon hover:text-cream transition-colors"
              >
                <Facebook size={14} strokeWidth={1.5} aria-hidden="true" />
              </a>
              <a
                href={PINTEREST_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-cream text-maroon hover:bg-maroon hover:text-cream transition-colors"
              >
                <PinterestIcon size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
