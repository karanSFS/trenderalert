"use client";

import { CheckOutlined, RollbackOutlined } from "@ant-design/icons";
import { Button, Tooltip, type TableColumnsType } from "antd";
import { useEffect } from "react";
import styled from "styled-components";
import { Can } from "@/components/auth/Can";
import { DataTable } from "@/components/ui/DataTable";
import { DetailDrawer, DetailList, DetailSection } from "@/components/ui/DetailDrawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { EntityLink } from "@/components/ui/EntityLink";
import { FilterBar } from "@/components/ui/FilterBar";
import { Identity } from "@/components/ui/Identity";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions } from "@/components/ui/RowActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Timeline } from "@/components/ui/Timeline";
import { useConfirm, type ConfirmSpec } from "@/components/ui/useConfirm";
import {
  appealsActions,
  decideAppeal,
  fetchAppeal,
  fetchAppealCase,
  fetchAppeals,
} from "@/features/appeals/appealsSlice";
import type { Appeal, AppealFilters } from "@/features/appeals/appealsTypes";
import { appealsSelectors } from "@/features/moduleSelectors";
import {
  APPEAL_STATUS,
  CASE_STATUS,
  MODERATION_ACTION_LABELS,
  toOptions,
} from "@/lib/constants/statusLabels";
import { formatDate, formatDateTime } from "@/lib/formatters/date";
import { useDemoAction } from "@/lib/hooks/useDemoAction";
import { useDirectoryList } from "@/lib/hooks/useDirectoryList";
import { useOpenParam } from "@/lib/hooks/useOpenParam";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const Evidence = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li + li {
    margin-top: ${({ theme }) => theme.space(3)};
  }

  strong {
    display: block;
  }

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const DrawerActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space(2)};
`;

const ACTION_OPTIONS = (
  ["warn", "remove_content", "limit_content", "restrict_account", "suspend_account"] as const
).map((action) => ({ value: action, label: MODERATION_ACTION_LABELS[action] }));

const isDecided = (appeal: Appeal) => appeal.status === "upheld" || appeal.status === "reversed";

function useAppealDecision(confirm: (spec: ConfirmSpec) => void, after: () => void) {
  const dispatch = useAppDispatch();
  const { run } = useDemoAction();
  return (appeal: Appeal, outcome: "upheld" | "reversed") =>
    confirm({
      title:
        outcome === "upheld"
          ? `Uphold the decision on ${appeal.caseId}`
          : `Reverse the decision on ${appeal.caseId}`,
      description: `Appeal ${appeal.id} by @${appeal.username} against "${MODERATION_ACTION_LABELS[appeal.originalDecision.action]}".`,
      consequences:
        outcome === "upheld"
          ? [
              "The original enforcement stays in place.",
              "The member is told the outcome and the reason.",
            ]
          : [
              "Undoes the original enforcement (restores content or account access) and removes the strike.",
              "The member is told the outcome and the reason.",
            ],
      confirmLabel: outcome === "upheld" ? "Uphold decision" : "Reverse decision",
      danger: false,
      requireReason: { label: "Decision reason (shared with the member)" },
      onConfirm: (reason) =>
        run(dispatch(decideAppeal({ id: appeal.id, outcome, reason: reason ?? "" })).unwrap(), {
          success: `${appeal.id} ${outcome}`,
          audit: (updated) => ({
            action: `appeal.${outcome === "upheld" ? "uphold" : "reverse"}`,
            targetType: "appeal",
            targetId: updated.id,
            summary: `${outcome === "upheld" ? "Upheld" : "Reversed"} decision on ${updated.caseId} (appeal ${updated.id})`,
            reason,
          }),
          after,
        }),
    });
}

export function AppealsScreen() {
  const dispatch = useAppDispatch();
  const { table, search, filterBar, refetch } = useDirectoryList(
    appealsSelectors,
    fetchAppeals,
    appealsActions,
  );
  const [openId, setOpenId] = useOpenParam();
  const { confirm, dialog } = useConfirm();
  const decide = useAppealDecision(confirm, () => {
    refetch();
    if (openId) dispatch(fetchAppeal(openId));
  });

  const columns: TableColumnsType<Appeal> = [
    {
      key: "id",
      title: "Appeal",
      render: (_, appeal) => (
        <Identity>
          <strong>{appeal.id}</strong>
          <span>@{appeal.username}</span>
        </Identity>
      ),
    },
    {
      key: "original",
      title: "Original decision",
      render: (_, appeal) => (
        <Identity>
          <strong>{MODERATION_ACTION_LABELS[appeal.originalDecision.action]}</strong>
          <span>
            <EntityLink kind="case" id={appeal.caseId} />
          </span>
        </Identity>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_, appeal) => <StatusBadge {...APPEAL_STATUS[appeal.status]} />,
    },
    {
      key: "reviewer",
      title: "Reviewer",
      render: (_, appeal) => appeal.assignedReviewerName ?? "Unassigned",
    },
    {
      key: "submittedAt",
      title: "Submitted",
      sorter: true,
      render: (_, appeal) => formatDate(appeal.submittedAt),
    },
    {
      key: "actions",
      title: <span className="ta-visually-hidden">Actions</span>,
      width: 56,
      render: (_, appeal) => (
        <RowActions
          ariaLabel={`Actions for ${appeal.id}`}
          items={[
            { key: "view", label: "Review appeal", onSelect: () => setOpenId(appeal.id) },
            {
              key: "uphold",
              label: "Uphold decision",
              icon: <CheckOutlined />,
              permission: "appeals:decide",
              disabled: isDecided(appeal),
              disabledReason: "Already decided.",
              onSelect: () => decide(appeal, "upheld"),
            },
            {
              key: "reverse",
              label: "Reverse decision",
              icon: <RollbackOutlined />,
              permission: "appeals:decide",
              disabled: isDecided(appeal),
              disabledReason: "Already decided.",
              onSelect: () => decide(appeal, "reversed"),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Trust & Safety"
        title="Appeals"
        subtitle="Members can appeal enforcement decisions. Review the original decision and evidence, then uphold or reverse it."
      />
      <DataTable<Appeal>
        ariaLabel="Appeals"
        columns={columns}
        rowKey="id"
        {...table}
        onRowClick={(appeal) => setOpenId(appeal.id)}
        emptyTitle="No appeals match"
        toolbar={
          <FilterBar<AppealFilters>
            search={{
              ...search,
              ariaLabel: "Search appeals",
              placeholder: "Search appeal, case or member",
            }}
            filters={[
              { type: "select", key: "status", label: "Status", options: toOptions(APPEAL_STATUS) },
              {
                type: "select",
                key: "action",
                label: "Original decision",
                width: 220,
                options: ACTION_OPTIONS,
              },
            ]}
            {...filterBar}
          />
        }
      />
      <AppealDrawer id={openId} onClose={() => setOpenId(null)} decide={decide} />
      {dialog}
    </>
  );
}

function AppealDrawer({
  id,
  onClose,
  decide,
}: {
  id: string | null;
  onClose: () => void;
  decide: (appeal: Appeal, outcome: "upheld" | "reversed") => void;
}) {
  const dispatch = useAppDispatch();
  const appeal = useAppSelector((state) => appealsSelectors.selectById(state, id));
  const detail = useAppSelector(appealsSelectors.selectDetail);
  const context = useAppSelector(appealsSelectors.selectContext);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchAppeal(id));
    dispatch(fetchAppealCase(id));
  }, [dispatch, id]);

  const original = context.id === id ? context.data : null;
  const decided = appeal ? isDecided(appeal) : true;

  return (
    <DetailDrawer
      open={Boolean(id)}
      onClose={onClose}
      width={600}
      title={id ?? ""}
      subtitle={appeal ? `@${appeal.username} · Demo record` : undefined}
      status={appeal ? <StatusBadge {...APPEAL_STATUS[appeal.status]} /> : null}
      loadStatus={appeal ? "succeeded" : detail.id === id ? detail.status : "loading"}
      error={detail.error}
      onRetry={() => id && dispatch(fetchAppeal(id))}
      actions={
        appeal ? (
          <Can permission="appeals:decide">
            <DrawerActions>
              <Tooltip title={decided ? "Already decided." : undefined}>
                <Button
                  icon={<CheckOutlined />}
                  disabled={decided}
                  onClick={() => decide(appeal, "upheld")}
                >
                  Uphold decision
                </Button>
              </Tooltip>
              <Tooltip title={decided ? "Already decided." : undefined}>
                <Button
                  type="primary"
                  icon={<RollbackOutlined />}
                  disabled={decided}
                  onClick={() => decide(appeal, "reversed")}
                >
                  Reverse decision
                </Button>
              </Tooltip>
            </DrawerActions>
          </Can>
        ) : null
      }
    >
      {appeal ? (
        <>
          <DetailSection title="Original decision">
            <DetailList
              items={[
                {
                  key: "action",
                  label: "Action",
                  value: MODERATION_ACTION_LABELS[appeal.originalDecision.action],
                },
                {
                  key: "case",
                  label: "Case",
                  value: <EntityLink kind="case" id={appeal.caseId} />,
                },
                { key: "by", label: "Decided by", value: appeal.originalDecision.decidedBy },
                {
                  key: "at",
                  label: "Decided",
                  value: formatDateTime(appeal.originalDecision.decidedAt),
                },
                {
                  key: "reason",
                  label: "Reason",
                  value: appeal.originalDecision.reason,
                  wide: true,
                },
                {
                  key: "caseStatus",
                  label: "Case status",
                  value: original ? <StatusBadge {...CASE_STATUS[original.status]} /> : "…",
                },
                {
                  key: "member",
                  label: "Member",
                  value: (
                    <EntityLink kind="user" id={appeal.userId}>
                      @{appeal.username}
                    </EntityLink>
                  ),
                },
              ]}
            />
          </DetailSection>
          <DetailSection title="Appeal">
            <DetailList
              items={[
                { key: "reason", label: "Member's reason", value: appeal.appealReason, wide: true },
                { key: "submitted", label: "Submitted", value: formatDateTime(appeal.submittedAt) },
                {
                  key: "reviewer",
                  label: "Reviewer",
                  value: appeal.assignedReviewerName ?? "Unassigned",
                },
              ]}
            />
          </DetailSection>
          <DetailSection title="Evidence">
            {appeal.evidence.length ? (
              <Evidence>
                {appeal.evidence.map((item) => (
                  <li key={item.id}>
                    <strong>{item.label}</strong>
                    <span>{item.summary}</span>
                  </li>
                ))}
              </Evidence>
            ) : (
              <EmptyState compact title="No evidence submitted" />
            )}
          </DetailSection>
          <DetailSection title="Decision history">
            <Timeline entries={appeal.history} />
          </DetailSection>
        </>
      ) : null}
    </DetailDrawer>
  );
}
