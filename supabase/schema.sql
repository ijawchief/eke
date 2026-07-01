-- Eke Schema
-- Run in Supabase SQL editor

create extension if not exists "uuid-ossp";

-- ─── CUSTOMERS ───────────────────────────────────────────────────────────────
create table customer (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  phone      text,
  created_at timestamptz not null default now(),
  unique (email)
);
alter table customer enable row level security;
create policy "Service role only" on customer using (false);

-- ─── PRODUCTS ────────────────────────────────────────────────────────────────
create table product (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  name             text not null,
  page_blocks      jsonb not null default '[]',
  price_kobo       integer not null,
  compare_at_kobo  integer,
  currency         text not null default 'NGN',
  delivery_type    text not null default 'magic_link',
  external_url     text,
  file_ref         text,
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);
alter table product enable row level security;
create policy "Public read active products" on product for select using (active = true);

-- ─── ORDERS ──────────────────────────────────────────────────────────────────
create table "order" (
  id                     uuid primary key default gen_random_uuid(),
  customer_id            uuid not null references customer(id),
  status                 text not null default 'pending',
  subtotal_kobo          integer not null,
  total_kobo             integer not null,
  currency               text not null default 'NGN',
  paystack_reference     text unique not null,
  paystack_authorization text,
  attribution            jsonb not null default '{}',
  event_id               text not null,
  creator_id             uuid,
  created_at             timestamptz not null default now(),
  paid_at                timestamptz
);
alter table "order" enable row level security;
create policy "Service role only" on "order" using (false);

-- ─── ORDER ITEMS ─────────────────────────────────────────────────────────────
create table order_item (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references "order"(id),
  product_id   uuid not null references product(id),
  kind         text not null,
  price_kobo   integer not null,
  creator_id   uuid,
  affiliate_id uuid,
  split        jsonb
);
alter table order_item enable row level security;
create policy "Service role only" on order_item using (false);

-- ─── TRANSACTIONS ────────────────────────────────────────────────────────────
create table transaction (
  id                 uuid primary key default gen_random_uuid(),
  order_id           uuid not null references "order"(id),
  paystack_reference text not null,
  amount_kobo        integer not null,
  status             text not null,
  channel            text,
  raw                jsonb,
  created_at         timestamptz not null default now()
);
alter table transaction enable row level security;
create policy "Service role only" on transaction using (false);

-- ─── LEDGER (append-only) ────────────────────────────────────────────────────
create table ledger_entry (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid references "order"(id),
  entry_type  text not null,
  direction   text not null,
  amount_kobo integer not null,
  currency    text not null default 'NGN',
  reference   text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
alter table ledger_entry enable row level security;
create policy "Service role only" on ledger_entry using (false);

-- ─── FULFILLMENTS ────────────────────────────────────────────────────────────
create table fulfillment (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references "order"(id),
  product_id   uuid not null references product(id),
  access_type  text not null default 'magic_link',
  external_ref text not null,
  status       text not null default 'granted',
  granted_at   timestamptz not null default now(),
  revoked_at   timestamptz
);
alter table fulfillment enable row level security;
create policy "Service role only" on fulfillment using (false);

-- ─── PHASE 2 STUBS ───────────────────────────────────────────────────────────
create table creator (
  id              uuid primary key default gen_random_uuid(),
  name            text,
  email           text,
  kyc_status      text default 'none',
  bank_ref        text,
  payout_schedule text,
  created_at      timestamptz default now()
);

create table affiliate (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text,
  code       text unique,
  bank_ref   text,
  created_at timestamptz default now()
);

create table split (
  id            uuid primary key default gen_random_uuid(),
  order_item_id uuid references order_item(id),
  party_type    text,
  party_id      uuid,
  amount_kobo   integer,
  status        text default 'pending',
  created_at    timestamptz default now()
);
