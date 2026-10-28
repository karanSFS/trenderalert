"use client";

import { EyeOutlined, UserAddOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { Segmented, type TableColumnsType } from "antd";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { Identity } from "@/components/ui/Identity";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions } from "@/components/ui/RowActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConfirm } from "@/components/ui/useConfirm";
import { moderationSelectors } from "@/features/moduleSelectors";
import { fetchCases, moderationActions } from "@/features/moderation/moderationSlice";
import {
  MODERATION_CATEGORIES,
  type ModerationCase,
  type ModerationFilters,
} from "@/features/moderation/moderationTypes";
import { CASE_STATUS, PRIORITY, toOptions } from "@/lib/constants/statusLabels";
import { formatDateTime } from "@/lib/formatters/date";
import { useDirectoryList } from "@/lib/hooks/useDirectoryList";
import { useAppDispatch } from "@/store/hooks";
import { isCaseOpen, useCaseActions } from "./useCaseActions";

export function ModerationQueueScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { list, table, search, filterBar, refetch } = useDirectoryList(
    moderationSelectors,
    fetchCases,
    moderationActions,
  );
  const { confirm, dialog } = useConfirm();
  const { assignToMe, unassign, currentAdminId, reviewers } = useCaseActions(confirm, refetch);
  const openOnly = list.query.filters.openOnly !== false;

  const assigneeOptions = [
    { value: "unassigned", label: "Unassigned" },
    ...reviewers.map((reviewer) => ({
      value: reviewer.id,
      label: reviewer.id === currentAdminId ? `Assigned to me (${reviewer.name})` : reviewer.name,
    })),
  ];

  const columns: TableColumnsType<ModerationCase> = [
    {
      key: "id",
      title: "Case",
      render: (_, item) => (
        <Identity>
          <strong>{item.id}</strong>
          <span>{item.reportedItemLabel}</span>
        </Identity>
      ),
    },
    { key: "category", title: "Category", render: (_, item) => item.category },
    {
      key: "priority",
      title: "Priority",
      sorter: true,
      render: (_, item) => <StatusBadge {...PRIORITY[item.priority]} />,
    },
    {
      key: "status",
      title: "Status",
      render: (_, item) => <StatusBadge {...CASE_STATUS[item.status]} />,
    },
    {
      key: "reviewer",
      title: "Reviewer",
      render: (_, item) => item.assignedReviewerName ?? <span>Unassigned</span>,
    },
    {
      key: "reporters",
      title: "Reporters",
      align: "right",
      render: (_, item) => item.reporterCount,
    },
    {
      key: "submittedAt",
      title: "Submitted",
      sorter: true,
      render: (_, item) => formatDateTime(item.submittedAt),
    },
    {
      key: "actions",
      title: <span className="ta-visually-hidden">Actions</span>,
      width: 56,
      render: (_, item) => (
        <RowActions
          ariaLabel={`Actions for ${item.id}`}
          items={[
            {
              key: "open",
              label: "Open case",
              icon: <EyeOutlined />,
              onSelect: () => router.push(`/admin/moderation/${item.id}`),
            },
            {
              key: "assign",
              label: "Assign to me",
              icon: <UserAddOutlined />,
              permission: "moderation:act",
              disabled: !isCaseOpen(item) || item.assignedReviewerId === currentAdminId,
              disabledReason: !isCaseOpen(item)
                ? "This case is closed."
                : "Already assigned to you.",
              onSelect: () => assignToMe(item),
            },
            {
              key: "unassign",
              label: "Unassign",
              icon: <UserDeleteOutlined />,
              permission: "moderation:act",
              disabled: !isCaseOpen(item) || !item.assignedReviewerId,
              disabledReason: !isCaseOpen(item) ? "This case is closed." : "Not assigned.",
              onSelect: () => unassign(item),
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
        title="Moderation queue"
        subtitle="Reports from members, ordered by priority. Open a case to review it and record a decision. All cases are fictional."
      />
      <DataTable<ModerationCase>
        ariaLabel="Moderation queue"
        columns={columns}
        rowKey="id"
        {...table}
        onRowClick={(item) => router.push(`/admin/moderation/${item.id}`)}
        emptyTitle={openOnly ? "No open cases match" : "No cases match"}
        toolbar={
          <FilterBar<ModerationFilters>
            search={{
              ...search,
              ariaLabel: "Search cases",
              placeholder: "Search case id, item or reviewer",
            }}
            filters={[
              { type: "select", key: "priority", label: "Priority", options: toOptions(PRIORITY) },
              { type: "select", key: "status", label: "Status", options: toOptions(CASE_STATUS) },
              {
                type: "select",
                key: "category",
                label: "Category",
                width: 210,
                options: MODERATION_CATEGORIES.map((category) => ({
                  value: category,
                  label: category,
                })),
              },
              {
                type: "select",
                key: "assignee",
                label: "Assignee",
                width: 220,
                options: assigneeOptions,
              },
            ]}
            {...filterBar}
            extra={
              <Segmented<"open" | "all">
                aria-label="Queue scope"
                value={openOnly ? "open" : "all"}
                onChange={(value) =>
                  dispatch(moderationActions.setFilters({ openOnly: value === "open" }))
                }
                options={[
                  { label: "Open cases", value: "open" },
                  { label: "All cases", value: "all" },
                ]}
              />
            }
          />
        }
      />
      {dialog}
    </>
  );
}
