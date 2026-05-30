-- Per-day snapshots pulled from integrations (see src/warehouse/sync/daily.ts).

create table daily_rescuetime_user_summary (
  date date primary key,
  productivity_pulse double precision not null,
  total_tracked_seconds integer not null,
  programming_seconds integer not null,
  very_productive_seconds integer not null,
  productive_seconds integer not null,
  neutral_seconds integer not null,
  unproductive_seconds integer not null,
  very_unproductive_seconds integer not null,
  uncategorized_seconds integer not null,
  synced_at timestamptz not null default now()
);

create table daily_rescuetime_top_activities (
  date date not null,
  rank smallint not null check (rank between 1 and 10),
  name text not null,
  category text not null,
  seconds integer not null,
  productivity smallint not null,
  synced_at timestamptz not null default now(),
  primary key (date, rank)
);

create table daily_rescuetime_device_seconds (
  date date primary key,
  desktop_seconds integer not null,
  mobile_seconds integer not null,
  synced_at timestamptz not null default now()
);

-- Daily JSON snapshots: one row per calendar day (date PK), integration payload, sync time.
-- Payload shapes: src/shared/daily-snapshot-types.ts (HabiticaDailysPayload, etc.).

create table daily_habitica_dailys (
  date date primary key,
  payload jsonb not null,
  synced_at timestamptz not null default now()
);

create table daily_google_sheets_entry (
  date date primary key,
  payload jsonb not null,
  synced_at timestamptz not null default now()
);

create table daily_linear_cycle_scores (
  date date primary key,
  payload jsonb not null,
  synced_at timestamptz not null default now()
);
