import { configurationService } from "@/services";
import type { AnnouncementDraft, EditableSettings } from "@/services/contracts/operationalServices";
import { createDocumentSlice } from "@/store/createDocumentSlice";
import type { EntityId } from "@/types/common";
import type { ConfigurationData } from "./configurationTypes";

export const configurationModule = createDocumentSlice<ConfigurationData>({
  name: "configuration",
  fetch: () => configurationService.get(),
});

export const updateSettings = configurationModule.createSave<EditableSettings>(
  "settings",
  (settings, actor) => configurationService.updateSettings(settings, actor),
);

export const saveAnnouncement = configurationModule.createSave<AnnouncementDraft>(
  "announcement",
  (draft, actor) => configurationService.saveAnnouncement(draft, actor),
);

export const endAnnouncement = configurationModule.createSave<EntityId>(
  "endAnnouncement",
  (id, actor) => configurationService.endAnnouncement(id, actor),
);

export const fetchConfiguration = configurationModule.fetchDocument;
export const configurationActions = configurationModule.actions;
export default configurationModule.reducer;
