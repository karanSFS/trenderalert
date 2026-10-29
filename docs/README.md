# TrenderAlert Frontend Documentation

This folder documents the TrenderAlert frontend: the public website at `/` and the administration portal at `/admin`. Sign-in, the dashboard's live section, Users, Trends, Moderation, Appeals, Feature flags, Admin users, Audit logs, the support lookup, Discovery ranking and Operations status use the TrenderAlert backend (see [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)). Other modules still run on labelled demo data.

## How the documents are organized

| Document                                                   | What it covers                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)                 | Purpose, stack, structure, routes, demo limitations                       |
| [REQUIREMENTS_MAPPING.md](REQUIREMENTS_MAPPING.md)         | Specification requirements mapped to code and acceptance status           |
| [ARCHITECTURE.md](ARCHITECTURE.md)                         | App Router layout, providers, data flow, error handling                   |
| [ROUTING.md](ROUTING.md)                                   | Public and admin routes, layout boundaries, navigation config             |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)                       | Typography, spacing, shared components, accessibility                     |
| [THEME_SYSTEM.md](THEME_SYSTEM.md)                         | Tokens, presets, CSS variables, Ant Design and styled-components sync     |
| [REDUX_STATE_MANAGEMENT.md](REDUX_STATE_MANAGEMENT.md)     | Store, slices, async thunks, persistence                                  |
| [MOCK_DATA_GUIDE.md](MOCK_DATA_GUIDE.md)                   | Where mock data lives and how to extend it                                |
| [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)           | Connected endpoints, proxy, pagination, role access, known backend issues |
| [MOCK_API_INTEGRATION.md](MOCK_API_INTEGRATION.md)         | Mock service layer and how to swap in real APIs                           |
| [AUTHENTICATION_AND_ROLES.md](AUTHENTICATION_AND_ROLES.md) | Backend sign-in flow, role resolution, permission map                     |
| [SECURITY.md](SECURITY.md)                                 | Demo limitations and production security requirements                     |
| [TESTING.md](TESTING.md)                                   | Checks to run and manual verification steps                               |
| [DEVELOPMENT_GUIDELINES.md](DEVELOPMENT_GUIDELINES.md)     | Conventions for code, styling, state and docs                             |
| [CHANGELOG.md](CHANGELOG.md)                               | Chronological record of meaningful changes                                |
| [features/](features/)                                     | One document per feature, using the template in `features/_TEMPLATE.md`   |

## Source of requirements

The controlling specification is the client document _TrenderAlert Master Complete Build Specification_ (Version 15 correction, Version 14, Version 13). Requirement identifiers such as `CNT14-002` or `D-07` refer to that document.

## Updating documentation

1. Update the relevant feature file in `features/` whenever a feature changes. Use the 16-section template and mark sections that do not apply as "Not applicable".
2. Add an entry to `CHANGELOG.md`.
3. Update the acceptance status in `REQUIREMENTS_MAPPING.md`.
4. Never mark something complete because its page renders. It is complete when its interactions, state, failure states and docs are done.
