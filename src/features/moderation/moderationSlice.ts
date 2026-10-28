import { moderationService } from "@/services";
import type { ActionActor } from "@/services/contracts/directory";
import type { CaseContext } from "@/services/contracts/moduleServices";
import { createDirectorySlice } from "@/store/createDirectorySlice";
import type { EntityId } from "@/types/common";
import type { ModerationActionType, ModerationCase, ModerationFilters } from "./moderationTypes";

export const moderationModule = createDirectorySlice<
  ModerationCase,
  ModerationFilters,
  CaseContext
>({
  name: "moderation",
  service: moderationService,
  initialFilters: {
    status: undefined,
    priority: undefined,
    category: undefined,
    assignee: undefined,
    openOnly: true,
  },
  list: { sortField: "priority", sortOrder: "descend" },
  getContext: (id) => moderationService.getContext(id),
});

export const assignCase = moderationModule.createMutation<{
  id: EntityId;
  reviewer: ActionActor | null;
}>("assign", ({ id, reviewer }, actor) => moderationService.assign(id, reviewer, actor));
export const addCaseNote = moderationModule.createMutation<{ id: EntityId; text: string }>(
  "addNote",
  ({ id, text }, actor) => moderationService.addNote(id, text, actor),
);
export const actOnCase = moderationModule.createMutation<{
  id: EntityId;
  action: ModerationActionType;
  reason: string;
}>("act", ({ id, action, reason }, actor) => moderationService.act(id, action, reason, actor));

export const moderationActions = moderationModule.actions;
export const {
  fetchList: fetchCases,
  fetchOne: fetchCase,
  fetchContext: fetchCaseContext,
} = moderationModule;
export default moderationModule.reducer;
