"use client";

import {
  CheckCircleOutlined,
  EyeOutlined,
  PauseCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { ConfirmSpec } from "@/components/ui/useConfirm";
import type { RowActionItem } from "@/components/ui/RowActions";
import { enforceUser } from "@/features/users/usersSlice";
import type { PlatformUser, UserEnforcementAction } from "@/features/users/usersTypes";
import { useDemoAction } from "@/lib/hooks/useDemoAction";
import { useAppDispatch } from "@/store/hooks";

const SPECS: Record<
  UserEnforcementAction,
  {
    title: (user: PlatformUser) => string;
    label: string;
    consequences: string[];
    past: string;
    danger: boolean;
  }
> = {
  restrict: {
    title: (user) => `Restrict @${user.username}`,
    label: "Restrict account",
    past: "restricted",
    danger: true,
    consequences: [
      "Posting, commenting and messaging are limited.",
      "The member can still sign in, view content and appeal.",
      "Adds a strike and is recorded in the demo audit log.",
    ],
  },
  suspend: {
    title: (user) => `Suspend @${user.username}`,
    label: "Suspend account",
    past: "suspended",
    danger: true,
    consequences: [
      "The member cannot sign in, post or message.",
      "Their Trends and posts are hidden while suspended.",
      "Adds a strike and is recorded in the demo audit log.",
    ],
  },
  reinstate: {
    title: (user) => `Reinstate @${user.username}`,
    label: "Reinstate account",
    past: "reinstated",
    danger: false,
    consequences: ["Restores normal account access.", "Existing strikes remain on record."],
  },
};

/** Eligibility rules shared by the directory and the detail page. */
export function userActionBlock(user: PlatformUser, action: UserEnforcementAction): string | null {
  if (user.status === "pending_deletion") return "Accounts pending deletion are read-only.";
  if (action === "restrict" && user.status !== "active")
    return "Only active accounts can be restricted.";
  if (action === "suspend" && user.status === "suspended") return "Already suspended.";
  if (action === "reinstate" && user.status !== "restricted" && user.status !== "suspended") {
    return "Only restricted or suspended accounts can be reinstated.";
  }
  return null;
}

/** Builds confirmation specs and row actions for account enforcement. */
export function useUserActions(confirm: (spec: ConfirmSpec) => void, after: () => void) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { run } = useDemoAction();

  const openConfirm = (user: PlatformUser, action: UserEnforcementAction) => {
    const spec = SPECS[action];
    confirm({
      title: spec.title(user),
      description: "This is a simulated action on a fictional demo account.",
      consequences: spec.consequences,
      confirmLabel: spec.label,
      danger: spec.danger,
      requireReason: true,
      onConfirm: (reason) =>
        run(dispatch(enforceUser({ id: user.id, action, reason: reason ?? "" })).unwrap(), {
          success: `@${user.username} ${spec.past}`,
          audit: (updated) => ({
            action: `user.${action}`,
            targetType: "user",
            targetId: updated.id,
            summary: `${spec.label} @${updated.username}`,
            reason,
          }),
          after,
        }),
    });
  };

  const rowActions = (user: PlatformUser): RowActionItem[] => [
    {
      key: "view",
      label: "View details",
      icon: <EyeOutlined />,
      onSelect: () => router.push(`/admin/users/${user.id}`),
    },
    ...(["restrict", "suspend", "reinstate"] as const).map((action) => {
      const blocked = userActionBlock(user, action);
      return {
        key: action,
        label: SPECS[action].label,
        icon:
          action === "restrict" ? (
            <PauseCircleOutlined />
          ) : action === "suspend" ? (
            <StopOutlined />
          ) : (
            <CheckCircleOutlined />
          ),
        permission: "users:manage" as const,
        danger: SPECS[action].danger,
        disabled: blocked !== null,
        disabledReason: blocked ?? undefined,
        onSelect: () => openConfirm(user, action),
      };
    }),
  ];

  return { openConfirm, rowActions };
}
