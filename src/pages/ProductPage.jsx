import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { productsById, products } from "../data/products.js";
import { categoriesBySlug } from "../data/categories.js";
import { useCart } from "../context/CartContext.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { formatPrice } from "../utils/currency.js";
import QuantitySelector from "../components/QuantitySelector.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import NotFound from "./NotFound.jsx";

export default function ProductPage() {
  const { productId } = useParams();
  const product = productsById[productId];
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  usePageMeta({
    title: product ? `${product.name} (${product.code}) — Shriva Jewels` : "Page not found — Shriva Jewels",
    description: product ? `${product.name}, product code ${product.code}, ${formatPrice(product.price)}. Book on WhatsApp.` : undefined,
    path: product ? `/product/${product.id}` : undefined, noindex: !product,
  });
  if (!product) return <NotFound />;

  const cat = categoriesBySlug[product.category];
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="container-page pt-8 sm:pt-12" key={product.id}>
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link to="/products" className="hover:text-maroon">Products</Link> <span aria-hidden="true">/</span>{" "}
        <Link to={`/category/${cat.slug}`} className="hover:text-maroon">{cat.name}</Link>
      </nav>
      <div className="mt-6 grid gap-10 md:grid-cols-2 lg:gap-16">
        <img src={product.image} alt={`${product.name} — Shriva Jewels`} width="800" height="1067" fetchPriority="high" className="aspect-[3/4] w-full rounded-lg bg-sand object-cover" />
        <div className="md:pt-6">
          <Link to={`/category/${cat.slug}`} className="eyebrow hover:text-maroon">{cat.name}</Link>
          <h1 className="mt-2 text-4xl sm:text-5xl">{product.name}</h1>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted">Product code · {product.code}</p>
          <p className="mt-4 font-display text-3xl text-maroon">{formatPrice(product.price)}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <QuantitySelector value={qty} onChange={setQty} />
            <button type="button" className="btn btn-primary" onClick={() => { add(product.id, qty); setAdded(true); }}>Add to Cart</button>
          </div>
          <div role="status" aria-live="polite" className="mt-3 min-h-6 text-sm">
            {added && <>Added to your bag. <Link to="/cart" className="font-medium text-maroon underline underline-offset-4">View bag</Link></>}
          </div>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-ink/80">
            Add this piece to your bag and send a booking request on WhatsApp. We'll confirm availability and details with you directly.
          </p>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-20" aria-labelledby="rel-h">
          <h2 id="rel-h" className="text-3xl sm:text-4xl">You may also like</h2>
          <div className="mt-8"><ProductGrid products={related} /></div>
        </section>
      )}
    </div>
  );
}
