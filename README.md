# YouTube Report FE Prototype

React/Vite prototype for the YouTube report admin app.

## Screens
- Dashboard overview
- Channel management table
- Internal operations report
- Partner monthly report editor
- Partner report PNG/JPG export preview
- Sync logs

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build And Test

```bash
npm test
npm run build
```

## Docker

```bash
docker build -t ytb-report-fe .
docker run --rm -p 8080:80 ytb-report-fe
```

## Environment

Copy `.env.example` to `.env` when backend integration starts.

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Notes
- FE does not call YouTube APIs directly.
- Datetime values from BE are expected as UTC ISO strings and displayed in the client timezone.
- Partner report export is image-based: PNG/JPG.
- Partner report manual text fields are `Đánh giá chung` and `Đề xuất phát triển`.
