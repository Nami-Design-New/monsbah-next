import { Link } from "@/i18n/navigation";
import { getCountries } from "@/services/getCountries";
import { getTranslations } from "next-intl/server";

export default async function Countries() {
  const t = await getTranslations();

  const countries = await getCountries();

  return (
    <div className="countries-section">
      {countries?.map((country) => (
        <Link
          aria-label="Country products"
          to={`/?country=${country?.id}`}
          className="col-lg-4 col-md-6 col-12 p-3"
          key={country?.id}
        >
          <div className="country-box">
            <div className="image-wrapper">
              <img src={country?.cover} alt={"Saudi"} />
            </div>
            <div className="info-wrapper">
              <h5>{country?.name}</h5>
              <span>
                {country?.products_count} {t("ads")}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
