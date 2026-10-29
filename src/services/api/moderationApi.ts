import type { Appeal } from "@/features/appeals/appealsTypes";
import type { ModerationReport, ReportStatus } from "@/features/moderation/moderationTypes";
import type { AppealsService, ModerationService } from "@/services/contracts/backendServices";
import { ApiServiceError, apiRequest, pageQuery, toPaginated, utc } from "./http";

interface RawReport {
  id: string;
  target_trend_id: string | null;
  target_user_id: string | null;
  category: string;
  priority: number;
  assigned_admin_id: string | null;
  assigned_admin_name?: string | null;
  assigned_admin_email?: string | null;
  sla_due_at: string;
  moderator_notes: string | null;
  status: ReportStatus;
  created_at: string;
  resolved_at: string | null;
}

interface RawAppeal {
  id: string;
  report_id: string;
  appellant_user_id: string;
  appellant_name?: string | null;
  appellant_email?: string | null;
  appeal_statement: string;
  evidence_assets: unknown[];
  assigned_admin_id: string | null;
  status: Appeal["status"];
  resolution_reason: string | null;
  submitted_at: string;
  resolved_at: string | null;
}

const QUEUE = "/api/v1/admin/moderation/queue";
const APPEALS = "/api/v1/admin/appeals";

const reportPath = (id: string, suffix = "") => `${QUEUE}/${encodeURIComponent(id)}${suffix}`;

export const mapReport = (raw: RawReport): ModerationReport => ({
  id: raw.id,
  targetTrendId: raw.target_trend_id,
  targetUserId: raw.target_user_id,
  category: raw.category,
  priority: raw.priority,
  assignedAdminId: raw.assigned_admin_id,
  assignedAdminName: raw.assigned_admin_name ?? null,
  assignedAdminEmail: raw.assigned_admin_email ?? null,
  slaDueAt: utc(raw.sla_due_at) ?? raw.sla_due_at,
  moderatorNotes: raw.moderator_notes,
  status: raw.status,
  createdAt: utc(raw.created_at) ?? raw.created_at,
  resolvedAt: utc(raw.resolved_at),
});

const mapAppeal = (raw: RawAppeal): Appeal => ({
  id: raw.id,
  reportId: raw.report_id,
  appellantUserId: raw.appellant_user_id,
  appellantName: raw.appellant_name ?? null,
  appellantEmail: raw.appellant_email ?? null,
  statement: raw.appeal_statement,
  evidenceAssets: (raw.evidence_assets ?? []).map((asset) =>
    typeof asset === "string" ? asset : JSON.stringify(asset),
  ),
  assignedAdminId: raw.assigned_admin_id,
  status: raw.status,
  resolutionReason: raw.resolution_reason,
  submittedAt: utc(raw.submitted_at) ?? raw.submitted_at,
  resolvedAt: utc(raw.resolved_at),
});

export const apiModerationService: ModerationService = {
  list: async (query) => {
    const filters = query.filters ?? {};
    const raw = await apiRequest<unknown>(QUEUE, {
      query: {
        ...pageQuery(query.page, query.pageSize),
        status_filter: filters.status,
        category: filters.category,
        priority: filters.priority ? Number(filters.priority) : undefined,
      },
    });
    return toPaginated<RawReport, ModerationReport>(raw, query.page, query.pageSize, mapReport);
  },

  get: async (id) => mapReport(await apiRequest<RawReport>(reportPath(id))),

  assign: async (id, adminUserId) => {
    const report = mapReport(
      await apiRequest<RawReport>(reportPath(id, "/assign"), {
        method: "POST",
        body: { admin_user_id: adminUserId },
      }),
    );
    // The backend currently ignores `null` and keeps the assignment; report that honestly.
    if (adminUserId === null && report.assignedAdminId)
      throw new ApiServiceError(
        "CONFLICT",
        "The backend did not clear the assignment. Try again later.",
      );
    return report;
  },

  addNote: async (id, notes) =>
    mapReport(
      await apiRequest<RawReport>(reportPath(id, "/notes"), { method: "POST", body: { notes } }),
    ),

  act: async (id, action, justification, notes) =>
    mapReport(
      await apiRequest<RawReport>(reportPath(id, "/action"), {
        method: "POST",
        body: { action_name: action, justification, moderator_notes: notes || null },
      }),
    ),
};

export const apiAppealsService: AppealsService = {
  list: async (query) =>
    toPaginated<RawAppeal, Appeal>(
      await apiRequest<unknown>(APPEALS, {
        query: { ...pageQuery(query.page, query.pageSize), status_filter: query.filters?.status },
      }),
      query.page,
      query.pageSize,
      mapAppeal,
    ),

  get: async (id) => mapAppeal(await apiRequest<RawAppeal>(`${APPEALS}/${encodeURIComponent(id)}`)),

  resolve: async (id, outcome, reason) =>
    mapAppeal(
      await apiRequest<RawAppeal>(`${APPEALS}/${encodeURIComponent(id)}/resolve`, {
        method: "POST",
        body: { status: outcome, resolution_reason: reason },
      }),
    ),
};
