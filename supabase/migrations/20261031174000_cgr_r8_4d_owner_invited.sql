-- CGR r8.4d: the admin list's status chip (spec r8.4b: Active / Invited /
-- Paused). "Invited" comes from Supabase Auth's own invited_at: an invite
-- went out and the person hasn't set a password yet. Nothing new is stored.
drop function public.admin_list_owners();
drop function private.admin_list_owners();

create function private.admin_list_owners()
returns table (email text, role text, status text, added_at timestamptz, paused_at timestamptz,
               has_login boolean, invited_at timestamptz, is_you boolean)
language plpgsql stable security definer set search_path = ''
as $$
declare v_me text := private.need_admin();
begin
  return query
    select o.email, o.role, o.status, o.added_at, o.paused_at,
           exists (select 1 from auth.users u where lower(u.email) = o.email and u.email_confirmed_at is not null),
           (select max(u.invited_at) from auth.users u where lower(u.email) = o.email),
           o.email = v_me
    from public.owners o
    order by (o.email = v_me) desc, o.added_at, o.email;
end $$;

create function public.admin_list_owners()
returns table (email text, role text, status text, added_at timestamptz, paused_at timestamptz,
               has_login boolean, invited_at timestamptz, is_you boolean)
language sql stable set search_path = ''
as $$ select * from private.admin_list_owners() $$;

revoke execute on function private.admin_list_owners(), public.admin_list_owners() from public, anon, authenticated;
grant execute on function private.admin_list_owners(), public.admin_list_owners() to authenticated;
