import { useEffect, useState } from "react";
import {
  BarChart3,
  IndianRupee,
  TrendingUp,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
} from "lucide-react";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import Badge from "../components/Badge.jsx";
import { getDashboardStats, getRevenueTrends } from "../services/reports.js";
import { getExpenses } from "../services/expenses.js";
import { getProducts } from "../services/products.js";
import { formatCurrency } from "../utils/currency.js";

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState({ monthly: [], weekly: [] });
  const [expenses, setExpenses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [statsRes, trendsRes, expRes, prodRes] = await Promise.all([
        getDashboardStats(),
        getRevenueTrends(),
        getExpenses(),
        getProducts(),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (trendsRes) setTrends(trendsRes);
      if (expRes.data) setExpenses(expRes.data);
      if (prodRes.data) setProducts(prodRes.data);
      setLoading(false);
    }

    loadData();
  }, []);

  const totalRevenue = stats?.total_revenue || 0;
  const estimatedCOGS = totalRevenue > 0 ? Math.round(totalRevenue - (stats?.gross_profit || 0)) : 0;
  const grossProfit = stats?.gross_profit || 0;
  const totalExpenses = stats?.total_expenses || 0;
  const netProfit = stats?.net_profit || 0;

  const grossMargin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;
  const netMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // Expense grouping by category
  const expenseByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {});

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Financial &amp; Profitability Reports
          </h1>
          <p className="text-xs text-muted mt-1">
            Realized margins, FIFO cost of goods sold, operating overheads, and inventory valuation.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()} icon={Download}>
          Export / Print Report
        </Button>
      </div>

      {/* P&L Statement Card */}
      <Card title="Profit &amp; Loss Statement (P&amp;L)" subtitle="Strict FIFO accounting formula">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-line/60">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted uppercase">Gross Revenue</p>
            <p className="font-display text-3xl font-bold text-ink">{formatCurrency(totalRevenue)}</p>
            <p className="text-[11px] text-muted">All valid customer orders</p>
          </div>

          <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
            <p className="text-xs font-medium text-muted uppercase">Cost of Goods Sold (COGS)</p>
            <p className="font-display text-3xl font-bold text-red-800">
              -{formatCurrency(estimatedCOGS)}
            </p>
            <p className="text-[11px] text-muted">Based on supplier batch purchase costs</p>
          </div>

          <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
            <p className="text-xs font-medium text-muted uppercase">Gross Profit</p>
            <p className="font-display text-3xl font-bold text-emerald-800">
              {formatCurrency(grossProfit)}
            </p>
            <p className="text-[11px] font-semibold text-emerald-700">{grossMargin}% Gross Margin</p>
          </div>

          <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
            <p className="text-xs font-medium text-muted uppercase">Net Realized Profit</p>
            <p
              className={`font-display text-3xl font-bold ${
                netProfit >= 0 ? "text-maroon" : "text-red-700"
              }`}
            >
              {formatCurrency(netProfit)}
            </p>
            <p className="text-[11px] font-semibold text-maroon">{netMargin}% Net Margin</p>
          </div>
        </div>

        {/* Calculation formula explanation */}
        <div className="mt-8 rounded-xl border border-line bg-cream/30 p-4 text-xs text-muted leading-relaxed">
          <span className="font-semibold text-ink">Accounting Policy: </span>
          Net Profit = Net Product Revenue − Cost of Goods Sold (FIFO Batch Purchase Cost) − Packaging − Shipping Logistics − Marketing − Allocated Operational Expenses.
        </div>
      </Card>

      {/* Two Column Grid: Monthly Revenue Trends & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue History */}
        <Card title="Monthly Sales Trajectory" subtitle="Historical gross revenue by month">
          {trends.monthly.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted">
              Monthly sales trajectory will populate as customer purchases are recorded.
            </p>
          ) : (
            <div className="space-y-3">
              {trends.monthly.map((m, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-ink">{m.label}</span>
                    <span className="text-maroon font-display font-semibold">{formatCurrency(m.revenue)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-sand/60 overflow-hidden">
                    <div
                      className="h-full bg-maroon rounded-full"
                      style={{
                        width: `${Math.min(100, (m.revenue / Math.max(...trends.monthly.map((x) => x.revenue || 1))) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Expense Allocations */}
        <Card title="Expense Allocations" subtitle="Categorized business cost breakdown">
          {Object.keys(expenseByCategory).length === 0 ? (
            <p className="py-8 text-center text-xs text-muted">
              No operating expenses logged yet. Record expenses in the Expenses module.
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(expenseByCategory).map(([cat, amt]) => {
                const pct = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="capitalize text-ink">{cat}</span>
                      <span className="text-ink font-semibold">
                        {formatCurrency(amt)} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-sand/60 overflow-hidden">
                      <div className="h-full bg-amber-800 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between border-t border-line pt-3 text-xs font-bold text-ink">
                <span>Total Operating Expenses</span>
                <span className="text-red-800">{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Catalogue Valuation Summary */}
      <Card title="Inventory Valuation Breakdown" subtitle="Capital tied in jewellery stock">
        <div className="flex flex-wrap items-center justify-between gap-4 p-2">
          <div>
            <p className="text-xs text-muted">Total Stock Valuation (at cost)</p>
            <p className="font-display text-4xl font-bold text-maroon mt-1">
              {formatCurrency(stats?.inventory_valuation || 0)}
            </p>
          </div>
          <p className="text-xs text-muted max-w-md leading-relaxed">
            Derived from unit purchase costs recorded in Stock Batches. Serves as working capital reference for insurance, auditing, and tax preparation.
          </p>
        </div>
      </Card>
    </div>
  );
}
