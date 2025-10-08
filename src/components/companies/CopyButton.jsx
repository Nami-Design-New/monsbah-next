"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function CopyButton() {
  const t = useTranslations();
  const [showTooltip, setShowTooltip] = useState(false);
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {props.content}
    </Tooltip>
  );
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.href);
    setShowTooltip(true);
  };

  return (
    <OverlayTrigger
      placement="bottom"
      show={showTooltip}
      overlay={renderTooltip({
        content: t("services.linkCopied"),
      })}
    >
      <button className="share_link" onClick={handleCopy}>
        <i className="fa-regular fa-copy"></i> {t("copyLink")}
      </button>
    </OverlayTrigger>
  );
}
