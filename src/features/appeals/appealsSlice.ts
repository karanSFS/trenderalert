import type { ModerationCase } from "@/features/moderation/moderationTypes";
import { appealsService } from "@/services";
import { createDirectorySlice } from "@/store/createDirectorySlice";
import type { EntityId } from "@/types/common";
import type { Appeal, AppealFilters } from "./appealsTypes";

export const appealsModule = createDirectorySlice<Appeal, AppealFilters, ModerationCase>({
  name: "appeals",
  service: appealsService,
  initialFilters: { status: undefined, action: undefined },
  list: { sortField: "submittedAt", sortOrder: "descend" },
  getContext: (id) => appealsService.getOriginalCase(id),
});

export const decideAppeal = appealsModule.createMutation<{
  id: EntityId;
  outcome: "upheld" | "reversed";
  reason: string;
}>("decide", ({ id, outcome, reason }, actor) => appealsService.decide(id, outcome, reason, actor));

export const appealsActions = appealsModule.actions;
export const {
  fetchList: fetchAppeals,
  fetchOne: fetchAppeal,
  fetchContext: fetchAppealCase,
} = appealsModule;
export default appealsModule.reducer;
