# Configuration and feature flags

### 1. Overview

Platform settings (editable and fixed-by-policy), announcements, policy versions, and feature flags with read-only gates.

### 2. Requirements

Prompt section 13 (configuration, feature flags). Specification CNT14-002 (30-day maximum), D-10 (30-day deletion grace), minimum ages 13 and 18, one pre-expiration warning, D-05 (prices configured remotely), AUTH-009 (renewed consent).

### 3. Routes and screens

- `/admin/configuration` (`ConfigurationScreen`): tabs Settings, Announcements, Policy versions.
- `/admin/configuration/feature-flags` (`FeatureFlagsScreen`).

### 4. User interactions

| Action                       | Rule                                                            | Result                   |
| ---------------------------- | --------------------------------------------------------------- | ------------------------ |
| Save settings                | Durations 1 to 30 days; ranges per field                        | Saved                    |
| New or edit announcement     | Title 5+, message 10+, end after start; ended ones not editable | Scheduled, live or ended |
| End announcement             | Not ended                                                       | Ended now                |
| Change flag state or rollout | Whole percent 0 to 100; reason; gates                           | Saved                    |

### 5. Components

`ConfigurationScreen` (`SettingsTab`, `AnnouncementsTab`, `PoliciesTab`), `FeatureFlagsScreen`.

### 6. Redux state

`configuration` document slice shared by both pages. Thunks `fetchConfiguration`, `updateSettings`, `saveAnnouncement`, `endAnnouncement`, `updateFeatureFlag`.

### 7. Data model

`ConfigurationData`: settings, announcements, policies, flags. `FeatureFlag` has `activationGated` and `gates[]` (label, satisfied).

### 8. Mock data

`data/mock/configuration.ts`. "Trend Rooms" is on at 50% of a test market (dashboard alert). `paid_contests` is off with six outstanding gates. The "Scheduled maintenance window" announcement matches the dashboard activity.

### 9. Service layer

`ConfigurationService`: `get`, `updateSettings`, `saveAnnouncement`, `endAnnouncement`, `updateFlag`.

### 10. Loading and error handling

Page skeleton and error state; form errors inline.

### 11. Permissions

View `configuration:view`, act `configuration:manage` (Super Administrator).

### 12. Business rules

Fixed values (deletion grace, minimum ages, pre-expiration warnings, Premium price) are read-only. `paid_contests` cannot be enabled while any gate is outstanding; other flags with outstanding gates can only be reduced or turned off. Gates are recorded by the backend and cannot be changed here. Policy publishing requires legal approval outside the portal.

### 13. Testing

Script: enabling `paid_contests` is rejected; a 31-day duration is rejected; Trend Rooms rollout can change with a reason.

### 14. Files changed

`src/components/configuration/*`, `src/app/admin/(portal)/configuration/**`, `src/features/configuration/*`, `src/data/mock/configuration.ts`, `src/services/mock/configurationService.ts`.

### 15. Backend integration requirements

Proposed: `GET /admin/configuration`, `PATCH /admin/configuration/settings`, `POST/PATCH /admin/announcements`, `PATCH /admin/feature-flags/{key} {enabled, rollout, reason}`. Gate records must come from the backend.

### 16. Known limitations

No policy text editor and no scheduled flag changes.
