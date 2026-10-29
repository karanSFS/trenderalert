"use client";

import { ReloadOutlined } from "@ant-design/icons";
import { Button, type TableColumnsType } from "antd";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { DataTable } from "@/components/ui/DataTable";
import { EntityLink } from "@/components/ui/EntityLink";
import { FilterBar } from "@/components/ui/FilterBar";
import { Identity } from "@/components/ui/Identity";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions } from "@/components/ui/RowActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { moderationSelectors } from "@/features/moduleSelectors";
import { fetchReports, moderationActions } from "@/features/moderation/moderationSlice";
import {
  isSlaBreached,
  type ModerationFilters,
  type ModerationReport,
} from "@/features/moderation/moderationTypes";
import {
  categoryLabel,
  priorityBadge,
  PRIORITY_OPTIONS,
  REPORT_CATEGORY_LABELS,
  REPORT_STATUS,
} from "@/lib/constants/moderationLabels";
import { toOptions } from "@/lib/constants/statusLabels";
import { formatDateTime, formatFromNow } from "@/lib/formatters/date";
import { shortId } from "@/lib/formatters/text";
import { useDirectoryList } from "@/lib/hooks/useDirectoryList";

const Deadline = styled.span<{ $breached: boolean }>`
  font-weight: ${({ $breached }) => ($breached ? 700 : 400)};
  color: ${({ $breached, theme }) => ($breached ? theme.colors.error : theme.colors.textSecondary)};
`;

export function ReportTarget({ report }: { report: ModerationReport }) {
  if (report.targetTrendId)
    return (
      <Identity>
        <strong>
          <EntityLink kind="trend" id={report.targetTrendId} />
        </strong>
        <span>Trend</span>
      </Identity>
    );
  if (report.targetUserId)
    return (
      <Identity>
        <strong title={report.targetUserId}>
          <EntityLink kind="user" id={report.targetUserId}>
            {shortId(report.targetUserId)}
          </EntityLink>
        </strong>
        <span>Account</span>
      </Identity>
    );
  return <span>Not linked</span>;
}

export function SlaDeadline({ report }: { report: ModerationReport }) {
  const breached = isSlaBreached(report);
  return (
    <Identity>
      <strong>{formatDateTime(report.slaDueAt)}</strong>
      <Deadline $breached={breached}>
        {report.resolvedAt
          ? `Resolved ${formatDateTime(report.resolvedAt)}`
          : breached
            ? `Overdue by ${formatFromNow(report.slaDueAt).replace(" ago", "")}`
            : `Due ${formatFromNow(report.slaDueAt)}`}
      </Deadline>
    </Identity>
  );
}

export function ModerationQueueScreen() {
  const router = useRouter();
  const { table, filterBar, refetch } = useDirectoryList(
    moderationSelectors,
    fetchReports,
    moderationActions,
  );
  const openReport = (report: ModerationReport) => router.push(`/admin/moderation/${report.id}`);

  const columns: TableColumnsType<ModerationReport> = [
    {
      key: "report",
      title: "Report",
      render: (_, report) => (
        <Identity>
          <strong>{categoryLabel(report.category)}</strong>
          <span title={report.id}>{shortId(report.id)}</span>
        </Identity>
      ),
    },
    {
      key: "priority",
      title: "Priority",
      render: (_, report) => <StatusBadge {...priorityBadge(report.priority)} />,
    },
    {
      key: "status",
      title: "Status",
      render: (_, report) => <StatusBadge {...REPORT_STATUS[report.status]} />,
    },
    {
      key: "target",
      title: "Reported item",
      render: (_, report) => <ReportTarget report={report} />,
    },
    { key: "sla", title: "SLA due", render: (_, report) => <SlaDeadline report={report} /> },
    {
      key: "assigned",
      title: "Assigned to",
      render: (_, report) =>
        report.assignedAdminId ? (
          <span title={report.assignedAdminEmail ?? report.assignedAdminId}>
            {report.assignedAdminName ?? shortId(report.assignedAdminId)}
          </span>
        ) : (
          "Unassigned"
        ),
    },
    {
      key: "createdAt",
      title: "Reported",
      render: (_, report) => formatDateTime(report.createdAt),
    },
    {
      key: "actions",
      title: <span className="ta-visually-hidden">Actions</span>,
      width: 56,
      render: (_, report) => (
        <RowActions
          ariaLabel={`Actions for report ${report.id}`}
          items={[{ key: "open", label: "Open report", onSelect: () => openReport(report) }]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Trust & Safety"
        title="Moderation queue"
        subtitle="Live reports from the TrenderAlert backend, in the backend's priority order. Open a report to take action."
        actions={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={table.status === "loading"}
          >
            Refresh
          </Button>
        }
      />
      <DataTable<ModerationReport>
        ariaLabel="Moderation reports"
        columns={columns}
        rowKey="id"
        {...table}
        pagination={{ ...table.pagination, pageSizeOptions: [10, 20, 50] }}
        onRowClick={openReport}
        emptyTitle="No reports match"
        emptyDescription="Try a different status, category or priority."
        toolbar={
          <FilterBar<ModerationFilters>
            filters={[
              { type: "select", key: "status", label: "Status", options: toOptions(REPORT_STATUS) },
              {
                type: "select",
                key: "category",
                label: "Category",
                options: toOptions(REPORT_CATEGORY_LABELS),
              },
              { type: "select", key: "priority", label: "Priority", options: PRIORITY_OPTIONS },
            ]}
            {...filterBar}
          />
        }
      />
    </>
  );
}
