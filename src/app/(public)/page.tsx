import type { Metadata } from "next";
import { CallToAction } from "@/components/promotional/CallToAction";
import { FeatureSection } from "@/components/promotional/FeatureSection";
import { HeroSection } from "@/components/promotional/HeroSection";
import { HowItWorksSection } from "@/components/promotional/HowItWorksSection";
import { PrivacyTrustSection } from "@/components/promotional/PrivacyTrustSection";
import { ProductSection } from "@/components/promotional/ProductSection";

const description =
  "Discover rising trends early, understand why they matter and follow how they spread across places and communities.";

export const metadata: Metadata = {
  title: { absolute: "TrenderAlert | See It First" },
  description,
  openGraph: {
    title: "TrenderAlert | See It First",
    description,
    type: "website",
    siteName: "TrenderAlert",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProductSection />
      <FeatureSection />
      <HowItWorksSection />
      <PrivacyTrustSection />
      <CallToAction />
    </>
  );
}
