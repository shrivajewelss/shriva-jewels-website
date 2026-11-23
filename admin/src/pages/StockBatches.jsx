import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layers, Plus, Trash2, Eye, Receipt, Calendar, Building2 } from "lucide-react";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import Button from "../components/Button.jsx";
import Badge from "../components/Badge.jsx";
import Card from "../components/Card.jsx";
import { getStockBatches, getStockBatchById, createStockBatch } from "../services/batches.js";
import { getProducts } from "../services/products.js";
import { formatCurrency } from "../utils/currency.js";
import { formatDate } from "../utils/date.js";

export default function StockBatches() {
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Create batch modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [batchForm, setBatchForm] = useState({
    batch_number: "",
    supplier_name: "",
    invoice_reference: "",
    purchase_date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [batchLines, setBatchLines] = useState([
    { product_id: "", quantity: 10, purchase_cost: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // View batch detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [batchesRes, prodsRes] = await Promise.all([
      getStockBatches(),
      getProducts(),
    ]);
    if (batchesRes.data) setBatches(batchesRes.data);
    if (prodsRes.data) setProducts(prodsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      handleOpenCreate();
      setSearchParams({});
    }
  }, [searchParams]);

  const handleOpenCreate = () => {
    const nextNum = `BATCH-${new Date().getFullYear()}-${String(batches.length + 1).padStart(3, "0")}`;
    setBatchForm({
      batch_number: nextNum,
      supplier_name: "",
      invoice_reference: "",
      purchase_date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setBatchLines([{ product_id: products[0]?.id || "", quantity: 10, purchase_cost: 0 }]);
    setFormError(null);
    setCreateModalOpen(true);
  };

  const handleAddLine = () => {
    setBatchLines([...batchLines, { product_id: products[0]?.id || "", quantity: 5, purchase_cost: 0 }]);
  };

  const handleRemoveLine = (idx) => {
    if (batchLines.length === 1) return;
    setBatchLines(batchLines.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx, field, val) => {
    const updated = [...batchLines];
    updated[idx][field] = val;
    setBatchLines(updated);
  };

  const handleSaveBatch = async (e) => {
    e.preventDefault();
    if (!batchForm.batch_number || !batchForm.supplier_name) {
      setFormError("Batch number and supplier name are required.");
      return;
    }

    const invalidLine = batchLines.find((l) => !l.product_id || l.quantity <= 0);
    if (invalidLine) {
      setFormError("All line items must select a product and have a quantity greater than 0.");
      return;
    }

    setSaving(true);
    setFormError(null);

    const res = await createStockBatch({
      ...batchForm,
      items: batchLines,
    });

    if (res.error) {
      setFormError(res.error);
      setSaving(false);
    } else {
      setSaving(false);
      setCreateModalOpen(false);
      loadData();
    }
  };

  const handleViewBatch = async (batchId) => {
    setLoadingDetail(true);
    setDetailModalOpen(true);
    const res = await getStockBatchById(batchId);
    if (res.data) setSelectedBatch(res.data);
    setLoadingDetail(false);
  };

  const batchColumns = [
    {
      header: "Batch #",
      accessor: "batch_number",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-sm text-maroon">{row.batch_number}</span>
      ),
    },
    {
      header: "Supplier",
      accessor: "supplier_name",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-ink">{row.supplier_name}</p>
          <p className="text-xs text-muted">Ref: {row.invoice_reference || "—"}</p>
        </div>
      ),
    },
    {
      header: "Purchase Date",
      accessor: "purchase_date",
      sortable: true,
      render: (row) => <span className="text-xs text-muted">{formatDate(row.purchase_date)}</span>,
    },
    {
      header: "Products Count",
      accessor: "items_count",
      align: "center",
      render: (row) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sand/60">
          {row.items_count} items ({row.total_units} pcs)
        </span>
      ),
    },
    {
      header: "Total Cost",
      accessor: "total_cost",
      sortable: true,
      align: "right",
      render: (row) => (
        <span className="font-display font-semibold text-base text-ink">
          {formatCurrency(row.total_cost)}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleViewBatch(row.id)}
          icon={Eye}
        >
          View Batch
        </Button>
      ),
    },
  ];

  const totalCalculatedBatchCost = batchLines.reduce(
    (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.purchase_cost) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Stock Batches</h1>
          <p className="text-xs text-muted mt-1">
            Supplier restock intakes, cost per unit tracking, and FIFO batch auditing.
          </p>
        </div>
        <Button onClick={handleOpenCreate} icon={Plus}>
          New Stock Batch
        </Button>
      </div>

      {/* Batches Table */}
      <DataTable
        columns={batchColumns}
        data={batches}
        loading={loading}
        searchPlaceholder="Search by batch #, supplier, invoice..."
        emptyMessage="No stock batches recorded yet. Click 'New Stock Batch' to log your first intake."
      />

      {/* Create Stock Batch Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Stock Batch Intake"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSaveBatch} className="space-y-6">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              {formError}
            </div>
          )}

          {/* Batch Meta Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-line bg-cream/40 p-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Batch Number *
              </label>
              <input
                type="text"
                required
                value={batchForm.batch_number}
                onChange={(e) => setBatchForm({ ...batchForm, batch_number: e.target.value })}
                placeholder="e.g. BATCH-2026-001"
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Supplier Name *
              </label>
              <input
                type="text"
                required
                value={batchForm.supplier_name}
                onChange={(e) => setBatchForm({ ...batchForm, supplier_name: e.target.value })}
                placeholder="e.g. Surat Artisan Guild"
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Invoice / Bill Reference
              </label>
              <input
                type="text"
                value={batchForm.invoice_reference}
                onChange={(e) => setBatchForm({ ...batchForm, invoice_reference: e.target.value })}
                placeholder="e.g. INV-9842"
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Purchase Date *
              </label>
              <input
                type="date"
                required
                value={batchForm.purchase_date}
                onChange={(e) => setBatchForm({ ...batchForm, purchase_date: e.target.value })}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Batch Notes
              </label>
              <input
                type="text"
                value={batchForm.notes}
                onChange={(e) => setBatchForm({ ...batchForm, notes: e.target.value })}
                placeholder="e.g. Diwali festive restock pieces with special plating"
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>
          </div>

          {/* Products in this Batch */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-xl font-semibold text-ink">Batch Line Items</h3>
              <Button type="button" size="sm" variant="outline" onClick={handleAddLine} icon={Plus}>
                Add Product Line
              </Button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-cream/60 text-xs font-medium uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3 w-32">Intake Qty</th>
                    <th className="px-4 py-3 w-36">Purchase Cost (₹)</th>
                    <th className="px-4 py-3 w-32 text-right">Line Subtotal</th>
                    <th className="px-3 py-3 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {batchLines.map((line, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3">
                        <select
                          required
                          value={line.product_id}
                          onChange={(e) => handleLineChange(idx, "product_id", e.target.value)}
                          className="w-full rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ink focus:border-maroon focus:outline-none"
                        >
                          <option value="">Select a Product</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Selling: ₹{p.price})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          required
                          min="1"
                          value={line.quantity}
                          onChange={(e) => handleLineChange(idx, "quantity", e.target.value)}
                          className="w-full rounded-lg border border-line px-3 py-1.5 text-xs text-ink focus:border-maroon focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={line.purchase_cost}
                          onChange={(e) => handleLineChange(idx, "purchase_cost", e.target.value)}
                          className="w-full rounded-lg border border-line px-3 py-1.5 text-xs text-ink focus:border-maroon focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-display font-medium text-ink">
                        {formatCurrency((Number(line.quantity) || 0) * (Number(line.purchase_cost) || 0))}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          disabled={batchLines.length === 1}
                          onClick={() => handleRemoveLine(idx)}
                          className="p-1 text-muted hover:text-red-700 disabled:opacity-30"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total batch cost summary */}
            <div className="flex justify-end pt-3 text-sm">
              <span className="text-muted mr-3">Total Batch Valuation:</span>
              <span className="font-display text-xl font-bold text-maroon">
                {formatCurrency(totalCalculatedBatchCost)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Confirm &amp; Intake Batch
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Batch Details Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedBatch ? `Batch Details: ${selectedBatch.batch_number}` : "Batch Details"}
        maxWidth="max-w-3xl"
      >
        {loadingDetail ? (
          <div className="py-12 text-center text-muted">Loading batch details...</div>
        ) : selectedBatch ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-xl border border-line bg-cream/40 p-4 text-xs">
              <div>
                <p className="text-muted uppercase">Supplier</p>
                <p className="font-semibold text-ink text-sm mt-0.5">{selectedBatch.supplier_name}</p>
              </div>
              <div>
                <p className="text-muted uppercase">Invoice Ref</p>
                <p className="font-semibold text-ink text-sm mt-0.5">{selectedBatch.invoice_reference || "—"}</p>
              </div>
              <div>
                <p className="text-muted uppercase">Purchase Date</p>
                <p className="font-semibold text-ink text-sm mt-0.5">{formatDate(selectedBatch.purchase_date)}</p>
              </div>
              <div>
                <p className="text-muted uppercase">Total Cost</p>
                <p className="font-display font-bold text-maroon text-base mt-0.5">
                  {formatCurrency(selectedBatch.total_cost)}
                </p>
              </div>
            </div>

            {selectedBatch.notes && (
              <p className="text-xs text-muted italic">Notes: {selectedBatch.notes}</p>
            )}

            <div className="rounded-xl border border-line bg-white overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-cream/60 text-xs font-medium uppercase text-muted">
                  <tr>
                    <th className="px-4 py-3">Product Piece</th>
                    <th className="px-4 py-3 text-center">Intake Units</th>
                    <th className="px-4 py-3 text-center">Remaining Units</th>
                    <th className="px-4 py-3 text-right">Unit Purchase Cost</th>
                    <th className="px-4 py-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {selectedBatch.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-ink">
                        {item.product_name}
                      </td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-800">
                        {item.remaining_quantity}
                      </td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.purchase_cost)}</td>
                      <td className="px-4 py-3 text-right font-display font-medium text-maroon">
                        {formatCurrency(item.subtotal_cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
