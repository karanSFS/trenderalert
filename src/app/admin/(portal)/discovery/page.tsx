import type { Metadata } from "next";
import { DiscoveryScreen } from "@/components/discovery/DiscoveryScreen";

export const metadata: Metadata = { title: "Discovery" };

export default function DiscoveryPage() {
  return <DiscoveryScreen />;
}
