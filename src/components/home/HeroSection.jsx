import { getSliders } from "@/services/getSliders";
import HeroSlider from "./HeroSlider";

export default async function HeroSection() {
  const sliders = await getSliders();
  return <HeroSlider sliders={sliders} />;
}
