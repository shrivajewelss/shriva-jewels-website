import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta.js";
import EmptyState from "../components/EmptyState.jsx";

export default function NotFound() {
  usePageMeta({ title: "Page not found — Shriva Jewels", noindex: true });
  return (
    <div className="container-page">
      <EmptyState title="Page not found">
        <p>We couldn't find that page.</p>
        <Link to="/products" className="btn btn-primary mt-6">Browse the collection</Link>
      </EmptyState>
    </div>
  );
}
