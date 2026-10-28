import { categories } from "../data/categories.js";
import CategoryCard from "./CategoryCard.jsx";

export default function CategorySection() {
  return (
    <section id="collections" className="container-page scroll-mt-28 pt-20" aria-labelledby="cat-h">
      <p className="eyebrow text-center">Shop by category</p>
      <h2 id="cat-h" className="mt-2 text-center text-4xl sm:text-5xl">Find Your Piece</h2>
      <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {categories.map((c) => <li key={c.slug}><CategoryCard category={c} /></li>)}
      </ul>
    </section>
  );
}
