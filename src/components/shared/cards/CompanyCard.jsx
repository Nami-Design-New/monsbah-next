"use client";

import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import Image from "next/image";
import StarsRate from "../StarsRate";

export default function CompanyCard({ company }) {
  const { user } = useAuthStore((state) => state);

  return (
    <Link
      aria-label="Product"
      href={`${
        company?.id === user?.id
          ? "/company-profile"
          : `/company-details/${company?.id}`
      }`}
      className="campany_card"
    >
      <div className="img position-relative">
        <Image
          fill={true}
          src={company?.image}
          sizes="(max-width: 86px) 100vw, (max-width: 60px) 50vw, 300px"
          alt=""
        />
        {/* <ImageLoad isImageLoaded={false} /> */}
      </div>
      <div className="content">
        <div className="title">
          <h3>{company?.name}</h3>
        </div>
        <ul>
          <li className="w-100">
            <i className="fa-light fa-location-dot"> </i> {company?.city_name} ،{" "}
            {company?.country_name}
          </li>
          <li>
            <StarsRate
              rate={company?.rate}
              reviewsCount={company?.["rate-count"]}
            />
          </li>
        </ul>
      </div>
    </Link>
  );
}
