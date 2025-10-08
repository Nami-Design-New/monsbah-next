"use client";

import { useTranslations } from "next-intl";
import { Form } from "react-bootstrap";

export default function SelectField({
  label,
  hint,
  options,
  loading,
  error,
  loadingText,
  ...props
}) {
  const t = useTranslations();

  return (
    <div className="input-field">
      <label htmlFor={props?.id} style={{ flexWrap: "nowrap" }}>
        {label} {hint && <span className="hint">{hint}</span>}
      </label>
      <Form.Select {...props} disabled={loading}>
        <option value="" disabled>
          {loading ? loadingText : t("select")}
        </option>
        {options?.map((option, index) => (
          <option key={index} value={option.value}>
            {option.name}
          </option>
        ))}
      </Form.Select>
      {error && (
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      )}
    </div>
  );
}
