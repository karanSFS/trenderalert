import type { RootState } from "@/store";
import { appealsModule } from "./appeals/appealsSlice";
import { contentModule } from "./content/contentSlice";
import { copyrightModule } from "./copyright/copyrightSlice";
import { moderationModule } from "./moderation/moderationSlice";
import { trendsModule } from "./trends/trendsSlice";
import { usersModule } from "./users/usersSlice";

/** Typed selectors for every directory module. */
export const usersSelectors = usersModule.makeSelectors((state: RootState) => state.users);
export const contentSelectors = contentModule.makeSelectors((state: RootState) => state.content);
export const trendsSelectors = trendsModule.makeSelectors((state: RootState) => state.trends);
export const moderationSelectors = moderationModule.makeSelectors(
  (state: RootState) => state.moderation,
);
export const appealsSelectors = appealsModule.makeSelectors((state: RootState) => state.appeals);
export const copyrightSelectors = copyrightModule.makeSelectors(
  (state: RootState) => state.copyright,
);
