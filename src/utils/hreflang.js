import { getLocale } from "next-intl/server";
import { BASE_URL, META_LOCALES, META_LOCALES_DEF } from "./constants";

/**
 * Generates hreflang URLs for all supported locales
 * @param {string} pathname - The current pathname (without locale)
 * @param {string} baseUrl - The base URL of the website
 * @returns {Object} Object with alternates for hreflang
 */
export async function generateHreflangAlternates(pathname, baseUrl = BASE_URL) {
  const currentLocale = await getLocale(); // e.g., "sa-ar"

  const alternates = {
    canonical: `${baseUrl}/${currentLocale}${pathname}`,
    languages: {},
  };

  const addedLangGeneric = new Set();

  // META_LOCALES are in the form lang-country (e.g., ar-sa). We must map to path locale country-lang (sa-ar)
  META_LOCALES.forEach((meta) => {
    const [lang, country] = meta.split("-");
    const pathLocale = `${country}-${lang}`;
    const url = `${baseUrl}/${pathLocale}${pathname}`;

    // Specific hreflang (e.g., ar-sa)
    alternates.languages[meta] = url;

    // Generic language tag once (ar / en)
    if (!addedLangGeneric.has(lang)) {
      alternates.languages[lang] = url;
      addedLangGeneric.add(lang);
    }
  });

  // x-default points to the default locale's URL
  const [defLang, defCountry] = META_LOCALES_DEF.split("-");
  alternates.languages[
    "x-default"
  ] = `${baseUrl}/${defCountry}-${defLang}${pathname}`;

  return alternates;
}

/**
 * Generates hreflang URLs for product pages based on product's country
 * @param {string} pathname - The current pathname (without locale)
 * @param {Object} product - The product object containing country information
 * @param {string} baseUrl - The base URL of the website
 * @returns {Object} Object with alternates for hreflang
 */
export function generateHreflangAlternatesForProduct(
  pathname,
  product,
  baseUrl = BASE_URL
) {
  // Helper mappers for various country representations
  const PHONE_TO_ISO = {
    966: "sa", // Saudi Arabia
    965: "kw", // Kuwait
    971: "ae", // UAE
    973: "bh", // Bahrain
    968: "om", // Oman
    974: "qa", // Qatar
  };

  const SLUG_TO_ISO = {
    sa: "sa",
    ksa: "sa",
    saudi: "sa",
    "saudi-arabia": "sa",
    saudiarabia: "sa",
    kw: "kw",
    kuwait: "kw",
    ae: "ae",
    uae: "ae",
    "united-arab-emirates": "ae",
    unitedarabemirates: "ae",
    bh: "bh",
    bahrain: "bh",
    om: "om",
    oman: "om",
    qa: "qa",
    qatar: "qa",
  };

  const NAME_TO_ISO = {
    // English
    "saudi arabia": "sa",
    "kingdom of saudi arabia": "sa",
    ksa: "sa",
    saudi: "sa",
    kuwait: "kw",
    "united arab emirates": "ae",
    uae: "ae",
    bahrain: "bh",
    oman: "om",
    qatar: "qa",
    // Arabic common variants
    "المملكة العربية السعودية": "sa",
    السعودية: "sa",
    السعوديه: "sa",
    الكويت: "kw",
    "الإمارات العربية المتحدة": "ae",
    الإمارات: "ae",
    الامارات: "ae",
    البحرين: "bh",
    عمان: "om",
    عُمان: "om",
    "سلطنة عمان": "om",
    قطر: "qa",
  };

  const normalizeCountry = (val) => {
    if (val === null || val === undefined) return null;
    if (typeof val === "number") val = String(val);
    const s = String(val).trim();
    if (!s) return null;

    // Accept 2-letter ISO
    if (/^[A-Za-z]{2}$/.test(s)) return s.toLowerCase();

    // Accept numeric phone codes
    if (/^[0-9]{2,4}$/.test(s)) {
      const iso = PHONE_TO_ISO[s];
      if (iso) return iso;
    }

    const lower = s.toLowerCase();

    // Slug-like strings
    if (SLUG_TO_ISO[lower]) return SLUG_TO_ISO[lower];

    // Names (ar/en)
    const normalizedName = lower.replace(/\s+/g, " ").trim();
    if (NAME_TO_ISO[normalizedName]) return NAME_TO_ISO[normalizedName];

    return null;
  };

  const alternates = {
    canonical: "",
    languages: {},
  };

  const country = product?.country || {};

  const rawCandidates = [
    country?.slug,
    product?.country_slug,
    country?.code,
    country?.iso_code,
    country?.iso,
    country?.isoCode,
    country?.iso2,
    product?.country_code,
    country?.country_code, // often phone code
    country?.name,
    country?.english_name,
    product?.country_name,
  ];

  const normalizedCandidates = rawCandidates
    .map(normalizeCountry)
    .filter(Boolean);
  const productCountryCode = normalizedCandidates[0] || null;

  if (!productCountryCode) {
    return generateHreflangAlternates(pathname, baseUrl);
  }

  const relevantLocales = META_LOCALES.filter((meta) => {
    const [lang, countryPart] = meta.split("-");
    return countryPart.toLowerCase() === productCountryCode;
  });

  if (relevantLocales.length === 0) {
    return generateHreflangAlternates(pathname, baseUrl);
  }

  const addedLangGeneric = new Set();

  relevantLocales.forEach((meta) => {
    const [lang, country] = meta.split("-");
    const pathLocale = `${country}-${lang}`;
    const url = `${baseUrl}/${pathLocale}${pathname}`;

    // Specific hreflang for the product's country (both ar and en)
    alternates.languages[meta] = url;

    // Generic language tags (ar/en) once
    if (!addedLangGeneric.has(lang)) {
      alternates.languages[lang] = url;
      addedLangGeneric.add(lang);
    }
  });

  // Canonical and x-default -> first relevant (keeps order in META_LOCALES, typically ar-* first)
  const [firstLang, firstCountry] = relevantLocales[0].split("-");
  const firstPathLocale = `${firstCountry}-${firstLang}`;
  alternates.canonical = `${baseUrl}/${firstPathLocale}${pathname}`;
  alternates.languages[
    "x-default"
  ] = `${baseUrl}/${firstPathLocale}${pathname}`;

  return alternates;
}

/**
 * Creates hreflang link elements for head
 * @param {string} pathname - The current pathname
 * @param {string} baseUrl - The base URL
 * @returns {Array} Array of link objects for hreflang
 */
export function generateHreflangLinks(pathname, baseUrl = BASE_URL) {
  const links = [];
  const addedLangGeneric = new Set();

  META_LOCALES.forEach((meta) => {
    const [lang, country] = meta.split("-");
    const pathLocale = `${country}-${lang}`;
    const url = `${baseUrl}/${pathLocale}${pathname}`;

    // Add specific locale hreflang (e.g., ar-sa)
    links.push({
      rel: "alternate",
      hrefLang: meta,
      href: url,
    });

    // Add generic language hreflang once (ar/en)
    if (!addedLangGeneric.has(lang)) {
      links.push({
        rel: "alternate",
        hrefLang: lang,
        href: url,
      });
      addedLangGeneric.add(lang);
    }
  });

  // Add x-default pointing to default locale
  const [defLang, defCountry] = META_LOCALES_DEF.split("-");
  links.push({
    rel: "alternate",
    hrefLang: "x-default",
    href: `${baseUrl}/${defCountry}-${defLang}${pathname}`,
  });

  return links;
}

/**
 * Get country mapping for locale
 */
export const COUNTRY_MAPPING = {
  sa: { name: "Saudi Arabia", iso: "SA" },
  kw: { name: "Kuwait", iso: "KW" },
  ae: { name: "UAE", iso: "AE" },
  bh: { name: "Bahrain", iso: "BH" },
  om: { name: "Oman", iso: "OM" },
  qa: { name: "Qatar", iso: "QA" },
};

/**
 * Get current locale info
 * @param {string} locale - Current locale (e.g., "sa-ar")
 * @returns {Object} Locale information
 */
export function getLocaleInfo(locale) {
  const [country, lang] = locale.split("-");
  return {
    country,
    language: lang,
    countryInfo: COUNTRY_MAPPING[country],
    isRTL: lang === "ar",
  };
}
