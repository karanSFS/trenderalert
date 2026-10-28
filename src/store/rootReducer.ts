import { combineReducers } from "@reduxjs/toolkit";
import appealsReducer from "@/features/appeals/appealsSlice";
import auditReducer from "@/features/audit/auditSlice";
import authReducer from "@/features/auth/authSlice";
import contentReducer from "@/features/content/contentSlice";
import copyrightReducer from "@/features/copyright/copyrightSlice";
import dashboardReducer from "@/features/dashboard/dashboardSlice";
import moderationReducer from "@/features/moderation/moderationSlice";
import notificationsReducer from "@/features/notifications/notificationsSlice";
import layoutReducer from "@/features/settings/layoutSlice";
import themeReducer from "@/features/settings/themeSlice";
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
});
