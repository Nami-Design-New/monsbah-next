import { getSliders } from "@/services/getSliders";
import { META_DATA_CONTENT } from "@/utils/constants";
import { getLocale } from "next-intl/server";
import HeroSlider from "./HeroSlider";

export default async function HeroSection() {
  const locale = await getLocale();
  const lang = locale.split("-")[1] || "ar";
  const siteTitle = META_DATA_CONTENT[lang]?.title || META_DATA_CONTENT?.ar?.title || "Monsbah";
  const sliders = await getSliders();
  return (
    <>
      <HeroSlider sliders={sliders} />
    </>
  );
}
