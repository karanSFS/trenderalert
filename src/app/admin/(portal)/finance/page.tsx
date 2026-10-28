import type { Metadata } from "next";
import { FinanceOverviewScreen } from "@/components/finance/FinanceOverviewScreen";

export const metadata: Metadata = { title: "Finance overview" };

export default function FinancePage() {
  return <FinanceOverviewScreen />;
}
