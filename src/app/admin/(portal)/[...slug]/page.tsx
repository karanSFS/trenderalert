import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModulePlaceholder } from "@/components/admin/ModulePlaceholder";
import { matchAdminRoute } from "@/lib/constants/adminRoutes";

type Props = PageProps<"/admin/[...slug]">;

async function resolveRoute(params: Props["params"]) {
  const { slug } = await params;
  return matchAdminRoute(`/admin/${slug.join("/")}`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = await resolveRoute(params);
  return { title: route?.label ?? "Not found" };
}

/**
 * Temporary catch-all for admin routes that are registered but not yet built. Each module
 * replaces this by adding its own route folder, which takes precedence over the catch-all.
 */
export default async function AdminModulePlaceholderPage({ params }: Props) {
  const route = await resolveRoute(params);
  if (!route) notFound();
  return <ModulePlaceholder routeKey={route.key} />;
}
