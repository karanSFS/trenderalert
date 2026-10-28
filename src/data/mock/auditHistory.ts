import type { AuditEvent } from "@/features/audit/auditTypes";
import type { AdminRole } from "@/types/auth";
import { ACTION_LABELS, MODERATION_CASES } from "./moderation";
import { TRENDS } from "./trends";

const ACTORS: Record<string, { id: string; role: AdminRole }> = {
  "Jordan Reyes": { id: "adm-002", role: "content_moderator" },
  "Avery Collins": { id: "adm-001", role: "super_admin" },
};

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

  return events.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

export const AUDIT_HISTORY: readonly AuditEvent[] = generateAuditHistory();
