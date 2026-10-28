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

Plain antd `Button` is used directly; a wrapper was not added because it would only re-export antd's API. `DataTable`, `FilterBar`, `SearchInput`, `ConfirmDialog`, `FormModal`, `DetailDrawer`, `MetricCard` and `ChartCard` will be added when the first module needs them (Phases 4 and 5), so their APIs are shaped by real use.

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
- Custom radio-style pickers (theme presets, demo accounts) use `role="radio"` and `aria-checked`.
- `prefers-reduced-motion` disables transitions.
