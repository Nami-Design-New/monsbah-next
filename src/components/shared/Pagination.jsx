"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * SEO-friendly pagination that works even if JavaScript is disabled.
 * It simply renders <a> links with ?page=N preserving existing query params.
 * When JS is enabled, the app can intercept navigation, otherwise the browser
 * performs a full page reload which is still fine (progressive enhancement).
 *
 * Props:
 *   currentPage (number) – the currently active page (1-based)
 *   totalPages  (number) – total number of pages
 */
export default function Pagination({ currentPage = 1, totalPages = 1 }) {
  // Render pagination only inside <noscript> so it's visible when JS disabled

  currentPage = Number(currentPage);
  totalPages = Number(totalPages);

  if (totalPages <= 1) return null; // no need to paginate

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const baseParams = new URLSearchParams(searchParams.toString());

  const buildHref = (page) => {
    const params = new URLSearchParams(baseParams.toString());
    if (page && page !== 1) {
      params.set("page", page);
    } else {
      params.delete("page");
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  // Determine which page numbers to show (simple sliding window)
  const windowSize = 2;
  const pages = [];
  const start = Math.max(1, currentPage - windowSize);
  const end = Math.min(totalPages, currentPage + windowSize);
  for (let p = start; p <= end; p++) pages.push(p);

  const Li = ({ children }) => <li className="d-inline-block mx-1">{children}</li>;

  const nav = (
    <nav aria-label="Pagination" className="pagination-wrapper text-center my-4">
      <ul className="list-unstyled m-0 p-0">
        {currentPage > 1 && (
          <Li>
            <a href={buildHref(currentPage - 1)} rel="prev" className="px-3 py-1 border rounded">
              « Prev
            </a>
          </Li>
        )}

        {start > 1 && (
          <Li>
            <a href={buildHref(1)} className="px-3 py-1 border rounded">
              1
            </a>
          </Li>
        )}
        {start > 2 && <Li>…</Li>}

        {pages.map((p) => (
          <Li key={p}>
            <a
              href={buildHref(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`px-3 py-1 border rounded ${p === currentPage ? "active" : ""}`}
            >
              {p}
            </a>
          </Li>
        ))}

        {end < totalPages - 1 && <Li>…</Li>}
        {end < totalPages && (
          <Li>
            <a href={buildHref(totalPages)} className="px-3 py-1 border rounded">
              {totalPages}
            </a>
          </Li>
        )}

        {currentPage < totalPages && (
          <Li>
            <a href={buildHref(currentPage + 1)} rel="next" className="px-3 py-1 border rounded">
              Next »
            </a>
          </Li>
        )}
      </ul>
    </nav>
  );

  return <noscript>{nav}</noscript>;

}