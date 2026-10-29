"use client";

import {
  ReloadOutlined,
  SafetyCertificateOutlined,
  UserAddOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Alert, Button, Form, Input, Select, Switch, type TableColumnsType } from "antd";
import { useState } from "react";
import styled from "styled-components";
import { Can } from "@/components/auth/Can";
import { DataTable } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/ui/FilterBar";
import { FormModal } from "@/components/ui/FormModal";
import { Identity } from "@/components/ui/Identity";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions } from "@/components/ui/RowActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConfirm } from "@/components/ui/useConfirm";
import { selectCurrentAdmin } from "@/features/auth/authSelectors";
import { adminRolesSelectors } from "@/features/moduleSelectors";
import {
  adminRolesActions,
  assignAdminRole,
  fetchAdminRoles,
  revokeAdminRole,
} from "@/features/security/adminRolesSlice";
import type {
  AdminRoleAssignment,
  AdminRoleFilters,
  AssignRoleRequest,
} from "@/features/security/securityTypes";
import { ADMIN_ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/constants/roles";
import { formatDateTime } from "@/lib/formatters/date";
import { useApiAction } from "@/lib/hooks/useApiAction";
import { useDirectoryList } from "@/lib/hooks/useDirectoryList";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const ROLE_OPTIONS = ADMIN_ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }));
const STATE_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const Notice = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const Mono = styled.span`
  font-family: var(--font-geist-mono), monospace;
  font-size: ${({ theme }) => theme.font.sizeSm};
`;

function MfaBadge({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <StatusBadge label="MFA required" tone="success" icon={<SafetyCertificateOutlined />} />
  ) : (
    <StatusBadge label="MFA not required" tone="warning" icon={<WarningOutlined />} />
  );
}

type Editing = { mode: "assign" } | { mode: "change"; assignment: AdminRoleAssignment } | null;

export function AdminUsersScreen() {
  const dispatch = useAppDispatch();
  const me = useAppSelector(selectCurrentAdmin);
  const { table, search, filterBar, refetch } = useDirectoryList(
    adminRolesSelectors,
    fetchAdminRoles,
    adminRolesActions,
  );
  const [editing, setEditing] = useState<Editing>(null);
  const { run } = useApiAction();
  const changing = editing?.mode === "change" ? editing.assignment : null;
  const { confirm, dialog } = useConfirm();

  const revoke = (item: AdminRoleAssignment) =>
    confirm({
      title: `Revoke ${item.role ? ROLE_LABELS[item.role] : item.roleName} from ${item.userName ?? item.userId}`,
      description: item.userEmail ?? item.userId,
      consequences: [
        "The account loses all administrator access on its next request.",
        "The account itself stays active as a member account.",
      ],
      confirmLabel: "Revoke role",
      danger: true,
      requireReason: { label: "Justification (written to the audit log)" },
      onConfirm: (reason) =>
        run(
          dispatch(revokeAdminRole({ userId: item.userId, justification: reason ?? "" })).unwrap(),
          {
            success: "Role revoked",
            after: () => refetch(),
          },
        ),
    });

  const columns: TableColumnsType<AdminRoleAssignment> = [
    {
      key: "user",
      title: "Administrator",
      render: (_, item) => (
        <Identity>
          <strong>
            {item.userName ?? "Unnamed administrator"}
            {item.userId === me?.id ? " (you)" : ""}
          </strong>
          <span>{item.userEmail ?? <Mono>{item.userId}</Mono>}</span>
        </Identity>
      ),
    },
    {
      key: "role",
      title: "Role",
      render: (_, item) => (item.role ? ROLE_LABELS[item.role] : item.roleName),
    },
    {
      key: "state",
      title: "Status",
      render: (_, item) => (
        <StatusBadge
          label={item.isActive ? "Active" : "Inactive"}
          tone={item.isActive ? "success" : "neutral"}
        />
      ),
    },
    { key: "mfa", title: "MFA", render: (_, item) => <MfaBadge enabled={item.mfaEnabled} /> },
    {
      key: "reauth",
      title: "Last re-authentication",
      render: (_, item) => (item.lastReauthAt ? formatDateTime(item.lastReauthAt) : "Never"),
    },
    { key: "created", title: "Assigned", render: (_, item) => formatDateTime(item.createdAt) },
    {
      key: "actions",
      title: <span className="ta-visually-hidden">Actions</span>,
      width: 56,
      render: (_, item) => (
        <RowActions
          ariaLabel={`Actions for ${item.userId}`}
          items={[
            {
              key: "change",
              label: "Change role…",
              permission: "security:manage-admins",
              disabled: item.userId === me?.id,
              disabledReason: "You cannot change your own role.",
              onSelect: () => setEditing({ mode: "change", assignment: item }),
            },
            {
              key: "revoke",
              label: "Revoke role",
              permission: "security:manage-admins",
              danger: true,
              disabled: item.userId === me?.id || !item.isActive,
              disabledReason:
                item.userId === me?.id
                  ? "You cannot revoke your own role."
                  : "This role is already inactive.",
              onSelect: () => revoke(item),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Security"
        title="Admin users"
        subtitle="Administrator role assignments from the TrenderAlert backend. Only a Super Administrator can assign roles."
        actions={
          <>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={table.status === "loading"}
            >
              Refresh
            </Button>
            <Can permission="security:manage-admins">
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => setEditing({ mode: "assign" })}
              >
                Assign role
              </Button>
            </Can>
          </>
        }
      />
      <Notice
        type="info"
        showIcon
        title="Roles are enforced by the backend"
        description="Changes take effect on the administrator's next request. You cannot change or revoke your own role."
      />
      <DataTable<AdminRoleAssignment>
        ariaLabel="Administrator roles"
        columns={columns}
        rowKey="id"
        {...table}
        emptyTitle="No role assignments match"
        toolbar={
          <FilterBar<AdminRoleFilters>
            search={{
              ...search,
              ariaLabel: "Search administrators",
              placeholder: "Search name, email or user id",
            }}
            filters={[
              { type: "select", key: "role", label: "Role", options: ROLE_OPTIONS, width: 220 },
              { type: "select", key: "state", label: "Status", options: STATE_OPTIONS },
            ]}
            {...filterBar}
          />
        }
      />

      <FormModal<AssignRoleRequest>
        open={editing !== null}
        title={changing ? "Change role" : "Assign administrator role"}
        description={
          changing
            ? `Current role: ${changing.role ? ROLE_LABELS[changing.role] : changing.roleName}. The change applies to the account's next request.`
            : "Grants an administrator role to an existing TrenderAlert account."
        }
        submitLabel={changing ? "Change role" : "Assign role"}
        initialValues={
          changing
            ? {
                userId: changing.userId,
                role: changing.role ?? undefined,
                mfaEnabled: changing.mfaEnabled,
              }
            : { mfaEnabled: true }
        }
        onClose={() => setEditing(null)}
        onSubmit={async (values) => {
          const userId = values.userId.trim();
          await run(dispatch(assignAdminRole({ ...values, userId })).unwrap(), {
            success: `${ROLE_LABELS[values.role]} assigned`,
            after: () => refetch(),
          });
        }}
      >
        <Form.Item
          name="userId"
          label="User id"
          rules={[
            { required: true, message: "Enter the account's user id." },
            { pattern: UUID_PATTERN, message: "Enter a valid user id (UUID)." },
            {
              validator: (_, value?: string) =>
                value?.trim() === me?.id
                  ? Promise.reject(new Error("You cannot change your own role."))
                  : Promise.resolve(),
            },
          ]}
        >
          <Input disabled={Boolean(changing)} placeholder="00000000-0000-0000-0000-000000000000" />
        </Form.Item>
        <Form.Item name="role" label="Role" rules={[{ required: true, message: "Choose a role." }]}>
          <Select
            options={ROLE_OPTIONS.map((option) => ({
              ...option,
              title: ROLE_DESCRIPTIONS[option.value],
            }))}
            placeholder="Choose a role"
          />
        </Form.Item>
        <Form.Item
          name="mfaEnabled"
          label="Require MFA"
          valuePropName="checked"
          extra="Strongly recommended for every administrator."
        >
          <Switch />
        </Form.Item>
      </FormModal>
      {dialog}
    </>
  );
}
