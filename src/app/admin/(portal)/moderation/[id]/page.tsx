import type { Metadata } from "next";
import { ReportDetailScreen } from "@/components/moderation/ReportDetailScreen";

export async function generateMetadata({
  params,
}: PageProps<"/admin/moderation/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Report ${id}` };
}

export default async function ReportDetailPage({ params }: PageProps<"/admin/moderation/[id]">) {
  const { id } = await params;
  return <ReportDetailScreen id={id} />;
}
