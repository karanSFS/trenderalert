import { transactionsService } from "@/services";
import type { TransactionContext } from "@/services/contracts/operationalServices";
import { createDirectorySlice } from "@/store/createDirectorySlice";
import type { EntityId } from "@/types/common";
import type { Transaction, TransactionFilters } from "./financeTypes";

export const transactionsModule = createDirectorySlice<
  Transaction,
  TransactionFilters,
  TransactionContext
>({
  name: "transactions",
  service: transactionsService,
  initialFilters: {
    type: undefined,
    status: undefined,
    provider: undefined,
    reconciliation: undefined,
  },
  list: { sortField: "occurredAt", sortOrder: "descend" },
  getContext: (id) => transactionsService.getContext(id),
});

/** Adds a new linked refund record; the original keeps its amount and gains `refundedBy`. */
export const requestRefund = transactionsModule.createMutation<{ id: EntityId; reason: string }>(
  "refund",
  ({ id, reason }, actor) => transactionsService.requestRefund(id, reason, actor),
);

export const transactionsActions = transactionsModule.actions;
export const {
  fetchList: fetchTransactions,
  fetchOne: fetchTransaction,
  fetchContext: fetchTransactionContext,
} = transactionsModule;
export default transactionsModule.reducer;
