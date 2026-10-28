/**
 * Copy and illustrative data for the public website. Every claim must trace to the client
 * specification; see docs/features/promotional-website.md for the traceability table.
 * Preview records are fictional marketing examples, not platform data.
 */

export type LifecycleStage = "Spark" | "Rising" | "Hot" | "Peaking" | "Cooling";
export type PreviewScope = "near" | "city" | "nationwide" | "global";
export type MediaKind = "Photo" | "Video";

export interface PreviewTrend {
  id: string;
  scope: PreviewScope;
  topic: string;
  caption: string;
  media: MediaKind;
  stage: LifecycleStage;
  /** Illustrative 0-100 value. */
  trendScore: number;
  location: string;
  reason: string;
  originCredit: string;
  timeLeft: string;
  activity: string;
}

export const PREVIEW_SCOPES: { value: PreviewScope; label: string }[] = [
  { value: "near", label: "Near You" },
  { value: "city", label: "City" },
  { value: "nationwide", label: "Nationwide" },
  { value: "global", label: "Global" },
];

export const PREVIEW_TRENDS: PreviewTrend[] = [
  {
    id: "pv-01",
    scope: "near",
    topic: "Sunrise rooftop sketch club",
    caption: "Ten people turned up with sketchbooks at 6 a.m. This week there were forty.",
    media: "Photo",
    stage: "Rising",
    trendScore: 68,
    location: "Harbor District (approximate area)",
    reason: "Rising Near You",
    originCredit: "@lina.draws",
    timeLeft: "2 days left",
    activity: "38 participants · 6 creators this week",
  },
  {
    id: "pv-02",
    scope: "near",
    topic: "Pop-up repair cafe",
    caption: "Neighbors fixing lamps, bikes and headphones together every Saturday.",
    media: "Video",
    stage: "Spark",
    trendScore: 41,
    location: "Old Mill Square",
    reason: "Catch It Early",
    originCredit: "@fixit.fran",
    timeLeft: "6 days left",
    activity: "12 participants · first spotted 3 days ago",
  },
  {
    id: "pv-03",
    scope: "near",
    topic: "Night market street tacos",
    caption: "A new stall that keeps selling out before 9 p.m.",
    media: "Photo",
    stage: "Hot",
    trendScore: 82,
    location: "Canal Street Market",
    reason: "Spreading Fast",
    originCredit: "@eatwithomar",
    timeLeft: "18 hours left",
    activity: "214 qualified shares · 19 creators",
  },
  {
    id: "pv-04",
    scope: "city",
    topic: "Community garden swaps",
    caption: "Seed and cutting swaps now running in five neighborhoods.",
    media: "Photo",
    stage: "Rising",
    trendScore: 64,
    location: "Riverton (city-wide)",
    reason: "Spreading to New Areas",
    originCredit: "@greenthumb.jo",
    timeLeft: "9 days left",
    activity: "5 neighborhoods · 27 creators",
  },
  {
    id: "pv-05",
    scope: "city",
    topic: "Indie board game nights",
    caption: "Independent designers testing new games at local cafes.",
    media: "Video",
    stage: "Peaking",
    trendScore: 77,
    location: "Riverton (city-wide)",
    reason: "Rising in Your Selected Area",
    originCredit: "@meeple.maya",
    timeLeft: "4 days left",
    activity: "11 venues · 340 participants",
  },
  {
    id: "pv-06",
    scope: "city",
    topic: "Lunchtime run crews",
    caption: "Short group runs that start and end at office plazas.",
    media: "Photo",
    stage: "Cooling",
    trendScore: 36,
    location: "Riverton Downtown",
    reason: "Previously Trending",
    originCredit: "@runwithdev",
    timeLeft: "Ends today",
    activity: "Momentum slowing after 3 weeks",
  },
  {
    id: "pv-07",
    scope: "nationwide",
    topic: "Hand-lettered shop signs",
    caption: "Small businesses commissioning local sign painters again.",
    media: "Photo",
    stage: "Rising",
    trendScore: 71,
    location: "Seen in 14 states",
    reason: "Originally Spotted By @signs.by.sam",
    originCredit: "@signs.by.sam",
    timeLeft: "12 days left",
    activity: "62 creators · 14 states",
  },
  {
    id: "pv-08",
    scope: "nationwide",
    topic: "Library seed libraries",
    caption: "Public libraries lending seeds alongside books.",
    media: "Video",
    stage: "Spark",
    trendScore: 45,
    location: "Seen in 6 states",
    reason: "Catch It Early",
    originCredit: "@shelf.and.soil",
    timeLeft: "20 days left",
    activity: "9 creators · growing steadily",
  },
  {
    id: "pv-09",
    scope: "nationwide",
    topic: "Retro film photo walks",
    caption: "Group walks shooting on film cameras, shared the same evening.",
    media: "Photo",
    stage: "Hot",
    trendScore: 86,
    location: "Seen in 22 states",
    reason: "Spreading Fast",
    originCredit: "@grain.collective",
    timeLeft: "3 days left",
    activity: "1,180 qualified shares · 140 creators",
  },
  {
    id: "pv-10",
    scope: "global",
    topic: "Silent reading parties",
    caption: "An hour of reading together in parks and cafes, then a chat.",
    media: "Photo",
    stage: "Peaking",
    trendScore: 90,
    location: "Seen in 31 countries",
    reason: "Spreading Fast",
    originCredit: "@quiet.pages",
    timeLeft: "5 days left",
    activity: "2,400 participants · 410 creators",
  },
  {
    id: "pv-11",
    scope: "global",
    topic: "Upcycled denim patches",
    caption: "Old jeans turned into patches and traded between makers.",
    media: "Video",
    stage: "Rising",
    trendScore: 66,
    location: "Seen in 12 countries",
    reason: "Resurfacing",
    originCredit: "@patchwork.kai",
    timeLeft: "14 days left",
    activity: "Rising again after a quiet month",
  },
  {
    id: "pv-12",
    scope: "global",
    topic: "Balcony birdwatch counts",
    caption: "People logging the birds they see from home each morning.",
    media: "Photo",
    stage: "Spark",
    trendScore: 39,
    location: "Seen in 4 countries",
    reason: "Catch It Early",
    originCredit: "@feather.notes",
    timeLeft: "27 days left",
    activity: "15 creators · first spotted last week",
  },
];

/** The five questions every Trend Card answers (OPEN-006). */
export const TREND_CARD_QUESTIONS: { question: string; answer: string }[] = [
  { question: "What is it?", answer: "The topic, media and caption from the original creator." },
  {
    question: "Why is it trending?",
    answer: "Momentum signals such as qualified shares, participation and spread.",
  },
  {
    question: "How early am I?",
    answer: "A lifecycle stage: Spark, Rising, Hot, Peaking or Cooling.",
  },
  {
    question: "Why was it shown to me?",
    answer: "A plain reason, like Rising Near You or Originally Spotted By.",
  },
  {
    question: "What can I do next?",
    answer: "Join, follow, enter the Trend Room, create around it or share.",
  },
];

export type FeatureIcon = "radar" | "first" | "score" | "journey" | "alerts" | "rooms";

export interface LandingFeature {
  icon: FeatureIcon;
  title: string;
  description: string;
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    icon: "radar",
    title: "Trend Radar",
    description:
      "See the hottest and rising Trends near you, in your city, nationwide or worldwide, for now, today, this week or this month.",
  },
  {
    icon: "first",
    title: "First to Trend",
    description:
      "Origin credit follows a Trend everywhere it is shared, so the person who started it is recognized, not just the biggest account.",
  },
  {
    icon: "score",
    title: "TrendScore",
    description:
      "A momentum score built from genuine growth, participation and geographic spread, with duplicate and automated activity filtered out.",
  },
  {
    icon: "journey",
    title: "Trend Journey",
    description:
      "Follow how a topic grows, spreads to new areas and resurfaces over time, even after individual posts expire.",
  },
  {
    icon: "alerts",
    title: "Personal Trend Alerts",
    description:
      "Get a heads-up when something you care about starts to rise, with notifications you control.",
  },
  {
    icon: "rooms",
    title: "Trend Rooms",
    description:
      "Join the conversation around a Trend, meet people who share the interest and take part in what comes next.",
  },
];

export interface HowItWorksStep {
  title: string;
  description: string;
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    title: "Pick a few interests",
    description:
      "Choose around five interests and what you want to do: learn, participate, create or collaborate. You can skip and change them later.",
  },
  {
    title: "See what is starting",
    description:
      "Your Radar shows what is starting to trend for you right away, even before you follow anyone or share a location.",
  },
  {
    title: "Join, follow or create",
    description:
      "Join a Trend, follow it, or create your own with a fixed discovery window of up to 30 days.",
  },
  {
    title: "Get credit as it grows",
    description:
      "Watch the Trend Journey unfold and keep lasting credit for what you started or spotted early.",
  },
];

export type TrustIcon = "location" | "audience" | "expiry" | "report" | "permissions" | "honest";

export interface TrustPoint {
  icon: TrustIcon;
  title: string;
  description: string;
}

export const TRUST_POINTS: TrustPoint[] = [
  {
    icon: "location",
    title: "Approximate places, not live tracking",
    description:
      "Trends show an approximate area or venue. TrenderAlert is designed not to display anyone's exact live position.",
  },
  {
    icon: "audience",
    title: "You choose the audience",
    description:
      "Share each Trend with Everyone, Followers, Trenders, Selected People or Only Me. Shares never widen your audience.",
  },
  {
    icon: "expiry",
    title: "Expiration you set up front",
    description:
      "Pick how long a Trend stays discoverable, then decide whether it stays on your profile, moves to a private archive or is deleted.",
  },
  {
    icon: "report",
    title: "Report and block anywhere",
    description:
      "Every place people post or message includes reporting and blocking, and reports go to a staffed review queue.",
  },
  {
    icon: "permissions",
    title: "Permissions only when needed",
    description:
      "Camera, notifications and location are requested only when you choose a feature that needs them.",
  },
  {
    icon: "honest",
    title: "Honest labels",
    description:
      "Rising, early and nearby labels are based on real activity, and paid promotion is always marked.",
  },
];
