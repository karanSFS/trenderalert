"use client";

import { roleHasPermission } from "@/lib/constants/roles";
import { useAppSelector } from "@/store/hooks";
import type { Permission } from "@/types/auth";
import { selectCurrentRole } from "./authSelectors";

/** UI-only permission check for the current demo role. The backend must enforce the same rule. */
export function usePermission(permission: Permission): boolean {
  const role = useAppSelector(selectCurrentRole);
  return role ? roleHasPermission(role, permission) : false;
}

/** Returns a checker for components that evaluate several permissions. */
export function usePermissionChecker(): (permission: Permission) => boolean {
  const role = useAppSelector(selectCurrentRole);
  return (permission) => (role ? roleHasPermission(role, permission) : false);
}
