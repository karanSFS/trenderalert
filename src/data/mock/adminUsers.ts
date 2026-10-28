import type { DemoAdminAccount } from "@/types/auth";

/**
 * Fictional demo administrators, one per role. The `.test` domain is reserved and cannot
 * receive mail. These records contain no passwords or secrets.
 */
export const DEMO_ADMIN_ACCOUNTS: DemoAdminAccount[] = [
  {
    id: "adm-001",
    displayName: "Avery Collins",
    email: "avery.collins@demo.trenderalert.test",
    role: "super_admin",
    title: "Platform Owner (demo)",
    lastActiveAt: "2026-10-27T16:42:00Z",
  },
  {
    id: "adm-002",
    displayName: "Jordan Reyes",
    email: "jordan.reyes@demo.trenderalert.test",
    role: "content_moderator",
    title: "Trust & Safety Reviewer (demo)",
    lastActiveAt: "2026-10-28T08:15:00Z",
  },
  {
    id: "adm-003",
    displayName: "Priya Natarajan",
    email: "priya.natarajan@demo.trenderalert.test",
    role: "support_agent",
    title: "Member Support (demo)",
    lastActiveAt: "2026-10-28T07:03:00Z",
  },
  {
    id: "adm-004",
    displayName: "Marcus Bell",
    email: "marcus.bell@demo.trenderalert.test",
    role: "finance_admin",
    title: "Finance Operations (demo)",
    lastActiveAt: "2026-10-26T19:28:00Z",
  },
  {
    id: "adm-005",
    displayName: "Sofia Laurent",
    email: "sofia.laurent@demo.trenderalert.test",
    role: "contest_admin",
    title: "Contest Programs (demo)",
    lastActiveAt: "2026-10-25T13:51:00Z",
  },
];
