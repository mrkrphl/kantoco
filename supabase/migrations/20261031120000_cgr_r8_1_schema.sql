-- CGR r8.1: bookings database (Supabase free project cgr-rentals, ap-southeast-1).
-- Public access is RPC only. anon/authenticated have no table grants; the owner
-- (an allowlisted, confirmed email) reads and updates through RLS.
-- No test/sample column (Mark, 31 Oct: "Test flag: no").

create extension if not exists btree_gist with schema extensions;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

-- ---------- tables ----------

create table public.gowns (
  slug text primary key check (slug ~ '^[a-z0-9-]{2,60}$'),
  name text not null check (length(name) between 1 and 80),
  price_per_day integer not null check (price_per_day > 0),
  active boolean not null default true
);

create table public.gown_aliases (
  alias text primary key check (alias ~ '^[a-z0-9-]{2,60}$'),
  slug text not null references public.gowns (slug) on update cascade
);
create index gown_aliases_slug_idx on public.gown_aliases (slug);

-- Owner-editable fitting times ("Fitting times: keep current, owner-editable").
create table public.fitting_slots (
  slot text primary key check (slot ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Owner allowlist by email: access starts once a confirmed account with this email exists.
create table public.owners (
  email text primary key check (email = lower(btrim(email)) and email like '%_@_%'),
  added_at timestamptz not null default now()
);

create table public.reservations (
  ref text primary key check (ref ~ '^CGR-[A-HJ-NP-Z2-9]{4}$'),
  gown_slug text not null references public.gowns (slug) on update cascade,
  event_date date not null,
  return_date date not null,
  rate_php integer not null check (rate_php > 0),
  -- Customer total = rate x days (both dates count). No commission column.
  total_php integer generated always as (rate_php * (return_date - event_date + 1)) stored,
  customer_name text not null check (length(btrim(customer_name)) between 1 and 80),
  customer_contact text not null check (length(btrim(customer_contact)) between 1 and 80),
  notes text not null default '' check (length(notes) <= 500),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'out', 'returned', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_dates_order check (return_date >= event_date),
  constraint reservations_max_days check (return_date - event_date <= 30),
  -- Mirrors holdsGown(): pending/confirmed/out hold the gown. Postgres picks one winner.
  constraint reservations_no_overlap exclude using gist (
    gown_slug with =,
    daterange(event_date, return_date, '[]') with &&
  ) where (status in ('pending', 'confirmed', 'out'))
);
create index reservations_event_idx on public.reservations (event_date);

create table public.fittings (
  ref text primary key check (ref ~ '^CGR-[A-HJ-NP-Z2-9]{4}$'),
  -- Optional; may be an older on-device code, so no foreign key.
  linked_ref text check (linked_ref is null or linked_ref ~ '^CGR-[A-HJ-NP-Z2-9]{4}$'),
  gown_slug text references public.gowns (slug) on update cascade,
  fitting_date date not null,
  slot text not null references public.fitting_slots (slot) on update cascade,
  customer_name text not null check (length(btrim(customer_name)) between 1 and 80),
  customer_contact text not null check (length(btrim(customer_contact)) between 1 and 80),
  notes text not null default '' check (length(notes) <= 500),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'out', 'returned', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- One live fitting per day and time.
create unique index fittings_one_per_slot on public.fittings (fitting_date, slot)
  where status <> 'cancelled';
create index fittings_gown_idx on public.fittings (gown_slug);
create index fittings_slot_idx on public.fittings (slot);

-- One code namespace for reservations and fittings.
create table private.refs (
  ref text primary key,
  kind text not null check (kind in ('reserve', 'fitting')),
  created_at timestamptz not null default now()
);

create table private.rate_events (
  id bigint generated always as identity primary key,
  bucket text not null,
  at timestamptz not null default now()
);
create index rate_events_bucket_at_idx on private.rate_events (bucket, at);

-- ---------- helpers (private, not exposed by the Data API) ----------

create function private.manila_today() returns date
language sql stable set search_path = ''
as $$ select (now() at time zone 'Asia/Manila')::date $$;

create function private.is_owner() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.owners o
    join auth.users u on lower(u.email) = o.email
    where u.id = (select auth.uid())
      and u.email_confirmed_at is not null
  )
$$;

-- Rejects dates before Manila's today on insert (customers and owner alike).
create function private.no_past_dates() returns trigger
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

create function private.touch_updated_at() returns trigger
language plpgsql set search_path = ''
as $$ begin new.updated_at := now(); return new; end $$;

create trigger reservations_no_past before insert on public.reservations
  for each row execute function private.no_past_dates();
create trigger fittings_no_past before insert on public.fittings
  for each row execute function private.no_past_dates();
create trigger reservations_touch before update on public.reservations
  for each row execute function private.touch_updated_at();
create trigger fittings_touch before update on public.fittings
  for each row execute function private.touch_updated_at();
create trigger fitting_slots_touch before update on public.fitting_slots
  for each row execute function private.touch_updated_at();

create function private.make_ref() returns text
language plpgsql volatile set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  b bytea := uuid_send(gen_random_uuid());
  v_out text := 'CGR-';
begin
  for i in 0..3 loop
    v_out := v_out || substr(alphabet, (get_byte(b, i) % 32) + 1, 1);
  end loop;
  return v_out;
end $$;

-- Rate limit: 5 per 10 minutes per caller IP (hashed, never stored raw) and
-- 60 per hour overall, per kind. Turnstile comes at go-live.
create function private.rate_ok(p_kind text) returns boolean
language plpgsql volatile set search_path = ''
as $$
declare
  hdr json := nullif(current_setting('request.headers', true), '')::json;
  ip text := coalesce(
    nullif(btrim(split_part(hdr ->> 'x-forwarded-for', ',', 1)), ''),
    nullif(hdr ->> 'cf-connecting-ip', ''),
    'none');
  v_bucket text := p_kind || ':' || encode(sha256(convert_to(ip, 'UTF8')), 'hex');
begin
  delete from private.rate_events where at < now() - interval '1 day';
  if (select count(*) from private.rate_events r
      where r.bucket = v_bucket and r.at > now() - interval '10 minutes') >= 5 then
    return false;
  end if;
  if (select count(*) from private.rate_events r
      where r.bucket like p_kind || ':%' and r.at > now() - interval '1 hour') >= 60 then
    return false;
  end if;
  insert into private.rate_events (bucket) values (v_bucket);
  return true;
end $$;

create function private.taken_days(p_slug text, p_from date, p_to date) returns setof date
language sql stable security definer set search_path = ''
as $$
  with g as (
    select coalesce((select a.slug from public.gown_aliases a where a.alias = p_slug), p_slug) as slug
  )
  select d::date
  from generate_series(p_from, least(p_to, p_from + 400), interval '1 day') d
  where p_from is not null and p_to is not null and p_to >= p_from
    and exists (
      select 1 from public.reservations r, g
      where r.gown_slug = g.slug
        and r.status in ('pending', 'confirmed', 'out')
        and d::date between r.event_date and r.return_date)
  order by 1
$$;

create function private.taken_slots(p_day date) returns setof text
language sql stable security definer set search_path = ''
as $$
  select f.slot from public.fittings f
  where f.fitting_date = p_day and f.status <> 'cancelled'
  order by 1
$$;

create function private.fitting_times() returns setof text
language sql stable security definer set search_path = ''
as $$ select s.slot from public.fitting_slots s where s.active order by s.slot $$;

create function private.create_reservation(
  p_slug text, p_event date, p_return date,
  p_name text, p_contact text, p_notes text, p_website text
) returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_slug text;
  v_rate integer;
  v_ref text;
  v_con text;
begin
  if coalesce(p_website, '') <> '' then
    return jsonb_build_object('ok', false, 'error', 'rejected');
  end if;
  if p_event is null or p_return is null or p_return < p_event then
    return jsonb_build_object('ok', false, 'error', 'missing');
  end if;
  if p_event < private.manila_today() then
    return jsonb_build_object('ok', false, 'error', 'past');
  end if;
  if p_return - p_event > 30 or p_event > private.manila_today() + 366 then
    return jsonb_build_object('ok', false, 'error', 'too_far');
  end if;
  if length(btrim(coalesce(p_name, ''))) not between 1 and 80
     or length(btrim(coalesce(p_contact, ''))) not between 1 and 80
     or length(coalesce(p_notes, '')) > 500 then
    return jsonb_build_object('ok', false, 'error', 'details');
  end if;
  v_slug := coalesce((select a.slug from public.gown_aliases a where a.alias = p_slug), p_slug);
  select g.price_per_day into v_rate from public.gowns g where g.slug = v_slug and g.active;
  if v_rate is null then
    return jsonb_build_object('ok', false, 'error', 'unknown_gown');
  end if;
  if not private.rate_ok('reserve') then
    return jsonb_build_object('ok', false, 'error', 'slow_down');
  end if;
  for attempt in 1..8 loop
    v_ref := private.make_ref();
    begin
      insert into private.refs (ref, kind) values (v_ref, 'reserve');
      insert into public.reservations
        (ref, gown_slug, event_date, return_date, rate_php, customer_name, customer_contact, notes)
      values
        (v_ref, v_slug, p_event, p_return, v_rate, btrim(p_name), btrim(p_contact), coalesce(p_notes, ''));
      return jsonb_build_object('ok', true, 'ref', v_ref);
    exception
      when exclusion_violation then
        return jsonb_build_object('ok', false, 'error', 'taken', 'days',
          (select coalesce(jsonb_agg(t), '[]'::jsonb) from private.taken_days(v_slug, p_event, p_return) t));
      when unique_violation then
        get stacked diagnostics v_con = constraint_name;
        if v_con not in ('refs_pkey', 'reservations_pkey') then raise; end if;
    end;
  end loop;
  return jsonb_build_object('ok', false, 'error', 'busy');
end $$;

create function private.create_fitting(
  p_day date, p_slot text, p_linked_ref text, p_slug text,
  p_name text, p_contact text, p_notes text, p_website text
) returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_res public.reservations%rowtype;
  v_slug text;
  v_name text := btrim(coalesce(p_name, ''));
  v_contact text := btrim(coalesce(p_contact, ''));
  v_linked text := nullif(upper(btrim(coalesce(p_linked_ref, ''))), '');
  v_ref text;
  v_con text;
begin
  if coalesce(p_website, '') <> '' then
    return jsonb_build_object('ok', false, 'error', 'rejected');
  end if;
  if p_day is null or p_slot is null then
    return jsonb_build_object('ok', false, 'error', 'missing');
  end if;
  if p_day < private.manila_today() then
    return jsonb_build_object('ok', false, 'error', 'past');
  end if;
  if p_day > private.manila_today() + 366 then
    return jsonb_build_object('ok', false, 'error', 'too_far');
  end if;
  if not exists (select 1 from public.fitting_slots s where s.slot = p_slot and s.active) then
    return jsonb_build_object('ok', false, 'error', 'unknown_slot');
  end if;
  if v_linked is not null and v_linked !~ '^CGR-[A-HJ-NP-Z2-9]{4}$' then
    return jsonb_build_object('ok', false, 'error', 'bad_code');
  end if;
  if v_linked is not null then
    select * into v_res from public.reservations r where r.ref = v_linked;
    if found then
      if p_day >= v_res.event_date then
        return jsonb_build_object('ok', false, 'error', 'before-event');
      end if;
      v_slug := v_res.gown_slug;
      if v_name = '' then v_name := v_res.customer_name; end if;
      if v_contact = '' then v_contact := v_res.customer_contact; end if;
    end if;
  end if;
  if v_slug is null and nullif(p_slug, '') is not null then
    v_slug := coalesce((select a.slug from public.gown_aliases a where a.alias = p_slug), p_slug);
    if not exists (select 1 from public.gowns g where g.slug = v_slug) then
      v_slug := null;
    end if;
  end if;
  if length(v_name) not between 1 and 80 or length(v_contact) not between 1 and 80
     or length(coalesce(p_notes, '')) > 500 then
    return jsonb_build_object('ok', false, 'error', 'details');
  end if;
  if not private.rate_ok('fitting') then
    return jsonb_build_object('ok', false, 'error', 'slow_down');
  end if;
  for attempt in 1..8 loop
    v_ref := private.make_ref();
    begin
      insert into private.refs (ref, kind) values (v_ref, 'fitting');
      insert into public.fittings
        (ref, linked_ref, gown_slug, fitting_date, slot, customer_name, customer_contact, notes)
      values
        (v_ref, v_linked, v_slug, p_day, p_slot, v_name, v_contact, coalesce(p_notes, ''));
      return jsonb_build_object('ok', true, 'ref', v_ref);
    exception
      when unique_violation then
        get stacked diagnostics v_con = constraint_name;
        if v_con = 'fittings_one_per_slot' then
          return jsonb_build_object('ok', false, 'error', 'taken');
        elsif v_con not in ('refs_pkey', 'fittings_pkey') then
          raise;
        end if;
    end;
  end loop;
  return jsonb_build_object('ok', false, 'error', 'busy');
end $$;

-- The Done page and old codes: no name, contact, notes or money.
create function private.booking_summary(p_ref text) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select jsonb_build_object('kind', 'reserve', 'ref', r.ref, 'gown_slug', r.gown_slug,
        'event_date', r.event_date, 'return_date', r.return_date, 'status', r.status)
     from public.reservations r where r.ref = upper(btrim(p_ref))),
    (select jsonb_build_object('kind', 'fitting', 'ref', f.ref, 'gown_slug', f.gown_slug,
        'linked_ref', f.linked_ref, 'fitting_date', f.fitting_date, 'slot', f.slot, 'status', f.status)
     from public.fittings f where f.ref = upper(btrim(p_ref))))
$$;

-- ---------- public API (invoker wrappers; the definer code stays in private) ----------

create function public.create_reservation(
  p_slug text, p_event date, p_return date,
  p_name text, p_contact text, p_notes text default '', p_website text default ''
) returns jsonb language sql volatile set search_path = ''
as $$ select private.create_reservation(p_slug, p_event, p_return, p_name, p_contact, p_notes, p_website) $$;

create function public.create_fitting(
  p_day date, p_slot text, p_name text default '', p_contact text default '',
  p_linked_ref text default null, p_slug text default null,
  p_notes text default '', p_website text default ''
) returns jsonb language sql volatile set search_path = ''
as $$ select private.create_fitting(p_day, p_slot, p_linked_ref, p_slug, p_name, p_contact, p_notes, p_website) $$;

create function public.taken_days(p_slug text, p_from date, p_to date) returns setof date
language sql stable set search_path = ''
as $$ select private.taken_days(p_slug, p_from, p_to) $$;

create function public.taken_slots(p_day date) returns setof text
language sql stable set search_path = ''
as $$ select private.taken_slots(p_day) $$;

create function public.fitting_times() returns setof text
language sql stable set search_path = ''
as $$ select private.fitting_times() $$;

create function public.booking_summary(p_ref text) returns jsonb
language sql stable set search_path = ''
as $$ select private.booking_summary(p_ref) $$;

-- ---------- grants ----------

revoke all on all tables in schema public from anon, authenticated;
revoke all on all tables in schema private from public, anon, authenticated;
revoke all on all sequences in schema private from public, anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;
revoke execute on all functions in schema private from public, anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

grant execute on function
  public.create_reservation(text, date, date, text, text, text, text),
  public.create_fitting(date, text, text, text, text, text, text, text),
  public.taken_days(text, date, date),
  public.taken_slots(date),
  public.fitting_times(),
  public.booking_summary(text)
to anon, authenticated;
grant execute on function
  private.create_reservation(text, date, date, text, text, text, text),
  private.create_fitting(date, text, text, text, text, text, text, text),
  private.taken_days(text, date, date),
  private.taken_slots(date),
  private.fitting_times(),
  private.booking_summary(text)
to anon, authenticated;
grant execute on function private.is_owner() to authenticated;

-- Owner (authenticated + allowlisted): read everything, change status, edit times.
grant select on public.reservations, public.fittings, public.gowns, public.fitting_slots, public.owners to authenticated;
grant update (status) on public.reservations, public.fittings to authenticated;
grant insert (slot, active), update (slot, active) on public.fitting_slots to authenticated;

-- ---------- RLS ----------

alter table public.gowns enable row level security;
alter table public.gown_aliases enable row level security;
alter table public.fitting_slots enable row level security;
alter table public.owners enable row level security;
alter table public.reservations enable row level security;
alter table public.fittings enable row level security;
alter table private.refs enable row level security;
alter table private.rate_events enable row level security;

create policy owner_read on public.reservations for select to authenticated using ((select private.is_owner()));
create policy owner_status on public.reservations for update to authenticated
  using ((select private.is_owner())) with check ((select private.is_owner()));
create policy owner_read on public.fittings for select to authenticated using ((select private.is_owner()));
create policy owner_status on public.fittings for update to authenticated
  using ((select private.is_owner())) with check ((select private.is_owner()));
create policy owner_read on public.gowns for select to authenticated using ((select private.is_owner()));
create policy owner_read on public.fitting_slots for select to authenticated using ((select private.is_owner()));
create policy owner_add on public.fitting_slots for insert to authenticated with check ((select private.is_owner()));
create policy owner_edit on public.fitting_slots for update to authenticated
  using ((select private.is_owner())) with check ((select private.is_owner()));
create policy owner_read on public.owners for select to authenticated using ((select private.is_owner()));
-- gown_aliases, private.refs, private.rate_events: no policies (definer code only).
