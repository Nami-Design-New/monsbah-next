import { getSliders } from "@/services/getSliders";
import { META_DATA_CONTENT } from "@/utils/constants";
import { getLocale } from "next-intl/server";
import HeroSlider from "./HeroSlider";

const visuallyHiddenStyle = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export default async function HeroSection() {
  const locale = await getLocale();
  const lang = locale.split("-")[1] || "ar";
  const siteTitle = META_DATA_CONTENT[lang]?.title || META_DATA_CONTENT?.ar?.title || "Monsbah";
  const sliders = await getSliders();
  return (
    <>
      <h1 style={visuallyHiddenStyle}>{siteTitle}</h1>
      <HeroSlider sliders={sliders} />
    </>
  );
}
