"use client";

import type { TableColumnsType } from "antd";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions } from "@/components/ui/RowActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConfirm } from "@/components/ui/useConfirm";
import { usersSelectors } from "@/features/moduleSelectors";
import { fetchUsers, usersActions } from "@/features/users/usersSlice";
import type { PlatformUser, UserFilters } from "@/features/users/usersTypes";
import { PLAN_LABELS, toOptions, USER_STATUS, VERIFICATION } from "@/lib/constants/statusLabels";
import { formatDate } from "@/lib/formatters/date";
import { formatNumber } from "@/lib/formatters/number";
import { useDirectoryList } from "@/lib/hooks/useDirectoryList";
import { useUserActions } from "./useUserActions";
import { Identity } from "@/components/ui/Identity";

const Muted = styled.span`
  font-size: ${({ theme }) => theme.font.sizeSm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export function UsersScreen() {
  const router = useRouter();
  const { table, search, filterBar, refetch } = useDirectoryList(
    usersSelectors,
    fetchUsers,
    usersActions,
  );
  const { confirm, dialog } = useConfirm();
  const { rowActions } = useUserActions(confirm, refetch);

  const columns: TableColumnsType<PlatformUser> = [
    {
      key: "username",
      title: "Member",
      sorter: true,
      render: (_, user) => (
        <Identity>
          <strong>{user.displayName}</strong>
          <span>
            @{user.username} · {user.id}
          </span>
        </Identity>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (_, user) => <StatusBadge {...USER_STATUS[user.status]} />,
    },
    {
      key: "plan",
      title: "Subscription",
      render: (_, user) => (
        <Identity>
          <strong>{PLAN_LABELS[user.subscription.plan]}</strong>
          {user.subscription.store ? (
            <span>{user.subscription.store === "ios" ? "App Store" : "Google Play"}</span>
          ) : null}
        </Identity>
      ),
    },
    {
      key: "verification",
      title: "Verification",
      render: (_, user) => <StatusBadge {...VERIFICATION[user.verification]} />,
    },
    {
      key: "reportsReceived",
      title: "Reports",
      sorter: true,
      align: "right",
      render: (_, user) => formatNumber(user.reportsReceived),
    },
    {
      key: "registeredAt",
      title: "Registered",
      sorter: true,
      render: (_, user) => <Muted>{formatDate(user.registeredAt)}</Muted>,
    },
    {
      key: "actions",
      title: <span className="ta-visually-hidden">Actions</span>,
      width: 56,
      render: (_, user) => (
        <RowActions ariaLabel={`Actions for @${user.username}`} items={rowActions(user)} />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Users"
        subtitle="Search accounts and apply authorized status changes. The directory shows a sample of 60 fictional demo accounts."
      />
      <DataTable<PlatformUser>
        ariaLabel="User directory"
        columns={columns}
        rowKey="id"
        {...table}
        onRowClick={(user) => router.push(`/admin/users/${user.id}`)}
        emptyTitle="No members match"
        toolbar={
          <FilterBar<UserFilters>
            search={{
              ...search,
              ariaLabel: "Search users",
              placeholder: "Search username, name or email",
            }}
            filters={[
              { type: "select", key: "status", label: "Status", options: toOptions(USER_STATUS) },
              {
                type: "select",
                key: "plan",
                label: "Subscription",
                options: toOptions(PLAN_LABELS),
              },
              {
                type: "select",
                key: "verification",
                label: "Verification",
                options: toOptions(VERIFICATION),
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
