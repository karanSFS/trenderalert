/** ISO-8601 timestamp string in UTC. */
export type IsoDateString = string;

export type EntityId = string;

export type StatusTone = "success" | "warning" | "error" | "info" | "neutral" | "brand";

export interface Option<T extends string = string> {
  label: string;
  value: T;
}
