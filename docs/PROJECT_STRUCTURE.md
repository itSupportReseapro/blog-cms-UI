# Project Structure

This is a Next.js App Router CMS project.

- `app/` contains routes, route groups, layouts, and route-local styles.
- `components/` contains reusable UI and feature components.
- `assets/` contains shared design assets, SVGs, buttons, modals, inputs, and notifications used by the UI.
- `context/` contains React context providers.
- `hooks/` contains reusable hooks and page-domain hooks.
- `lib/` contains shared client utilities.
- `services/` contains API clients and service modules.
- `public/` contains static files served directly by Next.js.
- `docs/` contains project documentation that is not part of runtime code.

Pipeline hygiene:

- Generated Next output stays out of git via `.next/`.
- Local environment files stay out of git via `.env*`; commit `.env.example` when variables change.
- Build archives and local backups stay out of git via `*.zip`, `*.tar`, `*.tar.gz`, and `*.tgz`.
- CI runs `npm ci`, `npm run lint`, `npm run check:case`, and `npm run build:test`.
- Import paths must match tracked file and folder casing exactly, because Linux CI is case-sensitive.
