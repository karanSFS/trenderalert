import { ROLE_PERMISSIONS } from "@/lib/constants/roles";
import type { RootState } from "@/store";
import type { Permission } from "@/types/auth";

export const selectAuth = (state: RootState) => state.auth;
export const selectCurrentAdmin = (state: RootState) => state.auth.currentAdmin;
export const selectCurrentRole = (state: RootState) => state.auth.currentAdmin?.role ?? null;
export const selectIsAuthenticated = (state: RootState) => state.auth.currentAdmin !== null;
export const selectSessionRestored = (state: RootState) => state.auth.sessionRestored;

export const selectHasPermission = (state: RootState, permission: Permission): boolean => {
  const role = selectCurrentRole(state);
  return role ? ROLE_PERMISSIONS[role].includes(permission) : false;
};
