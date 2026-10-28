import { ROLE_LABELS } from "@/lib/constants/roles";
import type { AdminUsersService } from "@/services/contracts/operationalServices";
import { assertEligible, assertReason, assertValid, db, findOrThrow, historyEntry } from "./db";
import { mockRequest } from "./mockDelay";
import { applyListQuery } from "./query";

const SERVICE = "adminUsers";
const DEMO_DOMAIN = "@demo.trenderalert.test";

let inviteSequence = 0;

const accountOf = (id: string) => findOrThrow(db.adminUsers, id, "Administrator");

const activeSuperAdmins = () =>
  db.adminUsers.filter((item) => item.role === "super_admin" && item.status === "active");

export const mockAdminUsersService: AdminUsersService = {
  list: (query) =>
    mockRequest(
      () =>
        applyListQuery(db.adminUsers, query, {
          searchFields: (item) => [item.id, item.displayName, item.email],
          filterPredicates: {
            role: (item, value) => item.role === value,
            status: (item, value) => item.status === value,
          },
          sortAccessors: {
            displayName: (item) => item.displayName,
            lastActiveAt: (item) => item.lastActiveAt,
            createdAt: (item) => item.createdAt,
          },
        }),
      { service: SERVICE },
    ),

  get: (id) => mockRequest(() => accountOf(id), { service: SERVICE }),

  invite: (invite, actor) =>
    mockRequest(
      () => {
        const name = invite.displayName.trim();
        const email = invite.email.trim().toLowerCase();
        assertValid(name.length >= 3, "Enter the administrator's full name.");
        assertValid(
          email.endsWith(DEMO_DOMAIN) && /^[a-z0-9._-]+@/.test(email),
          `Demo invitations must use a fictional ${DEMO_DOMAIN} address.`,
        );
        assertEligible(
          !db.adminUsers.some((item) => item.email === email),
          "An administrator with this email already exists.",
        );
        inviteSequence += 1;
        const account = {
          id: `adm-demo-${inviteSequence}`,
          displayName: name,
          email,
          role: invite.role,
          status: "invited" as const,
          mfaEnabled: false,
          createdAt: new Date().toISOString(),
          lastActiveAt: null,
          history: [
            historyEntry(
              actor.name,
              "Invitation recorded (demo)",
              `Role: ${ROLE_LABELS[invite.role]}. No email was sent.`,
              "info",
            ),
          ],
        };
        db.adminUsers.push(account);
        return account;
      },
      { service: SERVICE },
    ),

  changeRole: (id, role, reason, actor) =>
    mockRequest(
      () => {
        const account = accountOf(id);
        const trimmed = assertReason(reason);
        assertEligible(account.id !== actor.id, "You cannot change your own role.");
        assertEligible(
          account.status !== "deactivated",
          "Reactivate the account before changing its role.",
        );
        assertEligible(account.role !== role, "The account already has this role.");
        assertEligible(
          !(account.role === "super_admin" && activeSuperAdmins().length <= 1),
          "At least one active Super Admin is required.",
        );
        const previous = account.role;
        account.role = role;
        account.history.push(
          historyEntry(
            actor.name,
            `Role changed from ${ROLE_LABELS[previous]} to ${ROLE_LABELS[role]}`,
            trimmed,
            "warning",
          ),
        );
        return account;
      },
      { service: SERVICE },
    ),

  setActive: (id, active, reason, actor) =>
    mockRequest(
      () => {
        const account = accountOf(id);
        const trimmed = assertReason(reason);
        assertEligible(
          account.id !== actor.id,
          "You cannot deactivate or reactivate your own account.",
        );
        if (active) {
          assertEligible(account.status === "deactivated", "The account is not deactivated.");
        } else {
          assertEligible(account.status !== "deactivated", "The account is already deactivated.");
          assertEligible(
            !(account.role === "super_admin" && activeSuperAdmins().length <= 1),
            "At least one active Super Admin is required.",
          );
        }
        account.status = active ? "active" : "deactivated";
        account.history.push(
          historyEntry(
            actor.name,
            active ? "Account reactivated" : "Account deactivated",
            trimmed,
            active ? "success" : "error",
          ),
        );
        return account;
      },
      { service: SERVICE },
    ),
};
