import { DEMO_AS_OF_MS, DAY_MS } from "@/data/mock/seed";
import type { FinanceOverview, Transaction } from "@/features/finance/financeTypes";
import type { TransactionsService } from "@/services/contracts/operationalServices";
import { assertEligible, assertReason, db, findOrThrow } from "./db";
import { mockRequest } from "./mockDelay";
import { applyListQuery } from "./query";

const SERVICE = "finance";

let refundSequence = 0;

export const mockTransactionsService: TransactionsService = {
  list: (query) =>
    mockRequest(
      () =>
        applyListQuery(db.transactions, query, {
          searchFields: (item) => [
            item.id,
            item.username,
            item.providerReference,
            item.subscriptionId,
          ],
          filterPredicates: {
            type: (item, value) => item.type === value,
            status: (item, value) => item.status === value,
            provider: (item, value) => item.provider === value,
            reconciliation: (item, value) => item.reconciliation === value,
          },
          sortAccessors: {
            occurredAt: (item) => item.occurredAt,
            amount: (item) => item.amount,
          },
        }),
      { service: SERVICE },
    ),

  get: (id) =>
    mockRequest(() => findOrThrow(db.transactions, id, "Transaction"), { service: SERVICE }),

  getContext: (id) =>
    mockRequest(
      () => {
        const transaction = findOrThrow(db.transactions, id, "Transaction");
        return {
          related: db.transactions.filter(
            (item) =>
              item.id !== id &&
              (item.relatedTransactionId === id || item.id === transaction.relatedTransactionId),
          ),
          subscription:
            db.subscriptions.find((item) => item.id === transaction.subscriptionId) ?? null,
          reconciliation: db.reconciliation.filter((item) => item.transactionId === id),
        };
      },
      { service: SERVICE },
    ),

  getOverview: (periodDays) =>
    mockRequest(
      (): FinanceOverview => {
        const since = DEMO_AS_OF_MS - periodDays * DAY_MS;
        const inPeriod = db.transactions.filter((item) => Date.parse(item.occurredAt) >= since);
        const succeeded = inPeriod.filter((item) => item.status === "succeeded");
        const sum = (items: Transaction[]) => items.reduce((total, item) => total + item.amount, 0);
        const charges = succeeded.filter((item) => item.amount > 0);
        return {
          periodDays,
          grossCents: sum(charges),
          refundsCents: Math.abs(sum(succeeded.filter((item) => item.type === "refund"))),
          chargebacksCents: Math.abs(sum(succeeded.filter((item) => item.type === "chargeback"))),
          openExceptions: db.reconciliation.filter((item) => item.status !== "resolved").length,
          pendingTransactions: db.transactions.filter((item) => item.status === "pending").length,
          byProvider: (["ios", "android"] as const).map((provider) => {
            const items = charges.filter((item) => item.provider === provider);
            return { provider, grossCents: sum(items), count: items.length };
          }),
          contestPayouts: {
            enabled: false,
            note: "Contest payouts are not connected. Paid contests stay disabled until approvals are recorded.",
          },
        };
      },
      { service: SERVICE },
    ),

  requestRefund: (id, reason, actor) =>
    mockRequest(
      () => {
        const original = findOrThrow(db.transactions, id, "Transaction");
        const trimmed = assertReason(reason);
        assertEligible(
          original.type === "subscription_purchase" || original.type === "renewal",
          "Only purchases and renewals can be refunded.",
        );
        assertEligible(
          original.status === "succeeded",
          "Only settled transactions can be refunded.",
        );
        assertEligible(!original.refundedBy, "A refund is already linked to this transaction.");

        refundSequence += 1;
        const refund: Transaction = {
          id: `txn-demo-${String(refundSequence).padStart(3, "0")}`,
          type: "refund",
          amount: -original.amount,
          currency: original.currency,
          provider: original.provider,
          providerReference: "Pending store confirmation",
          status: "pending",
          userId: original.userId,
          username: original.username,
          subscriptionId: original.subscriptionId,
          occurredAt: new Date().toISOString(),
          relatedTransactionId: original.id,
          refundedBy: null,
          reconciliation: "unmatched",
          note: `Simulated refund request by ${actor.name}: ${trimmed} No money moved.`,
        };
        db.transactions.unshift(refund);
        original.refundedBy = refund.id;
        return original;
      },
      { service: SERVICE },
    ),
};
