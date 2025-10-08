"use client";

import { detectMobileTypeAndAppLink } from "@/utils/helpers";
import { useEffect, useState } from "react";

export default function DownloadApp() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const isAppDownloaded = localStorage.getItem("appDownloaded");
    if (isAppDownloaded) {
      setShow(false);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("appDownloaded", "true");
    setShow(false);
  };

  const mobileTypeAndLink = detectMobileTypeAndAppLink();

  if (!show) return null;

  return (
    <div className="download_app">
      <button
        aria-label="Close download"
        className="d-flex closeDownload"
        onClick={handleClose}
      >
        <i className="fa-solid fa-times"></i>
      </button>
      <div className="inner">
        <div className="d-flex align-items-center gap-2">
          <div className="icon">
            <img src="/branding/storeicon.svg" alt="store" />
          </div>
          <div className="text">
            <h6>Monasbah.com App</h6>
            <p>Get it on</p>
          </div>
        </div>

        <a href={mobileTypeAndLink} className="get_app" onClick={handleClose}>
          Get
        </a>
      </div>
    </div>
  );
}
