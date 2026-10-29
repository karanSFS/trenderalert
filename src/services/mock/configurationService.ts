import type { ConfigurationService } from "@/services/contracts/operationalServices";
import { assertEligible, assertValid, db } from "./db";
import { mockRequest } from "./mockDelay";

const SERVICE = "configuration";

/** Upper bound for public discovery (CNT14-002). */
export const MAX_TREND_DURATION_DAYS = 30;

let announcementSequence = 0;

const announcementStatus = (startsAt: string, endsAt: string) => {
  const now = Date.now();
  if (Date.parse(endsAt) <= now) return "ended" as const;
  return Date.parse(startsAt) <= now ? ("live" as const) : ("scheduled" as const);
};

export const mockConfigurationService: ConfigurationService = {
  get: () => mockRequest(() => db.configuration, { service: SERVICE }),

  updateSettings: (settings) =>
    mockRequest(
      () => {
        const durations = [...new Set(settings.trendDurationsDays)].sort((a, b) => a - b);
        assertValid(durations.length > 0, "Keep at least one Trend duration.");
        assertValid(
          durations.every(
            (days) => Number.isInteger(days) && days >= 1 && days <= MAX_TREND_DURATION_DAYS,
          ),
          `Trend durations must be whole days from 1 to ${MAX_TREND_DURATION_DAYS}.`,
        );
        assertValid(
          settings.maxSavedFolders >= 1 && settings.maxSavedFolders <= 100,
          "Saved folders must be between 1 and 100.",
        );
        assertValid(
          settings.reportRateLimitPerHour >= 1 && settings.reportRateLimitPerHour <= 60,
          "Report rate limit must be between 1 and 60 per hour.",
        );
        assertValid(
          settings.adminSessionTimeoutMinutes >= 5 && settings.adminSessionTimeoutMinutes <= 60,
          "Admin session timeout must be between 5 and 60 minutes.",
        );
        db.configuration.settings = {
          ...db.configuration.settings,
          trendDurationsDays: durations,
          maxSavedFolders: settings.maxSavedFolders,
          reportRateLimitPerHour: settings.reportRateLimitPerHour,
          adminSessionTimeoutMinutes: settings.adminSessionTimeoutMinutes,
        };
        return db.configuration;
      },
      { service: SERVICE },
    ),

  saveAnnouncement: (draft, actor) =>
    mockRequest(
      () => {
        const title = draft.title.trim();
        const body = draft.body.trim();
        assertValid(title.length >= 5, "Title must be at least 5 characters.");
        assertValid(body.length >= 10, "Message must be at least 10 characters.");
        assertValid(
          Date.parse(draft.endsAt) > Date.parse(draft.startsAt),
          "End time must be after the start time.",
        );
        const status = announcementStatus(draft.startsAt, draft.endsAt);

        if (draft.id) {
          const existing = db.configuration.announcements.find((item) => item.id === draft.id);
          assertValid(Boolean(existing), `Announcement ${draft.id} was not found.`);
          assertEligible(existing!.status !== "ended", "Ended announcements cannot be edited.");
          Object.assign(existing!, { ...draft, title, body, status, updatedBy: actor.name });
        } else {
          announcementSequence += 1;
          db.configuration.announcements.unshift({
            ...draft,
            id: `ann-demo-${announcementSequence}`,
            title,
            body,
            status,
            updatedBy: actor.name,
          });
        }
        return db.configuration;
      },
      { service: SERVICE },
    ),

  endAnnouncement: (id, actor) =>
    mockRequest(
      () => {
        const item = db.configuration.announcements.find((candidate) => candidate.id === id);
        assertValid(Boolean(item), `Announcement ${id} was not found.`);
        assertEligible(item!.status !== "ended", "This announcement has already ended.");
        item!.status = "ended";
        item!.endsAt = new Date().toISOString();
        item!.updatedBy = actor.name;
        return db.configuration;
      },
      { service: SERVICE },
    ),
};
