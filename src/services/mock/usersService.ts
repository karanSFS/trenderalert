import type { UsersService } from "@/services/contracts/moduleServices";
import { assertEligible, assertReason, db, findOrThrow } from "./db";
import { mockRequest } from "./mockDelay";
import { applyListQuery } from "./query";

const SERVICE = "users";

export const mockUsersService: UsersService = {
  list: (query) =>
    mockRequest(
      () =>
        applyListQuery(db.users, query, {
          searchFields: (user) => [user.username, user.displayName, user.email, user.id],
          filterPredicates: {
            status: (user, value) => user.status === value,
            plan: (user, value) => user.subscription.plan === value,
            verification: (user, value) => user.verification === value,
          },
          sortAccessors: {
            username: (user) => user.username,
            registeredAt: (user) => user.registeredAt,
            reportsReceived: (user) => user.reportsReceived,
            followers: (user) => user.followers,
          },
        }),
      { service: SERVICE },
    ),

  get: (id) => mockRequest(() => findOrThrow(db.users, id, "User"), { service: SERVICE }),

  getActivity: (id) =>
    mockRequest(
      () => {
        findOrThrow(db.users, id, "User");
        return {
          cases: db.moderation
            .filter((item) => item.accountId === id)
            .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
          contentCount: db.content.filter((item) => item.creatorId === id).length,
          trendCount: db.trends.filter((item) => item.creatorId === id).length,
          auditHistory: db.auditHistory.filter(
            (event) => event.targetType === "user" && event.targetId === id,
          ),
        };
      },
      { service: SERVICE },
    ),

  enforce: (id, action, reason, actor) =>
    mockRequest(
      () => {
        const user = findOrThrow(db.users, id, "User");
        const trimmed = assertReason(reason);
        assertEligible(
          user.status !== "pending_deletion",
          "Accounts pending deletion are read-only.",
        );
        if (action === "restrict") {
          assertEligible(user.status === "active", "Only active accounts can be restricted.");
          user.status = "restricted";
          user.strikes += 1;
        } else if (action === "suspend") {
          assertEligible(user.status !== "suspended", "This account is already suspended.");
          user.status = "suspended";
          user.strikes += 1;
        } else {
          assertEligible(
            user.status === "restricted" || user.status === "suspended",
            "Only restricted or suspended accounts can be reinstated.",
          );
          user.status = "active";
        }
        user.lastEnforcement = {
          action:
            action === "restrict"
              ? "restricted"
              : action === "suspend"
                ? "suspended"
                : "reinstated",
          at: new Date().toISOString(),
          by: actor.name,
          reason: trimmed,
        };
        return user;
      },
      { service: SERVICE },
    ),
};
