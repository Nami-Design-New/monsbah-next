"use client";
import React, { useEffect, useState, useCallback } from "react";

const ResendCodeTimer = ({
  initialTime = 60,
  onResend,
  disabledText = "",
  resendText = "Resend Code",
  didNotReceiveText = "Didn't receive the code?",
}) => {
  const [timer, setTimer] = useState(initialTime);
  const [resendDisabled, setResendDisabled] = useState(true);

  useEffect(() => {
    let interval = null;
    if (resendDisabled) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendDisabled]);

  const handleResendClick = useCallback(() => {
    if (resendDisabled) return;
    setResendDisabled(true);
    setTimer(initialTime);
    onResend?.();
  }, [resendDisabled, onResend, initialTime]);

  return (
    <div className="resend-code">
      <span className={`resend_link ${resendDisabled ? "disabled" : ""}`}>
        {didNotReceiveText}{" "}
        <span
          className="resend_button"
          style={{ cursor: resendDisabled ? "not-allowed" : "pointer" }}
          onClick={handleResendClick}
        >
          {resendText}
        </span>
      </span>
      <div className="timer flex-row-reverse" style={{ justifyContent: "end" }}>
        <span>{String(Math.floor(timer / 60)).padStart(2, "0")}</span>:
        <span>{String(timer % 60).padStart(2, "0")}</span>
      </div>
    </div>
  );
};

export default ResendCodeTimer;
