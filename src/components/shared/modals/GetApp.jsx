"use client";

import { useTranslations } from "next-intl";
import { Modal } from "react-bootstrap";

export default function GetApp({ show, setShow }) {
  const t = useTranslations();
  return (
    <Modal
      centered
      show={show}
      onHide={() => setShow(false)}
      className="getAppModal"
    >
      <Modal.Body>
        <h4 className="modalTitle">
          {t("getApp.title")} <span> {t("appName")} </span>
        </h4>
        <h6 className="subtitle"> {t("getApp.subtitle")} </h6>
        <img className="qrcode" src="/icons/qr.svg" alt="" />
        <div className="btns">
          <a
            aria-label="Apple App"
            href="https://apps.apple.com/eg/app/%D9%85%D9%86%D8%A7%D8%B3%D8%A8%D8%A9/id1589937521"
            target="_blank"
          >
            <img src="/icons/appStore.svg" alt="" />
          </a>
          <a
            aria-label="Andorid App"
            href="https://play.google.com/store/apps/details?id=com.app.monasba&pcampaignid=web_share"
            target="_blank"
          >
            <img src="/icons/playStore.svg" alt="" />
          </a>
        </div>
      </Modal.Body>
    </Modal>
  );
}
