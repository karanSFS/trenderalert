import { ACTIVE_TREND_STAGES, type TrendRecord } from "@/features/trends/trendsTypes";
import type { TrendsService } from "@/services/contracts/moduleServices";
import { assertEligible, assertReason, db, findOrThrow, historyEntry } from "./db";
import { MockServiceError, mockRequest } from "./mockDelay";
import { applyListQuery } from "./query";

const SERVICE = "trends";

const isActive = (trend: TrendRecord) =>
  ACTIVE_TREND_STAGES.includes(trend.stage) && !trend.mergedInto;

function assertActive(trend: TrendRecord) {
  assertEligible(isActive(trend), "This Trend is no longer active in discovery.");
}

export const mockTrendsService: TrendsService = {
  list: (query) =>
    mockRequest(
      () =>
        applyListQuery(db.trends, query, {
          searchFields: (trend) => [trend.topic, trend.creatorUsername, trend.id, ...trend.tags],
          filterPredicates: {
            stage: (trend, value) => trend.stage === value,
            geoScope: (trend, value) => trend.geoScope === value,
            flag: (trend, value) =>
              value === "featured"
                ? trend.featured
                : value === "suppressed"
                  ? trend.suppressed
                  : Boolean(trend.mergedInto),
          },
          sortAccessors: {
            trendScore: (trend) => trend.trendScore,
            expiresAt: (trend) => trend.expiresAt,
            publishedAt: (trend) => trend.publishedAt,
          },
        }),
      { service: SERVICE },
    ),

  get: (id) => mockRequest(() => findOrThrow(db.trends, id, "Trend"), { service: SERVICE }),

  getContext: (id) =>
    mockRequest(
      () => {
        findOrThrow(db.trends, id, "Trend");
        return {
          content: db.content.find((item) => item.id === id) ?? null,
          mergedFrom: db.trends.filter((trend) => trend.mergedInto === id),
          mergeTargets: db.trends
            .filter((trend) => trend.id !== id && isActive(trend))
            .map((trend) => ({ id: trend.id, topic: trend.topic })),
        };
      },
      { service: SERVICE },
    ),

  setFeatured: (id, featured, reason, actor) =>
    mockRequest(
      () => {
        const trend = findOrThrow(db.trends, id, "Trend");
        const trimmed = assertReason(reason);
        if (featured) {
          assertActive(trend);
          assertEligible(!trend.suppressed, "A suppressed Trend cannot be featured.");
        }
        assertEligible(
          trend.featured !== featured,
          featured ? "Already featured." : "Not currently featured.",
        );
        trend.featured = featured;
        trend.history.push(
          historyEntry(
            actor.name,
            featured ? "Featured on Radar" : "Removed from featured",
            trimmed,
            "brand",
          ),
        );
        return trend;
      },
      { service: SERVICE },
    ),

  setSuppressed: (id, suppressed, reason, actor) =>
    mockRequest(
      () => {
        const trend = findOrThrow(db.trends, id, "Trend");
        const trimmed = assertReason(reason);
        if (suppressed) assertActive(trend);
        assertEligible(
          trend.suppressed !== suppressed,
          suppressed ? "Already suppressed." : "Not currently suppressed.",
        );
        trend.suppressed = suppressed;
        if (suppressed) trend.featured = false;
        trend.history.push(
          historyEntry(
            actor.name,
            suppressed ? "Suppressed from discovery" : "Suppression lifted",
            trimmed,
            suppressed ? "warning" : "success",
          ),
        );
        return trend;
      },
      { service: SERVICE },
    ),

  endEarly: (id, reason, actor) =>
    mockRequest(
      () => {
        const trend = findOrThrow(db.trends, id, "Trend");
        const trimmed = assertReason(reason);
        assertActive(trend);
        trend.stage = "ended_early";
        trend.featured = false;
        trend.history.push(historyEntry(actor.name, "Discovery ended early", trimmed, "error"));
        return trend;
      },
      { service: SERVICE },
    ),

  correct: (id, correction, actor) =>
    mockRequest(
      () => {
        const trend = findOrThrow(db.trends, id, "Trend");
        const topic = correction.topic.trim();
        if (topic.length < 3)
          throw new MockServiceError("VALIDATION", "The topic must be at least 3 characters.");
        const changes: string[] = [];
        if (topic !== trend.topic) changes.push(`topic "${trend.topic}" → "${topic}"`);
        if (correction.tags.join(",") !== trend.tags.join(",")) changes.push("tags");
        if (correction.locationLabel.trim() !== trend.locationLabel) changes.push("location label");
        assertEligible(changes.length > 0, "No fields were changed.");
        // Only these fields are correctable; expiration, creator and publish time are never changed.
        trend.topic = topic;
        trend.tags = correction.tags.map((tag) => tag.trim()).filter(Boolean);
        trend.locationLabel = correction.locationLabel.trim();
        trend.history.push(
          historyEntry(actor.name, "Fields corrected", changes.join("; "), "info"),
        );
        return trend;
      },
      { service: SERVICE },
    ),

  merge: (sourceId, targetId, reason, actor) =>
    mockRequest(
      () => {
        const source = findOrThrow(db.trends, sourceId, "Trend");
        const target = findOrThrow(db.trends, targetId, "Trend");
        const trimmed = assertReason(reason);
        assertEligible(source.id !== target.id, "A Trend cannot be merged into itself.");
        assertEligible(!source.mergedInto, "This Trend is already merged.");
        assertEligible(isActive(target), "The target Trend must be active and not merged.");
        source.mergedInto = target.id;
        source.featured = false;
        source.history.push(
          historyEntry(
            actor.name,
            `Merged into ${target.id}`,
            `${trimmed} Origin credit and history retained.`,
            "neutral",
          ),
        );
        target.history.push(
          historyEntry(actor.name, `Absorbed duplicate ${source.id}`, trimmed, "neutral"),
        );
        return source;
      },
      { service: SERVICE },
    ),
};
