import type { Metadata } from "next";
import { ContestDetailScreen } from "@/components/contests/ContestDetailScreen";

export async function generateMetadata({
  params,
}: PageProps<"/admin/contests/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Contest ${id}` };
}

export default async function ContestDetailPage({ params }: PageProps<"/admin/contests/[id]">) {
  const { id } = await params;
  return <ContestDetailScreen id={id} />;
}
