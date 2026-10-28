import { useEffect } from "react";

const SITE = (import.meta.env.VITE_SITE_URL || "").replace(/\/$/, "");
const setTag = (sel, attrs) => {
  let el = document.head.querySelector(sel);
  if (!el) { el = document.createElement(sel.startsWith("link") ? "link" : "meta"); document.head.appendChild(el); }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
};

/** Page-specific title, description, canonical, Open Graph and robots. */
export function usePageMeta({ title, description, path, noindex = false }) {
  useEffect(() => {
    document.title = title;
    if (description) {
      setTag('meta[name="description"]', { name: "description", content: description });
      setTag('meta[property="og:description"]', { property: "og:description", content: description });
    }
    setTag('meta[property="og:title"]', { property: "og:title", content: title });
    if (SITE && path) {
      setTag('link[rel="canonical"]', { rel: "canonical", href: SITE + path });
      setTag('meta[property="og:url"]', { property: "og:url", content: SITE + path });
    }
    setTag('meta[name="robots"]', { name: "robots", content: noindex ? "noindex, nofollow" : "index, follow" });
  }, [title, description, path, noindex]);
}
