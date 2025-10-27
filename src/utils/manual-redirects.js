import { PRODUCT_REDIRECTS } from "@/config/manualProductRedirects";

function normalizeValue(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : null;
}

function extractIdentifiers(slug) {
  if (!slug) {
    return { id: null, normalizedSlug: null };
  }

  const normalized = normalizeValue(slug);
  if (!normalized) {
    return { id: null, normalizedSlug: null };
  }

  const idMatch = normalized.match(/(?:^|[^a-z0-9])(id=)(\d+)/i);
  const id = idMatch ? idMatch[2] : null;

  let baseSlug = normalized;
  const idIndex = normalized.indexOf("-id=");
  if (idIndex !== -1) {
    baseSlug = normalized.slice(0, idIndex);
  }

  return {
    id,
    normalizedSlug: baseSlug,
  };
}

function buildCategoryUrl(locale, slug) {
  const encodedSlug = slug ? encodeURIComponent(slug) : "";
  const query = encodedSlug ? `?category=${encodedSlug}` : "";
  return `/${locale}/categories${query}`;
}

function resolveUrlFromDestination(locale, destination) {
  if (!destination) {
    return null;
  }

  if (destination.type === "category") {
    const targetSlug = destination.slug;
    if (!targetSlug) {
      return null;
    }
    return buildCategoryUrl(locale, targetSlug);
  }

  const rawUrl = destination.url;
  if (!rawUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl.replace("{locale}", locale);
  }

  if (rawUrl.startsWith("/")) {
    return rawUrl.replace("{locale}", locale);
  }

  return `/${locale}/${rawUrl.replace("{locale}", locale)}`;
}

export function getManualProductRedirect({ locale, slug }) {
  if (!Array.isArray(PRODUCT_REDIRECTS) || PRODUCT_REDIRECTS.length === 0) {
    return null;
  }

  const { id, normalizedSlug } = extractIdentifiers(slug);

  for (const rule of PRODUCT_REDIRECTS) {
    const ruleIds = Array.isArray(rule.ids) ? rule.ids.map(String) : [];
    const ruleSlugs = Array.isArray(rule.slugs)
      ? rule.slugs.map((value) => normalizeValue(value)).filter(Boolean)
      : [];

    const matchesId = id && ruleIds.includes(String(id));
    const matchesSlug =
      normalizedSlug &&
      ruleSlugs.some((candidate) => candidate === normalizedSlug);

    if (!matchesId && !matchesSlug) {
      continue;
    }

    const destination =
      rule.destinations?.[locale] ?? rule.destinations?.default ?? null;

    const url = resolveUrlFromDestination(locale, destination);
    if (url) {
      return url;
    }
  }

  return null;
}
