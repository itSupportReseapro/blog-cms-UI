# blog-cms

## Environment variables

Create a `.env.local` file in the project root and set:

- `NEXT_PUBLIC_ENV=development`
- `NEXT_PUBLIC_DEV_AUTH_API=https://dev.api.reseapro.com`
- `NEXT_PUBLIC_TEST_AUTH_API=https://test.api.reseapro.com`
- `NEXT_PUBLIC_PROD_AUTH_API=https://api.reseapro.com`
- `NEXT_PUBLIC_AUTH_BASE_URL=https://api.reseapro.com` (fallback)
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
- Test (port 5000): `npm run build:test` then `npm run test`