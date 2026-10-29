# Operations

> **Status (2026-10-29):** A live status card uses `GET /health` and the dashboard metrics. Objectives, queues, incidents and backlog remain simulated. See [BACKEND_INTEGRATION.md](../BACKEND_INTEGRATION.md).

### 1. Overview

Simulated operations snapshot: backlog counts, incidents with acknowledgement, scheduled maintenance, service objectives and queues.

### 2. Requirements

Prompt section 13 (operations). Spec constraint: no fake live metrics; data is labeled Simulated.

### 3. Routes and screens

`/admin/operations` (`OperationsScreen`).

### 4. User interactions

Refresh the snapshot; acknowledge an unresolved, unacknowledged incident; follow backlog cards to moderation, support and reconciliation.

### 5. Components

`OperationsScreen`, `MetricCard`, `SectionCard`.

### 6. Redux state

`operations` document slice. Thunks `fetchOperations`, `acknowledgeIncident`.

### 7. Data model

`OperationsSnapshot`: asOf, objectives (target and actual availability, p95 latency, error rate), queues, incidents, maintenance, backlog.

### 8. Mock data

`data/mock/operations.ts` matches the dashboard health panel: media processing queue at 14 minutes against a 5-minute target, delayed payment webhooks. Backlog counts are computed from the demo records (open moderation cases, open support cases, unresolved exceptions).

### 9. Service layer

`OperationsService`: `getSnapshot`, `acknowledgeIncident`.

### 10. Loading and error handling

Page skeleton and error state with retry.

### 11. Permissions

`operations:view` (Super Administrator).

### 12. Business rules

Resolved or already acknowledged incidents cannot be acknowledged again. All values are labeled simulated.

### 13. Testing

Acknowledge `inc-77` and confirm the acknowledgement and the audit entry.

### 14. Files changed

`src/components/operations/OperationsScreen.tsx`, `src/app/admin/(portal)/operations/page.tsx`, `src/features/operations/*`, `src/data/mock/operations.ts`, `src/services/mock/operationsService.ts`.

### 15. Backend integration requirements

Proposed: `GET /admin/operations/snapshot`, `POST /admin/operations/incidents/{id}/acknowledgement`. Real values must come from the monitoring stack.

### 16. Known limitations

No time series, paging or runbooks.
