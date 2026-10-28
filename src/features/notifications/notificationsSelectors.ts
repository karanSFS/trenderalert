import { createSelector } from "@reduxjs/toolkit";
import { selectCurrentRole } from "@/features/auth/authSelectors";
import { roleHasPermission } from "@/lib/constants/roles";
import type { RootState } from "@/store";

export const selectNotificationsState = (state: RootState) => state.notifications;

/** Alerts the current demo role may see, newest first. */
export const selectVisibleNotifications = createSelector(
  [(state: RootState) => state.notifications.items, selectCurrentRole],
  (items, role) =>
    role
      ? items
          .filter((item) => roleHasPermission(role, item.permission))
          .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
      : [],
);

export const selectUnreadNotificationCount = createSelector(
  [selectVisibleNotifications, (state: RootState) => state.notifications.readIds],
  (items, readIds) => items.filter((item) => !readIds.includes(item.id)).length,
);
