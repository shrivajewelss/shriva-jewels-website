import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Search, X, ArrowRight } from "lucide-react";
import { products } from "../data/products.js";
import { formatPrice } from "../utils/currency.js";

export default function HeaderSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const containerRef = useRef(null);
  const desktopInputRef = useRef(null);
  const mobileInputRef = useRef(null);

  // Sync query if on /products page with a ?q= parameter
  useEffect(() => {
    if (location.pathname === "/products") {
      const q = searchParams.get("q") || searchParams.get("search") || "";
      setQuery(q);
    }
  }, [location.pathname, location.search]);

  // Close dropdown and mobile search on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  // Handle click outside to close dropdown & mobile search
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const term = query.trim().toLowerCase();

  // Filter matching products for live autosuggest
  const matchingProducts = useMemo(() => {
    if (!term) return [];
    return products
      .filter((p) => {
        const nameMatch = p.name && p.name.toLowerCase().includes(term);
        const codeMatch = p.code && p.code.toLowerCase().includes(term);
        const catMatch = p.category && p.category.toLowerCase().includes(term);
        return nameMatch || codeMatch || catMatch;
      })
      .slice(0, 5);
  }, [term]);

  const totalMatches = useMemo(() => {
    if (!term) return 0;
    return products.filter((p) => {
      const nameMatch = p.name && p.name.toLowerCase().includes(term);
      const codeMatch = p.code && p.code.toLowerCase().includes(term);
      const catMatch = p.category && p.category.toLowerCase().includes(term);
      return nameMatch || codeMatch || catMatch;
    }).length;
  }, [term]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    setDropdownOpen(false);
    setMobileSearchOpen(false);
    desktopInputRef.current?.blur();
    mobileInputRef.current?.blur();

    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/products?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/products");
    }
  };

  const handleSelectProduct = (productId) => {
    setDropdownOpen(false);
    setMobileSearchOpen(false);
    navigate(`/product/${productId}`);
  };

  const handleClear = () => {
    setQuery("");
    setDropdownOpen(false);
    if (location.pathname === "/products") {
      navigate("/products");
    }
    desktopInputRef.current?.focus();
    mobileInputRef.current?.focus();
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => mobileInputRef.current?.focus(), 50);
      }
      return next;
    });
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Mobile search toggle button (< md) */}
      <button
        type="button"
        onClick={toggleMobileSearch}
        aria-label={mobileSearchOpen ? "Close search bar" : "Open search bar"}
        className="flex h-10 w-10 items-center justify-center rounded-full text-maroon hover:bg-sand/60 transition-colors md:hidden"
      >
        {mobileSearchOpen ? <X size={20} strokeWidth={1.5} /> : <Search size={20} strokeWidth={1.5} />}
      </button>

      {/* Desktop Search Bar (md and up) */}
      <div className="hidden md:block relative w-44 lg:w-60">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <button
            type="submit"
            aria-label="Submit search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-maroon transition-colors"
          >
            <Search size={15} strokeWidth={1.8} />
          </button>
          <input
            ref={desktopInputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => {
              if (query.trim()) setDropdownOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setDropdownOpen(false);
                desktopInputRef.current?.blur();
              }
            }}
            placeholder="Search jewellery..."
            aria-label="Search jewellery"
            className="h-10 w-full rounded-full border border-line bg-white/90 pl-9 pr-8 text-xs lg:text-sm text-ink placeholder:text-muted/70 transition-all focus:border-maroon focus:bg-white focus:outline-none focus:ring-1 focus:ring-maroon"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search text"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-muted hover:bg-sand/60 hover:text-ink transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </form>

        {/* Desktop Live Results Dropdown */}
        {dropdownOpen && term && (
          <div className="absolute right-0 top-full z-50 mt-2 w-80 lg:w-96 rounded-2xl border border-line bg-[#faf5ee] p-2 shadow-2xl">
            <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
              <span>Pieces</span>
              <span>
                {totalMatches} {totalMatches === 1 ? "result" : "results"}
              </span>
            </div>

            {matchingProducts.length > 0 ? (
              <>
                <div className="max-h-72 overflow-y-auto divide-y divide-line/40">
                  {matchingProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProduct(p.id)}
                      className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-sand/60"
                    >
                      <img
                        src={p.image}
                        alt={`${p.name} - Shriva Jewels ${p.category || "jewellery"}`}
                        className="h-11 w-11 rounded-lg object-cover bg-white border border-line/50 shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-ink truncate group-hover:text-maroon transition-colors">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-muted truncate">
                          {p.code
                            ? `Code: ${p.code}`
                            : p.category
                            ? p.category.charAt(0).toUpperCase() + p.category.slice(1)
                            : ""}
                        </p>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-maroon shrink-0">
                        {formatPrice(p.price)}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-sand/60 py-2.5 text-xs font-medium text-maroon hover:bg-maroon hover:text-cream transition-colors"
                >
                  <span>
                    View all {totalMatches} results for &ldquo;{query.trim()}&rdquo;
                  </span>
                  <ArrowRight size={13} />
                </button>
              </>
            ) : (
              <div className="py-6 text-center text-xs sm:text-sm text-muted">
                <p>
                  No jewellery found matching &ldquo;
                  <span className="font-medium text-ink">{query.trim()}</span>&rdquo;
                </p>
                <p className="text-[11px] text-muted/70 mt-1">Press enter to view all pieces</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Slide-down search bar (< md) */}
      {mobileSearchOpen && (
        <div className="fixed inset-x-0 top-16 z-40 border-b border-line bg-[#faf5ee] px-4 py-3 shadow-lg md:hidden">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-maroon transition-colors"
            >
              <Search size={16} strokeWidth={1.8} />
            </button>
            <input
              ref={mobileInputRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setDropdownOpen(true);
              }}
              placeholder="Search by name, code or category..."
              aria-label="Search jewellery"
              className="h-11 w-full rounded-full border border-line bg-white pl-10 pr-9 text-sm text-ink placeholder:text-muted/70 focus:border-maroon focus:outline-none focus:ring-1 focus:ring-maroon"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-muted hover:bg-sand/60 hover:text-ink transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </form>

          {/* Mobile Live Results */}
          {term && (
            <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-line bg-cream p-1.5 divide-y divide-line/40">
              {matchingProducts.length > 0 ? (
                <>
                  {matchingProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProduct(p.id)}
                      className="flex w-full items-center gap-3 p-2 text-left hover:bg-sand/60 rounded-lg"
                    >
                      <img
                        src={p.image}
                        alt={`${p.name} - Shriva Jewels ${p.category || "jewellery"}`}
                        className="h-10 w-10 rounded object-cover bg-white border border-line/50 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink truncate">{p.name}</p>
                        <p className="text-[11px] text-muted">
                          {p.code ? `Code: ${p.code}` : p.category}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-maroon shrink-0">
                        {formatPrice(p.price)}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="mt-1 flex w-full items-center justify-center gap-1.5 py-2 text-xs font-medium text-maroon"
                  >
                    <span>View all {totalMatches} results</span>
                    <ArrowRight size={13} />
                  </button>
                </>
              ) : (
                <div className="py-4 text-center text-xs text-muted">
                  No jewellery found matching &ldquo;{query.trim()}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

