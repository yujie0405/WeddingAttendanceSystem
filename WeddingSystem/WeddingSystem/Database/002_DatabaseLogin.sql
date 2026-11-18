-- Run after 001_User.sql. Existing profiles and their admin UUIDs are preserved.
begin;
alter table public."User" add column if not exists "AccountId" uuid;
update public."User" set "AccountId" = coalesce("AuthUserId", gen_random_uuid()) where "AccountId" is null;
alter table public."User" alter column "AccountId" set default gen_random_uuid();
alter table public."User" alter column "AccountId" set not null;
create unique index if not exists "User_AccountId_unique" on public."User" ("AccountId");
alter table public."User" add column if not exists "Password" text;
alter table public."User" alter column "Password" type text;
create unique index if not exists "User_Email_unique" on public."User" (lower("Email"));
-- Recover profiles for existing Auth accounts if their legacy User rows were absent.
insert into public."User" ("AccountId", "AuthUserId", "Email", "UserName")
select a.id, a.id, a.email,
    coalesce(nullif(left(trim(a.raw_user_meta_data ->> 'username'), 100), ''), split_part(a.email, '@', 1))
from auth.users a where a.email is not null
    and not exists (select 1 from public."User" p where lower(p."Email") = lower(a.email))
on conflict do nothing;
commit;
