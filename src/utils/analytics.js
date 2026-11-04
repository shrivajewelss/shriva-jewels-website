/**
 * Google Analytics (GA4 / gtag.js) integration for Shriva Jewels.
 * Reads Measurement ID from VITE_GA_MEASUREMENT_ID or VITE_GTAG_ID in .env
 */

export const GA_MEASUREMENT_ID =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_GA_MEASUREMENT_ID || import.meta.env?.VITE_GTAG_ID)) ||
  "";

let isInitialized = false;

/**
 * Dynamically injects and configures the Google gtag.js script if an ID is present.
 */
export function initGA() {
  if (typeof window === "undefined") return;
  if (!GA_MEASUREMENT_ID || isInitialized) return;

  // Initialize dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  // Disable automatic pageview to avoid duplicates and handle SPA navigation manually
  window.gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: false,
  });

  // Inject Google Tag script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);

  isInitialized = true;
}

/**
 * Generic event tracker with safety checks.
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function" || !GA_MEASUREMENT_ID) {
    return;
  }
  window.gtag("event", eventName, params);
}

/**
 * Tracks SPA page view transitions.
 */
export function trackPageView(pagePath, pageTitle) {
  trackEvent("page_view", {
    page_path: pagePath,
    page_title: pageTitle || (typeof document !== "undefined" ? document.title : ""),
    page_location: typeof window !== "undefined" ? window.location.href : "",
  });
}

/**
 * E-commerce: Product view event (GA4 view_item).
 */
export function trackViewItem(product) {
  if (!product) return;
  trackEvent("view_item", {
    currency: "INR",
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        item_brand: "Shriva Jewels",
      },
    ],
  });
}

/**
 * E-commerce: Add to cart event (GA4 add_to_cart).
 */
export function trackAddToCart(product, quantity = 1) {
  if (!product) return;
  trackEvent("add_to_cart", {
    currency: "INR",
    value: product.price * quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity,
        item_brand: "Shriva Jewels",
      },
    ],
  });
}

/**
 * E-commerce: Remove from cart event (GA4 remove_from_cart).
 */
export function trackRemoveFromCart(product, quantity = 1) {
  if (!product) return;
  trackEvent("remove_from_cart", {
    currency: "INR",
    value: (product.price || 0) * quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity,
        item_brand: "Shriva Jewels",
      },
    ],
  });
}

/**
 * E-commerce: Begin checkout / view bag (GA4 begin_checkout).
 */
export function trackBeginCheckout(lines, subtotal) {
  trackEvent("begin_checkout", {
    currency: "INR",
    value: subtotal,
    items: (lines || []).map((l) => ({
      item_id: l.product?.id,
      item_name: l.product?.name,
      item_category: l.product?.category,
      price: l.product?.price,
      quantity: l.quantity,
      item_brand: "Shriva Jewels",
    })),
  });
}

/**
 * E-commerce / Lead: WhatsApp booking initiated (GA4 generate_lead).
 */
export function trackBookingRequest({ method = "whatsapp_direct", customer = {}, lines = [], subtotal = 0 }) {
  trackEvent("generate_lead", {
    currency: "INR",
    value: subtotal,
    lead_type: "whatsapp_booking",
    booking_method: method,
    city: customer.city || "unspecified",
    item_count: lines.length,
    items: (lines || []).map((l) => ({
      item_id: l.product?.id,
      item_name: l.product?.name,
      item_category: l.product?.category,
      price: l.product?.price,
      quantity: l.quantity,
      item_brand: "Shriva Jewels",
    })),
  });
}

