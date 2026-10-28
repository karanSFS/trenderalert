import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import layoutReducer from "@/features/settings/layoutSlice";
import themeReducer from "@/features/settings/themeSlice";

export const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  layout: layoutReducer,
});
