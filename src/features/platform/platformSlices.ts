import type { ModerationReport } from "@/features/moderation/moderationTypes";
import type {
  AuditLogEntry,
  SupportLookupRequest,
  SupportLookupResult,
} from "@/features/security/securityTypes";
import {
  auditLogService,
  featureFlagsService,
  moderationService,
  platformService,
  supportLookupService,
} from "@/services";
import { createDocumentSlice } from "@/store/createDocumentSlice";
import type {
  FeatureFlag,
  FeatureFlagChange,
  PlatformHealth,
  PlatformMetrics,
} from "./platformTypes";

export const platformMetricsModule = createDocumentSlice<PlatformMetrics>({
  name: "platformMetrics",
  fetch: () => platformService.getMetrics(),
});

export const platformHealthModule = createDocumentSlice<PlatformHealth>({
  name: "platformHealth",
  fetch: () => platformService.getHealth(),
});

export const featureFlagsModule = createDocumentSlice<FeatureFlag[]>({
  name: "featureFlags",
  fetch: () => featureFlagsService.list(),
});

/** Saves one flag, then reloads the list so every flag shows the backend's current state. */
export const saveFeatureFlag = featureFlagsModule.createSave<FeatureFlagChange>(
  "save",
  async (change) => {
    await featureFlagsService.save(change);
    return featureFlagsService.list();
  },
);

export const supportLookupModule = createDocumentSlice<SupportLookupResult, SupportLookupRequest>({
  name: "supportLookup",
  fetch: (request) => supportLookupService.lookup(request),
});

/** Open and in-review reports for the dashboard (most urgent first). */
export const openReportsModule = createDocumentSlice<ModerationReport[]>({
  name: "openReports",
  fetch: async () => {
    const pages = await Promise.all(
      (["OPEN", "IN_REVIEW"] as const).map((status) =>
        moderationService.list({ page: 1, pageSize: 99, filters: { status } }),
      ),
    );
    return pages
      .flatMap((page) => page.items)
      .sort((a, b) => a.priority - b.priority || a.slaDueAt.localeCompare(b.slaDueAt));
  },
});

/** Latest audit entries for the dashboard. */
export const recentAuditModule = createDocumentSlice<AuditLogEntry[]>({
  name: "recentAudit",
  fetch: async () => (await auditLogService.list({ page: 1, pageSize: 6, filters: {} })).items,
});

export const fetchOpenReports = openReportsModule.fetchDocument;
export const fetchRecentAudit = recentAuditModule.fetchDocument;
export const fetchPlatformMetrics = platformMetricsModule.fetchDocument;
export const fetchPlatformHealth = platformHealthModule.fetchDocument;
export const fetchFeatureFlags = featureFlagsModule.fetchDocument;
export const lookupSupportUser = supportLookupModule.fetchDocument;
