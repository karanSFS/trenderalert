"use client";

import { ReloadOutlined } from "@ant-design/icons";
import { Button, type TableColumnsType } from "antd";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { Identity } from "@/components/ui/Identity";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions } from "@/components/ui/RowActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { usePermission } from "@/features/auth/usePermission";
import { usersSelectors } from "@/features/moduleSelectors";
import { fetchUsers, usersActions } from "@/features/users/usersSlice";
import type { DirectoryUser, DirectoryUserFilters } from "@/features/users/usersTypes";
import { BACKEND_ROLE_TO_ADMIN_ROLE, ROLE_LABELS } from "@/lib/constants/roles";
import { ACCOUNT_STATUS, accountStatusBadge, toOptions } from "@/lib/constants/statusLabels";
import { formatDate } from "@/lib/formatters/date";
import { maskEmail, maskPhone } from "@/lib/formatters/text";
import { useDirectoryList } from "@/lib/hooks/useDirectoryList";

const MINOR_OPTIONS = [
  { value: "yes", label: "Minors only" },
  { value: "no", label: "Adults only" },
];

export const memberName = (user: DirectoryUser) =>
  user.displayName || (user.username ? `@${user.username}` : "Unnamed member");

/** Full contact details only for roles that manage accounts; everyone else sees them masked. */
export function useContactFormatter() {
  const canSeeContact = usePermission("users:manage");
  return (user: DirectoryUser) => {
    if (user.email) return canSeeContact ? user.email : maskEmail(user.email);
    if (user.phone) return canSeeContact ? user.phone : maskPhone(user.phone);
    return "No contact on file";
  };
}

export const adminRoleLabel = (role: string | null) =>
  role
    ? BACKEND_ROLE_TO_ADMIN_ROLE[role]
      ? ROLE_LABELS[BACKEND_ROLE_TO_ADMIN_ROLE[role]]
      : role
    : null;

export function UsersScreen() {
  const router = useRouter();
  const { table, search, filterBar, refetch } = useDirectoryList(
    usersSelectors,
    fetchUsers,
    usersActions,
  );
  const contact = useContactFormatter();
  const openUser = (user: DirectoryUser) => router.push(`/admin/users/${user.id}`);

  const columns: TableColumnsType<DirectoryUser> = [
    {
      key: "member",
      title: "Member",
      render: (_, user) => (
        <Identity>
          <strong>{memberName(user)}</strong>
          <span>{user.username ? `@${user.username}` : user.id}</span>
        </Identity>
      ),
    },
    { key: "contact", title: "Contact", render: (_, user) => contact(user) },
    {
      key: "status",
      title: "Status",
      render: (_, user) => <StatusBadge {...accountStatusBadge(user.accountStatus)} />,
    },
    {
      key: "flags",
      title: "Flags",
      render: (_, user) => (
        <>
          {user.isMinor ? <StatusBadge label="Minor" tone="warning" /> : null}
          {user.adminRole ? (
            <StatusBadge label={adminRoleLabel(user.adminRole) ?? "Admin"} tone="brand" />
          ) : null}
          {!user.isMinor && !user.adminRole ? "—" : null}
        </>
      ),
    },
    {
      key: "score",
      title: "Trender score",
      align: "right",
      render: (_, user) => user.trenderScore.toFixed(1),
    },
    { key: "joined", title: "Joined", render: (_, user) => formatDate(user.createdAt) },
    {
      key: "actions",
      title: <span className="ta-visually-hidden">Actions</span>,
      width: 56,
      render: (_, user) => (
        <RowActions
          ariaLabel={`Actions for ${memberName(user)}`}
          items={[{ key: "open", label: "Open member", onSelect: () => openUser(user) }]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Users"
        subtitle="Member directory from the TrenderAlert backend. Contact details are masked unless your role manages accounts."
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
      <DataTable<DirectoryUser>
        ariaLabel="Members"
        columns={columns}
        rowKey="id"
        {...table}
        pagination={{ ...table.pagination, pageSizeOptions: [10, 20, 50] }}
        onRowClick={openUser}
        emptyTitle="No members match"
        toolbar={
          <FilterBar<DirectoryUserFilters>
            search={{
              ...search,
              ariaLabel: "Search members",
              placeholder: "Search name, username, email, phone or id",
            }}
            filters={[
              {
                type: "select",
                key: "status",
                label: "Status",
                options: toOptions(ACCOUNT_STATUS),
              },
              { type: "select", key: "minor", label: "Age", options: MINOR_OPTIONS },
            ]}
            {...filterBar}
          />
        }
      />
    </>
  );
}
