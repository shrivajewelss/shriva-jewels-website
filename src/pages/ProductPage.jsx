import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { productsById, products } from "../data/products.js";
import { categoriesBySlug } from "../data/categories.js";
import { useCart } from "../context/CartContext.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { formatPrice } from "../utils/currency.js";
import { trackViewItem, trackAddToCart } from "../utils/analytics.js";
import QuantitySelector from "../components/QuantitySelector.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import NotFound from "./NotFound.jsx";

export default function ProductPage() {
  const { productId } = useParams();
  const product = productsById[productId];
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) trackViewItem(product);
  }, [product]);

  usePageMeta({
    title: product ? `${product.name}${product.code ? ` (${product.code})` : ""} — Shriva Jewels` : "Page not found — Shriva Jewels",
    description: product ? `${product.name}${product.code ? `, product code ${product.code}` : ""}, ${formatPrice(product.price)}. Book on WhatsApp.` : undefined,
    keywords: product
      ? `${product.name}, ${product.code ? `code ${product.code}, ` : ""}${product.category || "jewellery"}, buy ${product.name} online, Shriva Jewels ${product.name}, fashion ${product.category || "jewellery"} price ${formatPrice(product.price)}`
      : undefined,
    path: product ? `/product/${product.id}` : undefined,
    noindex: !product,
  });
  if (!product) return <NotFound />;

  const cat = categoriesBySlug[product.category];
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const isAvailable = product.inStock !== false;

  return (
    <div className="container-page pt-8 sm:pt-12" key={product.id}>
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link to="/products" className="hover:text-maroon">Products</Link> <span aria-hidden="true">/</span>{" "}
        <Link to={`/category/${cat.slug}`} className="hover:text-maroon">{cat.name}</Link>
      </nav>
      <div className="mt-6 grid gap-10 md:grid-cols-2 lg:gap-16">
        <div className="relative overflow-hidden rounded-lg bg-sand">
          <img
            src={`https://www.shriva.store/${product.image}`}
            alt={`${product.name}${product.code ? ` (${product.code})` : ""} - Shriva Jewels ${cat ? cat.name : "fashion jewellery"}`}
            width="800"
            height="1067"
            fetchPriority="high"
            className={`aspect-[3/4] w-full object-cover transition-all ${!isAvailable ? "opacity-85 saturate-[0.85]" : ""
              }`}
          />
          {!isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
              <span className="rounded-full border border-sand/40 bg-maroon-deep/90 px-5 py-2 text-xs sm:text-sm font-medium tracking-[0.22em] uppercase text-cream shadow-md">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        <div className="md:pt-6">
          <Link to={`/category/${cat.slug}`} className="eyebrow hover:text-maroon">{cat.name}</Link>
          <h1 className="mt-2 text-4xl sm:text-5xl">{product.name}</h1>
          {product.code ? (
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted">Product code · {product.code}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="font-display text-3xl text-maroon">{formatPrice(product.price)}</p>
            {!isAvailable && (
              <span className="inline-flex items-center rounded-full border border-maroon/20 bg-maroon/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-maroon">
                Out of Stock
              </span>
            )}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {isAvailable ? (
              <>
                <QuantitySelector value={qty} onChange={setQty} />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    add(product.id, qty);
                    trackAddToCart(product, qty);
                    setAdded(true);
                  }}
                >
                  Add to Cart
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled
                className="btn btn-outline h-12 cursor-not-allowed opacity-60 border-line text-muted hover:bg-transparent hover:text-muted hover:border-line"
              >
                Currently Unavailable
              </button>
            )}
          </div>
          <div role="status" aria-live="polite" className="mt-3 min-h-6 text-sm">
            {added && isAvailable && (
              <>
                Added to your bag.{" "}
                <Link to="/cart" className="font-medium text-maroon underline underline-offset-4">
                  View bag
                </Link>
              </>
            )}
          </div>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-ink/80">
            {isAvailable
              ? "Add this piece to your bag and send a booking request on WhatsApp. We'll confirm availability and details with you directly."
              : "This piece is currently unavailable. You may explore our other designs or contact us directly on WhatsApp to check when it will be back in stock."}
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
