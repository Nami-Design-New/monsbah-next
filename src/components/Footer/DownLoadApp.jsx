import { getTranslations } from "next-intl/server";
import Image from "next/image";
import React from "react";

const DownLoadApp = async () => {
  const t = await getTranslations();
  return (
    <>
      <h3>{t("downloadApp")}</h3>
      <div className="btns">
        <a
          href="https://apps.apple.com/kw/app/%D9%85%D9%86%D8%A7%D8%B3%D8%A8%D8%A9/id1589937521?l=ar"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Apple App"
        >
          <Image
            width={142}
            height={42}
            src="/icons/appStore.svg"
            alt="App Store"
          />
        </a>
        <a
          href="https://play.google.com/store/apps/details?id=com.app.monasba&pcampaignid=web_share"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Android App"
        >
          <Image
            width={142}
            height={42}
            src="/icons/playStore.svg"
            alt="Google Play"
          />
        </a>
      </div>
    </>
  );
};

export default DownLoadApp;
