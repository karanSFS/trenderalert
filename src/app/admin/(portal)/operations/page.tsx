import type { Metadata } from "next";
import { OperationsScreen } from "@/components/operations/OperationsScreen";

export const metadata: Metadata = { title: "Operations" };

export default function OperationsPage() {
  return <OperationsScreen />;
}
