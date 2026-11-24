import { Link } from "react-router-dom";
import { products, productsById } from "../data/products.js";
import ProductGrid from "./ProductGrid.jsx";

// Featured pieces from the active catalogue
const FEATURED = ["p65", "p66", "p70", "p71", "p83", "p84", "p86", "p88"];

export default function FeaturedSection() {
  const featuredProducts = FEATURED.map((id) => productsById[id]).filter(Boolean);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8);

  return (
    <section className="container-page pt-24" aria-labelledby="feat-h">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Handpicked</p>
          <h2 id="feat-h" className="mt-2 text-4xl sm:text-5xl">Featured Jewellery</h2>
        </div>
        <Link to="/products" className="text-sm font-medium text-maroon underline-offset-4 hover:underline">View all {products.length} pieces</Link>
      </div>
      <div className="mt-10"><ProductGrid products={displayProducts} /></div>
    </section>
  );
}
