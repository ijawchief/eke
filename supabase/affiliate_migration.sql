-- affiliate accounts
create table affiliate (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  username text unique not null,
  password_hash text not null,
  balance_kobo bigint not null default 0,
  total_earned_kobo bigint not null default 0,
  created_at timestamptz default now()
);

-- click tracking
create table affiliate_click (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references affiliate(id) on delete cascade,
  product_id uuid references product(id) on delete cascade,
  created_at timestamptz default now()
);

-- commission records
create table affiliate_commission (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references affiliate(id) on delete cascade,
  order_id uuid references "order"(id) on delete cascade,
  product_id uuid references product(id) on delete cascade,
  amount_kobo bigint not null,
  status text not null default 'pending', -- pending, approved, paid, rejected
  created_at timestamptz default now()
);

-- affiliate payout requests
create table affiliate_payout (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references affiliate(id) on delete cascade,
  amount_kobo bigint not null,
  bank_name text,
  bank_code text,
  account_number text,
  account_name text,
  status text not null default 'pending',
  note text,
  created_at timestamptz default now()
);

-- platform affiliate commission rate (single row config)
create table affiliate_config (
  id int primary key default 1,
  commission_rate numeric not null default 10.0 -- percentage
);
insert into affiliate_config (id, commission_rate) values (1, 10.0);

-- per-product override
alter table product add column if not exists affiliate_commission_rate numeric;
