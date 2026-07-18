-- Add password reset columns to creator table
alter table creator
  add column if not exists reset_token text,
  add column if not exists reset_token_expires timestamptz;

-- Add password reset columns to affiliate table
alter table affiliate
  add column if not exists reset_token text,
  add column if not exists reset_token_expires timestamptz;
