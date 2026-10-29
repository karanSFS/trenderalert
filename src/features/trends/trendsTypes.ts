import type { EntityId, IsoDateString } from "@/types/common";

/** Backend `TrendStage`. */
export type TrendStage =
  | "SIGNAL"
  | "EMERGING"
  | "RISING"
  | "BREAKING"
  | "REGIONAL"
  | "NATIONAL"
  | "GLOBAL"
  | "MAINSTREAM"
  | "COOLING"
  | "ARCHIVED"
  | "DISQUALIFIED";

/** Backend `TrendCategory`. */
export type TrendCategory =
  | "Food & Drink"
  | "Fashion"
  | "Style"
  | "Music"
  | "Tech"
  | "Wellness"
  | "Culture"
  | "Community"
  | "Sports";

/** Geographic discovery tiers (used by the Discovery relevance settings). */
export type GeoScope = "near" | "city" | "region" | "nationwide" | "global";

/** A Trend post from `GET /trends/`. */
export interface TrendPost {
  id: EntityId;
  /** Creator handle as returned by the backend. */
  creator: string;
  topicId: string;
  topicTitle: string;
  category: string;
  caption: string;
  city: string;
  h3Cell: string;
  stage: TrendStage;
  trendScore: number;
  durationHours: number;
  createdAt: IsoDateString;
  /** Fixed at publication; never extended. */
  expiresAt: IsoDateString;
  daysLeft: number;
  firstSpotterBadge: string | null;
}

export interface TrendFilters {
  stage?: TrendStage;
  category?: TrendCategory;
}

/** `GET /trends/topics/{topic_id}/score`. Factor values are weighted points. */
export interface TrendScoreBreakdown {
  overall: number;
  growthVelocity: number;
  qualifiedReach: number;
  geographicSpread: number;
  originality: number;
  riskPenalty: number;
  predictionLabel: string;
  confidencePct: number;
}

export interface TrendJourneyStop {
  city: string;
  region: string;
  stage: string;
  dateReached: string;
  velocityMultiplier: number;
  description: string;
}

/** `GET /radar/journey/{topic_id}`. */
export interface TrendJourney {
  topicId: string;
  topicTitle: string;
  originCity: string;
  createdDate: string;
  currentStage: string;
  trendScore: number;
  stops: TrendJourneyStop[];
}

export interface TrendInsights {
  score: TrendScoreBreakdown | null;
  journey: TrendJourney | null;
}
