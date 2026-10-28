import type { Metadata } from "next";
import { UserDetailScreen } from "@/components/users/UserDetailScreen";

export async function generateMetadata({
  params,
}: PageProps<"/admin/users/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `User ${id}` };
}

export default async function UserDetailPage({ params }: PageProps<"/admin/users/[id]">) {
  const { id } = await params;
  return <UserDetailScreen id={id} />;
}
