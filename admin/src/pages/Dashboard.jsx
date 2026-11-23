import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Users,
  Gem,
  AlertTriangle,
  TrendingUp,
  Layers,
  Activity,
  ArrowRight,
} from "lucide-react";
import StatsCard from "../components/StatsCard.jsx";
import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import { getDashboardStats, getRevenueTrends } from "../services/reports.js";
import { getOrders } from "../services/orders.js";
import { getInventoryList } from "../services/inventory.js";
import { getAuditLogs } from "../services/audit.js";
import { formatCurrency } from "../utils/currency.js";
import { formatDate, getRelativeTime } from "../utils/date.js";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState({ monthly: [], weekly: [] });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [statsRes, trendsRes, ordersRes, invRes, auditRes] = await Promise.all([
        getDashboardStats(),
        getRevenueTrends(),
        getOrders(),
        getInventoryList({ lowStockOnly: true }),
        getAuditLogs(6),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (trendsRes) setTrends(trendsRes);
      if (ordersRes.data) setRecentOrders(ordersRes.data.slice(0, 5));
      if (invRes.data) setLowStockItems(invRes.data.slice(0, 5));
      if (auditRes.data) setRecentActivities(auditRes.data);
      setLoading(false);
    }

    loadData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <Badge variant="amber">Pending</Badge>;
      case "Confirmed":
        return <Badge variant="blue">Confirmed</Badge>;
      case "Processing":
        return <Badge variant="indigo">Processing</Badge>;
      case "Shipped":
        return <Badge variant="purple">Shipped</Badge>;
      case "Delivered":
        return <Badge variant="emerald">Delivered</Badge>;
      case "Cancelled":
        return <Badge variant="red">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome & Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink">
            Store Performance
          </h1>
          <p className="mt-1 text-xs text-muted">
            Real-time business telemetry and jewellery inventory operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["all", "month", "week", "today"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setDateFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                dateFilter === f
                  ? "bg-maroon text-cream shadow-sm"
                  : "border border-line bg-white text-ink hover:border-maroon hover:text-maroon"
              }`}
            >
              {f === "all" ? "All Time" : f === "month" ? "This Month" : f === "week" ? "This Week" : "Today"}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Net Revenue"
          value={formatCurrency(stats?.total_revenue || 0)}
          subtitle="Confirmed & completed sales"
          icon={IndianRupee}
          color="maroon"
        />
        <StatsCard
          title="Gross Profit"
          value={formatCurrency(stats?.gross_profit || 0)}
          subtitle="Revenue minus FIFO COGS"
          icon={TrendingUp}
          color="emerald"
        />
        <StatsCard
          title="Net Profit"
          value={formatCurrency(stats?.net_profit || 0)}
          subtitle="After operating expenses"
          icon={IndianRupee}
          color="gold"
        />
        <StatsCard
          title="Inventory Valuation"
          value={formatCurrency(stats?.inventory_valuation || 0)}
          subtitle="Total stock at purchase cost"
          icon={Layers}
          color="blue"
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="rounded-xl border border-line bg-white p-4 shadow-card">
          <p className="text-[11px] font-medium text-muted uppercase">Total Orders</p>
          <p className="font-display text-2xl font-semibold text-ink mt-1">
            {stats?.total_orders || 0}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-card">
          <p className="text-[11px] font-medium text-amber-800 uppercase flex items-center gap-1">
            <Clock size={12} /> Pending
          </p>
          <p className="font-display text-2xl font-semibold text-amber-900 mt-1">
            {stats?.pending_orders || 0}
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-card">
          <p className="text-[11px] font-medium text-blue-800 uppercase">Confirmed</p>
          <p className="font-display text-2xl font-semibold text-blue-900 mt-1">
            {stats?.confirmed_orders || 0}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-card">
          <p className="text-[11px] font-medium text-emerald-800 uppercase flex items-center gap-1">
            <CheckCircle2 size={12} /> Delivered
          </p>
          <p className="font-display text-2xl font-semibold text-emerald-900 mt-1">
            {stats?.delivered_orders || 0}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4 shadow-card">
          <p className="text-[11px] font-medium text-muted uppercase flex items-center gap-1">
            <Users size={12} /> Customers
          </p>
          <p className="font-display text-2xl font-semibold text-ink mt-1">
            {stats?.total_customers || 0}
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-card">
          <p className="text-[11px] font-medium text-red-800 uppercase flex items-center gap-1">
            <AlertTriangle size={12} /> Low Stock
          </p>
          <p className="font-display text-2xl font-semibold text-red-900 mt-1">
            {stats?.low_stock_products || 0}
          </p>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Alerts/Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 spans): Recent Orders */}
        <div className="lg:col-span-2 space-y-8">
          <Card
            title="Recent Orders"
            subtitle="Latest jewellery purchases & booking requests"
            action={
              <Link to="/orders" className="text-xs font-medium text-maroon hover:underline flex items-center gap-1">
                View all orders <ArrowRight size={13} />
              </Link>
            }
          >
            {recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">
                No orders recorded yet. As orders are placed, they will appear here.
              </p>
            ) : (
              <div className="divide-y divide-line/60">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3.5 gap-4">
                    <div className="min-w-0">
                      <Link
                        to={`/orders/${order.id}`}
                        className="font-medium text-sm text-ink hover:text-maroon transition-colors"
                      >
                        {order.order_number || `Order #${order.id.slice(0, 8)}`}
                      </Link>
                      <p className="text-xs text-muted truncate">
                        {order.customer_name} · {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.order_status)}
                      <span className="font-display text-base font-semibold text-maroon">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Actions Card */}
          <Card title="Quick Management Actions" subtitle="Fast administrative workflows">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                to="/products?action=new"
                className="flex flex-col items-center justify-center rounded-xl border border-line bg-cream/30 p-4 text-center hover:border-maroon hover:bg-sand/40 transition-colors group"
              >
                <Gem size={22} className="text-maroon mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-ink">Add Product</span>
              </Link>
              <Link
                to="/stock-batches?action=new"
                className="flex flex-col items-center justify-center rounded-xl border border-line bg-cream/30 p-4 text-center hover:border-maroon hover:bg-sand/40 transition-colors group"
              >
                <Layers size={22} className="text-maroon mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-ink">New Stock Batch</span>
              </Link>
              <Link
                to="/expenses?action=new"
                className="flex flex-col items-center justify-center rounded-xl border border-line bg-cream/30 p-4 text-center hover:border-maroon hover:bg-sand/40 transition-colors group"
              >
                <IndianRupee size={22} className="text-maroon mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-ink">Record Expense</span>
              </Link>
              <Link
                to="/offers?action=new"
                className="flex flex-col items-center justify-center rounded-xl border border-line bg-cream/30 p-4 text-center hover:border-maroon hover:bg-sand/40 transition-colors group"
              >
                <ShoppingBag size={22} className="text-maroon mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-ink">Create Offer</span>
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Column (1 span): Low Stock Alerts & Recent Activities */}
        <div className="space-y-8">
          {/* Low Stock Alerts */}
          <Card
            title="Low Stock Alerts"
            subtitle="Pieces below safety threshold (≤ 5 units)"
            action={
              <Link to="/inventory?filter=low" className="text-xs font-medium text-maroon hover:underline">
                View all
              </Link>
            }
          >
            {lowStockItems.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted">
                All inventory quantities are currently above safety thresholds.
              </p>
            ) : (
              <div className="divide-y divide-line/60">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2.5">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-medium text-ink truncate">{item.product_name}</p>
                      <p className="text-[10px] text-muted">{item.category_name}</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        item.quantity === 0
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.quantity} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Admin Activity */}
          <Card
            title="Recent Activity"
            subtitle="Audit log of administrative actions"
            action={
              <Link to="/activity" className="text-xs font-medium text-maroon hover:underline">
                Audit trail
              </Link>
            }
          >
            {recentActivities.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted">
                No recent admin activity recorded.
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <Activity size={14} className="text-maroon shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink truncate capitalize">
                        {act.action.replace(/_/g, " ")}
                      </p>
                      <p className="text-[10px] text-muted">
                        {act.admin_profiles?.full_name || "Admin"} · {getRelativeTime(act.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
