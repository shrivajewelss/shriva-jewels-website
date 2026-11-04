import { Link } from "react-router-dom";

export default function CategoryCard({ category }) {
  return (
    <Link to={`/category/${category.slug}`} className="group relative block overflow-hidden rounded-lg bg-sand">
      <img src={`https://shriva-jewels.vercel.app${category.image}`} alt={category.name} loading="lazy" width="800" height="1067" className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-[var(--ease)] group-hover:scale-105" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-14 text-cream">
        <h3 className="font-display text-2xl !text-cream">{category.name}</h3>
        <p className="mt-0.5 text-xs text-cream/90">{category.description}</p>
      </div>
    </Link>
  );
}
