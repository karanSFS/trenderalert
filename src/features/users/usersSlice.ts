import { usersService } from "@/services";
import { createDirectorySlice } from "@/store/createDirectorySlice";
import type { DirectoryUser, DirectoryUserFilters } from "./usersTypes";

/** Backend user directory. Read-only: enforcement goes through moderation reports. */
export const usersModule = createDirectorySlice<DirectoryUser, DirectoryUserFilters>({
  name: "users",
  service: usersService,
  initialFilters: { status: undefined, minor: undefined },
  list: { pageSize: 20 },
});

export const usersActions = usersModule.actions;
export const { fetchList: fetchUsers, fetchOne: fetchUser } = usersModule;
export default usersModule.reducer;
