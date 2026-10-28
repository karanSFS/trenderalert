import type { Appeal, AppealStatus } from "@/features/appeals/appealsTypes";
import { MODERATION_CASES } from "./moderation";
import { addHours, createRng, hoursAgo } from "./seed";
import { USERS } from "./users";

const APPEAL_REASONS = [
  "The post was satire and the caption made that clear.",
  "I was reporting the scam, not promoting it. The link was a warning.",
  "This was my own artwork and did not contain anything explicit.",
  "The account was hacked when these messages were sent.",
  "The health claim came from a published source that I linked.",
  "I did not know the event photo showed people who had not consented. I removed it myself.",
];

const STATUS_PLAN: AppealStatus[] = [
  "pending",
  "pending",
  "in_review",
  "upheld",
  "pending",
  "reversed",
  "in_review",
  "pending",
  "upheld",
  "in_review",
  "pending",
  "reversed",
  "upheld",
  "pending",
  "upheld",
];

function generateAppeals(): Appeal[] {
  const rng = createRng(412);
  // Only enforcement outcomes can be appealed. Reversals are limited to warnings so
  // the seeded account and content states stay consistent.
  const enforceable = MODERATION_CASES.filter(
    (item) => item.outcome && item.outcome.action !== "dismiss",
  );
  const warnings = enforceable.filter((item) => item.outcome?.action === "warn");
  const others = enforceable.filter((item) => item.outcome?.action !== "warn");

  let warningIndex = 0;
  let otherIndex = 0;

  return STATUS_PLAN.map((status, index) => {
    const source =
      status === "reversed"
        ? warnings[warningIndex++ % warnings.length]
        : others[otherIndex++ % others.length];
    const outcome = source.outcome!;
    const id = `app-${String(400 + index).padStart(4, "0")}`;
    const user = USERS.find((candidate) => candidate.id === source.accountId)!;
    const submittedAt =
      id === "app-0412" ? "2026-10-25T14:20:00Z" : addHours(outcome.at, rng.int(6, 72));
    const decidedAt =
      id === "app-0412" ? "2026-10-26T22:08:00Z" : addHours(submittedAt, rng.int(4, 40));
    const decided = status === "upheld" || status === "reversed";
    const reviewer = status === "pending" ? null : "Jordan Reyes";

    const history: Appeal["history"] = [
      {
        id: `${id}-h1`,
        at: outcome.at,
        actor: outcome.by,
        title: `Original decision: ${outcome.action.replace(/_/g, " ")}`,
        detail: outcome.reason,
        tone: "error",
      },
      {
        id: `${id}-h2`,
        at: submittedAt,
        actor: `@${user.username}`,
        title: "Appeal submitted",
        tone: "info",
      },
    ];
    if (reviewer) {
      history.push({
        id: `${id}-h3`,
        at: addHours(submittedAt, 2),
        actor: reviewer,
        title: "Review started",
        tone: "neutral",
      });
    }
    const decisionReason =
      status === "upheld"
        ? "Evidence does not change the original assessment."
        : "New context shows the content was a good-faith warning to others.";
    if (decided) {
      history.push({
        id: `${id}-h4`,
        at: decidedAt,
        actor: "Jordan Reyes",
        title: status === "upheld" ? "Decision upheld" : "Decision reversed",
        detail: decisionReason,
        tone: status === "upheld" ? "neutral" : "success",
      });
    }

    return {
      id,
      caseId: source.id,
      userId: user.id,
      username: user.username,
      originalDecision: {
        action: outcome.action,
        reason: outcome.reason,
        decidedAt: outcome.at,
        decidedBy: outcome.by,
      },
      appealReason: APPEAL_REASONS[index % APPEAL_REASONS.length],
      evidence: [
        {
          id: `${id}-e1`,
          kind: "statement",
          label: "Member statement",
          summary: APPEAL_REASONS[index % APPEAL_REASONS.length],
        },
        ...(index % 3 === 0
          ? [
              {
                id: `${id}-e2`,
                kind: "screenshot" as const,
                label: "Screenshot of original context",
                summary: "Shows the surrounding conversation.",
              },
            ]
          : []),
        ...(index % 4 === 1
          ? [
              {
                id: `${id}-e3`,
                kind: "link" as const,
                label: "Referenced source",
                summary: "Link to the source the member cited.",
              },
            ]
          : []),
      ],
      status,
      assignedReviewerName: reviewer,
      submittedAt: status === "pending" && index > 10 ? hoursAgo(rng.int(3, 20)) : submittedAt,
      history,
      decision: decided
        ? {
            outcome: status as "upheld" | "reversed",
            reason: decisionReason,
            at: decidedAt,
            by: "Jordan Reyes",
          }
        : null,
    };
  });
}

export const APPEALS: readonly Appeal[] = generateAppeals();
