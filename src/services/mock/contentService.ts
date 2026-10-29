import type { ContentService } from "@/services/contracts/moduleServices";
import { assertEligible, assertReason, db, findOrThrow } from "./db";
import { mockRequest } from "./mockDelay";
import { applyListQuery } from "./query";

const SERVICE = "content";

export const mockContentService: ContentService = {
  list: (query) =>
    mockRequest(
      () =>
        applyListQuery(db.content, query, {
          searchFields: (item) => [item.caption, item.creatorUsername, item.id],
          filterPredicates: {
            type: (item, value) => item.type === value,
            audience: (item, value) => item.audience === value,
            moderationStatus: (item, value) => item.moderationStatus === value,
            creatorId: (item, value) => item.creatorId === value,
          },
          sortAccessors: {
            publishedAt: (item) => item.publishedAt,
            reportCount: (item) => item.reportCount,
          },
        }),
      { service: SERVICE },
    ),

  get: (id) => mockRequest(() => findOrThrow(db.content, id, "Content"), { service: SERVICE }),

  moderate: (id, action, reason) =>
    mockRequest(
      () => {
        const item = findOrThrow(db.content, id, "Content");
        assertReason(reason);
        if (action === "remove") {
          assertEligible(item.moderationStatus !== "removed", "This content is already removed.");
          item.moderationStatus = "removed";
        } else if (action === "limit") {
          assertEligible(
            item.moderationStatus === "visible" || item.moderationStatus === "under_review",
            "Only visible content can be limited.",
          );
          item.moderationStatus = "limited";
        } else {
          assertEligible(
            item.moderationStatus === "removed" || item.moderationStatus === "limited",
            "Only removed or limited content can be restored.",
          );
          item.moderationStatus = "visible";
        }
        return item;
      },
      { service: SERVICE },
    ),
};
