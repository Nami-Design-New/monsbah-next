"use client";

import { useMemo, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import Select from "react-select";
import CountrySwitcher from "./CountrySwitcher";
import useGetCities from "@/hooks/queries/settings/useGetCities";
import { Dropdown } from "react-bootstrap";

export default function AdvancedFilter({ countries, selectedCategory }) {
  const t = useTranslations();
  const searchParams = useSearchParams();

  const locale = useLocale();
  const lang = locale.split("-")[1];
  const countryUrl = locale.split("-")[0];

  const selectedCountry = countries.find(
    (country) => country?.iso_code === countryUrl
  );

  const productType = searchParams.get("type") || "";

  const productTypeOptions = useMemo(
    () => [
      { value: "", label: t("all") },
      { value: "sale", label: t("sale") },
      { value: "rent", label: t("rent") },
    ],
    [t]
  );

  const { data: cities } = useGetCities(
    selectedCountry?.id,
    selectedCountry?.id ? true : false
  );

  const updateURLParam = useCallback(
    (key, value, removeKeys = []) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      removeKeys.forEach((k) => params.delete(k));

      const newUrl = `?${params.toString()}`;
      window.history.pushState(null, "", newUrl);
    },
    [searchParams]
  );

  return (
    <div className="filter">
      <div className="selects">
        <CountrySwitcher countries={countries} />

        {(selectedCategory === "dress" || selectedCategory === "فساتين") && (
          <Select
            instanceId="country-select"
            aria-label="Country"
            className="basic-single"
            classNamePrefix="select"
            isSearchable={false}
            placeholder={t("productType")}
            options={productTypeOptions}
            value={productTypeOptions.find((opt) => opt.value === productType)}
            onChange={(e) => updateURLParam("type", e?.value || "")}
          />
        )}
      </div>

      <div className="grid_view">
        <Dropdown>
          <Dropdown.Toggle id="sort-filter-toggle" aria-label="Sort Filter">
            <i className="fa-regular fa-arrow-up-wide-short"></i>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => updateURLParam("sort", "new")}>
              <i className="fa-regular fa-calendar"></i>
              <span>{t("latest")}</span>
            </Dropdown.Item>

            <Dropdown.Item onClick={() => updateURLParam("sort", "near")}>
              <i className="fa-regular fa-location-dot"></i>
              <span>{t("fromNearest")}</span>
            </Dropdown.Item>

            <Dropdown.Item
              onClick={() => updateURLParam("sort", "highest_rated")}
            >
              <i className="fa-regular fa-star"></i>
              <span>{t("highestRate")}</span>
            </Dropdown.Item>

            <Dropdown.Item onClick={() => updateURLParam("sort", "high_price")}>
              <i className="fa-regular fa-arrow-up-wide-short"></i>
              <span>{t("high_price")}</span>
            </Dropdown.Item>

            <Dropdown.Item onClick={() => updateURLParam("sort", "low_price")}>
              <i className="fa-regular fa-arrow-down-wide-short"></i>
              <span>{t("low_price")}</span>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown>
          <Dropdown.Toggle
            id="country-filter-toggle"
            aria-label="Filter Country"
          >
            <i className="fa-sharp fa-light fa-filter"></i>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => updateURLParam("city", "")}>
              {t("all")}
            </Dropdown.Item>
            {cities?.map(({ id, name }) => (
              <Dropdown.Item
                key={id}
                onClick={() => updateURLParam("city", id)}
              >
                {name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
}
