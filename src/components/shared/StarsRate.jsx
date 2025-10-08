"use client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import CompanyReviewsModal from "./modals/CompanyReviewsModal";

export default function StarsRate({
  rate,
  reviewsCount,
  company,
  isMyCompany,
  showbtn = false,
}) {
  const t = useTranslations();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="stars_rate">
      <div className="stars">
        {rate
          ? Array(Math.round(rate))
              .fill(0)
              .map(() => {
                return (
                  <Image
                    width={16}
                    height={16}
                    key={Math.random()}
                    src="/icons/star-filled.svg"
                    alt="filled star"
                  />
                );
              })
          : null}
        {rate
          ? Array(5 - Math.round(rate))
              .fill(0)
              .map(() => {
                return (
                  <Image
                    width={16}
                    height={16}
                    key={Math.random()}
                    src="/icons/star.svg"
                    alt="star"
                  />
                );
              })
          : null}
      </div>
      {reviewsCount ? (
        <>
          <span>
            [ {reviewsCount} {t("review")} ]
          </span>

          {showbtn ? (
            <span onClick={() => setShowModal(true)} className="viewRates">
              {t("viewRates")}
            </span>
          ) : null}
        </>
      ) : null}

      <CompanyReviewsModal
        showModal={showModal}
        setShowModal={setShowModal}
        company={company}
        isMyCompany={isMyCompany}
      />
    </div>
  );
}
