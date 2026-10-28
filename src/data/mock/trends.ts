import type {
  GeoScope,
  TrendDurationDays,
  TrendRecord,
  TrendStage,
} from "@/features/trends/trendsTypes";
import { addDays, createRng, DEMO_AS_OF_MS, hoursAgo, PLACES } from "./seed";
import { USERS } from "./users";

export const TREND_ID_START = 8790;

const TOPICS: { topic: string; tags: string[] }[] = [
  { topic: "Hydration hack claims", tags: ["health", "wellness"] },
  { topic: "Sunrise rooftop sketch club", tags: ["art", "sketching"] },
  { topic: "Pop-up repair cafe", tags: ["repair", "community"] },
  { topic: "Night market street tacos", tags: ["food", "night market"] },
  { topic: "Community garden swaps", tags: ["gardening", "community"] },
  { topic: "Indie board game nights", tags: ["games", "cafes"] },
  { topic: "Lunchtime run crews", tags: ["running", "fitness"] },
  { topic: "Hand-lettered shop signs", tags: ["design", "small business"] },
  { topic: "Library seed libraries", tags: ["gardening", "libraries"] },
  { topic: "Retro film photo walks", tags: ["photography", "film"] },
  { topic: "Silent reading parties", tags: ["books", "reading"] },
  { topic: "Upcycled denim patches", tags: ["fashion", "upcycling"] },
  { topic: "Balcony birdwatch counts", tags: ["birds", "nature"] },
  { topic: "Rooftop sketch mornings", tags: ["art", "sketching"] },
  { topic: "Neighborhood fridge network", tags: ["food", "mutual aid"] },
  { topic: "Bike bus to school", tags: ["cycling", "families"] },
  { topic: "Cold plunge meetups", tags: ["wellness", "outdoors"] },
  { topic: "Vinyl swap Saturdays", tags: ["music", "vinyl"] },
  { topic: "Micro-forest planting", tags: ["environment", "trees"] },
  { topic: "Open-air chess tables", tags: ["games", "parks"] },
  { topic: "Fermentation workshops", tags: ["food", "workshops"] },
  { topic: "Stairwell choir sessions", tags: ["music", "singing"] },
  { topic: "Tiny desk street concerts", tags: ["music", "live"] },
  { topic: "Thrifted furniture flips", tags: ["design", "thrift"] },
  { topic: "Night sky photo meetups", tags: ["photography", "astronomy"] },
  { topic: "Language exchange picnics", tags: ["languages", "social"] },
  { topic: "Board shorts in winter challenge", tags: ["challenge", "humor"] },
  { topic: "Handmade ceramics markets", tags: ["crafts", "markets"] },
  { topic: "Midnight bakery queues", tags: ["food", "bakeries"] },
  { topic: "Skate park cleanup crews", tags: ["skating", "volunteering"] },
  { topic: "Cardboard boat regatta", tags: ["events", "making"] },
  { topic: "Zine swap meets", tags: ["publishing", "zines"] },
  { topic: "Urban foraging walks", tags: ["nature", "food"] },
  { topic: "Retro arcade pop-ups", tags: ["games", "retro"] },
  { topic: "Dog-friendly cafe crawl", tags: ["pets", "cafes"] },
  { topic: "Mural restoration days", tags: ["art", "volunteering"] },
  { topic: "Lantern walk evenings", tags: ["events", "night"] },
  { topic: "Home espresso latte art", tags: ["coffee", "skills"] },
  { topic: "Sea glass collecting", tags: ["beach", "collecting"] },
  { topic: "Rain garden builds", tags: ["environment", "gardening"] },
  { topic: "Puzzle swap shelves", tags: ["games", "community"] },
  { topic: "Dance-off at the pier", tags: ["dance", "events"] },
  { topic: "Bread starter sharing", tags: ["food", "baking"] },
  { topic: "Community radio hour", tags: ["radio", "music"] },
  { topic: "Trail running sunrise loops", tags: ["running", "outdoors"] },
  { topic: "Kite festival prep", tags: ["events", "making"] },
  { topic: "Street piano sessions", tags: ["music", "public space"] },
  { topic: "Window box flower contest", tags: ["gardening", "contests"] },
  { topic: "Bookshop cat spotting", tags: ["pets", "books"] },
  { topic: "Night swim meetups", tags: ["swimming", "outdoors"] },
  { topic: "Clothes mending circles", tags: ["repair", "fashion"] },
  { topic: "Food truck rally", tags: ["food", "events"] },
  { topic: "Chalk art sidewalks", tags: ["art", "public space"] },
  { topic: "Electric scooter tune-ups", tags: ["repair", "transport"] },
  { topic: "Podcast walk-and-talks", tags: ["podcasts", "walking"] },
  { topic: "Plant cutting library", tags: ["plants", "community"] },
  { topic: "Twilight yoga on the green", tags: ["wellness", "parks"] },
  { topic: "Miniature painting club", tags: ["art", "games"] },
  { topic: "Comic swap corner", tags: ["comics", "community"] },
  { topic: "Solar oven cook-off", tags: ["food", "environment"] },
];

const DURATIONS: readonly (readonly [TrendDurationDays, number])[] = [
  [1, 14],
  [3, 22],
  [7, 30],
  [14, 20],
  [30, 14],
];

const SCOPES: readonly (readonly [GeoScope, number])[] = [
  ["near", 30],
  ["city", 30],
  ["region", 15],
  ["nationwide", 15],
  ["global", 10],
];

function stageFor(score: number, roll: number): TrendStage {
  if (score >= 85) return roll < 0.6 ? "hot" : "peaking";
  if (score >= 65) return roll < 0.6 ? "rising" : "peaking";
  if (score >= 40) return roll < 0.6 ? "rising" : "cooling";
  return roll < 0.6 ? "spark" : "cooling";
}

function locationFor(scope: GeoScope, place: string): string {
  if (scope === "near") return `${place} (approximate area)`;
  if (scope === "city") return "Riverton";
  if (scope === "region") return "Riverton County";
  return scope === "nationwide" ? "Nationwide" : "Global";
}

/** Trends that end early and Trends merged into a duplicate topic. */
const ENDED_EARLY = new Set([8805, 8827, 8846]);
const MERGED: Record<number, number> = { 8803: 8791 };
const FEATURED = new Set([8793, 8799, 8819]);
const SUPPRESSED = new Set([8790, 8816]);

function generateTrends(): TrendRecord[] {
  const rng = createRng(8790);
  return TOPICS.map(({ topic, tags }, index) => {
    const numericId = TREND_ID_START + index;
    const id = `trd-${numericId}`;
    const creator = USERS[(index * 11 + 5) % USERS.length];
    const durationDays = rng.weighted(DURATIONS);
    const windowHours = durationDays * 24;
    const stillActive = rng.chance(0.72);
    const publishedAt = hoursAgo(
      stillActive ? rng.int(1, windowHours - 1) : windowHours + rng.int(1, 24 * 12),
    );
    const expiresAt = addDays(publishedAt, durationDays);
    const score = rng.int(18, 97);
    const geoScope = rng.weighted(SCOPES);
    const expired = Date.parse(expiresAt) <= DEMO_AS_OF_MS;

    let stage: TrendStage = expired ? "expired" : stageFor(score, rng.next());
    if (ENDED_EARLY.has(numericId)) stage = "ended_early";

    const history: TrendRecord["history"] = [
      {
        id: `${id}-h1`,
        at: publishedAt,
        actor: `@${creator.username}`,
        title: `Published with a ${durationDays}-day discovery window`,
        detail: "Expiration fixed at publication",
        tone: "info",
      },
    ];
    if (FEATURED.has(numericId)) {
      history.push({
        id: `${id}-h2`,
        at: hoursAgo(rng.int(1, 30)),
        actor: "Avery Collins",
        title: "Featured on Radar",
        tone: "brand",
      });
    }
    if (SUPPRESSED.has(numericId)) {
      history.push({
        id: `${id}-h3`,
        at: hoursAgo(rng.int(1, 30)),
        actor: "Jordan Reyes",
        title: "Suppressed from discovery",
        detail: "Pending review of reported claims",
        tone: "warning",
      });
    }

    return {
      id,
      topic,
      tags,
      creatorId: creator.id,
      creatorUsername: creator.username,
      geoScope,
      locationLabel: locationFor(geoScope, rng.pick(PLACES)),
      trendScore: expired || stage === "ended_early" ? Math.min(score, 30) : score,
      stage,
      publishedAt,
      expiresAt,
      durationDays,
      activity: {
        qualifiedShares: Math.round(score ** 2 * (0.6 + rng.next())),
        participants: Math.round(score * (4 + rng.next() * 6)),
        creators: rng.int(1, Math.max(2, Math.round(score / 3))),
        saves: Math.round(score * (2 + rng.next() * 3)),
      },
      featured: FEATURED.has(numericId) && !expired,
      suppressed: SUPPRESSED.has(numericId),
      mergedInto: MERGED[numericId] ? `trd-${MERGED[numericId]}` : null,
      history: MERGED[numericId]
        ? [
            ...history,
            {
              id: `${id}-h4`,
              at: hoursAgo(20),
              actor: "Jordan Reyes",
              title: `Merged into trd-${MERGED[numericId]}`,
              detail: "Duplicate topic; origin credit and history retained",
              tone: "neutral" as const,
            },
          ]
        : history,
    };
  });
}

export const TRENDS: readonly TrendRecord[] = generateTrends();
