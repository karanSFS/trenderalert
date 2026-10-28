import type { AppealsService } from "@/services/contracts/moduleServices";
import { assertEligible, assertReason, db, findOrThrow, historyEntry } from "./db";
import { mockRequest } from "./mockDelay";
import { applyListQuery } from "./query";

const SERVICE = "appeals";

export const mockAppealsService: AppealsService = {
  list: (query) =>
    mockRequest(
      () =>
        applyListQuery(db.appeals, query, {
          searchFields: (appeal) => [
            appeal.id,
            appeal.caseId,
            appeal.username,
            appeal.appealReason,
          ],
          filterPredicates: {
            status: (appeal, value) => appeal.status === value,
            action: (appeal, value) => appeal.originalDecision.action === value,
          },
          sortAccessors: { submittedAt: (appeal) => appeal.submittedAt },
        }),
      { service: SERVICE },
    ),

  get: (id) => mockRequest(() => findOrThrow(db.appeals, id, "Appeal"), { service: SERVICE }),

  getOriginalCase: (id) =>
    mockRequest(
      () => findOrThrow(db.moderation, findOrThrow(db.appeals, id, "Appeal").caseId, "Case"),
      { service: SERVICE },
    ),

  decide: (id, outcome, reason, actor) =>
    mockRequest(
      () => {
        const appeal = findOrThrow(db.appeals, id, "Appeal");
        const trimmed = assertReason(reason);
        assertEligible(
          appeal.status === "pending" || appeal.status === "in_review",
          "This appeal has already been decided.",
        );

        if (outcome === "reversed") {
          // Reversal undoes the original enforcement where the record still reflects it.
          const user = findOrThrow(db.users, appeal.userId, "User");
          const original = db.moderation.find((item) => item.id === appeal.caseId);
          const content = original?.contentId
            ? db.content.find((item) => item.id === original.contentId)
            : undefined;
          const action = appeal.originalDecision.action;
          if ((action === "remove_content" || action === "limit_content") && content)
            content.moderationStatus = "visible";
          if (
            (action === "restrict_account" || action === "suspend_account") &&
            user.status !== "pending_deletion"
          ) {
            user.status = "active";
          }
          if (action !== "escalate" && action !== "dismiss")
            user.strikes = Math.max(0, user.strikes - 1);
          user.lastEnforcement = {
            action: "reinstated",
            at: new Date().toISOString(),
            by: actor.name,
            reason: `Appeal ${appeal.id} reversed: ${trimmed}`,
          };
          original?.history.push(
            historyEntry(
              actor.name,
              `Decision reversed on appeal ${appeal.id}`,
              trimmed,
              "success",
            ),
          );
        }

        appeal.status = outcome;
        appeal.assignedReviewerName = appeal.assignedReviewerName ?? actor.name;
        appeal.decision = {
          outcome,
          reason: trimmed,
          at: new Date().toISOString(),
          by: actor.name,
        };
        appeal.history.push(
          historyEntry(
            actor.name,
            outcome === "upheld" ? "Decision upheld" : "Decision reversed",
            trimmed,
            outcome === "upheld" ? "neutral" : "success",
          ),
        );
        return appeal;
      },
      { service: SERVICE },
    ),
};
