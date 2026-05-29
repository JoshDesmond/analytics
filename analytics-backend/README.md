# analytics-backend

Express API for the analytics frontend.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/hello` | RescueTime productivity pulse (0–100) |

## Setup

```bash
cp .env.example .env
# set RT_API_KEY
npm install
npm run dev
```

Default port: **3001** (`PORT` in `.env`).

During frontend development, Vite proxies `/api` to this server so the React app can call same-origin paths like `/api/hello`.
