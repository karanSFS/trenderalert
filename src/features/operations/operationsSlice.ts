import { operationsService } from "@/services";
import { createDocumentSlice } from "@/store/createDocumentSlice";
import type { EntityId } from "@/types/common";
import type { OperationsSnapshot } from "./operationsTypes";

export const operationsModule = createDocumentSlice<OperationsSnapshot>({
  name: "operations",
  fetch: () => operationsService.getSnapshot(),
});

export const acknowledgeIncident = operationsModule.createSave<EntityId>(
  "acknowledge",
  (id, actor) => operationsService.acknowledgeIncident(id, actor),
);

export const fetchOperations = operationsModule.fetchDocument;
export default operationsModule.reducer;
