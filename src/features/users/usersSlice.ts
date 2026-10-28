import { usersService } from "@/services";
import type { UserActivity } from "@/services/contracts/moduleServices";
import { createDirectorySlice } from "@/store/createDirectorySlice";
import type { EntityId } from "@/types/common";
import type { PlatformUser, UserEnforcementAction, UserFilters } from "./usersTypes";

export const usersModule = createDirectorySlice<PlatformUser, UserFilters, UserActivity>({
  name: "users",
  service: usersService,
  initialFilters: { status: undefined, plan: undefined, verification: undefined },
  list: { sortField: "registeredAt", sortOrder: "descend" },
  getContext: (id) => usersService.getActivity(id),
});

export const enforceUser = usersModule.createMutation<{
  id: EntityId;
  action: UserEnforcementAction;
  reason: string;
}>("enforce", ({ id, action, reason }, actor) => usersService.enforce(id, action, reason, actor));

export const usersActions = usersModule.actions;
export const {
  fetchList: fetchUsers,
  fetchOne: fetchUser,
  fetchContext: fetchUserActivity,
} = usersModule;
export default usersModule.reducer;
