import { contentService } from "@/services";
import type { ContentContext } from "@/services/contracts/moduleServices";
import { createDirectorySlice } from "@/store/createDirectorySlice";
import type { EntityId } from "@/types/common";
import type { ContentAction, ContentFilters, ContentItem } from "./contentTypes";

export const contentModule = createDirectorySlice<ContentItem, ContentFilters, ContentContext>({
  name: "content",
  service: contentService,
  initialFilters: {
    type: undefined,
    audience: undefined,
    moderationStatus: undefined,
    creatorId: undefined,
  },
  list: { sortField: "publishedAt", sortOrder: "descend" },
  getContext: (id) => contentService.getContext(id),
});

export const moderateContent = contentModule.createMutation<{
  id: EntityId;
  action: ContentAction;
  reason: string;
}>("moderate", ({ id, action, reason }, actor) =>
  contentService.moderate(id, action, reason, actor),
);

export const contentActions = contentModule.actions;
export const {
  fetchList: fetchContentList,
  fetchOne: fetchContentItem,
  fetchContext: fetchContentContext,
} = contentModule;
export default contentModule.reducer;
