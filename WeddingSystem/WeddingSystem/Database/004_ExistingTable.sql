-- Use the existing Table schema; TableGustTagNum is a guest-tag ID, not capacity.
begin;
lock table public."Table", public."SeatingTable", public."Guest" in share row exclusive mode;
alter table public."Table" add column if not exists "Capacity" integer not null default 10;
alter table public."Table" alter column "TableNum" set not null;
create unique index if not exists "Table_TableNum_unique" on public."Table" ("TableNum");
create sequence if not exists public.wedding_table_number_seq as integer minvalue 1;
-- Preserve table settings previously created by the app.
insert into public."Table" ("TableNum", "Capacity")
select "TableNumber"::smallint, "Capacity" from public."SeatingTable"
on conflict ("TableNum") do nothing;
select setval('public.wedding_table_number_seq',
    greatest(coalesce((select max("TableNum") from public."Table"), 0),
        (select last_value from public.wedding_table_number_seq),
        case when (select is_called from public."SeatingTable_TableNumber_seq") then (select last_value from public."SeatingTable_TableNumber_seq") else 0 end, 1),
    (select is_called from public.wedding_table_number_seq)
        or (select is_called from public."SeatingTable_TableNumber_seq") or exists(select 1 from public."Table"));
alter table public."Table" alter column "TableNum" set default nextval('public.wedding_table_number_seq');
do $$ begin
    if not exists (select 1 from pg_constraint where conname='Table_Capacity_check' and conrelid='public."Table"'::regclass) then
        alter table public."Table" add constraint "Table_Capacity_check" check ("Capacity" > 0);
    end if;
    if not exists (select 1 from pg_constraint where conname='Table_GuestTag_fkey' and conrelid='public."Table"'::regclass) then
        alter table public."Table" add constraint "Table_GuestTag_fkey" foreign key ("TableGustTagNum") references public."Guest_Tag" (id) on delete restrict;
    end if;
end $$;
alter table public."Guest" drop constraint if exists "Guest_Table_fkey";
alter table public."Guest" add constraint "Guest_Table_fkey" foreign key ("Table") references public."Table" ("TableNum") on delete restrict;
alter table public."Table" enable row level security;
revoke all on public."Table" from anon, authenticated;
-- Leave SeatingTable intact for rollback; the backend no longer reads or writes it.
commit;
