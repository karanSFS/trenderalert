import type { HealthStatus } from "@/features/dashboard/dashboardTypes";
import type { EntityId, IsoDateString } from "@/types/common";

export interface ServiceObjective {
  service: string;
  status: HealthStatus;
  availability: { target: number; actual: number };
  p95LatencyMs: { target: number; actual: number };
  errorRate: { target: number; actual: number };
}

export interface QueueStatus {
  name: string;
  depth: number;
  oldestAgeMinutes: number;
  targetAgeMinutes: number;
  deadLetter: number;
  status: HealthStatus;
}

export type IncidentSeverity = "sev1" | "sev2" | "sev3";
export type IncidentStatus = "investigating" | "monitoring" | "resolved";

export interface Incident {
  id: EntityId;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  startedAt: IsoDateString;
  acknowledgedBy: string | null;
  summary: string;
}

export interface MaintenanceWindow {
  id: EntityId;
  title: string;
  startsAt: IsoDateString;
  endsAt: IsoDateString;
  impact: string;
}

export interface OperationsSnapshot {
  asOf: IsoDateString;
  objectives: ServiceObjective[];
  queues: QueueStatus[];
  incidents: Incident[];
  maintenance: MaintenanceWindow[];
  backlog: {
    openModerationCases: number;
    openSupportCases: number;
    openFinancialExceptions: number;
    abuseSignals: number;
  };
}
