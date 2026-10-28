import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { products } from "../data/products.js";
import { categories } from "../data/categories.js";
import ProductGrid from "../components/ProductGrid.jsx";
import EmptyState from "../components/EmptyState.jsx";

/** Shared listing used by /products and /category/:slug (search, category pills, sort, count). */
export default function Collection({ title, category }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("catalogue");

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    let out = products.filter((p) => (!category || p.category === category) && (!term || p.name.toLowerCase().includes(term) || p.code.includes(term)));
    if (sort === "asc") out = [...out].sort((a, b) => a.price - b.price);
    if (sort === "desc") out = [...out].sort((a, b) => b.price - a.price);
    return out;
  }, [q, sort, category]);

  const pill = (active) => `rounded-full border px-4 py-2 text-sm transition-colors ${active ? "border-maroon bg-maroon text-cream" : "border-line text-ink hover:border-maroon hover:text-maroon"}`;

  return (
    <div className="container-page pt-12 sm:pt-16">
      <p className="eyebrow">Shriva Jewels</p>
      <h1 className="mt-2 text-5xl sm:text-6xl">{title}</h1>
      <nav aria-label="Filter by category" className="mt-8 flex flex-wrap gap-2">
        <Link to="/products" className={pill(!category)} aria-current={!category ? "page" : undefined}>All</Link>
        {categories.map((c) => <Link key={c.slug} to={`/category/${c.slug}`} className={pill(category === c.slug)} aria-current={category === c.slug ? "page" : undefined}>{c.name}</Link>)}
      </nav>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or code" aria-label="Search by name or code" className="field pl-10" />
        </div>
        <div className="flex items-center gap-4 text-sm">
          <p className="text-muted" role="status">{list.length} {list.length === 1 ? "piece" : "pieces"}</p>
          <label className="flex items-center gap-2">
            <span className="text-muted">Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 rounded-lg border border-line bg-white px-3 text-sm focus:border-maroon">
              <option value="catalogue">Catalogue order</option>
              <option value="asc">Price: low to high</option>
              <option value="desc">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>
      <div className="mt-8">
        {list.length ? <ProductGrid products={list} eagerCount={4} /> : (
          <EmptyState title="No pieces found">
            <p>Try a different name or code{q ? <> — nothing matched “{q}”</> : null}.</p>
            {q && <button type="button" onClick={() => setQ("")} className="btn btn-outline mt-6">Clear search</button>}
          </EmptyState>
        )}
      </div>
    </div>
  );
}
