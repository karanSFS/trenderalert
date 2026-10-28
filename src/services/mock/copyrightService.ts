import { OPEN_COPYRIGHT_STATUSES, type EvidenceStatus } from "@/features/copyright/copyrightTypes";
import type { CopyrightService } from "@/services/contracts/moduleServices";
import { assertEligible, assertReason, db, findOrThrow, historyEntry } from "./db";
import { mockRequest } from "./mockDelay";
import { applyListQuery } from "./query";

const SERVICE = "copyright";

const EVIDENCE_LABELS: Record<EvidenceStatus, string> = {
  received: "Evidence received",
  verified: "Evidence verified",
  incomplete: "Evidence marked incomplete",
};

export const mockCopyrightService: CopyrightService = {
  list: (query) =>
    mockRequest(
      () =>
        applyListQuery(db.copyright, query, {
          searchFields: (item) => [
            item.id,
            item.claimant,
            item.contentId,
            item.username,
            item.workDescription,
          ],
          filterPredicates: {
            status: (item, value) => item.status === value,
            noticeType: (item, value) => item.noticeType === value,
            evidenceStatus: (item, value) => item.evidenceStatus === value,
          },
          sortAccessors: {
            responseDueAt: (item) => item.responseDueAt,
            receivedAt: (item) => item.receivedAt,
          },
        }),
      { service: SERVICE },
    ),

  get: (id) =>
    mockRequest(() => findOrThrow(db.copyright, id, "Copyright case"), { service: SERVICE }),

  setEvidence: (id, evidence, actor) =>
    mockRequest(
      () => {
        const item = findOrThrow(db.copyright, id, "Copyright case");
        assertEligible(
          OPEN_COPYRIGHT_STATUSES.includes(item.status),
          "This case is already resolved.",
        );
        assertEligible(item.evidenceStatus !== evidence, "Evidence already has this status.");
        item.evidenceStatus = evidence;
        if (item.status === "received") item.status = "under_review";
        item.history.push(
          historyEntry(
            actor.name,
            EVIDENCE_LABELS[evidence],
            undefined,
            evidence === "verified" ? "success" : "warning",
          ),
        );
        return item;
      },
      { service: SERVICE },
    ),

  resolve: (id, resolution, reason, actor) =>
    mockRequest(
      () => {
        const item = findOrThrow(db.copyright, id, "Copyright case");
        const trimmed = assertReason(reason);
        assertEligible(
          OPEN_COPYRIGHT_STATUSES.includes(item.status),
          "This case is already resolved.",
        );
        const content = findOrThrow(db.content, item.contentId, "Content");

        if (resolution === "remove_content") {
          assertEligible(
            item.noticeType === "takedown",
            "Only takedown notices can remove content.",
          );
          assertEligible(
            item.evidenceStatus === "verified",
            "Verify the evidence before removing content.",
          );
          content.moderationStatus = "removed";
          item.status = "content_removed";
        } else if (resolution === "restore_content") {
          assertEligible(
            item.noticeType === "counter_notice",
            "Only counter-notices can restore content.",
          );
          assertEligible(
            item.evidenceStatus === "verified",
            "Verify the counter-notice before restoring content.",
          );
          content.moderationStatus = "visible";
          item.status = "restored";
        } else {
          item.status = "rejected";
        }

        const titles = {
          remove_content: "Affected content removed",
          restore_content: "Content restored after counter-notice",
          reject_notice: "Notice rejected",
        } as const;
        item.history.push(
          historyEntry(
            actor.name,
            titles[resolution],
            trimmed,
            resolution === "remove_content"
              ? "error"
              : resolution === "restore_content"
                ? "success"
                : "neutral",
          ),
        );
        return item;
      },
      { service: SERVICE },
    ),
};
