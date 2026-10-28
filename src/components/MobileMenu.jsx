import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { navLinks } from "./Header.jsx";

/** Slide-in menu: Esc closes, focus is trapped while open, body scroll is locked, route change closes. */
export default function MobileMenu({ open, onClose }) {
  const panel = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => { onClose(); /* close on navigation */ }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const opener = document.activeElement;
    document.body.style.overflow = "hidden";
    const focusables = () => panel.current.querySelectorAll("a[href], button");
    focusables()[0]?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab") return;
      const f = focusables(); const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prevOverflow; opener?.focus?.(); };
  }, [open, onClose]);

  return (
    <div id="mobile-menu" className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div ref={panel} role="dialog" aria-modal="true" aria-label="Menu" inert={!open}
        className={`absolute inset-y-0 left-0 flex w-[82%] max-w-sm flex-col bg-cream p-6 shadow-xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-8 flex items-center justify-between">
          <img src="/brand/shriva-logo.png" alt="" className="h-12 w-auto" />
          <button type="button" onClick={onClose} aria-label="Close menu" className="rounded p-2 text-maroon"><X size={24} strokeWidth={1.5} /></button>
        </div>
        <nav aria-label="Mobile" className="flex flex-col">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `border-b border-line py-4 font-display text-2xl ${isActive ? "text-maroon" : "text-ink"}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
