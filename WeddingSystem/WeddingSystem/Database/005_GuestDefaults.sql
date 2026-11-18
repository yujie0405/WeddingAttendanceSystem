-- Keep the existing Guest table and actual column names.
begin;
do $$ begin
    if not exists (select 1 from public."AttendanceStatus" where id = 1) then
        raise exception 'AttendanceStatus ID 1 must exist before setting the default.';
    end if;
end $$;
alter table public."Guest" alter column "Attendance Status" set default 1;
alter table public."Guest" alter column "Angpau" set default 0;
commit;
