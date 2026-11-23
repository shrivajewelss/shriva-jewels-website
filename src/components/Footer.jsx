import { Link } from "react-router-dom";
import { Instagram, Facebook, Phone, Mail, MessageCircle } from "lucide-react";
import { categories } from "../data/categories.js";
import {
  BUSINESS_WHATSAPP_NUMBER,
  CONTACT_PHONE,
  CONTACT_PHONE_RAW,
  CONTACT_EMAIL,
  INSTAGRAM_URL,
  FACEBOOK_URL,
  PINTEREST_URL,
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

export default function Footer() {
  const li = "text-sm text-cream/80 transition-colors hover:text-white hover:underline underline-offset-4";

  return (
    <footer className="on-dark mt-24 bg-maroon text-cream">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1.4fr]">
        <div>
          <img
            src="https://www.shriva.store//brand/shriva-logo-light.png"
            alt="Shriva Jewels - Elegant Fashion Jewellery"
            width="830"
            height="481"
            className="h-20 w-auto"
            loading="lazy"
          />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/80">
            Jewellery that speaks your style. Browse, add to your bag and send us a booking request on WhatsApp.
          </p>
        </div>

        <nav aria-label="Shop">
          <h3 className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.2em] !text-cream">Shop</h3>
          <ul className="space-y-2.5">
            <li><Link className={li} to="/products">Shop All</Link></li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link className={li} to={`/category/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
            <li><Link className={li} to="/about">About Us</Link></li>
            <li><Link className={li} to="/cart">Your bag</Link></li>
          </ul>
        </nav>

        <div>
          <h3 className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.2em] !text-cream">Contact Us</h3>
          <ul className="space-y-3">
            <li>
              <a
                className={`${li} inline-flex items-center gap-2.5`}
                href={`tel:${CONTACT_PHONE_RAW}`}
              >
                <Phone size={15} strokeWidth={1.5} className="text-cream shrink-0" aria-hidden="true" />
                <span>{CONTACT_PHONE}</span>
              </a>
            </li>
            <li>
              <a
                className={`${li} inline-flex items-center gap-2.5 break-all`}
                href={`mailto:${CONTACT_EMAIL}`}
              >
                <Mail size={15} strokeWidth={1.5} className="text-cream shrink-0" aria-hidden="true" />
                <span>{CONTACT_EMAIL}</span>
              </a>
            </li>
            <li>
              <a
                className={`${li} inline-flex items-center gap-2.5`}
                href={`https://wa.me/${BUSINESS_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={15} strokeWidth={1.5} className="text-cream shrink-0" aria-hidden="true" />
                <span>WhatsApp Booking</span>
              </a>
            </li>
          </ul>

          <h4 className="mt-6 mb-3 font-sans text-xs font-medium uppercase tracking-[0.2em] !text-cream">Follow Us</h4>
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram (@shriva._jewels)"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/30 text-cream/90 transition-colors hover:border-white hover:bg-cream/10 hover:text-white"
            >
              <Instagram size={17} strokeWidth={1.5} aria-hidden="true" />
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/30 text-cream/90 transition-colors hover:border-white hover:bg-cream/10 hover:text-white"
            >
              <Facebook size={17} strokeWidth={1.5} aria-hidden="true" />
            </a>
            <a
              href={PINTEREST_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinterest"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/30 text-cream/90 transition-colors hover:border-white hover:bg-cream/10 hover:text-white"
            >
              <PinterestIcon size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/20">
        <p className="container-page py-5 text-xs text-cream/70">© 2026 Shriva Jewels</p>
      </div>
    </footer>
  );
}
