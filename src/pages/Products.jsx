import { usePageMeta } from "../hooks/usePageMeta.js";
import Collection from "./Collection.jsx";

export default function Products() {
  usePageMeta({
    title: "All Jewellery Products — Shriva Jewels",
    description: "Browse every Shriva Jewels piece: earrings, necklaces, rings, bracelets and anklets with codes and prices. Shop the complete collection online.",
    keywords: "all jewellery, jewellery catalogue, buy jewellery online India, earrings collection, necklaces collection, bracelets for women, rings for women, anklets, fashion jewellery catalogue",
    path: "/products",
  });
  return <Collection title="All Products" />;
}
