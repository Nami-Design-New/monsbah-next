import { SEO_OVERRIDES } from "@/config/seoOverrides";

const KEY_DELIMITER = "::";

function normalizeSlug(value) {
  if (!value || typeof value !== "string") {
    return null;
  }
  return value.trim().toLowerCase();
}

function buildKeys({ category, subCategory }) {
  const keys = [];
  const normalizedCategory = normalizeSlug(category);
  const normalizedSub = normalizeSlug(subCategory);

  if (normalizedCategory && normalizedSub) {
    keys.push(`${normalizedCategory}${KEY_DELIMITER}${normalizedSub}`);
  }

  if (normalizedCategory) {
    keys.push(normalizedCategory);
  }

  keys.push("root");

  return keys;
}

export function getSeoOverride({ route, locale, category, subCategory }) {
  if (!route) {
    return null;
  }

  const overrides = SEO_OVERRIDES[route];
  if (!overrides) {
    return null;
  }

  const localeOverrides = {
    ...overrides.default,
    ...(locale ? overrides[locale] : null),
  };

  if (!localeOverrides) {
    return null;
  }

  const keys = buildKeys({ category, subCategory });
  for (const key of keys) {
    const override = localeOverrides[key];
    if (override) {
      return override;
    }
  }

  return null;
}
