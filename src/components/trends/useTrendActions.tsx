"use client";

import {
  EditOutlined,
  EyeInvisibleOutlined,
  MergeCellsOutlined,
  StarOutlined,
  StopOutlined,
} from "@ant-design/icons";
import type { RowActionItem } from "@/components/ui/RowActions";
import type { ConfirmSpec } from "@/components/ui/useConfirm";
import { endTrendEarly, setTrendFeatured, setTrendSuppressed } from "@/features/trends/trendsSlice";
import { ACTIVE_TREND_STAGES, type TrendRecord } from "@/features/trends/trendsTypes";
import { formatDateTime } from "@/lib/formatters/date";
import { useDemoAction } from "@/lib/hooks/useDemoAction";
import { useAppDispatch } from "@/store/hooks";

export const isTrendActive = (trend: TrendRecord) =>
  ACTIVE_TREND_STAGES.includes(trend.stage) && !trend.mergedInto;

export type TrendDialog = { kind: "correct" | "merge"; trend: TrendRecord } | null;

export function useTrendActions(
  confirm: (spec: ConfirmSpec) => void,
  openDialog: (dialog: TrendDialog) => void,
  after: () => void,
) {
  const dispatch = useAppDispatch();
  const { run } = useDemoAction();

  const audit = (trend: TrendRecord, action: string, summary: string, reason?: string) => ({
    action: `trend.${action}`,
    targetType: "trend" as const,
    targetId: trend.id,
    summary: `${summary} (${trend.id})`,
    reason,
  });

  const toggleFeatured = (trend: TrendRecord) => {
    const featured = !trend.featured;
    confirm({
      title: featured ? `Feature "${trend.topic}"` : `Remove "${trend.topic}" from featured`,
      consequences: featured
        ? [
            "Shown in featured Radar placements, labeled as featured.",
            "Does not change TrendScore or expiration.",
          ]
        : ["Returns to organic ranking only."],
      confirmLabel: featured ? "Feature Trend" : "Remove from featured",
      requireReason: true,
      onConfirm: (reason) =>
        run(dispatch(setTrendFeatured({ id: trend.id, featured, reason: reason ?? "" })).unwrap(), {
          success: featured ? `${trend.id} featured` : `${trend.id} removed from featured`,
          audit: (updated) =>
            audit(
              updated,
              featured ? "feature" : "unfeature",
              featured ? "Featured Trend" : "Unfeatured Trend",
              reason,
            ),
          after,
        }),
    });
  };

  const toggleSuppressed = (trend: TrendRecord) => {
    const suppressed = !trend.suppressed;
    confirm({
      title: suppressed ? `Suppress "${trend.topic}"` : `Lift suppression on "${trend.topic}"`,
      consequences: suppressed
        ? [
            "Removed from Radar, nearby alerts, map and recommendations.",
            "Still visible on the creator's profile to its audience.",
            "Expiration is unchanged.",
          ]
        : ["Eligible for discovery again until its fixed expiration."],
      confirmLabel: suppressed ? "Suppress Trend" : "Lift suppression",
      danger: suppressed,
      requireReason: true,
      onConfirm: (reason) =>
        run(
          dispatch(setTrendSuppressed({ id: trend.id, suppressed, reason: reason ?? "" })).unwrap(),
          {
            success: suppressed ? `${trend.id} suppressed` : `${trend.id} suppression lifted`,
            audit: (updated) =>
              audit(
                updated,
                suppressed ? "suppress" : "unsuppress",
                suppressed ? "Suppressed Trend" : "Lifted suppression",
                reason,
              ),
            after,
          },
        ),
    });
  };

  const endEarly = (trend: TrendRecord) =>
    confirm({
      title: `End "${trend.topic}" early`,
      description: `Scheduled expiration: ${formatDateTime(trend.expiresAt)}.`,
      consequences: [
        "Immediately removed from Radar, nearby alerts, map and public discovery.",
        "This cannot be undone, and the discovery window cannot be extended or restarted (CNT14-002).",
        "The creator's after-expiration choice (profile, archive or delete) then applies.",
      ],
      confirmLabel: "End discovery now",
      danger: true,
      requireReason: true,
      onConfirm: (reason) =>
        run(dispatch(endTrendEarly({ id: trend.id, reason: reason ?? "" })).unwrap(), {
          success: `${trend.id} ended early`,
          audit: (updated) => audit(updated, "end_early", "Ended Trend early", reason),
          after,
        }),
    });

  const actionItems = (trend: TrendRecord, onView?: () => void): RowActionItem[] => {
    const active = isTrendActive(trend);
    const inactiveReason = trend.mergedInto
      ? `Merged into ${trend.mergedInto}.`
      : "No longer active in discovery.";
    return [
      ...(onView ? [{ key: "view", label: "View details", onSelect: onView }] : []),
      {
        key: "feature",
        label: trend.featured ? "Remove from featured" : "Feature",
        icon: <StarOutlined />,
        permission: "trends:manage",
        disabled: !trend.featured && (!active || trend.suppressed),
        disabledReason: trend.suppressed ? "Suppressed Trends cannot be featured." : inactiveReason,
        onSelect: () => toggleFeatured(trend),
      },
      {
        key: "suppress",
        label: trend.suppressed ? "Lift suppression" : "Suppress",
        icon: <EyeInvisibleOutlined />,
        permission: "trends:manage",
        danger: !trend.suppressed,
        disabled: !trend.suppressed && !active,
        disabledReason: inactiveReason,
        onSelect: () => toggleSuppressed(trend),
      },
      {
        key: "end",
        label: "End early",
        icon: <StopOutlined />,
        permission: "trends:manage",
        danger: true,
        disabled: !active,
        disabledReason: inactiveReason,
        onSelect: () => endEarly(trend),
      },
      {
        key: "correct",
        label: "Correct fields",
        icon: <EditOutlined />,
        permission: "trends:manage",
        onSelect: () => openDialog({ kind: "correct", trend }),
      },
      {
        key: "merge",
        label: "Merge into another Trend",
        icon: <MergeCellsOutlined />,
        permission: "trends:manage",
        disabled: Boolean(trend.mergedInto),
        disabledReason: `Already merged into ${trend.mergedInto}.`,
        onSelect: () => openDialog({ kind: "merge", trend }),
      },
    ];
  };

  return { actionItems };
}
