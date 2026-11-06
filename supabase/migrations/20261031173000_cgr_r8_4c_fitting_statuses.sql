-- CGR r8.4c (plain re-stamp, spec r8.4b):
--  * D4 (DEFAULT): a fitting's "Came in" and "No-show" are statuses, not a
--    separate flag. fittings.showed is folded into status and dropped.
--    Fittings can no longer be "out" or "returned" (those are reservation
--    words); no fitting ever used them.
--  * The customer-facing summary (Done page, old codes) keeps showing a
--    came-in or no-show fitting as "confirmed", so public pages don't change.
--  * owner_dashboard() adds returns_today (D7, DEFAULT). Pickups and returns
--    come only from the days the owner typed in (pickup_on, return_on):
--    nothing is guessed from event_date or return_date (rule from Mark pending).
--  * admin_commission(): the ₱200 line's numbers, computed on the server for
--    active admins only (D1, Mark).

alter table public.fittings drop constraint fittings_status_check;
update public.fittings set status = 'came_in' where showed = 'came' and status <> 'cancelled';
update public.fittings set status = 'no_show' where showed = 'no_show' and status <> 'cancelled';
alter table public.fittings add constraint fittings_status_check
  check (status in ('pending', 'confirmed', 'came_in', 'no_show', 'cancelled'));
alter table public.fittings drop column showed;

create or replace function private.booking_summary(p_ref text) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select jsonb_build_object('kind', 'reserve', 'ref', r.ref, 'gown_slug', r.gown_slug,
        'event_date', r.event_date, 'return_date', r.return_date, 'status', r.status)
     from public.reservations r where r.ref = upper(btrim(p_ref))),
    (select jsonb_build_object('kind', 'fitting', 'ref', f.ref, 'gown_slug', f.gown_slug,
        'linked_ref', f.linked_ref, 'fitting_date', f.fitting_date, 'slot', f.slot,
        'status', case when f.status in ('came_in', 'no_show') then 'confirmed' else f.status end)
     from public.fittings f where f.ref = upper(btrim(p_ref))))
$$;

create or replace function private.owner_dashboard() returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  d date := private.manila_today();
  ws date := d - (extract(isodow from d)::int - 1);
  t0 timestamptz := (ws::timestamp at time zone 'Asia/Manila');
  t1 timestamptz := ((ws + 7)::timestamp at time zone 'Asia/Manila');
begin
  if not private.is_owner() then
    raise exception 'cgr:not_owner' using errcode = 'P0001';
  end if;
  return jsonb_build_object(
    'today', d,
    'week_start', ws,
    'week_end', ws + 6,
    'fittings_today', coalesce((
      select jsonb_agg(jsonb_build_object('ref', f.ref, 'slot', f.slot, 'name', f.customer_name,
        'gown', g.name, 'status', f.status) order by f.slot)
      from public.fittings f left join public.gowns g on g.slug = f.gown_slug
      where f.fitting_date = d and f.status <> 'cancelled'), '[]'::jsonb),
    'pickups_today', coalesce((
      select jsonb_agg(jsonb_build_object('ref', r.ref, 'name', r.customer_name, 'gown', g.name,
        'status', r.status) order by r.customer_name, r.ref)
      from public.reservations r join public.gowns g on g.slug = r.gown_slug
      where r.pickup_on = d and r.status <> 'cancelled'), '[]'::jsonb),
    'returns_today', coalesce((
      select jsonb_agg(jsonb_build_object('ref', r.ref, 'name', r.customer_name, 'gown', g.name,
        'status', r.status) order by r.customer_name, r.ref)
      from public.reservations r join public.gowns g on g.slug = r.gown_slug
      where r.return_on = d and r.status <> 'cancelled'), '[]'::jsonb),
    'next_7_days', coalesce((
      select jsonb_agg(x.j order by x.day, x.ord, x.slot, x.ref) from (
        select f.fitting_date as day, 0 as ord, f.slot, f.ref, jsonb_build_object('day', f.fitting_date,
          'kind', 'fitting', 'ref', f.ref, 'name', f.customer_name, 'gown', g.name, 'status', f.status,
          'slot', f.slot) as j
        from public.fittings f left join public.gowns g on g.slug = f.gown_slug
        where f.fitting_date between d + 1 and d + 7 and f.status <> 'cancelled'
        union all
        select r.pickup_on, 1, '', r.ref, jsonb_build_object('day', r.pickup_on, 'kind', 'pickup',
          'ref', r.ref, 'name', r.customer_name, 'gown', g.name, 'status', r.status)
        from public.reservations r join public.gowns g on g.slug = r.gown_slug
        where r.pickup_on between d + 1 and d + 7 and r.status <> 'cancelled'
        union all
        select r.return_on, 2, '', r.ref, jsonb_build_object('day', r.return_on, 'kind', 'return',
          'ref', r.ref, 'name', r.customer_name, 'gown', g.name, 'status', r.status)
        from public.reservations r join public.gowns g on g.slug = r.gown_slug
        where r.return_on between d + 1 and d + 7 and r.status <> 'cancelled'
      ) x), '[]'::jsonb),
    'this_week', jsonb_build_object(
      'reservations', (select count(*) from public.reservations r
                       where r.created_at >= t0 and r.created_at < t1 and r.status <> 'cancelled'),
      'fittings', (select count(*) from public.fittings f
                   where f.created_at >= t0 and f.created_at < t1 and f.status <> 'cancelled'))
  );
end $$;

-- ₱200 per confirmed, out or returned reservation (same rule as r8.3). Admins only.
create function private.admin_commission() returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare n int;
begin
  if not private.is_admin() then
    raise exception 'cgr:not_admin' using errcode = 'P0001';
  end if;
  select count(*) into n from public.reservations where status in ('confirmed', 'out', 'returned');
  return jsonb_build_object('count', n, 'per_php', 200, 'total_php', n * 200);
end $$;
create function public.admin_commission() returns jsonb language sql stable set search_path = ''
as $$ select private.admin_commission() $$;

revoke execute on function private.admin_commission(), public.admin_commission() from public, anon, authenticated;
grant execute on function private.admin_commission(), public.admin_commission() to authenticated;
