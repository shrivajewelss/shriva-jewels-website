import { Link } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext.jsx";
import ProductGrid from "./ProductGrid.jsx";

export default function FeaturedSection() {
  const { products } = useCatalog();
  const featuredProducts = products.filter((p) => p.isFeatured);
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
