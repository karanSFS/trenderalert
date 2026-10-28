import type { Metadata } from "next";
import { ModerationQueueScreen } from "@/components/moderation/ModerationQueueScreen";

export const metadata: Metadata = { title: "Moderation queue" };

export default function ModerationPage() {
  return <ModerationQueueScreen />;
}
