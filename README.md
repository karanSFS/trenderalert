# TrenderAlert Frontend

Public website and demo administration portal for TrenderAlert ("See It First").

The app runs entirely on fictional local mock data. No backend is connected, and demo sign-in is not real authentication.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

- Public website: `/`
- Admin portal (demo): `/admin/login` (pick any demo role, no password)

Optional: copy `.env.example` to `.env.local` to change the simulated latency or force mock failures.

## Scripts

| Script                        | Purpose                     |
| ----------------------------- | --------------------------- |
| `npm run dev`                 | Development server          |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint`                | ESLint                      |
| `npm run typecheck`           | TypeScript check            |
| `npm run check`               | Lint and typecheck          |
| `npm run format`              | Prettier                    |

## Documentation

Start at [docs/README.md](docs/README.md).
