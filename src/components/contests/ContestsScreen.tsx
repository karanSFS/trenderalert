"use client";

import type { TableColumnsType } from "antd";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { Identity } from "@/components/ui/Identity";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions } from "@/components/ui/RowActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConfirm } from "@/components/ui/useConfirm";
import { contestsActions, fetchContests } from "@/features/contests/contestsSlice";
import type { Contest, ContestFilters } from "@/features/contests/contestsTypes";
import { contestsSelectors } from "@/features/moduleSelectors";
import {
  APPROVAL_STATE,
  CONTEST_STATUS,
  CONTEST_TYPE_LABELS,
} from "@/lib/constants/operationalLabels";
import { toOptions } from "@/lib/constants/statusLabels";
import { formatDate } from "@/lib/formatters/date";
import { formatCurrency, formatNumber } from "@/lib/formatters/number";
import { useDirectoryList } from "@/lib/hooks/useDirectoryList";
import { useContestActions } from "./useContestActions";

export function ContestsScreen() {
  const router = useRouter();
  const { table, search, filterBar, refetch } = useDirectoryList(
    contestsSelectors,
    fetchContests,
    contestsActions,
  );
  const { confirm, dialog } = useConfirm();
  const { actionItems } = useContestActions(confirm, () => refetch());
  const openContest = (contest: Contest) => router.push(`/admin/contests/${contest.id}`);

  const columns: TableColumnsType<Contest> = [
    {
      key: "name",
      title: "Contest",
      render: (_, contest) => (
        <Identity>
          <strong>{contest.name}</strong>
          <span>
            {contest.id} · {contest.sponsor}
          </span>
        </Identity>
      ),
    },
    {
      key: "type",
      title: "Type",
      render: (_, contest) => (
        <StatusBadge
          label={CONTEST_TYPE_LABELS[contest.type]}
          tone={contest.type === "paid" ? "warning" : "neutral"}
        />
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_, contest) => <StatusBadge {...CONTEST_STATUS[contest.status]} />,
    },
    {
      key: "legal",
      title: "Legal approval",
      render: (_, contest) => <StatusBadge {...APPROVAL_STATE[contest.approvals.legal]} />,
    },
    {
      key: "entryOpensAt",
      title: "Entry window",
      sorter: true,
      render: (_, contest) => (
        <Identity>
          <strong>{formatDate(contest.entryOpensAt)}</strong>
          <span>to {formatDate(contest.entryClosesAt)}</span>
        </Identity>
      ),
    },
    {
      key: "entries",
      title: "Entries",
      sorter: true,
      align: "right",
      render: (_, contest) => formatNumber(contest.entries.length),
    },
    {
      key: "prize",
      title: "Prize value",
      align: "right",
      render: (_, contest) => formatCurrency(contest.prize.valueCents),
    },
    {
      key: "actions",
      title: <span className="ta-visually-hidden">Actions</span>,
      width: 56,
      render: (_, contest) => (
        <RowActions
          ariaLabel={`Actions for ${contest.name}`}
          items={[
            { key: "view", label: "Open contest", onSelect: () => openContest(contest) },
            ...actionItems(contest),
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Contests"
        title="Contests"
        subtitle="Approval, rules, entries and payout status. Paid contests stay disabled until every approval is recorded by the backend; sponsors and prizes are fictional."
      />
      <DataTable<Contest>
        ariaLabel="Contests"
        columns={columns}
        rowKey="id"
        {...table}
        onRowClick={openContest}
        emptyTitle="No contests match"
        toolbar={
          <FilterBar<ContestFilters>
            search={{
              ...search,
              ariaLabel: "Search contests",
              placeholder: "Search name, id or sponsor",
            }}
            filters={[
              {
                type: "select",
                key: "status",
                label: "Status",
                options: toOptions(CONTEST_STATUS),
              },
              {
                type: "select",
                key: "type",
                label: "Type",
                options: toOptions(CONTEST_TYPE_LABELS),
              },
            ]}
            {...filterBar}
          />
        }
      />
      {dialog}
    </>
  );
}
