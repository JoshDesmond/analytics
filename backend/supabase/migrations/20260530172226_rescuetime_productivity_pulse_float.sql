-- productivity_pulse is computed as a weighted 0–100 score with fractional values.

alter table daily_rescuetime_user_summary
  alter column productivity_pulse type double precision
  using productivity_pulse::double precision;
