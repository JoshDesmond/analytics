# analytics-backend

Express API for the analytics frontend.

## Layout

```
src/
  integrations/
    rescuetime/
      client.ts          # external API
      reader/            # read endpoints
    google-sheets/
      client.ts
      reader/
      writer/
    habitica/
      client.ts
      reader/
      writer/
    linear/
      client.ts
      reader/
  daily/
    router.ts
  sync/
    client.ts
    daily.ts
  index.ts

supabase/migrations/     # run in Supabase SQL editor or via CLI
```

## Setup

```bash
cp .env.example .env
# set RT_API_KEY
npm install
npm run dev
```

Default port: **3001** (`PORT` in `.env`).
