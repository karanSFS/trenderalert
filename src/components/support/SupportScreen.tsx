"use client";

import { LockOutlined, PlusOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Select, type TableColumnsType } from "antd";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Can } from "@/components/auth/Can";
import { ActionButtons } from "@/components/ui/ActionButtons";
import { DataTable } from "@/components/ui/DataTable";
import { DetailDrawer, DetailList, DetailSection } from "@/components/ui/DetailDrawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { EntityLink } from "@/components/ui/EntityLink";
import { FilterBar } from "@/components/ui/FilterBar";
import { FormModal } from "@/components/ui/FormModal";
import { Identity } from "@/components/ui/Identity";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions, type RowActionItem } from "@/components/ui/RowActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Timeline } from "@/components/ui/Timeline";
import { selectCurrentAdmin } from "@/features/auth/authSelectors";
import { supportSelectors } from "@/features/moduleSelectors";
import {
  addSupportNote,
  assignSupportCase,
  escalateSupportCase,
  fetchSupportCase,
  fetchSupportCases,
  setSupportStatus,
  supportActions,
} from "@/features/support/supportSlice";
import type {
  EscalationTeam,
  SupportCase,
  SupportFilters,
  SupportStatus,
} from "@/features/support/supportTypes";
import {
  ESCALATION_LABELS,
  SUPPORT_CATEGORY_LABELS,
  SUPPORT_STATUS,
} from "@/lib/constants/operationalLabels";
import { PRIORITY, toOptions } from "@/lib/constants/statusLabels";
import { formatDateTime } from "@/lib/formatters/date";
import { useDemoAction } from "@/lib/hooks/useDemoAction";
import { useDirectoryList } from "@/lib/hooks/useDirectoryList";
import { useLookup } from "@/lib/hooks/useLookup";
import { supportService } from "@/services";
import { useOpenParam } from "@/lib/hooks/useOpenParam";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

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

const Masked = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-geist-mono), monospace;
`;

const PrivacyNote = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const loadAgents = () => supportService.listAgents();

type Modal = { kind: "assign" | "escalate" | "note"; item: SupportCase } | null;

const STATUS_ACTIONS: {
  status: Exclude<SupportStatus, "escalated">;
  label: string;
  allowed: (item: SupportCase) => string | null;
}[] = [
  {
    status: "pending_member",
    label: "Wait on member",
    allowed: (item) =>
      item.status === "resolved"
        ? "Reopen the case first."
        : item.status === "pending_member"
          ? "Already waiting on the member."
          : null,
  },
  {
    status: "resolved",
    label: "Resolve",
    allowed: (item) =>
      item.status === "resolved"
        ? "Already resolved."
        : item.assignedAgentId
          ? null
          : "Assign the case before resolving it.",
  },
  {
    status: "open",
    label: "Reopen",
    allowed: (item) => (item.status === "open" ? "The case is already open." : null),
  },
];

export function SupportScreen() {
  const dispatch = useAppDispatch();
  const admin = useAppSelector(selectCurrentAdmin);
  const { table, search, filterBar, refetch } = useDirectoryList(
    supportSelectors,
    fetchSupportCases,
    supportActions,
  );
  const [openId, setOpenId] = useOpenParam();
  const [modal, setModal] = useState<Modal>(null);
  const { run, runWithToast } = useDemoAction();
  const agents = useLookup("support.agents", loadAgents) ?? [];
  const agentOptions = [
    { value: "unassigned", label: "Unassigned" },
    ...agents.map((agent) => ({ value: agent.id, label: agent.name })),
  ];

  const after = () => {
    refetch();
    if (openId) dispatch(fetchSupportCase(openId));
  };

  /** Dialogs use `run` so failures stay in the dialog; direct menu actions show a toast. */
  const assign = (item: SupportCase, agentId: string | null, fromDialog: boolean) => {
    const agent = agentId
      ? (agents.find((candidate) => candidate.id === agentId) ??
        (admin && admin.id === agentId ? { id: admin.id, name: admin.displayName } : null))
      : null;
    return (fromDialog ? run : runWithToast)(
      dispatch(assignSupportCase({ id: item.id, agent })).unwrap(),
      {
        success: agent ? `${item.id}: assigned to ${agent.name}` : `${item.id}: unassigned`,
        audit: (updated) => ({
          action: "support.assign",
          targetType: "supportCase",
          targetId: updated.id,
          summary: agent
            ? `Assigned support case ${updated.id} to ${agent.name}`
            : `Unassigned support case ${updated.id}`,
        }),
        after,
      },
    );
  };

  const setStatus = (item: SupportCase, status: Exclude<SupportStatus, "escalated">) =>
    runWithToast(dispatch(setSupportStatus({ id: item.id, status })).unwrap(), {
      success: `${item.id}: ${SUPPORT_STATUS[status].label.toLowerCase()}`,
      audit: (updated) => ({
        action: `support.status_${status}`,
        targetType: "supportCase",
        targetId: updated.id,
        summary: `Set support case ${updated.id} to ${SUPPORT_STATUS[status].label.toLowerCase()}`,
      }),
      after,
    });

  const actionItems = (item: SupportCase): RowActionItem[] => [
    {
      key: "assignMe",
      label: "Assign to me",
      permission: "support:manage",
      disabled: item.status === "resolved" || item.assignedAgentId === admin?.id,
      disabledReason:
        item.status === "resolved" ? "Reopen the case first." : "Already assigned to you.",
      onSelect: () => {
        if (admin) void assign(item, admin.id, false);
      },
    },
    {
      key: "assign",
      label: "Reassign…",
      permission: "support:manage",
      disabled: item.status === "resolved",
      disabledReason: "Reopen the case first.",
      onSelect: () => setModal({ kind: "assign", item }),
    },
    ...STATUS_ACTIONS.map(({ status, label, allowed }) => {
      const blocked = allowed(item);
      return {
        key: status,
        label,
        permission: "support:manage" as const,
        disabled: blocked !== null,
        disabledReason: blocked ?? undefined,
        onSelect: () => setStatus(item, status),
      };
    }),
    {
      key: "escalate",
      label: "Escalate…",
      permission: "support:manage",
      danger: true,
      disabled: item.status === "resolved",
      disabledReason: "Resolved cases cannot be escalated.",
      onSelect: () => setModal({ kind: "escalate", item }),
    },
  ];

  const columns: TableColumnsType<SupportCase> = [
    {
      key: "subject",
      title: "Case",
      render: (_, item) => (
        <Identity>
          <strong>{item.subject}</strong>
          <span>
            {item.id} · {SUPPORT_CATEGORY_LABELS[item.category]}
          </span>
        </Identity>
      ),
    },
    {
      key: "member",
      title: "Member",
      render: (_, item) => (
        <Identity>
          <strong>
            <EntityLink kind="user" id={item.userId}>
              @{item.username}
            </EntityLink>
          </strong>
          <span>{item.maskedContact}</span>
        </Identity>
      ),
    },
    {
      key: "priority",
      title: "Priority",
      sorter: true,
      render: (_, item) => <StatusBadge {...PRIORITY[item.priority]} />,
    },
    {
      key: "status",
      title: "Status",
      render: (_, item) => <StatusBadge {...SUPPORT_STATUS[item.status]} />,
    },
    {
      key: "assignee",
      title: "Assignee",
      render: (_, item) => item.assignedAgentName ?? "Unassigned",
    },
    {
      key: "createdAt",
      title: "Opened",
      sorter: true,
      render: (_, item) => formatDateTime(item.createdAt),
    },
    {
      key: "actions",
      title: <span className="ta-visually-hidden">Actions</span>,
      width: 56,
      render: (_, item) => (
        <RowActions
          ariaLabel={`Actions for ${item.id}`}
          items={[
            { key: "view", label: "View case", onSelect: () => setOpenId(item.id) },
            ...actionItems(item),
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Member support"
        title="Support cases"
        subtitle="Requests from the in-app help form. Members and cases are fictional."
      />
      <PrivacyNote
        type="info"
        showIcon
        icon={<LockOutlined />}
        title="Personal data is masked"
        description="Support sees masked contact details only. Passwords, payment details and precise locations are never shown here."
      />
      <DataTable<SupportCase>
        ariaLabel="Support cases"
        columns={columns}
        rowKey="id"
        {...table}
        onRowClick={(item) => setOpenId(item.id)}
        emptyTitle="No support cases match"
        toolbar={
          <FilterBar<SupportFilters>
            search={{
              ...search,
              ariaLabel: "Search support cases",
              placeholder: "Search subject, id or member",
            }}
            filters={[
              {
                type: "select",
                key: "status",
                label: "Status",
                options: toOptions(SUPPORT_STATUS),
              },
              {
                type: "select",
                key: "category",
                label: "Category",
                options: toOptions(SUPPORT_CATEGORY_LABELS),
              },
              { type: "select", key: "priority", label: "Priority", options: toOptions(PRIORITY) },
              { type: "select", key: "assignee", label: "Assignee", options: agentOptions },
            ]}
            {...filterBar}
          />
        }
      />
      <SupportDrawer
        id={openId}
        onClose={() => setOpenId(null)}
        actionItems={actionItems}
        onAddNote={(item) => setModal({ kind: "note", item })}
      />

      <FormModal<{ agentId: string }>
        open={modal?.kind === "assign"}
        title={modal ? `Reassign ${modal.item.id}` : "Reassign"}
        submitLabel="Save assignment"
        initialValues={{ agentId: modal?.item.assignedAgentId ?? "unassigned" }}
        onClose={() => setModal(null)}
        onSubmit={async ({ agentId }) => {
          if (modal) await assign(modal.item, agentId === "unassigned" ? null : agentId, true);
        }}
      >
        <Form.Item name="agentId" label="Assignee" rules={[{ required: true }]}>
          <Select options={agentOptions} />
        </Form.Item>
      </FormModal>

      <FormModal<{ team: EscalationTeam; reason: string }>
        open={modal?.kind === "escalate"}
        title={modal ? `Escalate ${modal.item.id}` : "Escalate"}
        description="The receiving team is notified and the case status becomes Escalated."
        submitLabel="Escalate"
        onClose={() => setModal(null)}
        onSubmit={async ({ team, reason }) => {
          if (!modal) return;
          await run(dispatch(escalateSupportCase({ id: modal.item.id, team, reason })).unwrap(), {
            success: `${modal.item.id}: escalated to ${ESCALATION_LABELS[team]}`,
            audit: (updated) => ({
              action: "support.escalate",
              targetType: "supportCase",
              targetId: updated.id,
              summary: `Escalated support case ${updated.id} to ${ESCALATION_LABELS[team]}`,
              reason,
            }),
            after,
          });
        }}
      >
        <Form.Item name="team" label="Team" rules={[{ required: true, message: "Choose a team." }]}>
          <Select options={toOptions(ESCALATION_LABELS)} placeholder="Choose a team" />
        </Form.Item>
        <Form.Item
          name="reason"
          label="Reason"
          rules={[
            { required: true, whitespace: true, min: 10, message: "Enter at least 10 characters." },
          ]}
        >
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 6 }} maxLength={500} showCount />
        </Form.Item>
      </FormModal>

      <FormModal<{ text: string }>
        open={modal?.kind === "note"}
        title={modal ? `Add note to ${modal.item.id}` : "Add note"}
        description="Internal note. Do not include passwords, payment details or unnecessary personal data."
        submitLabel="Add note"
        onClose={() => setModal(null)}
        onSubmit={async ({ text }) => {
          if (!modal) return;
          await run(dispatch(addSupportNote({ id: modal.item.id, text })).unwrap(), {
            success: "Note added",
            audit: (updated) => ({
              action: "support.note",
              targetType: "supportCase",
              targetId: updated.id,
              summary: `Added an internal note to ${updated.id}`,
            }),
            after,
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
    </>
  );
}

function SupportDrawer({
  id,
  onClose,
  actionItems,
  onAddNote,
}: {
  id: string | null;
  onClose: () => void;
  actionItems: (item: SupportCase) => RowActionItem[];
  onAddNote: (item: SupportCase) => void;
}) {
  const dispatch = useAppDispatch();
  const item = useAppSelector((state) => supportSelectors.selectById(state, id));
  const detail = useAppSelector(supportSelectors.selectDetail);

  useEffect(() => {
    if (id) dispatch(fetchSupportCase(id));
  }, [dispatch, id]);

  return (
    <DetailDrawer
      open={Boolean(id)}
      onClose={onClose}
      width={620}
      title={id ?? ""}
      subtitle={item ? `${item.subject} · Demo record` : undefined}
      status={item ? <StatusBadge {...SUPPORT_STATUS[item.status]} /> : null}
      loadStatus={item ? "succeeded" : detail.id === id ? detail.status : "loading"}
      error={detail.error}
      onRetry={() => id && dispatch(fetchSupportCase(id))}
      actions={item ? <ActionButtons items={actionItems(item)} /> : null}
    >
      {item ? (
        <>
          <DetailSection title="Case">
            <DetailList
              items={[
                { key: "summary", label: "Summary", value: item.summary, wide: true },
                {
                  key: "category",
                  label: "Category",
                  value: SUPPORT_CATEGORY_LABELS[item.category],
                },
                {
                  key: "priority",
                  label: "Priority",
                  value: <StatusBadge {...PRIORITY[item.priority]} />,
                },
                {
                  key: "assignee",
                  label: "Assignee",
                  value: item.assignedAgentName ?? "Unassigned",
                },
                {
                  key: "escalated",
                  label: "Escalated to",
                  value: item.escalatedTo ? ESCALATION_LABELS[item.escalatedTo] : "—",
                },
                { key: "opened", label: "Opened", value: formatDateTime(item.createdAt) },
                { key: "updated", label: "Last updated", value: formatDateTime(item.updatedAt) },
              ]}
            />
          </DetailSection>
          <DetailSection title="Member">
            <DetailList
              items={[
                {
                  key: "member",
                  label: "Account",
                  value: (
                    <EntityLink kind="user" id={item.userId}>
                      @{item.username}
                    </EntityLink>
                  ),
                },
                {
                  key: "contact",
                  label: "Contact (masked)",
                  value: (
                    <Masked>
                      <LockOutlined aria-hidden="true" />
                      {item.maskedContact}
                    </Masked>
                  ),
                },
              ]}
            />
          </DetailSection>
          <DetailSection
            title="Internal notes"
            extra={
              <Can permission="support:manage">
                <Button size="small" icon={<PlusOutlined />} onClick={() => onAddNote(item)}>
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
          </DetailSection>
          <DetailSection title="History">
            <Timeline entries={item.history} />
          </DetailSection>
        </>
      ) : null}
    </DetailDrawer>
  );
}
