import { AdminLayout } from "@/components/layout/AdminLayout";

export default function AdminPortalLayout({ children }: LayoutProps<"/admin">) {
  return <AdminLayout>{children}</AdminLayout>;
}
