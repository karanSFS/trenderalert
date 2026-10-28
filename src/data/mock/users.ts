import type {
  PlatformUser,
  SubscriptionPlan,
  UserStatus,
  VerificationStatus,
} from "@/features/users/usersTypes";
import {
  addDays,
  createRng,
  DEMO_AS_OF,
  daysAgo,
  FIRST_NAMES,
  HANDLE_SUFFIXES,
  LAST_NAMES,
  PLACES,
} from "./seed";

/** Number of sample accounts in the demo directory (a sample, not the platform total). */
export const USER_SAMPLE_SIZE = 60;

/** Fixed account statuses so moderation outcomes can point at matching users. */
const STATUS_OVERRIDES: Record<number, UserStatus> = {
  3: "restricted",
  11: "restricted",
  19: "restricted",
  27: "restricted",
  35: "restricted",
  7: "suspended",
  23: "suspended",
  39: "suspended",
  15: "pending_deletion",
  31: "pending_deletion",
  52: "pending_deletion",
};

/** Accounts referenced by name on the dashboard. */
const NAMED_ACCOUNTS: Record<number, { username: string; displayName: string }> = {
  43: { username: "riverton.official", displayName: "Riverton Official" },
  44: { username: "deal.drop.daily", displayName: "Deal Drop Daily" },
};

const RESTRICTION_REASONS = [
  "Repeated spam links in Trend comments",
  "Harassment of another member in messages",
  "Posting misleading health claims after a warning",
  "Coordinated share inflation detected",
];

function generateUsers(): PlatformUser[] {
  const rng = createRng(1001);
  const users: PlatformUser[] = [];

  for (let index = 0; index < USER_SAMPLE_SIZE; index += 1) {
    const first = FIRST_NAMES[index % FIRST_NAMES.length];
    const last =
      LAST_NAMES[(index * 7 + Math.floor(index / FIRST_NAMES.length) * 3) % LAST_NAMES.length];
    const suffix = HANDLE_SUFFIXES[(index * 3) % HANDLE_SUFFIXES.length];
    const named = NAMED_ACCOUNTS[index];
    const username =
      named?.username ?? `${first.toLowerCase()}.${suffix}${index >= 30 ? index : ""}`;
    const displayName = named?.displayName ?? `${first} ${last}`;
    const status = STATUS_OVERRIDES[index] ?? "active";

    const plan = rng.weighted<SubscriptionPlan>([
      ["free", 74],
      ["premium_monthly", 16],
      ["premium_yearly", 10],
    ]);
    const verification = rng.weighted<VerificationStatus>([
      ["verified", 20],
      ["pending", 10],
      ["unverified", 70],
    ]);
    const registeredAt = daysAgo(rng.int(4, 720));
    const enforcedAt = daysAgo(rng.int(1, 28));
    const requestedAt = daysAgo(rng.int(2, 24));

    users.push({
      id: `usr-${1001 + index}`,
      username,
      displayName,
      email: `${username.replace(/\./g, "_")}@members.demo.test`,
      registeredAt,
      approximateLocation: rng.pick(PLACES),
      status,
      subscription: {
        plan,
        store: plan === "free" ? null : rng.pick(["ios", "android"] as const),
        renewsAt:
          plan === "free" || status === "pending_deletion"
            ? null
            : addDays(DEMO_AS_OF, plan === "premium_yearly" ? rng.int(30, 360) : rng.int(1, 30)),
      },
      verification: named ? "unverified" : verification,
      followers: Math.round(rng.next() ** 3 * 48_000) + 12,
      trendsPublished: rng.int(0, 64),
      reportsReceived:
        status === "active"
          ? named
            ? rng.int(6, 14)
            : rng.weighted([
                [0, 70],
                [1, 18],
                [2, 8],
                [4, 4],
              ])
          : rng.int(3, 12),
      strikes: status === "suspended" ? 3 : status === "restricted" ? rng.int(1, 2) : 0,
      lastEnforcement:
        status === "restricted" || status === "suspended"
          ? {
              action: status,
              at: enforcedAt,
              by: rng.pick(["Jordan Reyes", "Avery Collins"]),
              reason: rng.pick(RESTRICTION_REASONS),
            }
          : null,
      deletion:
        status === "pending_deletion"
          ? { requestedAt, scheduledFor: addDays(requestedAt, 30) }
          : null,
    });
  }
  return users;
}

export const USERS: readonly PlatformUser[] = generateUsers();

export function userIdAt(index: number): string {
  return USERS[index % USERS.length].id;
}
