import { appealsService } from "@/services";
import { createDirectorySlice } from "@/store/createDirectorySlice";
import type { EntityId } from "@/types/common";
import type { Appeal, AppealFilters, AppealOutcome } from "./appealsTypes";

export const appealsModule = createDirectorySlice<Appeal, AppealFilters>({
  name: "appeals",
  service: appealsService,
  initialFilters: { status: undefined },
});

export const resolveAppeal = appealsModule.createMutation<{
  id: EntityId;
  outcome: AppealOutcome;
  reason: string;
}>("resolve", ({ id, outcome, reason }) => appealsService.resolve(id, outcome, reason));

export const appealsActions = appealsModule.actions;
export const { fetchList: fetchAppeals, fetchOne: fetchAppeal } = appealsModule;
export default appealsModule.reducer;
