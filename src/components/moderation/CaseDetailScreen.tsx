"use client";

import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Tooltip } from "antd";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Can } from "@/components/auth/Can";
import { DetailList } from "@/components/ui/DetailDrawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { EntityLink } from "@/components/ui/EntityLink";
import { FormModal } from "@/components/ui/FormModal";
import { PageHeader } from "@/components/ui/PageHeader";
import { RecordState } from "@/components/ui/RecordState";
import { DetailColumn, DetailGrid, SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Timeline } from "@/components/ui/Timeline";
import { useConfirm } from "@/components/ui/useConfirm";
import { moderationSelectors } from "@/features/moduleSelectors";
import { addCaseNote, fetchCase, fetchCaseContext } from "@/features/moderation/moderationSlice";
import type { ModerationActionType } from "@/features/moderation/moderationTypes";
import {
  CASE_STATUS,
  CONTENT_STATUS,
  CONTENT_TYPE_LABELS,
  MODERATION_ACTION_LABELS,
  PRIORITY,
  TARGET_TYPE_LABELS,
  USER_STATUS,
} from "@/lib/constants/statusLabels";
import { formatDateTime } from "@/lib/formatters/date";
import { useDemoAction } from "@/lib/hooks/useDemoAction";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { caseActionBlock, isCaseOpen, useCaseActions } from "./useCaseActions";

const DECISIONS: ModerationActionType[] = [
  "dismiss",
  "warn",
  "remove_content",
  "limit_content",
  "restrict_account",
  "suspend_account",
  "escalate",
];

const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
`;

const DecisionBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space(2)};
`;

const Notes = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li + li {
    margin-top: ${({ theme }) => theme.space(3)};
    padding-top: ${({ theme }) => theme.space(3)};
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }

  p {
    margin: 0;
  }

  small {
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

const PriorList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    justify-content: space-between;
    gap: ${({ theme }) => theme.space(2)};
    padding: ${({ theme }) => theme.space(2)} 0;
  }

  small {
    display: block;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const DecisionWrap = styled.div`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const OutcomeAlert = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

export function CaseDetailScreen({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const item = useAppSelector((state) => moderationSelectors.selectById(state, id));
  const detail = useAppSelector(moderationSelectors.selectDetail);
  const context = useAppSelector(moderationSelectors.selectContext);
  const [noteOpen, setNoteOpen] = useState(false);
  const { confirm, dialog } = useConfirm();
  const { run } = useDemoAction();

  const load = useCallback(() => {
    dispatch(fetchCase(id));
    dispatch(fetchCaseContext(id));
  }, [dispatch, id]);

  useEffect(() => {
    load();
  }, [load]);

  const { openAction, assignToMe, unassign, currentAdminId } = useCaseActions(confirm, load);
  const related = context.id === id ? context.data : null;

  if (!item || (detail.id === id && detail.status === "failed")) {
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

  const open = isCaseOpen(item);

  return (
    <>
      <PageHeader
        eyebrow="Demo record"
        title={`${item.id} · ${item.category}`}
        subtitle={`${item.reportedItemLabel} · Reported ${formatDateTime(item.submittedAt)} by ${item.reporterCount} member${item.reporterCount === 1 ? "" : "s"}`}
        actions={
          <HeaderActions>
            <StatusBadge {...PRIORITY[item.priority]} />
            <StatusBadge {...CASE_STATUS[item.status]} />
            <Can permission="moderation:act">
              {item.assignedReviewerId === currentAdminId ? (
                <Button disabled={!open} onClick={() => unassign(item)}>
                  Unassign me
                </Button>
              ) : (
                <Button disabled={!open} onClick={() => assignToMe(item)}>
                  Assign to me
                </Button>
              )}
            </Can>
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/admin/moderation")}>
              Queue
            </Button>
          </HeaderActions>
        }
      />

      {item.outcome ? (
        <OutcomeAlert
          type={item.outcome.action === "dismiss" ? "info" : "success"}
          showIcon
          title={`${MODERATION_ACTION_LABELS[item.outcome.action]} by ${item.outcome.by} on ${formatDateTime(item.outcome.at)}`}
          description={item.outcome.reason}
        />
      ) : null}

      <Can permission="moderation:act">
        <DecisionWrap>
          <SectionCard title="Decision">
            <DecisionBar>
              {DECISIONS.map((action) => {
                const blocked = caseActionBlock(item, action);
                return (
                  <Tooltip key={action} title={blocked ?? undefined}>
                    <Button
                      danger={!["dismiss", "escalate"].includes(action)}
                      type={
                        action === "dismiss"
                          ? "default"
                          : action === "escalate"
                            ? "dashed"
                            : "default"
                      }
                      disabled={blocked !== null}
                      onClick={() => openAction(item, action)}
                    >
                      {MODERATION_ACTION_LABELS[action]}
                    </Button>
                  </Tooltip>
                );
              })}
            </DecisionBar>
          </SectionCard>
        </DecisionWrap>
      </Can>

      <DetailGrid>
        <DetailColumn>
          <SectionCard title="Report">
            <DetailList
              items={[
                { key: "details", label: "Reporter details", value: item.details, wide: true },
                {
                  key: "target",
                  label: "Reported item type",
                  value: TARGET_TYPE_LABELS[item.targetType],
                },
                {
                  key: "reviewer",
                  label: "Assigned reviewer",
                  value: item.assignedReviewerName ?? "Unassigned",
                },
              ]}
            />
          </SectionCard>
          <SectionCard title="Related content">
            {related?.content ? (
              <DetailList
                items={[
                  {
                    key: "id",
                    label: CONTENT_TYPE_LABELS[related.content.type],
                    value: <EntityLink kind="content" id={related.content.id} />,
                  },
                  {
                    key: "status",
                    label: "Moderation status",
                    value: <StatusBadge {...CONTENT_STATUS[related.content.moderationStatus]} />,
                  },
                  { key: "caption", label: "Caption", value: related.content.caption, wide: true },
                ]}
              />
            ) : (
              <EmptyState
                compact
                title={related ? "No Trend or post attached" : "Loading…"}
                description={
                  related
                    ? `This report concerns a ${TARGET_TYPE_LABELS[item.targetType].toLowerCase()}.`
                    : undefined
                }
              />
            )}
          </SectionCard>
          <SectionCard title="Account">
            {related ? (
              <DetailList
                items={[
                  {
                    key: "user",
                    label: "Member",
                    value: (
                      <EntityLink kind="user" id={related.account.id}>
                        @{related.account.username}
                      </EntityLink>
                    ),
                  },
                  {
                    key: "status",
                    label: "Status",
                    value: <StatusBadge {...USER_STATUS[related.account.status]} />,
                  },
                  { key: "strikes", label: "Strikes", value: related.account.strikes },
                  {
                    key: "reports",
                    label: "Reports received",
                    value: related.account.reportsReceived,
                  },
                ]}
              />
            ) : (
              <EmptyState compact title="Loading…" />
            )}
          </SectionCard>
          <SectionCard title="Prior cases for this account">
            {related && related.priorCases.length > 0 ? (
              <PriorList>
                {related.priorCases.slice(0, 6).map((prior) => (
                  <li key={prior.id}>
                    <div>
                      <EntityLink kind="case" id={prior.id} />
                      <small>{prior.category}</small>
                    </div>
                    <StatusBadge {...CASE_STATUS[prior.status]} />
                  </li>
                ))}
              </PriorList>
            ) : (
              <EmptyState compact title={related ? "No prior cases" : "Loading…"} />
            )}
          </SectionCard>
        </DetailColumn>
        <DetailColumn>
          <SectionCard
            title="Reviewer notes"
            extra={
              <Can permission="moderation:act">
                <Button size="small" icon={<PlusOutlined />} onClick={() => setNoteOpen(true)}>
                  Add note
                </Button>
              </Can>
            }
          >
            {item.notes.length > 0 ? (
              <Notes>
                {[...item.notes].reverse().map((note) => (
                  <li key={note.id}>
                    <p>{note.text}</p>
                    <small>
                      {note.author} · {formatDateTime(note.at)}
                    </small>
                  </li>
                ))}
              </Notes>
            ) : (
              <EmptyState
                compact
                title="No notes yet"
                description="Notes are internal and never shown to members."
              />
            )}
          </SectionCard>
          <SectionCard title="Case history">
            <Timeline entries={item.history} />
          </SectionCard>
        </DetailColumn>
      </DetailGrid>

      <FormModal<{ text: string }>
        open={noteOpen}
        title={`Add note to ${item.id}`}
        description="Internal note for reviewers. Do not include passwords, payment details or unnecessary personal data."
        submitLabel="Add note"
        onClose={() => setNoteOpen(false)}
        onSubmit={async ({ text }) => {
          await run(dispatch(addCaseNote({ id: item.id, text })).unwrap(), {
            success: "Note added",
            audit: (updated) => ({
              action: "moderation.note",
              targetType: "moderationCase",
              targetId: updated.id,
              summary: `Added a reviewer note to ${updated.id}`,
            }),
          });
        }}
      >
        <Form.Item
          name="text"
          label="Note"
          rules={[{ required: true, whitespace: true, min: 3, max: 1000 }]}
        >
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} maxLength={1000} showCount />
        </Form.Item>
      </FormModal>
      {dialog}
    </>
  );
}
