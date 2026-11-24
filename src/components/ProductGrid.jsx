import ProductCard from "./ProductCard.jsx";

export default function ProductGrid({ products = [], eagerCount = 0 }) {
  const safeProducts = (products || []).filter(Boolean);
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
      {safeProducts.map((p, i) => (
        <li key={p.id || i}>
          <ProductCard product={p} priority={i < eagerCount} />
        </li>
      ))}
    </ul>
  );
}
