import { trendsService } from "@/services";
import type { TrendContext } from "@/services/contracts/moduleServices";
import { createDirectorySlice } from "@/store/createDirectorySlice";
import type { EntityId } from "@/types/common";
import type { TrendCorrection, TrendFilters, TrendRecord } from "./trendsTypes";

export const trendsModule = createDirectorySlice<TrendRecord, TrendFilters, TrendContext>({
  name: "trends",
  service: trendsService,
  initialFilters: { stage: undefined, geoScope: undefined, flag: undefined },
  list: { sortField: "trendScore", sortOrder: "descend" },
  getContext: (id) => trendsService.getContext(id),
});

type WithReason = { id: EntityId; reason: string };

export const setTrendFeatured = trendsModule.createMutation<WithReason & { featured: boolean }>(
  "setFeatured",
  ({ id, featured, reason }, actor) => trendsService.setFeatured(id, featured, reason, actor),
);
export const setTrendSuppressed = trendsModule.createMutation<WithReason & { suppressed: boolean }>(
  "setSuppressed",
  ({ id, suppressed, reason }, actor) => trendsService.setSuppressed(id, suppressed, reason, actor),
);
export const endTrendEarly = trendsModule.createMutation<WithReason>(
  "endEarly",
  ({ id, reason }, actor) => trendsService.endEarly(id, reason, actor),
);
export const correctTrend = trendsModule.createMutation<{
  id: EntityId;
  correction: TrendCorrection;
}>("correct", ({ id, correction }, actor) => trendsService.correct(id, correction, actor));
export const mergeTrend = trendsModule.createMutation<WithReason & { targetId: EntityId }>(
  "merge",
  ({ id, targetId, reason }, actor) => trendsService.merge(id, targetId, reason, actor),
);

export const trendsActions = trendsModule.actions;
export const {
  fetchList: fetchTrends,
  fetchOne: fetchTrend,
  fetchContext: fetchTrendContext,
} = trendsModule;
export default trendsModule.reducer;
