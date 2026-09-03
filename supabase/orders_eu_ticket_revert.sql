-- Revert of orders_eu_ticket_upgrade.sql.
-- Dropping these columns is safe for the app: order inserts retry without the
-- extra fields and the admin page falls back to the original column list.
alter table public.orders drop column if exists ticket_region;
alter table public.orders drop column if exists visitor_names;
