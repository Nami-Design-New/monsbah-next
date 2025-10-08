"use client";

import { useEffect, useState } from "react";

const OtpContainer = ({ formData, setFormData }) => {
  const [otpValue, setOtpValue] = useState("");

  useEffect(() => {
    const firstInput = document.getElementById("input1");
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  const handleInput = (index, event) => {
    const currentInput = event.target;
    const maxLength = parseInt(currentInput.getAttribute("maxlength"), 10);

    if (otpValue.length >= 4) {
      return;
    }

    if (currentInput.value.length >= maxLength) {
      const nextInput = document.getElementById(`input${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }

    const newOtpValue =
      otpValue.substring(0, index - 1) +
      currentInput.value +
      otpValue.substring(index);

    if (newOtpValue.length <= 6) {
      setOtpValue(newOtpValue);
      setFormData({ ...formData, code: newOtpValue });
    }
  };

  const handleKeyDown = (index, event) => {
    const currentInput = event.target;
    const previousInput = document.getElementById(`input${index - 1}`);

    if (
      event.key === "Backspace" &&
      currentInput.value.length === 0 &&
      previousInput
    ) {
      previousInput.focus();
    }

    if (event.key === "Backspace") {
      const newOtpValue =
        otpValue.substring(0, index - 1) + otpValue.substring(index);

      setOtpValue(newOtpValue);
      setFormData({ ...formData, code: newOtpValue });
    }
  };

  return (
    <div className="otp-container">
      {[1, 2, 3, 4].map((index) => (
        <input
          key={index}
          id={`input${index}`}
          className="otp-input"
          type="number"
          maxLength="1"
          inputMode="numeric"
          pattern="[0-9]"
          required
          value={otpValue[index - 1] || ""}
          onChange={(e) => handleInput(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
        />
      ))}
    </div>
  );
};

export default OtpContainer;
