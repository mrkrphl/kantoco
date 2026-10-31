-- CGR r8.1 fix: nested checks so a reservation never reads new.fitting_date.
-- (The schema file now carries the fixed body; this applies it to the live project.)
create or replace function private.no_past_dates() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if tg_table_name = 'reservations' then
    if new.event_date < private.manila_today() then
      raise exception 'past date' using errcode = '22023';
    end if;
  elsif tg_table_name = 'fittings' then
    if new.fitting_date < private.manila_today() then
      raise exception 'past date' using errcode = '22023';
    end if;
  end if;
  return new;
end $$;
