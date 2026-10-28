"use client";

import Link from "next/link";
import { DemoDataTag } from "@/components/ui/DemoDataTag";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type {
  ActivityItem,
  DashboardAlert,
  FinancialException,
  PendingCase,
  ServiceHealth,
} from "@/features/dashboard/dashboardTypes";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { formatDateTime } from "@/lib/formatters/date";
import { formatCurrency } from "@/lib/formatters/number";
import { Panel, PanelList, PanelRow, RowAside, RowMain } from "./Panel";
import {
  EXCEPTION_STATUS_BADGE,
  HEALTH_BADGE,
  PRIORITY_BADGE,
  SEVERITY_BADGE,
} from "./statusTones";

interface PanelDataProps<T> {
  items: T[];
  loading: boolean;
  limit?: number;
}

export function RecentActivityPanel({ items, loading, limit = 6 }: PanelDataProps<ActivityItem>) {
  return (
    <Panel
      title="Recent admin activity"
      badge={<DemoDataTag />}
      viewAllHref="/admin/security/audit-logs"
      loading={loading}
      isEmpty={items.length === 0}
      emptyTitle="No recent activity"
    >
      <PanelList>
        {items.slice(0, limit).map((item) => {
          const content = (
            <>
              <RowMain>
                <strong>{item.summary}</strong>
                <span>
                  {item.actorName} · {ROLE_LABELS[item.actorRole]}
                </span>
              </RowMain>
              <RowAside>
                <span>{formatDateTime(item.occurredAt)}</span>
                {item.session ? <StatusBadge tone="brand" label="This session" /> : null}
              </RowAside>
            </>
          );
          return (
            <li key={item.id}>
              {item.href ? (
                <PanelRow as={Link} href={item.href}>
                  {content}
                </PanelRow>
              ) : (
                <PanelRow>{content}</PanelRow>
              )}
            </li>
          );
        })}
      </PanelList>
    </Panel>
  );
}

export function PendingModerationPanel({ items, loading, limit = 5 }: PanelDataProps<PendingCase>) {
  return (
    <Panel
      title="Pending moderation"
      badge={<DemoDataTag />}
      viewAllHref="/admin/moderation"
      viewAllLabel="Open queue"
      loading={loading}
      isEmpty={items.length === 0}
      emptyTitle="Queue is clear"
    >
      <PanelList>
        {items.slice(0, limit).map((item) => (
          <li key={item.id}>
            <PanelRow as={Link} href={`/admin/moderation/${item.id}`}>
              <RowMain>
                <strong>{item.category}</strong>
                <span>
                  {item.id} · {item.reportedItem}
                </span>
                <span>
                  {item.assignedReviewer ? `Assigned to ${item.assignedReviewer}` : "Unassigned"}
                </span>
              </RowMain>
              <RowAside>
                <StatusBadge {...PRIORITY_BADGE[item.priority]} />
                <span>{formatDateTime(item.submittedAt)}</span>
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
            <PanelRow as={Link} href="/admin/finance/reconciliation">
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
  items,
  loading,
  canOpenOperations,
}: PanelDataProps<ServiceHealth> & { canOpenOperations: boolean }) {
  return (
    <Panel
      title="System health"
      badge={<DemoDataTag label="Simulated status" />}
      viewAllHref={canOpenOperations ? "/admin/operations" : undefined}
      viewAllLabel="Operations"
      loading={loading}
      isEmpty={items.length === 0}
    >
      <PanelList>
        {items.map((item) => (
          <li key={item.key}>
            <PanelRow>
              <RowMain>
                <strong>{item.name}</strong>
                <span>{item.detail}</span>
              </RowMain>
              <RowAside>
                <StatusBadge {...HEALTH_BADGE[item.status]} />
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
