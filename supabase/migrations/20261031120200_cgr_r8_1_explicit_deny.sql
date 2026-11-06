-- CGR r8.1: make the deny-all tables explicit (advisor 0008). These rows are
-- only touched by the private SECURITY DEFINER functions; no API role reads them.
create policy no_api_access on public.gown_aliases for select to anon, authenticated using (false);
create policy no_api_access on private.refs for select to anon, authenticated using (false);
create policy no_api_access on private.rate_events for select to anon, authenticated using (false);
