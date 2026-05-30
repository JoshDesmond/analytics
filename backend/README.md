# backend

Express API for the analytics frontend.

## Layout

| Path | Role |
|------|------|
| `src/integrations/` | Raw fetches to external APIs segreated into readers & writers. |
| `src/warehouse/` | Cache-or-fetch resolvers, Supabase stores, sync jobs, HTTP ports |
| `src/shared/` | shared types and small utilities |

The frontend should only query from `warehouse/ports/*`. Ports route every query through warehouse resolvers, which return Supabase rows when fresh or refetch from integrations.

## Setup

```bash
nvm use   # from repo root
cp .env.example .env
# set RT_API_KEY, Supabase keys, etc.
npm install
npm run dev
```

Default port: **3001** (`PORT` in `.env`).

```bash
npm run lint    # enforces integrations → no warehouse/supabase imports
npm run db:types  # regenerate src/shared/supabase-types/database.types.ts
```
