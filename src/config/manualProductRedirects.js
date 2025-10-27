/**
 * Manual redirect map for removed or deprecated products.
 *
 * Each entry can match by product ID (extracted from slugs like "dress-id=123")
 * or by the human-readable slug. Destinations can vary per locale.
 *
 * Example:
 * {
 *   ids: ["28185"],
 *   slugs: ["فستان-مميز"],
 *   destinations: {
 *     default: { type: "category", slug: "evening-dresses" },
 *     "ae-ar": { type: "category", slug: "فساتين-سهرة" },
 *     "kw-en": { type: "url", url: "/{locale}/categories?category=dresses" }
 *   }
 * }
 *
 * Destination types:
 * - { type: "category", slug: "slug-here" } ➜ Redirects to /{locale}/categories?category=slug
 * - { type: "url", url: "/custom-path" }    ➜ Redirects to /{locale}/custom-path
 * - { type: "url", url: "https://..." }     ➜ Redirects to the absolute URL
 *   (supports "{locale}" placeholder inside the URL string)
 */
export const PRODUCT_REDIRECTS = [
  // Add manual redirect rules here.
];
