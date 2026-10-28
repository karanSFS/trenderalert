import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginScreen } from "@/components/auth/AdminLoginScreen";

export const metadata: Metadata = {
  title: "Demo sign-in",
};

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginScreen />
    </Suspense>
  );
}
