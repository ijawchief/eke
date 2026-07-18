-- Add status column to affiliate table
-- Values: 'active' | 'banned' | 'restricted'
alter table affiliate
  add column if not exists status text not null default 'active',
  add column if not exists status_note text;
