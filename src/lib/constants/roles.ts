import type { AdminRole, Permission } from "@/types/auth";

export const ADMIN_ROLES: AdminRole[] = [
  "super_admin",
  "content_moderator",
  "support_agent",
  "finance_admin",
  "contest_admin",
];

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Administrator",
  content_moderator: "Content Moderator",
  support_agent: "Support Agent",
  finance_admin: "Finance Administrator",
  contest_admin: "Contest Administrator",
};

/** Summaries follow the "Roles and permissions" table in the Version 13 specification. */
export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  super_admin: "Manages roles and system configuration. Every action is audited.",
  content_moderator: "Reviews reports and applies policy actions with audit logs.",
  support_agent:
    "Handles support cases with limited account metadata. No secrets or payment credentials.",
  finance_admin: "Reconciles transactions, refunds, fees and payouts. No moderation authority.",
  contest_admin: "Manages approved contests within locked rules.",
};

const ALL_PERMISSIONS: Permission[] = [
  "dashboard:view",
  "operations:view",
  "users:view",
  "users:manage",
  "content:view",
  "content:moderate",
  "trends:view",
  "trends:manage",
  "discovery:view",
  "discovery:manage",
  "moderation:view",
  "moderation:act",
  "appeals:view",
  "appeals:decide",
  "copyright:view",
  "copyright:manage",
  "contests:view",
  "contests:manage",
  "subscriptions:view",
  "finance:view",
  "finance:manage",
  "support:view",
  "support:manage",
  "configuration:view",
  "configuration:manage",
  "security:manage-admins",
  "audit:view",
];

/**
 * Centralized UI permission map. This only controls what the demo frontend shows; real
 * authorization must be enforced by the backend.
 */
export const ROLE_PERMISSIONS: Record<AdminRole, readonly Permission[]> = {
  super_admin: ALL_PERMISSIONS,
  content_moderator: [
    "dashboard:view",
    "users:view",
    "content:view",
    "content:moderate",
    "trends:view",
    "trends:manage",
    "moderation:view",
    "moderation:act",
    "appeals:view",
    "appeals:decide",
    "copyright:view",
    "copyright:manage",
  ],
  support_agent: [
    "dashboard:view",
    "users:view",
    "support:view",
    "support:manage",
    "subscriptions:view",
  ],
  finance_admin: [
    "dashboard:view",
    "subscriptions:view",
    "finance:view",
    "finance:manage",
    "contests:view",
  ],
  contest_admin: ["dashboard:view", "contests:view", "contests:manage", "content:view"],
};

export function roleHasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
