"use client";

import { SafetyCertificateOutlined, UserAddOutlined, WarningOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, type TableColumnsType } from "antd";
import { useEffect, useState } from "react";
import { ActionButtons } from "@/components/ui/ActionButtons";
import { DataTable } from "@/components/ui/DataTable";
import { DetailDrawer, DetailList, DetailSection } from "@/components/ui/DetailDrawer";
import { FilterBar } from "@/components/ui/FilterBar";
import { FormModal } from "@/components/ui/FormModal";
import { Identity } from "@/components/ui/Identity";
import { PageHeader } from "@/components/ui/PageHeader";
import { RowActions, type RowActionItem } from "@/components/ui/RowActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Timeline } from "@/components/ui/Timeline";
import { useConfirm } from "@/components/ui/useConfirm";
import { selectCurrentAdmin } from "@/features/auth/authSelectors";
import { adminUsersSelectors } from "@/features/moduleSelectors";
import {
  adminUsersActions,
  changeAdminRole,
  fetchAdminUser,
  fetchAdminUsers,
  inviteAdmin,
  setAdminActive,
} from "@/features/security/adminUsersSlice";
import type {
  AdminAccount,
  AdminAccountFilters,
  AdminInvite,
} from "@/features/security/securityTypes";
import { ADMIN_STATUS } from "@/lib/constants/operationalLabels";
import { ADMIN_ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/constants/roles";
import { toOptions } from "@/lib/constants/statusLabels";
import { formatDateTime } from "@/lib/formatters/date";
import { useDemoAction } from "@/lib/hooks/useDemoAction";
import { useDirectoryList } from "@/lib/hooks/useDirectoryList";
import { useOpenParam } from "@/lib/hooks/useOpenParam";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { AdminRole } from "@/types/auth";

const ROLE_OPTIONS = ADMIN_ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }));

function MfaBadge({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <StatusBadge label="MFA on" tone="success" icon={<SafetyCertificateOutlined />} />
  ) : (
    <StatusBadge label="MFA not enrolled" tone="warning" icon={<WarningOutlined />} />
  );
}

export function AdminUsersScreen() {
  const dispatch = useAppDispatch();
  const admin = useAppSelector(selectCurrentAdmin);
  const { table, search, filterBar, refetch } = useDirectoryList(
    adminUsersSelectors,
    fetchAdminUsers,
    adminUsersActions,
  );
  const [openId, setOpenId] = useOpenParam();
  const [inviting, setInviting] = useState(false);
  const [roleTarget, setRoleTarget] = useState<AdminAccount | null>(null);
  const { confirm, dialog } = useConfirm();
  const { run } = useDemoAction();

  const after = () => {
    refetch();
    if (openId) dispatch(fetchAdminUser(openId));
  };

  const setActive = (account: AdminAccount, active: boolean) =>
    confirm({
      title: `${active ? "Reactivate" : "Deactivate"} ${account.displayName}`,
      consequences: active
        ? [
            "The administrator can sign in again with their existing role.",
            "MFA is required at the next sign-in.",
          ]
        : [
            "Active sessions end and sign-in is blocked.",
            "Their past actions stay in the audit log.",
          ],
      confirmLabel: active ? "Reactivate" : "Deactivate",
      danger: !active,
      requireReason: true,
      onConfirm: (reason) =>
        run(dispatch(setAdminActive({ id: account.id, active, reason: reason ?? "" })).unwrap(), {
          success: `${account.displayName} ${active ? "reactivated" : "deactivated"}`,
          audit: (updated) => ({
            action: active ? "adminUser.reactivate" : "adminUser.deactivate",
            targetType: "adminUser",
            targetId: updated.id,
            summary: `${active ? "Reactivated" : "Deactivated"} administrator ${updated.displayName}`,
            reason,
          }),
          after,
        }),
    });

  const actionItems = (account: AdminAccount): RowActionItem[] => {
    const self = account.id === admin?.id;
    return [
      {
        key: "role",
        label: "Change role…",
        permission: "security:manage-admins",
        disabled: self || account.status === "deactivated",
        disabledReason: self ? "You cannot change your own role." : "Reactivate the account first.",
        onSelect: () => setRoleTarget(account),
      },
      account.status === "deactivated"
        ? {
            key: "reactivate",
            label: "Reactivate",
            permission: "security:manage-admins",
            disabled: self,
            disabledReason: "You cannot change your own account status.",
            onSelect: () => setActive(account, true),
          }
        : {
            key: "deactivate",
            label: "Deactivate",
            permission: "security:manage-admins",
            danger: true,
            disabled: self,
            disabledReason: "You cannot deactivate your own account.",
            onSelect: () => setActive(account, false),
          },
    ];
  };

  const columns: TableColumnsType<AdminAccount> = [
    {
      key: "displayName",
      title: "Administrator",
      sorter: true,
      render: (_, account) => (
        <Identity>
          <strong>
            {account.displayName}
            {account.id === admin?.id ? " (you)" : ""}
          </strong>
          <span>{account.email}</span>
        </Identity>
      ),
    },
    { key: "role", title: "Role", render: (_, account) => ROLE_LABELS[account.role] },
    {
      key: "status",
      title: "Status",
      render: (_, account) => <StatusBadge {...ADMIN_STATUS[account.status]} />,
    },
    { key: "mfa", title: "MFA", render: (_, account) => <MfaBadge enabled={account.mfaEnabled} /> },
    {
      key: "lastActiveAt",
      title: "Last active",
      sorter: true,
      render: (_, account) =>
        account.lastActiveAt ? formatDateTime(account.lastActiveAt) : "Never",
    },
    {
      key: "actions",
      title: <span className="ta-visually-hidden">Actions</span>,
      width: 56,
      render: (_, account) => (
        <RowActions
          ariaLabel={`Actions for ${account.displayName}`}
          items={[
            { key: "view", label: "View administrator", onSelect: () => setOpenId(account.id) },
            ...actionItems(account),
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
        subtitle="Named administrator accounts and their roles. Credentials are never stored or shown; in production, sign-in and MFA are enforced by the backend."
        actions={
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => setInviting(true)}>
            Invite administrator
          </Button>
        }
      />
      <DataTable<AdminAccount>
        ariaLabel="Administrators"
        columns={columns}
        rowKey="id"
        {...table}
        onRowClick={(account) => setOpenId(account.id)}
        emptyTitle="No administrators match"
        toolbar={
          <FilterBar<AdminAccountFilters>
            search={{
              ...search,
              ariaLabel: "Search administrators",
              placeholder: "Search name or email",
            }}
            filters={[
              { type: "select", key: "role", label: "Role", options: ROLE_OPTIONS, width: 220 },
              { type: "select", key: "status", label: "Status", options: toOptions(ADMIN_STATUS) },
            ]}
            {...filterBar}
          />
        }
      />
      <AdminDrawer id={openId} onClose={() => setOpenId(null)} actionItems={actionItems} />

      <FormModal<AdminInvite>
        open={inviting}
        title="Invite administrator"
        description="Records an invitation in the demo. No email is sent. Use a fictional @demo.trenderalert.test address."
        submitLabel="Record invitation"
        initialValues={{ role: "support_agent" }}
        onClose={() => setInviting(false)}
        onSubmit={async (values) => {
          await run(dispatch(inviteAdmin(values)).unwrap(), {
            success: `Invitation recorded for ${values.displayName.trim()}`,
            audit: (created) => ({
              action: "adminUser.invite",
              targetType: "adminUser",
              targetId: created.id,
              summary: `Invited ${created.displayName} as ${ROLE_LABELS[created.role]}`,
            }),
            after: () => refetch(),
          });
        }}
      >
        <Form.Item
          name="displayName"
          label="Full name"
          rules={[{ required: true, whitespace: true, min: 3, max: 80 }]}
        >
          <Input maxLength={80} />
        </Form.Item>
        <Form.Item
          name="email"
          label="Work email"
          rules={[
            { required: true, type: "email", message: "Enter a valid email address." },
            {
              validator: (_, value?: string) =>
                !value || value.trim().toLowerCase().endsWith("@demo.trenderalert.test")
                  ? Promise.resolve()
                  : Promise.reject(new Error("Use a fictional @demo.trenderalert.test address.")),
            },
          ]}
        >
          <Input placeholder="name@demo.trenderalert.test" />
        </Form.Item>
        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
          <Select options={ROLE_OPTIONS} />
        </Form.Item>
      </FormModal>

      <FormModal<{ role: AdminRole; reason: string }>
        open={roleTarget !== null}
        title={roleTarget ? `Change role for ${roleTarget.displayName}` : "Change role"}
        description={
          roleTarget
            ? `Current role: ${ROLE_LABELS[roleTarget.role]}. The new role applies at their next request.`
            : undefined
        }
        submitLabel="Change role"
        initialValues={roleTarget ? { role: roleTarget.role } : undefined}
        onClose={() => setRoleTarget(null)}
        onSubmit={async ({ role, reason }) => {
          if (!roleTarget) return;
          await run(dispatch(changeAdminRole({ id: roleTarget.id, role, reason })).unwrap(), {
            success: `${roleTarget.displayName} is now ${ROLE_LABELS[role]}`,
            audit: (updated) => ({
              action: "adminUser.change_role",
              targetType: "adminUser",
              targetId: updated.id,
              summary: `Changed ${updated.displayName}'s role from ${ROLE_LABELS[roleTarget.role]} to ${ROLE_LABELS[role]}`,
              reason,
            }),
            after,
          });
        }}
      >
        <Form.Item
          name="role"
          label="New role"
          rules={[{ required: true }]}
          extra="Each role grants only the permissions its job needs."
        >
          <Select
            options={ROLE_OPTIONS.map((option) => ({
              ...option,
              title: ROLE_DESCRIPTIONS[option.value],
            }))}
          />
        </Form.Item>
        <Form.Item
          name="reason"
          label="Reason"
          rules={[
            { required: true, whitespace: true, min: 10, message: "Enter at least 10 characters." },
          ]}
        >
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} maxLength={500} showCount />
        </Form.Item>
      </FormModal>
      {dialog}
    </>
  );
}

function AdminDrawer({
  id,
  onClose,
  actionItems,
}: {
  id: string | null;
  onClose: () => void;
  actionItems: (account: AdminAccount) => RowActionItem[];
}) {
  const dispatch = useAppDispatch();
  const account = useAppSelector((state) => adminUsersSelectors.selectById(state, id));
  const detail = useAppSelector(adminUsersSelectors.selectDetail);

  useEffect(() => {
    if (id) dispatch(fetchAdminUser(id));
  }, [dispatch, id]);

  return (
    <DetailDrawer
      open={Boolean(id)}
      onClose={onClose}
      title={account?.displayName ?? id ?? ""}
      subtitle={account ? `${account.email} · Demo account` : undefined}
      status={account ? <StatusBadge {...ADMIN_STATUS[account.status]} /> : null}
      loadStatus={account ? "succeeded" : detail.id === id ? detail.status : "loading"}
      error={detail.error}
      onRetry={() => id && dispatch(fetchAdminUser(id))}
      actions={account ? <ActionButtons items={actionItems(account)} /> : null}
    >
      {account ? (
        <>
          <DetailSection title="Access">
            <DetailList
              items={[
                { key: "role", label: "Role", value: ROLE_LABELS[account.role] },
                {
                  key: "mfa",
                  label: "Multi-factor authentication",
                  value: <MfaBadge enabled={account.mfaEnabled} />,
                },
                {
                  key: "scope",
                  label: "Role scope",
                  value: ROLE_DESCRIPTIONS[account.role],
                  wide: true,
                },
                { key: "created", label: "Created", value: formatDateTime(account.createdAt) },
                {
                  key: "active",
                  label: "Last active",
                  value: account.lastActiveAt ? formatDateTime(account.lastActiveAt) : "Never",
                },
              ]}
            />
          </DetailSection>
          <DetailSection title="Account history">
            <Timeline entries={account.history} />
          </DetailSection>
        </>
      ) : null}
    </DetailDrawer>
  );
}
