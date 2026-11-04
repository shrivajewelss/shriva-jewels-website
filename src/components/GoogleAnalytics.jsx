import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { initGA, trackPageView } from "../utils/analytics.js";

/**
 * Headless Google Analytics tracker component.
 * Automatically initializes gtag.js and records page views on route changes.
 */
export default function GoogleAnalytics() {
  const location = useLocation();
  const isFirstLoad = useRef(true);

  // Initialize gtag once on mount
  useEffect(() => {
    initGA();
  }, []);

  // Track page views on route changes (skip initial load since gtag config fires the first one)
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      trackPageView(location.pathname + location.search, document.title);
    }, 50);
    return () => clearTimeout(timeout);
  }, [location.pathname, location.search]);

  return null;
}

