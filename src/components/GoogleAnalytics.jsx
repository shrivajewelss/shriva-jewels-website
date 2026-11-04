import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initGA, trackPageView } from "../utils/analytics.js";

/**
 * Headless Google Analytics tracker component.
 * Automatically initializes gtag.js and records page views on route changes.
 */
export default function GoogleAnalytics() {
  const location = useLocation();

  // Initialize gtag once on mount
  useEffect(() => {
    initGA();
  }, []);

  // Track page views on route changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      trackPageView(location.pathname + location.search, document.title);
    }, 50);
    return () => clearTimeout(timeout);
  }, [location.pathname, location.search]);

  return null;
}

