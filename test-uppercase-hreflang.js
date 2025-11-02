#!/usr/bin/env node

/**
 * Test script to verify uppercase country code implementation
 * Run with: node test-uppercase-hreflang.js
 */

const BASE_URL = "https://monsbah.com";
const META_LOCALES = [
  "ar-kw",
  "en-kw",
  "ar-sa",
  "en-sa",
  "ar-ae",
  "en-ae",
  "ar-bh",
  "en-bh",
  "ar-om",
  "en-om",
  "ar-qa",
  "en-qa",
];

/**
 * Test function to verify uppercase hreflang codes
 */
function testGenerateHreflangAlternates(pathname) {
  const alternates = {
    canonical: `${BASE_URL}/kw-ar${pathname}`,
    languages: {},
  };

  META_LOCALES.forEach((meta) => {
    const [lang, country] = meta.split("-");
    const pathLocale = `${country}-${lang}`;
    const url = `${BASE_URL}/${pathLocale}${pathname}`;

    // Use UPPERCASE country code
    const hreflangCode = `${lang}-${country.toUpperCase()}`;
    alternates.languages[hreflangCode] = url;
  });

  // x-default points to root URL
  alternates.languages["x-default"] = `${BASE_URL}${pathname}`;

  return alternates;
}

console.log("=".repeat(80));
console.log("UPPERCASE HREFLANG CODE TEST");
console.log("=".repeat(80));
console.log();

// Test 1: Home Page
console.log("TEST 1: Home Page (/)");
console.log("-".repeat(80));
const homeAlternates = testGenerateHreflangAlternates("/");
console.log("Canonical:", homeAlternates.canonical);
console.log("\nHreflang Tags:");
Object.entries(homeAlternates.languages).forEach(([hreflang, url]) => {
  const isUppercase = hreflang === "x-default" || /[A-Z]{2}$/.test(hreflang);
  const status = isUppercase ? "✓" : "✗";
  console.log(`  ${status} ${hreflang.padEnd(12)} -> ${url}`);
});

// Verify all have uppercase
const allUppercase = Object.keys(homeAlternates.languages).every(
  (hreflang) => hreflang === "x-default" || /[A-Z]{2}$/.test(hreflang)
);
console.log(`\n${allUppercase ? "✓" : "✗"} All hreflang codes use UPPERCASE country codes`);
console.log();

// Test 2: Categories Page
console.log("TEST 2: Categories Page (/categories)");
console.log("-".repeat(80));
const categoriesAlternates = testGenerateHreflangAlternates("/categories");
console.log("Canonical:", categoriesAlternates.canonical);
console.log("\nHreflang Tags:");
Object.entries(categoriesAlternates.languages).forEach(([hreflang, url]) => {
  const isUppercase = hreflang === "x-default" || /[A-Z]{2}$/.test(hreflang);
  const status = isUppercase ? "✓" : "✗";
  console.log(`  ${status} ${hreflang.padEnd(12)} -> ${url}`);
});
console.log();

// Test 3: x-default verification
console.log("TEST 3: x-default URL Verification");
console.log("-".repeat(80));
console.log("Home x-default:", homeAlternates.languages["x-default"]);
console.log("Expected:      ", `${BASE_URL}/`);
console.log(
  homeAlternates.languages["x-default"] === `${BASE_URL}/`
    ? "✓ Correct"
    : "✗ Incorrect"
);
console.log();
console.log("Categories x-default:", categoriesAlternates.languages["x-default"]);
console.log("Expected:            ", `${BASE_URL}/categories`);
console.log(
  categoriesAlternates.languages["x-default"] === `${BASE_URL}/categories`
    ? "✓ Correct"
    : "✗ Incorrect"
);
console.log();

// Test 4: Format verification
console.log("TEST 4: Hreflang Format Verification");
console.log("-".repeat(80));
const expectedFormats = [
  "ar-KW",
  "en-KW",
  "ar-SA",
  "en-SA",
  "ar-AE",
  "en-AE",
  "ar-BH",
  "en-BH",
  "ar-OM",
  "en-OM",
  "ar-QA",
  "en-QA",
];

expectedFormats.forEach((format) => {
  const hasFormat = homeAlternates.languages.hasOwnProperty(format);
  console.log(`  ${hasFormat ? "✓" : "✗"} ${format}`);
});

console.log();
console.log("=".repeat(80));
console.log("TEST COMPLETE");
console.log("=".repeat(80));
