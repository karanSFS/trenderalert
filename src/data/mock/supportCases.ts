import type { CasePriority } from "@/features/dashboard/dashboardTypes";
import type { SupportCase, SupportCategory, SupportStatus } from "@/features/support/supportTypes";
import { addHours, createRng, hoursAgo } from "./seed";
import { USERS } from "./users";

export const SUPPORT_AGENTS = [
  { id: "adm-003", name: "Priya Natarajan" },
  { id: "adm-008", name: "Tomas Wexford" },
  { id: "adm-009", name: "Leah Okafor" },
] as const;

const SUBJECTS: Record<SupportCategory, string[]> = {
  account_access: [
    "Cannot sign in after changing phone",
    "Verification code never arrives",
    "Locked out after too many attempts",
  ],
  billing: [
    "Charged twice for Premium",
    "Premium not active after purchase",
    "How do I cancel my subscription?",
  ],
  content: ["My Trend disappeared", "Cannot upload a video", "Wrong location shown on my Trend"],
  safety: [
    "Someone keeps messaging me after I blocked them",
    "Account is impersonating me",
    "Threatening comments on my Trend",
  ],
  bug: ["App crashes when opening Trend Rooms", "Notifications arrive twice", "Map does not load"],
  privacy_request: [
    "Request a copy of my data",
    "Remove my approximate location",
    "Who can see my saved Trends?",
  ],
  deletion_request: [
    "Please delete my account",
    "Cancel my deletion request",
    "What happens to my content after deletion?",
  ],
};

/** Masks a contact address for support views (ADMIN-006). */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 2)}${"*".repeat(Math.max(3, local.length - 2))}@${domain}`;
}

const SUPPORT_CASE_COUNT = 34;

function generateSupportCases(): SupportCase[] {
  const rng = createRng(3318);
  const cases: SupportCase[] = [];

  for (let index = 0; index < SUPPORT_CASE_COUNT; index += 1) {
    const id = `sup-${3301 + index}`;
    const user = USERS[(index * 11 + 4) % USERS.length];
    const category = rng.weighted<SupportCategory>([
      ["account_access", 20],
      ["billing", 18],
      ["content", 16],
      ["safety", 12],
      ["bug", 14],
      ["privacy_request", 10],
      ["deletion_request", 10],
    ]);
    let status = rng.weighted<SupportStatus>([
      ["open", 34],
      ["pending_member", 18],
      ["escalated", 10],
      ["resolved", 38],
    ]);
    let priority = rng.weighted<CasePriority>([
      ["critical", 6],
      ["high", 22],
      ["medium", 44],
      ["low", 28],
    ]);
    let subject = rng.pick(SUBJECTS[category]);
    const fixed = id === "sup-3318";
    const generatedAt = hoursAgo(rng.int(2, 24 * 21));
    const createdAt = fixed ? "2026-10-27T09:05:00Z" : generatedAt;
    const agent = rng.chance(0.75) ? rng.pick(SUPPORT_AGENTS) : null;

    if (fixed) {
      status = "escalated";
      priority = "high";
      subject = "Someone keeps messaging me after I blocked them";
    }
    const finalCategory: SupportCategory = fixed ? "safety" : category;
    const assigned = fixed
      ? SUPPORT_AGENTS[0]
      : status === "open"
        ? agent
        : (agent ?? SUPPORT_AGENTS[index % 3]);
    const escalatedTo =
      status === "escalated"
        ? finalCategory === "billing"
          ? "finance"
          : finalCategory === "safety"
            ? "trust_safety"
            : finalCategory === "bug"
              ? "engineering"
              : "privacy"
        : null;

    const history: SupportCase["history"] = [
      {
        id: `${id}-h1`,
        at: createdAt,
        actor: "Member",
        title: "Case opened in the app",
        tone: "neutral",
      },
    ];
    if (assigned)
      history.push({
        id: `${id}-h2`,
        at: addHours(createdAt, 1),
        actor: assigned.name,
        title: `Assigned to ${assigned.name}`,
        tone: "info",
      });
    const notes: SupportCase["notes"] = [];
    if (fixed) {
      notes.push({
        id: `${id}-n1`,
        at: "2026-10-27T13:20:00Z",
        author: "Priya Natarajan",
        text: "Member blocked the sender twice; new accounts keep appearing. Escalating for account linkage review.",
      });
      history.push({
        id: `${id}-h3`,
        at: "2026-10-27T13:27:00Z",
        actor: "Priya Natarajan",
        title: "Escalated to Trust & Safety",
        detail: "Possible ban evasion; needs linked-account review.",
        tone: "warning",
      });
    } else if (status === "escalated" && escalatedTo) {
      history.push({
        id: `${id}-h3`,
        at: addHours(createdAt, 5),
        actor: assigned?.name ?? "Priya Natarajan",
        title: "Escalated",
        tone: "warning",
      });
    } else if (status === "pending_member") {
      notes.push({
        id: `${id}-n1`,
        at: addHours(createdAt, 3),
        author: assigned?.name ?? "Priya Natarajan",
        text: "Asked the member for the device model and app version.",
      });
    } else if (status === "resolved") {
      history.push({
        id: `${id}-h3`,
        at: addHours(createdAt, rng.int(4, 40)),
        actor: assigned?.name ?? "Priya Natarajan",
        title: "Resolved",
        tone: "success",
      });
    }

    cases.push({
      id,
      subject,
      category: finalCategory,
      priority,
      status,
      userId: user.id,
      username: user.username,
      maskedContact: maskEmail(user.email),
      assignedAgentId: assigned?.id ?? null,
      assignedAgentName: assigned?.name ?? null,
      escalatedTo,
      createdAt,
      updatedAt: history[history.length - 1].at,
      summary: `${subject}. Submitted from the in-app help form.`,
      notes,
      history,
    });
  }
  return cases.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const SUPPORT_CASES: readonly SupportCase[] = generateSupportCases();
