# Security

## Current state

This frontend is a demonstration running on fictional local data. It has **no** real security boundary.

## Sensitive data handling

- Mock data contains only fictional people. Demo emails use the reserved `.test` domain.
- No passwords, tokens, payment credentials or secrets are stored in code, mock data or `localStorage`.
- `localStorage` holds only the theme preference, sidebar state and the selected demo account id.
- Support screens (Phase 6) must not show passwords, payment credentials or unnecessary personal data, matching the specification's Support Agent definition.

## Demo authentication limitations

- Anyone can sign in as any role, and can edit `localStorage` to impersonate another account.
- Role checks only hide navigation and screens. They do not protect data.
- See [AUTHENTICATION_AND_ROLES.md](AUTHENTICATION_AND_ROLES.md).

## Backend authorization requirements

- Every API request must be authenticated and authorized on the server by role and scope.
- The server is the authority for record visibility, audience rules, Trend expiration (server UTC time) and permitted actions.
- Sensitive operations (account restrictions, refunds, payouts, configuration changes, role changes) require server-side validation and audit records.

## Audit logging

Phase 1 has no auditable actions. Demo mutations added later will record demo audit events in Redux so the flow can be shown. These are not real audit logs. Production audit logs must be written server-side and be tamper-evident.

## Secure configuration

- Environment variables prefixed `NEXT_PUBLIC_` are visible to the browser. Only mock-layer settings are defined (`.env.example`). Never place secrets in `NEXT_PUBLIC_` variables.
- Admin pages set `robots: noindex, nofollow`.
- The sign-in page only honors `next` redirects that start with `/admin/`, which prevents open redirects.

## Capture protection

The specification (CAP14-001) lists designated administrative screens among surfaces that may need capture protection. Web browsers cannot reliably prevent screenshots. If required, this must be handled by policy and platform controls, not promised by this frontend.

## Production readiness gaps

- Real authentication, MFA and server sessions.
- Server-side authorization and audit logging.
- Content Security Policy and security headers.
- Rate limiting and abuse protection on admin APIs.
- Removal of the demo sign-in and demo role switcher.
