import { copyrightService } from "@/services";
import { createDirectorySlice } from "@/store/createDirectorySlice";
import type { EntityId } from "@/types/common";
import type {
  CopyrightCase,
  CopyrightFilters,
  CopyrightResolution,
  EvidenceStatus,
} from "./copyrightTypes";

export const copyrightModule = createDirectorySlice<CopyrightCase, CopyrightFilters>({
  name: "copyright",
  service: copyrightService,
  initialFilters: { status: undefined, noticeType: undefined, evidenceStatus: undefined },
  list: { sortField: "responseDueAt", sortOrder: "ascend" },
});

export const setCopyrightEvidence = copyrightModule.createMutation<{
  id: EntityId;
  evidence: EvidenceStatus;
}>("setEvidence", ({ id, evidence }, actor) => copyrightService.setEvidence(id, evidence, actor));
export const resolveCopyright = copyrightModule.createMutation<{
  id: EntityId;
  resolution: CopyrightResolution;
  reason: string;
}>("resolve", ({ id, resolution, reason }, actor) =>
  copyrightService.resolve(id, resolution, reason, actor),
);

export const copyrightActions = copyrightModule.actions;
export const { fetchList: fetchCopyrightCases, fetchOne: fetchCopyrightCase } = copyrightModule;
export default copyrightModule.reducer;
