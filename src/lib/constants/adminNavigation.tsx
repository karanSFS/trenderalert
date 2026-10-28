import {
  AlertOutlined,
  AuditOutlined,
  CompassOutlined,
  ControlOutlined,
  CopyrightOutlined,
  CreditCardOutlined,
  CustomerServiceOutlined,
  DashboardOutlined,
  DollarOutlined,
  FileImageOutlined,
  MonitorOutlined,
  RiseOutlined,
  SolutionOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import type { AdminRole } from "@/types/auth";
import { roleHasPermission } from "./roles";
import { ADMIN_ROUTES, type AdminRouteKey } from "./adminRoutes";

export interface AdminNavItem {
  route: AdminRouteKey;
  icon: ReactNode;
  /** Overrides the route label, e.g. for an expandable group heading. */
  label?: string;
  children?: AdminRouteKey[];
}

export interface AdminNavGroup {
  key: string;
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAVIGATION: AdminNavGroup[] = [
  {
    key: "overview",
    label: "Overview",
    items: [
      { route: "dashboard", icon: <DashboardOutlined /> },
      { route: "operations", icon: <MonitorOutlined /> },
    ],
  },
  {
    key: "community",
    label: "Community",
    items: [
      { route: "users", icon: <UserOutlined /> },
      { route: "content", icon: <FileImageOutlined /> },
      { route: "trends", icon: <RiseOutlined /> },
      { route: "discovery", icon: <CompassOutlined /> },
    ],
  },
  {
    key: "trust",
    label: "Trust & Safety",
    items: [
      { route: "moderation", icon: <AlertOutlined /> },
      { route: "appeals", icon: <SolutionOutlined /> },
      { route: "copyright", icon: <CopyrightOutlined /> },
    ],
  },
  {
    key: "commerce",
    label: "Contests & Finance",
    items: [
      { route: "contests", icon: <TrophyOutlined /> },
      { route: "subscriptions", icon: <CreditCardOutlined /> },
      {
        route: "finance",
        label: "Finance",
        icon: <DollarOutlined />,
        children: ["finance", "financeTransactions", "financeReconciliation"],
      },
    ],
  },
  {
    key: "support",
    label: "Support",
    items: [{ route: "support", icon: <CustomerServiceOutlined /> }],
  },
  {
    key: "platform",
    label: "Platform",
    items: [
      {
        route: "configuration",
        label: "Configuration",
        icon: <ControlOutlined />,
        children: ["configuration", "featureFlags"],
      },
      { route: "adminUsers", icon: <TeamOutlined /> },
      { route: "auditLogs", icon: <AuditOutlined /> },
    ],
  },
];

/** Navigation filtered to the routes the given role may open. Empty groups are dropped. */
export function getNavigationForRole(role: AdminRole): AdminNavGroup[] {
  const allowed = (key: AdminRouteKey) => roleHasPermission(role, ADMIN_ROUTES[key].permission);
  return ADMIN_NAVIGATION.map((group) => ({
    ...group,
    items: group.items
      .map((item) => (item.children ? { ...item, children: item.children.filter(allowed) } : item))
      .filter((item) => (item.children ? item.children.length > 0 : allowed(item.route))),
  })).filter((group) => group.items.length > 0);
}
