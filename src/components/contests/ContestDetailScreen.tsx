"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Alert, Button, Table, type TableColumnsType } from "antd";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import styled from "styled-components";
import { ActionButtons } from "@/components/ui/ActionButtons";
import { DetailList } from "@/components/ui/DetailDrawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { EntityLink } from "@/components/ui/EntityLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { RecordState } from "@/components/ui/RecordState";
import { RowActions } from "@/components/ui/RowActions";
import { DetailColumn, DetailGrid, SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Timeline } from "@/components/ui/Timeline";
import { useConfirm } from "@/components/ui/useConfirm";
import { usePermission } from "@/features/auth/usePermission";
import { fetchContest } from "@/features/contests/contestsSlice";
import type { Contest, ContestEntry } from "@/features/contests/contestsTypes";
import { contestsSelectors } from "@/features/moduleSelectors";
import {
  APPROVAL_STATE,
  CONTEST_STATUS,
  CONTEST_TYPE_LABELS,
  DISPUTE_STATUS,
  ENTRY_STATUS,
  FUNDING_STATUS,
  PAYOUT_STATUS,
} from "@/lib/constants/operationalLabels";
import { formatDate, formatDateTime } from "@/lib/formatters/date";
import { formatCurrency } from "@/lib/formatters/number";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { PAID_CONTESTS_DISABLED, useContestActions } from "./useContestActions";

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

const Note = styled.p`
  margin: ${({ theme }) => theme.space(3)} 0 0;
  font-size: ${({ theme }) => theme.font.sizeSm};
  color: ${({ theme }) => theme.colors.textTertiary};
`;

const Disputes = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  li + li {
    margin-top: ${({ theme }) => theme.space(3)};
    padding-top: ${({ theme }) => theme.space(3)};
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }

  p {
    margin: ${({ theme }) => theme.space(1)} 0;
  }

  small {
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

const DisputeHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(2)};
`;

const ENTRY_REVIEW_STATUSES: Contest["status"][] = ["active", "judging"];

export function ContestDetailScreen({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const contest = useAppSelector((state) => contestsSelectors.selectById(state, id));
  const detail = useAppSelector(contestsSelectors.selectDetail);
  const canManage = usePermission("contests:manage");
  const { confirm, dialog } = useConfirm();

  const load = useCallback(() => {
    dispatch(fetchContest(id));
  }, [dispatch, id]);

  useEffect(() => {
    load();
  }, [load]);

  const { actionItems, setEntryStatus, resolveDispute } = useContestActions(confirm, load);

  if (!contest || (detail.id === id && detail.status === "failed")) {
    return (
      <RecordState
        status={detail.id === id ? detail.status : "loading"}
        error={detail.error}
        onRetry={load}
        backHref="/admin/contests"
        backLabel="Back to contests"
      />
    );
  }

  const entriesReviewable = ENTRY_REVIEW_STATUSES.includes(contest.status);
  const entryColumns: TableColumnsType<ContestEntry> = [
    { key: "id", title: "Entry", dataIndex: "id" },
    {
      key: "member",
      title: "Entrant",
      render: (_, entry) => (
        <EntityLink kind="user" id={entry.userId}>
          @{entry.username}
        </EntityLink>
      ),
    },
    {
      key: "submitted",
      title: "Submitted",
      render: (_, entry) => formatDateTime(entry.submittedAt),
    },
    {
      key: "status",
      title: "Status",
      render: (_, entry) => <StatusBadge {...ENTRY_STATUS[entry.status]} />,
    },
    {
      key: "score",
      title: "Score",
      align: "right",
      render: (_, entry) => entry.score ?? "—",
    },
    {
      key: "actions",
      title: <span className="ta-visually-hidden">Actions</span>,
      width: 56,
      render: (_, entry) => (
        <RowActions
          ariaLabel={`Actions for entry ${entry.id}`}
          items={[
            {
              key: "disqualify",
              label: "Disqualify",
              permission: "contests:manage",
              danger: true,
              disabled: !entriesReviewable || entry.status === "disqualified",
              disabledReason: entriesReviewable
                ? "Already disqualified."
                : "Entries are reviewed while active or judging.",
              onSelect: () => setEntryStatus(contest, entry, "disqualified"),
            },
            {
              key: "clear",
              label: "Clear flag",
              permission: "contests:manage",
              disabled: !entriesReviewable || entry.status === "valid",
              disabledReason: entriesReviewable
                ? "The entry is not flagged."
                : "Entries are reviewed while active or judging.",
              onSelect: () => setEntryStatus(contest, entry, "valid"),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Demo record"
        title={contest.name}
        subtitle={`${contest.id} · ${CONTEST_TYPE_LABELS[contest.type]} · Sponsored by ${contest.sponsor}`}
        actions={
          <HeaderActions>
            <StatusBadge {...CONTEST_STATUS[contest.status]} />
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/admin/contests")}>
              Contests
            </Button>
          </HeaderActions>
        }
      />

      <Stack>
        {contest.type === "paid" ? (
          <Alert
            type="warning"
            showIcon
            title="Paid contest: activation disabled"
            description={PAID_CONTESTS_DISABLED}
          />
        ) : null}
        {contest.status === "active" ? (
          <Alert
            type="info"
            showIcon
            title="Terms are locked while the contest runs"
            description="Rules, prizes and dates cannot change mid-contest. If the contest cannot continue, cancel it under its official rules."
          />
        ) : null}
        {canManage ? (
          <SectionCard title="Contest actions">
            <ActionButtons size="middle" items={actionItems(contest)} />
          </SectionCard>
        ) : null}
      </Stack>

      <DetailGrid>
        <DetailColumn>
          <SectionCard title="Approvals">
            <DetailList
              items={[
                {
                  key: "legal",
                  label: "Legal",
                  value: <StatusBadge {...APPROVAL_STATE[contest.approvals.legal]} />,
                },
                {
                  key: "provider",
                  label: "Payment provider",
                  value: <StatusBadge {...APPROVAL_STATE[contest.approvals.paymentProvider]} />,
                },
                {
                  key: "operations",
                  label: "Operations",
                  value: <StatusBadge {...APPROVAL_STATE[contest.approvals.operations]} />,
                },
                {
                  key: "funding",
                  label: "Prize funding",
                  value: <StatusBadge {...FUNDING_STATUS[contest.fundingStatus]} />,
                },
              ]}
            />
            <Note>
              Approvals are recorded by the responsible teams in the backend. They are read-only
              here.
            </Note>
          </SectionCard>
          <SectionCard title="Overview">
            <DetailList
              items={[
                {
                  key: "description",
                  label: "Description",
                  value: contest.description,
                  wide: true,
                },
                { key: "opens", label: "Entry opens", value: formatDate(contest.entryOpensAt) },
                { key: "closes", label: "Entry closes", value: formatDate(contest.entryClosesAt) },
                { key: "age", label: "Minimum age", value: contest.eligibility.minimumAge },
                {
                  key: "limit",
                  label: "Entries per member",
                  value: contest.eligibility.entryLimit,
                },
                {
                  key: "where",
                  label: "Eligible jurisdictions",
                  value: contest.eligibility.jurisdictions.join(", "),
                  wide: true,
                },
              ]}
            />
          </SectionCard>
          <SectionCard title="Prize and payout">
            <DetailList
              items={[
                { key: "prize", label: "Prize", value: contest.prize.description, wide: true },
                {
                  key: "value",
                  label: "Stated value",
                  value: formatCurrency(contest.prize.valueCents),
                },
                {
                  key: "payout",
                  label: "Payout status",
                  value: <StatusBadge {...PAYOUT_STATUS[contest.payoutStatus]} />,
                },
              ]}
            />
            <Note>
              Payouts are handled outside this portal after winner verification. No money moves in
              the demo.
            </Note>
          </SectionCard>
          <SectionCard title="Official rules">
            <DetailList
              items={[
                { key: "version", label: "Version", value: contest.rules.version },
                {
                  key: "locked",
                  label: "State",
                  value: (
                    <StatusBadge
                      label={contest.rules.locked ? "Locked" : "Editable draft"}
                      tone={contest.rules.locked ? "success" : "warning"}
                    />
                  ),
                },
                {
                  key: "judging",
                  label: "Judging method",
                  value: contest.rules.judgingMethod,
                  wide: true,
                },
              ]}
            />
          </SectionCard>
        </DetailColumn>
        <DetailColumn>
          <SectionCard title={`Entries (${contest.entries.length})`}>
            {contest.entries.length > 0 ? (
              <Table<ContestEntry>
                size="small"
                rowKey="id"
                columns={entryColumns}
                dataSource={contest.entries}
                pagination={{ pageSize: 8, showSizeChanger: false, hideOnSinglePage: true }}
                scroll={{ x: 560 }}
              />
            ) : (
              <EmptyState
                compact
                title="No entries yet"
                description="Entries appear once the entry window opens."
              />
            )}
          </SectionCard>
          <SectionCard title="Disputes">
            {contest.disputes.length > 0 ? (
              <Disputes>
                {contest.disputes.map((dispute) => (
                  <li key={dispute.id}>
                    <DisputeHead>
                      <strong>
                        {dispute.id} · @{dispute.username}
                      </strong>
                      <StatusBadge {...DISPUTE_STATUS[dispute.status]} />
                    </DisputeHead>
                    <p>{dispute.summary}</p>
                    {dispute.resolution ? <p>Resolution: {dispute.resolution}</p> : null}
                    <small>Opened {formatDateTime(dispute.openedAt)}</small>
                    {dispute.status === "open" && canManage ? (
                      <div>
                        <Button size="small" onClick={() => resolveDispute(contest, dispute)}>
                          Resolve dispute
                        </Button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </Disputes>
            ) : (
              <EmptyState compact title="No disputes" />
            )}
          </SectionCard>
          <SectionCard title="History">
            <Timeline entries={contest.history} />
          </SectionCard>
        </DetailColumn>
      </DetailGrid>
      {dialog}
    </>
  );
}
