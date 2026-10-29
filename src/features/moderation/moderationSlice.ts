import { moderationService } from "@/services";
import { createDirectorySlice } from "@/store/createDirectorySlice";
import type { EntityId } from "@/types/common";
import type { ModerationAction, ModerationFilters, ModerationReport } from "./moderationTypes";

export const moderationModule = createDirectorySlice<ModerationReport, ModerationFilters>({
  name: "moderation",
  service: moderationService,
  initialFilters: { status: undefined, category: undefined, priority: undefined },
  list: { pageSize: 20 },
});

export const assignReport = moderationModule.createMutation<{
  id: EntityId;
  adminUserId: EntityId | null;
}>("assign", ({ id, adminUserId }) => moderationService.assign(id, adminUserId));

export const addReportNote = moderationModule.createMutation<{ id: EntityId; notes: string }>(
  "note",
  ({ id, notes }) => moderationService.addNote(id, notes),
);

export const actOnReport = moderationModule.createMutation<{
  id: EntityId;
  action: ModerationAction;
  justification: string;
  notes?: string;
}>("act", ({ id, action, justification, notes }) =>
  moderationService.act(id, action, justification, notes),
);

export const moderationActions = moderationModule.actions;
export const { fetchList: fetchReports, fetchOne: fetchReport } = moderationModule;
export default moderationModule.reducer;
