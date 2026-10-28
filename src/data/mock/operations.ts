import type { OperationsSnapshot } from "@/features/operations/operationsTypes";
import { DEMO_AS_OF } from "./seed";

/**
 * Simulated operations snapshot that matches the dashboard health panel. It is static demo
 * data, not monitoring output; backlog counts are filled in from the demo database.
 */
export const OPERATIONS_SNAPSHOT: Omit<OperationsSnapshot, "backlog"> & { abuseSignals: number } = {
  asOf: DEMO_AS_OF,
  objectives: [
    {
      service: "Core API",
      status: "operational",
      availability: { target: 99.9, actual: 99.96 },
      p95LatencyMs: { target: 300, actual: 182 },
      errorRate: { target: 0.5, actual: 0.12 },
    },
    {
      service: "Media processing",
      status: "degraded",
      availability: { target: 99.5, actual: 99.41 },
      p95LatencyMs: { target: 5000, actual: 8400 },
      errorRate: { target: 1, actual: 0.6 },
    },
    {
      service: "Notification fan-out",
      status: "operational",
      availability: { target: 99.5, actual: 99.9 },
      p95LatencyMs: { target: 2000, actual: 950 },
      errorRate: { target: 1, actual: 0.2 },
    },
    {
      service: "TrendScore recalculation",
      status: "operational",
      availability: { target: 99, actual: 99.7 },
      p95LatencyMs: { target: 60000, actual: 41000 },
      errorRate: { target: 1, actual: 0.1 },
    },
    {
      service: "Payment provider webhooks",
      status: "degraded",
      availability: { target: 99.9, actual: 99.62 },
      p95LatencyMs: { target: 1000, actual: 2600 },
      errorRate: { target: 0.5, actual: 0.9 },
    },
    {
      service: "Search index",
      status: "operational",
      availability: { target: 99.5, actual: 99.95 },
      p95LatencyMs: { target: 400, actual: 210 },
      errorRate: { target: 0.5, actual: 0.05 },
    },
  ],
  queues: [
    {
      name: "Media processing",
      depth: 1_284,
      oldestAgeMinutes: 14,
      targetAgeMinutes: 5,
      deadLetter: 6,
      status: "degraded",
    },
    {
      name: "Notifications",
      depth: 312,
      oldestAgeMinutes: 1,
      targetAgeMinutes: 2,
      deadLetter: 0,
      status: "operational",
    },
    {
      name: "Moderation intake",
      depth: 41,
      oldestAgeMinutes: 3,
      targetAgeMinutes: 10,
      deadLetter: 0,
      status: "operational",
    },
    {
      name: "Payment webhooks",
      depth: 27,
      oldestAgeMinutes: 9,
      targetAgeMinutes: 5,
      deadLetter: 3,
      status: "degraded",
    },
    {
      name: "Trend expiry",
      depth: 0,
      oldestAgeMinutes: 0,
      targetAgeMinutes: 15,
      deadLetter: 0,
      status: "operational",
    },
  ],
  incidents: [
    {
      id: "inc-77",
      title: "Media processing queue above target",
      severity: "sev3",
      status: "investigating",
      startedAt: "2026-10-27T21:05:00Z",
      acknowledgedBy: null,
      summary: "Transcoding workers are behind after a traffic spike; uploads appear late.",
    },
    {
      id: "inc-76",
      title: "Delayed payment webhook deliveries",
      severity: "sev3",
      status: "monitoring",
      startedAt: "2026-10-27T22:30:00Z",
      acknowledgedBy: "Marcus Bell",
      summary: "Three deliveries delayed in the last hour; reconciliation may lag.",
    },
    {
      id: "inc-74",
      title: "Search freshness lag",
      severity: "sev3",
      status: "resolved",
      startedAt: "2026-10-22T08:10:00Z",
      acknowledgedBy: "Avery Collins",
      summary: "Index rebuild completed; freshness back under target.",
    },
  ],
  maintenance: [
    {
      id: "mw-12",
      title: "Scheduled maintenance window",
      startsAt: "2026-10-30T06:00:00Z",
      endsAt: "2026-10-30T07:00:00Z",
      impact: "Uploads paused; browsing unaffected.",
    },
  ],
  abuseSignals: 17,
};
