import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { EntityId } from "@/types/common";
import type { AuditTargetType } from "./auditTypes";

export const selectSessionAuditEvents = (state: RootState) => state.audit.sessionEvents;

/** Memoized per call site: `const selectFor = makeSelectAuditEventsForTarget()` inside a component. */
export const makeSelectAuditEventsForTarget = () =>
  createSelector(
    [
      selectSessionAuditEvents,
      (_: RootState, targetType: AuditTargetType) => targetType,
      (_: RootState, _type: AuditTargetType, targetId: EntityId) => targetId,
    ],
    (events, targetType, targetId) =>
      events.filter((event) => event.targetType === targetType && event.targetId === targetId),
  );
