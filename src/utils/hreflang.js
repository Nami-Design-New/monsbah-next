import { getLocale } from "next-intl/server";

import {
  BASE_URL,
  META_LOCALES,
  META_LOCALES_DEF,
} from "@/utils/constants";

const FALLBACK_BASE_URL = "https://monsbah.com";

const SITE_URL = (
  typeof BASE_URL === "string" && BASE_URL.trim() !== ""
    ? BASE_URL.trim()
    : FALLBACK_BASE_URL
).replace(/\/+$/, "");

const COUNTRY_NAME_TO_CODE = {
  "saudi arabia": "sa",
  "kingdom of saudi arabia": "sa",
  "kuwait": "kw",
  "state of kuwait": "kw",
  "united arab emirates": "ae",
  "uae": "ae",
  "bahrain": "bh",
  "kingdom of bahrain": "bh",
  "oman": "om",
  "sultanate of oman": "om",
  "qatar": "qa",
  "state of qatar": "qa",
};

const SUPPORTED_LOCALES = META_LOCALES.map((meta) => {
  const [language, country] = meta.split("-");
  const countryLower = country.toLowerCase();
  return {
    meta,
    language,
    country: country.toUpperCase(),
    countryLower,
    hreflang: `${language}-${country.toUpperCase()}`,
    pathLocale: `${countryLower}-${language}`,
  };
});

const DEFAULT_LOCALE_ENTRY =
  SUPPORTED_LOCALES.find((entry) => entry.meta === META_LOCALES_DEF) ||
  SUPPORTED_LOCALES[0];

function normalizePath(path) {
  if (!path || typeof path !== "string") {
    return "/";
  }

  const trimmed = path.trim();
  if (trimmed === "" || trimmed === "/") {
    return "/";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function buildHref(localeSlug, path) {
  const normalizedLocale = localeSlug?.trim().toLowerCase();
  const normalizedPath = normalizePath(path);

  if (!normalizedLocale) {
    return normalizedPath === "/"
      ? `${SITE_URL}`
      : `${SITE_URL}${normalizedPath}`;
  }

  if (normalizedPath === "/") {
    return `${SITE_URL}/${normalizedLocale}`;
  }

  return `${SITE_URL}/${normalizedLocale}${normalizedPath}`;
}

function addGenericLanguageAlternates(
  languages,
  path,
  localeEntries = SUPPORTED_LOCALES
) {
  const seenLanguages = new Set();

  for (const entry of localeEntries) {
    if (seenLanguages.has(entry.language)) {
      continue;
    }

    languages[entry.language] = buildHref(entry.pathLocale, path);
    seenLanguages.add(entry.language);
  }
}

function normalizeLocale(locale) {
  if (!locale || typeof locale !== "string") {
    return null;
  }

  return locale.trim().toLowerCase();
}

function extractCountryFromLocale(locale) {
  const normalized = normalizeLocale(locale);
  if (!normalized) {
    return null;
  }

  const [country] = normalized.split("-");
  return country || null;
}

function resolveLocaleEntry(locale) {
  const normalized = normalizeLocale(locale);
  if (!normalized) {
    return null;
  }

  return (
    SUPPORTED_LOCALES.find(
      (entry) => entry.pathLocale.toLowerCase() === normalized
    ) ?? null
  );
}

function extractCountryFromProduct(product) {
  if (!product || typeof product !== "object") {
    return null;
  }

  const candidates = [
    product.country_slug,
    product.countrySlug,
    product.country_code,
    product.countryCode,
    product.country?.slug,
    product.country?.code,
    product.country?.iso_code,
    product.country?.isoCode,
    product.country?.code2,
    product.country?.iso2,
    product.country?.alpha2,
    product.country?.alpha_2,
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== "string") {
      continue;
    }

    const normalized = candidate.trim().toLowerCase();
    if (!normalized) {
      continue;
    }

    if (normalized.length === 2) {
      return normalized;
    }

    if (COUNTRY_NAME_TO_CODE[normalized]) {
      return COUNTRY_NAME_TO_CODE[normalized];
    }
  }

  const countryNameCandidates = [
    product.country?.name,
    product.country_name,
    product.countryName,
  ];

  for (const candidate of countryNameCandidates) {
    if (typeof candidate !== "string") {
      continue;
    }

    const normalized = candidate.trim().toLowerCase();
    if (!normalized) {
      continue;
    }

    if (COUNTRY_NAME_TO_CODE[normalized]) {
      return COUNTRY_NAME_TO_CODE[normalized];
    }
  }

  return null;
}

function filterLocalesByCountry(country) {
  if (!country) {
    return [];
  }

  const normalized = country.trim().toLowerCase();
  return SUPPORTED_LOCALES.filter(
    (entry) => entry.countryLower === normalized
  );
}

export async function generateHreflangAlternates(path = "/", options = {}) {
  const normalizedPath = normalizePath(path);
  const requestedLocale = options.locale ?? (await getLocale());

  const localeEntry =
    resolveLocaleEntry(requestedLocale) ?? DEFAULT_LOCALE_ENTRY;

  const languages = {};
  for (const entry of SUPPORTED_LOCALES) {
    languages[entry.hreflang] = buildHref(entry.pathLocale, normalizedPath);
  }

  addGenericLanguageAlternates(languages, normalizedPath, SUPPORTED_LOCALES);

  languages["x-default"] = buildHref(
    DEFAULT_LOCALE_ENTRY.pathLocale,
    normalizedPath
  );

  return {
    canonical: buildHref(localeEntry.pathLocale, normalizedPath),
    languages,
  };
}

export async function generateHreflangAlternatesForProduct(
  path = "/",
  product,
  options = {}
) {
  const normalizedPath = normalizePath(path);
  const requestedLocale = options.locale ?? (await getLocale());
  const localeEntry =
    resolveLocaleEntry(requestedLocale) ?? DEFAULT_LOCALE_ENTRY;

  const productCountry =
    options.countryCode ??
    extractCountryFromProduct(product) ??
    extractCountryFromLocale(requestedLocale) ??
    DEFAULT_LOCALE_ENTRY.countryLower;

  const countryLocales = filterLocalesByCountry(productCountry);

  if (countryLocales.length === 0) {
    return generateHreflangAlternates(path, { locale: requestedLocale });
  }

  const languages = {};

  for (const entry of countryLocales) {
    languages[entry.hreflang] = buildHref(entry.pathLocale, normalizedPath);
  }

  const canonicalEntry =
    countryLocales.find(
      (entry) => entry.pathLocale === localeEntry.pathLocale
    ) ?? countryLocales[0];

  languages["x-default"] = buildHref(
    canonicalEntry.pathLocale,
    normalizedPath
  );

  addGenericLanguageAlternates(languages, normalizedPath, countryLocales);

  return {
    canonical: buildHref(canonicalEntry.pathLocale, normalizedPath),
    languages,
  };
}
