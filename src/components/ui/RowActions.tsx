"use client";

import { MoreOutlined } from "@ant-design/icons";
import { Button, Dropdown, type MenuProps } from "antd";
import type { ReactNode } from "react";
import { usePermissionChecker } from "@/features/auth/usePermission";
import type { Permission } from "@/types/auth";

export interface RowActionItem {
  key: string;
  label: string;
  icon?: ReactNode;
  /** Hidden when the current demo role lacks this permission. */
  permission?: Permission;
  danger?: boolean;
  disabled?: boolean;
  /** Shown as the item's tooltip text when disabled, e.g. a business-rule explanation. */
  disabledReason?: string;
  onSelect: () => void;
}

interface RowActionsProps {
  /** e.g. "Actions for @lina.draws". */
  ariaLabel: string;
  items: RowActionItem[];
}

/** Per-row action menu. Items the role cannot perform are removed rather than shown disabled. */
export function RowActions({ ariaLabel, items }: RowActionsProps) {
  const can = usePermissionChecker();
  const visible = items.filter((item) => !item.permission || can(item.permission));
  if (visible.length === 0) return null;

  const menuItems: MenuProps["items"] = visible.map((item) => ({
    key: item.key,
    icon: item.icon,
    danger: item.danger,
    disabled: item.disabled,
    title: item.disabled ? item.disabledReason : undefined,
    label: item.label,
    onClick: ({ domEvent }) => {
      domEvent.stopPropagation();
      item.onSelect();
    },
  }));

  return (
    <span
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
        <Button type="text" size="small" icon={<MoreOutlined />} aria-label={ariaLabel} />
      </Dropdown>
    </span>
  );
}
