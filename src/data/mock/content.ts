import type {
  Audience,
  ContentItem,
  ContentModerationStatus,
} from "@/features/content/contentTypes";
import { createRng, hoursAgo } from "./seed";
import { TRENDS } from "./trends";
import { USERS } from "./users";

const POST_CAPTIONS = [
  "Finally finished the mural sketch from last week.",
  "Weekend market haul, all local makers.",
  "Morning light over the canal never gets old.",
  "Tried the new bakery everyone keeps talking about.",
  "Our garden plot is thriving this month.",
  "Throwback to the lantern walk last spring.",
  "New ceramics batch out of the kiln.",
  "First 10k done, slow but steady.",
  "Swapped three books and gained two friends.",
  "Practice session before the open mic.",
];

const AUDIENCES: readonly (readonly [Audience, number])[] = [
  ["everyone", 62],
  ["followers", 16],
  ["trenders", 10],
  ["selected", 6],
  ["only_me", 6],
];

/**
 * Pre-assigned moderation states so moderation outcomes and copyright cases can point at
 * content that already reflects them. Counts: removed 14, limited 5, under review 8.
 */
const REMOVED_TREND_IDS = [
  "trd-8801",
  "trd-8807",
  "trd-8813",
  "trd-8822",
  "trd-8829",
  "trd-8835",
  "trd-8842",
];
const REMOVED_POST_IDS = [
  "pst-22003",
  "pst-22008",
  "pst-22014",
  "pst-22021",
  "pst-22027",
  "pst-22033",
  "pst-22038",
];
const LIMITED_IDS = ["trd-8810", "trd-8824", "pst-22005", "pst-22017", "pst-22030"];
const UNDER_REVIEW_IDS = [
  "trd-8790",
  "trd-8841",
  "trd-8818",
  "trd-8836",
  "pst-22019",
  "pst-22011",
  "pst-22025",
  "pst-22036",
];

function statusFor(id: string): ContentModerationStatus {
  if (REMOVED_TREND_IDS.includes(id) || REMOVED_POST_IDS.includes(id)) return "removed";
  if (LIMITED_IDS.includes(id)) return "limited";
  if (UNDER_REVIEW_IDS.includes(id)) return "under_review";
  return "visible";
}

function generateContent(): ContentItem[] {
  const rng = createRng(22000);
  const trendPosts: ContentItem[] = TRENDS.map((trend) => {
    const status = statusFor(trend.id);
    return {
      id: trend.id,
      type: "trend",
      creatorId: trend.creatorId,
      creatorUsername: trend.creatorUsername,
      caption: `${trend.topic}. Who else has spotted this?`,
      media: rng.chance(0.45) ? "video" : "photo",
      audience: "everyone",
      publishedAt: trend.publishedAt,
      moderationStatus: status,
      reportCount:
        status === "visible"
          ? rng.weighted([
              [0, 80],
              [1, 15],
              [2, 5],
            ])
          : rng.int(2, 14),
    };
  });

  const profilePosts: ContentItem[] = Array.from({ length: 40 }, (_, index) => {
    const id = `pst-${22000 + index}`;
    const creator = USERS[(index * 7 + 3) % USERS.length];
    const status = statusFor(id);
    return {
      id,
      type: "profile_post",
      creatorId: creator.id,
      creatorUsername: creator.username,
      caption: POST_CAPTIONS[index % POST_CAPTIONS.length],
      media: rng.chance(0.3) ? "video" : "photo",
      audience: rng.weighted(AUDIENCES),
      publishedAt: hoursAgo(rng.int(2, 24 * 60)),
      moderationStatus: status,
      reportCount:
        status === "visible"
          ? rng.weighted([
              [0, 85],
              [1, 15],
            ])
          : rng.int(1, 9),
    };
  });

  return [...trendPosts, ...profilePosts];
}

export const CONTENT: readonly ContentItem[] = generateContent();

export const CONTENT_IDS_BY_STATUS = {
  removedByModeration: [...REMOVED_TREND_IDS.slice(0, 6), ...REMOVED_POST_IDS.slice(0, 6)],
  removedByCopyright: [REMOVED_TREND_IDS[6], REMOVED_POST_IDS[6]],
  limited: LIMITED_IDS,
  underReview: UNDER_REVIEW_IDS,
} as const;
