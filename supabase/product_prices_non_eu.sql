-- Kulon Non-EU arak termekenkent.
-- Mindharom oszlop nullable: ha ures, a termek az EU (alap) arat hasznalja,
-- igy a meglevo sorok es a regi kod valtozatlanul mukodnek tovabb.
alter table public.product_prices add column if not exists face_value_non_eu numeric(10,2);
alter table public.product_prices add column if not exists eguide_fee_non_eu numeric(10,2);
alter table public.product_prices add column if not exists service_fee_non_eu numeric(10,2);
