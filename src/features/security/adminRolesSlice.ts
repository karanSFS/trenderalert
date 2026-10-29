import { adminRolesService } from "@/services";
import { createDirectorySlice } from "@/store/createDirectorySlice";
import type { EntityId } from "@/types/common";
import type { AdminRoleAssignment, AdminRoleFilters, AssignRoleRequest } from "./securityTypes";

export const adminRolesModule = createDirectorySlice<AdminRoleAssignment, AdminRoleFilters>({
  name: "adminRoles",
  service: adminRolesService,
  initialFilters: { role: undefined, state: undefined },
});

export const assignAdminRole = adminRolesModule.createMutation<AssignRoleRequest>(
  "assign",
  (request) => adminRolesService.assign(request),
);

export const revokeAdminRole = adminRolesModule.createMutation<{
  userId: EntityId;
  justification: string;
}>("revoke", ({ userId, justification }) => adminRolesService.revoke(userId, justification));

export const adminRolesActions = adminRolesModule.actions;
export const { fetchList: fetchAdminRoles } = adminRolesModule;
export default adminRolesModule.reducer;
