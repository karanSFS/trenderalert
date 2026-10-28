# Content Management

### 1. Overview

Directory of Trends and Profile Posts with audience and moderation status, a detail drawer with creator, linked Trend and related reports, and simulated remove, limit and restore actions.

### 2. Requirements

Prompt section 12. CNT14-001 (Trend vs Profile Post), CNT14-004 and TRND-004 (audiences), SHR14-003/005 (removal cascades to shares).

### 3. Routes and screens

`/admin/content` (`ContentScreen`) with a drawer opened by `?open=<id>` (deep-linkable from other modules).

### 4. User interactions

| Action                                                                                         | Rule                            | Result                      |
| ---------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------- |
| Search caption, creator, id; filter type, audience, moderation status; sort reports, published | —                               | Query kept in Redux         |
| Creator filter                                                                                 | Set from a user's detail page   | Removable "Creator" chip    |
| Remove                                                                                         | Not already removed; reason     | Status Removed; audit event |
| Limit visibility                                                                               | Visible or under review; reason | Status Limited; audit event |
| Restore                                                                                        | Removed or limited; reason      | Status Visible; audit event |

### 5. Components

`ContentScreen` (with `ContentDrawer`), `useContentActions`, shared table, filter bar, drawer, `EntityLink`, `useConfirm`, `useOpenParam`.

### 6. Redux state

`content` slice (directory factory) with context `ContentContext` (reports, Trend, creator). Thunks `fetchContentList`, `fetchContentItem`, `fetchContentContext`, `moderateContent`.

### 7. Data model

`ContentItem`: id (`trd-####` or `pst-#####`), type, creatorId, creatorUsername, caption, media, audience, publishedAt, moderationStatus (`visible | under_review | limited | removed`), reportCount.

### 8. Mock data

`data/mock/content.ts`: 60 Trend posts (one per Trend record) and 40 Profile Posts (`pst-22000`…`pst-22039`). Pre-assigned states: 14 removed (12 by moderation, 2 by copyright), 5 limited, 8 under review, so seeded cases match.

### 9. Service layer

`ContentService`: `list`, `get`, `getContext`, `moderate(id, action, reason, actor)`.

### 10. Loading and error handling

Standard table states; drawer shows a skeleton, then content; related sections show "Loading…" until context arrives; dialog errors keep the dialog open.

### 11. Permissions

View: `content:view` (Super Administrator, Content Moderator, Contest Administrator). Actions: `content:moderate` (Super Administrator, Content Moderator). Contest Administrators see the drawer without actions.

### 12. Business rules

Reason required. Removal applies everywhere the content appears (SHR14-005). Restore does not change a Trend's fixed expiration.

### 13. Testing

Manual: search, filters, creator chip, drawer deep link, each action. Cross-module: content removed from a moderation case shows Removed here (verified by script).

### 14. Files changed

`src/components/content/*`, `src/app/admin/(portal)/content/page.tsx`, `src/features/content/*`, `src/data/mock/content.ts`, `src/services/mock/contentService.ts`.

### 15. Backend integration requirements

Proposed: `GET /admin/content`, `GET /admin/content/{id}`, `GET /admin/content/{id}/context`, `POST /admin/content/{id}/moderation {action, reason}`. Removal must cascade to shares, feeds, search and media delivery server-side.

### 16. Known limitations

No media previews (placeholders only). Audience cannot be changed by admins (creator-controlled per SHR14-001).
