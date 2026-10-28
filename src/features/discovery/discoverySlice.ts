import { discoveryService } from "@/services";
import type { DiscoveryUpdate } from "@/services/contracts/operationalServices";
import { createDocumentSlice } from "@/store/createDocumentSlice";
import type { DiscoveryConfig } from "./discoveryTypes";

export const discoveryModule = createDocumentSlice<DiscoveryConfig>({
  name: "discovery",
  fetch: () => discoveryService.get(),
});

export const updateDiscovery = discoveryModule.createSave<DiscoveryUpdate>(
  "update",
  (update, actor) => discoveryService.update(update, actor),
);

export const fetchDiscovery = discoveryModule.fetchDocument;
export const discoveryActions = discoveryModule.actions;
export default discoveryModule.reducer;
