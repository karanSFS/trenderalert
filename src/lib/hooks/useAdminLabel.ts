"use client";

import { useCallback } from "react";
import { selectCurrentAdmin } from "@/features/auth/authSelectors";
import { usePermission } from "@/features/auth/usePermission";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { shortId } from "@/lib/formatters/text";
import { adminRolesService } from "@/services";
import { useAppSelector } from "@/store/hooks";
import { useLookup } from "./useLookup";

const loadRoles = async () => {
  const result = await adminRolesService.list({ page: 1, pageSize: 500, filters: {} });
  return Object.fromEntries(
    result.items.map((item) => [
      item.userId,
      item.userName ?? (item.role ? ROLE_LABELS[item.role] : item.roleName),
    ]),
  );
};

/**
 * Labels an admin user id where the backend gives no name: "You", the admin's name from the
 * role list (when the viewer may read it), or a shortened id.
 */
export function useAdminLabel() {
  const me = useAppSelector(selectCurrentAdmin);
  const canListRoles = usePermission("security:manage-admins");
  const roles = useLookup<Record<string, string>>(
    canListRoles ? "admin-role-labels" : "admin-role-labels:none",
    canListRoles ? loadRoles : async () => ({}),
  );

  return useCallback(
    (userId: string | null | undefined) => {
      if (!userId) return "—";
      if (userId === me?.id) return `You (${me.displayName})`;
      return roles?.[userId] ?? shortId(userId);
    },
    [me, roles],
  );
}
