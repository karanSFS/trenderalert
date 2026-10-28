import type {
  ApprovalState,
  Contest,
  ContestEntry,
  ContestStatus,
  ContestType,
  FundingStatus,
  PayoutStatus,
} from "@/features/contests/contestsTypes";
import { addDays, addHours, createRng, daysAgo, hoursAgo } from "./seed";
import { USERS } from "./users";

interface Plan {
  id: string;
  name: string;
  type: ContestType;
  status: ContestStatus;
  sponsor: string;
  description: string;
  opensDaysAgo: number;
  durationDays: number;
  prize: string;
  prizeCents: number;
  funding: FundingStatus;
  approvals: Contest["approvals"];
  rulesLocked: boolean;
  payout: PayoutStatus;
  entries: number;
  disputes?: { summary: string; resolved: boolean }[];
}

const SKILL_JUDGING =
  "Panel of three judges scores originality, craft and theme fit (40/40/20). Likes are not used.";

const approvals = (
  legal: ApprovalState,
  operations: ApprovalState,
  paymentProvider: ApprovalState = "not_required",
) => ({
  legal,
  paymentProvider,
  operations,
});

const PLANS: Plan[] = [
  {
    id: "ctst-301",
    name: "Riverton Summer Snapshots",
    type: "free",
    status: "pending_review",
    sponsor: "Riverton Arts Council (fictional)",
    description: "Photograph the moment that defined summer in your neighborhood.",
    opensDaysAgo: -7,
    durationDays: 21,
    prize: "Gallery feature and art supply bundle",
    prizeCents: 50_000,
    funding: "verified",
    approvals: approvals("pending", "pending"),
    rulesLocked: true,
    payout: "not_started",
    entries: 0,
  },
  {
    id: "ctst-300",
    name: "Harbor Lights Short Film",
    type: "free",
    status: "pending_review",
    sponsor: "Harbor District Film Society (fictional)",
    description: "A 60-second film about the harbor after dark.",
    opensDaysAgo: -10,
    durationDays: 28,
    prize: "Screening at the harbor festival",
    prizeCents: 35_000,
    funding: "verified",
    approvals: approvals("approved", "approved"),
    rulesLocked: true,
    payout: "not_started",
    entries: 0,
  },
  {
    id: "ctst-299",
    name: "Best Night Market Bite",
    type: "free",
    status: "active",
    sponsor: "Canal Street Market Association (fictional)",
    description: "Show the dish everyone should try at the night market.",
    opensDaysAgo: 9,
    durationDays: 21,
    prize: "Featured vendor spotlight and dinner for four",
    prizeCents: 25_000,
    funding: "verified",
    approvals: approvals("approved", "approved"),
    rulesLocked: true,
    payout: "not_started",
    entries: 24,
    disputes: [
      {
        summary: "Entrant says their entry was flagged as a duplicate by mistake.",
        resolved: false,
      },
    ],
  },
  {
    id: "ctst-298",
    name: "Repair Cafe Rescue Stories",
    type: "free",
    status: "active",
    sponsor: "Old Mill Makers (fictional)",
    description: "Share the best before-and-after repair from a local repair cafe.",
    opensDaysAgo: 5,
    durationDays: 28,
    prize: "Tool kit and workshop pass",
    prizeCents: 30_000,
    funding: "verified",
    approvals: approvals("approved", "approved"),
    rulesLocked: true,
    payout: "not_started",
    entries: 13,
  },
  {
    id: "ctst-296",
    name: "Lantern Walk Photo Prize",
    type: "free",
    status: "active",
    sponsor: "Brightwater Events (fictional)",
    description: "Capture the lantern walk at its brightest.",
    opensDaysAgo: 12,
    durationDays: 20,
    prize: "Camera gift card",
    prizeCents: 40_000,
    funding: "verified",
    approvals: approvals("approved", "approved"),
    rulesLocked: true,
    payout: "not_started",
    entries: 31,
  },
  {
    id: "ctst-293",
    name: "Micro-Forest Planting Diaries",
    type: "free",
    status: "active",
    sponsor: "Green Riverton (fictional)",
    description: "Document a planting day from start to finish.",
    opensDaysAgo: 18,
    durationDays: 30,
    prize: "Native plant bundle for a school",
    prizeCents: 60_000,
    funding: "verified",
    approvals: approvals("approved", "approved"),
    rulesLocked: true,
    payout: "not_started",
    entries: 19,
  },
  {
    id: "ctst-295",
    name: "Sketch the City",
    type: "free",
    status: "judging",
    sponsor: "Harbor District Library (fictional)",
    description: "One sketch of a city corner, any medium.",
    opensDaysAgo: 35,
    durationDays: 28,
    prize: "Exhibition at the library and sketch kit",
    prizeCents: 35_000,
    funding: "verified",
    approvals: approvals("approved", "approved"),
    rulesLocked: true,
    payout: "not_started",
    entries: 40,
    disputes: [
      { summary: "Entrant asks why their late submission was not accepted.", resolved: true },
    ],
  },
  {
    id: "ctst-291",
    name: "Bike Bus Banner Design",
    type: "free",
    status: "completed",
    sponsor: "Westbrook Schools (fictional)",
    description: "Design a banner for the school bike bus.",
    opensDaysAgo: 70,
    durationDays: 30,
    prize: "Printed banner and bike gear",
    prizeCents: 20_000,
    funding: "verified",
    approvals: approvals("approved", "approved"),
    rulesLocked: true,
    payout: "delivered",
    entries: 22,
  },
  {
    id: "ctst-290",
    name: "Autumn Window Box Contest",
    type: "free",
    status: "completed",
    sponsor: "Maple Heights Garden Club (fictional)",
    description: "Show off your autumn window box.",
    opensDaysAgo: 80,
    durationDays: 21,
    prize: "Garden center voucher",
    prizeCents: 15_000,
    funding: "verified",
    approvals: approvals("approved", "approved"),
    rulesLocked: true,
    payout: "pending_verification",
    entries: 17,
  },
  {
    id: "ctst-297",
    name: "Upcycled Fashion Challenge",
    type: "free",
    status: "approved",
    sponsor: "Thread Again Collective (fictional)",
    description: "Turn something old into something you would wear.",
    opensDaysAgo: -3,
    durationDays: 21,
    prize: "Sewing machine",
    prizeCents: 45_000,
    funding: "verified",
    approvals: approvals("approved", "approved"),
    rulesLocked: true,
    payout: "not_started",
    entries: 0,
  },
  {
    id: "ctst-304",
    name: "Regional Dance-Off (paid entry)",
    type: "paid",
    status: "pending_review",
    sponsor: "Pier Events Co. (fictional)",
    description: "Paid-entry dance competition with a cash prize pool.",
    opensDaysAgo: -14,
    durationDays: 21,
    prize: "Cash prize pool",
    prizeCents: 500_000,
    funding: "pending_proof",
    approvals: approvals("pending", "not_started", "pending"),
    rulesLocked: true,
    payout: "not_applicable",
    entries: 0,
  },
  {
    id: "ctst-302",
    name: "City Talent Showdown (paid entry)",
    type: "paid",
    status: "draft",
    sponsor: "Stonebridge Promotions (fictional)",
    description: "Draft of a paid-entry talent contest.",
    opensDaysAgo: -30,
    durationDays: 30,
    prize: "Cash prize",
    prizeCents: 250_000,
    funding: "pending_proof",
    approvals: approvals("not_started", "not_started", "not_started"),
    rulesLocked: false,
    payout: "not_applicable",
    entries: 0,
  },
  {
    id: "ctst-303",
    name: "Community Garden Makeover",
    type: "free",
    status: "draft",
    sponsor: "Elm Park Neighbors (fictional)",
    description: "Before-and-after makeovers of shared garden plots.",
    opensDaysAgo: -20,
    durationDays: 21,
    prize: "Garden equipment",
    prizeCents: 30_000,
    funding: "pending_proof",
    approvals: approvals("not_started", "not_started"),
    rulesLocked: false,
    payout: "not_started",
    entries: 0,
  },
  {
    id: "ctst-288",
    name: "Street Piano Sessions",
    type: "free",
    status: "cancelled",
    sponsor: "Downtown Music Trust (fictional)",
    description: "Cancelled after the venue partner withdrew.",
    opensDaysAgo: 40,
    durationDays: 21,
    prize: "Recording session",
    prizeCents: 20_000,
    funding: "verified",
    approvals: approvals("approved", "approved"),
    rulesLocked: true,
    payout: "not_applicable",
    entries: 6,
  },
];

const FLAG_REASONS = [
  "Possible duplicate account",
  "Entry may reuse another member's photo",
  "Submitted from an unapproved jurisdiction",
];

function generateContests(): Contest[] {
  const rng = createRng(301);
  return PLANS.map((plan, planIndex) => {
    const entryOpensAt = daysAgo(plan.opensDaysAgo);
    const entryClosesAt = addDays(entryOpensAt, plan.durationDays);
    const judged = plan.status === "judging" || plan.status === "completed";

    const entries: ContestEntry[] = Array.from({ length: plan.entries }, (_, index) => {
      const user = USERS[(planIndex * 13 + index * 7) % USERS.length];
      const roll = rng.next();
      const status = roll < 0.07 ? "flagged" : roll < 0.1 ? "disqualified" : "valid";
      return {
        id: `${plan.id}-e${String(index + 1).padStart(2, "0")}`,
        userId: user.id,
        username: user.username,
        submittedAt: addHours(entryOpensAt, rng.int(2, Math.max(3, plan.durationDays * 20))),
        status,
        score: judged && status === "valid" ? rng.int(55, 98) : null,
        flagReason: status === "valid" ? null : rng.pick(FLAG_REASONS),
      };
    });

    const history: Contest["history"] = [
      {
        id: `${plan.id}-h1`,
        at: addDays(entryOpensAt, -20),
        actor: "Sofia Laurent",
        title: "Draft created",
        tone: "neutral",
      },
    ];
    if (plan.status !== "draft") {
      history.push({
        id: `${plan.id}-h2`,
        at: plan.id === "ctst-301" ? "2026-10-27T10:51:00Z" : addDays(entryOpensAt, -14),
        actor: "Sofia Laurent",
        title: "Submitted for legal review",
        detail: `Official rules v1.${planIndex % 3} locked`,
        tone: "info",
      });
    }
    if (["approved", "active", "judging", "completed", "cancelled"].includes(plan.status)) {
      history.push({
        id: `${plan.id}-h3`,
        at: addDays(entryOpensAt, -7),
        actor: "Avery Collins",
        title: "Approved for publication",
        tone: "success",
      });
    }
    if (plan.status === "cancelled") {
      history.push({
        id: `${plan.id}-h4`,
        at: addDays(entryOpensAt, 6),
        actor: "Sofia Laurent",
        title: "Contest cancelled",
        detail: "Venue partner withdrew. Entrants notified under the official rules.",
        tone: "error",
      });
    }

    return {
      id: plan.id,
      name: plan.name,
      type: plan.type,
      status: plan.status,
      sponsor: plan.sponsor,
      description: plan.description,
      entryOpensAt,
      entryClosesAt,
      eligibility: {
        minimumAge: plan.type === "paid" ? 18 : 13,
        jurisdictions: ["United States"],
        entryLimit: 1,
      },
      prize: { description: plan.prize, valueCents: plan.prizeCents },
      fundingStatus: plan.funding,
      approvals: plan.approvals,
      rules: {
        version: `v1.${planIndex % 3}`,
        locked: plan.rulesLocked,
        judgingMethod: SKILL_JUDGING,
      },
      payoutStatus: plan.payout,
      entries,
      disputes: (plan.disputes ?? []).map((dispute, index) => ({
        id: `${plan.id}-d${index + 1}`,
        entryId: entries[index]?.id ?? null,
        username: entries[index]?.username ?? "member",
        openedAt: hoursAgo(20 + index * 30),
        summary: dispute.summary,
        status: dispute.resolved ? "resolved" : "open",
        resolution: dispute.resolved
          ? "The official rules set a firm deadline; the decision stands."
          : null,
      })),
      history,
    };
  });
}

export const CONTESTS: readonly Contest[] = generateContests();
