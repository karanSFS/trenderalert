# Trend Management

### 1. Overview

Directory of Trend discovery records with TrendScore, lifecycle stage, geographic scope and fixed discovery windows. A drawer shows details, demo activity, related content and history. Simulated actions: feature, suppress, end early, correct eligible fields and merge duplicates.

### 2. Requirements

Prompt section 12. CNT14-002 (fixed duration, max 30 days, never extended), TRND-008 (server owns publish time, creator, expiration), RANK14-001 (scopes), JRN14 (Trend Journey continuity), SHR14-004 (origin credit).

### 3. Routes and screens

`/admin/trends` (`TrendsScreen`) with drawer `?open=<id>`; `TrendDialogs` (Correct fields, Merge) and `ConfirmDialog` (feature, suppress, end early).

### 4. User interactions

| Action                                                  | Rule                                                            | Result                                               |
| ------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------- |
| Feature / remove from featured                          | Active, not suppressed or merged; reason                        | Featured flag, history entry, audit                  |
| Suppress / lift suppression                             | Active to suppress; reason                                      | Hidden from discovery; featured cleared              |
| End early                                               | Active; reason; irreversible                                    | Stage "Ended early"                                  |
| Correct fields                                          | Topic (3-80), tags (max 6), location label                      | Only these fields change; expiration shown read-only |
| Merge                                                   | Source not merged; target active, not merged, different; reason | Source marked "Merged into …"; both get history      |
| There is no action to extend, renew or restart a Trend. |

### 5. Components

`TrendsScreen` (with `TrendDrawer`), `useTrendActions`, `TrendDialogs`, shared components.

### 6. Redux state

`trends` slice with context `TrendContext` (content, merged duplicates, merge targets). Thunks `fetchTrends`, `fetchTrend`, `fetchTrendContext`, `setTrendFeatured`, `setTrendSuppressed`, `endTrendEarly`, `correctTrend`, `mergeTrend`.

### 7. Data model

`TrendRecord`: id, topic, tags, creator, geoScope, locationLabel, trendScore, stage (`spark | rising | hot | peaking | cooling | expired | ended_early`), publishedAt, expiresAt, durationDays (1, 3, 7, 14, 30), activity, featured, suppressed, mergedInto, history.

### 8. Mock data

`data/mock/trends.ts`: 60 records `trd-8790`…`trd-8849`, seed 8790; about 72% active. Fixed: featured `trd-8793`, `trd-8799`, `trd-8819`; suppressed `trd-8790`, `trd-8816`; ended early `trd-8805`, `trd-8827`, `trd-8846`; `trd-8803` merged into `trd-8791`.

### 9. Service layer

`TrendsService`: `list`, `get`, `getContext`, `setFeatured`, `setSuppressed`, `endEarly`, `correct`, `merge`.

### 10. Loading and error handling

Standard states; merge target select shows loading while targets are fetched; form errors stay inline.

### 11. Permissions

View `trends:view`, actions `trends:manage` (Super Administrator, Content Moderator).

### 12. Business rules

Expiration never changes. Ending early is final. Featuring never changes TrendScore. Merge keeps origin credit and history. Reasons required except for corrections (corrections record the changed fields).

### 13. Testing

Browser: drawer, end early (stage, disabled button, history). Script: merge rules, feature-merged rejected, correction without changes rejected, expiration unchanged after correction.

### 14. Files changed

`src/components/trends/*`, `src/app/admin/(portal)/trends/page.tsx`, `src/features/trends/*`, `src/data/mock/trends.ts`, `src/services/mock/trendsService.ts`.

### 15. Backend integration requirements

Proposed: `GET /admin/trends`, `GET /admin/trends/{id}`, `GET /admin/trends/{id}/context`, `POST /admin/trends/{id}/feature|suppress|end`, `PATCH /admin/trends/{id}` (topic, tags, location label only), `POST /admin/trends/{id}/merge {targetId, reason}`. The server must reject any change to expiration.

### 16. Known limitations

TrendScore values are illustrative. Ranking weights are proposed on the Discovery screen (`features/discovery.md`).
