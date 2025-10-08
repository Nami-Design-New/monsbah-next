"use client";

import { CATEGORY_TYPES, DRESS_CATEGORY_ID } from "@/utils/constants";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

export default function AdTypeSelector() {
  const { register, control } = useFormContext();
  const t = useTranslations();
  const category_id = useWatch({ control, name: "category_id" });

  const showRentOption = +category_id === DRESS_CATEGORY_ID;

  return (
    <div className="input-field">
      <label htmlFor="type">{t("ads.type")}</label>
      <div className="radios">
        <label htmlFor="sale">
          <input
            type="radio"
            name="type"
            id="sale"
            value={CATEGORY_TYPES.SALE}
            {...register("type")}
          />
          <span>{t("ads.sell")}</span>
        </label>
        {showRentOption && (
          <label htmlFor="rent">
            <input
              type="radio"
              name="type"
              id="rent"
              value={CATEGORY_TYPES.RENT}
              {...register("type")}
            />
            <span>{t("ads.tajeer")}</span>
          </label>
        )}
      </div>
    </div>
  );
}
