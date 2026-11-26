import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";

const CatalogContext = createContext(null);

function mapSupabaseCatalog(rawCategories = [], rawProducts = []) {
  const mappedCategories = rawCategories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description || "",
    image: c.image_url || "",
    sort_order: c.sort_order ?? 0,
  }));

  const categoryById = Object.fromEntries(mappedCategories.map((c) => [c.id, c]));

  const mappedProducts = rawProducts.map((p) => {
    const cat = categoryById[p.category_id];
    const basePrice = Number(p.price) || 0;
    const salePrice = p.sale_price != null ? Number(p.sale_price) : null;
    const effectivePrice = salePrice != null ? salePrice : basePrice;
    // Use slug as the stable public-facing id so URLs, cart keys, and
    // server-side validation all stay consistent with the static fallback data.
    const stableId = p.slug || p.id;

    return {
      id: stableId,
      _uuid: p.id,
      slug: p.slug || stableId,
      name: p.name,
      code: p.sku || "",
      sku: p.sku || "",
      description: p.description || "",
      price: effectivePrice,
      originalPrice: salePrice != null && salePrice < basePrice ? basePrice : null,
      category: cat?.slug || "jewellery",
      categoryName: cat?.name || "Jewellery",
      category_id: p.category_id,
      image: p.image_url || "",
      isFeatured: Boolean(p.is_featured),
      units: p.units ?? 0,
      inStock: (p.units ?? 0) > 0,
      created_at: p.created_at,
    };
  });

  return { mappedCategories, mappedProducts };
}

export function CatalogProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(null);

  const fetchCatalog = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    try {
      const [catRes, prodRes] = await Promise.all([
        supabase
          .from("categories")
          .select("id, name, slug, description, image_url, is_active, sort_order")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("products")
          .select("id, category_id, name, slug, description, sku, price, sale_price, status, is_featured, units, image_url, created_at")
          .eq("status", "active")
          .order("created_at", { ascending: false }),
      ]);

      if (catRes.error) throw catRes.error;
      if (prodRes.error) throw prodRes.error;

      const { mappedCategories, mappedProducts } = mapSupabaseCatalog(
        catRes.data || [],
        prodRes.data || []
      );
      setCategories(mappedCategories);
      setProducts(mappedProducts);
      setError(null);
    } catch (err) {
      console.warn("Failed to load live Supabase catalog:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();

    if (!isSupabaseConfigured || !supabase) return undefined;

    // Subscribe to realtime changes from admin.shriva.store
    const channel = supabase
      .channel("storefront-catalog-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => fetchCatalog()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        () => fetchCatalog()
      )
      .subscribe();

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        fetchCatalog();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchCatalog();
      }
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      clearInterval(intervalId);
    };
  }, [fetchCatalog]);

  const value = useMemo(() => {
    const categoriesBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));
    const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
    const productsBySlug = Object.fromEntries(
      products.filter((p) => p.slug).map((p) => [p.slug, p])
    );

    return {
      categories,
      categoriesBySlug,
      products,
      productsById,
      findProduct: (idOrSlug) => productsById[idOrSlug] || productsBySlug[idOrSlug] || null,
      loading,
      error,
      refreshCatalog: fetchCatalog,
    };
  }, [categories, products, loading, error, fetchCatalog]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return ctx;
}
