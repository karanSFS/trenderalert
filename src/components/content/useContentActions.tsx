"use client";

import { DeleteOutlined, EyeInvisibleOutlined, UndoOutlined } from "@ant-design/icons";
import type { RowActionItem } from "@/components/ui/RowActions";
import type { ConfirmSpec } from "@/components/ui/useConfirm";
import { moderateContent } from "@/features/content/contentSlice";
import type { ContentAction, ContentItem } from "@/features/content/contentTypes";
import { CONTENT_TYPE_LABELS } from "@/lib/constants/statusLabels";
import { useDemoAction } from "@/lib/hooks/useDemoAction";
import { useAppDispatch } from "@/store/hooks";

const SPECS: Record<
  ContentAction,
  { label: string; past: string; danger: boolean; consequences: string[] }
> = {
  remove: {
    label: "Remove content",
    past: "removed",
    danger: true,
    consequences: [
      "Removed from feeds, Radar, search, map and every share (SHR14-005).",
      'Shared references show "This Trend is no longer available".',
      "The creator can appeal the decision.",
    ],
  },
  limit: {
    label: "Limit visibility",
    past: "limited",
    danger: true,
    consequences: [
      "Hidden from Radar and public discovery; remains visible to the creator's followers.",
      "The creator is notified and can appeal.",
    ],
  },
  restore: {
    label: "Restore content",
    past: "restored",
    danger: false,
    consequences: ["Returns the content to its original audience.", "Expiration is unchanged."],
  },
};

export function contentActionBlock(item: ContentItem, action: ContentAction): string | null {
  if (action === "remove" && item.moderationStatus === "removed") return "Already removed.";
  if (
    action === "limit" &&
    !(item.moderationStatus === "visible" || item.moderationStatus === "under_review")
  ) {
    return "Only visible content can be limited.";
  }
  if (
    action === "restore" &&
    !(item.moderationStatus === "removed" || item.moderationStatus === "limited")
  ) {
    return "Only removed or limited content can be restored.";
  }
  return null;
}

export function useContentActions(confirm: (spec: ConfirmSpec) => void, after: () => void) {
  const dispatch = useAppDispatch();
  const { run } = useDemoAction();

  const openConfirm = (item: ContentItem, action: ContentAction) => {
    const spec = SPECS[action];
    confirm({
      title: `${spec.label}: ${item.id}`,
      description: `${CONTENT_TYPE_LABELS[item.type]} by @${item.creatorUsername}. Simulated action on fictional content.`,
      consequences: spec.consequences,
      confirmLabel: spec.label,
      danger: spec.danger,
      requireReason: true,
      onConfirm: (reason) =>
        run(dispatch(moderateContent({ id: item.id, action, reason: reason ?? "" })).unwrap(), {
          success: `${item.id} ${spec.past}`,
          audit: (updated) => ({
            action: `content.${action}`,
            targetType: "content",
            targetId: updated.id,
            summary: `${spec.label} ${updated.id}`,
            reason,
          }),
          after,
        }),
    });
  };

  const actionItems = (item: ContentItem, onView?: () => void): RowActionItem[] => [
    ...(onView ? [{ key: "view", label: "View details", onSelect: onView }] : []),
    ...(["remove", "limit", "restore"] as const).map((action) => {
      const blocked = contentActionBlock(item, action);
      return {
        key: action,
        label: SPECS[action].label,
        icon:
          action === "remove" ? (
            <DeleteOutlined />
          ) : action === "limit" ? (
            <EyeInvisibleOutlined />
          ) : (
            <UndoOutlined />
          ),
        permission: "content:moderate" as const,
        danger: SPECS[action].danger,
        disabled: blocked !== null,
        disabledReason: blocked ?? undefined,
        onSelect: () => openConfirm(item, action),
      };
    }),
  ];

  return { openConfirm, actionItems, labels: SPECS };
}
