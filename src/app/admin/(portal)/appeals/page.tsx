import type { Metadata } from "next";
import { Suspense } from "react";
import { AppealsScreen } from "@/components/appeals/AppealsScreen";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

export const metadata: Metadata = { title: "Appeals" };

export default function AppealsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AppealsScreen />
    </Suspense>
  );
}
