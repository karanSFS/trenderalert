import type { SupportStatus } from "@/features/support/supportTypes";
import { ESCALATION_LABELS } from "@/lib/constants/operationalLabels";
import type { SupportService } from "@/services/contracts/operationalServices";
import { assertEligible, assertReason, assertValid, db, findOrThrow, historyEntry } from "./db";
import { mockRequest } from "./mockDelay";
import { applyListQuery } from "./query";

const SERVICE = "support";

const STATUS_TITLES: Record<Exclude<SupportStatus, "escalated">, string> = {
  open: "Reopened",
  pending_member: "Waiting on the member",
  resolved: "Resolved",
};

let noteSequence = 0;

const caseOf = (id: string) => findOrThrow(db.support, id, "Support case");
const touch = (item: { updatedAt: string }) => {
  item.updatedAt = new Date().toISOString();
};

export const mockSupportService: SupportService = {
  list: (query) =>
    mockRequest(
      () =>
        applyListQuery(db.support, query, {
          searchFields: (item) => [item.id, item.subject, item.username, item.userId],
          filterPredicates: {
            status: (item, value) => item.status === value,
            category: (item, value) => item.category === value,
            priority: (item, value) => item.priority === value,
            assignee: (item, value) =>
              value === "unassigned"
                ? item.assignedAgentId === null
                : item.assignedAgentId === value,
          },
          sortAccessors: {
            createdAt: (item) => item.createdAt,
            updatedAt: (item) => item.updatedAt,
            priority: (item) => ["low", "medium", "high", "critical"].indexOf(item.priority),
          },
        }),
      { service: SERVICE },
    ),

  get: (id) => mockRequest(() => caseOf(id), { service: SERVICE }),

  listAgents: () =>
    mockRequest(
      () =>
        db.adminUsers
          .filter((item) => item.role === "support_agent" && item.status === "active")
          .map((item) => ({ id: item.id, name: item.displayName })),
      { service: SERVICE, delayMs: 0 },
    ),

  assign: (id, agent, actor) =>
    mockRequest(
      () => {
        const item = caseOf(id);
        assertEligible(item.status !== "resolved", "Reopen the case before reassigning it.");
        assertEligible(
          item.assignedAgentId !== (agent?.id ?? null),
          "The case already has this assignee.",
        );
        item.assignedAgentId = agent?.id ?? null;
        item.assignedAgentName = agent?.name ?? null;
        item.history.push(
          historyEntry(
            actor.name,
            agent ? `Assigned to ${agent.name}` : "Unassigned",
            undefined,
            "info",
          ),
        );
        touch(item);
        return item;
      },
      { service: SERVICE },
    ),

  setStatus: (id, status, actor) =>
    mockRequest(
      () => {
        const item = caseOf(id);
        assertEligible(item.status !== status, "The case already has this status.");
        if (status === "resolved")
          assertEligible(item.assignedAgentId !== null, "Assign the case before resolving it.");
        item.status = status;
        if (status !== "resolved") item.escalatedTo = null;
        item.history.push(
          historyEntry(
            actor.name,
            STATUS_TITLES[status],
            undefined,
            status === "resolved" ? "success" : "info",
          ),
        );
        touch(item);
        return item;
      },
      { service: SERVICE },
    ),

  addNote: (id, text, actor) =>
    mockRequest(
      () => {
        const item = caseOf(id);
        const trimmed = text.trim();
        assertValid(trimmed.length >= 3, "Write a note of at least 3 characters.");
        noteSequence += 1;
        item.notes.push({
          id: `${id}-demo-n${noteSequence}`,
          at: new Date().toISOString(),
          author: actor.name,
          text: trimmed,
        });
        item.history.push(historyEntry(actor.name, "Internal note added", undefined, "neutral"));
        touch(item);
        return item;
      },
      { service: SERVICE },
    ),

  escalate: (id, team, reason, actor) =>
    mockRequest(
      () => {
        const item = caseOf(id);
        const trimmed = assertReason(reason);
        assertEligible(item.status !== "resolved", "Resolved cases cannot be escalated.");
        assertEligible(
          item.escalatedTo !== team,
          `Already escalated to ${ESCALATION_LABELS[team]}.`,
        );
        item.status = "escalated";
        item.escalatedTo = team;
        item.history.push(
          historyEntry(actor.name, `Escalated to ${ESCALATION_LABELS[team]}`, trimmed, "warning"),
        );
        touch(item);
        return item;
      },
      { service: SERVICE },
    ),
};
