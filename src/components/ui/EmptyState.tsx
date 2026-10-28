"use client";

import { InboxOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";
import { StateMessage } from "./StateMessage";

interface EmptyStateProps {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  compact?: boolean;
}

export function EmptyState({
  title = "Nothing to show yet",
  description,
  action,
  icon = <InboxOutlined />,
  compact,
}: EmptyStateProps) {
  return (
    <StateMessage
      icon={icon}
      title={title}
      description={description}
      action={action}
      role="status"
      compact={compact}
    />
  );
}
