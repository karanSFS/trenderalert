import type { ContentAction, ContentFilters, ContentItem } from "@/features/content/contentTypes";
import type {
  CopyrightCase,
  CopyrightFilters,
  CopyrightResolution,
  EvidenceStatus,
} from "@/features/copyright/copyrightTypes";
import type { EntityId } from "@/types/common";
import type { ActionActor, DirectoryService } from "./directory";

/** Demo-data modules. Backend-connected services are in `backendServices.ts`. */

export interface ContentService extends DirectoryService<ContentItem, ContentFilters> {
  moderate(
    id: EntityId,
    action: ContentAction,
    reason: string,
    actor: ActionActor,
  ): Promise<ContentItem>;
}

export interface CopyrightService extends DirectoryService<CopyrightCase, CopyrightFilters> {
  setEvidence(id: EntityId, evidence: EvidenceStatus, actor: ActionActor): Promise<CopyrightCase>;
  resolve(
    id: EntityId,
    resolution: CopyrightResolution,
    reason: string,
    actor: ActionActor,
  ): Promise<CopyrightCase>;
}
