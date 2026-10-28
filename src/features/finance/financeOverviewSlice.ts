import { transactionsService } from "@/services";
import { createDocumentSlice } from "@/store/createDocumentSlice";
import type { FinanceOverview } from "./financeTypes";

export const financeOverviewModule = createDocumentSlice<FinanceOverview, number>({
  name: "financeOverview",
  fetch: (periodDays) => transactionsService.getOverview(periodDays),
});

export const fetchFinanceOverview = financeOverviewModule.fetchDocument;
export default financeOverviewModule.reducer;
