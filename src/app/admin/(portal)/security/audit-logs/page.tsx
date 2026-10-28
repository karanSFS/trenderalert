import type { Metadata } from "next";
import { Suspense } from "react";
import { AuditLogScreen } from "@/components/security/AuditLogScreen";
import { PageSkeleton } from "@/components/ui/LoadingSkeleton";

export const metadata: Metadata = { title: "Audit logs" };

export default function AuditLogsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AuditLogScreen />
    </Suspense>
  );
}
