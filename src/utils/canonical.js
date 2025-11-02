import { BASE_URL } from "@/utils/constants";

const DEFAULT_BASE_URL = "https://monsbah.com";

function getBaseUrl() {
  const explicitBase =
    typeof BASE_URL === "string" && BASE_URL.trim() !== ""
      ? BASE_URL.trim()
      : null;

  const base = explicitBase || DEFAULT_BASE_URL;
  return base.replace(/\/+$/, "");
}

/**
 * Resolve the first valid canonical URL from the provided candidates.
 * Accepts absolute URLs, protocol-relative URLs, and relative paths.
 * Returns a normalized absolute URL or null when no candidate is usable.
 * @param {...(string|undefined|null)} candidates
 * @returns {string|null}
 */
export function resolveCanonicalUrl(...candidates) {
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "string") {
      continue;
    }

    const trimmed = candidate.trim();
    if (!trimmed) {
      continue;
    }

    if (/^https?:\/\//i.test(trimmed)) {
      try {
        return new URL(trimmed).toString();
      } catch {
        continue;
      }
    }

    if (/^\/\//.test(trimmed)) {
      try {
        return new URL(`https:${trimmed}`).toString();
      } catch {
        continue;
      }
    }

    const base = getBaseUrl();
    if (!base) {
      continue;
    }

    const normalizedPath = trimmed.startsWith("/")
      ? trimmed
      : `/${trimmed}`;

    try {
      return new URL(normalizedPath, `${base}/`).toString();
    } catch {
      continue;
    }
  }

  return null;
}
