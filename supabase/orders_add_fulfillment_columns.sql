alter table public.orders add column if not exists generated boolean not null default false;
alter table public.orders add column if not exists link text;
alter table public.orders add column if not exists sent boolean not null default false;
