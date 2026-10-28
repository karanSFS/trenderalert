import type { Metadata } from "next";
import { Suspense } from "react";
import { TransactionsScreen } from "@/components/finance/TransactionsScreen";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

export const metadata: Metadata = { title: "Transactions" };

export default function TransactionsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TransactionsScreen />
    </Suspense>
  );
}
