import type { ContestsService } from "@/services/contracts/operationalServices";
import { assertEligible, assertReason, assertValid, db, findOrThrow, historyEntry } from "./db";
import { mockRequest } from "./mockDelay";
import { applyListQuery } from "./query";

const SERVICE = "contests";

const PAID_CONTESTS_BLOCKED =
  "Paid contests are disabled until legal, payment-provider and operations approvals are recorded by the backend.";

const contestOf = (id: string) => findOrThrow(db.contests, id, "Contest");

export const mockContestsService: ContestsService = {
  list: (query) =>
    mockRequest(
      () =>
        applyListQuery(db.contests, query, {
          searchFields: (item) => [item.id, item.name, item.sponsor],
          filterPredicates: {
            status: (item, value) => item.status === value,
            type: (item, value) => item.type === value,
          },
          sortAccessors: {
            entryOpensAt: (item) => item.entryOpensAt,
            entryClosesAt: (item) => item.entryClosesAt,
            entries: (item) => item.entries.length,
          },
        }),
      { service: SERVICE },
    ),

  get: (id) => mockRequest(() => contestOf(id), { service: SERVICE }),

  lockRules: (id, actor) =>
    mockRequest(
      () => {
        const contest = contestOf(id);
        assertEligible(contest.status === "draft", "Rules can only be locked on a draft.");
        assertEligible(!contest.rules.locked, "The rules are already locked.");
        contest.rules.locked = true;
        contest.history.push(
          historyEntry(
            actor.name,
            `Official rules ${contest.rules.version} locked`,
            undefined,
            "info",
          ),
        );
        return contest;
      },
      { service: SERVICE },
    ),

  submitForReview: (id, actor) =>
    mockRequest(
      () => {
        const contest = contestOf(id);
        assertEligible(contest.status === "draft", "Only drafts can be submitted for review.");
        assertEligible(
          contest.rules.locked,
          "Lock the official rules before submitting for review.",
        );
        contest.status = "pending_review";
        if (contest.approvals.legal === "not_started") contest.approvals.legal = "pending";
        if (contest.approvals.operations === "not_started")
          contest.approvals.operations = "pending";
        if (contest.approvals.paymentProvider === "not_started")
          contest.approvals.paymentProvider = "pending";
        contest.history.push(
          historyEntry(actor.name, "Submitted for legal review", undefined, "info"),
        );
        return contest;
      },
      { service: SERVICE },
    ),

  decide: (id, decision, reason, actor) =>
    mockRequest(
      () => {
        const contest = contestOf(id);
        const trimmed = assertReason(reason);

        if (decision === "approve") {
          assertEligible(
            contest.status === "pending_review",
            "Only contests in review can be approved.",
          );
          assertEligible(contest.type === "free", PAID_CONTESTS_BLOCKED);
          assertEligible(contest.rules.locked, "The official rules must be locked first.");
          assertEligible(
            contest.fundingStatus === "verified",
            "Prize funding has not been verified.",
          );
          assertEligible(
            contest.approvals.legal === "approved" && contest.approvals.operations === "approved",
            "Legal and operations approvals are still outstanding.",
          );
          contest.status = "approved";
          contest.history.push(
            historyEntry(actor.name, "Approved for publication", trimmed, "success"),
          );
        } else if (decision === "request_changes") {
          assertEligible(
            contest.status === "pending_review",
            "Only contests in review can be returned.",
          );
          contest.status = "draft";
          contest.rules.locked = false;
          contest.history.push(historyEntry(actor.name, "Changes requested", trimmed, "warning"));
        } else {
          assertEligible(
            ["draft", "pending_review", "approved", "active"].includes(contest.status),
            "This contest can no longer be cancelled.",
          );
          contest.status = "cancelled";
          if (contest.payoutStatus !== "delivered") contest.payoutStatus = "not_applicable";
          contest.history.push(
            historyEntry(
              actor.name,
              "Contest cancelled",
              `${trimmed} Entrants are notified under the official rules.`,
              "error",
            ),
          );
        }
        return contest;
      },
      { service: SERVICE },
    ),

  setEntryStatus: (id, entryId, status, reason, actor) =>
    mockRequest(
      () => {
        const contest = contestOf(id);
        const trimmed = assertReason(reason);
        assertEligible(
          ["active", "judging"].includes(contest.status),
          "Entries can only be reviewed while the contest is active or judging.",
        );
        const entry = contest.entries.find((item) => item.id === entryId);
        assertValid(Boolean(entry), `Entry ${entryId} was not found.`);
        assertEligible(entry!.status !== status, "The entry already has this status.");
        entry!.status = status;
        entry!.flagReason = status === "disqualified" ? trimmed : null;
        if (status === "disqualified") entry!.score = null;
        contest.history.push(
          historyEntry(
            actor.name,
            status === "disqualified"
              ? `Entry ${entryId} disqualified`
              : `Entry ${entryId} cleared`,
            trimmed,
            status === "disqualified" ? "error" : "success",
          ),
        );
        return contest;
      },
      { service: SERVICE },
    ),

  resolveDispute: (id, disputeId, resolution, actor) =>
    mockRequest(
      () => {
        const contest = contestOf(id);
        const trimmed = assertReason(resolution);
        const dispute = contest.disputes.find((item) => item.id === disputeId);
        assertValid(Boolean(dispute), `Dispute ${disputeId} was not found.`);
        assertEligible(dispute!.status === "open", "This dispute is already resolved.");
        dispute!.status = "resolved";
        dispute!.resolution = trimmed;
        contest.history.push(
          historyEntry(actor.name, `Dispute ${disputeId} resolved`, trimmed, "success"),
        );
        return contest;
      },
      { service: SERVICE },
    ),
};
