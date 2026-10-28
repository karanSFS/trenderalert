import type { Metadata } from "next";
import { ConfigurationScreen } from "@/components/configuration/ConfigurationScreen";

export const metadata: Metadata = { title: "Platform settings" };

export default function ConfigurationPage() {
  return <ConfigurationScreen />;
}
