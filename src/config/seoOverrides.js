/**
 * Route-based SEO overrides.
 *
 * Define per-locale meta data keyed by route-specific identifiers.
 * Leave the object empty in production and fill it with the overrides you need.
 *
 * Example:
 * export const SEO_OVERRIDES = {
 *   companies: {
 *     default: {
 *       root: {
 *         title: "Best Companies With Monsbah",
 *         description: "Discover the top companies curated by Monsbah.",
 *       },
 *       "fashion-designers": {
 *         title: "Fashion Designers | Monsbah",
 *         description: "Meet top fashion designers and ateliers on Monsbah.",
 *         keywords: ["fashion", "designers", "atelier"],
 *       },
 *       "fashion-designers::evening-dresses": {
 *         title: "Evening Dress Designers | Monsbah",
 *         description: "Explore evening dress designers hand-picked by Monsbah.",
 *       },
 *     },
 *     "kw-ar": {
 *       root: {
 *         title: "أفضل الشركات مع مناسبة",
 *         description: "اكتشف أفضل الشركات التي تم اختيارها من مناسبة.",
 *       },
 *     },
 *   },
 * };
 */
export const SEO_OVERRIDES = {};
