import type {
  TrendJourney,
  TrendPost,
  TrendScoreBreakdown,
  TrendStage,
} from "@/features/trends/trendsTypes";
import type { TrendsService } from "@/services/contracts/backendServices";
import { apiRequest, listItems, paginateLocally } from "./http";

interface RawTrend {
  id: string;
  creator_id: string;
  topic_id: string;
  topic_title: string;
  category: string;
  caption: string;
  city: string;
  h3_cell_res8: string;
  stage: TrendStage;
  trend_score: number;
  duration_hours: number;
  created_at: string;
  expires_at: string;
  days_left: number;
  first_spotter_badge: string | null;
}

interface RawScore {
  overall_score: number;
  growth_velocity: number;
  qualified_reach: number;
  geographic_spread: number;
  originality: number;
  risk_factor_penalty: number;
  prediction_label: string;
  confidence_pct: number;
}

interface RawJourney {
  topic_id: string;
  topic_title: string;
  origin_city: string;
  created_date: string;
  current_stage: string;
  trend_score: number;
  stops: {
    city: string;
    state_or_country?: string;
    stage: string;
    date_reached: string;
    velocity_multiplier: number;
    description?: string;
  }[];
}

const mapTrend = (raw: RawTrend): TrendPost => ({
  id: raw.id,
  creator: raw.creator_id,
  topicId: raw.topic_id,
  topicTitle: raw.topic_title,
  category: raw.category,
  caption: raw.caption,
  city: raw.city,
  h3Cell: raw.h3_cell_res8,
  stage: raw.stage,
  trendScore: raw.trend_score,
  durationHours: raw.duration_hours,
  createdAt: raw.created_at,
  expiresAt: raw.expires_at,
  daysLeft: raw.days_left,
  firstSpotterBadge: raw.first_spotter_badge,
});

const SORT: Record<string, (trend: TrendPost) => string | number> = {
  trendScore: (trend) => trend.trendScore,
  createdAt: (trend) => trend.createdAt,
  expiresAt: (trend) => trend.expiresAt,
};

async function optional<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request;
  } catch {
    return null;
  }
}

export const apiTrendsService: TrendsService = {
  /** `GET /trends/` returns every active Trend, so search, filters and paging happen here. */
  list: async (query) => {
    const raw = listItems<RawTrend>(await apiRequest<unknown>("/api/v1/trends"));
    const { stage, category } = query.filters ?? {};
    const search = query.search?.trim().toLowerCase() ?? "";
    let items = raw
      .map(mapTrend)
      .filter(
        (trend) =>
          (!stage || trend.stage === stage) &&
          (!category || trend.category === category) &&
          (!search ||
            [trend.topicTitle, trend.caption, trend.creator, trend.city, trend.id].some((field) =>
              field.toLowerCase().includes(search),
            )),
      );
    const accessor = query.sortField ? SORT[query.sortField] : undefined;
    if (accessor && query.sortOrder) {
      const direction = query.sortOrder === "ascend" ? 1 : -1;
      items = [...items].sort((a, b) => {
        const left = accessor(a);
        const right = accessor(b);
        return direction * (left < right ? -1 : left > right ? 1 : 0);
      });
    }
    return paginateLocally(items, query.page, query.pageSize);
  },

  get: async (id) =>
    mapTrend(await apiRequest<RawTrend>(`/api/v1/trends/${encodeURIComponent(id)}`)),

  getInsights: async (id) => {
    const trend = await apiRequest<RawTrend>(`/api/v1/trends/${encodeURIComponent(id)}`);
    const topic = encodeURIComponent(trend.topic_id);
    const [score, journey] = await Promise.all([
      optional(apiRequest<RawScore>(`/api/v1/trends/topics/${topic}/score`)),
      optional(apiRequest<RawJourney>(`/api/v1/radar/journey/${topic}`)),
    ]);
    return {
      score: score
        ? ({
            overall: score.overall_score,
            growthVelocity: score.growth_velocity,
            qualifiedReach: score.qualified_reach,
            geographicSpread: score.geographic_spread,
            originality: score.originality,
            riskPenalty: score.risk_factor_penalty,
            predictionLabel: score.prediction_label,
            confidencePct: score.confidence_pct,
          } satisfies TrendScoreBreakdown)
        : null,
      journey: journey
        ? ({
            topicId: journey.topic_id,
            topicTitle: journey.topic_title,
            originCity: journey.origin_city,
            createdDate: journey.created_date,
            currentStage: journey.current_stage,
            trendScore: journey.trend_score,
            stops: journey.stops.map((stop) => ({
              city: stop.city,
              region: stop.state_or_country ?? "",
              stage: stop.stage,
              dateReached: stop.date_reached,
              velocityMultiplier: stop.velocity_multiplier,
              description: stop.description ?? "",
            })),
          } satisfies TrendJourney)
        : null,
    };
  },
};
