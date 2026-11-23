import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, ArrowUpDown } from "lucide-react";

export default function DataTable({
  columns,
  data = [],
  searchable = true,
  searchPlaceholder = "Search records...",
  itemsPerPage = 10,
  loading = false,
  emptyMessage = "No records found.",
  onRowClick,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  // Filtering
  const filtered = data.filter((row) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(row).some((val) => {
      if (val === null || val === undefined) return false;
      if (typeof val === "object") return false;
      return String(val).toLowerCase().includes(term);
    });
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (valA === valB) return 0;
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;
    if (typeof valA === "number" && typeof valB === "number") {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
    return sortOrder === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-line bg-white pl-9 pr-4 py-2 text-sm text-ink placeholder:text-muted focus:border-maroon focus:outline-none shadow-sm"
            />
          </div>
          <p className="text-xs text-muted whitespace-nowrap">
            Showing {filtered.length} {filtered.length === 1 ? "record" : "records"}
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-card">
        <table className="w-full text-left text-sm text-ink">
          <thead className="border-b border-line bg-cream/60 text-xs font-medium uppercase tracking-wider text-muted">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-5 py-3.5 ${col.sortable ? "cursor-pointer select-none hover:text-maroon" : ""} ${
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""
                  }`}
                  onClick={() => col.sortable && col.accessor && handleSort(col.accessor)}
                >
                  <div className={`inline-flex items-center gap-1.5 ${col.align === "right" ? "justify-end" : ""}`}>
                    <span>{col.header}</span>
                    {col.sortable && <ArrowUpDown size={12} className="opacity-60" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-muted">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-maroon border-t-transparent" />
                  <p className="mt-2 text-xs">Loading records...</p>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-muted text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, rIdx) => (
                <tr
                  key={row.id || rIdx}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors ${onRowClick ? "cursor-pointer hover:bg-sand/30" : "hover:bg-sand/10"}`}
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className={`px-5 py-3.5 ${
                        col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""
                      }`}
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2 text-xs text-muted">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white hover:border-maroon disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white hover:border-maroon disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
