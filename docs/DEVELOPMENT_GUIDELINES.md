# Development Guidelines

## Naming

- Components: `PascalCase.tsx`, one exported component per file (small private helpers allowed).
- Slices: `<domain>Slice.ts`, selectors `<domain>Selectors.ts`, types `<domain>Types.ts`.
- Services: `<domain>Service.ts` in `contracts/` (interface) and `mock/` (implementation).
- Mock data: plural entity name, for example `users.ts`.
- Constants: `SCREAMING_SNAKE_CASE`.
- Styled-components transient props use the `$` prefix (`$active`).

## Component structure

- Keep page files thin. Put screens in `components/<area>/`.
- Extract a shared component once a pattern repeats or a module needs it. Do not pre-build abstractions with no consumer.
- Server Components by default; add `"use client"` only for interactivity, Redux or styled-components.

## TypeScript

- `strict` mode. `any` is a lint error.
- Domain entities have explicit interfaces. Reuse shared types from `src/types`.
- Validate unknown data at integration boundaries (localStorage, future API responses).

## Styling

- Ant Design is the component foundation, themed through `buildAntdTheme`.
- Custom styling uses styled-components (client) or CSS Modules (server components). Both read theme CSS variables.
- No hardcoded colors in components. Use tokens. Inline `style` is not the default strategy (exception: `global-error.tsx`, which renders without global CSS).
- Global CSS is limited to `globals.css` and `tokens.css`.

## State management

See [REDUX_STATE_MANAGEMENT.md](REDUX_STATE_MANAGEMENT.md). Shared and async state goes in Redux. Short-lived UI state stays local.

## Mock data

See [MOCK_DATA_GUIDE.md](MOCK_DATA_GUIDE.md). Never import mock data into components or slices.

## Error handling

- Every async operation has `idle`, `loading`, `succeeded` and `failed` states.
- Never swallow errors silently. Show an error state or message, and offer retry where it makes sense.
- Never show success for an operation that failed.

## Documentation

- Update the feature doc, `CHANGELOG.md` and `REQUIREMENTS_MAPPING.md` with every significant change.
- Mark assumptions and placeholders explicitly.

## Checks before handing off

```bash
npm run lint
npm run typecheck
npm run build
```

## Next.js version note

This project uses Next.js 16. APIs differ from older versions (for example, error boundaries receive `retry`, and `params` is a Promise). Read the bundled docs in `node_modules/next/dist/docs/` before using an unfamiliar API.
