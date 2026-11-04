import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../utils/currency.js";
import { trackAddToCart } from "../utils/analytics.js";

export default function ProductCard({ product, priority = false }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const href = `/product/${product.id}`;
  const isAvailable = product.inStock !== false;

  const onAdd = () => {
    if (!isAvailable) return;
    add(product.id, 1);
    trackAddToCart(product, 1);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group flex flex-col">
      <Link
        to={href}
        className="relative block overflow-hidden rounded-lg bg-sand"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={product.image}
          alt={product.name}
          width="800"
          height="1067"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={`aspect-[3/4] w-full object-cover transition-all duration-700 ease-[var(--ease)] ${
            isAvailable
              ? "group-hover:scale-105"
              : "opacity-80 saturate-[0.85] group-hover:scale-100"
          }`}
        />

        {/* Elegant Out of Stock Badge Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
            <span className="rounded-full border border-sand/40 bg-maroon-deep/90 px-3.5 py-1.5 text-[10px] sm:text-[11px] font-medium tracking-[0.2em] uppercase text-cream shadow-md">
              Out of Stock
            </span>
          </div>
        )}
      </Link>
      <div className="mt-3 flex flex-1 flex-col">
        {product.code ? (
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Code {product.code}</p>
        ) : null}
        <h3 className="mt-1 font-display text-lg leading-snug text-ink">
          <Link to={href} className="hover:text-maroon">
            {product.name}
            <span className="sr-only">, view details</span>
          </Link>
        </h3>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-maroon">{formatPrice(product.price)}</p>
          {!isAvailable && (
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
              Out of stock
            </span>
          )}
        </div>
        {isAvailable ? (
          <button
            type="button"
            onClick={onAdd}
            className="btn btn-outline mt-3 h-10 w-full text-[13px]"
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? "Added ✓" : "Add to Cart"}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="btn btn-outline mt-3 h-10 w-full text-[13px] border-line text-muted opacity-60 cursor-not-allowed hover:bg-transparent hover:text-muted hover:border-line"
            aria-label={`${product.name} is currently unavailable`}
          >
            Currently Unavailable
          </button>
        )}
        <span className="sr-only" role="status" aria-live="polite">
          {added ? `${product.name} added to your bag` : ""}
        </span>
      </div>
    </article>
  );
}
