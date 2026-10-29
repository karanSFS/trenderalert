import type { GeoScope } from "@/features/trends/trendsTypes";
import type { EntityId } from "@/types/common";

export type MarketStatus = "active" | "pilot" | "planned";

export interface Market {
  id: EntityId;
  name: string;
  region: string;
  status: MarketStatus;
  /** Paid contests require separate jurisdiction approval (D-09, CONT-010). */
  paidContestsAllowed: boolean;
}

export interface FeaturedLocation {
  id: EntityId;
  name: string;
  marketId: EntityId;
  kind: "city" | "district" | "venue";
  active: boolean;
}

export interface DiscoverySource {
  id: EntityId;
  name: string;
  description: string;
  enabled: boolean;
}

export interface FreshnessWindow {
  id: "now" | "today" | "week" | "month";
  label: string;
  hours: number;
}

export interface RelevanceRadius {
  scope: GeoScope;
  label: string;
  /** Approximate radius in km for candidate selection; never an exact user position. */
  radiusKm: number | null;
}

export interface DiscoveryConfig {
  markets: Market[];
  featuredLocations: FeaturedLocation[];
  sources: DiscoverySource[];
  freshness: FreshnessWindow[];
  relevance: RelevanceRadius[];
}
