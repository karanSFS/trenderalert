# Security

## Current state

This frontend is a demonstration running on fictional local data. It has **no** real security boundary.

## Sensitive data handling

- Mock data contains only fictional people. Demo emails use the reserved `.test` domain.
- No passwords, tokens, payment credentials or secrets are stored in code, mock data or `localStorage`.
- `localStorage` holds only the theme preference, sidebar state and the selected demo account id.
- Support screens show masked contact details only (for example `ar*****@members.demo.test`) and a notice that passwords, payment details and precise locations are never shown, matching the specification's Support Agent definition. Masking must also be enforced by the backend.
- Subscription and transaction screens show opaque store references, never payment credentials.
- Administrator records show MFA status only; there are no MFA secrets.

## Demo authentication limitations

- Anyone can sign in as any role, and can edit `localStorage` to impersonate another account.
- Role checks only hide navigation and screens. They do not protect data.
- See [AUTHENTICATION_AND_ROLES.md](AUTHENTICATION_AND_ROLES.md).

## Backend authorization requirements

- Every API request must be authenticated and authorized on the server by role and scope.
- The server is the authority for record visibility, audience rules, Trend expiration (server UTC time) and permitted actions.
- Sensitive operations (account restrictions, refunds, payouts, configuration changes, feature-flag changes, role changes) require server-side validation and audit records.
- Contest approvals, feature-flag gates and policy publishing must be recorded by the responsible teams in the backend. The demo shows them read-only and never marks them complete.

## Audit logging

Demo mutations record demo audit events. Since Phase 6 these are appended to the in-memory demo database and listed on **Audit logs** next to seeded history. The list cannot be edited or deleted, and export is disabled ("Requires backend authorization"). These are not real audit logs: they reset on reload. Production audit logs must be written server-side and be tamper-evident.

## Financial safety

- No payment provider, bank or payout service is connected; no money moves.
- The ledger is append-only. A refund request creates a new linked record; existing amounts are never changed.
- Paid contests stay disabled until every gate is recorded by the backend.

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
