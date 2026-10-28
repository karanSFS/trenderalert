import type { Metadata } from "next";
import { FeatureFlagsScreen } from "@/components/configuration/FeatureFlagsScreen";

export const metadata: Metadata = { title: "Feature flags" };

export default function FeatureFlagsPage() {
  return <FeatureFlagsScreen />;
}
