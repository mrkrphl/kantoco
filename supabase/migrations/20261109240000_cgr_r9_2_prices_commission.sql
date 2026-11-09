-- r9.2: blank unverified sample prices; allow null rate on reserve; commission = site reservations not cancelled.

-- 1) Blank every seed price (none verified word-for-word on CGR FB / public listings).
update public.gowns set price_per_day = null where true;

-- 2) Reservations may store a null rate when the gown has no public price.
alter table public.reservations alter column rate_php drop not null;
alter table public.reservations drop constraint if exists reservations_rate_php_check;
-- Keep positive when set.
do $$ begin
  alter table public.reservations add constraint reservations_rate_php_check
    check (rate_php is null or rate_php > 0);
exception when duplicate_object then null;
end $$;

-- total_php generated column: recreate so null rate → null total.
alter table public.reservations drop column if exists total_php;
alter table public.reservations
  add column total_php integer generated always as (
    case when rate_php is null then null
         else rate_php * (return_date - event_date + 1)
    end
  ) stored;

-- 3) create_reservation: available gown may have a blank price.
create or replace function private.create_reservation(
  p_slug text, p_event date, p_return date, p_name text, p_contact text, p_notes text, p_website text,
  p_source text default 'direct', p_utm_source text default '', p_utm_medium text default '', p_utm_campaign text default '',
  p_addons jsonb default '[]'::jsonb
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_slug text;
  v_rate integer;
  v_ref text;
  v_con text;
  v_source text := coalesce(nullif(btrim(p_source), ''), 'direct');
  v_addons jsonb := '[]'::jsonb;
  v_el jsonb;
  v_aslug text;
  v_aname text;
  v_aprice integer;
  v_ok boolean;
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
  select true, g.price_per_day into v_ok, v_rate
    from public.gowns g
   where g.slug = v_slug and g.status = 'available';
  if not coalesce(v_ok, false) then
    return jsonb_build_object('ok', false, 'error', 'unknown_gown');
  end if;
  if p_addons is not null and jsonb_typeof(p_addons) = 'array' then
    for v_el in select * from jsonb_array_elements(p_addons) loop
      v_aslug := lower(btrim(coalesce(v_el->>'slug', '')));
      select g.name, g.price_per_day into v_aname, v_aprice
        from public.gowns g
       where g.slug = v_aslug and g.status = 'available' and g.item_type = 'accessory';
      if v_aname is null then
        return jsonb_build_object('ok', false, 'error', 'bad_addon');
      end if;
      v_addons := v_addons || jsonb_build_array(jsonb_build_object(
        'slug', v_aslug,
        'name', v_aname,
        'price_per_day', v_aprice
      ));
    end loop;
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
         source, utm_source, utm_medium, utm_campaign, addons)
      values
        (v_ref, v_slug, p_event, p_return, v_rate, btrim(p_name), btrim(p_contact), coalesce(p_notes, ''),
         v_source, left(coalesce(p_utm_source,''),80), left(coalesce(p_utm_medium,''),80), left(coalesce(p_utm_campaign,''),120),
         v_addons);
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

-- 4) Commission: site-sourced reservations that are not cancelled (Manila month).
create or replace function private.admin_commission(p_month text default null) returns jsonb
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
    where r.status <> 'cancelled'
      and r.source in ('ad','facebook','messenger','qr','direct','other')
      and r.created_at >= v_start::timestamptz
      and r.created_at < v_end::timestamptz;
  select coalesce(jsonb_agg(jsonb_build_object(
    'ref', r.ref, 'created_at', r.created_at, 'customer_name', r.customer_name,
    'gown_slug', r.gown_slug, 'status', r.status, 'source', r.source,
    'commission_php', 200
  ) order by r.created_at), '[]'::jsonb)
  into rows
  from public.reservations r
  where r.status <> 'cancelled'
    and r.source in ('ad','facebook','messenger','qr','direct','other')
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
