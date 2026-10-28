import type {
  CopyrightCase,
  CopyrightStatus,
  EvidenceStatus,
  NoticeType,
} from "@/features/copyright/copyrightTypes";
import { CONTENT, CONTENT_IDS_BY_STATUS } from "./content";
import { addDays, addHours, hoursAgo } from "./seed";

const CLAIMANTS = [
  "Northlight Studio (fictional)",
  "Pinecrest Records (fictional)",
  "Harborview Press (fictional)",
  "Copperline Films (fictional)",
  "Meadowsong Music (fictional)",
  "Atlas Photo Agency (fictional)",
];

const WORKS = [
  "Original song recording used as background audio",
  "Photograph republished without permission",
  "Short film clip reposted in full",
  "Illustration used in a Trend thumbnail",
  "Book excerpt read aloud in full",
  "Logo artwork reproduced on merchandise photo",
];

interface Plan {
  status: CopyrightStatus;
  evidence: EvidenceStatus;
  noticeType: NoticeType;
  receivedHoursAgo: number;
  contentId?: string;
}

const PLANS: Plan[] = [
  { status: "received", evidence: "received", noticeType: "takedown", receivedHoursAgo: 9 },
  { status: "received", evidence: "incomplete", noticeType: "takedown", receivedHoursAgo: 30 },
  { status: "under_review", evidence: "verified", noticeType: "takedown", receivedHoursAgo: 52 },
  {
    status: "content_removed",
    evidence: "verified",
    noticeType: "takedown",
    receivedHoursAgo: 260,
    contentId: CONTENT_IDS_BY_STATUS.removedByCopyright[0],
  },
  { status: "rejected", evidence: "incomplete", noticeType: "takedown", receivedHoursAgo: 340 },
  { status: "restored", evidence: "verified", noticeType: "counter_notice", receivedHoursAgo: 420 },
  { status: "received", evidence: "received", noticeType: "counter_notice", receivedHoursAgo: 70 },
  { status: "under_review", evidence: "verified", noticeType: "takedown", receivedHoursAgo: 222 },
  { status: "under_review", evidence: "received", noticeType: "takedown", receivedHoursAgo: 120 },
  {
    status: "content_removed",
    evidence: "verified",
    noticeType: "takedown",
    receivedHoursAgo: 300,
    contentId: CONTENT_IDS_BY_STATUS.removedByCopyright[1],
  },
  {
    status: "rejected",
    evidence: "incomplete",
    noticeType: "counter_notice",
    receivedHoursAgo: 380,
  },
  { status: "restored", evidence: "verified", noticeType: "counter_notice", receivedHoursAgo: 460 },
];

const STATUS_TITLES: Record<CopyrightStatus, string> = {
  received: "Notice received",
  under_review: "Review started",
  content_removed: "Affected content removed",
  rejected: "Notice rejected",
  restored: "Content restored after counter-notice",
};

function generateCases(): CopyrightCase[] {
  const visible = CONTENT.filter((item) => item.moderationStatus === "visible");
  return PLANS.map((plan, index) => {
    const id = `cpy-${110 + index}`;
    const content =
      CONTENT.find((item) => item.id === plan.contentId) ??
      visible[(index * 11 + 6) % visible.length];
    // cpy-118 is the dashboard's "response due in 24 hours" alert.
    const receivedAt = id === "cpy-118" ? "2026-10-18T18:40:00Z" : hoursAgo(plan.receivedHoursAgo);
    const responseDueAt =
      id === "cpy-118"
        ? "2026-10-28T18:40:00Z"
        : addDays(receivedAt, plan.noticeType === "takedown" ? 10 : 14);

    const history: CopyrightCase["history"] = [
      {
        id: `${id}-h1`,
        at: receivedAt,
        actor: CLAIMANTS[index % CLAIMANTS.length],
        title:
          plan.noticeType === "takedown" ? "Takedown notice received" : "Counter-notice received",
        tone: "info",
      },
    ];
    if (plan.status !== "received") {
      history.push({
        id: `${id}-h2`,
        at: addHours(receivedAt, 6),
        actor: "Jordan Reyes",
        title: "Review started",
        tone: "neutral",
      });
    }
    if (["content_removed", "rejected", "restored"].includes(plan.status)) {
      history.push({
        id: `${id}-h3`,
        at: addHours(receivedAt, 48),
        actor: "Jordan Reyes",
        title: STATUS_TITLES[plan.status],
        detail:
          plan.status === "rejected" ? "The notice did not identify the original work." : undefined,
        tone:
          plan.status === "content_removed"
            ? "error"
            : plan.status === "restored"
              ? "success"
              : "neutral",
      });
    }

    return {
      id,
      noticeType: plan.noticeType,
      claimant: CLAIMANTS[index % CLAIMANTS.length],
      workDescription: WORKS[index % WORKS.length],
      contentId: content.id,
      accountId: content.creatorId,
      username: content.creatorUsername,
      status: plan.status,
      evidenceStatus: plan.evidence,
      receivedAt,
      responseDueAt,
      history,
    };
  });
}

export const COPYRIGHT_CASES: readonly CopyrightCase[] = generateCases();
