"use client";

import PhoneInput from "@/components/shared/forms/PhoneInput";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { Controller, useFormContext } from "react-hook-form";

export default function ProductContactOptions({}) {
  const t = useTranslations();
  const {
    register,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useFormContext();
  const active_call = watch("active_call");
  const active_whatsapp = watch("active_whatsapp");
  const active_chat = watch("active_chat");
  const newPhoneNumber = watch("newPhoneNumber");

  const { user } = useAuthStore((state) => state);
  const [selectedCountry, setSelectedCountry] = useState(user?.country);

  useEffect(() => {
    setValue("country_id", user?.country?.id);
    setValue("currency_id", user?.country?.currency?.id);
  }, [selectedCountry]);

  return (
    <>
      <div className="form_group">
        <div className="input-field">
          <label htmlFor="type">
            {t("ads.contact")} <span>( {t("ads.contactNote")} )</span>
          </label>
          <div className="radios">
            <label htmlFor="active_call">
              <input
                type="checkbox"
                name="active_call"
                id="active_call"
                checked={active_call === "active"}
                onChange={(e) =>
                  setValue(
                    "active_call",
                    e.target.checked ? "active" : "inactive"
                  )
                }
              />
              <span>{t("ads.call")}</span>
            </label>
            <label htmlFor="active_whatsapp">
              <input
                type="checkbox"
                name="active_whatsapp"
                id="active_whatsapp"
                checked={active_whatsapp === "active"}
                onChange={(e) =>
                  setValue(
                    "active_whatsapp",
                    e.target.checked ? "active" : "inactive"
                  )
                }
              />
              <span>{t("ads.whatsapp")}</span>
            </label>
            <label htmlFor="active_chat">
              <input
                type="checkbox"
                name="active_chat"
                id="active_chat"
                checked={active_chat === "active"}
                onChange={(e) =>
                  setValue(
                    "active_chat",
                    e.target.checked ? "active" : "inactive"
                  )
                }
              />
              <span>{t("ads.chat")}</span>
            </label>
          </div>
        </div>
      </div>

      <div className="form_group">
        <div className="question p-0 pt-4">
          <label htmlFor="newPhoneNumber" className="quest">
            {t("ads.doYouWantToAddNewPhoneNumber")}
          </label>
          <Form.Switch
            id="newPhoneNumber"
            name="newPhoneNumber"
            checked={newPhoneNumber}
            onChange={() => {
              setValue("newPhoneNumber", !newPhoneNumber);
              setValue("phone", "");
            }}
          />
        </div>
      </div>

      {newPhoneNumber && (
        <div className="form_group">
          {" "}
          <Controller
            name="country_code"
            control={control}
            render={({ field }) => (
              <PhoneInput
                label={t("verification.phone")}
                id="phone"
                placeholder={t("verification.phone")}
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
                limit={selectedCountry?.number_limit}
                {...register("phone")}
                onCountryChange={(country) =>
                  field.onChange(country?.country_code)
                }
                error={errors?.phone?.message}
              />
            )}
          />
        </div>
      )}
    </>
  );
}
