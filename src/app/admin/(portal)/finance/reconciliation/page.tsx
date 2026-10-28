import type { Metadata } from "next";
import { Suspense } from "react";
import { ReconciliationScreen } from "@/components/finance/ReconciliationScreen";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

export const metadata: Metadata = { title: "Reconciliation" };

export default function ReconciliationPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ReconciliationScreen />
    </Suspense>
  );
}
