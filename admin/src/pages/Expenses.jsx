import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Edit2, Trash2, Receipt, Calendar, Filter } from "lucide-react";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import Button from "../components/Button.jsx";
import Badge from "../components/Badge.jsx";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  EXPENSE_CATEGORIES,
} from "../services/expenses.js";
import { formatCurrency } from "../utils/currency.js";
import { formatDate } from "../utils/date.js";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    category: "packaging",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    description: "",
    order_id: "",
    product_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    expense: null,
    loading: false,
  });

  const loadData = async () => {
    setLoading(true);
    const res = await getExpenses({ category: categoryFilter });
    if (res.data) setExpenses(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      handleOpenCreate();
      setSearchParams({});
    }
  }, [searchParams]);

  const handleOpenCreate = () => {
    setEditingExpense(null);
    setFormData({
      category: "packaging",
      amount: "",
      expense_date: new Date().toISOString().split("T")[0],
      description: "",
      order_id: "",
      product_id: "",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setFormData({
      category: exp.category,
      amount: exp.amount,
      expense_date: exp.expense_date,
      description: exp.description,
      order_id: exp.order_id || "",
      product_id: exp.product_id || "",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      setFormError("Amount and description are required.");
      return;
    }

    setSaving(true);
    setFormError(null);

    let res;
    if (editingExpense) {
      res = await updateExpense(editingExpense.id, formData);
    } else {
      res = await createExpense(formData);
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
    if (!deleteModal.expense) return;
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    await deleteExpense(deleteModal.expense.id);
    setDeleteModal({ open: false, expense: null, loading: false });
    loadData();
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case "packaging":
        return <Badge variant="amber">Packaging</Badge>;
      case "postage":
      case "shipping":
        return <Badge variant="blue">Logistics / Shipping</Badge>;
      case "marketing":
        return <Badge variant="purple">Marketing</Badge>;
      case "operational":
        return <Badge variant="indigo">Operational</Badge>;
      default:
        return <Badge>{cat}</Badge>;
    }
  };

  const totalExpenseAmount = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const columns = [
    {
      header: "Expense Date",
      accessor: "expense_date",
      sortable: true,
      render: (row) => <span className="text-xs text-muted">{formatDate(row.expense_date)}</span>,
    },
    {
      header: "Category",
      accessor: "category",
      render: (row) => getCategoryBadge(row.category),
    },
    {
      header: "Description",
      accessor: "description",
      render: (row) => (
        <div>
          <p className="font-medium text-ink text-sm">{row.description}</p>
          <p className="text-[10px] text-muted">Logged by: {row.admin_profiles?.full_name || "Admin"}</p>
        </div>
      ),
    },
    {
      header: "Amount",
      accessor: "amount",
      sortable: true,
      align: "right",
      render: (row) => (
        <span className="font-display font-semibold text-base text-red-800">
          -{formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-muted hover:text-maroon rounded hover:bg-sand/40 transition-colors"
            title="Edit expense"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => setDeleteModal({ open: true, expense: row, loading: false })}
            className="p-1.5 text-muted hover:text-red-700 rounded hover:bg-sand/40 transition-colors"
            title="Delete expense"
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
          <h1 className="font-display text-3xl font-semibold text-ink">Expense Tracking</h1>
          <p className="text-xs text-muted mt-1">
            Track packaging, logistics, operational costs, and advertising outlays for net margin calculations.
          </p>
        </div>
        <Button onClick={handleOpenCreate} icon={Plus}>
          Record Expense
        </Button>
      </div>

      {/* Summary Banner & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-white p-4 shadow-card">
        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ink focus:border-maroon focus:outline-none"
          >
            <option value="">All Expense Categories</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">Total Recorded Expenses:</span>
          <span className="font-display font-bold text-xl text-red-800">
            {formatCurrency(totalExpenseAmount)}
          </span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={expenses}
        loading={loading}
        searchPlaceholder="Search expense descriptions..."
        emptyMessage="No expenses recorded for the selected filter."
      />

      {/* Record Expense Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingExpense ? "Edit Expense Entry" : "Record New Business Expense"}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
              Expense Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Amount (₹ INR) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g. 1500"
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
                Expense Date *
              </label>
              <input
                type="date"
                required
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1">
              Description / Details *
            </label>
            <textarea
              rows={2}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. 500 premium velvet jewellery pouches from Surat supplier"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingExpense ? "Save Changes" : "Record Expense"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, expense: null, loading: false })}
        onConfirm={handleDelete}
        loading={deleteModal.loading}
        title="Delete Expense Entry"
        message={`Are you sure you want to delete this ${formatCurrency(deleteModal.expense?.amount)} expense entry?`}
      />
    </div>
  );
}
