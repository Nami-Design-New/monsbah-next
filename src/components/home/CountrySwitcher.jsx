"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import Select from "react-select";
import { useSearchParams } from "next/navigation";

export default function CountrySwitcher({ countries }) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const [selectedCountry, setSelectedCountry] = useState(null);

  const countryOptions = useMemo(
    () =>
      countries?.map(({ name, iso_code }) => ({
        value: iso_code,
        label: name,
      })) || [],
    [countries]
  );

  useEffect(() => {
    const currentCountry = locale.split("-")[0];
    const match = countryOptions.find((opt) => opt.value === currentCountry);
    if (match) {
      setSelectedCountry(match);
    }
  }, [locale, countryOptions]);

  function handleCountryChange(selectedOption) {
    setSelectedCountry(selectedOption);
    const language = locale.split("-")[1];
    const newLocale = `${selectedOption.value}-${language}`;
    const fullPath = `${pathname}`;
    const params = searchParams.toString();
    const fullPathWithQuery = `${fullPath}${params ? `?${params}` : ""}`;

    router.replace(fullPathWithQuery, { locale: newLocale });
  }

  return (
    <Select
      aria-label="Country"
      className="basic-single"
      classNamePrefix="select"
      isSearchable={false}
      placeholder={t("selectCountry")}
      value={selectedCountry}
      onChange={handleCountryChange}
      options={countryOptions}
    />
  );
}
