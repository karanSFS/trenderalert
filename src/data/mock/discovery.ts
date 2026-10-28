import type { DiscoveryConfig } from "@/features/discovery/discoveryTypes";

/**
 * Fictional discovery configuration. The ranking factors are a proposal for discussion
 * (TrendScore is an owner decision); none of this is connected to a live ranking service.
 */
export const DISCOVERY_CONFIG: DiscoveryConfig = {
  markets: [
    {
      id: "mkt-01",
      name: "Riverton",
      region: "United States",
      status: "active",
      paidContestsAllowed: false,
    },
    {
      id: "mkt-02",
      name: "Harbor District",
      region: "United States",
      status: "active",
      paidContestsAllowed: false,
    },
    {
      id: "mkt-03",
      name: "Maple Heights",
      region: "United States",
      status: "active",
      paidContestsAllowed: false,
    },
    {
      id: "mkt-04",
      name: "Brightwater",
      region: "United States",
      status: "pilot",
      paidContestsAllowed: false,
    },
    {
      id: "mkt-05",
      name: "Stonebridge",
      region: "United States",
      status: "planned",
      paidContestsAllowed: false,
    },
  ],
  featuredLocations: [
    { id: "loc-01", name: "Old Mill Square", marketId: "mkt-01", kind: "district", active: true },
    { id: "loc-02", name: "Canal Street", marketId: "mkt-02", kind: "district", active: true },
    {
      id: "loc-03",
      name: "Lakeside Night Market",
      marketId: "mkt-02",
      kind: "venue",
      active: true,
    },
    { id: "loc-04", name: "Cedar Falls", marketId: "mkt-03", kind: "city", active: false },
    { id: "loc-05", name: "Northgate Arena", marketId: "mkt-04", kind: "venue", active: true },
  ],
  sources: [
    {
      id: "src-member",
      name: "Member Trends",
      description: "Trends created in the app by members.",
      enabled: true,
    },
    {
      id: "src-rooms",
      name: "Trend Rooms",
      description: "Activity in Trend Rooms (feature-flagged pilot).",
      enabled: true,
    },
    {
      id: "src-contests",
      name: "Contest entries",
      description: "Public entries from approved contests.",
      enabled: true,
    },
    {
      id: "src-editorial",
      name: "Editorial picks",
      description: "Admin-featured Trends; always labeled as featured.",
      enabled: false,
    },
  ],
  freshness: [
    { id: "now", label: "Now", hours: 3 },
    { id: "today", label: "Today", hours: 24 },
    { id: "week", label: "This week", hours: 168 },
    { id: "month", label: "This month", hours: 720 },
  ],
  relevance: [
    { scope: "near", label: "Near You", radiusKm: 8 },
    { scope: "city", label: "City", radiusKm: 30 },
    { scope: "region", label: "Region", radiusKm: 150 },
    { scope: "nationwide", label: "Nationwide", radiusKm: null },
    { scope: "global", label: "Global", radiusKm: null },
  ],
  ranking: {
    version: "proposal-3",
    factors: [
      { id: "engagement", label: "Engagement velocity", weight: 35 },
      { id: "freshness", label: "Freshness", weight: 25 },
      { id: "proximity", label: "Approximate proximity", weight: 20 },
      { id: "quality", label: "Creator standing", weight: 10 },
      { id: "diversity", label: "Topic diversity", weight: 10 },
    ],
    risingThreshold: 60,
    hotThreshold: 80,
    updatedAt: "2026-10-21T15:10:00Z",
    updatedBy: "Avery Collins",
  },
};
