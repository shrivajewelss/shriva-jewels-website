import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import CartItem from "../components/CartItem.jsx";
import BookingSummary from "../components/BookingSummary.jsx";
import BookingForm from "../components/BookingForm.jsx";
import WhatsAppButton from "../components/WhatsAppButton.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function CartPage() {
  usePageMeta({ title: "Your Bag — Shriva Jewels", description: "Review the jewellery in your bag before sending a booking request.", path: "/cart", noindex: true });
  const { lines, subtotal, count, clear } = useCart();
  const [name, setName] = useState("");

  if (lines.length === 0) {
    return (
      <div className="container-page pt-12">
        <EmptyState title="Your bag is empty">
          <p>Add a few pieces and send us a booking request on WhatsApp.</p>
          <Link to="/products" className="btn btn-primary mt-6">Continue shopping</Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container-page pt-12 sm:pt-16">
      <h1 className="text-5xl sm:text-6xl">Your Bag</h1>
      <p className="mt-2 text-sm text-muted">{count} {count === 1 ? "item" : "items"}</p>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
        <section aria-label="Items in your bag">
          <ul className="border-t border-line">{lines.map((l) => <CartItem key={l.id} line={l} />)}</ul>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <Link to="/products" className="font-medium text-maroon underline underline-offset-4">Continue shopping</Link>
            <button type="button" onClick={clear} className="text-muted underline underline-offset-4 hover:text-maroon">Clear bag</button>
          </div>
        </section>
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <BookingSummary lines={lines} subtotal={subtotal} />
          <BookingForm onNameChange={setName} />
          <WhatsAppButton lines={lines} subtotal={subtotal} name={name} />
        </aside>
      </div>
    </div>
  );
}
