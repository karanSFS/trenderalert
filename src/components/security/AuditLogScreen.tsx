"use client";

import { DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Tooltip, type TableColumnsType } from "antd";
import { useMemo } from "react";
import styled from "styled-components";
import { DataTable } from "@/components/ui/DataTable";
import { DetailDrawer, DetailList } from "@/components/ui/DetailDrawer";
import { FilterBar } from "@/components/ui/FilterBar";
import { Identity } from "@/components/ui/Identity";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { AuditEvent, AuditTargetType } from "@/features/audit/auditTypes";
import { auditLogSelectors } from "@/features/moduleSelectors";
import { auditLogActions, fetchAuditLog } from "@/features/security/auditLogSlice";
import type { AuditLogFilters } from "@/features/security/securityTypes";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { toOptions } from "@/lib/constants/statusLabels";
import { formatDateTime } from "@/lib/formatters/date";
import { useDirectoryList } from "@/lib/hooks/useDirectoryList";
import { useLookup } from "@/lib/hooks/useLookup";
import { useOpenParam } from "@/lib/hooks/useOpenParam";
import { auditLogService } from "@/services";
import { useAppSelector } from "@/store/hooks";

const MODULE_LABELS: Record<string, string> = {
  user: "Users",
  content: "Content",
  trend: "Trends",
  moderation: "Moderation",
  appeal: "Appeals",
  copyright: "Copyright",
  contest: "Contests",
  transaction: "Transactions",
  reconciliation: "Reconciliation",
  support: "Support",
  discovery: "Discovery",
  configuration: "Configuration",
  featureFlag: "Feature flags",
  adminUser: "Admin users",
  operations: "Operations",
};

const TARGET_LABELS: Record<AuditTargetType, string> = {
  user: "Member account",
  content: "Content",
  trend: "Trend",
  moderationCase: "Moderation case",
  appeal: "Appeal",
  copyrightCase: "Copyright case",
  contest: "Contest",
  subscription: "Subscription",
  transaction: "Transaction",
  reconciliation: "Reconciliation exception",
  supportCase: "Support case",
  discovery: "Discovery setting",
  configuration: "Configuration",
  featureFlag: "Feature flag",
  adminUser: "Administrator",
  incident: "Incident",
};

const loadActors = () => auditLogService.listActors();

const Notice = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const Code = styled.code`
  font-family: var(--font-geist-mono), monospace;
  font-size: ${({ theme }) => theme.font.sizeSm};
`;

const isSessionEvent = (event: AuditEvent) => event.id.startsWith("aud-demo");

export function AuditLogScreen() {
  const { table, search, filterBar } = useDirectoryList(
    auditLogSelectors,
    fetchAuditLog,
    auditLogActions,
  );
  const [openId, setOpenId] = useOpenParam();
  const actorOptions = (useLookup("audit.actors", loadActors) ?? []).map((actor) => ({
    value: actor.id,
    label: actor.name,
  }));

  const columns: TableColumnsType<AuditEvent> = [
    {
      key: "occurredAt",
      title: "When",
      sorter: true,
      width: 190,
      render: (_, event) => formatDateTime(event.occurredAt),
    },
    {
      key: "actor",
      title: "Administrator",
      render: (_, event) => (
        <Identity>
          <strong>{event.actorName}</strong>
          <span>{ROLE_LABELS[event.actorRole]}</span>
        </Identity>
      ),
    },
    {
      key: "summary",
      title: "Action",
      render: (_, event) => (
        <Identity>
          <strong>{event.summary}</strong>
          <span>
            <Code>{event.action}</Code>
          </span>
        </Identity>
      ),
    },
    {
      key: "target",
      title: "Target",
      render: (_, event) => (
        <Identity>
          <strong>{event.targetId}</strong>
          <span>{TARGET_LABELS[event.targetType]}</span>
        </Identity>
      ),
    },
    {
      key: "source",
      title: "Source",
      render: (_, event) =>
        isSessionEvent(event) ? (
          <StatusBadge label="This session" tone="brand" />
        ) : (
          <StatusBadge label="Seeded history" tone="neutral" />
        ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Security"
        title="Audit logs"
        subtitle="Administrative actions in this demo: seeded history plus actions taken during this browser session."
      />
      <Notice
        type="info"
        showIcon
        title="Append-only"
        description="Entries cannot be edited or deleted. Demo entries are simulated and reset when the page is reloaded; they are not a real audit trail."
      />
      <DataTable<AuditEvent>
        ariaLabel="Audit log"
        columns={columns}
        rowKey="id"
        {...table}
        onRowClick={(event) => setOpenId(event.id)}
        emptyTitle="No audit entries match"
        toolbar={
          <FilterBar<AuditLogFilters>
            search={{
              ...search,
              ariaLabel: "Search audit log",
              placeholder: "Search action, target or reason",
            }}
            filters={[
              {
                type: "select",
                key: "actorId",
                label: "Administrator",
                options: actorOptions,
                width: 200,
              },
              { type: "select", key: "module", label: "Module", options: toOptions(MODULE_LABELS) },
              {
                type: "select",
                key: "targetType",
                label: "Target type",
                options: toOptions(TARGET_LABELS),
                width: 200,
              },
              { type: "dateRange", key: "occurred", label: "Date" },
            ]}
            extra={
              <Tooltip title="Requires backend authorization">
                <span>
                  <Button icon={<DownloadOutlined />} disabled>
                    Export
                  </Button>
                </span>
              </Tooltip>
            }
            {...filterBar}
          />
        }
      />
      <AuditEventDrawer id={openId} onClose={() => setOpenId(null)} />
    </>
  );
}

function AuditEventDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const event = useAppSelector((state) => auditLogSelectors.selectById(state, id));
  const items = useMemo(
    () =>
      event
        ? [
            { key: "when", label: "When", value: formatDateTime(event.occurredAt) },
            {
              key: "actor",
              label: "Administrator",
              value: `${event.actorName} (${ROLE_LABELS[event.actorRole]})`,
            },
            { key: "action", label: "Action", value: <Code>{event.action}</Code> },
            {
              key: "target",
              label: "Target",
              value: `${TARGET_LABELS[event.targetType]} ${event.targetId}`,
            },
            { key: "summary", label: "Summary", value: event.summary, wide: true },
            { key: "reason", label: "Reason", value: event.reason ?? "—", wide: true },
          ]
        : [],
    [event],
  );

  return (
    <DetailDrawer
      open={Boolean(id)}
      onClose={onClose}
      title={id ?? ""}
      subtitle="Demo audit entry · read-only"
      status={
        event ? (
          isSessionEvent(event) ? (
            <StatusBadge label="This session" tone="brand" />
          ) : null
        ) : null
      }
      loadStatus={event ? "succeeded" : "failed"}
      error={
        event
          ? null
          : {
              code: "NOT_FOUND",
              message: "This entry is not on the current page. Close and search for it.",
            }
      }
    >
      {event ? <DetailList items={items} /> : null}
    </DetailDrawer>
  );
}
