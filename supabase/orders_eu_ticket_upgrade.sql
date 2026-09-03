-- EU/Non-EU ticket + visitor names upgrade.
-- Both columns are nullable and additive: existing rows, the admin page, and
-- the external order-export program keep working unchanged.
alter table public.orders add column if not exists ticket_region text;
alter table public.orders add column if not exists visitor_names text;
