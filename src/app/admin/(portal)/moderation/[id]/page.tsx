import type { Metadata } from "next";
import { CaseDetailScreen } from "@/components/moderation/CaseDetailScreen";

export async function generateMetadata({
  params,
}: PageProps<"/admin/moderation/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Case ${id}` };
}

export default async function CaseDetailPage({ params }: PageProps<"/admin/moderation/[id]">) {
  const { id } = await params;
  return <CaseDetailScreen id={id} />;
}
