-- r9.3: no cropped/cut-out accessory photos on the site.
-- Repo only has crops (ATTRIBUTION.md); uncropped FB sources were never
-- committed. Clear photos so rebuilds and the public/owner catalogue show
-- text rows. Red gown stays first in the public list.

update public.gowns
   set photos = '[]'::jsonb,
       updated_at = now()
 where slug in (
   'gold-crystal-tiaras',
   'ruby-pageant-crown',
   'rose-stone-tiara',
   'crown-display-set',
   'crystal-choker',
   'crystal-bracelet'
 );

-- Public catalogue: wine/red first, then by name (matches GOWNS order intent).
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
    ) order by case when g.slug = 'red-sequin-evening' then 0 else 1 end, g.name)
    from public.gowns g
    where g.status = 'available'
  ), '[]'::jsonb);
end $$;

create or replace function public.list_catalogue() returns jsonb
language sql stable set search_path = '' as $$ select private.list_catalogue() $$;

revoke execute on function private.list_catalogue(), public.list_catalogue() from public, anon, authenticated;
grant execute on function private.list_catalogue(), public.list_catalogue() to anon, authenticated;
