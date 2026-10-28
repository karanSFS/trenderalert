import { supportService } from "@/services";
import type { ActionActor } from "@/services/contracts/directory";
import { createDirectorySlice } from "@/store/createDirectorySlice";
import type { EntityId } from "@/types/common";
import type { EscalationTeam, SupportCase, SupportFilters, SupportStatus } from "./supportTypes";

export const supportModule = createDirectorySlice<SupportCase, SupportFilters>({
  name: "support",
  service: supportService,
  initialFilters: {
    status: undefined,
    category: undefined,
    priority: undefined,
    assignee: undefined,
  },
  list: { sortField: "createdAt", sortOrder: "descend" },
});

export const assignSupportCase = supportModule.createMutation<{
  id: EntityId;
  agent: ActionActor | null;
}>("assign", ({ id, agent }, actor) => supportService.assign(id, agent, actor));

export const setSupportStatus = supportModule.createMutation<{
  id: EntityId;
  status: Exclude<SupportStatus, "escalated">;
}>("status", ({ id, status }, actor) => supportService.setStatus(id, status, actor));

export const addSupportNote = supportModule.createMutation<{ id: EntityId; text: string }>(
  "note",
  ({ id, text }, actor) => supportService.addNote(id, text, actor),
);

export const escalateSupportCase = supportModule.createMutation<{
  id: EntityId;
  team: EscalationTeam;
  reason: string;
}>("escalate", ({ id, team, reason }, actor) => supportService.escalate(id, team, reason, actor));

export const supportActions = supportModule.actions;
export const { fetchList: fetchSupportCases, fetchOne: fetchSupportCase } = supportModule;
export default supportModule.reducer;
