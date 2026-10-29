import type {
  Audience,
  ContentItem,
  ContentModerationStatus,
} from "@/features/content/contentTypes";
import { createRng, hoursAgo } from "./seed";
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

/** Topics for the demo Trend posts in Content (not the live Trends, which come from the API). */
const TREND_TOPICS = [
  "Hydration hack claims",
  "Sunrise rooftop sketch club",
  "Pop-up repair cafe",
  "Night market street tacos",
  "Community garden swaps",
  "Indie board game nights",
  "Lunchtime run crews",
  "Hand-lettered shop signs",
  "Library seed libraries",
  "Retro film photo walks",
  "Silent reading parties",
  "Upcycled denim patches",
  "Balcony birdwatch counts",
  "Rooftop sketch mornings",
  "Neighborhood fridge network",
  "Bike bus to school",
  "Cold plunge meetups",
  "Vinyl swap Saturdays",
  "Micro-forest planting",
  "Open-air chess tables",
  "Fermentation workshops",
  "Stairwell choir sessions",
  "Tiny desk street concerts",
  "Thrifted furniture flips",
  "Night sky photo meetups",
  "Language exchange picnics",
  "Board shorts in winter challenge",
  "Handmade ceramics markets",
  "Midnight bakery queues",
  "Skate park cleanup crews",
  "Cardboard boat regatta",
  "Zine swap meets",
  "Urban foraging walks",
  "Retro arcade pop-ups",
  "Dog-friendly cafe crawl",
  "Mural restoration days",
  "Lantern walk evenings",
  "Home espresso latte art",
  "Sea glass collecting",
  "Rain garden builds",
  "Puzzle swap shelves",
  "Dance-off at the pier",
  "Bread starter sharing",
  "Community radio hour",
  "Trail running sunrise loops",
  "Kite festival prep",
  "Street piano sessions",
  "Window box flower contest",
  "Bookshop cat spotting",
  "Night swim meetups",
  "Clothes mending circles",
  "Food truck rally",
  "Chalk art sidewalks",
  "Electric scooter tune-ups",
  "Podcast walk-and-talks",
  "Plant cutting library",
  "Twilight yoga on the green",
  "Miniature painting club",
  "Comic swap corner",
  "Solar oven cook-off",
];

const AUDIENCES: readonly (readonly [Audience, number])[] = [
  ["everyone", 62],
  ["followers", 16],
  ["trenders", 10],
  ["selected", 6],
  ["only_me", 6],
];

/**
 * Pre-assigned moderation states so copyright cases can point at content that already
 * reflects them. Counts: removed 14, limited 5, under review 8.
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
  const trendPosts: ContentItem[] = TREND_TOPICS.map((topic, index) => {
    const id = `trd-${8790 + index}`;
    const creator = USERS[(index * 11 + 5) % USERS.length];
    const status = statusFor(id);
    return {
      id,
      type: "trend",
      creatorId: creator.id,
      creatorUsername: creator.username,
      caption: `${topic}. Who else has spotted this?`,
      media: rng.chance(0.45) ? "video" : "photo",
      audience: "everyone",
      publishedAt: hoursAgo(rng.int(1, 24 * 30)),
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
