"use client";

import { FileSearchOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useRouter } from "next/navigation";
import type { AsyncStatus, ServiceError } from "@/types/api";
import { ErrorState } from "./ErrorState";
import { DetailSkeleton } from "./LoadingSkeleton";
import { StateMessage } from "./StateMessage";

interface RecordStateProps {
  status: AsyncStatus;
  error: ServiceError | null;
  onRetry: () => void;
  backHref: string;
  backLabel: string;
}

/** Loading, not-found and error states for full-page record views. */
export function RecordState({ status, error, onRetry, backHref, backLabel }: RecordStateProps) {
  const router = useRouter();
  if (status === "failed" && error?.code === "NOT_FOUND") {
    return (
      <StateMessage
        icon={<FileSearchOutlined />}
        title="Record not found"
        description={error.message}
        role="alert"
        action={<Button onClick={() => router.push(backHref)}>{backLabel}</Button>}
      />
    );
  }
  if (status === "failed") {
    return (
      <ErrorState
        title="This record could not be loaded"
        message={error?.message}
        onRetry={onRetry}
      />
    );
  }
  return <DetailSkeleton sections={3} />;
}
