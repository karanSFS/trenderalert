import { ACTION_LABELS } from "@/data/mock";
import {
  OPEN_CASE_STATUSES,
  type CasePriority,
  type ModerationCase,
} from "@/features/moderation/moderationTypes";
import type { ModerationService } from "@/services/contracts/moduleServices";
import { assertEligible, assertReason, db, findOrThrow, historyEntry } from "./db";
import { MockServiceError, mockRequest } from "./mockDelay";
import { applyListQuery } from "./query";

const SERVICE = "moderation";

const PRIORITY_RANK: Record<CasePriority, number> = { critical: 4, high: 3, medium: 2, low: 1 };
const isOpen = (item: ModerationCase) => OPEN_CASE_STATUSES.includes(item.status);

export const mockModerationService: ModerationService = {
  list: (query) =>
    mockRequest(
      () =>
        applyListQuery(db.moderation, query, {
          searchFields: (item) => [
            item.id,
            item.reportedItemLabel,
            item.category,
            item.assignedReviewerName,
          ],
          filterPredicates: {
            status: (item, value) => item.status === value,
            priority: (item, value) => item.priority === value,
            category: (item, value) => item.category === value,
            assignee: (item, value) =>
              value === "unassigned"
                ? item.assignedReviewerId === null
                : item.assignedReviewerId === value,
            openOnly: (item, value) => !value || isOpen(item),
          },
          sortAccessors: {
            priority: (item) =>
              PRIORITY_RANK[item.priority] * 1e13 + Date.parse(item.submittedAt) / 1000,
            submittedAt: (item) => item.submittedAt,
          },
        }),
      { service: SERVICE },
    ),

  get: (id) => mockRequest(() => findOrThrow(db.moderation, id, "Case"), { service: SERVICE }),

  getContext: (id) =>
    mockRequest(
      () => {
        const item = findOrThrow(db.moderation, id, "Case");
        return {
          content: item.contentId
            ? (db.content.find((content) => content.id === item.contentId) ?? null)
            : null,
          account: findOrThrow(db.users, item.accountId, "User"),
          priorCases: db.moderation
            .filter((other) => other.accountId === item.accountId && other.id !== item.id)
            .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
        };
      },
      { service: SERVICE },
    ),

  assign: (id, reviewer, actor) =>
    mockRequest(
      () => {
        const item = findOrThrow(db.moderation, id, "Case");
        assertEligible(isOpen(item), "Closed cases cannot be reassigned.");
        assertEligible(
          item.assignedReviewerId !== (reviewer?.id ?? null),
          "No change in assignment.",
        );
        item.assignedReviewerId = reviewer?.id ?? null;
        item.assignedReviewerName = reviewer?.name ?? null;
        if (reviewer && item.status === "new") item.status = "in_review";
        item.history.push(
          historyEntry(
            actor.name,
            reviewer ? `Assigned to ${reviewer.name}` : "Unassigned",
            undefined,
            "neutral",
          ),
        );
        return item;
      },
      { service: SERVICE },
    ),

  addNote: (id, text, actor) =>
    mockRequest(
      () => {
        const item = findOrThrow(db.moderation, id, "Case");
        const trimmed = text.trim();
        if (trimmed.length < 3)
          throw new MockServiceError("VALIDATION", "Notes must be at least 3 characters.");
        item.notes.push({
          id: `note-${Date.now()}`,
          at: new Date().toISOString(),
          author: actor.name,
          text: trimmed,
        });
        return item;
      },
      { service: SERVICE },
    ),

  act: (id, action, reason, actor) =>
    mockRequest(
      () => {
        const item = findOrThrow(db.moderation, id, "Case");
        const trimmed = assertReason(reason);
        assertEligible(isOpen(item), "This case is already closed.");
        const account = findOrThrow(db.users, item.accountId, "User");
        const content = item.contentId ? findOrThrow(db.content, item.contentId, "Content") : null;
        const now = new Date().toISOString();

        switch (action) {
          case "remove_content":
          case "limit_content":
            assertEligible(content !== null, "This case has no content to act on.");
            assertEligible(
              content.moderationStatus !== "removed",
              "The content is already removed.",
            );
            content.moderationStatus = action === "remove_content" ? "removed" : "limited";
            break;
          case "restrict_account":
          case "suspend_account":
            assertEligible(
              account.status !== "pending_deletion",
              "The account is pending deletion and is read-only.",
            );
            assertEligible(account.status !== "suspended", "The account is already suspended.");
            if (action === "restrict_account")
              assertEligible(account.status === "active", "The account is already restricted.");
            account.status = action === "restrict_account" ? "restricted" : "suspended";
            account.strikes += 1;
            account.lastEnforcement = {
              action: action === "restrict_account" ? "restricted" : "suspended",
              at: now,
              by: actor.name,
              reason: `${trimmed} (case ${item.id})`,
            };
            break;
          case "warn":
            account.strikes += 1;
            account.lastEnforcement = {
              action: "warned",
              at: now,
              by: actor.name,
              reason: `${trimmed} (case ${item.id})`,
            };
            break;
          default:
            break;
        }

        if (action === "escalate") {
          assertEligible(item.status !== "escalated", "This case is already escalated.");
          item.status = "escalated";
        } else {
          item.status = action === "dismiss" ? "dismissed" : "actioned";
          item.outcome = { action, reason: trimmed, at: now, by: actor.name };
        }
        item.history.push(
          historyEntry(
            actor.name,
            ACTION_LABELS[action],
            trimmed,
            action === "dismiss" ? "neutral" : action === "escalate" ? "warning" : "error",
          ),
        );
        return item;
      },
      { service: SERVICE },
    ),
};
