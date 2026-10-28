import { combineReducers } from "@reduxjs/toolkit";
import auditReducer from "@/features/audit/auditSlice";
import authReducer from "@/features/auth/authSlice";
import dashboardReducer from "@/features/dashboard/dashboardSlice";
import notificationsReducer from "@/features/notifications/notificationsSlice";
import layoutReducer from "@/features/settings/layoutSlice";
import themeReducer from "@/features/settings/themeSlice";

export const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  layout: layoutReducer,
  audit: auditReducer,
  dashboard: dashboardReducer,
  notifications: notificationsReducer,
});
