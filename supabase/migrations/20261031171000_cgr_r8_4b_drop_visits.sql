-- CGR r8.4b: Mark dropped the visit counter (his pick, 31 Oct 2026, 5:04 PM PHT).
-- Removes the page_views table, both count_visit functions and the visits
-- number from owner_dashboard. Nothing on the site calls count_visit (the
-- beacon was never shipped). "This week" stays: reservations and fittings
-- created this week, Manila time (Monday start), cancelled left out.

drop function if exists public.count_visit(text);
drop function if exists private.count_visit(text);
drop table if exists public.page_views;

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
        'gown', g.name, 'linked_ref', f.linked_ref, 'status', f.status, 'showed', f.showed) order by f.slot)
      from public.fittings f left join public.gowns g on g.slug = f.gown_slug
      where f.fitting_date = d and f.status <> 'cancelled'), '[]'::jsonb),
    'pickups_today', coalesce((
      select jsonb_agg(jsonb_build_object('ref', r.ref, 'name', r.customer_name, 'gown', g.name,
        'status', r.status, 'return_on', r.return_on) order by r.ref)
      from public.reservations r join public.gowns g on g.slug = r.gown_slug
      where r.pickup_on = d and r.status <> 'cancelled'), '[]'::jsonb),
    'next_7_days', coalesce((
      select jsonb_agg(x.j order by x.day, x.ord, x.ref) from (
        select r.pickup_on as day, 1 as ord, r.ref, jsonb_build_object('day', r.pickup_on, 'kind', 'pickup',
          'ref', r.ref, 'name', r.customer_name, 'gown', g.name, 'status', r.status) as j
        from public.reservations r join public.gowns g on g.slug = r.gown_slug
        where r.pickup_on between d + 1 and d + 7 and r.status <> 'cancelled'
        union all
        select r.return_on, 2, r.ref, jsonb_build_object('day', r.return_on, 'kind', 'return',
          'ref', r.ref, 'name', r.customer_name, 'gown', g.name, 'status', r.status)
        from public.reservations r join public.gowns g on g.slug = r.gown_slug
        where r.return_on between d + 1 and d + 7 and r.status <> 'cancelled'
        union all
        select f.fitting_date, 0, f.ref, jsonb_build_object('day', f.fitting_date, 'kind', 'fitting',
          'ref', f.ref, 'name', f.customer_name, 'gown', g.name, 'status', f.status, 'slot', f.slot)
        from public.fittings f left join public.gowns g on g.slug = f.gown_slug
        where f.fitting_date between d + 1 and d + 7 and f.status <> 'cancelled'
      ) x), '[]'::jsonb),
    'this_week', jsonb_build_object(
      'reservations', (select count(*) from public.reservations r
                       where r.created_at >= t0 and r.created_at < t1 and r.status <> 'cancelled'),
      'fittings', (select count(*) from public.fittings f
                   where f.created_at >= t0 and f.created_at < t1 and f.status <> 'cancelled'))
  );
end $$;
