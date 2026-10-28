import { adminUsersService } from "@/services";
import { createDirectorySlice } from "@/store/createDirectorySlice";
import type { AdminRole } from "@/types/auth";
import type { EntityId } from "@/types/common";
import type { AdminAccount, AdminAccountFilters, AdminInvite } from "./securityTypes";

export const adminUsersModule = createDirectorySlice<AdminAccount, AdminAccountFilters>({
  name: "adminUsers",
  service: adminUsersService,
  initialFilters: { role: undefined, status: undefined },
  list: { sortField: "displayName", sortOrder: "ascend" },
});

export const inviteAdmin = adminUsersModule.createMutation<AdminInvite>("invite", (invite, actor) =>
  adminUsersService.invite(invite, actor),
);

export const changeAdminRole = adminUsersModule.createMutation<{
  id: EntityId;
  role: AdminRole;
  reason: string;
}>("changeRole", ({ id, role, reason }, actor) =>
  adminUsersService.changeRole(id, role, reason, actor),
);

export const setAdminActive = adminUsersModule.createMutation<{
  id: EntityId;
  active: boolean;
  reason: string;
}>("setActive", ({ id, active, reason }, actor) =>
  adminUsersService.setActive(id, active, reason, actor),
);

export const adminUsersActions = adminUsersModule.actions;
export const { fetchList: fetchAdminUsers, fetchOne: fetchAdminUser } = adminUsersModule;
export default adminUsersModule.reducer;
