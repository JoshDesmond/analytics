# analytics

A web application for viewing personal data over time.

## Projects

| Folder | Stack | Role |
|--------|-------|------|
| `analytics/` | Vite, React, TypeScript, Tailwind | Frontend |
| `analytics-backend/` | Express, TypeScript | API server |

## Development

One command from the repo root (starts API on **3001** and Vite on **5173**):

```bash
cp analytics-backend/.env.example analytics-backend/.env   # set RT_API_KEY
npm install          # root: installs concurrently
npm install --prefix analytics
npm install --prefix analytics-backend
npm run dev
```

Or run them separately: `npm run dev:api` and `npm run dev:web`.

The Vite dev server **proxies** `/api` to `http://localhost:3001`, so the React app can use same-origin fetches like `fetch('/api/rescuetime/productivity-pulse')` without CORS setup. That proxy is dev-only; production needs your own reverse proxy or hosted API URL.

Vite does not provide Next.js-style API routes. The split Express app + proxy is intentional; `concurrently` only saves you a second terminal.
