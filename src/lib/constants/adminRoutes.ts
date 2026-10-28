import type { Permission } from "@/types/auth";

export type AdminRouteKey =
  | "dashboard"
  | "operations"
  | "users"
  | "userDetail"
  | "content"
  | "trends"
  | "discovery"
  | "moderation"
  | "moderationDetail"
  | "appeals"
  | "copyright"
  | "contests"
  | "contestDetail"
  | "subscriptions"
  | "finance"
  | "financeTransactions"
  | "financeReconciliation"
  | "support"
  | "configuration"
  | "featureFlags"
  | "adminUsers"
  | "auditLogs";

export interface AdminRouteDefinition {
  key: AdminRouteKey;
  /** Path pattern. Dynamic segments use the `[param]` form. */
  path: string;
  label: string;
  description: string;
  permission: Permission;
  /** Implementation phase from the master specification; used by the interim placeholder. */
  phase: number;
  parent?: AdminRouteKey;
}

/**
 * Single registry of admin routes. Navigation, breadcrumbs, page titles and route-level
 * permission checks are all derived from this list.
 */
export const ADMIN_ROUTES: Record<AdminRouteKey, AdminRouteDefinition> = {
  dashboard: {
    key: "dashboard",
    path: "/admin/dashboard",
    label: "Dashboard",
    description: "Platform status at a glance using demo metrics.",
    permission: "dashboard:view",
    phase: 4,
  },
  operations: {
    key: "operations",
    path: "/admin/operations",
    label: "Operations",
    description: "Service health, queues and operational alerts.",
    permission: "operations:view",
    phase: 6,
  },
  users: {
    key: "users",
    path: "/admin/users",
    label: "Users",
    description: "Search accounts and apply authorized status changes.",
    permission: "users:view",
    phase: 5,
  },
  userDetail: {
    key: "userDetail",
    path: "/admin/users/[id]",
    label: "User details",
    description: "Profile, status, subscription, moderation and audit history.",
    permission: "users:view",
    phase: 5,
    parent: "users",
  },
  content: {
    key: "content",
    path: "/admin/content",
    label: "Content",
    description: "Trends and Profile Posts with visibility and moderation status.",
    permission: "content:view",
    phase: 5,
  },
  trends: {
    key: "trends",
    path: "/admin/trends",
    label: "Trends",
    description: "TrendScore, lifecycle, geographic scope and authorized trend actions.",
    permission: "trends:view",
    phase: 5,
  },
  discovery: {
    key: "discovery",
    path: "/admin/discovery",
    label: "Discovery",
    description: "Markets, featured locations, freshness and ranking configuration.",
    permission: "discovery:view",
    phase: 6,
  },
  moderation: {
    key: "moderation",
    path: "/admin/moderation",
    label: "Moderation queue",
    description: "Review reports, assign reviewers and apply policy actions.",
    permission: "moderation:view",
    phase: 5,
  },
  moderationDetail: {
    key: "moderationDetail",
    path: "/admin/moderation/[id]",
    label: "Case details",
    description: "Report details, related content, notes and case history.",
    permission: "moderation:view",
    phase: 5,
    parent: "moderation",
  },
  appeals: {
    key: "appeals",
    path: "/admin/appeals",
    label: "Appeals",
    description: "Review original decisions and record appeal outcomes.",
    permission: "appeals:view",
    phase: 5,
  },
  copyright: {
    key: "copyright",
    path: "/admin/copyright",
    label: "Copyright",
    description: "Notices, affected content, deadlines and resolution history.",
    permission: "copyright:view",
    phase: 5,
  },
  contests: {
    key: "contests",
    path: "/admin/contests",
    label: "Contests",
    description: "Contest approval, rules, entries, disputes and payout status.",
    permission: "contests:view",
    phase: 6,
  },
  contestDetail: {
    key: "contestDetail",
    path: "/admin/contests/[id]",
    label: "Contest details",
    description: "Approval states, eligibility, prizes and entries.",
    permission: "contests:view",
    phase: 6,
    parent: "contests",
  },
  subscriptions: {
    key: "subscriptions",
    path: "/admin/subscriptions",
    label: "Subscriptions",
    description: "Provider, renewal and entitlement status.",
    permission: "subscriptions:view",
    phase: 6,
  },
  finance: {
    key: "finance",
    path: "/admin/finance",
    label: "Finance overview",
    description: "Simulated transaction volume and financial exceptions.",
    permission: "finance:view",
    phase: 6,
  },
  financeTransactions: {
    key: "financeTransactions",
    path: "/admin/finance/transactions",
    label: "Transactions",
    description: "Transactions, refunds and chargebacks (demo data).",
    permission: "finance:view",
    phase: 6,
    parent: "finance",
  },
  financeReconciliation: {
    key: "financeReconciliation",
    path: "/admin/finance/reconciliation",
    label: "Reconciliation",
    description: "Internal records versus provider references and exceptions.",
    permission: "finance:view",
    phase: 6,
    parent: "finance",
  },
  support: {
    key: "support",
    path: "/admin/support",
    label: "Support cases",
    description: "Case directory, assignment, notes and escalation.",
    permission: "support:view",
    phase: 6,
  },
  configuration: {
    key: "configuration",
    path: "/admin/configuration",
    label: "Platform settings",
    description: "Announcements, policy versions and approved settings.",
    permission: "configuration:view",
    phase: 6,
  },
  featureFlags: {
    key: "featureFlags",
    path: "/admin/configuration/feature-flags",
    label: "Feature flags",
    description: "Owner-controlled flags, including activation-gated features.",
    permission: "configuration:view",
    phase: 6,
    parent: "configuration",
  },
  adminUsers: {
    key: "adminUsers",
    path: "/admin/security/admin-users",
    label: "Admin users",
    description: "Administrator accounts and role assignments.",
    permission: "security:manage-admins",
    phase: 6,
  },
  auditLogs: {
    key: "auditLogs",
    path: "/admin/security/audit-logs",
    label: "Audit logs",
    description: "Recorded administrative actions.",
    permission: "audit:view",
    phase: 6,
  },
};

function patternToRegExp(pattern: string): RegExp {
  const source = pattern
    .split("/")
    .map((segment) =>
      /^\[.+\]$/.test(segment) ? "[^/]+" : segment.replace(/[.*+?^${}()|\\]/g, "\\$&"),
    )
    .join("/");
  return new RegExp(`^${source}/?$`);
}

const ROUTE_MATCHERS = Object.values(ADMIN_ROUTES).map((route) => ({
  route,
  regex: patternToRegExp(route.path),
}));

export function matchAdminRoute(pathname: string): AdminRouteDefinition | undefined {
  return ROUTE_MATCHERS.find(({ regex }) => regex.test(pathname))?.route;
}

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

/** Builds breadcrumbs from the route registry, e.g. Users / u-1042 for `/admin/users/u-1042`. */
export function buildAdminBreadcrumbs(pathname: string): BreadcrumbEntry[] {
  const route = matchAdminRoute(pathname);
  if (!route) return [{ label: "Not found" }];

  const chain: AdminRouteDefinition[] = [];
  let current: AdminRouteDefinition | undefined = route;
  while (current) {
    chain.unshift(current);
    current = current.parent ? ADMIN_ROUTES[current.parent] : undefined;
  }

  return chain.map((entry, index) => {
    const isLast = index === chain.length - 1;
    const isDynamic = entry.path.includes("[");
    const label = isDynamic
      ? (pathname.split("/").filter(Boolean).pop() ?? entry.label)
      : entry.label;
    return { label, href: isLast ? undefined : entry.path };
  });
}
