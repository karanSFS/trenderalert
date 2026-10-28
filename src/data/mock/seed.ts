/**
 * Deterministic helpers shared by every mock dataset. Never use Math.random() or the real
 * clock when building mock records; always derive from a fixed seed and DEMO_AS_OF.
 */

export const DEMO_AS_OF = "2026-10-28T00:00:00Z";
export const DEMO_AS_OF_MS = Date.parse(DEMO_AS_OF);
export const HOUR_MS = 3_600_000;
export const DAY_MS = 86_400_000;

/** Mulberry32: small deterministic pseudo-random generator returning [0, 1). */
export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Rng {
  next: () => number;
  int: (min: number, max: number) => number;
  pick: <T>(items: readonly T[]) => T;
  chance: (probability: number) => boolean;
  weighted: <T>(entries: readonly (readonly [T, number])[]) => T;
}

export function createRng(seed: number): Rng {
  const next = seededRandom(seed);
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: (items) => items[Math.floor(next() * items.length)],
    chance: (probability) => next() < probability,
    weighted: (entries) => {
      const total = entries.reduce((acc, [, weight]) => acc + weight, 0);
      let roll = next() * total;
      for (const [value, weight] of entries) {
        roll -= weight;
        if (roll < 0) return value;
      }
      return entries[entries.length - 1][0];
    },
  };
}

/** ISO timestamp `hours` before the demo reference date. */
export const hoursAgo = (hours: number) => new Date(DEMO_AS_OF_MS - hours * HOUR_MS).toISOString();

/** ISO timestamp `days` before the demo reference date. */
export const daysAgo = (days: number) => new Date(DEMO_AS_OF_MS - days * DAY_MS).toISOString();

export const addDays = (iso: string, days: number) =>
  new Date(Date.parse(iso) + days * DAY_MS).toISOString();
export const addHours = (iso: string, hours: number) =>
  new Date(Date.parse(iso) + hours * HOUR_MS).toISOString();

export interface WeightedLabel {
  label: string;
  value: number;
}

/** Splits a total by weights with largest-remainder rounding, so parts add up exactly. */
export function splitByWeights(total: number, weights: readonly WeightedLabel[]): WeightedLabel[] {
  const weightSum = weights.reduce((acc, item) => acc + item.value, 0);
  const raw = weights.map((item) => (total * item.value) / weightSum);
  const floors = raw.map(Math.floor);
  let remainder = total - floors.reduce((acc, value) => acc + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - floors[index] }))
    .sort((a, b) => b.fraction - a.fraction);
  for (const { index } of order) {
    if (remainder <= 0) break;
    floors[index] += 1;
    remainder -= 1;
  }
  return weights.map((item, index) => ({ label: item.label, value: floors[index] }));
}

/** Fictional name pools. Combinations are generated, never real people. */
export const FIRST_NAMES = [
  "Ari",
  "Bea",
  "Cal",
  "Dani",
  "Eli",
  "Fen",
  "Gia",
  "Hal",
  "Ivy",
  "Jon",
  "Kai",
  "Lena",
  "Milo",
  "Nia",
  "Oren",
  "Pia",
  "Quin",
  "Rae",
  "Sol",
  "Tess",
  "Uma",
  "Vic",
  "Wren",
  "Xan",
  "Yara",
  "Zed",
  "Amir",
  "Bryn",
  "Cleo",
  "Dev",
] as const;

export const LAST_NAMES = [
  "Ashby",
  "Brook",
  "Calder",
  "Dune",
  "Ellery",
  "Frost",
  "Garnet",
  "Holloway",
  "Ince",
  "Juniper",
  "Kestrel",
  "Lark",
  "Moss",
  "Northey",
  "Orchard",
  "Pike",
  "Quarry",
  "Reed",
  "Sable",
  "Thorne",
  "Umber",
  "Vale",
  "Wilder",
  "Yew",
  "Zephyr",
  "Alder",
  "Birch",
  "Cove",
  "Dell",
  "Ember",
] as const;

export const HANDLE_SUFFIXES = [
  "draws",
  "runs",
  "cooks",
  "makes",
  "films",
  "plays",
  "reads",
  "builds",
  "shoots",
  "grows",
  "sings",
  "maps",
  "fixes",
  "hikes",
  "paints",
  "codes",
  "brews",
  "writes",
  "spins",
  "rides",
] as const;

/** Fictional places used for approximate locations. */
export const PLACES = [
  "Riverton",
  "Harbor District",
  "Old Mill Square",
  "Canal Street",
  "Maple Heights",
  "Westbrook",
  "Lakeside",
  "Northgate",
  "Cedar Falls",
  "Brightwater",
  "Stonebridge",
  "Elm Park",
] as const;
