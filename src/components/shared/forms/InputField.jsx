"use client";

import { Form } from "react-bootstrap";

export default function InputField({ label, hint, error, ...props }) {
  return (
    <div className="input-field">
      {label && (
        <label htmlFor={props?.id}>
          {label} {hint && <span className="hint">{hint}</span>}
        </label>
      )}

      <Form.Control isInvalid={!!error} {...props} />

      {error && (
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      )}
    </div>
  );
}
