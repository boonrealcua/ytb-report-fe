# ytb-report-fe Rules

## Stack
- Use Node.js with React, Vite, and TypeScript.
- Use React Router for admin routing.
- Use TanStack Query for API fetch/cache state.
- Use React Hook Form with Zod for form state and validation.
- Use TailwindCSS and shadcn/ui for UI implementation.
- Use `html-to-image` or `dom-to-image-more` for partner report image export.
- Use `date-fns` or `dayjs` for date formatting and month handling.
- Use Recharts only when dashboard charts are required.

## Docker
- The frontend must run through Docker.
- Keep a frontend `Dockerfile` in this repo when the app is scaffolded.
- Local runtime should be compatible with a root or shared `docker-compose.yml` that runs FE and BE together.
- Do not hardcode API URLs. Read the backend URL from `VITE_API_BASE_URL`.
- Provide `.env.example` for required frontend environment variables.
- Never commit real `.env` files.

## API Integration
- FE calls the NestJS backend only; do not call YouTube APIs directly from the browser.
- FE must not store Google OAuth secrets, refresh tokens, JWT secrets, MongoDB URIs, or other server-only secrets.
- Use typed API clients or shared request helpers so response handling is consistent.
- Use clear loading, empty, and error states for admin screens.

## Partner Report Export
- Partner-facing monthly report export is image-based: PNG/JPG.
- Render the report preview in the browser matching the provided sample layout, then export the DOM to image.
- The text sections in the partner report are manual inputs:
  - `Đánh giá chung`
  - `Đề xuất phát triển`
- Do not describe these text sections as AI-generated unless a later scope explicitly adds AI.
- Internal/admin tables may remain web tables; Excel export is not the partner-report export requirement unless separately requested.

## Date And Timezone
- Backend datetime fields are UTC ISO strings.
- FE must convert UTC datetime values to the client's timezone for display.
- Get the client timezone with:

```ts
Intl.DateTimeFormat().resolvedOptions().timeZone
```

- Display datetime with the browser/client timezone, not a hardcoded timezone.
- For month filters and reports, send an explicit month or date range to the backend. The backend owns UTC query conversion.
- Do not store or send ambiguous local datetime strings.

## UX Rules
- Build the admin experience directly; do not make a marketing landing page.
- Prioritize dense, scannable admin screens over decorative layouts.
- Use stable table/filter/report layouts because admins will compare channel performance repeatedly.
- Keep report preview dimensions stable so image export does not shift content.
