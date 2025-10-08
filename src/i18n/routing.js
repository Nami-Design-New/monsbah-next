import { defineRouting } from "next-intl/routing";

export const LOCALES = [
  "sa-ar",
  "sa-en",
  "kw-ar",
  "kw-en",
  "ae-ar",
  "ae-en",
  "bh-ar",
  "bh-en",
  "om-ar",
  "om-en",
  "qa-ar",
  "qa-en",
];
export const DEFAULT_LOCALE = "kw-ar";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
});
