import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../utils/currency.js";
import QuantitySelector from "./QuantitySelector.jsx";

export default function CartItem({ line }) {
  const { setQuantity, remove } = useCart();
  const { product, quantity } = line;
  return (
    <li className="flex gap-4 border-b border-line py-5">
      <Link to={`/product/${product.id}`} className="shrink-0"><img src={`https://shriva-jewels.vercel.app${product.image}`} alt={product.name} width="96" height="128" loading="lazy" className="h-28 w-[84px] rounded-md bg-sand object-cover" /></Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Code {product.code}</p>
            <h3 className="font-display text-xl leading-snug"><Link to={`/product/${product.id}`} className="text-ink hover:text-maroon">{product.name}</Link></h3>
            <p className="text-sm text-muted">{formatPrice(product.price)} each</p>
          </div>
          <p className="shrink-0 font-medium text-maroon">{formatPrice(product.price * quantity)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantitySelector value={quantity} onChange={(n) => setQuantity(product.id, n)} label={`Quantity for ${product.name}`} />
          <button type="button" onClick={() => remove(product.id)} className="flex items-center gap-1.5 rounded p-2 text-sm text-muted hover:text-maroon" aria-label={`Remove ${product.name} from bag`}>
            <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" /> Remove
          </button>
        </div>
      </div>
    </li>
  );
}
