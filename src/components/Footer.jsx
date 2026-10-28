import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import { categories } from "../data/categories.js";
import { INSTAGRAM_URL } from "../utils/booking.js";

export default function Footer() {
  const li = "text-sm text-cream/80 transition-colors hover:text-white hover:underline underline-offset-4";
  return (
    <footer className="on-dark mt-24 bg-maroon text-cream">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <img src="/brand/shriva-logo-light.png" alt="Shriva Jewels" width="830" height="481" className="h-20 w-auto" loading="lazy" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/80">
            Jewellery that speaks your style. Browse, add to your bag and send us a booking request on WhatsApp.
          </p>
        </div>
        <nav aria-label="Shop">
          <h3 className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.2em] !text-cream">Shop</h3>
          <ul className="space-y-2.5">
            <li><Link className={li} to="/products">Shop All</Link></li>
            {categories.map((c) => <li key={c.slug}><Link className={li} to={`/category/${c.slug}`}>{c.name}</Link></li>)}
          </ul>
        </nav>
        <nav aria-label="Contact">
          <h3 className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.2em] !text-cream">Contact</h3>
          <ul className="space-y-2.5">
            <li><a className={`${li} inline-flex items-center gap-2`} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"><Instagram size={16} strokeWidth={1.5} aria-hidden="true" />@shriva._jewels</a></li>
            <li><Link className={li} to="/cart">Your bag</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-cream/20">
        <p className="container-page py-5 text-xs text-cream/70">© 2026 Shriva Jewels</p>
      </div>
    </footer>
  );
}
