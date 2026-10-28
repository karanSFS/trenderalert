import { reconciliationService } from "@/services";
import { createDirectorySlice } from "@/store/createDirectorySlice";
import type { EntityId } from "@/types/common";
import type {
  ReconciliationFilters,
  ReconciliationRecord,
  ResolutionType,
  Transaction,
} from "./financeTypes";

export const reconciliationModule = createDirectorySlice<
  ReconciliationRecord,
  ReconciliationFilters,
  Transaction | null
>({
  name: "reconciliation",
  service: reconciliationService,
  initialFilters: { status: undefined, exceptionType: undefined, provider: undefined },
  list: { sortField: "detectedAt", sortOrder: "descend" },
  getContext: (id) => reconciliationService.getContext(id),
});

export const investigateException = reconciliationModule.createMutation<EntityId>(
  "investigate",
  (id, actor) => reconciliationService.investigate(id, actor),
);

export const resolveException = reconciliationModule.createMutation<{
  id: EntityId;
  type: ResolutionType;
  note: string;
}>("resolve", ({ id, type, note }, actor) => reconciliationService.resolve(id, type, note, actor));

export const reconciliationActions = reconciliationModule.actions;
export const {
  fetchList: fetchReconciliation,
  fetchOne: fetchReconciliationRecord,
  fetchContext: fetchReconciliationContext,
} = reconciliationModule;
export default reconciliationModule.reducer;
