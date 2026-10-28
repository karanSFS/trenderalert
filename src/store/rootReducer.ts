import { combineReducers } from "@reduxjs/toolkit";
import appealsReducer from "@/features/appeals/appealsSlice";
import auditReducer from "@/features/audit/auditSlice";
import authReducer from "@/features/auth/authSlice";
import configurationReducer from "@/features/configuration/configurationSlice";
import contentReducer from "@/features/content/contentSlice";
import contestsReducer from "@/features/contests/contestsSlice";
import copyrightReducer from "@/features/copyright/copyrightSlice";
import dashboardReducer from "@/features/dashboard/dashboardSlice";
import discoveryReducer from "@/features/discovery/discoverySlice";
import financeOverviewReducer from "@/features/finance/financeOverviewSlice";
import reconciliationReducer from "@/features/finance/reconciliationSlice";
import transactionsReducer from "@/features/finance/transactionsSlice";
import moderationReducer from "@/features/moderation/moderationSlice";
import notificationsReducer from "@/features/notifications/notificationsSlice";
import operationsReducer from "@/features/operations/operationsSlice";
import adminUsersReducer from "@/features/security/adminUsersSlice";
import auditLogReducer from "@/features/security/auditLogSlice";
import layoutReducer from "@/features/settings/layoutSlice";
import themeReducer from "@/features/settings/themeSlice";
import subscriptionsReducer from "@/features/subscriptions/subscriptionsSlice";
import supportReducer from "@/features/support/supportSlice";
import trendsReducer from "@/features/trends/trendsSlice";
import usersReducer from "@/features/users/usersSlice";

export const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  layout: layoutReducer,
  audit: auditReducer,
  dashboard: dashboardReducer,
  notifications: notificationsReducer,
  users: usersReducer,
  content: contentReducer,
  trends: trendsReducer,
  moderation: moderationReducer,
  appeals: appealsReducer,
  copyright: copyrightReducer,
  contests: contestsReducer,
  subscriptions: subscriptionsReducer,
  transactions: transactionsReducer,
  reconciliation: reconciliationReducer,
  financeOverview: financeOverviewReducer,
  support: supportReducer,
  discovery: discoveryReducer,
  configuration: configurationReducer,
  adminUsers: adminUsersReducer,
  auditLog: auditLogReducer,
  operations: operationsReducer,
});
