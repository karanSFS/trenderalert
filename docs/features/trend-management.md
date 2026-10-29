# Trend Management

### 1. Overview

Read-only list of active Trends from the TrenderAlert backend, with a drawer showing the explainable TrendScore and the Trend's journey across cities.

### 2. Requirements

CNT14-002 (fixed expiry, no extension). RANK14-* (explainable TrendScore). Backend Modules 2 and 3.

### 3. Routes and screens

`/admin/trends` (`TrendsScreen`) with drawer `?open=<trend id>`.

### 4. User interactions

Search (topic, caption, creator, city, id), filter by stage and category, sort by TrendScore, published or expiry date, page, and open a Trend. There are no admin actions on Trends in the backend; reported Trends are suppressed from their moderation report.

### 5. Components

`TrendsScreen` (with `TrendDrawer`, `ScoreBreakdown`), shared `DataTable`, `DetailDrawer`, `Timeline`.

### 6. Redux state

`trends` directory slice with context `TrendInsights`. Thunks `fetchTrends`, `fetchTrend`, `fetchTrendInsights`.

### 7. Data model

`TrendPost` (id, creator, topicId, topicTitle, category, caption, city, h3Cell, stage, trendScore, durationHours, createdAt, expiresAt, daysLeft, firstSpotterBadge), `TrendScoreBreakdown`, `TrendJourney`.

### 8. Mock data

None. The previous mock Trends were removed; Content keeps its own demo Trend posts.

### 9. Service layer

`TrendsService` (`backendServices.ts`), implemented by `services/api/trendsApi.ts`: `GET /trends/`, `GET /trends/{id}`, `GET /trends/topics/{topic}/score`, `GET /radar/journey/{topic}`. Search, filters, sorting and paging run in the portal because the list endpoint returns every active Trend.

### 10. Loading and error handling

Standard table and drawer states; the breakdown and journey show their own empty states if unavailable.

### 11. Permissions

`trends:view` (Super Administrator, Content Moderator).

### 12. Business rules

Expiry is shown as fixed at publication. Factor weights: growth 30, reach 25, spread 20, originality 15, risk penalty 10.

### 13. Testing

Verified against the backend: 7 Trends, drawer with breakdown and four-city journey.

### 14. Files changed

`src/components/trends/TrendsScreen.tsx`, `src/features/trends/*`, `src/services/api/trendsApi.ts`.

### 15. Backend integration requirements

Admin Trend actions (feature, suppress, end early) and server-side paging if the list grows.

### 16. Known limitations

Trend ids change when the backend reseeds its demo data, so old `?open=` links may show "not found".
