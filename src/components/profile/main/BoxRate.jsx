import { getTranslations } from "next-intl/server";

export default async function BoxRate({ rate }) {
  const t = await getTranslations();
  return (
    <div className="Box_rate">
      <h2>{rate}</h2>
      <div className="icon_rate">
        <p>{t("rates")}</p>
      </div>
    </div>
  );
}
