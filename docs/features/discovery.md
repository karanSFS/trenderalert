# Discovery

> **Status (2026-10-29):** The Ranking tab edits the live `RANKING_ALGORITHM_V14` feature flag weights (must total 100%, justification required). Markets, locations, sources, freshness and relevance remain demo data. See [BACKEND_INTEGRATION.md](../BACKEND_INTEGRATION.md).

### 1. Overview

Discovery settings in tabs: markets, featured locations, sources, freshness and relevance, and a ranking-weights proposal.

### 2. Requirements

Prompt section 13 (discovery). Specification D-03 (approximate locations only), CNT14-002 (freshness) and the owner decision on TrendScore weighting (presented as a proposal).

### 3. Routes and screens

`/admin/discovery` (`DiscoveryScreen`).

### 4. User interactions

| Action                  | Rule                                                       | Result                   |
| ----------------------- | ---------------------------------------------------------- | ------------------------ |
| Change market status    | Different status                                           | Active, Pilot or Planned |
| Feature a location      | —                                                          | Toggled                  |
| Include a source        | —                                                          | Toggled                  |
| Change relevance radius | Distance-based scope; whole km from 1 to 500               | Saved                    |
| Save ranking proposal   | Weights are whole numbers summing to 100; Rising below Hot | New proposal version     |

Freshness windows are read-only. Paid contests per market show "Requires jurisdiction approval".

### 5. Components

`DiscoveryScreen` with `MarketsTab`, `LocationsTab`, `SourcesTab`, `FreshnessTab`, `RankingTab`.

### 6. Redux state

`discovery` document slice. Thunks `fetchDiscovery`, `updateDiscovery`.

### 7. Data model

`DiscoveryConfig`: markets, featuredLocations, sources, freshness, relevance, ranking (version, factors with percent weights, thresholds).

### 8. Mock data

`data/mock/discovery.ts`: five fictional markets, five locations, four sources, four freshness windows, five scopes and ranking `proposal-3`.

### 9. Service layer

`DiscoveryService`: `get`, `update(DiscoveryUpdate)`.

### 10. Loading and error handling

Page skeleton while loading; error state with retry. Validation errors show inline and in a toast.

### 11. Permissions

View `discovery:view`, act `discovery:manage` (Super Administrator).

### 12. Business rules

Ranking weights must add up to 100%. Locations are approximate areas; exact member positions are never used.

### 13. Testing

Script: weights totalling 95 are rejected; Rising at or above Hot is rejected.

### 14. Files changed

`src/components/discovery/DiscoveryScreen.tsx`, `src/app/admin/(portal)/discovery/page.tsx`, `src/features/discovery/*`, `src/data/mock/discovery.ts`, `src/services/mock/discoveryService.ts`.

### 15. Backend integration requirements

Proposed: `GET /admin/discovery`, `PATCH /admin/discovery/{section}`. Ranking changes need owner approval and versioning in the backend.

### 16. Known limitations

No map view or location search; ranking is not connected to a scoring service.
