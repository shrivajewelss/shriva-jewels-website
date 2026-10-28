import ProductCard from "./ProductCard.jsx";

export default function ProductGrid({ products, eagerCount = 0 }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
      {products.map((p, i) => <li key={p.id}><ProductCard product={p} priority={i < eagerCount} /></li>)}
    </ul>
  );
}
