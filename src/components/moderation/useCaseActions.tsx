"use client";

import type { ConfirmSpec } from "@/components/ui/useConfirm";
import { MODERATION_REVIEWERS } from "@/data/mock";
import type { AuditTargetType } from "@/features/audit/auditTypes";
import { selectCurrentAdmin } from "@/features/auth/authSelectors";
import { actOnCase, assignCase } from "@/features/moderation/moderationSlice";
import {
  OPEN_CASE_STATUSES,
  type ModerationActionType,
  type ModerationCase,
} from "@/features/moderation/moderationTypes";
import { MODERATION_ACTION_LABELS } from "@/lib/constants/statusLabels";
import { useDemoAction } from "@/lib/hooks/useDemoAction";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const CONSEQUENCES: Record<ModerationActionType, string[]> = {
  dismiss: ["Closes the case with no action.", "The reporter is told the report was reviewed."],
  warn: [
    "Adds a strike to the account.",
    "The member is shown which policy applies.",
    "Closes the case.",
  ],
  remove_content: [
    "Removes the content everywhere it appears, including shares (SHR14-005).",
    "Restricted evidence is kept only for documented safety requirements.",
    "Closes the case; the creator can appeal.",
  ],
  limit_content: [
    "Removes the content from Radar and public discovery.",
    "Closes the case; the creator can appeal.",
  ],
  restrict_account: [
    "Limits posting, commenting and messaging for the account.",
    "Adds a strike. Closes the case; the member can appeal.",
  ],
  suspend_account: [
    "The account cannot sign in, post or message.",
    "Adds a strike. Closes the case; the member can appeal.",
  ],
  escalate: ["Moves the case to senior review.", "The case stays open."],
};

export const CONTENT_ACTIONS: ModerationActionType[] = ["remove_content", "limit_content"];
export const ACCOUNT_ACTIONS: ModerationActionType[] = ["restrict_account", "suspend_account"];
export const isCaseOpen = (item: ModerationCase) => OPEN_CASE_STATUSES.includes(item.status);

export function caseActionBlock(item: ModerationCase, action: ModerationActionType): string | null {
  if (!isCaseOpen(item)) return "This case is closed.";
  if (CONTENT_ACTIONS.includes(action) && !item.contentId)
    return "This report is not about a Trend or post.";
  if (action === "escalate" && item.status === "escalated") return "Already escalated.";
  return null;
}

function auditTarget(
  item: ModerationCase,
  action: ModerationActionType,
): { targetType: AuditTargetType; targetId: string } {
  if (ACCOUNT_ACTIONS.includes(action) || action === "warn")
    return { targetType: "user", targetId: item.accountId };
  if (CONTENT_ACTIONS.includes(action) && item.contentId)
    return { targetType: "content", targetId: item.contentId };
  return { targetType: "moderationCase", targetId: item.id };
}

export function useCaseActions(confirm: (spec: ConfirmSpec) => void, after: () => void) {
  const dispatch = useAppDispatch();
  const admin = useAppSelector(selectCurrentAdmin);
  const { run, runWithToast } = useDemoAction();

  const openAction = (item: ModerationCase, action: ModerationActionType) => {
    const label = MODERATION_ACTION_LABELS[action];
    confirm({
      title: `${label}: ${item.id}`,
      description: `${item.category} · ${item.reportedItemLabel}. Simulated decision on a fictional case.`,
      consequences: CONSEQUENCES[action],
      confirmLabel: label,
      danger: action !== "dismiss" && action !== "escalate",
      requireReason: { label: "Reason (shared with the member where applicable)" },
      onConfirm: (reason) =>
        run(dispatch(actOnCase({ id: item.id, action, reason: reason ?? "" })).unwrap(), {
          success: `${label} on ${item.id}`,
          audit: (updated) => ({
            action: `moderation.${action}`,
            ...auditTarget(updated, action),
            summary: `${label} (case ${updated.id})`,
            reason,
          }),
          after,
        }),
    });
  };

  const assignToMe = (item: ModerationCase) =>
    admin
      ? runWithToast(
          dispatch(
            assignCase({ id: item.id, reviewer: { id: admin.id, name: admin.displayName } }),
          ).unwrap(),
          {
            success: `${item.id} assigned to you`,
            audit: (updated) => ({
              action: "moderation.assign",
              targetType: "moderationCase",
              targetId: updated.id,
              summary: `Assigned ${updated.id} to ${admin.displayName}`,
            }),
            after,
          },
        )
      : undefined;

  const unassign = (item: ModerationCase) =>
    runWithToast(dispatch(assignCase({ id: item.id, reviewer: null })).unwrap(), {
      success: `${item.id} unassigned`,
      audit: (updated) => ({
        action: "moderation.unassign",
        targetType: "moderationCase",
        targetId: updated.id,
        summary: `Unassigned ${updated.id}`,
      }),
      after,
    });

  return {
    openAction,
    assignToMe,
    unassign,
    currentAdminId: admin?.id ?? null,
    reviewers: MODERATION_REVIEWERS,
  };
}
