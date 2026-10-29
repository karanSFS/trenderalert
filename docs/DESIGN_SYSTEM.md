# Design System

The design system builds on Ant Design, customized through the theme tokens in [THEME_SYSTEM.md](THEME_SYSTEM.md). Visual direction: light, yellow and black, premium SaaS, dense but calm. Yellow is reserved for primary actions, selection, active navigation and highlights.

## Typography

- Font: Geist Sans (`next/font`), Geist Mono for codes and ids.
- Base size 14px, small 12px, large 16px. Headings: h1 30, h2 24, h3 19, h4 16. Heading weight 650 with slight negative letter spacing.
- Page titles use `PageHeader` (h1 at the h2 size so admin pages stay compact).

## Spacing

4px base unit. Use `theme.space(n)` in styled-components or `var(--ta-space-n)` in CSS. Common values: 8 (2), 12 (3), 16 (4), 24 (6), 32 (8).

## Shared components (Phase 1)

| Component                                                                                                 | File                                | Purpose                                                                                    |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------ |
| `BrandLogo`                                                                                               | `components/ui/BrandLogo.tsx`       | **Placeholder** wordmark. Replace with the owner's original logo artwork; do not redraw it |
| `PageHeader`                                                                                              | `components/ui/PageHeader.tsx`      | Eyebrow, title, subtitle, actions                                                          |
| `StatusBadge`                                                                                             | `components/ui/StatusBadge.tsx`     | Tone (success, warning, error, info, neutral, brand) with icon and required text label     |
| `EmptyState`                                                                                              | `components/ui/EmptyState.tsx`      | Empty datasets with optional action                                                        |
| `ErrorState`, `AccessDeniedState`                                                                         | `components/ui/ErrorState.tsx`      | Failure with retry; role restriction                                                       |
| `MetricCardsSkeleton`, `ChartSkeleton`, `TableSkeleton`, `DetailSkeleton`, `FormSkeleton`, `PageSkeleton` | `components/ui/LoadingSkeleton.tsx` | Layout-matching loading states with `aria-busy`                                            |
| `DemoModeBanner`                                                                                          | `components/ui/DemoModeBanner.tsx`  | Persistent demo notice in the admin shell                                                  |
| `ThemeSwitcher`                                                                                           | `components/ui/ThemeSwitcher.tsx`   | Appearance mode and preset selection                                                       |

Plain antd `Button` is used directly; a wrapper was not added because it would only re-export antd's API.

### Admin building blocks (Phase 3)

| Component                                     | File                                  | Purpose                                                                                                                                                                     |
| --------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SearchInput`                                 | `components/ui/SearchInput.tsx`       | Debounced search (300ms; Enter and clear commit immediately)                                                                                                                |
| `FilterBar`                                   | `components/ui/FilterBar.tsx`         | Search plus declarative select, multi-select and date-range filters, active count, reset, extra actions                                                                     |
| `DataTable`                                   | `components/ui/DataTable.tsx`         | Directory table: delayed skeleton on first load, overlay on refetch, error with retry, empty state, server-style paging and sorting, sticky header, keyboard-clickable rows |
| `RowActions`                                  | `components/ui/RowActions.tsx`        | Per-row "More actions" menu filtered by permission                                                                                                                          |
| `ConfirmDialog`                               | `components/ui/ConfirmDialog.tsx`     | Consequence list, danger tone, optional required reason, stays open on failure                                                                                              |
| `FormModal`                                   | `components/ui/FormModal.tsx`         | antd Form in a Modal with validation and inline save errors                                                                                                                 |
| `DetailDrawer`, `DetailSection`, `DetailList` | `components/ui/DetailDrawer.tsx`      | Record side panel with loading and error states, sections and label-value lists                                                                                             |
| `DemoDataTag`                                 | `components/ui/DemoDataTag.tsx`       | Dashed "Demo data" marker for figures                                                                                                                                       |
| `MetricCard`                                  | `components/dashboard/MetricCard.tsx` | KPI with arrow and text change indicator, optional link, built-in skeleton                                                                                                  |
| `ChartCard`                                   | `components/dashboard/ChartCard.tsx`  | Chart container with fixed height across loading, error, empty and content states, plus a text summary for screen readers                                                   |
| `Can`                                         | `components/auth/Can.tsx`             | Action-level permission gate                                                                                                                                                |

Conventions:

- **Change indicators** always pair an arrow with signed text (for example "+5.2% vs last week"). Set `higherIsBetter: false` for metrics where a drop is good.
- **Charts** take colors from `useChartTheme()` (`styles/chartTheme.ts`): brand yellow first, then ink, info, success, warning, error.
- **Consequential actions** go through `ConfirmDialog`. Enforcement actions set `requireReason`.
- **Formatting** uses `lib/formatters` (fixed `en-US` and `UTC`, money in cents) so server and client output match.

## Public website patterns

The landing page uses Server Components with CSS Modules in `src/components/promotional/`:

- **Section rhythm:** `section.module.css` provides `.section` (64px vertical padding), `.sectionMuted` (alternating muted band with borders), `.container` (1200px max), and `SectionHeading` (accent-colored uppercase eyebrow, 28-40px title, large lead).
- **Tiles:** `.grid` with 1, 2 or 3 columns (below 640px, from 640px, from 992px) and `.tile` cards with a 40px icon square (solid yellow for features, outlined for trust points).
- **Trend Card:** `PreviewTrendCard` shows the stage pill (Spark info, Rising success, Hot brand yellow, Peaking warning, Cooling neutral; text always included), TrendScore, a yellow momentum meter, a reason chip, location, time left and origin credit. Every use is labeled illustrative.
- **Radar motif:** concentric rings, a yellow sweep and signal nodes (UX14-003 graphic identity). Animation is off under `prefers-reduced-motion`.
- **Dark CTA panel:** uses the sidebar background so it reads as the brand's black in every preset.
- **Icons in Server Components:** import from `components/promotional/icons.ts`, not directly from `@ant-design/icons`.

## Buttons

- Primary: yellow background, ink text, weight 600, radius 8, no shadow. One primary action per area.
- Default: surface background with border.
- Danger: for destructive actions; always paired with confirmation.

## Cards and surfaces

Surface background, 1px `border`, radius 12, `shadow.card`. Avoid nested cards and oversized padding.

## Tables

Header background `surfaceMuted`, secondary header text, no column split lines, subtle row hover, light-yellow selected rows. Pagination active page: yellow with ink text.

## Forms

Inputs radius 8. Hover and focus borders use ink (light mode) or yellow (dark mode), with a yellow focus glow. Validation messages use the error token.

## Modals and drawers

Use antd `Modal` and `Drawer` (themed through `ConfigProvider`). Consequential actions require confirmation with a clear description of the effect.

## Status badges

Always include text. Color reinforces meaning but never carries it alone.

## Responsive behavior

- Breakpoints: sm 576, md 768, lg 992, xl 1200.
- Admin: sidebar visible from `lg`; below that a hamburger opens a drawer with the same navigation. Content padding shrinks on small screens.
- Public site: header links collapse into a drawer below `md`.
- Layout switching uses CSS media queries rather than JavaScript breakpoints, so server and client markup match.

## Accessibility expectations

- Semantic landmarks (`header`, `nav`, `main`, `footer`) and a skip link on every layout.
- Visible focus outlines (`focusRing` token).
- Text contrast meets WCAG AA. Yellow is never used for text on light surfaces.
- Loading regions use `aria-busy` with a visually hidden label. Error states use `role="alert"`.
- Custom radio-style pickers (theme presets) use `role="radio"` and `aria-checked`.
- `prefers-reduced-motion` disables transitions.
