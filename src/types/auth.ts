import type { EntityId, IsoDateString } from "./common";

export type AdminRole =
  "super_admin" | "content_moderator" | "support_agent" | "finance_admin" | "contest_admin";

export type Permission =
  | "dashboard:view"
  | "operations:view"
  | "users:view"
  | "users:manage"
  | "content:view"
  | "content:moderate"
  | "trends:view"
  | "trends:manage"
  | "discovery:view"
  | "discovery:manage"
  | "moderation:view"
  | "moderation:act"
  | "appeals:view"
  | "appeals:decide"
  | "copyright:view"
  | "copyright:manage"
  | "contests:view"
  | "contests:manage"
  | "subscriptions:view"
  | "finance:view"
  | "finance:manage"
  | "support:view"
  | "support:manage"
  | "configuration:view"
  | "configuration:manage"
  | "security:manage-admins"
  | "audit:view";

/** The signed-in administrator as returned by the session endpoints. Never contains tokens. */
export interface AdminIdentity {
  id: EntityId;
  displayName: string;
  email: string;
  username: string;
  role: AdminRole;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

/** Fictional administrator in the demo directory data. Contains no credentials. */
export interface DemoAdminAccount {
  id: EntityId;
  displayName: string;
  email: string;
  role: AdminRole;
  title: string;
  lastActiveAt: IsoDateString;
}
