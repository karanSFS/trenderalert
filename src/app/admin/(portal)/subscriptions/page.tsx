import type { Metadata } from "next";
import { Suspense } from "react";
import { SubscriptionsScreen } from "@/components/finance/SubscriptionsScreen";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

export const metadata: Metadata = { title: "Subscriptions" };

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SubscriptionsScreen />
    </Suspense>
  );
}
