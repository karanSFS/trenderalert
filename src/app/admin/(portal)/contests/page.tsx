import type { Metadata } from "next";
import { ContestsScreen } from "@/components/contests/ContestsScreen";

export const metadata: Metadata = { title: "Contests" };

export default function ContestsPage() {
  return <ContestsScreen />;
}
