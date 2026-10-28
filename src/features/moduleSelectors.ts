import type { RootState } from "@/store";
import { appealsModule } from "./appeals/appealsSlice";
import { contentModule } from "./content/contentSlice";
import { contestsModule } from "./contests/contestsSlice";
import { copyrightModule } from "./copyright/copyrightSlice";
import { reconciliationModule } from "./finance/reconciliationSlice";
import { transactionsModule } from "./finance/transactionsSlice";
import { moderationModule } from "./moderation/moderationSlice";
import { adminUsersModule } from "./security/adminUsersSlice";
import { auditLogModule } from "./security/auditLogSlice";
import { subscriptionsModule } from "./subscriptions/subscriptionsSlice";
import { supportModule } from "./support/supportSlice";
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
export const contestsSelectors = contestsModule.makeSelectors((state: RootState) => state.contests);
export const subscriptionsSelectors = subscriptionsModule.makeSelectors(
  (state: RootState) => state.subscriptions,
);
export const transactionsSelectors = transactionsModule.makeSelectors(
  (state: RootState) => state.transactions,
);
export const reconciliationSelectors = reconciliationModule.makeSelectors(
  (state: RootState) => state.reconciliation,
);
export const supportSelectors = supportModule.makeSelectors((state: RootState) => state.support);
export const adminUsersSelectors = adminUsersModule.makeSelectors(
  (state: RootState) => state.adminUsers,
);
export const auditLogSelectors = auditLogModule.makeSelectors((state: RootState) => state.auditLog);

/** Single-document modules. */
export const selectDiscovery = (state: RootState) => state.discovery;
export const selectConfiguration = (state: RootState) => state.configuration;
export const selectOperations = (state: RootState) => state.operations;
export const selectFinanceOverview = (state: RootState) => state.financeOverview;
