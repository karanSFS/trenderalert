import type { EntityId, IsoDateString } from "@/types/common";

/** `GET /admin/dashboard/metrics`. */
export interface PlatformMetrics {
  totalUsers: number;
  openReports: number;
  slaBreaches: number;
  activeAppeals: number;
  /** Feature-flag keys whose kill switch is engaged. */
  activeKillSwitches: string[];
  systemHealth: string;
}

/** `GET /health`. */
export interface PlatformHealth {
  status: string;
  service: string;
  version: string;
  activeTrends: number | null;
  redisConnected: boolean | null;
}

/** `GET/POST /admin/configs/feature-flags`. */
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  /** Algorithm weights, thresholds and other settings for the flag. */
  payload: Record<string, unknown>;
  regions: string[];
  updatedBy: EntityId | null;
  updatedAt: IsoDateString;
}

export interface FeatureFlagChange {
  key: string;
  enabled: boolean;
  payload: Record<string, unknown>;
  regions: string[];
  justification: string;
}

/** Flags that stay off until legal and provider approvals exist (CONT-010, D-09). */
export const ACTIVATION_GATED_FLAGS = ["ENABLE_PAID_CONTESTS"];

/** Flag that holds the TrendScore weights (percent per factor). */
export const RANKING_FLAG_KEY = "RANKING_ALGORITHM_V14";
