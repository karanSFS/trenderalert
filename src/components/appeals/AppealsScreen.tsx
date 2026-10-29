"use client";

import { ReloadOutlined } from "@ant-design/icons";
import { Button, type TableColumnsType } from "antd";
import Link from "next/link";
import { useEffect } from "react";
import styled from "styled-components";
import { ActionButtons } from "@/components/ui/ActionButtons";
import { DataTable } from "@/components/ui/DataTable";
import { DetailDrawer, DetailList, DetailSection } from "@/components/ui/DetailDrawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { EntityLink } from "@/components/ui/EntityLink";
import { FilterBar } from "@/components/ui/FilterBar";
import { Identity } from "@/components/ui/Identity";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions, type RowActionItem } from "@/components/ui/RowActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConfirm, type ConfirmSpec } from "@/components/ui/useConfirm";
import {
  appealsActions,
  fetchAppeal,
  fetchAppeals,
  resolveAppeal,
} from "@/features/appeals/appealsSlice";
import {
  isAppealOpen,
  type Appeal,
  type AppealFilters,
  type AppealOutcome,
} from "@/features/appeals/appealsTypes";
import { appealsSelectors } from "@/features/moduleSelectors";
import { APPEAL_STATUS } from "@/lib/constants/moderationLabels";
import { toOptions } from "@/lib/constants/statusLabels";
import { formatDateTime } from "@/lib/formatters/date";
import { maskEmail, shortId } from "@/lib/formatters/text";
import { useApiAction } from "@/lib/hooks/useApiAction";
import { useDirectoryList } from "@/lib/hooks/useDirectoryList";
import { useOpenParam } from "@/lib/hooks/useOpenParam";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const Statement = styled.p`
  margin: 0;
  white-space: pre-wrap;
`;

const Excerpt = styled.span`
  display: -webkit-box;
  max-width: 420px;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Evidence = styled.ul`
  margin: 0;
  padding-left: ${({ theme }) => theme.space(5)};
  word-break: break-all;
`;

const OUTCOMES: Record<AppealOutcome, { label: string; consequences: string[]; danger: boolean }> =
  {
    UPHELD: {
      label: "Uphold decision",
      danger: false,
      consequences: [
        "The original enforcement stays in place.",
        "The member receives your written reason.",
      ],
    },
    OVERTURNED: {
      label: "Overturn decision",
      danger: true,
      consequences: [
        "The original enforcement is reversed by the backend.",
        "The member receives your written reason.",
      ],
    },
  };

function useAppealActions(confirm: (spec: ConfirmSpec) => void, after: () => void) {
  const dispatch = useAppDispatch();
  const { run } = useApiAction();

  const decide = (appeal: Appeal, outcome: AppealOutcome) => {
    const spec = OUTCOMES[outcome];
    confirm({
      title: `${spec.label}: appeal ${shortId(appeal.id)}`,
      description: `Against report ${shortId(appeal.reportId)}.`,
      consequences: spec.consequences,
      confirmLabel: spec.label,
      danger: spec.danger,
      requireReason: { label: "Formal reason (sent to the member)" },
      onConfirm: (reason) =>
        run(dispatch(resolveAppeal({ id: appeal.id, outcome, reason: reason ?? "" })).unwrap(), {
          success: `Appeal ${outcome === "UPHELD" ? "upheld" : "overturned"}`,
          after,
        }),
    });
  };

  const actionItems = (appeal: Appeal): RowActionItem[] =>
    (Object.keys(OUTCOMES) as AppealOutcome[]).map((outcome) => ({
      key: outcome,
      label: OUTCOMES[outcome].label,
      permission: "appeals:decide",
      danger: OUTCOMES[outcome].danger,
      disabled: !isAppealOpen(appeal),
      disabledReason: "This appeal is already resolved.",
      onSelect: () => decide(appeal, outcome),
    }));

  return { actionItems };
}

export function AppealsScreen() {
  const dispatch = useAppDispatch();
  const { table, filterBar, refetch } = useDirectoryList(
    appealsSelectors,
    fetchAppeals,
    appealsActions,
  );
  const [openId, setOpenId] = useOpenParam();
  const { confirm, dialog } = useConfirm();
  const { actionItems } = useAppealActions(confirm, () => {
    refetch();
    if (openId) dispatch(fetchAppeal(openId));
  });

  const columns: TableColumnsType<Appeal> = [
    {
      key: "appeal",
      title: "Appeal",
      render: (_, appeal) => (
        <Identity>
          <strong title={appeal.id}>{shortId(appeal.id)}</strong>
          <Excerpt>{appeal.statement}</Excerpt>
        </Identity>
      ),
    },
    {
      key: "report",
      title: "Original report",
      render: (_, appeal) => (
        <Link
          href={`/admin/moderation/${appeal.reportId}`}
          onClick={(event) => event.stopPropagation()}
        >
          {shortId(appeal.reportId)}
        </Link>
      ),
    },
    {
      key: "appellant",
      title: "Appellant",
      render: (_, appeal) => (
        <Identity>
          <strong>
            <EntityLink kind="user" id={appeal.appellantUserId}>
              {appeal.appellantName ?? shortId(appeal.appellantUserId)}
            </EntityLink>
          </strong>
          <span>{appeal.appellantEmail ? maskEmail(appeal.appellantEmail) : "—"}</span>
        </Identity>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_, appeal) => <StatusBadge {...APPEAL_STATUS[appeal.status]} />,
    },
    {
      key: "submitted",
      title: "Submitted",
      render: (_, appeal) => formatDateTime(appeal.submittedAt),
    },
    {
      key: "actions",
      title: <span className="ta-visually-hidden">Actions</span>,
      width: 56,
      render: (_, appeal) => (
        <RowActions
          ariaLabel={`Actions for appeal ${appeal.id}`}
          items={[
            { key: "view", label: "View appeal", onSelect: () => setOpenId(appeal.id) },
            ...actionItems(appeal),
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
        subtitle="Member appeals against enforcement decisions, from the TrenderAlert backend. Each decision needs a written reason."
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
      <DataTable<Appeal>
        ariaLabel="Appeals"
        columns={columns}
        rowKey="id"
        {...table}
        onRowClick={(appeal) => setOpenId(appeal.id)}
        emptyTitle="No appeals"
        emptyDescription="Appeals appear here when members challenge an enforcement decision."
        toolbar={
          <FilterBar<AppealFilters>
            filters={[
              { type: "select", key: "status", label: "Status", options: toOptions(APPEAL_STATUS) },
            ]}
            {...filterBar}
          />
        }
      />
      <AppealDrawer id={openId} onClose={() => setOpenId(null)} actionItems={actionItems} />
      {dialog}
    </>
  );
}

function AppealDrawer({
  id,
  onClose,
  actionItems,
}: {
  id: string | null;
  onClose: () => void;
  actionItems: (appeal: Appeal) => RowActionItem[];
}) {
  const dispatch = useAppDispatch();
  const appeal = useAppSelector((state) => appealsSelectors.selectById(state, id));
  const detail = useAppSelector(appealsSelectors.selectDetail);

  useEffect(() => {
    if (id) dispatch(fetchAppeal(id));
  }, [dispatch, id]);

  return (
    <DetailDrawer
      open={Boolean(id)}
      onClose={onClose}
      width={600}
      title={id ? `Appeal ${shortId(id)}` : ""}
      subtitle={appeal ? `Submitted ${formatDateTime(appeal.submittedAt)}` : undefined}
      status={appeal ? <StatusBadge {...APPEAL_STATUS[appeal.status]} /> : null}
      loadStatus={appeal ? "succeeded" : detail.id === id ? detail.status : "loading"}
      error={detail.error}
      onRetry={() => id && dispatch(fetchAppeal(id))}
      actions={appeal ? <ActionButtons items={actionItems(appeal)} /> : null}
    >
      {appeal ? (
        <>
          <DetailSection title="Appeal statement">
            <Statement>{appeal.statement}</Statement>
          </DetailSection>
          <DetailSection title="Details">
            <DetailList
              items={[
                {
                  key: "report",
                  label: "Original report",
                  value: (
                    <Link href={`/admin/moderation/${appeal.reportId}`}>{appeal.reportId}</Link>
                  ),
                  wide: true,
                },
                {
                  key: "appellant",
                  label: "Appellant",
                  value: (
                    <EntityLink kind="user" id={appeal.appellantUserId}>
                      {appeal.appellantName ?? appeal.appellantUserId}
                    </EntityLink>
                  ),
                  wide: true,
                },
                {
                  key: "assigned",
                  label: "Assigned to",
                  value: appeal.assignedAdminId ?? "Unassigned",
                },
                { key: "resolved", label: "Resolved", value: formatDateTime(appeal.resolvedAt) },
              ]}
            />
          </DetailSection>
          <DetailSection title="Evidence">
            {appeal.evidenceAssets.length > 0 ? (
              <Evidence>
                {appeal.evidenceAssets.map((asset) => (
                  <li key={asset}>{asset}</li>
                ))}
              </Evidence>
            ) : (
              <EmptyState compact title="No evidence attached" />
            )}
          </DetailSection>
          {appeal.resolutionReason ? (
            <DetailSection title="Resolution">
              <Statement>{appeal.resolutionReason}</Statement>
            </DetailSection>
          ) : null}
        </>
      ) : null}
    </DetailDrawer>
  );
}
