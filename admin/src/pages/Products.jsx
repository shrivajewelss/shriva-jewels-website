import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Edit2, Archive, Trash2, Search, Upload } from "lucide-react";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import Button from "../components/Button.jsx";
import Badge from "../components/Badge.jsx";
import { uploadProductImage } from "../services/cloudinary.js";
import {
  getProducts,
  createProduct,
  updateProduct,
  archiveProduct,
  deleteProduct,
} from "../services/products.js";
import { getCategories } from "../services/categories.js";
import { formatCurrency } from "../utils/currency.js";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    sku: "",
    price: "",
    sale_price: "",
    category_id: "",
    status: "draft",
    is_featured: false,
    units: 0,
    image_url: "",
    initialStock: 0,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete / Archive Confirmation
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: null,
    product: null,
    loading: false,
  });

  const loadData = async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      getProducts({ search, categoryId: categoryFilter, status: statusFilter }),
      getCategories(),
    ]);
    if (prodRes.data) setProducts(prodRes.data);
    if (catRes.data) setCategories(catRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter, statusFilter]);

  // Open modal if URL has ?action=new
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      handleOpenCreate();
      setSearchParams({});
    }
  }, [searchParams]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      sku: "",
      price: "",
      sale_price: "",
      category_id: categories[0]?.id || "",
      status: "active",
      is_featured: false,
      units: 10,
      image_url: "",
      initialStock: 10,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || "",
      slug: p.slug || "",
      description: p.description || "",
      sku: p.sku || "",
      price: p.price ?? "",
      sale_price: p.sale_price ?? "",
      category_id: p.category_id || "",
      status: p.status || "draft",
      is_featured: Boolean(p.is_featured),
      units: p.units ?? p.stock_quantity ?? 0,
      image_url: p.image_url || "",
      initialStock: p.stock_quantity || 0,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setFormError(null);
    try {
      const res = await uploadProductImage(file);
      setFormData((prev) => ({ ...prev, image_url: res.secure_url }));
    } catch (err) {
      setFormError(err.message || "Failed to upload product image.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || formData.price === "") {
      setFormError("Product name, SKU, and selling price are required.");
      return;
    }

    setSaving(true);
    setFormError(null);

    let res;
    if (editingProduct) {
      res = await updateProduct(editingProduct.id, formData);
    } else {
      res = await createProduct(formData, formData.initialStock);
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

  const handleArchive = async () => {
    if (!confirmModal.product) return;
    setConfirmModal((prev) => ({ ...prev, loading: true }));
    await archiveProduct(confirmModal.product.id, confirmModal.product.status);
    setConfirmModal({ open: false, type: null, product: null, loading: false });
    loadData();
  };

  const handleDelete = async () => {
    if (!confirmModal.product) return;
    setConfirmModal((prev) => ({ ...prev, loading: true }));
    const res = await deleteProduct(confirmModal.product.id, confirmModal.product.name);
    if (res.error) {
      alert(res.error);
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    } else {
      setConfirmModal({ open: false, type: null, product: null, loading: false });
      loadData();
    }
  };

  const columns = [
    {
      header: "Product",
      accessor: "name",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.main_image?.startsWith("http") || row.main_image?.startsWith("/") ? row.main_image : `/${row.main_image}`}
            alt=""
            className="h-12 w-10 rounded-md object-cover bg-sand shrink-0 border border-line"
          />
          <div className="min-w-0">
            <p className="font-medium text-ink hover:text-maroon truncate">{row.name}</p>
            <p className="text-xs text-muted">SKU: {row.sku || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: "categories.name",
      render: (row) => (
        <span className="text-xs text-ink/80">{row.categories?.name || "Uncategorized"}</span>
      ),
    },
    {
      header: "Price",
      accessor: "price",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-display font-medium text-maroon">{formatCurrency(row.price)}</span>
          {row.sale_price != null && (
            <p className="text-[11px] text-emerald-700 font-medium">
              Sale: {formatCurrency(row.sale_price)}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Stock",
      accessor: "stock_quantity",
      sortable: true,
      render: (row) => {
        const qty = row.stock_quantity;
        const threshold = row.low_stock_threshold ?? 5;
        return (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              qty === 0 ? "bg-red-100 text-red-800" : qty <= threshold ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-800"
            }`}
          >
            {qty} units
          </span>
        );
      },
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <Badge variant={row.status === "active" ? "emerald" : row.status === "draft" ? "amber" : "gray"}>
          {row.status}
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
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(row);
            }}
            className="p-1.5 text-muted hover:text-maroon rounded-md hover:bg-sand/40 transition-colors"
            title="Edit product"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmModal({
                open: true,
                type: "archive",
                product: row,
                loading: false,
              });
            }}
            className="p-1.5 text-muted hover:text-amber-800 rounded-md hover:bg-sand/40 transition-colors"
            title={row.status === "archived" ? "Unarchive" : "Archive"}
          >
            <Archive size={15} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmModal({
                open: true,
                type: "delete",
                product: row,
                loading: false,
              });
            }}
            className="p-1.5 text-muted hover:text-red-700 rounded-md hover:bg-sand/40 transition-colors"
            title="Delete product"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Products</h1>
          <p className="text-xs text-muted mt-1">
            Manage catalogue items, high-res jewellery photography, pricing and visibility.
          </p>
        </div>
        <Button onClick={handleOpenCreate} icon={Plus}>
          Add New Product
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white p-4 shadow-card">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadData()}
              placeholder="Search by name, SKU..."
              className="w-full rounded-lg border border-line pl-9 pr-3 py-1.5 text-xs text-ink focus:border-maroon focus:outline-none"
            />
          </div>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ink focus:border-maroon focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ink focus:border-maroon focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>

        <Button variant="outline" size="sm" onClick={loadData}>
          Filter
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        searchable={false}
        emptyMessage="No products match the selected criteria."
      />

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? "Edit Product Details" : "Create New Jewellery Product"}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSave} className="space-y-5">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Solitaire Diamond Ring"
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Selling Price (₹ INR) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. 450"
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Sale Price (₹ INR)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                placeholder="Optional offer price"
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                SKU / Internal Identifier *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. SJ-RNG-004"
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Visibility Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              >
                <option value="draft">Draft (Unpublished)</option>
                <option value="active">Active (Visible)</option>
                <option value="archived">Archived (Hidden)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-generated-from-name"
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Units
              </label>
              <input
                type="number"
                min="0"
                value={formData.units}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    units: e.target.value,
                    initialStock: editingProduct ? formData.initialStock : e.target.value,
                  })
                }
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Product Image URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://... or /images/..."
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
                />
                <label className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-line bg-cream/60 px-2.5 py-2 text-xs font-medium text-ink hover:border-maroon hover:text-maroon transition-colors">
                  <Upload size={14} />
                  <span>{uploadingImage ? "..." : "Upload"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          {!editingProduct && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Initial Stock Intake (Units)
              </label>
              <input
                type="number"
                min="0"
                value={formData.initialStock}
                onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                className="w-full sm:max-w-xs rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
              <p className="text-[11px] text-muted mt-1">
                Note: Dedicated supplier batches with purchase cost tracking can be entered in the Stock Batches section.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed craftsmanship, materials, dimensions, and styling notes..."
              className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
            />
          </div>

          {formData.image_url && (
            <div className="flex items-center gap-3 rounded-lg border border-line/60 bg-cream/30 p-3">
              <img
                src={
                  formData.image_url.startsWith("http") ||
                  formData.image_url.startsWith("/") ||
                  formData.image_url.startsWith("blob:")
                    ? formData.image_url
                    : `/${formData.image_url}`
                }
                alt="Product preview"
                className="h-16 w-14 rounded-md object-cover border border-line bg-sand"
              />
              <p className="text-xs text-muted truncate flex-1">{formData.image_url}</p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_featured"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="rounded border-line text-maroon focus:ring-maroon"
            />
            <label htmlFor="is_featured" className="text-xs text-ink font-medium select-none cursor-pointer">
              Mark as Featured Product on Storefront Homepage
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingProduct ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: null, product: null, loading: false })}
        onConfirm={confirmModal.type === "delete" ? handleDelete : handleArchive}
        loading={confirmModal.loading}
        title={confirmModal.type === "delete" ? "Delete Product Permanently" : "Archive Product"}
        message={
          confirmModal.type === "delete"
            ? `Are you sure you want to delete "${confirmModal.product?.name}"? If this item has previous order records, it cannot be deleted and must be archived instead.`
            : `Are you sure you want to toggle archive status for "${confirmModal.product?.name}"?`
        }
        confirmText={confirmModal.type === "delete" ? "Delete" : "Confirm Archive"}
        confirmVariant={confirmModal.type === "delete" ? "danger" : "primary"}
      />
    </div>
  );
}
