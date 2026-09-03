create sequence if not exists public.orders_order_number_seq;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number integer not null unique default nextval('public.orders_order_number_seq'),
  created_at timestamptz not null default now(),
  customer_name text not null,
  email text not null,
  phone text,
  visit_date date not null,
  visit_time text not null,
  order_type text not null,
  product_id text not null,
  adults integer not null,
  children integer not null default 0,
  amount numeric(10,2) not null,
  currency text not null default 'EUR',
  status text not null default 'pending',
  stripe_session_id text unique
);

alter table public.orders enable row level security;

alter table public.orders add column if not exists order_number integer;
alter table public.orders alter column order_number set default nextval('public.orders_order_number_seq');

with numbered_orders as (
  select
    id,
    row_number() over (order by created_at, id) as next_order_number
  from public.orders
  where order_number is null
)
update public.orders
set order_number = numbered_orders.next_order_number
from numbered_orders
where public.orders.id = numbered_orders.id;

select setval(
  'public.orders_order_number_seq',
  greatest((select coalesce(max(order_number), 0) from public.orders), 1),
  (select coalesce(max(order_number), 0) > 0 from public.orders)
);

alter table public.orders alter column order_number set not null;
create unique index if not exists orders_order_number_key on public.orders (order_number);

alter table public.orders add column if not exists combo_group_id uuid;
alter table public.orders add column if not exists combo_component text;
alter table public.orders add column if not exists adult_count integer not null default 0;
alter table public.orders add column if not exists youth_count integer not null default 0;
alter table public.orders add column if not exists child_count integer not null default 0;
alter table public.orders add column if not exists infant_count integer not null default 0;

update public.orders
set
  adult_count = adults,
  child_count = children
where adult_count = 0 and youth_count = 0 and child_count = 0 and infant_count = 0;

alter table public.orders drop constraint if exists orders_stripe_session_id_key;
drop index if exists public.orders_stripe_session_id_key;
create index if not exists orders_stripe_session_id_idx on public.orders (stripe_session_id);
create index if not exists orders_combo_group_id_idx on public.orders (combo_group_id);

alter table public.orders add column if not exists generated boolean not null default false;
alter table public.orders add column if not exists link text;
alter table public.orders add column if not exists sent boolean not null default false;

create table if not exists public.product_availability_overrides (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  product_id text not null,
  combo_component text not null default '*',
  visit_date date not null,
  visit_time text not null default '*',
  is_closed boolean not null default true,
  note text,
  unique (product_id, combo_component, visit_date, visit_time),
  check (visit_time <> '')
);

alter table public.product_availability_overrides enable row level security;

create index if not exists product_availability_overrides_lookup_idx
  on public.product_availability_overrides (product_id, combo_component, visit_date, visit_time);

create table if not exists public.product_prices (
  product_id text primary key,
  face_value numeric(10,2) not null,
  eguide_fee numeric(10,2) not null,
  service_fee numeric(10,2) not null,
  updated_at timestamptz not null default now()
);

alter table public.product_prices enable row level security;

create index if not exists product_prices_updated_at_idx
  on public.product_prices (updated_at desc);
