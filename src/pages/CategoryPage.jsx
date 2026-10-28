import { useParams } from "react-router-dom";
import { categoriesBySlug } from "../data/categories.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import Collection from "./Collection.jsx";
import NotFound from "./NotFound.jsx";

export default function CategoryPage() {
  const { categorySlug } = useParams();
  const cat = categoriesBySlug[categorySlug];
  usePageMeta({ title: cat ? `${cat.name} — Shriva Jewels` : "Page not found — Shriva Jewels", description: cat ? `Shop ${cat.name.toLowerCase()} from Shriva Jewels: ${cat.description.toLowerCase()}.` : undefined, path: cat ? `/category/${cat.slug}` : undefined, noindex: !cat });
  if (!cat) return <NotFound />;
  // key resets search/sort when switching category
  return <Collection key={cat.slug} title={cat.name} category={cat.slug} />;
}
