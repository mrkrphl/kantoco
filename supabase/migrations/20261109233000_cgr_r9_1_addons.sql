-- r9.1: accessory add-ons on reservations (owner-set prices only; blank stays blank).
alter table public.reservations
  add column if not exists addons jsonb not null default '[]'::jsonb
  check (jsonb_typeof(addons) = 'array');

-- Extend create_reservation with optional addons (validated against available accessories).
drop function if exists public.create_reservation(text, date, date, text, text, text, text);
drop function if exists public.create_reservation(text, date, date, text, text, text, text, text, text, text, text);
drop function if exists private.create_reservation(text, date, date, text, text, text, text, text, text, text, text);
create function private.create_reservation(
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
  -- Validate add-ons: only available accessories; store name + optional price from catalogue.
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

-- Public wrappers (keep 7-arg and 11-arg; add 12-arg with addons).
create function public.create_reservation(
  p_slug text, p_event date, p_return date, p_name text, p_contact text, p_notes text, p_website text
) returns jsonb language sql volatile set search_path = '' as $$
  select private.create_reservation(p_slug, p_event, p_return, p_name, p_contact, p_notes, p_website, 'direct', '', '', '', '[]'::jsonb)
$$;

create function public.create_reservation(
  p_slug text, p_event date, p_return date, p_name text, p_contact text, p_notes text, p_website text,
  p_source text, p_utm_source text, p_utm_medium text, p_utm_campaign text
) returns jsonb language sql volatile set search_path = '' as $$
  select private.create_reservation(p_slug, p_event, p_return, p_name, p_contact, p_notes, p_website, p_source, p_utm_source, p_utm_medium, p_utm_campaign, '[]'::jsonb)
$$;

drop function if exists public.create_reservation(text, date, date, text, text, text, text, text, text, text, text, jsonb);
create function public.create_reservation(
  p_slug text, p_event date, p_return date, p_name text, p_contact text, p_notes text, p_website text,
  p_source text, p_utm_source text, p_utm_medium text, p_utm_campaign text, p_addons jsonb
) returns jsonb language sql volatile set search_path = '' as $$
  select private.create_reservation(p_slug, p_event, p_return, p_name, p_contact, p_notes, p_website, p_source, p_utm_source, p_utm_medium, p_utm_campaign, p_addons)
$$;

revoke execute on function public.create_reservation(text,date,date,text,text,text,text) from public, anon, authenticated;
grant execute on function public.create_reservation(text,date,date,text,text,text,text) to anon, authenticated;
revoke execute on function public.create_reservation(text,date,date,text,text,text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.create_reservation(text,date,date,text,text,text,text,text,text,text,text) to anon, authenticated;
revoke execute on function public.create_reservation(text,date,date,text,text,text,text,text,text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.create_reservation(text,date,date,text,text,text,text,text,text,text,text,jsonb) to anon, authenticated;
