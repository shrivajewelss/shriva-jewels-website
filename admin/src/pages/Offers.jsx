import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Edit2, Tag, Check, X, Percent, IndianRupee } from "lucide-react";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import Button from "../components/Button.jsx";
import Badge from "../components/Badge.jsx";
import { getOffers, createOffer, updateOffer, toggleOfferStatus } from "../services/offers.js";
import { formatCurrency } from "../utils/currency.js";
import { formatDate } from "../utils/date.js";

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "",
    max_discount_amount: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    is_active: true,
    usage_limit: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const res = await getOffers();
    if (res.data) setOffers(res.data);
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
    setEditingOffer(null);
    setFormData({
      code: "",
      title: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      min_order_amount: 0,
      max_discount_amount: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      is_active: true,
      usage_limit: "",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      code: offer.code || "",
      title: offer.title || "",
      description: offer.description || "",
      discount_type: offer.discount_type || "percentage",
      discount_value: offer.discount_value || "",
      min_order_amount: offer.min_order_amount || 0,
      max_discount_amount: offer.max_discount_amount || "",
      start_date: offer.start_date ? offer.start_date.split("T")[0] : "",
      end_date: offer.end_date ? offer.end_date.split("T")[0] : "",
      is_active: offer.is_active ?? true,
      usage_limit: offer.usage_limit || "",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.title || !formData.discount_value) {
      setFormError("Coupon code, title, and discount value are required.");
      return;
    }

    setSaving(true);
    setFormError(null);

    let res;
    if (editingOffer) {
      res = await updateOffer(editingOffer.id, formData);
    } else {
      res = await createOffer(formData);
    }

    if (res.error) {
      setFormError(res.error);
      setSaving(false);
    } else {
      setSaving(false);
      setModalOpen(false);
      loadData();
    }
  };

  const handleToggle = async (id, currentStatus) => {
    await toggleOfferStatus(id, currentStatus);
    loadData();
  };

  const columns = [
    {
      header: "Coupon Code",
      accessor: "code",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Tag size={15} className="text-maroon shrink-0" />
          <span className="font-mono font-bold text-sm text-maroon">{row.code}</span>
        </div>
      ),
    },
    {
      header: "Campaign Title",
      accessor: "title",
      render: (row) => (
        <div>
          <p className="font-medium text-ink">{row.title}</p>
          {row.description && <p className="text-xs text-muted truncate max-w-xs">{row.description}</p>}
        </div>
      ),
    },
    {
      header: "Discount",
      accessor: "discount_value",
      sortable: true,
      render: (row) => (
        <span className="font-display font-semibold text-base text-ink">
          {row.discount_type === "percentage" ? `${row.discount_value}% OFF` : `₹${row.discount_value} OFF`}
        </span>
      ),
    },
    {
      header: "Min Order",
      accessor: "min_order_amount",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-muted">
          {row.min_order_amount > 0 ? formatCurrency(row.min_order_amount) : "No minimum"}
        </span>
      ),
    },
    {
      header: "Validity",
      accessor: "start_date",
      render: (row) => (
        <div className="text-xs text-muted">
          <p>From: {formatDate(row.start_date)}</p>
          <p>To: {row.end_date ? formatDate(row.end_date) : "Ongoing"}</p>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "is_active",
      render: (row) => (
        <Badge variant={row.is_active ? "emerald" : "gray"}>
          {row.is_active ? "Active" : "Disabled"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => handleToggle(row.id, row.is_active)}
            className="p-1.5 text-muted hover:text-maroon rounded hover:bg-sand/40 transition-colors"
            title={row.is_active ? "Disable offer" : "Enable offer"}
          >
            {row.is_active ? <X size={15} /> : <Check size={15} />}
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-muted hover:text-maroon rounded hover:bg-sand/40 transition-colors"
            title="Edit offer"
          >
            <Edit2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Offers &amp; Discounts</h1>
          <p className="text-xs text-muted mt-1">
            Create coupon codes, percentage reductions, promotional campaigns, and cart thresholds.
          </p>
        </div>
        <Button onClick={handleOpenCreate} icon={Plus}>
          Create Offer
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={offers}
        loading={loading}
        searchPlaceholder="Search coupon code or campaign..."
        emptyMessage="No promotional offers created yet."
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingOffer ? "Edit Promotional Offer" : "Create New Promotional Offer"}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. FESTIVE10"
                className="w-full rounded-lg border border-line px-3 py-2 text-sm font-mono font-bold text-ink uppercase focus:border-maroon focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Discount Type
              </label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              >
                <option value="percentage">Percentage Discount (%)</option>
                <option value="fixed">Fixed Amount Discount (₹)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
              Campaign Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Festive Launch 10% Off"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Discount Value *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                placeholder={formData.discount_type === "percentage" ? "e.g. 10" : "e.g. 100"}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Minimum Cart Subtotal (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.min_order_amount}
                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                placeholder="e.g. 999 (0 for none)"
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Terms and conditions or promo notes..."
              className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingOffer ? "Save Changes" : "Create Offer"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
