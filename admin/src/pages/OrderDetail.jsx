import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  MessageCircle,
  Truck,
  CreditCard,
  User,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import {
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "../services/orders.js";
import { buildWhatsAppLink } from "../services/customers.js";
import { formatCurrency } from "../utils/currency.js";
import { formatDate, formatDateTime } from "../utils/date.js";
import { BUSINESS_DETAILS, generateInvoiceNumber, triggerPrint } from "../utils/invoice.js";

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [noteText, setNoteText] = useState("");
  const navigate = useNavigate();

  const loadOrder = async () => {
    setLoading(true);
    const res = await getOrderById(orderId);
    if (res.data) setOrder(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const handleStatusChange = async (newStatus) => {
    if (!order || newStatus === order.order_status) return;
    setUpdating(true);
    const res = await updateOrderStatus(order.id, newStatus, noteText);
    if (res.error) {
      alert(`Error updating order status: ${res.error}`);
    } else {
      setNoteText("");
      await loadOrder();
    }
    setUpdating(false);
  };

  const handlePaymentChange = async (newPayment) => {
    if (!order || newPayment === order.payment_status) return;
    setUpdating(true);
    const res = await updatePaymentStatus(order.id, newPayment);
    if (res.error) {
      alert(`Error updating payment status: ${res.error}`);
    } else {
      await loadOrder();
    }
    setUpdating(false);
  };

  const handleOpenWhatsApp = (templateKey) => {
    if (!order) return;
    const url = buildWhatsAppLink(order.phone, templateKey, {
      customerName: order.customer_name,
      orderNumber: order.order_number || order.id.slice(0, 8),
      totalAmount: order.total_amount,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return <div className="py-20 text-center text-muted">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-base text-muted">Order not found.</p>
        <Link to="/orders" className="btn btn-outline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const invoiceNumber = generateInvoiceNumber(order.order_number, order.created_at);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Bar (Hidden during print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white hover:border-maroon hover:text-maroon transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
              Order {order.order_number || `#${order.id.slice(0, 8)}`}
            </h1>
            <p className="text-xs text-muted">Placed on {formatDateTime(order.created_at)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* WhatsApp Direct Messaging */}
          <button
            type="button"
            onClick={() => handleOpenWhatsApp("order_confirmation")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-sm"
          >
            <MessageCircle size={14} /> Send WhatsApp Confirmation
          </button>

          <Button variant="outline" size="sm" onClick={triggerPrint} icon={Printer}>
            Print / Download Invoice
          </Button>
        </div>
      </div>

      {/* Main Order Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Items & Financial Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Ordered Jewellery Items" subtitle={`${order.items?.length || 0} unique designs`}>
            <div className="divide-y divide-line/60">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <img
                    src={item.product_image?.startsWith("http") || item.product_image?.startsWith("/") ? item.product_image : `/${item.product_image}`}
                    alt=""
                    className="h-16 w-12 rounded-lg object-cover bg-sand shrink-0 border border-line"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink text-sm sm:text-base truncate">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      SKU: {item.sku || "—"} · Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-semibold text-base text-maroon">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="mt-6 border-t border-line pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted">
                <span>Subtotal Items</span>
                <span className="font-medium text-ink">
                  {formatCurrency(order.items?.reduce((s, i) => s + i.subtotal, 0))}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping Charges</span>
                <span className="font-medium text-emerald-700">Free</span>
              </div>
              <div className="flex justify-between border-t border-line pt-3 font-display text-xl text-ink">
                <span>Total Amount</span>
                <span className="font-bold text-maroon">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </Card>

          {/* Printable Invoice Section (Visible when printing) */}
          <div className="printable-invoice hidden print:block rounded-xl border border-line bg-white p-8">
            <div className="flex justify-between items-start border-b border-line pb-6">
              <div>
                <img
                  src="https://www.shriva.store/brand/shriva-logo.png"
                  alt="Shriva Jewels"
                  className="h-14 w-auto mb-2"
                />
                <h2 className="font-display text-2xl font-bold text-maroon">
                  {BUSINESS_DETAILS.name}
                </h2>
                <p className="text-xs text-muted">{BUSINESS_DETAILS.tagline}</p>
                <p className="text-xs text-muted mt-1">{BUSINESS_DETAILS.city}</p>
                <p className="text-xs text-muted">
                  Support: {BUSINESS_DETAILS.supportPhone} · {BUSINESS_DETAILS.supportEmail}
                </p>
              </div>

              <div className="text-right">
                <span className="font-display text-2xl font-bold text-ink">TAX INVOICE</span>
                <p className="text-xs text-muted mt-1 font-mono font-bold">
                  Invoice #: {invoiceNumber}
                </p>
                <p className="text-xs text-muted">Date: {formatDate(order.created_at)}</p>
                <p className="text-xs text-muted font-mono">Order Ref: {order.order_number}</p>
                <div className="mt-2">
                  <Badge variant={order.payment_status === "Paid" ? "emerald" : "amber"}>
                    Payment: {order.payment_status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="my-6 border-b border-line pb-6 text-xs grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold uppercase text-muted tracking-wider">Customer Details:</p>
                <p className="font-semibold text-sm text-ink mt-1">{order.customer_name}</p>
                <p className="text-muted">Mobile: {order.phone}</p>
                <p className="text-muted">Email: {order.email}</p>
              </div>
              <div>
                <p className="font-bold uppercase text-muted tracking-wider">Delivery Address:</p>
                <p className="text-ink mt-1 leading-relaxed">
                  {order.address}
                  <br />
                  {order.city}, {order.state} - {order.pincode}
                </p>
              </div>
            </div>

            {/* Items Table for Print */}
            <table className="w-full text-left text-xs mb-6">
              <thead className="border-b border-line bg-cream/40">
                <tr>
                  <th className="py-2 px-3">Item Description</th>
                  <th className="py-2 px-3">SKU</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Unit Price</th>
                  <th className="py-2 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {order.items?.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 font-medium">{it.product_name}</td>
                    <td className="py-2 px-3 text-muted">{it.sku || "—"}</td>
                    <td className="py-2 px-3 text-center">{it.quantity}</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(it.unit_price)}</td>
                    <td className="py-2 px-3 text-right font-semibold">{formatCurrency(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end border-t border-line pt-4 text-xs">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between text-muted">
                  <span>Subtotal:</span>
                  <span className="text-ink font-semibold">{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Shipping &amp; Delivery:</span>
                  <span className="text-emerald-700 font-semibold">Free</span>
                </div>
                <div className="flex justify-between border-t border-line pt-2 text-sm font-bold text-maroon">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>

            <p className="mt-8 text-[10px] text-muted text-center border-t border-line/60 pt-4">
              Thank you for choosing Shriva Jewels · www.shriva.store
            </p>
          </div>
        </div>

        {/* Right Column: Status Control, Customer info & Timeline */}
        <div className="space-y-6">
          {/* Status Controls Card */}
          <Card title="Status &amp; Fulfillment">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1.5">
                  Order Status
                </label>
                <select
                  disabled={updating}
                  value={order.order_status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-ink focus:border-maroon focus:outline-none"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted mt-1">
                  Changing to Cancelled or Returned will automatically restore inventory counts.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted mb-1.5">
                  Payment Status
                </label>
                <select
                  disabled={updating}
                  value={order.payment_status}
                  onChange={(e) => handlePaymentChange(e.target.value)}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-ink focus:border-maroon focus:outline-none"
                >
                  {PAYMENT_STATUSES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Customer Details Card */}
          <Card title="Customer Information">
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <User size={16} className="text-muted shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-ink">{order.customer_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MessageCircle size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-ink">{order.phone || "No phone provided"}</p>
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsApp("order_confirmation")}
                    className="text-maroon hover:underline text-[11px] font-medium"
                  >
                    Open WhatsApp Chat →
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-muted shrink-0 mt-0.5" />
                <div className="text-ink leading-relaxed">
                  <p>{order.address}</p>
                  <p>
                    {order.city}, {order.state} - {order.pincode}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
