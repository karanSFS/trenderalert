"use client";

import Link from "next/link";
import { DemoDataTag } from "@/components/ui/DemoDataTag";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { DashboardAlert, FinancialException } from "@/features/dashboard/dashboardTypes";
import { isSlaBreached, type ModerationReport } from "@/features/moderation/moderationTypes";
import type { PlatformHealth, PlatformMetrics } from "@/features/platform/platformTypes";
import type { AuditLogEntry } from "@/features/security/securityTypes";
import { categoryLabel, priorityBadge, REPORT_STATUS } from "@/lib/constants/moderationLabels";
import { formatDateTime, formatFromNow } from "@/lib/formatters/date";
import { formatCurrency } from "@/lib/formatters/number";
import { humanizeCode, shortId } from "@/lib/formatters/text";
import { Panel, PanelList, PanelRow, RowAside, RowMain } from "./Panel";
import { EXCEPTION_STATUS_BADGE, HEALTH_BADGE, SEVERITY_BADGE } from "./statusTones";

interface PanelDataProps<T> {
  items: T[];
  loading: boolean;
  limit?: number;
}

export function RecentActivityPanel({
  items,
  loading,
  error,
  adminLabel,
}: PanelDataProps<AuditLogEntry> & { error?: string | null; adminLabel: (id: string) => string }) {
  return (
    <Panel
      title="Recent admin activity"
      viewAllHref="/admin/security/audit-logs"
      viewAllLabel="Audit logs"
      loading={loading}
      isEmpty={items.length === 0}
      emptyTitle={error ? "Activity could not be loaded" : "No recorded activity yet"}
      emptyDescription={error ?? undefined}
    >
      <PanelList>
        {items.map((item) => (
          <li key={item.id}>
            <PanelRow as={Link} href={`/admin/security/audit-logs?open=${item.id}`}>
              <RowMain>
                <strong>{humanizeCode(item.action)}</strong>
                <span>{item.justification}</span>
                <span>{adminLabel(item.actorId)}</span>
              </RowMain>
              <RowAside>
                <span>{formatDateTime(item.createdAt)}</span>
              </RowAside>
            </PanelRow>
          </li>
        ))}
      </PanelList>
    </Panel>
  );
}

export function OpenReportsPanel({
  items,
  loading,
  error,
  limit = 5,
}: PanelDataProps<ModerationReport> & { error?: string | null }) {
  return (
    <Panel
      title="Open moderation reports"
      viewAllHref="/admin/moderation"
      viewAllLabel="Open queue"
      loading={loading}
      isEmpty={items.length === 0}
      emptyTitle={error ? "Reports could not be loaded" : "Queue is clear"}
      emptyDescription={error ?? undefined}
    >
      <PanelList>
        {items.slice(0, limit).map((item) => (
          <li key={item.id}>
            <PanelRow as={Link} href={`/admin/moderation/${item.id}`}>
              <RowMain>
                <strong>{categoryLabel(item.category)}</strong>
                <span>
                  {shortId(item.id)} · {REPORT_STATUS[item.status].label}
                </span>
                <span>
                  {isSlaBreached(item) ? "SLA overdue" : `SLA due ${formatFromNow(item.slaDueAt)}`}
                </span>
              </RowMain>
              <RowAside>
                <StatusBadge {...priorityBadge(item.priority)} />
              </RowAside>
            </PanelRow>
          </li>
        ))}
      </PanelList>
    </Panel>
  );
}

export function FinancialExceptionsPanel({
  items,
  loading,
  limit = 5,
}: PanelDataProps<FinancialException>) {
  return (
    <Panel
      title="Financial exceptions"
      badge={<DemoDataTag label="Simulated" />}
      viewAllHref="/admin/finance/reconciliation"
      viewAllLabel="Reconciliation"
      loading={loading}
      isEmpty={items.length === 0}
      emptyTitle="No open exceptions"
    >
      <PanelList>
        {items.slice(0, limit).map((item) => (
          <li key={item.id}>
            <PanelRow as={Link} href={`/admin/finance/reconciliation?open=${item.id}`}>
              <RowMain>
                <strong>{item.type}</strong>
                <span>
                  {item.id} · {item.provider} · {formatCurrency(item.amount)}
                </span>
              </RowMain>
              <RowAside>
                <StatusBadge {...EXCEPTION_STATUS_BADGE[item.status]} />
                <span>{formatDateTime(item.detectedAt)}</span>
              </RowAside>
            </PanelRow>
          </li>
        ))}
      </PanelList>
    </Panel>
  );
}

export function SystemHealthPanel({
  health,
  metrics,
  loading,
  error,
  canOpenOperations,
}: {
  health: PlatformHealth | null;
  metrics: PlatformMetrics | null;
  loading: boolean;
  error?: string | null;
  canOpenOperations: boolean;
}) {
  const rows: { key: string; name: string; detail: string; healthy: boolean | null }[] = [];
  if (health) {
    rows.push({
      key: "api",
      name: health.service,
      detail: `Version ${health.version}`,
      healthy: health.status.toLowerCase() === "healthy",
    });
    if (health.redisConnected !== null)
      rows.push({
        key: "cache",
        name: "Cache (Redis)",
        detail: health.redisConnected ? "Connected" : "Not connected",
        healthy: health.redisConnected,
      });
  }
  if (metrics) {
    rows.push({
      key: "platform",
      name: "Platform status",
      detail: humanizeCode(metrics.systemHealth),
      healthy: metrics.systemHealth.toUpperCase() === "HEALTHY",
    });
    rows.push({
      key: "kill",
      name: "Kill switches",
      detail: metrics.activeKillSwitches.length
        ? metrics.activeKillSwitches.map(humanizeCode).join(", ")
        : "None active",
      healthy: null,
    });
  }
  return (
    <Panel
      title="System health"
      viewAllHref={canOpenOperations ? "/admin/operations" : undefined}
      viewAllLabel="Operations"
      loading={loading}
      isEmpty={rows.length === 0}
      emptyTitle={error ? "Health could not be checked" : "No health data"}
      emptyDescription={error ?? undefined}
    >
      <PanelList>
        {rows.map((row) => (
          <li key={row.key}>
            <PanelRow>
              <RowMain>
                <strong>{row.name}</strong>
                <span>{row.detail}</span>
              </RowMain>
              <RowAside>
                {row.healthy === null ? null : (
                  <StatusBadge {...HEALTH_BADGE[row.healthy ? "operational" : "degraded"]} />
                )}
              </RowAside>
            </PanelRow>
          </li>
        ))}
      </PanelList>
    </Panel>
  );
}

export function RecentAlertsPanel({ items, loading, limit = 5 }: PanelDataProps<DashboardAlert>) {
  return (
    <Panel
      title="Recent alerts"
      badge={<DemoDataTag />}
      loading={loading}
      isEmpty={items.length === 0}
      emptyTitle="No alerts for your role"
    >
      <PanelList>
        {items.slice(0, limit).map((item) => (
          <li key={item.id}>
            <PanelRow as={Link} href={item.href}>
              <RowMain>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </RowMain>
              <RowAside>
                <StatusBadge {...SEVERITY_BADGE[item.severity]} />
                <span>{formatDateTime(item.occurredAt)}</span>
              </RowAside>
            </PanelRow>
          </li>
        ))}
      </PanelList>
    </Panel>
  );
}
