import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../utils/currency.js";

export default function ProductCard({ product, priority = false }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const href = `/product/${product.id}`;

  const onAdd = () => {
    add(product.id, 1);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group flex flex-col">
      <Link to={href} className="block overflow-hidden rounded-lg bg-sand" tabIndex={-1} aria-hidden="true">
        <img src={product.image} alt="" width="800" height="1067" loading={priority ? "eager" : "lazy"} decoding="async"
          className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-[var(--ease)] group-hover:scale-105" />
      </Link>
      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Code {product.code}</p>
        <h3 className="mt-1 font-display text-lg leading-snug text-ink">
          <Link to={href} className="hover:text-maroon">{product.name}<span className="sr-only">, view details</span></Link>
        </h3>
        <p className="mt-1 text-sm font-medium text-maroon">{formatPrice(product.price)}</p>
        <button type="button" onClick={onAdd} className="btn btn-outline mt-3 h-10 w-full text-[13px]" aria-label={`Add ${product.name} to cart`}>
          {added ? "Added ✓" : "Add to Cart"}
        </button>
        <span className="sr-only" role="status" aria-live="polite">{added ? `${product.name} added to your bag` : ""}</span>
      </div>
    </article>
  );
}
