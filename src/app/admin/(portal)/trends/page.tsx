import type { Metadata } from "next";
import { Suspense } from "react";
import { TrendsScreen } from "@/components/trends/TrendsScreen";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

export const metadata: Metadata = { title: "Trends" };

export default function TrendsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TrendsScreen />
    </Suspense>
  );
}
