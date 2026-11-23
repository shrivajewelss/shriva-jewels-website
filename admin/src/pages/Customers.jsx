import { useEffect, useState } from "react";
import { Users, Search, MessageCircle, ExternalLink, Eye, Plus } from "lucide-react";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.jsx";
import Button from "../components/Button.jsx";
import Badge from "../components/Badge.jsx";
import {
  getCustomers,
  getCustomerDetails,
  addCustomerNote,
  buildWhatsAppLink,
  WHATSAPP_TEMPLATES,
} from "../services/customers.js";
import { formatCurrency } from "../utils/currency.js";
import { formatDate } from "../utils/date.js";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Customer Detail Modal
  const [detailModal, setDetailModal] = useState({
    open: false,
    customer: null,
    loading: false,
  });

  // Note creation
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // WhatsApp template selector
  const [selectedTemplate, setSelectedTemplate] = useState("order_confirmation");

  const loadData = async () => {
    setLoading(true);
    const res = await getCustomers({ search });
    if (res.data) setCustomers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleViewCustomer = async (identifier) => {
    setDetailModal({ open: true, customer: null, loading: true });
    const res = await getCustomerDetails(identifier);
    if (res.data) {
      setDetailModal({ open: true, customer: res.data, loading: false });
    } else {
      setDetailModal({ open: false, customer: null, loading: false });
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !detailModal.customer) return;

    setSavingNote(true);
    await addCustomerNote(
      detailModal.customer.phone,
      detailModal.customer.email,
      newNote.trim()
    );
    setNewNote("");
    setSavingNote(false);

    // Refresh details
    const res = await getCustomerDetails(detailModal.customer.phone);
    if (res.data) {
      setDetailModal({ open: true, customer: res.data, loading: false });
    }
  };

  const handleTriggerWhatsApp = () => {
    if (!detailModal.customer) return;
    const firstOrder = detailModal.customer.orders?.[0];
    const url = buildWhatsAppLink(detailModal.customer.phone, selectedTemplate, {
      customerName: detailModal.customer.name,
      orderNumber: firstOrder?.order_number || "RECENT",
      totalAmount: firstOrder?.total_amount || detailModal.customer.total_spent,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const columns = [
    {
      header: "Customer",
      accessor: "name",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-ink truncate">{row.name}</p>
          <p className="text-xs text-muted">{row.city ? `${row.city}, ` : ""}{row.state}</p>
        </div>
      ),
    },
    {
      header: "Mobile",
      accessor: "phone",
      render: (row) => (
        <span className="font-mono text-xs text-ink/80">{row.phone || "—"}</span>
      ),
    },
    {
      header: "Orders",
      accessor: "total_orders",
      sortable: true,
      align: "center",
      render: (row) => (
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-sand/60">
          {row.total_orders}
        </span>
      ),
    },
    {
      header: "Total Spent",
      accessor: "total_spent",
      sortable: true,
      align: "right",
      render: (row) => (
        <span className="font-display font-semibold text-base text-maroon">
          {formatCurrency(row.total_spent)}
        </span>
      ),
    },
    {
      header: "Avg Order Value",
      accessor: "average_order_value",
      sortable: true,
      align: "right",
      render: (row) => (
        <span className="text-xs text-muted font-medium">
          {formatCurrency(row.average_order_value)}
        </span>
      ),
    },
    {
      header: "Last Purchase",
      accessor: "last_order_date",
      sortable: true,
      render: (row) => <span className="text-xs text-muted">{formatDate(row.last_order_date)}</span>,
    },
    {
      header: "Actions",
      align: "right",
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleViewCustomer(row.phone || row.email)}
          icon={Eye}
        >
          View Profile
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Customer CRM</h1>
          <p className="text-xs text-muted mt-1">
            Customer lifetime value, purchase records, communication notes, and WhatsApp touchpoints.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 rounded-xl border border-line bg-white p-4 shadow-card">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadData()}
            placeholder="Search by customer name, phone, email, city..."
            className="w-full rounded-lg border border-line pl-9 pr-3 py-1.5 text-xs text-ink focus:border-maroon focus:outline-none"
          />
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          Search
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        searchable={false}
        emptyMessage="No customer records found."
      />

      {/* Customer Detail & WhatsApp Modal */}
      <Modal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, customer: null, loading: false })}
        title={detailModal.customer?.name || "Customer Profile"}
        maxWidth="max-w-3xl"
      >
        {detailModal.loading ? (
          <div className="py-12 text-center text-muted">Loading customer details...</div>
        ) : detailModal.customer ? (
          <div className="space-y-6">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-xl border border-line bg-cream/40 p-4 text-xs">
              <div>
                <p className="text-muted uppercase">Phone</p>
                <p className="font-semibold text-ink text-sm mt-0.5">{detailModal.customer.phone || "—"}</p>
              </div>
              <div>
                <p className="text-muted uppercase">Total Orders</p>
                <p className="font-semibold text-ink text-sm mt-0.5">{detailModal.customer.total_orders}</p>
              </div>
              <div>
                <p className="text-muted uppercase">Lifetime Value</p>
                <p className="font-display font-bold text-maroon text-base mt-0.5">
                  {formatCurrency(detailModal.customer.total_spent)}
                </p>
              </div>
              <div>
                <p className="text-muted uppercase">Average Order</p>
                <p className="font-semibold text-ink text-sm mt-0.5">
                  {formatCurrency(detailModal.customer.average_order_value)}
                </p>
              </div>
            </div>

            {/* Direct WhatsApp Messaging Section */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                <MessageCircle size={18} />
                <span>WhatsApp Customer Messaging</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Send approved customer care or status templates via official WhatsApp messaging.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs text-ink focus:outline-none"
                >
                  {Object.entries(WHATSAPP_TEMPLATES).map(([key, tmpl]) => (
                    <option key={key} value={key}>
                      Template: {tmpl.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleTriggerWhatsApp}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors shadow-sm"
                >
                  <ExternalLink size={14} /> Open WhatsApp Chat
                </button>
              </div>
            </div>

            {/* Order History */}
            <div>
              <h3 className="font-display text-xl font-semibold text-ink mb-2">Order History</h3>
              <div className="overflow-x-auto rounded-xl border border-line bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-line bg-cream/60 text-muted uppercase">
                    <tr>
                      <th className="px-4 py-2.5">Order #</th>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5 text-right">Amount</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {detailModal.customer.orders?.map((ord) => (
                      <tr key={ord.id}>
                        <td className="px-4 py-2.5 font-mono font-medium">{ord.order_number}</td>
                        <td className="px-4 py-2.5 text-muted">{formatDate(ord.created_at)}</td>
                        <td className="px-4 py-2.5 text-right font-display font-semibold text-maroon">
                          {formatCurrency(ord.total_amount)}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge variant="blue">{ord.order_status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CRM Notes */}
            <div>
              <h3 className="font-display text-xl font-semibold text-ink mb-2">Admin Notes</h3>
              <form onSubmit={handleAddNote} className="flex gap-2 mb-3">
                <input
                  type="text"
                  required
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add customer preference or notes..."
                  className="flex-1 rounded-lg border border-line px-3 py-1.5 text-xs text-ink focus:border-maroon focus:outline-none"
                />
                <Button type="submit" size="sm" loading={savingNote} icon={Plus}>
                  Add Note
                </Button>
              </form>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {detailModal.customer.notes?.length === 0 ? (
                  <p className="text-xs text-muted italic">No internal notes for this customer yet.</p>
                ) : (
                  detailModal.customer.notes?.map((n) => (
                    <div key={n.id} className="rounded-lg border border-line bg-sand/20 p-2.5 text-xs">
                      <p className="text-ink">{n.notes}</p>
                      <p className="text-[10px] text-muted mt-1">
                        {n.admin_profiles?.full_name || "Admin"} · {formatDate(n.created_at)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-line">
              <Button
                variant="outline"
                onClick={() => setDetailModal({ open: false, customer: null, loading: false })}
              >
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
