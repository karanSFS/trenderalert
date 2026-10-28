# Promotional Website

### 1. Overview

The public marketing site at `/`. It explains what TrenderAlert is, shows an illustrative product preview, lists core capabilities, explains how it works and how privacy is handled, and guides visitors to the next step. It shares brand tokens with the admin portal but has its own layout.

### 2. Requirements

Prompt section 18 (header, hero, product preview, features, how it works, privacy and trust, final CTA, footer, responsive and accessible behavior, no fake store links). Copy is constrained to the client specification; see the traceability table in section 12.

### 3. Routes and screens

- `/` with section anchors `#product`, `#features`, `#how-it-works`, `#privacy`.
- Linked pages: `/privacy`, `/terms`, `/support` (placeholder content).
- Dialog: mobile navigation drawer.

### 4. User interactions

- Header and footer anchors scroll smoothly to sections, including from other pages (`/#features`). `scroll-padding-top` keeps headings clear of the sticky header.
- Mobile (below 992px): menu button opens a drawer with the same links; selecting one closes it.
- Product preview: a scope switcher (Near You, City, Nationwide, Global) swaps the illustrative Trend Cards.
- Theme switcher in the header (shared with the admin portal).
- CTAs: "Explore What's Next" (to `#product`), "How it works", "Contact us" (to `/support`), "Explore features".

### 5. Components

All in `src/components/promotional/`:

| Component                                                    | Type            | Purpose                                           |
| ------------------------------------------------------------ | --------------- | ------------------------------------------------- |
| `PublicHeader`, `PublicMobileNav`                            | Server / client | Navigation                                        |
| `HeroSection`, `HeroRadar`                                   | Server          | Headline, CTAs, decorative radar with one card    |
| `ProductSection`                                             | Server          | Section frame and "Every Trend Card answers" list |
| `ProductPreview`                                             | Client          | Scope switcher and card grid                      |
| `PreviewTrendCard`                                           | Shared          | Illustrative Trend Card                           |
| `FeatureSection`, `HowItWorksSection`, `PrivacyTrustSection` | Server          | Content sections                                  |
| `CallToAction`, `AppAvailability`                            | Server          | Final CTA and store availability                  |
| `SectionHeading`                                             | Server          | Eyebrow, title, lead                              |
| `PublicFooter`                                               | Server          | Product and legal columns                         |
| `icons.ts`                                                   | Client boundary | Re-exports antd icons for Server Components       |

### 6. Redux state

Only the shared `theme` slice (via the theme switcher). Section content is static and does not use Redux.

### 7. Data model

`src/content/landing.ts`: `PreviewTrend`, `LifecycleStage`, `PreviewScope`, `LandingFeature`, `HowItWorksStep`, `TrustPoint`.

### 8. Mock data

`PREVIEW_TRENDS` in `src/content/landing.ts`: twelve fictional Trends, three per scope. This is static marketing content, not API data, so it lives in `src/content/` rather than `src/data/mock/`, and it is labeled "Illustrative example. Not live data." wherever it appears. Example:

```ts
{ id: "pv-03", scope: "near", topic: "Night market street tacos", stage: "Hot", trendScore: 82,
  location: "Canal Street Market", reason: "Spreading Fast", originCredit: "@eatwithomar",
  timeLeft: "18 hours left", activity: "214 qualified shares · 19 creators", ... }
```

### 9. Service layer

Not applicable. The site has no data requests.

### 10. Loading and error handling

The page is statically prerendered, so there is no loading state. Errors fall back to `src/app/error.tsx`. The preview has no empty state because every scope has content.

### 11. Permissions

Public. No restrictions.

### 12. Business rules

- No app-store links until approved URLs are set in `src/lib/constants/publicSite.ts` (`APP_STORE_URL`, `GOOGLE_PLAY_URL`). While `null`, a non-clickable "Coming to iOS / Android" badge shows.
- No email capture, waitlist or social links (no approved destinations).
- Preview data never implies live activity.
- Copy traceability:

| Copy                                                                                                       | Specification source                         |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| "See Tomorrow. Today.", "Explore What's Next", CTA line                                                    | OPEN-001                                     |
| Near You, city, nationwide, global; now, today, this week, this month                                      | RANK14-001                                   |
| Spark, Rising, Hot, Peaking, Cooling                                                                       | OPEN-006                                     |
| Five Trend Card questions                                                                                  | OPEN-006                                     |
| Reasons: Rising Near You, Spreading Fast, Originally Spotted By, Catch It Early                            | RANK14-004, OPEN-005                         |
| Resurfacing, Spreading to New Areas                                                                        | JRN14-002                                    |
| Origin credit everywhere a Trend is shared                                                                 | SHR14-004                                    |
| TrendScore excludes duplicate and automated activity                                                       | RANK14-002, MET14-003                        |
| Trend Radar, First to Trend, TrendScore, Trend Journey, Personal Trend Alerts, Trend Rooms, Join the Trend | Signature feature portfolio                  |
| Around five interests, skip allowed                                                                        | OPEN-003                                     |
| Useful Radar before following anyone or sharing location                                                   | OPEN-004                                     |
| Fixed discovery window up to 30 days                                                                       | CNT14-002                                    |
| Profile, private archive or delete after expiration                                                        | CNT14-004                                    |
| Audiences Everyone, Followers, Trenders, Selected People, Only Me; shares never widen audience             | CNT14-004, SHR14-002                         |
| Approximate area or venue, not exact live position                                                         | Version 13 location decision, D-03, TRND-007 |
| Report and block everywhere, staffed queue                                                                 | Product goals ("Safe community")             |
| Permissions only when needed                                                                               | OPEN-011                                     |
| Honest labels, paid promotion marked                                                                       | OPEN-013                                     |
| Not a dating app                                                                                           | Version 13 Trend First Product Identity      |

### 13. Testing

Manual (verified on 2026-10-28):

1. All header, footer and drawer anchors scroll to their sections, from `/` and from `/support`.
2. The scope switcher swaps cards for each scope.
3. Light, dark and all presets render correctly; no hydration errors on reload with a saved theme.
4. Mobile 390px: no horizontal overflow; hero stacks; drawer works.
5. `prefers-reduced-motion: reduce` stops the radar animation.
   Automated tests: not yet available.

### 14. Files changed

`src/content/landing.ts`, `src/lib/constants/publicSite.ts`, `src/components/promotional/*` (new sections, CSS Modules, `icons.ts`), `src/app/(public)/page.tsx`, `src/app/globals.css` (`scroll-padding-top`).

### 15. Backend integration requirements

None required. If live Trends are ever shown on the public site, they would need a public, privacy-filtered endpoint (proposed, not defined) and must respect audience and location rules.

### 16. Known limitations

- Logo is the placeholder wordmark.
- No real product screenshots; the preview is HTML artwork pending approved designs.
- Store links and approved legal copy are pending.
- Location names and handles are fictional.
