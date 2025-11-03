import { getSliders } from "@/services/getSliders";
import { getSettings } from "@/services/settings/getSettings";
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

export default async function HeroSection({ h1Title = null }) {
  const locale = await getLocale();
  const lang = locale.split("-")[1] || "ar";
  
  // Get h1 title from props, settings, or fallback to default
  let heading = h1Title;
  if (!heading) {
    const settings = await getSettings();
    heading = settings?.name || META_DATA_CONTENT[lang]?.title || META_DATA_CONTENT?.ar?.title || "Monsbah";
  }
  
  const sliders = await getSliders();
  return (
    <>
      <h1 style={visuallyHiddenStyle}>{heading}</h1>
      <HeroSlider sliders={sliders} />
    </>
  );
}
