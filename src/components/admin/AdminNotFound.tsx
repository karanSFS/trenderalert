"use client";

import { CompassOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useRouter } from "next/navigation";
import { StateMessage } from "@/components/ui/StateMessage";
import { ADMIN_HOME_PATH } from "@/lib/constants/app";

export function AdminNotFound() {
  const router = useRouter();
  return (
    <StateMessage
      icon={<CompassOutlined />}
      title="Admin page not found"
      description="This admin address does not exist or has moved."
      role="alert"
      action={
        <Button type="primary" onClick={() => router.push(ADMIN_HOME_PATH)}>
          Go to dashboard
        </Button>
      }
    />
  );
}
