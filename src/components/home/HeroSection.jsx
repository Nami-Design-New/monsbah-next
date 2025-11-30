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
  const firstSliderImage = sliders?.[0]?.image;
  
  return (
    <>
      <h1 style={visuallyHiddenStyle}>{heading}</h1>
      {/* Preload first slider image for better LCP */}
      {firstSliderImage && (
        <link
          rel="preload"
          as="image"
          href={firstSliderImage}
          imageSrcSet={`${firstSliderImage}?w=640 640w, ${firstSliderImage}?w=1080 1080w, ${firstSliderImage}?w=1920 1920w`}
          imageSizes="100vw"
          fetchPriority="high"
        />
      )}
      <HeroSlider sliders={sliders} />
    </>
  );
}
