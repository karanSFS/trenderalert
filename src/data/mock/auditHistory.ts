import type { AuditEvent } from "@/features/audit/auditTypes";
import type { AdminRole } from "@/types/auth";
import { ACTION_LABELS, MODERATION_CASES } from "./moderation";
import { TRENDS } from "./trends";

const ACTORS: Record<string, { id: string; role: AdminRole }> = {
  "Jordan Reyes": { id: "adm-002", role: "content_moderator" },
  "Avery Collins": { id: "adm-001", role: "super_admin" },
};

/** Seeded operational events that match the dashboard's recent admin activity. */
const OPERATIONAL_EVENTS: AuditEvent[] = [
  {
    id: "aud-act-5107",
    occurredAt: "2026-10-27T19:15:00Z",
    actorId: "adm-004",
    actorName: "Marcus Bell",
    actorRole: "finance_admin",
    action: "reconciliation.resolve",
    targetType: "reconciliation",
    targetId: "rec-2201",
    summary: "Resolved reconciliation exception rec-2201 (amount mismatch)",
    reason: "Store applied a regional price adjustment; recorded a linked adjustment entry.",
    demo: true,
  },
  {
    id: "aud-act-5106",
    occurredAt: "2026-10-27T16:03:00Z",
    actorId: "adm-001",
    actorName: "Avery Collins",
    actorRole: "super_admin",
    action: "configuration.announcement.update",
    targetType: "configuration",
    targetId: "ann-31",
    summary: 'Updated announcement "Scheduled maintenance window"',
    demo: true,
  },
  {
    id: "aud-act-5105",
    occurredAt: "2026-10-27T13:27:00Z",
    actorId: "adm-003",
    actorName: "Priya Natarajan",
    actorRole: "support_agent",
    action: "support.escalate",
    targetType: "supportCase",
    targetId: "sup-3318",
    summary: "Escalated support case sup-3318 to Trust & Safety",
    reason: "Possible ban evasion; needs linked-account review.",
    demo: true,
  },
  {
    id: "aud-act-5104",
    occurredAt: "2026-10-27T10:51:00Z",
    actorId: "adm-005",
    actorName: "Sofia Laurent",
    actorRole: "contest_admin",
    action: "contest.submit_for_review",
    targetType: "contest",
    targetId: "ctst-301",
    summary: "Submitted contest ctst-301 for legal review",
    demo: true,
  },
  {
    id: "aud-flag-trend-rooms",
    occurredAt: "2026-10-26T16:00:00Z",
    actorId: "adm-001",
    actorName: "Avery Collins",
    actorRole: "super_admin",
    action: "featureFlag.rollout",
    targetType: "featureFlag",
    targetId: "trend_rooms",
    summary: 'Scheduled "Trend Rooms" rollout to 50% of a test market',
    demo: true,
  },
];

/** Historical (seeded) audit entries. Session demo actions are added on top at runtime. */
function generateAuditHistory(): AuditEvent[] {
  const events: AuditEvent[] = [];

  for (const item of MODERATION_CASES) {
    if (!item.outcome) continue;
    const actor = ACTORS[item.outcome.by] ?? ACTORS["Jordan Reyes"];
    const accountAction =
      item.outcome.action === "restrict_account" || item.outcome.action === "suspend_account";
    events.push({
      id: `aud-${item.id}`,
      occurredAt: item.outcome.at,
      actorId: actor.id,
      actorName: item.outcome.by,
      actorRole: actor.role,
      action: `moderation.${item.outcome.action}`,
      targetType: accountAction ? "user" : item.contentId ? "content" : "moderationCase",
      targetId: accountAction ? item.accountId : (item.contentId ?? item.id),
      summary: `${ACTION_LABELS[item.outcome.action]} (case ${item.id})`,
      reason: item.outcome.reason,
      demo: true,
    });
  }

  for (const trend of TRENDS) {
    for (const entry of trend.history) {
      const actor = ACTORS[entry.actor];
      if (!actor) continue;
      events.push({
        id: `aud-${entry.id}`,
        occurredAt: entry.at,
        actorId: actor.id,
        actorName: entry.actor,
        actorRole: actor.role,
        action: "trend.update",
        targetType: "trend",
        targetId: trend.id,
        summary: `${entry.title} (${trend.id})`,
        reason: entry.detail,
        demo: true,
      });
    }
  }

  events.push(...OPERATIONAL_EVENTS);
  return events.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

export const AUDIT_HISTORY: readonly AuditEvent[] = generateAuditHistory();
