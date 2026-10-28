import { contestsService } from "@/services";
import { createDirectorySlice } from "@/store/createDirectorySlice";
import type { EntityId } from "@/types/common";
import type { Contest, ContestDecision, ContestFilters } from "./contestsTypes";

export const contestsModule = createDirectorySlice<Contest, ContestFilters>({
  name: "contests",
  service: contestsService,
  initialFilters: { status: undefined, type: undefined },
  list: { sortField: "entryOpensAt", sortOrder: "descend" },
});

export const lockContestRules = contestsModule.createMutation<EntityId>("lockRules", (id, actor) =>
  contestsService.lockRules(id, actor),
);

export const submitContestForReview = contestsModule.createMutation<EntityId>(
  "submit",
  (id, actor) => contestsService.submitForReview(id, actor),
);

export const decideContest = contestsModule.createMutation<{
  id: EntityId;
  decision: ContestDecision;
  reason: string;
}>("decide", ({ id, decision, reason }, actor) =>
  contestsService.decide(id, decision, reason, actor),
);

export const setContestEntryStatus = contestsModule.createMutation<{
  id: EntityId;
  entryId: EntityId;
  status: "valid" | "disqualified";
  reason: string;
}>("entryStatus", ({ id, entryId, status, reason }, actor) =>
  contestsService.setEntryStatus(id, entryId, status, reason, actor),
);

export const resolveContestDispute = contestsModule.createMutation<{
  id: EntityId;
  disputeId: EntityId;
  resolution: string;
}>("resolveDispute", ({ id, disputeId, resolution }, actor) =>
  contestsService.resolveDispute(id, disputeId, resolution, actor),
);

export const contestsActions = contestsModule.actions;
export const { fetchList: fetchContests, fetchOne: fetchContest } = contestsModule;
export default contestsModule.reducer;
