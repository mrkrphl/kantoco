-- CGR r8.4: owner roles and pause, admin RPCs, fitting show-up, owner-entered
-- pickup/return dates, an anonymous page counter and one owner dashboard RPC.
-- No service-role key anywhere: admins act through SECURITY DEFINER RPCs that
-- check the caller themselves. Logins are still created by Mark in Supabase.

-- ---------- owners: role + status ----------
alter table public.owners
  add column role text not null default 'owner' check (role in ('admin', 'owner')),
  add column status text not null default 'active' check (status in ('active', 'paused')),
  add column added_by text,
  add column paused_at timestamptz,
  add column updated_at timestamptz not null default now();

update public.owners set role = 'admin' where email = 'kantoco.ph@gmail.com';

-- The signed-in caller's confirmed email (null when signed out or unconfirmed).
create function private.caller_email() returns text
language sql stable security definer set search_path = ''
as $$
  select lower(u.email) from auth.users u
  where u.id = (select auth.uid()) and u.email_confirmed_at is not null
$$;

-- Pause is enforced here: every owner policy and owner RPC goes through it.
create or replace function private.is_owner() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.owners o
    where o.email = (select private.caller_email()) and o.status = 'active'
  )
$$;

create function private.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.owners o
    where o.email = (select private.caller_email()) and o.status = 'active' and o.role = 'admin'
  )
$$;

-- Server-side guard for every path (RPC, SQL editor, dashboard): the last
-- active admin can't be paused, demoted or removed.
create function private.guard_last_admin() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext('cgr_owners_admins'));
  if old.role = 'admin' and old.status = 'active'
     and (tg_op = 'DELETE' or new.role <> 'admin' or new.status <> 'active')
     and not exists (
       select 1 from public.owners o
       where o.email <> old.email and o.role = 'admin' and o.status = 'active')
  then
    raise exception 'cgr:last_admin' using errcode = 'P0001',
      hint = 'Keep at least one active admin.';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  new.updated_at := now();
  new.paused_at := case when new.status = 'paused' then coalesce(new.paused_at, now()) else null end;
  return new;
end $$;

create trigger owners_guard before update or delete on public.owners
  for each row execute function private.guard_last_admin();

-- Owners no longer see the owner list; admins do (through RLS and the RPCs).
drop policy owner_read on public.owners;
create policy admin_read on public.owners for select to authenticated using ((select private.is_admin()));

-- ---------- admin + session RPCs ----------
create function private.owner_me() returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object('email', o.email, 'role', o.role, 'status', o.status)
  from public.owners o where o.email = (select private.caller_email())
$$;

create function private.need_admin() returns text
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'cgr:not_admin' using errcode = 'P0001';
  end if;
  return private.caller_email();
end $$;

create function private.admin_list_owners()
returns table (email text, role text, status text, added_at timestamptz, paused_at timestamptz,
               has_login boolean, is_you boolean)
language plpgsql stable security definer set search_path = ''
as $$
declare v_me text := private.need_admin();
begin
  return query
    select o.email, o.role, o.status, o.added_at, o.paused_at,
           exists (select 1 from auth.users u where lower(u.email) = o.email and u.email_confirmed_at is not null),
           o.email = v_me
    from public.owners o
    order by (o.email = v_me) desc, o.added_at, o.email;
end $$;

create function private.admin_add_owner(p_email text, p_role text) returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_me text := private.need_admin();
  v_email text := lower(btrim(coalesce(p_email, '')));
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_email) > 254 then
    raise exception 'cgr:bad_email' using errcode = 'P0001';
  end if;
  if p_role not in ('admin', 'owner') then
    raise exception 'cgr:bad_role' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.owners o where o.email = v_email) then
    raise exception 'cgr:exists' using errcode = 'P0001';
  end if;
  insert into public.owners (email, role, status, added_by) values (v_email, p_role, 'active', v_me);
  return jsonb_build_object('email', v_email, 'role', p_role, 'status', 'active');
end $$;

create function private.admin_target(p_email text) returns text
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_me text := private.need_admin();
  v_email text := lower(btrim(coalesce(p_email, '')));
begin
  if v_email = v_me then
    raise exception 'cgr:self' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.owners o where o.email = v_email) then
    raise exception 'cgr:not_found' using errcode = 'P0001';
  end if;
  return v_email;
end $$;

create function private.admin_set_status(p_email text, p_status text) returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare v_email text := private.admin_target(p_email);
begin
  if p_status not in ('active', 'paused') then
    raise exception 'cgr:bad_status' using errcode = 'P0001';
  end if;
  update public.owners o set status = p_status where o.email = v_email;
  return jsonb_build_object('email', v_email, 'status', p_status);
end $$;

create function private.admin_set_role(p_email text, p_role text) returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare v_email text := private.admin_target(p_email);
begin
  if p_role not in ('admin', 'owner') then
    raise exception 'cgr:bad_role' using errcode = 'P0001';
  end if;
  update public.owners o set role = p_role where o.email = v_email;
  return jsonb_build_object('email', v_email, 'role', p_role);
end $$;

create function private.admin_remove_owner(p_email text) returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare v_email text := private.admin_target(p_email);
begin
  delete from public.owners o where o.email = v_email;
  return jsonb_build_object('email', v_email, 'removed', true);
end $$;

-- ---------- bookings: fitting show-up, owner-entered pickup/return ----------
alter table public.fittings
  add column showed text check (showed in ('came', 'no_show'));
alter table public.reservations
  add column pickup_on date,
  add column return_on date,
  add constraint reservations_handover_order check (pickup_on is null or return_on is null or return_on >= pickup_on);

-- ---------- anonymous page counter ----------
-- One row per day and page: no IP, no user agent, no cookie, no visitor id.
create table public.page_views (
  day date not null,
  page text not null check (page in ('home', 'gown', 'reserve', 'fitting', 'confirmation')),
  n integer not null default 0 check (n >= 0),
  primary key (day, page)
);
alter table public.page_views enable row level security;
create policy no_api_access on public.page_views for select to anon, authenticated using (false);

create function private.count_visit(p_page text) returns void
language plpgsql volatile security definer set search_path = ''
as $$
begin
  if p_page not in ('home', 'gown', 'reserve', 'fitting', 'confirmation') then return; end if;
  insert into public.page_views (day, page, n) values (private.manila_today(), p_page, 1)
  on conflict (day, page) do update set n = public.page_views.n + 1;
end $$;

-- ---------- owner dashboard (one RPC, owners only) ----------
-- Today's fittings, today's pickups, the next 7 days, and this week's counts
-- (Monday start, Manila): reservations and fittings by booking date, and visits.
create function private.owner_dashboard() returns jsonb
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
                   where f.created_at >= t0 and f.created_at < t1 and f.status <> 'cancelled'),
      'visits', (select coalesce(sum(p.n), 0) from public.page_views p where p.day between ws and ws + 6))
  );
end $$;

-- ---------- public wrappers (invoker; definer code stays in private) ----------
create function public.owner_me() returns jsonb language sql stable set search_path = ''
as $$ select private.owner_me() $$;
create function public.owner_dashboard() returns jsonb language sql stable set search_path = ''
as $$ select private.owner_dashboard() $$;
create function public.admin_list_owners()
returns table (email text, role text, status text, added_at timestamptz, paused_at timestamptz,
               has_login boolean, is_you boolean)
language sql stable set search_path = ''
as $$ select * from private.admin_list_owners() $$;
create function public.admin_add_owner(p_email text, p_role text) returns jsonb
language sql volatile set search_path = '' as $$ select private.admin_add_owner(p_email, p_role) $$;
create function public.admin_set_status(p_email text, p_status text) returns jsonb
language sql volatile set search_path = '' as $$ select private.admin_set_status(p_email, p_status) $$;
create function public.admin_set_role(p_email text, p_role text) returns jsonb
language sql volatile set search_path = '' as $$ select private.admin_set_role(p_email, p_role) $$;
create function public.admin_remove_owner(p_email text) returns jsonb
language sql volatile set search_path = '' as $$ select private.admin_remove_owner(p_email) $$;
create function public.count_visit(p_page text) returns void
language sql volatile set search_path = '' as $$ select private.count_visit(p_page) $$;

-- ---------- grants ----------
revoke execute on all functions in schema private from public, anon, authenticated;
revoke execute on function public.owner_me(), public.owner_dashboard(), public.admin_list_owners(),
  public.admin_add_owner(text, text), public.admin_set_status(text, text), public.admin_set_role(text, text),
  public.admin_remove_owner(text), public.count_visit(text) from public, anon, authenticated;
revoke all on public.page_views from anon, authenticated;

-- Re-grant what r8.1 already exposed (the revoke above covers every private function).
grant execute on function
  private.create_reservation(text, date, date, text, text, text, text),
  private.create_fitting(date, text, text, text, text, text, text, text),
  private.taken_days(text, date, date),
  private.taken_slots(date),
  private.fitting_times(),
  private.booking_summary(text),
  private.count_visit(text)
to anon, authenticated;
grant execute on function public.count_visit(text) to anon, authenticated;

grant execute on function
  private.is_owner(), private.is_admin(), private.caller_email(), private.owner_me(), private.owner_dashboard(),
  private.need_admin(), private.admin_target(text), private.admin_list_owners(), private.admin_add_owner(text, text),
  private.admin_set_status(text, text), private.admin_set_role(text, text), private.admin_remove_owner(text)
to authenticated;
grant execute on function
  public.owner_me(), public.owner_dashboard(), public.admin_list_owners(), public.admin_add_owner(text, text),
  public.admin_set_status(text, text), public.admin_set_role(text, text), public.admin_remove_owner(text)
to authenticated;

grant update (showed) on public.fittings to authenticated;
grant update (pickup_on, return_on) on public.reservations to authenticated;
