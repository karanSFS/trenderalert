import { trendsService } from "@/services";
import { createDirectorySlice } from "@/store/createDirectorySlice";
import type { TrendFilters, TrendInsights, TrendPost } from "./trendsTypes";

/** Read-only: the backend has no admin actions for Trends yet. */
export const trendsModule = createDirectorySlice<TrendPost, TrendFilters, TrendInsights>({
  name: "trends",
  service: trendsService,
  initialFilters: { stage: undefined, category: undefined },
  list: { sortField: "trendScore", sortOrder: "descend" },
  getContext: (id) => trendsService.getInsights(id),
});

export const trendsActions = trendsModule.actions;
export const {
  fetchList: fetchTrends,
  fetchOne: fetchTrend,
  fetchContext: fetchTrendInsights,
} = trendsModule;
export default trendsModule.reducer;
