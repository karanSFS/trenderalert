import type { Metadata } from "next";
import { Suspense } from "react";
import { ContentScreen } from "@/components/content/ContentScreen";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

export const metadata: Metadata = { title: "Content" };

export default function ContentPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ContentScreen />
    </Suspense>
  );
}
