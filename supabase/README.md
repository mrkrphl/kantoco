# CGR Rentals database (Supabase)

Project: `cgr-rentals` (free plan, ap-southeast-1). Migrations in `migrations/`
were applied in order with the Supabase MCP during round r8.1.

## Shape
- `public.gowns`, `public.gown_aliases`, `public.fitting_slots` (owner-editable,
  seeded 10:00 / 13:00 / 15:00 / 17:00), `public.owners` (email allowlist),
  `public.reservations`, `public.fittings`.
- Double-booking is impossible in the database itself:
  - `reservations_no_overlap`: btree_gist exclusion on gown + `[event, return]`
    for pending / confirmed / out bookings.
  - `fittings_one_per_slot`: unique (date, slot) unless cancelled.
- Past dates are rejected by trigger using Manila's date.
- Limits: stay of at most 30 days (return - event); booking at most 366 days
  ahead; 5 bookings per 10 minutes per IP and 60 per hour overall, per kind;
  hidden honeypot field `p_website`.

## Access
- RLS is on for every table. The public (anon) role has no table access at all.
- The site only calls these RPCs: `create_reservation`, `create_fitting`,
  `taken_days`, `taken_slots`, `fitting_times`, `booking_summary`
  (status and dates only, no name, contact or money).
- Signed-in owners (confirmed auth user whose email is in `owners`) can read
  bookings, change `status`, and add or edit fitting times.

## Owner setup (Mark, in the Supabase dashboard)
1. Authentication -> Users -> Add user -> Create new user:
   `kantoco.ph@gmail.com`, type your own password, tick "Auto Confirm User".
2. Authentication -> Sign In / Providers -> Email: turn off
   "Allow new users to sign up".

Never commit keys. The site uses only the publishable key, from env.
