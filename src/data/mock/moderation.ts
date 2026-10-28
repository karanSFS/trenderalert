import type {
  CasePriority,
  CaseStatus,
  CaseTargetType,
  ModerationActionType,
  ModerationCase,
} from "@/features/moderation/moderationTypes";
import type { ContentItem } from "@/features/content/contentTypes";
import { CONTENT, CONTENT_IDS_BY_STATUS } from "./content";
import { DASHBOARD_DAILY, MODERATION_CATEGORY_WEIGHTS } from "./dashboard";
import { addHours, createRng, hoursAgo, splitByWeights } from "./seed";
import { USERS } from "./users";

const REVIEWERS = [
  { id: "adm-002", name: "Jordan Reyes" },
  { id: "adm-001", name: "Avery Collins" },
] as const;

const DETAILS: Record<string, string> = {
  "Spam or scams":
    "Reporters say the post links to an off-platform giveaway asking for payment details.",
  "Harassment or bullying": "Multiple members report targeted insults directed at one participant.",
  "Nudity or sexual content":
    "Reported as containing sexual content visible to a general audience.",
  "Hate speech": "Reported for slurs targeting a protected group in the caption.",
  Misinformation: "Reporters say the post presents an unverified health claim as fact.",
  "Violence or threats": "Reported for a message that appears to threaten another member.",
  Impersonation: "The account appears to present itself as an official organization.",
  Other: "Reported as off-topic and disruptive in a Trend Room.",
};

export const ACTION_LABELS: Record<ModerationActionType, string> = {
  dismiss: "Report dismissed",
  warn: "Warning issued",
  remove_content: "Content removed",
  limit_content: "Content visibility limited",
  restrict_account: "Account restricted",
  suspend_account: "Account suspended",
  escalate: "Escalated",
};

const contentById = new Map(CONTENT.map((item) => [item.id, item]));
const usernameOf = (userId: string) => USERS.find((user) => user.id === userId)?.username ?? userId;

function contentLabel(item: ContentItem) {
  return `${item.type === "trend" ? "Trend" : "Profile Post"} ${item.id}`;
}

interface Draft {
  category: string;
  priority: CasePriority;
  status: CaseStatus;
  targetType: CaseTargetType;
  contentId: string | null;
  accountId: string;
  reportedItemLabel: string;
  submittedAt: string;
  reviewer: (typeof REVIEWERS)[number] | null;
  outcome: ModerationActionType | null;
  outcomeAt?: string;
  outcomeReason?: string;
}

/** The seven most recent cases, matching the dashboard's pending list exactly. */
const DASHBOARD_CASES: (Draft & { id: string })[] = [
  {
    id: "mod-1041",
    category: "Other",
    priority: "low",
    status: "new",
    targetType: "room",
    contentId: null,
    accountId: "usr-1010",
    reportedItemLabel: "Trend Room room-447",
    submittedAt: "2026-10-26T19:02:00Z",
    reviewer: null,
    outcome: null,
  },
  {
    id: "mod-1042",
    category: "Nudity or sexual content",
    priority: "medium",
    status: "new",
    targetType: "content",
    contentId: "pst-22019",
    accountId: contentById.get("pst-22019")!.creatorId,
    reportedItemLabel: "Profile Post pst-22019",
    submittedAt: "2026-10-27T11:46:00Z",
    reviewer: null,
    outcome: null,
  },
  {
    id: "mod-1043",
    category: "Misinformation",
    priority: "medium",
    status: "new",
    targetType: "content",
    contentId: "trd-8790",
    accountId: contentById.get("trd-8790")!.creatorId,
    reportedItemLabel: "Trend trd-8790",
    submittedAt: "2026-10-27T15:18:00Z",
    reviewer: null,
    outcome: null,
  },
  {
    id: "mod-1044",
    category: "Impersonation",
    priority: "high",
    status: "in_review",
    targetType: "account",
    contentId: null,
    accountId: "usr-1044",
    reportedItemLabel: "Account @riverton.official",
    submittedAt: "2026-10-27T17:31:00Z",
    reviewer: REVIEWERS[0],
    outcome: null,
  },
  {
    id: "mod-1045",
    category: "Spam or scams",
    priority: "high",
    status: "new",
    targetType: "account",
    contentId: null,
    accountId: "usr-1045",
    reportedItemLabel: "Account @deal.drop.daily",
    submittedAt: "2026-10-27T20:05:00Z",
    reviewer: null,
    outcome: null,
  },
  {
    id: "mod-1046",
    category: "Violence or threats",
    priority: "critical",
    status: "in_review",
    targetType: "message",
    contentId: null,
    accountId: "usr-1033",
    reportedItemLabel: "Direct message thread",
    submittedAt: "2026-10-27T22:40:00Z",
    reviewer: REVIEWERS[0],
    outcome: null,
  },
  {
    id: "mod-1047",
    category: "Harassment or bullying",
    priority: "critical",
    status: "new",
    targetType: "content",
    contentId: "trd-8841",
    accountId: contentById.get("trd-8841")!.creatorId,
    reportedItemLabel: "Trend trd-8841 comments",
    submittedAt: "2026-10-27T23:12:00Z",
    reviewer: null,
    outcome: null,
  },
];

const OUTCOME_REASONS: Record<ModerationActionType, string> = {
  dismiss: "No policy violation found after review.",
  warn: "First violation; member warned about community standards.",
  remove_content: "Violates the spam and scams policy.",
  limit_content: "Borderline content limited to followers while context is reviewed.",
  restrict_account: "Repeated violations; posting and messaging restricted.",
  suspend_account: "Severe or repeated violations; account suspended.",
  escalate: "Needs senior review.",
};

function buildDrafts(): (Draft & { id: string })[] {
  const rng = createRng(1047);
  const openTotal = DASHBOARD_DAILY[DASHBOARD_DAILY.length - 1].pendingModeration;

  // Open-case categories follow the same split the dashboard donut shows.
  const pool: string[] = [];
  for (const { label, value } of splitByWeights(openTotal, MODERATION_CATEGORY_WEIGHTS)) {
    for (let i = 0; i < value; i += 1) pool.push(label);
  }
  for (const fixed of DASHBOARD_CASES) pool.splice(pool.indexOf(fixed.category), 1);

  const visibleContent = CONTENT.filter((item) => item.moderationStatus === "visible");
  const reviewTargets = CONTENT_IDS_BY_STATUS.underReview.filter(
    (id) => !["trd-8790", "trd-8841", "pst-22019"].includes(id),
  );

  // Closed outcomes, oldest first. Account and content states already match them.
  const restricted = USERS.filter((user) => user.status === "restricted");
  const suspended = USERS.filter((user) => user.status === "suspended");
  const closed: Draft[] = [];
  CONTENT_IDS_BY_STATUS.removedByModeration.forEach((id) => {
    const item = contentById.get(id)!;
    closed.push(
      closedDraft(
        item.creatorId,
        "remove_content",
        item,
        rng.pick(["Spam or scams", "Hate speech", "Nudity or sexual content"]),
      ),
    );
  });
  CONTENT_IDS_BY_STATUS.limited.forEach((id) => {
    const item = contentById.get(id)!;
    closed.push(closedDraft(item.creatorId, "limit_content", item, "Misinformation"));
  });
  restricted.forEach((user) =>
    closed.push(closedDraft(user.id, "restrict_account", null, "Harassment or bullying")),
  );
  suspended.forEach((user) =>
    closed.push(closedDraft(user.id, "suspend_account", null, "Spam or scams")),
  );
  for (let i = 0; i < 7; i += 1) {
    const item = visibleContent[(i * 9 + 4) % visibleContent.length];
    closed.push(
      closedDraft(
        item.creatorId,
        "warn",
        item,
        rng.pick(["Harassment or bullying", "Other", "Spam or scams"]),
      ),
    );
  }
  for (let i = 0; i < 8; i += 1) {
    const item = visibleContent[(i * 13 + 2) % visibleContent.length];
    closed.push(
      closedDraft(
        item.creatorId,
        "dismiss",
        item,
        rng.pick([...MODERATION_CATEGORY_WEIGHTS.map((c) => c.label)]),
      ),
    );
  }

  function closedDraft(
    accountId: string,
    outcome: ModerationActionType,
    item: ContentItem | null,
    category: string,
  ): Draft {
    return {
      category,
      priority: rng.weighted<CasePriority>([
        ["critical", 5],
        ["high", 25],
        ["medium", 45],
        ["low", 25],
      ]),
      status: outcome === "dismiss" ? "dismissed" : "actioned",
      targetType: item ? "content" : "account",
      contentId: item?.id ?? null,
      accountId,
      reportedItemLabel: item ? contentLabel(item) : `Account @${usernameOf(accountId)}`,
      submittedAt: "",
      reviewer: REVIEWERS[closed.length % 3 === 0 ? 1 : 0],
      outcome,
    };
  }

  // mod-1039 is the dashboard's "Removed a reported Trend for spam" activity.
  const mod1039 = { ...closed[0], category: "Spam or scams", reviewer: REVIEWERS[0] };
  const olderClosed = closed.slice(1);

  const open: Draft[] = pool.map((category, index) => {
    const status = rng.weighted<CaseStatus>([
      ["new", 55],
      ["in_review", 35],
      ["escalated", 10],
    ]);
    const kind = rng.weighted<CaseTargetType>([
      ["content", 70],
      ["account", 20],
      ["message", 6],
      ["room", 4],
    ]);
    const item =
      kind === "content"
        ? (contentById.get(reviewTargets[index] ?? "") ??
          visibleContent[(index * 7 + 1) % visibleContent.length])
        : null;
    const accountId = item?.creatorId ?? USERS[(index * 17 + 9) % USERS.length].id;
    return {
      category,
      priority: rng.weighted<CasePriority>([
        ["critical", 6],
        ["high", 18],
        ["medium", 46],
        ["low", 30],
      ]),
      status,
      targetType: kind,
      contentId: item?.id ?? null,
      accountId,
      reportedItemLabel: item
        ? contentLabel(item)
        : kind === "account"
          ? `Account @${usernameOf(accountId)}`
          : kind === "message"
            ? "Direct message thread"
            : `Trend Room room-${300 + index}`,
      submittedAt: "",
      reviewer:
        status === "new" ? null : status === "escalated" ? REVIEWERS[1] : REVIEWERS[index % 2],
      outcome: null,
    };
  });

  // Ids are assigned oldest first: closed cases, then the open backlog, then mod-1039..1047.
  const ordered = [...olderClosed, ...open.slice(0, 71), mod1039, open[71]];
  const total = ordered.length;
  const firstId = 1041 - total;
  const drafts = ordered.map((draft, index) => {
    const hours = Math.round(26 + (total - index) * 5.8 + rng.int(0, 4));
    const submittedAt = draft === mod1039 ? "2026-10-27T15:05:00Z" : hoursAgo(hours);
    return {
      ...draft,
      id: `mod-${String(firstId + index).padStart(4, "0")}`,
      submittedAt,
      outcomeAt:
        draft === mod1039
          ? "2026-10-27T21:42:00Z"
          : draft.outcome
            ? addHours(submittedAt, rng.int(2, 40))
            : undefined,
      outcomeReason: draft.outcome ? OUTCOME_REASONS[draft.outcome] : undefined,
    };
  });
  return [...drafts, ...DASHBOARD_CASES];
}

function toCase(draft: Draft & { id: string }, index: number): ModerationCase {
  const history: ModerationCase["history"] = [
    {
      id: `${draft.id}-h1`,
      at: draft.submittedAt,
      actor: "Member reports",
      title: "Report received",
      detail: draft.category,
      tone: "info",
    },
  ];
  if (draft.reviewer) {
    history.push({
      id: `${draft.id}-h2`,
      at: addHours(draft.submittedAt, 1),
      actor: draft.reviewer.name,
      title: `Assigned to ${draft.reviewer.name}`,
      tone: "neutral",
    });
  }
  if (draft.status === "escalated") {
    history.push({
      id: `${draft.id}-h3`,
      at: addHours(draft.submittedAt, 2),
      actor: "Jordan Reyes",
      title: "Escalated",
      detail: "Needs senior review",
      tone: "warning",
    });
  }
  if (draft.outcome && draft.outcomeAt && draft.reviewer) {
    history.push({
      id: `${draft.id}-h4`,
      at: draft.outcomeAt,
      actor: draft.reviewer.name,
      title: ACTION_LABELS[draft.outcome],
      detail: draft.outcomeReason,
      tone: draft.outcome === "dismiss" ? "neutral" : "error",
    });
  }

  return {
    id: draft.id,
    category: draft.category,
    priority: draft.priority,
    status: draft.status,
    targetType: draft.targetType,
    contentId: draft.contentId,
    accountId: draft.accountId,
    reportedItemLabel: draft.reportedItemLabel,
    reporterCount: 1 + ((index * 7) % 9),
    details: DETAILS[draft.category] ?? DETAILS.Other,
    submittedAt: draft.submittedAt,
    assignedReviewerId: draft.reviewer?.id ?? null,
    assignedReviewerName: draft.reviewer?.name ?? null,
    notes:
      draft.status === "in_review" && draft.reviewer
        ? [
            {
              id: `${draft.id}-n1`,
              at: addHours(draft.submittedAt, 1.5),
              author: draft.reviewer.name,
              text: "Reviewing context and the reporter history before deciding.",
            },
          ]
        : [],
    history,
    outcome:
      draft.outcome && draft.outcomeAt && draft.reviewer
        ? {
            action: draft.outcome,
            reason: draft.outcomeReason ?? "",
            at: draft.outcomeAt,
            by: draft.reviewer.name,
          }
        : null,
  };
}

export const MODERATION_CASES: readonly ModerationCase[] = buildDrafts().map(toCase);
export { REVIEWERS as MODERATION_REVIEWERS };
