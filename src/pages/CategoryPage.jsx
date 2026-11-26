import { useParams } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import LoadingState from "../components/LoadingState.jsx";
import Collection from "./Collection.jsx";
import NotFound from "./NotFound.jsx";

export default function CategoryPage() {
  const { categorySlug } = useParams();
  const { categoriesBySlug, loading } = useCatalog();
  const cat = categoriesBySlug[categorySlug];
  usePageMeta({
    title: cat ? `${cat.name} — Shriva Jewels` : "Page not found — Shriva Jewels",
    description: cat ? `Shop ${cat.name.toLowerCase()} from Shriva Jewels${cat.description ? `: ${cat.description.toLowerCase()}` : ""}. Handcrafted anti-tarnish pieces.` : undefined,
    keywords: cat
      ? `${cat.name.toLowerCase()}, buy ${cat.name.toLowerCase()} online, ${cat.name.toLowerCase()} for women India, latest ${cat.name.toLowerCase()} designs, trendy ${cat.name.toLowerCase()}, Shriva Jewels ${cat.name.toLowerCase()}`
      : undefined,
    path: cat ? `/category/${cat.slug}` : undefined,
    noindex: !loading && !cat,
  });
  if (loading && !cat) return <LoadingState label="Loading collection…" />;
  if (!cat) return <NotFound />;
  // key resets search/sort when switching category
  return <Collection key={cat.slug} title={cat.name} category={cat.slug} />;
}
