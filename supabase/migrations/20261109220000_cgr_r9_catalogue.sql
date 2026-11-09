-- CGR r9: owner catalogue, attribution, storage, monthly commission.
-- Free project only. Public reads available items; owners/admins write.

-- ---------- catalogue columns on gowns ----------
alter table public.gowns
  add column if not exists item_type text not null default 'gown'
    check (item_type in ('gown','filipiniana','barong_suit','kids','accessory')),
  add column if not exists colors text[] not null default '{}',
  add column if not exists sizes text[] not null default '{}',
  add column if not exists occasions text[] not null default '{}',
  add column if not exists notes text not null default '' check (length(notes) <= 1000),
  add column if not exists photos jsonb not null default '[]'::jsonb,
  add column if not exists blurb text not null default '' check (length(blurb) <= 500),
  add column if not exists status text not null default 'available'
    check (status in ('available','paused')),
  add column if not exists updated_at timestamptz not null default now();

-- Optional rental price: drop NOT NULL / >0 so blank hides on the public site.
alter table public.gowns alter column price_per_day drop not null;
alter table public.gowns drop constraint if exists gowns_price_per_day_check;
alter table public.gowns add constraint gowns_price_per_day_check
  check (price_per_day is null or price_per_day > 0);

-- Keep active in sync with status for older RPCs that still read active.
create or replace function private.gowns_sync_active() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.active := (new.status = 'available');
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists gowns_sync_active on public.gowns;
create trigger gowns_sync_active before insert or update on public.gowns
  for each row execute function private.gowns_sync_active();

update public.gowns set status = case when active then 'available' else 'paused' end
  where status is distinct from case when active then 'available' else 'paused' end;

-- ---------- attribution on reservations ----------
alter table public.reservations
  add column if not exists source text not null default 'direct'
    check (source in ('ad','facebook','messenger','qr','direct','other')),
  add column if not exists utm_source text not null default '' check (length(utm_source) <= 80),
  add column if not exists utm_medium text not null default '' check (length(utm_medium) <= 80),
  add column if not exists utm_campaign text not null default '' check (length(utm_campaign) <= 120);

-- ---------- storage bucket (public read; owner write) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cgr-catalogue',
  'cgr-catalogue',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists cgr_catalogue_public_read on storage.objects;
create policy cgr_catalogue_public_read on storage.objects
  for select to public
  using (bucket_id = 'cgr-catalogue');

drop policy if exists cgr_catalogue_owner_insert on storage.objects;
create policy cgr_catalogue_owner_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'cgr-catalogue' and private.is_owner());

drop policy if exists cgr_catalogue_owner_update on storage.objects;
create policy cgr_catalogue_owner_update on storage.objects
  for update to authenticated
  using (bucket_id = 'cgr-catalogue' and private.is_owner())
  with check (bucket_id = 'cgr-catalogue' and private.is_owner());

drop policy if exists cgr_catalogue_owner_delete on storage.objects;
create policy cgr_catalogue_owner_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'cgr-catalogue' and private.is_owner());

-- ---------- public catalogue read (available only) ----------
create or replace function private.list_catalogue() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'slug', g.slug,
      'name', g.name,
      'item_type', g.item_type,
      'colors', to_jsonb(g.colors),
      'sizes', to_jsonb(g.sizes),
      'occasions', to_jsonb(g.occasions),
      'price_per_day', g.price_per_day,
      'blurb', g.blurb,
      'notes', g.notes,
      'photos', g.photos,
      'status', g.status
    ) order by g.name)
    from public.gowns g
    where g.status = 'available'
  ), '[]'::jsonb);
end $$;

create or replace function public.list_catalogue() returns jsonb
language sql stable set search_path = '' as $$ select private.list_catalogue() $$;

revoke execute on function private.list_catalogue(), public.list_catalogue() from public, anon, authenticated;
grant execute on function private.list_catalogue(), public.list_catalogue() to anon, authenticated;

-- One gown by slug (available only for anon; owners see paused too via table).
create or replace function private.get_catalogue_item(p_slug text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v jsonb;
begin
  select jsonb_build_object(
    'slug', g.slug, 'name', g.name, 'item_type', g.item_type,
    'colors', to_jsonb(g.colors), 'sizes', to_jsonb(g.sizes),
    'occasions', to_jsonb(g.occasions), 'price_per_day', g.price_per_day,
    'blurb', g.blurb, 'notes', g.notes, 'photos', g.photos, 'status', g.status
  ) into v from public.gowns g
  where g.slug = lower(btrim(p_slug)) and g.status = 'available';
  return v;
end $$;

create or replace function public.get_catalogue_item(p_slug text) returns jsonb
language sql stable set search_path = '' as $$ select private.get_catalogue_item(p_slug) $$;

revoke execute on function private.get_catalogue_item(text), public.get_catalogue_item(text) from public, anon, authenticated;
grant execute on function private.get_catalogue_item(text), public.get_catalogue_item(text) to anon, authenticated;

-- Free on a date? (true when no overlapping live reservation)
create or replace function private.gown_free_on(p_slug text, p_event date, p_return date) returns boolean
language plpgsql stable security definer set search_path = '' as $$
begin
  if p_event is null or p_return is null or p_return < p_event then return false; end if;
  if not exists (select 1 from public.gowns g where g.slug = p_slug and g.status = 'available') then
    return false;
  end if;
  return not exists (
    select 1 from public.reservations r
    where r.gown_slug = p_slug
      and r.status in ('pending','confirmed','out')
      and daterange(r.event_date, r.return_date, '[]') && daterange(p_event, p_return, '[]')
  );
end $$;

create or replace function public.gown_free_on(p_slug text, p_event date, p_return date) returns boolean
language sql stable set search_path = '' as $$ select private.gown_free_on(p_slug, p_event, p_return) $$;

revoke execute on function private.gown_free_on(text,date,date), public.gown_free_on(text,date,date) from public, anon, authenticated;
grant execute on function private.gown_free_on(text,date,date), public.gown_free_on(text,date,date) to anon, authenticated;

-- ---------- owner catalogue write RPCs ----------
create or replace function private.owner_upsert_gown(
  p_slug text, p_name text, p_item_type text, p_colors text[], p_sizes text[],
  p_occasions text[], p_price integer, p_blurb text, p_notes text,
  p_photos jsonb, p_status text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_slug text := lower(btrim(p_slug));
begin
  if not private.is_owner() then raise exception 'cgr:not_owner' using errcode = 'P0001'; end if;
  if v_slug is null or v_slug !~ '^[a-z0-9-]{2,60}$' then
    raise exception 'cgr:bad_slug' using errcode = 'P0001';
  end if;
  if p_item_type not in ('gown','filipiniana','barong_suit','kids','accessory') then
    raise exception 'cgr:bad_type' using errcode = 'P0001';
  end if;
  if p_status not in ('available','paused') then
    raise exception 'cgr:bad_status' using errcode = 'P0001';
  end if;
  if p_price is not null and p_price <= 0 then
    raise exception 'cgr:bad_price' using errcode = 'P0001';
  end if;
  insert into public.gowns as g (
    slug, name, item_type, colors, sizes, occasions, price_per_day, blurb, notes, photos, status, active
  ) values (
    v_slug, btrim(p_name), p_item_type, coalesce(p_colors,'{}'), coalesce(p_sizes,'{}'),
    coalesce(p_occasions,'{}'), p_price, coalesce(p_blurb,''), coalesce(p_notes,''),
    coalesce(p_photos,'[]'::jsonb), p_status, p_status = 'available'
  )
  on conflict (slug) do update set
    name = excluded.name,
    item_type = excluded.item_type,
    colors = excluded.colors,
    sizes = excluded.sizes,
    occasions = excluded.occasions,
    price_per_day = excluded.price_per_day,
    blurb = excluded.blurb,
    notes = excluded.notes,
    photos = excluded.photos,
    status = excluded.status,
    active = excluded.active,
    updated_at = now();
  return jsonb_build_object('ok', true, 'slug', v_slug);
end $$;

create or replace function public.owner_upsert_gown(
  p_slug text, p_name text, p_item_type text, p_colors text[], p_sizes text[],
  p_occasions text[], p_price integer, p_blurb text, p_notes text,
  p_photos jsonb, p_status text
) returns jsonb language sql volatile set search_path = '' as $$
  select private.owner_upsert_gown(p_slug,p_name,p_item_type,p_colors,p_sizes,p_occasions,p_price,p_blurb,p_notes,p_photos,p_status)
$$;

create or replace function private.owner_set_gown_status(p_slug text, p_status text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_owner() then raise exception 'cgr:not_owner' using errcode = 'P0001'; end if;
  if p_status not in ('available','paused') then raise exception 'cgr:bad_status' using errcode = 'P0001'; end if;
  update public.gowns set status = p_status where slug = lower(btrim(p_slug));
  if not found then raise exception 'cgr:not_found' using errcode = 'P0001'; end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.owner_set_gown_status(p_slug text, p_status text) returns jsonb
language sql volatile set search_path = '' as $$ select private.owner_set_gown_status(p_slug, p_status) $$;

-- Remove only when no live bookings hold the gown.
create or replace function private.owner_remove_gown(p_slug text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v text := lower(btrim(p_slug));
begin
  if not private.is_owner() then raise exception 'cgr:not_owner' using errcode = 'P0001'; end if;
  if exists (
    select 1 from public.reservations r
    where r.gown_slug = v and r.status in ('pending','confirmed','out')
  ) then
    raise exception 'cgr:has_bookings' using errcode = 'P0001';
  end if;
  delete from public.gown_aliases where slug = v;
  update public.fittings set gown_slug = null where gown_slug = v;
  delete from public.gowns where slug = v;
  if not found then raise exception 'cgr:not_found' using errcode = 'P0001'; end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.owner_remove_gown(p_slug text) returns jsonb
language sql volatile set search_path = '' as $$ select private.owner_remove_gown(p_slug) $$;

revoke execute on function private.owner_upsert_gown(text,text,text,text[],text[],text[],integer,text,text,jsonb,text) from public, anon, authenticated;
revoke execute on function public.owner_upsert_gown(text,text,text,text[],text[],text[],integer,text,text,jsonb,text) from public, anon, authenticated;
grant execute on function private.owner_upsert_gown(text,text,text,text[],text[],text[],integer,text,text,jsonb,text), public.owner_upsert_gown(text,text,text,text[],text[],text[],integer,text,text,jsonb,text) to authenticated;
revoke execute on function private.owner_set_gown_status(text,text), public.owner_set_gown_status(text,text) from public, anon, authenticated;
grant execute on function private.owner_set_gown_status(text,text), public.owner_set_gown_status(text,text) to authenticated;
revoke execute on function private.owner_remove_gown(text), public.owner_remove_gown(text) from public, anon, authenticated;
grant execute on function private.owner_remove_gown(text), public.owner_remove_gown(text) to authenticated;

-- Owner list (all statuses)
create or replace function private.owner_list_gowns() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.is_owner() then raise exception 'cgr:not_owner' using errcode = 'P0001'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'slug', g.slug, 'name', g.name, 'item_type', g.item_type,
      'colors', to_jsonb(g.colors), 'sizes', to_jsonb(g.sizes),
      'occasions', to_jsonb(g.occasions), 'price_per_day', g.price_per_day,
      'blurb', g.blurb, 'notes', g.notes, 'photos', g.photos, 'status', g.status,
      'updated_at', g.updated_at
    ) order by g.name)
    from public.gowns g
  ), '[]'::jsonb);
end $$;

create or replace function public.owner_list_gowns() returns jsonb
language sql stable set search_path = '' as $$ select private.owner_list_gowns() $$;
revoke execute on function private.owner_list_gowns(), public.owner_list_gowns() from public, anon, authenticated;
grant execute on function private.owner_list_gowns(), public.owner_list_gowns() to authenticated;

-- ---------- create_reservation with attribution ----------
-- Extend the existing private.create_reservation (keeps manila_today, rate_ok, make_ref).
drop function if exists public.create_reservation(text, date, date, text, text, text, text);
drop function if exists private.create_reservation(text, date, date, text, text, text, text);
create function private.create_reservation(
  p_slug text, p_event date, p_return date, p_name text, p_contact text, p_notes text, p_website text,
  p_source text default 'direct', p_utm_source text default '', p_utm_medium text default '', p_utm_campaign text default ''
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_slug text;
  v_rate integer;
  v_ref text;
  v_con text;
  v_source text := coalesce(nullif(btrim(p_source), ''), 'direct');
begin
  if coalesce(p_website, '') <> '' then
    return jsonb_build_object('ok', false, 'error', 'rejected');
  end if;
  if v_source not in ('ad','facebook','messenger','qr','direct','other') then
    v_source := 'other';
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
  select g.price_per_day into v_rate from public.gowns g
    where g.slug = v_slug and g.status = 'available' and g.price_per_day is not null;
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
        (ref, gown_slug, event_date, return_date, rate_php, customer_name, customer_contact, notes,
         source, utm_source, utm_medium, utm_campaign)
      values
        (v_ref, v_slug, p_event, p_return, v_rate, btrim(p_name), btrim(p_contact), coalesce(p_notes, ''),
         v_source, left(coalesce(p_utm_source,''),80), left(coalesce(p_utm_medium,''),80), left(coalesce(p_utm_campaign,''),120));
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

-- Drop the old 7-arg private if Postgres kept it as a separate overload (defaults make one function).
-- Public wrappers:
drop function if exists public.create_reservation(text, date, date, text, text, text, text);
create function public.create_reservation(
  p_slug text, p_event date, p_return date, p_name text, p_contact text, p_notes text, p_website text
) returns jsonb language sql volatile set search_path = '' as $$
  select private.create_reservation(p_slug, p_event, p_return, p_name, p_contact, p_notes, p_website, 'direct', '', '', '')
$$;

drop function if exists public.create_reservation(text, date, date, text, text, text, text, text, text, text, text);
create function public.create_reservation(
  p_slug text, p_event date, p_return date, p_name text, p_contact text, p_notes text, p_website text,
  p_source text, p_utm_source text, p_utm_medium text, p_utm_campaign text
) returns jsonb language sql volatile set search_path = '' as $$
  select private.create_reservation(p_slug, p_event, p_return, p_name, p_contact, p_notes, p_website, p_source, p_utm_source, p_utm_medium, p_utm_campaign)
$$;

revoke execute on function public.create_reservation(text,date,date,text,text,text,text) from public, anon, authenticated;
grant execute on function public.create_reservation(text,date,date,text,text,text,text) to anon, authenticated;
revoke execute on function public.create_reservation(text,date,date,text,text,text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.create_reservation(text,date,date,text,text,text,text,text,text,text,text) to anon, authenticated;

-- ---------- admin monthly commission (admins only) ----------
drop function if exists public.admin_commission();
drop function if exists private.admin_commission();
create function private.admin_commission(p_month text default null) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_month date;
  v_start date;
  v_end date;
  n int;
  rows jsonb;
begin
  if not private.is_admin() then
    raise exception 'cgr:not_admin' using errcode = 'P0001';
  end if;
  if p_month is null or btrim(p_month) = '' then
    v_month := date_trunc('month', timezone('Asia/Manila', now()))::date;
  else
    v_month := (p_month || '-01')::date;
  end if;
  v_start := v_month;
  v_end := (v_month + interval '1 month')::date;
  select count(*) into n from public.reservations r
    where r.status in ('confirmed','out','returned')
      and r.created_at >= v_start::timestamptz
      and r.created_at < v_end::timestamptz;
  select coalesce(jsonb_agg(jsonb_build_object(
    'ref', r.ref, 'created_at', r.created_at, 'customer_name', r.customer_name,
    'gown_slug', r.gown_slug, 'status', r.status, 'source', r.source,
    'commission_php', 200
  ) order by r.created_at), '[]'::jsonb)
  into rows
  from public.reservations r
  where r.status in ('confirmed','out','returned')
    and r.created_at >= v_start::timestamptz
    and r.created_at < v_end::timestamptz;
  return jsonb_build_object(
    'month', to_char(v_month, 'YYYY-MM'),
    'count', n,
    'per_php', 200,
    'total_php', n * 200,
    'rows', rows
  );
end $$;

create function public.admin_commission() returns jsonb
language sql stable set search_path = '' as $$ select private.admin_commission(null) $$;

create or replace function public.admin_commission(p_month text) returns jsonb
language sql stable set search_path = '' as $$ select private.admin_commission(p_month) $$;

revoke execute on function private.admin_commission(text) from public, anon, authenticated;
grant execute on function private.admin_commission(text) to authenticated;
revoke execute on function public.admin_commission() from public, anon, authenticated;
grant execute on function public.admin_commission() to authenticated;
revoke execute on function public.admin_commission(text) from public, anon, authenticated;
grant execute on function public.admin_commission(text) to authenticated;

-- Table grants for owner catalogue writes stay RPC-only (no direct insert/update/delete).
-- Owners already have select on gowns.
