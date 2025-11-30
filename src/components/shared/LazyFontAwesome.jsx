"use client";

import { useEffect, useState } from "react";

/**
 * LazyFontAwesome - Loads Font Awesome CSS after initial page load
 * This improves LCP and FCP by deferring non-critical CSS
 */
export default function LazyFontAwesome() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if already loaded
    if (loaded) return;
    
    // Use requestIdleCallback or setTimeout for deferred loading
    const loadFontAwesome = () => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/_next/static/css/font-awesome.css";
      link.onload = () => setLoaded(true);
      document.head.appendChild(link);
    };

    // Load after page is interactive
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadFontAwesome, { timeout: 2000 });
    } else {
      setTimeout(loadFontAwesome, 100);
    }
  }, [loaded]);

  return null;
}
