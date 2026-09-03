-- Per-component availability for combo products (Louvre / Eiffel / Seine).
-- Existing rows default to combo_component = '*' (whole product / legacy behavior).

alter table public.product_availability_overrides
  add column if not exists combo_component text not null default '*';

alter table public.product_availability_overrides
  drop constraint if exists product_availability_overrides_product_id_visit_date_visit_time_key;

-- A Postgres 63 karakterre csonkolja a kulcsneveket — a fenti sor emiatt nem
-- talált; ez a ténylegesen létrejött (csonkolt) név:
alter table public.product_availability_overrides
  drop constraint if exists product_availability_override_product_id_visit_date_visit_t_key;

alter table public.product_availability_overrides
  drop constraint if exists product_availability_overrides_unique_key;

alter table public.product_availability_overrides
  add constraint product_availability_overrides_unique_key
  unique (product_id, combo_component, visit_date, visit_time);

drop index if exists product_availability_overrides_lookup_idx;

create index if not exists product_availability_overrides_lookup_idx
  on public.product_availability_overrides (product_id, combo_component, visit_date, visit_time);
