# blog-cms

Next.js App Router CMS for blog content management.

## Project structure

- `app/` - routes, route groups, layouts, and route-local styles
- `components/` - reusable UI and feature components
- `assets/` - shared UI assets, SVGs, buttons, modals, inputs, and notifications
- `context/` - React context providers
- `hooks/` - reusable hooks and page-domain hooks
- `lib/` - shared client utilities
- `services/` - API clients and service modules
- `docs/` - project documentation

See `docs/PROJECT_STRUCTURE.md` for the full structure notes.

## Environment variables

Copy `.env.example` to `.env.local` in the project root and set:

- `NEXT_PUBLIC_ENV=development`
- `NEXT_PUBLIC_DEV_AUTH_API=https://dev.pdp.auth.reseapro.com` (Centralized Auth System)
- `NEXT_PUBLIC_TEST_AUTH_API=https://tst.pdp.auth.reseapro.com` (Centralized Auth System)
- `NEXT_PUBLIC_PROD_AUTH_API=https://pdp.auth.reseapro.com` (Centralized Auth System)
- `NEXT_PUBLIC_AUTH_BASE_URL=https://pdp.auth.reseapro.com` (fallback, Centralized Auth System)
- `NEXT_PUBLIC_AUTH_APP_ID=20` (used by signup/forgot/verify/reset password flows)
- `NEXT_PUBLIC_DEV_API_BASE_URL=https://dev.api.reseapro.com`
- `NEXT_PUBLIC_TEST_API_BASE_URL=https://test.api.reseapro.com`
- `NEXT_PUBLIC_PROD_API_BASE_URL=https://api.reseapro.com`
- `NEXT_PUBLIC_DEV_CMS_API_BASE_URL=https://dev.api.services.blog.reseapro.com`
- `NEXT_PUBLIC_TEST_CMS_API_BASE_URL=https://test.api.services.blog.reseapro.com`
- `NEXT_PUBLIC_PROD_CMS_API_BASE_URL=https://api.services.blog.reseapro.com`
- `NEXT_PUBLIC_DEV_LOCATION_API_BASE_URL=https://dev.services.location.reseapro.com/api/location`
- `NEXT_PUBLIC_TEST_LOCATION_API_BASE_URL=https://test.services.location.reseapro.com/api/location`
- `NEXT_PUBLIC_PROD_LOCATION_API_BASE_URL=https://services.location.reseapro.com/api/location`
- `NEXT_PUBLIC_DEV_UPLOAD_API=https://dev.upload.reseapro.com`
- `NEXT_PUBLIC_TEST_UPLOAD_API=https://tst.upload.reseapro.com`
- `NEXT_PUBLIC_PROD_UPLOAD_API=https://upload.reseapro.com`
- `NEXT_PUBLIC_DEV_UPLOAD_DOMAIN=dev.pubmanu.com`
- `NEXT_PUBLIC_TEST_UPLOAD_DOMAIN=tst.pubmanu.com`
- `NEXT_PUBLIC_PROD_UPLOAD_DOMAIN=pubmanu.com`

## Run by environment

- Development (port 4000): `npm run dev`
- Production (port 3000): `npm run build` then `npm run start`
- Test build: `npm run build:test`
- Test server (port 5000): `npm run build:test` then `npm run start:test`

## Pipeline

- Install clean dependencies: `npm ci`
- Lint: `npm run lint`
- Case-sensitive path check: `npm run check:case`
- CI validation: `npm run ci`
- Test alias for CI validation: `npm test`
