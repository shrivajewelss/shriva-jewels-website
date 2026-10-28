import { usePageMeta } from "../hooks/usePageMeta.js";
import Collection from "./Collection.jsx";

export default function Products() {
  usePageMeta({
    title: "All Jewellery Products — Shriva Jewels",
    description: "Browse every Shriva Jewels piece: earrings, necklaces, rings, bracelets and anklets with codes and prices.",
    path: "/products",
  });
  return <Collection title="All Products" />;
}
