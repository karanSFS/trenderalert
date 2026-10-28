"use client";

import { LockOutlined, ReloadOutlined, WarningOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { ReactNode } from "react";
import { StateMessage } from "./StateMessage";

interface ErrorStateProps {
  title?: string;
  message?: ReactNode;
  onRetry?: () => void;
  retrying?: boolean;
  compact?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  message = "The request could not be completed.",
  onRetry,
  retrying = false,
  compact,
}: ErrorStateProps) {
  return (
    <StateMessage
      icon={<WarningOutlined />}
      title={title}
      description={message}
      role="alert"
      compact={compact}
      action={
        onRetry ? (
          <Button icon={<ReloadOutlined />} onClick={onRetry} loading={retrying}>
            Try again
          </Button>
        ) : null
      }
    />
  );
}

interface AccessDeniedStateProps {
  description?: ReactNode;
  action?: ReactNode;
}

export function AccessDeniedState({ description, action }: AccessDeniedStateProps) {
  return (
    <StateMessage
      icon={<LockOutlined />}
      title="Not available for your role"
      description={
        description ??
        "Your demo role does not include this area. Switch roles from the profile menu to explore it."
      }
      action={action}
      role="alert"
    />
  );
}
