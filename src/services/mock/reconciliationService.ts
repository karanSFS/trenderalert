import { RESOLUTION_LABELS } from "@/lib/constants/operationalLabels";
import type { ReconciliationService } from "@/services/contracts/operationalServices";
import { assertEligible, assertReason, db, findOrThrow, historyEntry } from "./db";
import { mockRequest } from "./mockDelay";
import { applyListQuery } from "./query";

const SERVICE = "finance";

const recordOf = (id: string) => findOrThrow(db.reconciliation, id, "Reconciliation record");

export const mockReconciliationService: ReconciliationService = {
  list: (query) =>
    mockRequest(
      () =>
        applyListQuery(db.reconciliation, query, {
          searchFields: (item) => [item.id, item.providerReference, item.transactionId],
          filterPredicates: {
            status: (item, value) => item.status === value,
            exceptionType: (item, value) => item.exceptionType === value,
            provider: (item, value) => item.provider === value,
          },
          sortAccessors: {
            detectedAt: (item) => item.detectedAt,
          },
        }),
      { service: SERVICE },
    ),

  get: (id) => mockRequest(() => recordOf(id), { service: SERVICE }),

  getContext: (id) =>
    mockRequest(
      () => {
        const record = recordOf(id);
        return db.transactions.find((item) => item.id === record.transactionId) ?? null;
      },
      { service: SERVICE },
    ),

  investigate: (id, actor) =>
    mockRequest(
      () => {
        const record = recordOf(id);
        assertEligible(record.status === "open", "Only open exceptions can move to investigation.");
        record.status = "investigating";
        record.history.push(historyEntry(actor.name, "Investigation started", undefined, "info"));
        return record;
      },
      { service: SERVICE },
    ),

  resolve: (id, type, note, actor) =>
    mockRequest(
      () => {
        const record = recordOf(id);
        const trimmed = assertReason(note);
        assertEligible(record.status !== "resolved", "This exception is already resolved.");
        const at = new Date().toISOString();
        record.status = "resolved";
        record.resolution = { type, note: trimmed, at, by: actor.name };
        record.history.push(
          historyEntry(actor.name, `Resolved: ${RESOLUTION_LABELS[type]}`, trimmed, "success"),
        );
        const transaction = db.transactions.find((item) => item.id === record.transactionId);
        if (transaction && transaction.reconciliation === "exception")
          transaction.reconciliation = "matched";
        return record;
      },
      { service: SERVICE },
    ),
};
