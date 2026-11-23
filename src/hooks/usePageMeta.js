import { useEffect } from "react";

const DEFAULT_SITE = "https://www.shriva.store";
const SITE = (import.meta.env.VITE_SITE_URL || DEFAULT_SITE).replace(/\/$/, "");

const DEFAULT_KEYWORDS =
  "Shriva Jewels, jewellery online India, fashion jewellery, anti-tarnish jewellery, imitation jewellery, earrings, necklaces, bracelets, bangles, rings, anklets, affordable luxury jewellery, buy jewellery online, WhatsApp jewellery order";

const setTag = (sel, attrs) => {
  let el = document.head.querySelector(sel);
  if (!el) {
    el = document.createElement(sel.startsWith("link") ? "link" : "meta");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
};

/** Page-specific title, description, keywords, canonical, Open Graph, Twitter and robots. */
export function usePageMeta({ title, description, keywords, path, noindex = false }) {
  useEffect(() => {
    document.title = title;

    if (description) {
      setTag('meta[name="description"]', { name: "description", content: description });
      setTag('meta[property="og:description"]', { property: "og:description", content: description });
      setTag('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    }

    setTag('meta[property="og:title"]', { property: "og:title", content: title });
    setTag('meta[name="twitter:title"]', { name: "twitter:title", content: title });

    const pageKeywords = keywords || DEFAULT_KEYWORDS;
    setTag('meta[name="keywords"]', { name: "keywords", content: pageKeywords });

    if (path) {
      const fullUrl = SITE + path;
      setTag('link[rel="canonical"]', { rel: "canonical", href: fullUrl });
      setTag('meta[property="og:url"]', { property: "og:url", content: fullUrl });
    }

    setTag('meta[name="robots"]', {
      name: "robots",
      content: noindex ? "noindex, nofollow" : "index, follow",
    });
  }, [title, description, keywords, path, noindex]);
}
