import type { EntityId, IsoDateString } from "@/types/common";

export type ContentType = "trend" | "profile_post";
/** Audience options from CNT14-004 / TRND-004. */
export type Audience = "everyone" | "followers" | "trenders" | "selected" | "only_me";
export type ContentModerationStatus = "visible" | "under_review" | "limited" | "removed";

export interface ContentItem {
  /** `trd-####` for Trend posts (shared with the Trend record), `pst-#####` for Profile Posts. */
  id: EntityId;
  type: ContentType;
  creatorId: EntityId;
  creatorUsername: string;
  caption: string;
  media: "photo" | "video";
  audience: Audience;
  publishedAt: IsoDateString;
  moderationStatus: ContentModerationStatus;
  reportCount: number;
}

export interface ContentFilters {
  type?: ContentType;
  audience?: Audience;
  moderationStatus?: ContentModerationStatus;
  /** Set from a user's detail page; shown as a removable chip. */
  creatorId?: EntityId;
}

export type ContentAction = "remove" | "limit" | "restore";
