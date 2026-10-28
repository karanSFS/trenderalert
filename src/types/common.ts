/** ISO-8601 timestamp string in UTC. */
export type IsoDateString = string;

export type EntityId = string;

export type StatusTone = "success" | "warning" | "error" | "info" | "neutral" | "brand";

/** One entry in a record's history (case actions, decisions, resolutions). */
export interface TimelineEntry {
  id: EntityId;
  at: IsoDateString;
  actor: string;
  title: string;
  detail?: string;
  tone?: StatusTone;
}

export interface Option<T extends string = string> {
  label: string;
  value: T;
}
