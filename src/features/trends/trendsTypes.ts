import type { EntityId, IsoDateString, TimelineEntry } from "@/types/common";

export type TrendStage =
  "spark" | "rising" | "hot" | "peaking" | "cooling" | "expired" | "ended_early";

export type GeoScope = "near" | "city" | "region" | "nationwide" | "global";

/** Discovery durations allowed at publication (CNT14-002). Never extended afterwards. */
export type TrendDurationDays = 1 | 3 | 7 | 14 | 30;

export interface TrendRecord {
  /** Same id as the Trend post in Content. */
  id: EntityId;
  topic: string;
  tags: string[];
  creatorId: EntityId;
  creatorUsername: string;
  geoScope: GeoScope;
  locationLabel: string;
  trendScore: number;
  stage: TrendStage;
  publishedAt: IsoDateString;
  /** Fixed at publication. */
  expiresAt: IsoDateString;
  durationDays: TrendDurationDays;
  activity: { qualifiedShares: number; participants: number; creators: number; saves: number };
  featured: boolean;
  suppressed: boolean;
  mergedInto: EntityId | null;
  history: TimelineEntry[];
}

export interface TrendFilters {
  stage?: TrendStage;
  geoScope?: GeoScope;
  flag?: "featured" | "suppressed" | "merged";
}

/** Fields an administrator may correct. Expiration, creator and publish time are excluded (TRND-008). */
export interface TrendCorrection {
  topic: string;
  tags: string[];
  locationLabel: string;
}

export const ACTIVE_TREND_STAGES: TrendStage[] = ["spark", "rising", "hot", "peaking", "cooling"];
