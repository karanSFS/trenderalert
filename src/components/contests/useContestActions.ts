"use client";

import type { RowActionItem } from "@/components/ui/RowActions";
import type { ConfirmSpec } from "@/components/ui/useConfirm";
import {
  decideContest,
  lockContestRules,
  resolveContestDispute,
  setContestEntryStatus,
  submitContestForReview,
} from "@/features/contests/contestsSlice";
import type {
  Contest,
  ContestDecision,
  ContestDispute,
  ContestEntry,
} from "@/features/contests/contestsTypes";
import { useDemoAction } from "@/lib/hooks/useDemoAction";
import { useAppDispatch } from "@/store/hooks";

export const PAID_CONTESTS_DISABLED =
  "Paid contests are disabled until legal, payment-provider and operations approvals are recorded by the backend.";

const CANCELLABLE = ["draft", "pending_review", "approved", "active"];

export type ContestActionKey = "lockRules" | "submit" | ContestDecision;

/** Why an action is unavailable for this contest, or null when it is allowed. */
export function contestActionBlock(contest: Contest, action: ContestActionKey): string | null {
  switch (action) {
    case "lockRules":
      if (contest.status !== "draft") return "Rules can only be locked on a draft.";
      return contest.rules.locked ? "The rules are already locked." : null;
    case "submit":
      if (contest.status !== "draft") return "Only drafts can be submitted for review.";
      return contest.rules.locked ? null : "Lock the official rules first.";
    case "approve":
      if (contest.status !== "pending_review") return "Only contests in review can be approved.";
      if (contest.type === "paid") return PAID_CONTESTS_DISABLED;
      if (!contest.rules.locked) return "The official rules must be locked first.";
      if (contest.fundingStatus !== "verified") return "Prize funding has not been verified.";
      if (contest.approvals.legal !== "approved" || contest.approvals.operations !== "approved")
        return "Legal and operations approvals are still outstanding.";
      return null;
    case "request_changes":
      return contest.status === "pending_review"
        ? null
        : "Only contests in review can be returned.";
    case "cancel":
      return CANCELLABLE.includes(contest.status)
        ? null
        : "This contest can no longer be cancelled.";
  }
}

const DECISIONS: Record<
  ContestDecision,
  { label: string; consequences: string[]; danger: boolean }
> = {
  approve: {
    label: "Approve for publication",
    danger: false,
    consequences: [
      "The contest is scheduled to open on its entry start date.",
      "Rules and prize terms stay locked from now on.",
    ],
  },
  request_changes: {
    label: "Request changes",
    danger: false,
    consequences: ["Returns the contest to draft and unlocks the rules for editing."],
  },
  cancel: {
    label: "Cancel contest",
    danger: true,
    consequences: [
      "Ends the contest under its official rules; terms are never changed mid-contest.",
      "Entrants are notified. Any prize handling follows the official rules.",
    ],
  },
};

export function useContestActions(confirm: (spec: ConfirmSpec) => void, after: () => void) {
  const dispatch = useAppDispatch();
  const { run, runWithToast } = useDemoAction();

  const decide = (contest: Contest, decision: ContestDecision) => {
    const spec = DECISIONS[decision];
    confirm({
      title: `${spec.label}: ${contest.name}`,
      description: `${contest.id} · sponsored by ${contest.sponsor}`,
      consequences: spec.consequences,
      confirmLabel: spec.label,
      danger: spec.danger,
      requireReason: true,
      onConfirm: (reason) =>
        run(dispatch(decideContest({ id: contest.id, decision, reason: reason ?? "" })).unwrap(), {
          success: `${contest.id}: ${spec.label.toLowerCase()}`,
          audit: (updated) => ({
            action: `contest.${decision}`,
            targetType: "contest",
            targetId: updated.id,
            summary: `${spec.label} (${updated.id})`,
            reason,
          }),
          after,
        }),
    });
  };

  const lockRules = (contest: Contest) =>
    confirm({
      title: `Lock official rules for ${contest.name}`,
      consequences: [
        `Rules ${contest.rules.version} become read-only.`,
        "Changes after this point require returning the contest to draft.",
      ],
      confirmLabel: "Lock rules",
      onConfirm: () =>
        run(dispatch(lockContestRules(contest.id)).unwrap(), {
          success: `${contest.id}: rules locked`,
          audit: (updated) => ({
            action: "contest.lock_rules",
            targetType: "contest",
            targetId: updated.id,
            summary: `Locked official rules ${updated.rules.version} (${updated.id})`,
          }),
          after,
        }),
    });

  const submit = (contest: Contest) =>
    runWithToast(dispatch(submitContestForReview(contest.id)).unwrap(), {
      success: `${contest.id}: submitted for review`,
      audit: (updated) => ({
        action: "contest.submit_for_review",
        targetType: "contest",
        targetId: updated.id,
        summary: `Submitted contest ${updated.id} for legal review`,
      }),
      after,
    });

  const setEntryStatus = (
    contest: Contest,
    entry: ContestEntry,
    status: "valid" | "disqualified",
  ) =>
    confirm({
      title: status === "disqualified" ? `Disqualify entry ${entry.id}` : `Clear entry ${entry.id}`,
      description: `@${entry.username} in ${contest.name}`,
      consequences:
        status === "disqualified"
          ? [
              "The entry is excluded from judging.",
              "The entrant is notified and may dispute the decision.",
            ]
          : ["The flag is removed and the entry stays in judging."],
      confirmLabel: status === "disqualified" ? "Disqualify" : "Clear flag",
      danger: status === "disqualified",
      requireReason: true,
      onConfirm: (reason) =>
        run(
          dispatch(
            setContestEntryStatus({
              id: contest.id,
              entryId: entry.id,
              status,
              reason: reason ?? "",
            }),
          ).unwrap(),
          {
            success: `${entry.id}: ${status === "disqualified" ? "disqualified" : "cleared"}`,
            audit: (updated) => ({
              action: `contest.entry_${status}`,
              targetType: "contest",
              targetId: updated.id,
              summary: `${status === "disqualified" ? "Disqualified" : "Cleared"} entry ${entry.id} (${updated.id})`,
              reason,
            }),
            after,
          },
        ),
    });

  const resolveDispute = (contest: Contest, dispute: ContestDispute) =>
    confirm({
      title: `Resolve dispute ${dispute.id}`,
      description: dispute.summary,
      consequences: [
        "The entrant is told the outcome.",
        "The resolution is kept in the contest history.",
      ],
      confirmLabel: "Resolve dispute",
      requireReason: {
        label: "Resolution",
        placeholder: "Explain the outcome under the official rules",
      },
      onConfirm: (resolution) =>
        run(
          dispatch(
            resolveContestDispute({
              id: contest.id,
              disputeId: dispute.id,
              resolution: resolution ?? "",
            }),
          ).unwrap(),
          {
            success: `${dispute.id}: resolved`,
            audit: (updated) => ({
              action: "contest.resolve_dispute",
              targetType: "contest",
              targetId: updated.id,
              summary: `Resolved dispute ${dispute.id} (${updated.id})`,
              reason: resolution,
            }),
            after,
          },
        ),
    });

  const actionItems = (contest: Contest): RowActionItem[] => {
    const item = (
      key: ContestActionKey,
      label: string,
      onSelect: () => void,
      danger = false,
    ): RowActionItem => {
      const blocked = contestActionBlock(contest, key);
      return {
        key,
        label,
        permission: "contests:manage",
        danger,
        disabled: blocked !== null,
        disabledReason: blocked ?? undefined,
        onSelect,
      };
    };
    return [
      item("lockRules", "Lock rules", () => lockRules(contest)),
      item("submit", "Submit for review", () => submit(contest)),
      item("approve", DECISIONS.approve.label, () => decide(contest, "approve")),
      item("request_changes", DECISIONS.request_changes.label, () =>
        decide(contest, "request_changes"),
      ),
      item("cancel", DECISIONS.cancel.label, () => decide(contest, "cancel"), true),
    ];
  };

  return { actionItems, setEntryStatus, resolveDispute };
}
