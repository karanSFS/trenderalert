import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminUsersScreen } from "@/components/security/AdminUsersScreen";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

export const metadata: Metadata = { title: "Admin users" };

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdminUsersScreen />
    </Suspense>
  );
}
