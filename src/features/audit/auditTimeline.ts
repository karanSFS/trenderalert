import type { TimelineEntry } from "@/types/common";
import type { AuditEvent } from "./auditTypes";

/** Shows audit events in a Timeline, newest first, session events and history merged. */
export function auditEventsToTimeline(events: readonly AuditEvent[]): TimelineEntry[] {
  const unique = new Map(events.map((event) => [event.id, event]));
  return [...unique.values()].map((event) => ({
    id: event.id,
    at: event.occurredAt,
    actor: event.actorName,
    title: event.summary,
    detail: event.reason,
    tone: event.id.startsWith("aud-demo") ? "brand" : "neutral",
  }));
}
