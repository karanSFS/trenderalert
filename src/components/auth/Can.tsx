"use client";

import type { ReactNode } from "react";
import { usePermission } from "@/features/auth/usePermission";
import type { Permission } from "@/types/auth";

interface CanProps {
  permission: Permission;
  children: ReactNode;
  /** Rendered when the role lacks the permission, e.g. a disabled control with an explanation. */
  fallback?: ReactNode;
}

/** Action-level UI restriction for the current demo role. */
export function Can({ permission, children, fallback = null }: CanProps) {
  return <>{usePermission(permission) ? children : fallback}</>;
}
