-- Run this once in the Supabase SQL Editor (or via `psql`) for your project.
-- Safe to re-run: every statement is idempotent.

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists pg_trgm;    -- fuzzy ILIKE search

-- ---------------------------------------------------------------------------
-- updated_at auto-touch trigger, shared by every table that has the column
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at
  before update on users
  for each row execute function set_updated_at();

alter table users enable row level security;
-- No policies defined on purpose: only the backend's service_role key may
-- touch this table (service_role bypasses RLS). This blocks any access via
-- Supabase's auto-generated REST/anon API as defense-in-depth.

-- ---------------------------------------------------------------------------
-- refresh_tokens (separate table so a user can hold multiple sessions/devices
-- and individual tokens can be revoked/rotated independently)
-- ---------------------------------------------------------------------------
create table if not exists refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_refresh_tokens_user on refresh_tokens(user_id);
create index if not exists idx_refresh_tokens_hash on refresh_tokens(token_hash);

alter table refresh_tokens enable row level security;

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  image_url text,
  image_public_id text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- category was added after the initial launch; backfill existing rows before
-- enforcing not-null so this script stays safe to re-run against old data.
alter table products add column if not exists category text;
update products set category = 'Food' where category is null;
alter table products alter column category set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_category_check'
  ) then
    alter table products add constraint products_category_check
      check (category in ('Pharma', 'Food', 'Defence', 'Fashion', 'Electronics', 'Furniture'));
  end if;
end $$;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();

create index if not exists idx_products_name_trgm on products using gin (name gin_trgm_ops);
create index if not exists idx_products_description_trgm on products using gin (description gin_trgm_ops);
create index if not exists idx_products_created_at on products(created_at desc);
create index if not exists idx_products_category on products(category);

alter table products enable row level security;
