import type {
  AlertSeverity,
  CasePriority,
  FinancialException,
  HealthStatus,
} from "@/features/dashboard/dashboardTypes";
import type { StatusTone } from "@/types/common";

export const PRIORITY_BADGE: Record<CasePriority, { tone: StatusTone; label: string }> = {
  critical: { tone: "error", label: "Critical" },
  high: { tone: "warning", label: "High" },
  medium: { tone: "info", label: "Medium" },
  low: { tone: "neutral", label: "Low" },
};

export const HEALTH_BADGE: Record<HealthStatus, { tone: StatusTone; label: string }> = {
  operational: { tone: "success", label: "Operational" },
  degraded: { tone: "warning", label: "Degraded" },
  down: { tone: "error", label: "Down" },
};

export const SEVERITY_BADGE: Record<AlertSeverity, { tone: StatusTone; label: string }> = {
  critical: { tone: "error", label: "Critical" },
  warning: { tone: "warning", label: "Warning" },
  info: { tone: "info", label: "Info" },
};

export const EXCEPTION_STATUS_BADGE: Record<
  FinancialException["status"],
  { tone: StatusTone; label: string }
> = {
  open: { tone: "error", label: "Open" },
  investigating: { tone: "warning", label: "Investigating" },
};
