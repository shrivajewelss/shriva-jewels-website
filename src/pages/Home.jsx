import { usePageMeta } from "../hooks/usePageMeta.js";
import HeroSection from "../components/HeroSection.jsx";
import CategorySection from "../components/CategorySection.jsx";
import FeaturedSection from "../components/FeaturedSection.jsx";
import StorySection from "../components/StorySection.jsx";
import BenefitsSection from "../components/BenefitsSection.jsx";
import InstagramSection from "../components/InstagramSection.jsx";

export default function Home() {
  usePageMeta({
    title: "Shriva Jewels — Jewellery That Speaks Your Style",
    description: "Discover earrings, necklaces, rings, bracelets and anklets from Shriva Jewels. Add to your bag and book on WhatsApp.",
    path: "/",
  });
  return (
    <>
      <HeroSection />
      <CategorySection />
      <FeaturedSection />
      <StorySection />
      <BenefitsSection />
      <InstagramSection />
    </>
  );
}
