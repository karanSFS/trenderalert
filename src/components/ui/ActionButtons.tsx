"use client";

import { Button, Tooltip } from "antd";
import styled from "styled-components";
import { usePermissionChecker } from "@/features/auth/usePermission";
import type { RowActionItem } from "./RowActions";

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space(2)};
`;

interface ActionButtonsProps {
  items: RowActionItem[];
  size?: "small" | "middle";
}

/**
 * The same action items a row menu shows, as buttons. Items the role cannot perform are
 * removed; disabled items explain the business rule in a tooltip.
 */
export function ActionButtons({ items, size = "small" }: ActionButtonsProps) {
  const can = usePermissionChecker();
  const visible = items.filter((item) => !item.permission || can(item.permission));
  if (visible.length === 0) return null;
  return (
    <Bar>
      {visible.map((item) => (
        <Tooltip key={item.key} title={item.disabled ? item.disabledReason : undefined}>
          <Button
            size={size}
            icon={item.icon}
            danger={item.danger}
            disabled={item.disabled}
            onClick={item.onSelect}
          >
            {item.label}
          </Button>
        </Tooltip>
      ))}
    </Bar>
  );
}
