import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, FolderTree, Image as ImageIcon } from "lucide-react";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import Button from "../components/Button.jsx";
import Badge from "../components/Badge.jsx";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categories.js";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    sort_order: 0,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    category: null,
    loading: false,
  });

  const loadData = async () => {
    setLoading(true);
    const res = await getCategories();
    if (res.data) setCategories(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      image_url: "",
      sort_order: (categories.length + 1) * 10,
      is_active: true,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      image_url: cat.image_url || "",
      sort_order: cat.sort_order ?? 0,
      is_active: cat.is_active ?? true,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setFormError("Category name is required.");
      return;
    }

    setSaving(true);
    setFormError(null);

    let res;
    if (editingCategory) {
      res = await updateCategory(editingCategory.id, formData);
    } else {
      res = await createCategory(formData);
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

  const handleDelete = async () => {
    if (!deleteModal.category) return;
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    const res = await deleteCategory(deleteModal.category.id, deleteModal.category.name);
    if (res?.error) {
      alert(res.error);
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    } else {
      setDeleteModal({ open: false, category: null, loading: false });
      loadData();
    }
  };

  const columns = [
    {
      header: "Category",
      accessor: "name",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.image_url ? (
            <img
              src={row.image_url.startsWith("http") || row.image_url.startsWith("/") ? row.image_url : `/${row.image_url}`}
              alt=""
              className="h-10 w-10 rounded-lg object-cover bg-sand shrink-0 border border-line"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sand/60 text-muted border border-line shrink-0">
              <FolderTree size={18} />
            </div>
          )}
          <div>
            <p className="font-medium text-ink truncate">{row.name}</p>
            <p className="text-xs text-muted">/{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Description",
      accessor: "description",
      render: (row) => (
        <p className="text-xs text-muted max-w-sm truncate">{row.description || "—"}</p>
      ),
    },
    {
      header: "Display Order",
      accessor: "sort_order",
      sortable: true,
      render: (row) => (
        <span className="text-xs font-mono font-medium text-ink bg-sand/40 px-2.5 py-1 rounded">
          {row.sort_order ?? 0}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "is_active",
      render: (row) => (
        <Badge variant={row.is_active ? "emerald" : "gray"}>
          {row.is_active ? "Active" : "Archived"}
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
            title="Edit category"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModal({ open: true, category: row, loading: false });
            }}
            className="p-1.5 text-muted hover:text-red-700 rounded-md hover:bg-sand/40 transition-colors"
            title="Delete category"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Categories</h1>
          <p className="text-xs text-muted mt-1">
            Organize customer navigation, collection filters, and storefront category hubs.
          </p>
        </div>
        <Button onClick={handleOpenCreate} icon={Plus}>
          Add Category
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        searchPlaceholder="Search categories..."
      />

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Add New Category"}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                setFormData({
                  ...formData,
                  name,
                  slug: editingCategory
                    ? formData.slug
                    : name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                });
              }}
              placeholder="e.g. Ear Cuff, Mangalsutra, Kada"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
              URL Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. ear-cuff"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
              Banner / Card Image URL
            </label>
            <input
              type="text"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="e.g. /images/products/p19.jpg or https://..."
              className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Display Sort Order
              </label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Status
              </label>
              <select
                value={formData.is_active ? "active" : "archived"}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "active" })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              >
                <option value="active">Active (Visible)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief tagline for category card..."
              className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, category: null, loading: false })}
        onConfirm={handleDelete}
        loading={deleteModal.loading}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteModal.category?.name}"? A category cannot be deleted if active products are assigned to it.`}
        confirmText="Delete Category"
      />
    </div>
  );
}
