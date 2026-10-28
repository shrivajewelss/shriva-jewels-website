import { Link } from "react-router-dom";
import { products, productsById } from "../data/products.js";
import ProductGrid from "./ProductGrid.jsx";

// The eight pieces featured on the live homepage, in the same order.
const FEATURED = ["1129685-p02", "1154807-p04", "1167429-p09", "1172807-p16", "1186563-p22", "1170807-p27", "1136477-p34", "1134892-p42"];

export default function FeaturedSection() {
  return (
    <section className="container-page pt-24" aria-labelledby="feat-h">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Handpicked</p>
          <h2 id="feat-h" className="mt-2 text-4xl sm:text-5xl">Featured Jewellery</h2>
        </div>
        <Link to="/products" className="text-sm font-medium text-maroon underline-offset-4 hover:underline">View all {products.length} pieces</Link>
      </div>
      <div className="mt-10"><ProductGrid products={FEATURED.map((id) => productsById[id])} /></div>
    </section>
  );
}
