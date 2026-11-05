import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import MobileMenu from "./MobileMenu.jsx";
import HeaderSearch from "./HeaderSearch.jsx";

export const navLinks = [
  { to: "/products", label: "Shop all" },
  { to: "/about", label: "About us" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  const link = ({ isActive }) =>
    `relative py-1 text-[15px] font-medium tracking-wide transition-colors hover:text-maroon after:absolute after:inset-x-0 after:-bottom-1 after:h-[1.5px] after:origin-left after:bg-maroon after:transition-transform after:duration-300 ${
      isActive
        ? "text-maroon font-semibold after:scale-x-100"
        : "text-ink/90 after:scale-x-0 hover:after:scale-x-100"
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-3 sm:h-20 md:grid md:grid-cols-[1fr_auto_1fr]">
          {/* Left Column: Mobile Hamburger & Logo */}
          <div className="flex items-center justify-start gap-2 sm:gap-3">
            <button
              type="button"
              className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-maroon hover:bg-sand/60 transition-colors md:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>
            <Link to="/" aria-label="Shriva Jewels — home" className="shrink-0">
              <img
                src="https://www.shriva.store//brand/shriva-logo.png"
                alt="Shriva Jewels - Fashion Jewellery Brand Logo"
                width="830"
                height="481"
                className="h-10 w-auto sm:h-12 md:h-14"
              />
            </Link>
          </div>

          {/* Center Column: Exactly 2 Links — Shop All and About Us */}
          <nav aria-label="Main" className="hidden md:flex items-center justify-center gap-8 lg:gap-12">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={link}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Column: Search Bar and Cart Icon */}
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <HeaderSearch />
            <Link
              to="/cart"
              className="relative -mr-2 flex h-10 w-10 items-center justify-center rounded-full text-maroon hover:bg-sand/60 transition-colors shrink-0"
              aria-label={`Your bag, ${count} ${count === 1 ? "item" : "items"}`}
            >
              <ShoppingBag size={22} strokeWidth={1.5} />
              {count > 0 && (
                <span
                  className="absolute top-1 right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-maroon px-1 text-[10px] font-medium text-cream shadow-sm"
                  aria-hidden="true"
                >
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
