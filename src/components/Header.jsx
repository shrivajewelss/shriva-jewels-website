import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { categories } from "../data/categories.js";
import MobileMenu from "./MobileMenu.jsx";

export const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/products", label: "Shop All" },
  ...categories.map((c) => ({ to: `/category/${c.slug}`, label: c.name })),
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const link = ({ isActive }) =>
    `relative py-1 text-sm tracking-wide transition-colors hover:text-maroon after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-maroon after:transition-transform after:duration-300 ${
      isActive ? "text-maroon after:scale-x-100" : "text-ink after:scale-x-0 hover:after:scale-x-100"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4 sm:h-20">
        <button type="button" className="-ml-2 rounded p-2 text-maroon lg:hidden" aria-label="Open menu" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}>
          <Menu size={24} strokeWidth={1.5} />
        </button>
        <Link to="/" aria-label="Shriva Jewels — home" className="shrink-0">
          <img src="/brand/shriva-logo.png" alt="Shriva Jewels" width="830" height="481" className="h-11 w-auto sm:h-14" />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={link}>{l.label}</NavLink>
          ))}
        </nav>
        <Link to="/cart" className="relative -mr-2 rounded p-2 text-maroon" aria-label={`Your bag, ${count} ${count === 1 ? "item" : "items"}`}>
          <ShoppingBag size={24} strokeWidth={1.5} />
          {count > 0 && (
            <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-maroon px-1 text-[10px] font-medium text-cream" aria-hidden="true">{count}</span>
          )}
        </Link>
      </div>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
