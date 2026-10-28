import type { Metadata } from "next";
import { Suspense } from "react";
import { SupportScreen } from "@/components/support/SupportScreen";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

export const metadata: Metadata = { title: "Support cases" };

export default function SupportPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SupportScreen />
    </Suspense>
  );
}
