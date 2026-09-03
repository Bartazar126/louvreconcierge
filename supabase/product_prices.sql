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
