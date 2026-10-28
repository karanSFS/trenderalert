import type { AdminAccount } from "@/features/security/securityTypes";
import { DEMO_ADMIN_ACCOUNTS } from "./adminUsers";

/**
 * Administrator directory: the five demo sign-in accounts plus fictional colleagues.
 * No passwords, tokens or MFA secrets are stored; MFA is shown as a status only.
 */
export const ADMIN_DIRECTORY: readonly AdminAccount[] = [
  ...DEMO_ADMIN_ACCOUNTS.map((account, index) => ({
    id: account.id,
    displayName: account.displayName,
    email: account.email,
    role: account.role,
    status: "active" as const,
    mfaEnabled: true,
    createdAt: `2026-0${index + 1}-1${index}T09:00:00Z`,
    lastActiveAt: account.lastActiveAt,
    history: [
      {
        id: `${account.id}-h1`,
        at: `2026-0${index + 1}-1${index}T09:00:00Z`,
        actor: "Avery Collins",
        title: "Account created",
        detail: "MFA enrolled",
        tone: "success" as const,
      },
    ],
  })),
  {
    id: "adm-006",
    displayName: "Hana Moreau",
    email: "hana.moreau@demo.trenderalert.test",
    role: "content_moderator",
    status: "active",
    mfaEnabled: true,
    createdAt: "2026-05-04T09:00:00Z",
    lastActiveAt: "2026-10-27T22:10:00Z",
    history: [
      {
        id: "adm-006-h1",
        at: "2026-05-04T09:00:00Z",
        actor: "Avery Collins",
        title: "Account created",
        tone: "success",
      },
    ],
  },
  {
    id: "adm-007",
    displayName: "Dmitri Volkov",
    email: "dmitri.volkov@demo.trenderalert.test",
    role: "content_moderator",
    status: "active",
    mfaEnabled: false,
    createdAt: "2026-07-21T09:00:00Z",
    lastActiveAt: "2026-10-24T11:45:00Z",
    history: [
      {
        id: "adm-007-h1",
        at: "2026-07-21T09:00:00Z",
        actor: "Avery Collins",
        title: "Account created",
        detail: "MFA enrollment pending",
        tone: "warning",
      },
    ],
  },
  {
    id: "adm-008",
    displayName: "Tomas Wexford",
    email: "tomas.wexford@demo.trenderalert.test",
    role: "support_agent",
    status: "active",
    mfaEnabled: true,
    createdAt: "2026-06-02T09:00:00Z",
    lastActiveAt: "2026-10-27T18:02:00Z",
    history: [
      {
        id: "adm-008-h1",
        at: "2026-06-02T09:00:00Z",
        actor: "Avery Collins",
        title: "Account created",
        tone: "success",
      },
    ],
  },
  {
    id: "adm-009",
    displayName: "Leah Okafor",
    email: "leah.okafor@demo.trenderalert.test",
    role: "support_agent",
    status: "active",
    mfaEnabled: true,
    createdAt: "2026-06-16T09:00:00Z",
    lastActiveAt: "2026-10-27T20:30:00Z",
    history: [
      {
        id: "adm-009-h1",
        at: "2026-06-16T09:00:00Z",
        actor: "Avery Collins",
        title: "Account created",
        tone: "success",
      },
    ],
  },
  {
    id: "adm-010",
    displayName: "Ruben Castillo",
    email: "ruben.castillo@demo.trenderalert.test",
    role: "finance_admin",
    status: "invited",
    mfaEnabled: false,
    createdAt: "2026-10-25T09:00:00Z",
    lastActiveAt: null,
    history: [
      {
        id: "adm-010-h1",
        at: "2026-10-25T09:00:00Z",
        actor: "Avery Collins",
        title: "Invitation sent",
        tone: "info",
      },
    ],
  },
  {
    id: "adm-011",
    displayName: "Grace Lindqvist",
    email: "grace.lindqvist@demo.trenderalert.test",
    role: "content_moderator",
    status: "deactivated",
    mfaEnabled: true,
    createdAt: "2026-02-08T09:00:00Z",
    lastActiveAt: "2026-08-30T16:00:00Z",
    history: [
      {
        id: "adm-011-h1",
        at: "2026-02-08T09:00:00Z",
        actor: "Avery Collins",
        title: "Account created",
        tone: "success",
      },
      {
        id: "adm-011-h2",
        at: "2026-09-01T09:00:00Z",
        actor: "Avery Collins",
        title: "Account deactivated",
        detail: "Contract ended.",
        tone: "error",
      },
    ],
  },
];
