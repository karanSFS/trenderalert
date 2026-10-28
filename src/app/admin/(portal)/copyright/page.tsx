import type { Metadata } from "next";
import { Suspense } from "react";
import { CopyrightScreen } from "@/components/copyright/CopyrightScreen";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

export const metadata: Metadata = { title: "Copyright" };

export default function CopyrightPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CopyrightScreen />
    </Suspense>
  );
}
