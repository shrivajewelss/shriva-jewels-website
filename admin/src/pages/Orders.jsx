import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Eye, Search, Filter } from "lucide-react";
import DataTable from "../components/DataTable.jsx";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import { getOrders, ORDER_STATUSES, PAYMENT_STATUSES } from "../services/orders.js";
import { formatCurrency } from "../utils/currency.js";
import { formatDate } from "../utils/date.js";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    const res = await getOrders({
      status: statusFilter,
      paymentStatus: paymentFilter,
      search,
    });
    if (res.data) setOrders(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, paymentFilter]);

  const getOrderStatusBadge = (status) => {
    const s = ORDER_STATUSES.find((item) => item.value === status);
    return <Badge variant={s?.color || "default"}>{status}</Badge>;
  };

  const getPaymentStatusBadge = (status) => {
    const s = PAYMENT_STATUSES.find((item) => item.value === status);
    return <Badge variant={s?.color || "default"}>{status}</Badge>;
  };

  const columns = [
    {
      header: "Order #",
      accessor: "order_number",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-maroon">
          {row.order_number || `SJ-${row.id.slice(0, 8)}`}
        </span>
      ),
    },
    {
      header: "Customer",
      accessor: "customer_name",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-ink truncate">{row.customer_name}</p>
          <p className="text-xs text-muted">{row.phone || row.email || "—"}</p>
        </div>
      ),
    },
    {
      header: "Items",
      accessor: "items_count",
      align: "center",
      render: (row) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sand/60">
          {row.items_count} pcs
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "created_at",
      sortable: true,
      render: (row) => <span className="text-xs text-muted">{formatDate(row.created_at)}</span>,
    },
    {
      header: "Total Amount",
      accessor: "total_amount",
      sortable: true,
      align: "right",
      render: (row) => (
        <span className="font-display font-semibold text-base text-ink">
          {formatCurrency(row.total_amount)}
        </span>
      ),
    },
    {
      header: "Payment",
      accessor: "payment_status",
      render: (row) => getPaymentStatusBadge(row.payment_status),
    },
    {
      header: "Order Status",
      accessor: "order_status",
      render: (row) => getOrderStatusBadge(row.order_status),
    },
    {
      header: "Actions",
      align: "right",
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/orders/${row.id}`)}
          icon={Eye}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Order Management</h1>
          <p className="text-xs text-muted mt-1">
            Customer bookings, shipping lifecycle, payment states, and invoice generation.
          </p>
        </div>
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
              placeholder="Search by order #, customer, phone..."
              className="w-full rounded-lg border border-line pl-9 pr-3 py-1.5 text-xs text-ink focus:border-maroon focus:outline-none"
            />
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ink focus:border-maroon focus:outline-none"
        >
          <option value="">All Order Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ink focus:border-maroon focus:outline-none"
        >
          <option value="">All Payment Statuses</option>
          {PAYMENT_STATUSES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <Button variant="outline" size="sm" onClick={loadData}>
          Filter
        </Button>
      </div>

      {/* Orders Table */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        searchable={false}
        onRowClick={(row) => navigate(`/orders/${row.id}`)}
        emptyMessage="No customer orders found matching the filter criteria."
      />
    </div>
  );
}
