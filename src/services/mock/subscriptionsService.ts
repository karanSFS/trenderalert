import type { SubscriptionsService } from "@/services/contracts/operationalServices";
import { db, findOrThrow } from "./db";
import { mockRequest } from "./mockDelay";
import { applyListQuery } from "./query";

const SERVICE = "subscriptions";

/** Read-only: subscription state is owned by the app stores (D-05). */
export const mockSubscriptionsService: SubscriptionsService = {
  list: (query) =>
    mockRequest(
      () =>
        applyListQuery(db.subscriptions, query, {
          searchFields: (item) => [item.id, item.username, item.userId, item.storeReference],
          filterPredicates: {
            status: (item, value) => item.status === value,
            plan: (item, value) => item.plan === value,
            store: (item, value) => item.store === value,
          },
          sortAccessors: {
            startedAt: (item) => item.startedAt,
            currentPeriodEnd: (item) => item.currentPeriodEnd,
          },
        }),
      { service: SERVICE },
    ),

  get: (id) =>
    mockRequest(() => findOrThrow(db.subscriptions, id, "Subscription"), { service: SERVICE }),

  getTransactions: (id) =>
    mockRequest(
      () =>
        db.transactions
          .filter((item) => item.subscriptionId === id)
          .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
      { service: SERVICE },
    ),
};
