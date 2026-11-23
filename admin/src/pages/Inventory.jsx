import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Boxes, AlertTriangle, ArrowUpDown, History, Search } from "lucide-react";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import Button from "../components/Button.jsx";
import Badge from "../components/Badge.jsx";
import {
  getInventoryList,
  adjustStock,
  getStockMovements,
  LOW_STOCK_THRESHOLD,
} from "../services/inventory.js";
import { formatDateTime } from "../utils/date.js";

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("levels"); // "levels" or "history"
  const [searchParams] = useSearchParams();

  // Adjustment modal state
  const [adjustModal, setAdjustModal] = useState({
    open: false,
    item: null,
    newQuantity: 0,
    movementType: "manual_adjustment",
    reason: "",
    saving: false,
    error: null,
  });

  const loadData = async () => {
    setLoading(true);
    const lowStockFilter = searchParams.get("filter") === "low";
    const [invRes, movRes] = await Promise.all([
      getInventoryList({ lowStockOnly: lowStockFilter }),
      getStockMovements(null, 50),
    ]);

    if (invRes.data) setInventory(invRes.data);
    if (movRes.data) setMovements(movRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  const handleOpenAdjust = (item) => {
    setAdjustModal({
      open: true,
      item,
      newQuantity: item.quantity,
      movementType: "manual_adjustment",
      reason: "",
      saving: false,
      error: null,
    });
  };

  const handleSaveAdjust = async (e) => {
    e.preventDefault();
    if (!adjustModal.item) return;

    setAdjustModal((prev) => ({ ...prev, saving: true, error: null }));

    const res = await adjustStock({
      productId: adjustModal.item.product_id,
      newQuantity: adjustModal.newQuantity,
      movementType: adjustModal.movementType,
      reason: adjustModal.reason,
    });

    if (res.error) {
      setAdjustModal((prev) => ({ ...prev, saving: false, error: res.error }));
    } else {
      setAdjustModal((prev) => ({ ...prev, open: false, saving: false }));
      loadData();
    }
  };

  const inventoryColumns = [
    {
      header: "Product",
      accessor: "product_name",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-ink truncate">{row.product_name}</p>
          <p className="text-xs text-muted">SKU: {row.sku} · {row.category_name}</p>
        </div>
      ),
    },
    {
      header: "Current Stock",
      accessor: "quantity",
      sortable: true,
      render: (row) => (
        <span
          className={`font-display font-bold text-base px-2.5 py-0.5 rounded ${
            row.quantity === 0
              ? "bg-red-100 text-red-800"
              : row.quantity <= LOW_STOCK_THRESHOLD
              ? "bg-amber-100 text-amber-800"
              : "text-emerald-800"
          }`}
        >
          {row.quantity} units
        </span>
      ),
    },
    {
      header: "Stock Alert",
      accessor: "is_low_stock",
      render: (row) =>
        row.quantity === 0 ? (
          <Badge variant="red">Out of Stock</Badge>
        ) : row.quantity <= LOW_STOCK_THRESHOLD ? (
          <Badge variant="amber">Low Stock Warning</Badge>
        ) : (
          <Badge variant="emerald">Healthy</Badge>
        ),
    },
    {
      header: "Last Updated",
      accessor: "updated_at",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-muted">{formatDateTime(row.updated_at)}</span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleOpenAdjust(row)}
          icon={ArrowUpDown}
        >
          Adjust Stock
        </Button>
      ),
    },
  ];

  const movementColumns = [
    {
      header: "Date & Time",
      accessor: "created_at",
      sortable: true,
      render: (row) => <span className="text-xs text-muted">{formatDateTime(row.created_at)}</span>,
    },
    {
      header: "Product",
      accessor: "products.name",
      render: (row) => (
        <div>
          <p className="font-medium text-ink truncate">{row.products?.name || `Product (${row.product_id})`}</p>
          <p className="text-[11px] text-muted">{row.products?.sku || "—"}</p>
        </div>
      ),
    },
    {
      header: "Movement Type",
      accessor: "movement_type",
      render: (row) => (
        <span className="font-mono text-xs uppercase tracking-wide bg-sand/60 px-2.5 py-1 rounded">
          {row.movement_type.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "Previous",
      accessor: "previous_stock",
      align: "center",
      render: (row) => <span className="text-xs text-muted">{row.previous_stock ?? 0}</span>,
    },
    {
      header: "New Quantity",
      accessor: "new_stock",
      align: "center",
      render: (row) => {
        const diff = (row.new_stock ?? 0) - (row.previous_stock ?? 0);
        return (
          <div className="inline-flex items-center gap-1.5 font-display font-medium text-sm">
            <span>{row.new_stock}</span>
            <span className={`text-xs ${diff >= 0 ? "text-emerald-700" : "text-red-700"}`}>
              ({diff >= 0 ? `+${diff}` : diff})
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Inventory Management</h1>
          <p className="text-xs text-muted mt-1">
            Real-time item quantities, stock adjustments, safety thresholds, and audit trails.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center rounded-xl border border-line bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("levels")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "levels"
                ? "bg-maroon text-cream shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            <Boxes size={15} />
            <span>Stock Levels</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "history"
                ? "bg-maroon text-cream shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            <History size={15} />
            <span>Movement History</span>
          </button>
        </div>
      </div>

      {activeTab === "levels" ? (
        <DataTable
          columns={inventoryColumns}
          data={inventory}
          loading={loading}
          searchPlaceholder="Search product name, SKU, category..."
          emptyMessage="No inventory records found."
        />
      ) : (
        <DataTable
          columns={movementColumns}
          data={movements}
          loading={loading}
          searchPlaceholder="Search movements..."
          emptyMessage="No stock movements recorded yet."
        />
      )}

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={adjustModal.open}
        onClose={() => setAdjustModal((prev) => ({ ...prev, open: false }))}
        title="Adjust Stock Quantity"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveAdjust} className="space-y-4">
          {adjustModal.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              {adjustModal.error}
            </div>
          )}

          <div className="rounded-xl border border-line bg-cream/40 p-4">
            <p className="text-xs text-muted uppercase font-medium">Selected Product</p>
            <p className="font-display text-lg font-semibold text-ink mt-0.5">
              {adjustModal.item?.product_name}
            </p>
            <p className="text-xs text-muted mt-1">
              Current Available Quantity:{" "}
              <span className="font-bold text-maroon">{adjustModal.item?.quantity} units</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
              New Total Quantity (Units) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={adjustModal.newQuantity}
              onChange={(e) =>
                setAdjustModal({ ...adjustModal, newQuantity: e.target.value })
              }
              className="w-full rounded-lg border border-line px-3 py-2 text-base font-semibold text-ink focus:border-maroon focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
              Reason / Movement Type
            </label>
            <select
              value={adjustModal.movementType}
              onChange={(e) =>
                setAdjustModal({ ...adjustModal, movementType: e.target.value })
              }
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
            >
              <option value="manual_adjustment">Manual Inventory Adjustment</option>
              <option value="physical_audit">Physical Audit / Count Correction</option>
              <option value="damaged_stock">Damaged / Defective Stock</option>
              <option value="return_intake">Customer Return Intake</option>
              <option value="other">Other Internal Reason</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
              Audit Notes / Reference
            </label>
            <textarea
              rows={2}
              value={adjustModal.reason}
              onChange={(e) =>
                setAdjustModal({ ...adjustModal, reason: e.target.value })
              }
              placeholder="e.g. Physical inventory count verified in Surat workshop"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <Button
              variant="outline"
              onClick={() => setAdjustModal((prev) => ({ ...prev, open: false }))}
            >
              Cancel
            </Button>
            <Button type="submit" loading={adjustModal.saving}>
              Confirm Stock Update
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
