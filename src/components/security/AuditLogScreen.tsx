"use client";

import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Tooltip, type TableColumnsType } from "antd";
import styled from "styled-components";
import { DataTable } from "@/components/ui/DataTable";
import { DetailDrawer, DetailList, DetailSection } from "@/components/ui/DetailDrawer";
import { Identity } from "@/components/ui/Identity";
import { PageHeader } from "@/components/ui/PageHeader";
import { auditLogSelectors } from "@/features/moduleSelectors";
import { auditLogActions, fetchAuditLog } from "@/features/security/auditLogSlice";
import type { AuditLogEntry } from "@/features/security/securityTypes";
import { formatDateTime } from "@/lib/formatters/date";
import { humanizeCode } from "@/lib/formatters/text";
import { useAdminLabel } from "@/lib/hooks/useAdminLabel";
import { useDirectoryList } from "@/lib/hooks/useDirectoryList";
import { useOpenParam } from "@/lib/hooks/useOpenParam";
import { useAppSelector } from "@/store/hooks";

const Notice = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const Code = styled.code`
  font-family: var(--font-geist-mono), monospace;
  font-size: ${({ theme }) => theme.font.sizeSm};
`;

const Json = styled.pre`
  margin: 0;
  padding: ${({ theme }) => theme.space(3)};
  overflow-x: auto;
  font-family: var(--font-geist-mono), monospace;
  font-size: ${({ theme }) => theme.font.sizeSm};
  background: ${({ theme }) => theme.colors.surfaceMuted};
  border-radius: ${({ theme }) => theme.radii.input};
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space(2)};
  justify-content: flex-end;
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

export function AuditLogScreen() {
  const { table, refetch } = useDirectoryList(auditLogSelectors, fetchAuditLog, auditLogActions);
  const [openId, setOpenId] = useOpenParam();
  const adminLabel = useAdminLabel();

  const columns: TableColumnsType<AuditLogEntry> = [
    {
      key: "createdAt",
      title: "When",
      width: 190,
      render: (_, entry) => formatDateTime(entry.createdAt),
    },
    {
      key: "action",
      title: "Action",
      render: (_, entry) => (
        <Identity>
          <strong>{humanizeCode(entry.action)}</strong>
          <span>
            <Code>{entry.action}</Code>
          </span>
        </Identity>
      ),
    },
    {
      key: "actor",
      title: "Administrator",
      render: (_, entry) => (
        <Identity>
          <strong>{entry.actorName ?? adminLabel(entry.actorId)}</strong>
          <span>{entry.actorEmail ?? ""}</span>
        </Identity>
      ),
    },
    {
      key: "target",
      title: "Target",
      render: (_, entry) => (
        <Identity>
          <strong>
            <Code>{entry.targetId}</Code>
          </strong>
          <span>{entry.targetEmail ?? ""}</span>
        </Identity>
      ),
    },
    { key: "justification", title: "Justification", render: (_, entry) => entry.justification },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Security"
        title="Audit logs"
        subtitle="Privileged actions recorded by the TrenderAlert backend, newest first."
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
      <Notice
        type="info"
        showIcon
        title="Append-only"
        description="Entries cannot be edited or deleted. The backend does not offer filters or a total count yet, so the list is paged in order."
      />
      <DataTable<AuditLogEntry>
        ariaLabel="Audit log"
        columns={columns}
        rowKey="id"
        {...table}
        pagination={{ ...table.pagination, pageSizeOptions: [20, 50] }}
        onRowClick={(entry) => setOpenId(entry.id)}
        emptyTitle="No audit entries yet"
        emptyDescription="Privileged actions appear here once administrators take them."
        toolbar={
          <Toolbar>
            <Tooltip title="Requires backend authorization">
              <span>
                <Button icon={<DownloadOutlined />} disabled>
                  Export
                </Button>
              </span>
            </Tooltip>
          </Toolbar>
        }
      />
      <AuditEntryDrawer id={openId} onClose={() => setOpenId(null)} adminLabel={adminLabel} />
    </>
  );
}

function AuditEntryDrawer({
  id,
  onClose,
  adminLabel,
}: {
  id: string | null;
  onClose: () => void;
  adminLabel: (userId: string | null) => string;
}) {
  const entry = useAppSelector((state) => auditLogSelectors.selectById(state, id));

  return (
    <DetailDrawer
      open={Boolean(id)}
      onClose={onClose}
      title={entry ? humanizeCode(entry.action) : "Audit entry"}
      subtitle="Read-only"
      loadStatus={entry ? "succeeded" : "failed"}
      error={
        entry
          ? null
          : {
              code: "NOT_FOUND",
              message: "This entry is not on the current page. Close and find it in the list.",
            }
      }
    >
      {entry ? (
        <>
          <DetailSection title="Entry">
            <DetailList
              items={[
                { key: "when", label: "When", value: formatDateTime(entry.createdAt) },
                {
                  key: "actor",
                  label: "Administrator",
                  value: entry.actorName
                    ? `${entry.actorName}${entry.actorEmail ? ` (${entry.actorEmail})` : ""}`
                    : adminLabel(entry.actorId),
                },
                ...(entry.targetEmail
                  ? [{ key: "targetEmail", label: "Target account", value: entry.targetEmail }]
                  : []),
                { key: "action", label: "Action", value: <Code>{entry.action}</Code>, wide: true },
                {
                  key: "target",
                  label: "Target",
                  value: <Code>{entry.targetId}</Code>,
                  wide: true,
                },
                {
                  key: "justification",
                  label: "Justification",
                  value: entry.justification,
                  wide: true,
                },
                { key: "id", label: "Entry id", value: entry.id, wide: true },
              ]}
            />
          </DetailSection>
          <DetailSection title="Details">
            {entry.details ? <Json>{JSON.stringify(entry.details, null, 2)}</Json> : <span>—</span>}
          </DetailSection>
        </>
      ) : null}
    </DetailDrawer>
  );
}
