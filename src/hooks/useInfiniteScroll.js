"use client";
import { useEffect, useRef } from "react";

/**
 * Simple client-side infinite scroll hook with debounce and loading guard.
 *
 * @param {Object} options
 * @param {React.RefObject} options.ref - element ref to check bottom position against viewport
 * @param {boolean} options.hasMore - whether there are more pages
 * @param {boolean} options.isLoading - whether a page fetch is in progress (prevents duplicates)
 * @param {Function} options.onLoadMore - function to call to fetch next page
 * @param {number} [options.offset=200] - pixels before bottom to trigger
 * @param {number} [options.debounceMs=250] - debounce delay in ms
 */
export default function useInfiniteScroll({
  ref,
  hasMore,
  isLoading,
  onLoadMore,
  offset = 200,
  debounceMs = 250,
}) {
  const timer = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handle = () => {
      // debounce
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (!ref?.current) return;

        if (!hasMore || isLoading) return; // guard important

        const rect = ref.current.getBoundingClientRect();
        const sectionBottom = rect.bottom;
        const viewportHeight = window.innerHeight;

        if (sectionBottom <= viewportHeight + offset) {
          onLoadMore?.();
        }
      }, debounceMs);
    };

    window.addEventListener("scroll", handle, { passive: true });

    return () => {
      window.removeEventListener("scroll", handle);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [ref, hasMore, isLoading, onLoadMore, offset, debounceMs]);
}
