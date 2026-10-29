"use client";

import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input } from "antd";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { ActionButtons } from "@/components/ui/ActionButtons";
import { DetailList } from "@/components/ui/DetailDrawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { EntityLink } from "@/components/ui/EntityLink";
import { FormModal } from "@/components/ui/FormModal";
import { PageHeader } from "@/components/ui/PageHeader";
import { RecordState } from "@/components/ui/RecordState";
import { DetailColumn, DetailGrid, SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { selectCurrentAdmin } from "@/features/auth/authSelectors";
import { usePermission } from "@/features/auth/usePermission";
import { moderationSelectors } from "@/features/moduleSelectors";
import { addReportNote, assignReport, fetchReport } from "@/features/moderation/moderationSlice";
import {
  isReportOpen,
  isSlaBreached,
  type ModerationAction,
} from "@/features/moderation/moderationTypes";
import {
  categoryLabel,
  MODERATION_ACTION_ORDER,
  MODERATION_ACTIONS,
  moderationActionBlock,
  priorityBadge,
  REPORT_STATUS,
} from "@/lib/constants/moderationLabels";
import { formatDateTime } from "@/lib/formatters/date";
import { useApiAction } from "@/lib/hooks/useApiAction";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ModerationActionModal } from "./ModerationActionModal";
import { ReportTarget, SlaDeadline } from "./ModerationQueueScreen";

const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
`;

const Stack = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space(4)};
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const Notes = styled.p`
  margin: 0;
  white-space: pre-wrap;
`;

export function ReportDetailScreen({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const report = useAppSelector((state) => moderationSelectors.selectById(state, id));
  const detail = useAppSelector(moderationSelectors.selectDetail);
  const canAct = usePermission("moderation:act");
  const me = useAppSelector(selectCurrentAdmin);
  const [action, setAction] = useState<ModerationAction | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const { run, runWithToast } = useApiAction();

  const load = useCallback(() => {
    dispatch(fetchReport(id));
  }, [dispatch, id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!report || (detail.id === id && detail.status === "failed")) {
    return (
      <RecordState
        status={detail.id === id ? detail.status : "loading"}
        error={detail.error}
        onRetry={load}
        backHref="/admin/moderation"
        backLabel="Back to the queue"
      />
    );
  }

  const open = isReportOpen(report);
  const assignedToMe = Boolean(me && report.assignedAdminId === me.id);
  const assign = (adminUserId: string | null) =>
    runWithToast(dispatch(assignReport({ id: report.id, adminUserId })).unwrap(), {
      success: adminUserId ? "Report assigned to you" : "Report unassigned",
      after: load,
    });

  return (
    <>
      <PageHeader
        eyebrow="Moderation report"
        title={`${categoryLabel(report.category)} report`}
        subtitle={`Report ${report.id} · Reported ${formatDateTime(report.createdAt)}`}
        actions={
          <HeaderActions>
            <StatusBadge {...priorityBadge(report.priority)} />
            <StatusBadge {...REPORT_STATUS[report.status]} />
            {canAct && open && me ? (
              assignedToMe ? (
                <Button onClick={() => assign(null)}>Unassign me</Button>
              ) : (
                <Button onClick={() => assign(me.id)}>Assign to me</Button>
              )
            ) : null}
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/admin/moderation")}>
              Queue
            </Button>
          </HeaderActions>
        }
      />

      <Stack>
        {isSlaBreached(report) ? (
          <Alert
            type="error"
            showIcon
            title="SLA deadline passed"
            description={`This report was due by ${formatDateTime(report.slaDueAt)}.`}
          />
        ) : null}
        {!open ? (
          <Alert
            type="info"
            showIcon
            title={`${REPORT_STATUS[report.status].label}${report.resolvedAt ? ` on ${formatDateTime(report.resolvedAt)}` : ""}`}
            description="Resolved reports are read-only. Members can challenge enforcement through an appeal."
          />
        ) : null}
        {canAct && open ? (
          <SectionCard title="Take action">
            <ActionButtons
              size="middle"
              items={MODERATION_ACTION_ORDER.map((key) => {
                const blocked = moderationActionBlock(report, key);
                return {
                  key,
                  label: MODERATION_ACTIONS[key].label,
                  danger: MODERATION_ACTIONS[key].danger,
                  permission: "moderation:act",
                  disabled: blocked !== null,
                  disabledReason: blocked ?? undefined,
                  onSelect: () => setAction(key),
                };
              })}
            />
          </SectionCard>
        ) : null}
      </Stack>

      <DetailGrid>
        <DetailColumn>
          <SectionCard title="Report">
            <DetailList
              items={[
                { key: "category", label: "Category", value: categoryLabel(report.category) },
                {
                  key: "priority",
                  label: "Priority",
                  value: <StatusBadge {...priorityBadge(report.priority)} />,
                },
                {
                  key: "status",
                  label: "Status",
                  value: <StatusBadge {...REPORT_STATUS[report.status]} />,
                },
                { key: "sla", label: "SLA due", value: <SlaDeadline report={report} /> },
                { key: "created", label: "Reported", value: formatDateTime(report.createdAt) },
                {
                  key: "assigned",
                  label: "Assigned to",
                  value: report.assignedAdminId
                    ? `${report.assignedAdminName ?? report.assignedAdminId}${report.assignedAdminEmail ? ` (${report.assignedAdminEmail})` : ""}`
                    : "Unassigned",
                  wide: true,
                },
                { key: "id", label: "Report id", value: report.id, wide: true },
              ]}
            />
          </SectionCard>
          <SectionCard title="Reported item">
            {report.targetTrendId || report.targetUserId ? (
              <DetailList
                items={[
                  ...(report.targetTrendId
                    ? [
                        {
                          key: "trend",
                          label: "Trend",
                          value: <ReportTarget report={{ ...report, targetUserId: null }} />,
                        },
                      ]
                    : []),
                  ...(report.targetUserId
                    ? [
                        {
                          key: "user",
                          label: "Reported account",
                          value: <EntityLink kind="user" id={report.targetUserId} />,
                          wide: true,
                        },
                      ]
                    : []),
                ]}
              />
            ) : (
              <EmptyState
                compact
                title="No item linked"
                description="The backend did not link this report to a Trend or account, so only Dismiss is available."
              />
            )}
          </SectionCard>
        </DetailColumn>
        <DetailColumn>
          <SectionCard
            title="Moderator notes"
            extra={
              canAct ? (
                <Button size="small" icon={<PlusOutlined />} onClick={() => setNoteOpen(true)}>
                  Add note
                </Button>
              ) : null
            }
          >
            {report.moderatorNotes ? (
              <Notes>{report.moderatorNotes}</Notes>
            ) : (
              <EmptyState
                compact
                title="No notes yet"
                description="Internal notes are never shown to members."
              />
            )}
          </SectionCard>
        </DetailColumn>
      </DetailGrid>

      <FormModal<{ notes: string }>
        open={noteOpen}
        title="Add an internal note"
        description="Notes are appended to the report and are never shown to members. Do not include passwords or payment details."
        submitLabel="Add note"
        onClose={() => setNoteOpen(false)}
        onSubmit={async ({ notes }) => {
          await run(dispatch(addReportNote({ id: report.id, notes: notes.trim() })).unwrap(), {
            success: "Note added",
            after: load,
          });
        }}
      >
        <Form.Item
          name="notes"
          label="Note"
          rules={[
            {
              required: true,
              whitespace: true,
              min: 3,
              message: "Write a note of at least 3 characters.",
            },
          ]}
        >
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} maxLength={1000} showCount />
        </Form.Item>
      </FormModal>

      <ModerationActionModal
        report={report}
        action={action}
        onClose={() => setAction(null)}
        onDone={load}
      />
    </>
  );
}
