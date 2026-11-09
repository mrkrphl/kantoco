## r9.4 (2026-11-10)

- Fitting times at 390: checkbox label no longer overlaps Save (plain.css stack).
- D3: Today still shows Came in for confirmed fittings (OwnerHome plan; verified in stills).
- Accessory uncropped FB originals: not on the box; no FB URLs in ATTRIBUTION — six accessories stay text-only pending Mark's files/URLs. Proof `proof-r9.4/`.

## r9.3 (2026-11-09)

- No cropped/cut-out photos on CGR: accessories lack uncropped sources in repo → text-only listings (GOWNS + DB photos cleared). Crowns home band type-only. Commission admin subcopy = one line. Proof `proof-r9.3/`. Red first in list_catalogue. Migration `20261109250000_cgr_r9_3_uncrop_accessories.sql`.

## Round 9.2: blank unverified prices, commission reconcile, confirmation copy

- Blanked every gown/accessory `price_per_day` (sample data only; not on CGR public listings). Seed + GOWNS updated so rebuilds stay blank. Accessories kept (CGR FB crops).
- Confirmation headline: "Reserve request sent."
- Commission RPC: site-sourced reservations that are not cancelled (Manila month); fittings never. Header counts all bookings; commission filters the same reservation rows. Test: `countSiteCommission`.
- Reserve accessories picker full width.
- Proof: `proof-r9.2/preview/`. SMTP OFF. No merge.

## Round 9.1: owner UX, add-ons, phone fix, stills

Paige QA via Chip on r9. Single commit (one push_files / one Vercel build) on `cursor/cgr-rentals-app`.

- Tab bar clearance on every owner screen (`--tab-h` + safe-area). `devIndicators: false`.
- Catalogue add form stacked at 390; slug auto-unique and hidden; Bucket line removed; Remove confirm; paused row keeps Edit / Make available / Remove on one row.
- #6 root cause: r9 stills harness hardcoded 2 items; DB + `list_catalogue` already had 16 available. Not a list pagination bug.
- Gown sticky "Pick your date" bar: extra padding / scroll-margin so month + weekday stay clear.
- Footer phones: dropped `0995 477 1665` (added in `af839a43`, claimed FB). Public Maps/aggregator listing has **0977 087 8589** and **0927 447 0021** only.
- Accessory add-on picker on gown detail + Reserve; saved with reservation (`addons` jsonb); owner booking card shows plain words; price only if owner-set.
- Shop-link: go-live URL swap note (preview QR fine for sample).
- Proof: `/workspace/cgr-rentals/proof-r9.1/preview/` (390 + 1366). Owner stills via local harness (no password). Cleaned to 0 reservations / 0 fittings / 0 auth / 0 storage objects; 16 gowns kept; owners = kantoco.ph@gmail.com admin only.
- Checks: tsc clean, eslint clean on touched files, `npm run test:cgr` 38/38. Free review appended in `docs/cgr-rentals/r9-review.md`.
- SMTP still OFF (allowlist kept). No merge. Protection / noindex unchanged.

## Round 9: owner catalogue, bookings polish, attribution

Head **`(pending push)`** (parent `da999a25`). One text push for the round (Hobby daily deploy limit). Preview: (pending).

- **Owner Catalogue:** add / edit / pause / remove. Types Gown, Filipiniana, Barong/Suit, Kids, Accessory. Fields: name, type, photos (phone upload → free `cgr-catalogue` Storage bucket, compressed client-side, shown with object-fit contain), colors, sizes, occasions, optional rental price (hidden on public when blank), notes, available/paused. Public Rail + gown pages read `list_catalogue` / `get_catalogue_item` (available only). RLS: owners/admins write; public reads available. Accessories remain catalogue items (add-on picker on Reserve is a follow-up).
- **Owner site:** search bookings by customer or phone; Call + Messenger/Text taps; one-tap New → Confirmed → Picked up → Returned (+ Cancel). Bottom tabs: Today, Bookings, Catalogue, Fitting times. Pending label is **New**.
- **Attribution:** source + UTM on each reservation (`ad` / `facebook` / `messenger` / `qr` / `direct` / `other`). Admin-only monthly commission count × ₱200 with CSV (`/owner/export?kind=commission`). Owners never see the line (RPC refuses).
- **Conversion:** gown detail “Free on your date” + “Reserve online, get first pick of fitting slots”; confirmation keeps a large selectable ref; `/demos/cgr-rentals/shop-link` QR generated in-browser (free `qrcode` package, no paid API).
- **Email:** new-booking mail allowlist designed (kantoco.ph@gmail.com + test alias only). **Stopped before SMTP** — no credentials configured, no mail sent.
- **Proof:** `proof-r9/preview/` (390 + 1366): catalogue list/add/edit, today, bookings (+ admin commission), public catalogue, gown detail, shop-link. Owner UI stills used a local harness (no password created). Counts: 0 reservations, 0 fittings, 16 catalogue gowns (seeded listings), owners = kantoco.ph@gmail.com only, 0 auth users, 0 storage objects.
- **Checks:** tsc clean, eslint clean on touched files, `npm run test:cgr` 37/37. Second-model review (local free): `docs/cgr-rentals/r9-review.md`.
- **Open / skipped:** Mark still sets Supabase Site URL + redirect for invites; SMTP for booking emails waits on Mark; accessories-as-Reserve-add-ons follow-up; no merge.


---

## Round 8.4: plain owner area, admin, invites

Commits `cd59dfc` → **`872157e`** (parent `c6ba972`), text-only, up to 4 files each. **No preview yet:** Vercel refused the build for `872157e` with "Deployment rate limited — retry in 24 hours" (status posted 08:38:52 PHT, 5 Nov; Hobby daily build limit). Nothing was upgraded. The r8.4 proof below comes from local `next build` and the dev server. The preview needs a fresh push or redeploy after the limit resets.

- **Plain owner area (r8.4b stamp):** system sans, one 640px column, scoped to `.cgr-plain` so the public pages don't change. `/owner` shows Today, Coming up (7 days) and This week. `/owner/bookings` lists all bookings with search (customer, gown or ref; each word matches the start of a word) and sort (Upcoming first, Newest, Oldest). `/owner/times` edits fitting times.
- **Roles (DB):** `owners` has `role` (admin/owner) and `status` (active/paused). The RPCs `owner_me`, `owner_dashboard`, `admin_*` return `cgr:` error codes. Fitting statuses gain `came_in` and `no_show`. Migrations r8_4, 4b, 4c and 4d are applied.
- **Admin:** "Invite an owner" (email, role, "They get an email with a link to set their own password. You never see or set it."), Invited/Active/Paused chips, Resend invite, Pause with Undo, Change role, and Remove (asks first; bookings stay). There is no add-without-invite path (D9).
- **Invites:** edge function `invite-owner` (verify_jwt). The caller must be an active admin, the target must be on the list without a login, and the redirect must be on a kantoco origin. The service-role key stays inside Supabase. Until the pitch is approved, only `kantoco.ph@gmail.com` and the `+cgr-invite-test` alias can be invited; any other address is refused before the list changes.
- **Set your password:** invite link → password (at least 8 characters, show/hide) → signed in. An expired or used link shows "This invite link has expired", "Ask the admin for a new invite.", and "Already set your password? Sign in".
- **Mark's account:** `kantoco.ph@gmail.com` is seeded as admin, active, with **no auth user**. The first invite creates the account, and `owner_me` links the row by email on first sign-in. The real invite is **not sent yet** (waiting on QA).
- **Bootstrap (decided, not executed):** Mark sends the first invite from Supabase Dashboard → Authentication → Users → Invite user, after pointing the Site URL / Redirect URLs at `/demos/cgr-rentals/owner/set-password`. There is no unauthenticated code path, and no test admin is left behind.
- **Proof:** `proof-r8/r8.4/r84b/` has owner rows and empty states, bookings search, no-results and sort, the admin list, invite form, refused and sent states, set-password expired (390 + 1366), and `invite-delivered.png` (a real Supabase invite delivered to the test alias at 08:36 PHT on 5 Nov; link and token removed). Also `seed-admin.sql`, `role-check.json`, `counts.json` and `bootstrap.md`.
- **Checks:** tsc clean, 30/30 unit tests, next build OK. Lint: only the existing `alonday-images.ts` prefer-const error remains.
- **Cleanup:** before: 3 reservations, 2 fittings, 4 owners, 3 auth users. After: 0 reservations, 0 fittings, owners = `kantoco.ph@gmail.com` only (admin, active, no auth user), 0 auth users, sessions and identities.

**Defaults (Mark to confirm):**
- **D3 — DEFAULT:** a Pending fitting on the day shows Confirm; a Confirmed fitting shows Came in.
- **D4 — DEFAULT:** Came in and No-show are statuses, not a checkbox.
- **D7 — DEFAULT:** returns due today show in Today with a Returned action.
- **D8 — DEFAULT:** only admins can invite; owners never see the Admin tab or Invite, and `/admin` shows not-admin.
- Also DEFAULT: the 8-character password minimum (DEFAULT; enforced in the app, while the Supabase auth setting is Mark's to change).

**Open:** Mark sets the Site URL and redirect, plus the optional 8-character minimum, in the Supabase dashboard; then sends the first invite after QA. Supabase's built-in mail sender is rate-limited (fine for a few invites; custom SMTP later).

## Round 8.3: owner sign-in

Commits `1816977` → **`c6ba972`** (parent `d56890e`), text-only, up to 4 files each. Preview `dpl_Cntpa2crSyaU4JzNyC7xB4qsEZd6`, READY 2026-10-31 12:50:12 PHT. It is behind protection; append `?_vercel_share=…` to the URL.

- **Sign-in:** `/owner` has email + password sign-in using `@supabase/ssr` cookies. `src/proxy.ts` refreshes the session on `/owner` only. The server checks the user and the `owners` list (via RLS) before any booking is rendered. There is no sign-up screen.
- **Who sees what:**
  - Signed out: "Sign in to see bookings."
  - Signed in but not an owner: "This account isn't an owner."
  - In neither case is booking data sent, and `/owner/export` returns 403.
  - Pages are `no-store` and noindex.
- **Owners can:**
  - change a booking's status (saved in the database, with a live status note for screen readers)
  - edit, add, show or hide fitting times (the public fitting step updates)
  - download a CSV (formula-safe, with a BOM for Excel)
  - sign out
- **₱200 line:** owner-only; it counts confirmed, out and returned reservations, and fittings never count.
- **Fallback:** without the two env vars, `/owner` keeps the on-device view.
- **Reserve, not hold:** the paused screen now says "message the shop to reserve your date". A gown photo alt no longer says "holding". The scan of 22 rendered page states (normal and paused, 390 and 1366) and all 13 database error messages finds 0 hold words. Internal code names (`holdsGown`, `holds()`, `.cgr-hold*`, comments) are kept and listed in `hold-scan.json`.
- **Proof** (`proof-r8/r8.3/`, local and preview):
  - One throwaway test owner (example.invalid) was created by SQL with no service-role key. It was deleted afterwards along with its test rows.
  - Signed-out, not-owner and signed-in stills at 390 and 1366.
  - A status change confirmed by SQL.
  - A fitting-time edit seen in the public step.
  - The CSV with test rows only.
- **Checks:** CLS 0, 0 AA contrast fails, no tap under 44px (the fitting-time toggle is now a 44px chip). On the deployed chunks: the publishable key only, no secrets.
- **Still open for Mark:**
  - In Supabase → Authentication → Users, create `kantoco.ph@gmail.com` with your own password and tick Auto Confirm. It is already on the owners list.
  - Turn off "Allow new users to sign up".
  - Then sign in at `/demos/cgr-rentals/owner`.

## Round 8.2: bookings go to the database

Commits `3defecc` → **`d56890e`** (parent `e8cea80`), text-only, 4 files each. Preview `dpl_B2EqoUUcMuALNcGegxNVNZiNGsfe`, READY 2026-10-31 12:25:16 PHT. It is behind protection; append `?_vercel_share=…` to the URL.

- **Database path:** with both `NEXT_PUBLIC_SUPABASE_*` vars set (Vercel Preview, this branch), reserve, fitting, the gown calendar and the confirmation lookup call the 6 RPCs from the browser with the publishable key. If either var is missing, bookings stay in the browser exactly as before.
- **Old codes still open:** a code saved on the device opens first, with no request. Other codes are looked up with `booking_summary`, which returns no name or contact.
- **Friendly errors:** taken, past date, missing details, too far ahead, before the event, and too many tries ("please wait a few minutes"). If the database is paused or unreachable, a calm "Booking is resting for a moment." screen offers Try again and Message the shop.
- **Limits on screen:** stays of up to 30 days, up to a year ahead (17/17 tests). Same honeypot and length caps as the database.
- **Live proof on the preview** (`proof-r8/r8.2/preview/`):
  - One reservation (CGR-VLV5) and one linked fitting (CGR-DR7X) made through the UI. Both rows were confirmed with SQL, then deleted.
  - Fresh-context lookups at 390 show the reservation and the fitting.
  - A second browser context got "Sorry, this gown is taken that day." and wrote no row.
  - The fitting slot shows "Taken"; the gown calendar shows "reserved".
- **Live bundle check (key never printed):** 2 of 14 deployed chunks contain the project host and this project's exact publishable key (compared from a file by count). 0 contain a secret or service-role key. All runtime RPC calls went to the project host.
- **Fallback proof** (`proof-r8/r8.2/fallback/`): a build without the env saves on the device with 0 database requests. That on-device code then opens on the database build with 0 RPC calls.
- **Checks:** CLS 0 on every database and fallback page at 390 and 1366 (confirmation loading now keeps the final layout), 0 AA contrast fails, no tap under 44px, noindex.
- **Clean-up:** all r8.2 test rows deleted (tables back to 0). `.env.local` deleted.
- **Still open for Mark:** turn off "Allow new users to sign up" in Supabase Auth.
- **Next:** r8.3, owner sign-in, status updates, fitting-time editor and CSV export (not started).

## Round 8.1: bookings database (Supabase)

- **Database:** new free Supabase project `cgr-rentals` (ap-southeast-1, $0 confirmed before creating). Approved by Mark on 31 Oct, 11:48 AM PHT.
- **Pushed:** `supabase/migrations/` (schema, seed, explicit deny policies, past-date trigger fix, all applied as-is), `supabase/README.md`, and env var names in `.env.example`. No app code changed yet. The site still saves bookings in the browser until the env vars are set and r8.2 lands.
- **Guarantees in the database:**
  - A gown can't be double-booked for overlapping dates (exclusion constraint).
  - A fitting slot can't be double-booked (unique date + slot).
  - Past dates (Manila time) are refused.
  - A hidden spam field and a rate limit are in place: 5 per 10 min per IP, 60 per hour overall.
  - Stays are capped at 30 days, and bookings at 366 days ahead.
- **Access:**
  - RLS is on for every table, and the public has no table access.
  - The site uses 6 RPCs only. The confirmation lookup returns status and dates, with no name, contact or money.
  - Only a confirmed owner on the allowlist can read bookings, change status, or edit fitting times.
- **Proof:** see `proof-r8/r8.1/`:
  - Racing 2 and 5 bookings for the same gown and dates gives 1 winner, and the same for one fitting slot.
  - All public reads and writes are denied.
  - A signed-in non-owner sees nothing.
  - The security advisor is clean.
- **Owner steps for Mark (dashboard):**
  1. Add user kantoco.ph@gmail.com with your own password and Auto Confirm.
  2. Turn off "Allow new users to sign up". It is still on.
- **Env (names only):** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. They go in Vercel kantoco → Preview, branch `cursor/cgr-rentals-app`.
- **Next:**
  - r8.2: bookings go to the database, with the on-device fallback kept.
  - r8.3: owner sign-in, status updates, fitting-time editor, CSV export.

## Round 8.0 (final copy, scroll motion)

Commits `6e7b2c8` → `77f27c4` → `86bc734` → **`3f6dfab`** (parent `fca78d1`), text-only, ≤4 files each. Deployment `dpl_6yFE14NfsMPbUDkKjnaEk3WoNb5m`, READY 2026-10-31 10:58:00 PHT (UTC+8).

- **The SAMPLE | NOT LIVE bar is off.** Mark (31 Oct, 10:14 AM PHT): "i think lets stop saying this is a sample and go for final. but still want to add creativity. refer to sent videoos and see how dynamic and explosive the landing pages are but still does not overwhelm the user".
- **Motion:** one entrance per screen, transform and opacity only, scrubbed ScrollTrigger beats (`HomeMotion.tsx`). Reduced motion shows the finished state with a 200ms opacity fade.
  - The hero text shows at once. Mavy enters only on scroll, from the side, spinning to the middle as on r7.6.1, with no walk-in on load.
  - The seq-2d / video-gl / poster chain is kept, and the word loop ends on "for any event".
- **Copy:** no sample, example or demo wording, no prices, no hours, no invented sizes ("Ask the shop for your size"), and no KantoCo credit.
  - The fitting step reads "Choose a *time.*" with 4 unlabelled times. Names come from the picked gown.
  - The ₱200 commission shows only in the owner view. The customer total (rate × days) stays internal.
- **Data:** taken days and fitting slots come only from records (no seeded dates). Bookings stay in localStorage, and the database is on hold.
- **Checks:** CLS 0 (home scroll and every flow page, 390 and 1366, motion and reduced), no horizontal overflow, 0 AA contrast failures, no tap under 44px, and noindex on every page. Old CGR ref codes still open.
- **Departures:** no load walk-in (B1); the owner commission shows the total, not "this month"; no seeded taken dates; the owner link is removed from public nav.
- **Before public:** the bookings reach no one yet (no database), and the slot times need the shop's confirmation.

## Round 7.11.1 (Suits section: type only)

- The two cropped barong photos (`cgr-barong-black-embroidery`, `cgr-barong-woven`) are no longer referenced anywhere in `src` (Suits spread, `SHOP_PHOTOS`, the old Rack). The binaries stay in the repo, untouched; the uncropped barong photo is on hold.
- Suits (04) is now type only on ivory: a wine "Suits & barong" between two wine hairlines, one line, and the "Visit the shop" button (44px, to #visit). No image, no motion.
- Checks: CLS 0 at 390 and 1366 (motion and reduced), no barong image requested on the landing page, no broken images, AA contrast in the section. Text-only commit, no new binaries.

## Round 7.11 (declutter, Reserve flow, fitting flow, records, category pages)

Commits `aac01e3` → `c01ef5c` → `52b2605` → `ed4a939` → `a061101` → **`02fa443`** (parent `28c9787`), text-only, ≤4 files each. The intermediate builds for 2/6 and 3/6 did not finish (one canceled, one ERROR mid-batch); the final head is the one that counts. Deployment `dpl_E4xaxxv8vca7Lh7Cmjz3pGfUUu4v`, READY 2026-10-31 02:33:27 PHT (UTC+8).

### What changed
- **Home:** thin nav (Gowns · Accessories · Visit · Reserve your gown). Each section has one focal photo, one line and one action. Red **"01 Evening"** comes first, then 02 Bridal, 03 Filipiniana, Crowns (accessories), Suits, the rail, one review at a time, and Visit. Photos use `object-fit: contain` (no CSS crop). The footer name fits at 390 (x 20.7–369.3 of 390) and at 1366.
- **Reserve flow, Date → Details → Done:** a calendar with taken days marked, plus visible error text for each state: **taken** (any booked day in the range), **past** (before Manila's today) and **missing** (no or backwards dates). Details fields show example values as placeholders only; nothing is prefilled. Done shows a `CGR-XXXX` ref and writes a booking record. The word is "Reserve" everywhere; no "Hold".
- **Fitting flow, Day → Time → Done:** linked from the confirmation ("Book your fitting") and from every gown page. It covers **before-event** (the fitting must be from today up to the day before the event) and **slot taken** (re-checked on submit, so a slot taken in another tab shows an alert). Slots are a `role=radiogroup` of `role=radio` with roving tabindex; the arrow keys skip taken slots. Labelled "Example times".
- **Records** (`/owner`): reservations and fittings, soonest first, with All / Reservations / Fittings filters and a status select. Both flows write here. The ₱200 per confirmed/out/returned reservation shows only here; fittings never count.
- **Category pages (default #4, changed by steering):** each one is a normal reservable page on the gown template, with the Reserve flow and the fitting link and no "Ask about…":
  - Bridal → `/gown/ivory-ball-gown`
  - Filipiniana → `/gown/black-gold-filipiniana`
  - Accessories → `/gown/gold-crystal-tiaras` (home: "Reserve a tiara")
  - **Barong: left out.** The only barong photos on #33 (`cgr-barong-black-embroidery`, `cgr-barong-woven`) are top-trimmed crops (SOURCES.md: cut at y 450 / 560 to remove the mannequin face and salakot), so they are not uncropped photos. The Suits section stays on the home page with "Visit the shop" (to #visit), and there is no `/gown/barong` (404).

### Defaults and how to flip each one
All of these are in `src/lib/cgr-rentals.ts`.
| Default | As built | Flip |
|---|---|---|
| Records page | Unlisted: not in the top nav or the sitemap, reached by the "Owner view" link in the footer fine print (per the stamp) and the mobile menu. noindex/nofollow, no passcode | `CGR_FLAGS.recordsPasscode = "1234"` asks for a code first (client-side sample gate, not security). The path is `CGR_FLAGS.recordsPath`. |
| Fitting code | Optional | `CGR_FLAGS.fittingCodeRequired = true` |
| Fitting slots | Example data (10:00, 1:00, 3:00, 5:00; Saturday 1 PM taken) | Edit `FITTING_SLOTS.times` / `exampleTaken`, then set `FITTING_SLOTS.exampleData = false` and `CGR_FLAGS.slotsAreExample = false` to drop the "Example times" label |
| Category pages | Bridal, Filipiniana and Accessories are reservable gown pages; no Barong page (photo rule) | Home links are in `Spreads.tsx` (`first("…")` slugs). Add a Barong gown entry to `GOWNS` once an uncropped barong photo exists |
| Rate in hero | Out | `CGR_FLAGS.heroShowsRate = true` |
| Reviews | One at a time (verbatim, from `testimonials.ts`) | `CGR_FLAGS.reviewsOneAtATime = false` |
| Occasion | An optional note | `CGR_FLAGS.occasionField = true` adds its own optional field |

### Deviations from the Design stamp
- Calendar days and filter chips are **44px** (the spec says 38px) to meet the 44px tap rule.
- The Hillary review shows first. The records page shows **total** commission rather than "this month", with no invented sample rows.
- Bridal uses the ivory ball gown photo, because ivory-veil is a crop.
- The Barong page is left out, as above, and its home button reads "Visit the shop".
- The hero poster sits on a dark mat. Flow and records pages get a min-height so the footer doesn't jump (CLS 0).

### Checks
- tsc is clean. test:cgr passes 15/15; the new tests cover past, taken, before-event, Manila's today, rate × days, slot taken and records order. eslint has 0 errors.
- **Live (warm run, 72 page-checks at 390 and 1366, reduced motion):** CLS 0 on every page. No broken images, no red-02..05, no "hold" and no "Ask about". The sample bar and noindex are present, photos use `contain`, there is no horizontal overflow and nothing in main is under 44px.
- **Cold first run:** landing at 1366 measured 0.033 once, on the first cold load. Two load probes, two scroll probes and the full warm re-run all measured 0.
- **Flows (both widths):** section order is 01 Evening first. The footer name isn't clipped. One review is shown at a time. Details are not prefilled. Reserve gives a ref and a record. 4 radios; ArrowRight skips the taken 1 PM. A slot taken in another tab shows an alert on submit. Records list both the reservation and the fitting.
- **Hero (live):** seq-2d at 1366, video-gl at 390, reduced-seq and reduced-gl. CLS 0. The word loop pauses offscreen and runs again back at the top. With `?cgrdebug=1`, 1366 shows 0.0026, which comes from the debug overlay itself (as in r7.10).

### Unchanged
Mavy's scroll spin (seq-2d, video-gl, video-2d, poster) and `?cgrdebug=1`; the CSS "for your …" loop (pauses offscreen); ivory/wine and the slow motion; customer total = rate × days; old `CGR-` refs, old bookings and slug redirects; the SAMPLE | NOT LIVE bar; noindex. Proof is in `proof-r7/r7.11/` (stills only).

## Round 7.10 (hero word loop under "Gowns" and the gown thumb/calendar overlap fix)

Commit `28c9787` (parent `61b65e4`) · deployment `dpl_BVqqDDdPy4tYaFzCMhVGnRyJG6zV`, READY 2026-10-30 23:57:26 PHT (UTC+8).

### Hero line: "for your …"
- The line under **Gowns** now loops through **debut → wedding → birthday → party → any event**, then starts over. Each word holds for about 2.2s with a slow cross-fade and a small rise (0.16em). It uses the same ivory script.
- "for" never moves. "your" fades out only for the last step, so it reads **"for any event"** rather than "for your any event". That also matches the reduced-motion still.
- **The loop is pure CSS:** every word sits in the same cell of a one-row inline-grid, so the box is always as wide as the longest word. No JS measuring, no timers, nothing in the scroll/rAF path. The old GSAP rotator, which used to stop when you scrolled, is gone.
- **Pausing:** one IntersectionObserver plus `visibilitychange` sets `data-run` to off or on, which pauses `animation-play-state` when the hero is offscreen or the tab is hidden. Verified: off when offscreen, on again back at the top.
- **Reduced motion:** a static "for any event" with no animation.
- **A11y:** the visual words are `aria-hidden`. There is one sr-only label ("Gowns for your debut, wedding, birthday, party or any event.") and zero `aria-live`.
- **Measured live (70 samples per width):**
  - 1366: loop width 196.06px and line width 247.47px, constant; line x 1046.53 constant.
  - 390: 141.78px and 178.95px, constant.
  - All 5 words were seen at both widths, and the words kept cycling mid-scroll.
  - Reduced motion gives the same widths.
- **Hero render paths unchanged:** seq-2d at 1366, video-gl at 390, reduced-seq and reduced-gl.
- **Hero CLS 0** at 1366 and 390, with and without reduced motion. With `?cgrdebug=1` the only shifts come from the `.cgr-debug` overlay itself, not the page.

### Gown pages: thumb collage over the calendar
- **Root cause:** `.cgr-dt-thumbs` was placed from the viewport's left (`left: 44.4vw`, about 321px wide with rotation). The calendar lives in the info column, which is anchored to the right (`100% − gut − min(480px, 38vw)`). Below about 1500px wide, the collage's right edge ran into the info column. On teal at 1366 the collage spanned x 598–919 while the calendar spanned x 814–1294, covering days 1, 2, 8, 9, 15, 16, 22 and 29.
- **Fix:** anchor the collage to the info column instead: `right: calc(var(--gut) + var(--info-w) + 36px)`, keeping the same top. Mobile (≤899px) resets it with `right: auto`.
- **Bounding-box test:** thumbs vs the calendar and info column on all 14 `/gown/*` pages at 1366, 1280, 1440 and 390 (56 page-views).
  - **Before (61b65e4):** 14 overlaps. teal, powder-blue, gold-crystal-tiaras, ruby-pageant-crown, rose-stone-tiara and crown-display-set overlapped at both 1366 and 1280; teal and crown-display-set also overlapped at 1440.
  - **After (28c9787, live):** 0 overlaps. Teal at 1366 now spans x 459–781 against the calendar at 814.
  - CLS is 0 on every gown page, and there is no horizontal overflow.

### Unchanged
Customer total = rate × days, the ₱200 only in OwnerView, CGR codes, redirects, hero paths, `?cgrdebug=1`, the SAMPLE | NOT LIVE bar, and noindex/nofollow (header and meta). tsc is clean and test:cgr passes 6/6. Proof is in `proof-r7/r7.10/` (stills only).

## Round 7.9.1 (red-02..05 pulled pending an age check)

Chip judged that the wearer in FB photos red-02..05 could be a teen; the rule is no children, so they are pulled pending an age check.

- **Removed listing:** `maroon-puff-sleeve-gown` ("Maroon puff sleeve gown"). Its only photos were red-02..05. Its old slug `red-lace-corset` is gone from the aliases too.
- **Redirects:** `/gown/` and `/reserve/` for both slugs return 307 to `/demos/cgr-rentals#gowns` (`RETIRED_SLUGS`). With reduced motion the intro is now static from first paint, so the redirect lands on the rack with CLS 0 (it was 0.58 at 1366).
- **Old bookings:** a booking saved under the pulled gown still opens on confirmation. It shows the reference code, no image and no rate, plus "This gown is no longer listed…". The note also shows on phones.
- **red-01** (`red-sequin-evening`) is still first. The site now has 8 dresses and 6 accessories.
- **Apple Dev folder:** rebuilt with 11 WebPs (1,284,808 B). The 15-file set is kept in `apple-dev-r7.9.old/`. The red-02..05 sources are untouched, so they can come back if the shop confirms she is an adult.
- **Commits:** `d18cd5f` (READY 23:15:05 PHT), `ea64fd2` (READY 23:15:30 PHT), `303ae08` (READY 23:20:59 PHT).
- **Checks:** tsc OK, test:cgr 6/6, catalogue CLS 0 at 1366 and 390.

## Round 7.9 (whole FB photos site-wide, no crops; Paige's hero fixes; reserve CLS)

Head `fc8b5fe` (5 batches: `3ab659c`, `76ac0c8`, `cc4907a`, `a1a47fb`, `fc8b5fe`). Batches 1–4 are READY; batch 4 (`dpl_ED1nGM1eJsBxdjmY5bibedoSDCzM`) READY 2026-10-30 22:55:41 PHT. Batch 5 deployment `dpl_BTcrrFTuaxBvbWVsVCDnT6ufR3vS`: READY 2026-10-30 23:05:20 PHT. Live reserve CLS rechecked after batch 5: 0 at 390 and 1366, with and without `?date=`. Mark approved, on 30 Oct 2026 at 10:22 PM PHT, the use of CGR's own FB photos for #33 only, faces included ("use their photos even with customers' faces"). No children. The PR stays a draft and noindex.

- **No crops anywhere:** every gown image on the site (hero cards, catalogue/rack, every `/gown/*` page and gallery, lookbook, cover-flow, reserve ticket, confirmation) is a whole FB photo shown with `object-fit: contain` at the photo's own aspect ratio. There are no detail zooms, AI fill, logos or watermarks. Red leads (`red-sequin-evening` uses red-01, whole, at its native 640×1426 and not upscaled).
- **Retired:** `gown-red-full/-bodice/-skirt/-detail` and `gown-blue-1..3`. A grep of `src/` finds 0 references to them and no crop fallback. The files are still in the repo, unused; Apple Dev's README has an optional `git rm` step.
- **Gowns removed:** none in r7.9 (maroon-puff-sleeve-gown was later pulled in r7.9.1, above). Each of the 9 dress listings had a real photo, and the 6 accessories are unchanged. Listings were renamed to match the gown actually in the photo. The old slugs redirect on `/gown/*` and `/reserve/*`, and saved bookings resolve:
  - red-sequin-column → navy-gold-sequin-gown
  - blue-ball-gown → royal-blue-mermaid-gown
  - blue-ruffle-debut → powder-blue-tulle-gown
  - blue-sash-cotillion → periwinkle-cape-gown
- **Photo source map (FB fbid):**

| File | Listing | FB fbid | Trim | px | Bytes |
|---|---|---|---|---|---|
| cgr-gown-wine-sequin-01 | red-sequin-evening | 808052111871624 | none | 640×1426 | 111,418 |
| cgr-gown-violet-gold-01 | violet-gold-beaded-gown | 808051041871731 | none | 737×1200 | 117,682 |
| cgr-gown-royal-blue-01 | royal-blue-mermaid-gown | 808052148538287 | none | 675×900 | 119,692 |
| cgr-gown-powder-blue-01 | powder-blue-tulle-gown | 808051898538312 | none | 761×1200 | 116,148 |
| cgr-gown-powder-blue-02 | powder-blue-tulle-gown | 808051928538309 | none | 963×1200 | 117,050 |
| cgr-gown-periwinkle-cape-01 | periwinkle-cape-gown | 808051565205012 | none | 807×1100 | 119,574 |
| cgr-gown-lilac-tulle-01 | lilac-floral-tulle-gown | 808051311871704 | none | 645×1100 | 119,240 |
| cgr-gown-navy-gold-01 | navy-gold-sequin-gown | 808051221871713 | none | 864×1200 | 117,010 |
| cgr-gown-teal-puff-01 | teal-puff-sleeve-gown | 808060308537471 | none | 1200×800 | 116,564 |
| cgr-gown-teal-puff-02 | teal-puff-sleeve-gown | 808060345204134 | none | 1200×800 | 110,912 |
| cgr-gown-teal-puff-03 | teal-puff-sleeve-gown | 808052398538262 | none | 750×1000 | 119,518 |

  red-02..05 (fbids 808076731869162, 808076788535823, 808076855202483, 808076911869144, the maroon-puff-01..04 files) are **pulled pending an age check** (r7.9.1). All remaining files are WebP, 120 KB or less each: 11 files, 1,284,808 B in total. The full table is in `public/demos/cgr-rentals/photos/SOURCES.md`.
- **Binaries pending:** the 11 WebPs (15 before r7.9.1) are pushed by Apple Dev from `apple-dev-r7.9/` (SHA256SUMS included). Until they land, gown images show an empty backdrop: a missing image is hidden via `data-missing`, and no old crop is ever shown.
- **Hero (Paige's QA):** the cape's hard right edge gets an eased ~40 px soft falloff on every path (seq-2d, video-gl, video-2d, poster). At 0% nothing is visible: she stays at opacity 0 until she enters. The r7.8 spin is otherwise unchanged. Trade-off: the feather also softens the landed right hand and cape tip slightly.
- **Reserve CLS:**
  - The "Checking…" status no longer pushes "Change" (a grid column at ≥720 px; on phones, its own line plus a two-line min-height).
  - Ticket values that only exist after hydration (pickup, return, total, mini line) stay unpainted (`visibility: hidden`) until then.
  - CLS is 0 at 1366 and 390, with and without `?date=`, including with JS delayed 1.5 s.
- **Checks:**
  - tsc is clean. eslint has 0 errors (4 old warnings). test:cgr passes 6/6.
  - Customer total = rate × days. The ₱200 appears only in OwnerView. CGR codes are unchanged.
  - Reduced motion is static. Taps are 44 px.
- **Proof:** `proof-r7/r7.9/` holds rack, lookbook, cover-flow, every `/gown/*` page, catalogue, reserve and confirmation at 1366 and 390, the red before/after, hero 0/50/100 before/after, and a cape-edge zoom. `live/` was captured via `?_vercel_share=…`.

## Round 7.8 (360 spin hero, Change pre-fill, spacing snap)

**Binaries live:** Apple Dev commit `46d4525` (clip plus 30 seq frames, SHA256 31/31 match). Deployment `dpl_AjbR5wPgyM1nnw5V1DABrw1SMbSf`, READY 22:26 PHT. Desktop 1366 draws seq-2d with 30/30 frames, and phone 390 runs video-gl with alpha. Proof is in `proof-r7/r7.8/live-bin/`.

Head `53e2221` (3 batches: `a5fbc47`, `26a3a37`, `53e2221`). All three previews are READY. Head deployment `dpl_HK2CaNRxBL5Jh1e8vtEucaKR4ZNw`, READY 2026-10-30 22:18:42 PHT. Mark approved the 360 spin as repo media for #33 on 30 Oct, 9:58 PM PHT. The PR stays a draft and noindex.

- **Hero:** the new 360 spin replaces the old side-spin in the scroll intro.
  - She walks in from the side, does the full spin and lands mid-screen. She is smaller than before, with no close crop. `mavy-poster.jpg` is unchanged.
  - New clip: `mavy-walk-spin360-alpha.mp4`, 540×1920 stacked black-key alpha, 7.29 s, 1,848,531 bytes. It serves iOS and desktop video-gl.
  - Desktop seq-2d: 30 WebP frames `seq/walk-spin-00..29.webp`, 540×960 with alpha, 994,976 bytes in total. They supersede seq-final's 36 frames, and the manifest count is now 30 (landed on 29).
- **Fallback:** the binaries are pushed from Mark's Mac.
  - Until they land, a 404 on the seq moves to the clip path, and a 404 on the new clip moves to `mavy-side-spin-alpha.mp4` with its old timings. `?cgrdebug=1` shows `clip 1`.
  - Verified live with no errors: desktop shows `video-2d | clip 1` and phone shows `video-gl | clip 1`.
  - Locally with the binaries: desktop runs `seq-2d` with 30/30 frames loaded, and phone runs `video-gl | clip 0`.
- **Known in the clip:**
  - A soft face shift at about 5.25–5.75 s (source 2.25–2.75 s). It is small at display size.
  - The hands are soft.
  - A 0.25 s dissolve ghost at the walk-in to spin join (about 3.1–3.3 s).
  - The cape's right edge fades softly where it leaves the source frame.
- **Change:** both "Change" links on reserve go to `/gown/<slug>?date=<pickup>#dates`. The gown page validates `?date=` (YYYY-MM-DD) and opens the calendar on that date, already picked. Verified local and live at 1366 and 390. The gown route is now rendered on demand because it reads searchParams.
- **Spacing:** 49 literal margin, padding and gap values in the hero intro, cover-flow and racks now use the nearest `--s-1..--s-10` token (ties round down). This is spacing only. The condensed nav, nav tone, confirmation crop and phone arrow hint are unchanged. Live computed spacing matches local.
- **Checks:**
  - CLS is 0 at 1366 and 390. The only shift seen is the `?cgrdebug=1` overlay itself.
  - Reduced motion is static: desktop shows the landed frame 29, and phone shows the landed clip frame.
  - tsc and eslint have 0 errors. test:cgr passes 6/6.
  - Customer total = rate × days. The ₱200 appears only in OwnerView.

## Round 7.7 (UI/UX: reviews carousel, three-step reserve, spacing scale, hero manifest)

Head `9884178` (4 batches: `60f2b5d`, `b442c81`, `f72f263`, `9884178`). Deployment `dpl_BrNp7GDKrpTma4ckv4vGU9qC4fyU`, READY 2026-10-30 19:41:17 PHT. Batch 1 (`60f2b5d`) failed its own preview build because Confirmation still imported a Steps export until batch 2. Batches 2 to 4 are READY.

- **Reviews:** an editorial carousel of the 8 Google reviews, word for word (DOM exact match 8/8, local and live). Desktop shows 3 spreads with the next one peeking; phone shows 8 slides. Prev/next buttons (44px), ← → keys, ARIA carousel and slide roles, and a polite live counter. Off-screen slides are inert. Nothing auto-advances, and it is static under reduced motion. The Google Maps link is kept. The source type gains an optional `"Facebook comment"` variant, which is unused. The 3 fonts are preloaded via next/font, and CLS is 0.
- **Reserve:** steps 01/02/03 with a progress line, one question per step (`?step=`, and the back button works). Step 01 shows the dates from the gown page with a Change link back to it. The ticket carries the real gown name. The confirmation shows the CGR code large, then next steps i–iii, and says nothing is confirmed or sent. On phones the summary is a slim sticky bar. The logic is unchanged: total = rate × days, the ₱200 commission appears only in OwnerView, and the CGR code still works. `npm run test:cgr` passes 6 node:test tests for the money and date logic.
- **Spacing:** one scale (s-1..s-10) plus section roles from tokens-delta. The SAMPLE bar is in flow and sticky, with the nav stuck directly below it. Anchors use scroll-margin = bar + nav (about 24px clear at 1366 and 390). "From our clients" is now an italic sentence-case kicker.
- **Hero:** `heroSeq.manifest.ts` holds the count, pattern, landed index and size, and defaults to `seq/mavy-00..35.webp` at 540×960 with landed 14. The seq-2d path, the fallbacks, the 1 s watchdog and `?cgrdebug=1` are unchanged. The frames are not in the repo yet, so live desktop falls back to video-2d (`failed seq:404:14`). Locally, with the frames served, seq-2d runs at 1366×768 and 1280×720, DPR 1.25, GPU off, on both 4px and 100px wheel steps, and the footer is reached.
- **Proof:** screenshots and the keyboard pass are kept outside the repo.

Draft. No merge.

## Round 7.6.5

Desktop hero on a frame sequence, plus copy polish. Commit `77411a6` (head). Preview `dpl_9A5LBnafqYRPYPpz1Ei5iKxpNAAz` (READY 19:14:37 PHT, Oct 30). Branch preview `?_vercel_share=…`.

**Desktop hero: sequence first.** Our emulation passed but Mark's laptop didn't, so desktop (hover + fine pointer) now uses a 36-frame colour WebP sequence on a 2D canvas by default; no video decode or seek is involved.
- The landed frame (14) loads first, then the rest four at a time. The nearest loaded frame is drawn. Progress comes from `scrollY` against the section's own box every rAF.
- The landed frame missing (404) or not arriving in 5 s hands over to the existing clip chain (video-2d / video-gl, then the poster).
- Phones keep the stacked-alpha clip (Mark confirmed iPhone works; 36 decoded frames are about 75 MB of bitmaps on iOS). A 1 s watchdog after the first wheel, scroll, touch or key input switches to the sequence if the page moved but no clip frame was drawn.
- `?cgrseq=1` forces the sequence, `?cgrseq=0` the clip.
- **Frames are not in this commit.** Until Apple Dev pushes `public/demos/cgr-rentals/seq/mavy-00.webp` … `mavy-35.webp` (36 files, 1,268,158 B), the live preview takes the clip path after one 404.

**Scroll audit.** No Lenis or other smooth-scroll library; no `normalizeScroll`, ScrollSmoother, pins or `anticipatePin`; no wheel `preventDefault` outside the cover-flow rail (horizontal or shift wheel only). `globals.css` sets `html { scroll-behavior: smooth }`, which this page now turns off with `html:has(.cgr) { scroll-behavior: auto }`. Native scroll only.

**Debug overlay.** `?cgrdebug=1` shows a large multi-line readout: path, scrollY, progress, frame or video time, wheel count / deltaY / deltaMode, DPR, reduced motion, frames loaded, fail reason.

**Polish.** Hero lead: "Gowns and suits for your debut, wedding, or prom." The cover-flow hint is gone; its meaning stays in the rail's aria-label. The reserve form keeps its 01/02/03 steps.

**SAMPLE bar vs "From our clients": no overlap.** On a real wheel scroll, `scrollIntoView`, a `#reviews` load, a hash jump and the More reviews toggle, at 1366x768 and 390x844, the eyebrow stays below the 24 px bar (for example 155 px vs 24 px at 1366 on an anchor jump) and the toggle doesn't move the page. The existing `scroll-margin-top: calc(var(--bar-h) + 8px)` already covers it, so nothing changed.

**Checks.**
- Local with frames, Chrome with GPU off at DPR 1.25, 1366x768 and 1280x720, 4 px and 100 px wheel steps: `seq-2d`, frames 0 → 13–16 → 25–29 → 35, all 36 loaded, footer reached. Reduced motion: `reduced-seq` on frame 14, which is the only frame loaded.
- Without frames (and live): one 404, then `video-2d` scrubs t 0.66 → 7.95 on 4 px steps. With the clip hung, the watchdog switches to `seq-2d` about 1 s after the scroll.
- WebKit iPhone and Chromium Android at 390x844: `video-gl`, scrubbing; reduced motion gives `reduced-gl`. With the clip blocked, Android falls to `seq-2d`, or to the poster when there are no frames either.
- CLS 0 at 1366 and 390, with and without reduced motion.

Draft; not merged.

## Round 7.6.4

Desktop Mavy, Reserve wording, and Google reviews. Commits `6eae179`, `870bc37`, `f296e40`, `048fc6f` (head). Preview `dpl_Bz9u61LCPY6i3D3Y2KaRYJpNfqNZ` (READY 18:45:51 PHT, Oct 30). Branch preview `?_vercel_share=…`.

**Desktop: why she was missing, and the fix.**
- We could not reproduce the blank hero on desktop in any emulated setup. We tried Chrome at 1366x768 and 1280x720 at DPR 1.25 with the wheel, with the GPU on, with the GPU off (SwiftShader), and with WebGL disabled. We also tried 1093x516, 1093x614 and 1536x730. She walked in every time.
- That leaves the parts of a real Windows laptop we can't emulate. The r7.6.3 renderer depended on a WebGL upload of the video texture and had three weak points there:
  - it did not handle a lost WebGL context;
  - if hardware decode handed WebGL a blank frame, the canvas stayed empty, and because a frame had "drawn", the poster never appeared either;
  - on a blocklisted GPU she showed only as the poster and never walked in.
- **Fix: two renderers, and each one checks itself.**
  - `heroAlpha.ts` now has a `gl` backend (the same shader as before) and a `2d` backend. The 2d backend keys the stacked-alpha clip on the CPU with `drawImage` and `getImageData`, using the same edge, band and saturation maths.
  - After each draw the renderer samples one row through the middle of the frame. Two blank frames in a row while Mavy should be on screen, a lost context, or a paint error all report a failure.
- **Paths.**
  - Desktop (hover plus a fine pointer) starts on `2d`. Phones start on `gl`, which iPhone confirmed in r7.6.3.
  - A failed renderer switches to the other one, then to the poster. The poster timer now runs per renderer, so a canvas that never draws a real frame shows the still.
  - `?cgrr=gl|2d` forces a renderer. `?cgrdebug=1` shows `path video-2d|video-gl|reduced-2d|reduced-gl|reduced-poster|poster-fallback`, plus the draw count and any failures.
- **Reduced motion** (including Windows "Animation effects" off) shows the landed frame at 3.5 s beside the text, on both renderers.
- **Frames: not shipped.** Mark approved an image-sequence fallback if the video fix failed. The sanctioned GitHub tools only accept UTF-8 text, so the frames could not be pushed. A local 36-frame candidate (about 1,098 KB) was not committed, and `HERO_SEQ` stays false.

**Copy.**
- Customer-facing "hold" is now reserve or reservation:
  - the nav and hero CTA read "Reserve your gown";
  - the gown page reads "Reserve this gown for 6 Nov" and "Reserve for 6 Nov", and booked days are "already reserved";
  - the booking form has the heading "Reserve the …", the submit button "Reserve your gown", the summary "Your reservation", and the note "a reservation request, not a payment";
  - the confirmation reads "Your reservation request is in." and "No reservation found";
  - the Lookbook reads "Accessories to go with your gown";
  - the meta description says reservation.
- Logic is unchanged: rate × days, the ₱200 fee only in OwnerView, and the CGR reference code.
- **Hero lead** is now "Gowns and suits for your debut, wedding, or prom, right here in Dasmariñas." The Rack lede is descriptive rather than instructional. There was no how-it-works section; the 01/02/03 booking stepper stays.

**Reviews.**
- A new section after the cover flow shows 8 Google Maps reviews from the shop's listing:
  - Quotes are verbatim, character for character, typos and emoji included. A DOM diff against the source matched 8 of 8 at both 1366 and 390.
  - Names are as given. The label is "Google review", with the relative date as shown and "5 stars" as text. There are no avatars, faces or star images.
- Layout and controls:
  - Cormorant pull-quotes with a Figtree attribution line.
  - The first 4 show, and "More reviews (4)" opens the rest. It is a keyboard-operable button with `aria-expanded` and `aria-controls`.
  - The section links to "Read all reviews on Google Maps" (new tab, `noopener noreferrer`).
  - The section is hidden when the list is empty.
- No review was dropped: none has "Translated by Google" in its body. Two show it only in the owner's reply.

**Verified (local build, then the live preview).**
- Desktop, Chrome at 1366x768 and 1280x720 at DPR 1.25 with the wheel, in normal, GPU-off and no-WebGL modes:
  - path `video-2d`, with the figure drawn at 33, 66 and 100%;
  - reduced motion gives `reduced-2d` with the landed frame;
  - text shows on open and the footer is reached.
- Forcing `gl` and then losing the context switched to `video-2d`, and she stayed on screen.
- Phones at 390x844: WebKit (iPhone) and Chromium (Android) both take `video-gl`, with `reduced-gl` when motion is reduced. Text shows on open and the footer is reached.
- Unexpected CLS is 0 at 1366 and 390, with motion on or reduced. Opening the reviews only moves content after a click, so it does not count as CLS.

Proof: `proof-r7/r7.6.4/` (local) and `proof-r7/r7.6.4/live/` (preview). Live WebKit reduced motion draws the landed frame once the clip arrives (readyState 4 by 5 s through the local relay).

## Round 7.6.3

Mobile: Mavy walks in again on phones (iOS Safari / WebKit focus).

- **Root cause.** iOS honours only `preload="metadata"` for a paused, never-played video, so the hero clip stayed at readyState 1 on iPhone. No frame was ever decoded, so nothing was drawn. The 8 s fallback only fired for readyState < 1, so the poster never showed either. The result was text with no Mavy. In local WebKit we also saw `seeked` fire (and rVFC skip paused seeks) before the frame could be uploaded, so a single paused seek drew a blank canvas.
- **Fix.**
  - The scrub is now a rAF loop that reads scrollY against the ScrollTrigger range. There are no wheel or scroll handlers.
  - Only one seek runs at a time. It is released on `seeked` or after a 700 ms stall. `fastSeek` is used for large jumps while scrolling.
  - The muted clip is primed with `play().then(pause)` on load and on the first touch, pointer, scroll or key event.
  - The video tag has the `#t=` start fragment, `preload="auto"`, muted, playsinline and webkit-playsinline.
  - The renderer redraws one double-rAF after `seeked`, `canplay` and `loadeddata`.
- **Fallback.** If no frame is decoded within 8 s, the poster shows, and it switches back to the video when a frame arrives late. If the clip fails to load, the poster stays.
- **Debug.** `?cgrdebug=1` adds an overlay: path (video-scrub / poster-fallback / reduced / canvas-seq) | readyState | t cur/target | last seek latency | primed.
- **Image-sequence option.** A canvas path sits behind `HERO_SEQ=false` / `?cgrseq=1`. It is off by default, and its frames are not committed. If the frames are missing it falls back to the video.
- **Verified locally** at 390x844 in Playwright WebKit (iPhone 13) and Chromium (Pixel 7), with motion on and with reduced motion:
  - Mavy is drawn at 33/66/100 %, and the reduced-motion page shows the landed frame.
  - The text is visible on open, the page reaches the footer, and CLS is 0.
  - A late clip (11 s) recovers from the poster to the video. A blocked clip shows the poster.
  - Desktop 1366x768 has not regressed.
- **Caveat.** Linux WebKit does not reproduce iOS media policy, so this still needs a check on a real iPhone.

## Round 7.6.2

**"i. On Mavy" caption waits for her.** Commit `6b82b61`, preview `dpl_BMWWamFEgpEd939Qo2DLefQQ4AFo` (READY 17:15:34 PHT, Oct 30).

- With motion on, the caption starts hidden: opacity 0 and visibility hidden, set in CSS so it never flashes. It fades in on the same intro scroll that moves Mavy (or the poster fallback), between 20% and 32% of the scroll, as she walks in.
- Only opacity and visibility change, so nothing moves and CLS stays 0. While hidden, the caption is out of the accessibility tree and carries `aria-hidden`.
- Reduced motion keeps it visible, and so does noscript.
- At 1100px and below (phones and tablets) the caption column is still not shown, as in r7.6.
- **Live results:**
  - At 1366x768 @1.25 the caption is hidden at 0%, visible at 66% and visible in reduced motion. 1366x650 and 1440x900 behave the same.
  - No h1 or lead overlap at 1366x768, 1366x650, 1440x900, 390x664 or 390x844 (25/25 OK).
  - The wheel reaches the footer with motion on and reduced, at 1366x768 and 390x844.
  - CLS 0 and 0 console errors.
  - Proof is in `proof-r7/r7.6.2/`.

## Round 7.6.1

**Hero: text on open, scroll alone brings Mavy in, desktop fixed.** Commit `4855298`, preview `dpl_CHY2LVX5p1fyPHEGUXudrwVdAqF1` (READY 16:58:39 PHT, Oct 30). Branch preview `?_vercel_share=…`.

**Root cause (reproduced on 62afb88 before the fix, `proof-r7/r7.6.1/repro-before/`):**
- In r7.6 the copy was held at opacity 0 until the clip "landed" (about 3.5 s) or a 5 s cap fired. At 1366x768 @125% on a cold load the h1 and lead were still invisible at 1 s and 3 s and only showed at about 5–6 s.
- When the clip's `<source>` fails or is blocked, Chrome never sets `video.error` and `play()` never settles. So "landed" never fired: Mavy never showed and the text waited for the cap. Meanwhile the 240svh pin took 10 wheel ticks, 9 of them changing nothing. That is the "stuck / not working" feel.
- With Windows animation effects off, Chrome reports `prefers-reduced-motion: reduce`, and the hero is a static landed frame by design. It is not broken, but nothing moves on scroll. If Mark's laptop has animations off, that is what he sees.
- The wheel itself was never hijacked: every tick moved the page, and every case reached the footer.

**Changes:**
- The copy is visible from the first styled paint. Removed: the load-time reveal, the 5 s cap, the CSS failsafe and the noscript rule.
- No Mavy on open and no autoplay. The alpha clip waits on its empty first frame, and the intro scroll scrubs her walk-in, landing and spin.
- When the clip fails (a source error, or no metadata in 8 s) or WebGL is unavailable, the poster shows instead and fades in on scroll. It uses a screen blend and a feathered mask, with the masthead kept above it.
- The pin is shorter: 240svh → 200svh. The stage min-height is 440px (was 560), so the CTA stays above the fold at 1093x535 CSS px (1366x768 @125%).
- The ghost word "Gowns" drifts right, away from the lead.
- Reduced motion shows the landed 3.5 s frame and all the text.
- The accessories band and the cover-flow rail are unchanged.

**Results (live, `proof-r7/r7.6.1/`):**
- **Overlap:** none at 0/33/66/100% and reduced, at 1366x768, 1280x720, 1366x620, 1366x650, 1440x900, 1093x535, 390x664 and 390x844 (40/40 OK). The poster fallback is 5/5 OK.
- **First visible text on a cold load:** 1.3–2.7 s live (0.24–0.85 s local), down from about 5–6 s.
- **CDP wheel at DPR 1.25** (1366x768, 1280x720, 1366x620) plus 390x844, motion on and reduced: reaches the footer every time, CLS 0, no errors. With motion on, 0 dead intro ticks.
- **Other checks:** CLS 0; a11y 0 failures and no taps under 44px; nav fits at 1366x650; noindex; SAMPLE bar; booking 2 days = ₱5,000; ₱200 shown to the owner only.

## Round 7.6 (Chip: the cover hero, lookbook spreads, Pinyon Script only)

Commits `7b2374b` and `62afb88` on `9390565`. Both are text-only and went through the connector (no force-push, no merge). They change `layout.tsx`, `FontGate.tsx`, `Story.tsx`, `Rack.tsx` and `cgr.css`. The cutout v2 mp4 and poster are unchanged, there are no new binaries, and `cursor/cgr-gowns` was not touched.
Preview `dpl_HHXHxXzfhTsPxPNnGpvYciUbqniP` was READY at 16:18:13 PHT on 30 Oct 2026. It is behind protection; append `?_vercel_share=…` to the URL.

**Script font:** Pinyon Script is now the only script, and that includes the rotator. It loads through `next/font/google`, which fetches it at build time, the same way as Cormorant and Figtree, so no font file is in the repo. Great Vibes is retired. FontGate now covers the masthead, the ghost word, the rotator, the copy and the caption column, so the swap can't cause a shift.

**Hero (the cover):** the masthead "Cavite *Gown* Rentals" sits behind Mavy, and her head meets only the lower part of "Rentals". The brand stays readable, and the real name is still text in the nav. The timeline runs on load:
- At 0 s the stage is black, with the nav already visible.
- The existing cutout v2 clip walks her in and lands her at 3.5 s.
- The h1, lead, buttons, ghost "Gowns", masthead, rotator and caption fade in by opacity only (600 ms, staged), starting at 3.2 s and finishing at about 4.1 s.
- If the clip is slow or fails, a 5 s cap reveals everything. There is also a 6 s CSS failsafe and a noscript reveal.
- After she lands, scroll drives the spin.
- Reduced motion shows the landed frame with all content visible.

The rotator lines each carry the whole phrase "for your …", right-aligned in one grid cell, so nothing jumps.

**Rooms (lookbook spreads):**
- **01 Bridal:** the ivory veil gown in a frame, the gold cape on a mat, the ivory ball gown as a float, captions i–iii, and a contents strip with 44 px links.
- **03 Filipiniana:** its one photo plus two CSS detail crops of that same photo (bodice and sleeves, train). The captions sit in a row under the text, and the script word sits under the black gown so it stays legible.
- **05 Barong and suits:** embroidery in the frame, woven on a mat, royal blue and turquoise as floats, captions i–iv.

The r7.5 accessories band stays between the spreads. On desktop with motion on there is a small scrubbed parallax and a 03 page-turn clip. Phones get stacked pages.

**Checks on live (`62afb88`):**
- **Hero overlap:** no h1, lead or CTA overlap with Mavy, the ghost word, the rotator, the masthead or the caption at 1366x650, 1366x768, 1440x900, 390x664 and 390x844, at 0, 2, 3.5 and 4.5 s and in reduced motion (25/25 OK).
- **Nav:** fits at 1366x650.
- **Wheel scroll:** reaches the footer at DPR 1.25 at 1366x768 and 1280x720, in 120 px and 8 px steps, with motion on and reduced (8/8). CLS is 0.
- **Cold-load CLS:** 0 at all 5 sizes, motion on and reduced, measured 6.5 s through the reveal and then scrolled.
- **AA:** 0 failures on the gown and reserve pages. The home page has only the 6 known `cgr-cf-*` cover-flow false positives.
- **Taps:** no tap target under 44 px.
- **Console:** 0 errors.
- **Guardrails:** noindex is still set, and the SAMPLE bar shows. The booking math is 2 days × ₱2,500 = ₱5,000, and ₱200 appears on the owner page only.
- **Images:** the hero and the spreads use only the 8 FB crops plus the Mavy clip.

**Deviations:**
- She walks in from the left, as the clip does; the stamp drew her from the right.
- The reveal starts at 3.2 s, and wheel, touch or key input reveals early.
- The intro is 240svh.
- Spreads 02 and 04 are not drawn in the stamp, so their contents links go to the rail.
- The captions say "ask the shop" instead of the stamp's example rate.
- The Filipiniana composition and copy are new.
- On phones, 01 swaps the gold cape (now in the art) and the ivory ball gown (now the float).
- The accessories band (6 accessory images) and the cover-flow rail (6 gown listing images) keep their r7.5 images. The defaults ask for the band to stay as in r7.5, so the page as a whole loads more than the 8 crops plus Mavy.

Proof: `proof-r7/r7.6/` holds the hero frames (`hero-{1366x768,390x844}-{0s,2s,3.5s,4.5s,reduced}.jpg`), the spreads (`catalogue-spread-{1366,390}.jpg`, `catalogue-spread-03-{1366,390}.jpg`, `suits-spread-{1366,390}.jpg`) and the JSONs: `hero-overlap-live`, `scroll-trace-live`, `cls-live.txt`, `a11y-live`, `livea-live`, `images-live`, `spreads-live` and `checks-live`.

## Round 7.5.1 (Chip: Mavy missing from hero stills; blue ball gown floor)

Commit `9390565` on `4bd5bed`. It is text-only and was pushed through the connector (no force-push, no merge). It changes `Story.tsx`, `Rack.tsx` and `cgr.css`. The alpha cutout v2 mp4 and poster are unchanged, and there are no new binaries.
Preview `dpl_5p9TSHzVUwMmN38MLQji5y6FCvUU` was READY at 15:31:38 PHT on 30 Oct 2026. It is behind protection; append `?_vercel_share=…` to the URL.

**Root cause:** scroll 0 was mapped to clip time 0 s. Mavy's matte is empty until 0.7 s, and she walks in from the left edge until about 3.4 s. The shader's left-edge fade plus a second 16% CSS mask kept her close to invisible for that whole stretch. As a result, the hero column was blank at the top of the page and for the first third of the scroll in motion mode. Reduced motion seeks to 7.31 s, so she showed there. HERO_ALPHA, z-index, FontGate and opacity were all fine. The z-order is ghost word 0, Mavy 1, copy 2.

**Fix:**
- The scrub now runs from 3.5 s (her full figure is in frame) to the end, so scroll 0 shows her facing the camera at the start of the spin.
- I removed the redundant CSS mask. The shader still softens the edges.
- On phone, `.cgr-mavy` is now `right: 0` (it was `-9vw`) so the veil stays inside the screen.
- The blue ball gown gets `.is-floorcrop`, a 112% image box that crops the white studio floor in CSS.

**Live results on 9390565:**
- **Hero:** 5 sizes (1366x650, 1366x768, 1440x900, 390x664, 390x844), with motion on at spin 0, 50 and 100% and at the end, plus reduced motion. That is 25 of 25 ok.
  - The video was decoded before every capture (readyState 4, then rVFC plus 2 rAF).
  - Mavy is visible and fully in the viewport in every frame.
  - Her pixels overlap the h1, lead, hand, rate and CTA by 0, and her box overlaps them by 0 too.
  - The nav fits at 1366x650.
- **CLS:** 0 over 12 cold loads (3 each at 1366x768 and 390x844, motion on and reduced), including a 45-step wheel scroll.
- **Wheel scroll-through at DPR 1.25** (1366x768 and 1280x720, 120px and 8px steps, both modes): reaches the bottom and the footer, CLS 0, 0 errors.
- **Taps and AA:** 0 taps under 44px. AA shows only the same six known cover-flow probe false positives as r7 to r7.5.
- **Booking:** 2 days = ₱5,000 and 4 days = ₱10,000. The ₱200 shows on the owner view only.
- **Pages:** noindex on every page, the SAMPLE bar is present, 0 console errors and 0 broken images.

**Deviations:**
- Reduced motion shows the alpha canvas parked on the front-facing frame, not the poster jpg. The jpg is still the no-WebGL fallback.
- Because the spin starts at 3.5 s, the walk-in from the edge no longer plays.
- The commit title says "r7.5.1 (Chip)" because `4bd5bed` was already titled r7.5.1.

**Proof** is in `proof-r7/r7.5.1/`:
- `frames/hero-{1366x768,390x844}-{spin0,spin50,spin100,end,rm}.{png,jpg}`
- `hero-geometry.json`, `cls.json` and `checks.json`
- `scroll/` (scroll-through frames and JSON)
- `catalogue-{1366,390}.jpg` and `stills/`

---

## Round 7.5 (Design's veil stamp: Cormorant + Figtree, wine and ivory, tulle and lace)

Commits on `904d5fe`, all text-only and pushed through the connector (no force-push, no merge):
- `a78116a`: tokens, type and CSS
- `d4bf26c`: hero, racks and menu
- `121dbc8`: inner-page buttons
- `4bd5bed`: a live CLS fix and selected-day contrast

Deployment `dpl_3upLWA5CLNWsMtUeJq4158Pja9W4` was READY at 2026-10-30 15:16:33 PHT on the branch alias. The intermediate `d4bf26c` preview errored in its build step; `121dbc8` and `4bd5bed` are READY.

**What changed**
- **Type.** All type comes from `next/font/google`; no font files are committed.
  - Display is Cormorant Garamond: Light 300, 400 italic for accents and 500 for small italic labels.
  - Body is Figtree 400/500.
  - Great Vibes is used only in the hero rotator, which holds 2.2s with a 1.2s crossfade.
  - Anton, Archivo and Space Mono are gone.
- **Colour.** The palette is ivory, cream, blush and wine (`#5B1A2A`) on black. Vermilion (`#E8452C`, `--hot`) has been removed, and `btn-hot` is now `btn-wine` across the pages.
- **Textures.** The tulle net and the lace scallop are CSS/SVG data URIs. No image files were added.
- **Motion.** Slow silk/veil ease-outs and gentle desktop drift. Reduced motion is static.
- **Hero.**
  - The h1 "Gown and suit rentals in Dasmariñas, Cavite." sits on black tulle, with ñ clearance.
  - The alpha Mavy is in the right column with a soft left-edge mask.
  - The lace scallop sits at the foot.
  - The r7.4.1 vh frame and the reduced-motion static placement are carried over.
- **Catalogue.**
  - On desktop the gown strip is sized to the stage, so all five gowns are visible from 900 to 1920 wide.
  - On phones a staggered two-column grid replaces the fan. At 390 the ivory ball gown and the royal-blue suit, the first card in each fan, are fully on screen, as is every other photo.
- **Men's.** Two mats, four suits and barong, and the pitch line.
- **FontGate.**
  - The list now covers the wordmark and the hero word as well.
  - Live cold loads on `121dbc8` showed a 0.042 shift from those two swapping fonts.
  - On `4bd5bed` every live cold load measures 0.

**Kept:** the facts, address and contact, the example-rate labels, the SAMPLE bar, `noindex`, the removed eyebrows, and booking total = rate × days. ₱200 stays in the owner view only.

**Live results (`4bd5bed`)**
- **Hero geometry:** no overlap between the h1, lead, script, CTAs and Mavy in 15 of 15 cases, inside the stage. Viewports: 1366x650, 1366x768, 1440x900, 390x664 and 390x844, in both modes; motion-on was checked at scroll 0 and at the end of the intro. The nav fits without truncation at 1366x650.
- **Wheel scroll-through:** every step advances and reaches the footer, with CLS 0 and 0 errors in 8 of 8 runs. Viewports: 1366x768 and 1280x720 at DPR 1.25, 120px and 8px steps, both modes.
- **CLS:** 3 cold loads each at 1366x768 and 390x844, motion-on and reduced, plus 45 wheel steps per run, all measure 0 (12 of 12).
- **Contrast (AA):**

  | Pair | Ratio |
  |---|---|
  | wine on ivory | 11.49 |
  | wine on blush | 9.19 |
  | mute on ivory | 5.82 |
  | mute on blush | 4.66 |
  | blush on black | 14.26 |
  | ivory on wine | 11.49 |
  | cover-flow cream on wine | 10.65 |

- **Tap targets:** no tap target under 44px on the home, gown or reserve pages at 1366 or 390.
- **Pages:** 200 with `noindex, nofollow` (header and meta), the SAMPLE bar, 0 console errors, 0 bad responses and 0 broken images at 1440 and 390 (and in all still runs).
- **Booking:** 2 days × ₱2,500 = ₱5,000 and 4 days = ₱10,000. ₱200 appears in Owner only.
- **Fonts:** Cormorant Garamond, Figtree and Great Vibes are the only faces loaded, as 8 woff2 files from `/_next`. Newsreader is used by 0 elements, and there are no Anton or Archivo requests.

**Deviations from the stamp**
- **Mavy:** the existing alpha video Mavy is kept; the stamp's `mavy-7.5.png` is not committed because a binary needs Mark's yes. In motion mode the walk-in is still scroll-driven, as in r7.4.1.
- **Hero extras:** the stamp's S-curve, magnet and scroll hint are not used.
- **Phone and tablet (≤899):** a staggered grid replaces the stamp's phone tilt so every photo shows. The magnifier note is hidden on touch.
- **Desktop strip:** softened from the stamp's 270px cards at −40° to stage-sized cards at −34°. At the stamp's size the first gown sat behind the fade and the last ran past the edge at 1366.
- **Phone header:** Menu only, with the wordmark sub hidden at ≤640. Header buttons are 44px rather than 40/36.
- **Phone rotator:** each noun carries its own "for your", so short and long nouns sit the same way.
- **Shop photos:** captions say "· ask the shop". The men's CTA links to the shop's Facebook.
- **Not carried over:** the stamp's `#filipiniana`, placeholders and empty cards.
- **Inner pages:** restyled by tokens only.
- **Selected calendar day:** now ivory on wine, where it was 1.1:1.

Proof: `proof-r7/r7.5/`
- `stills/`: hero, catalogue and men's at 390 and 1366, motion-on and `-rm`.
- `scroll-through.json`, `scroll-through.txt` and `frames/`: 0/10/25/50/75% and the footer.
- `cls.json`
- `hero-geometry.json`
- `checks.json`: contrast, taps, fonts, pages and booking.

Live access used the share link (`?_vercel_share=…`); no token is stored.

## Round 7.4.1 (desktop scroll report: hero frame for short/wide windows)

Commit `904d5fe` on `c3543c0` (text only: `cgr.css`, `Story.tsx`; pushed through the connector, no force-push, no merge). Deployment `dpl_6yk7s43cRPXUuarjKNnHCbdB1kqX` READY 2026-10-30 14:29:15 PHT on the branch alias.

**Report** (Mark, 13:31 PHT, Windows Chrome, ~1366 wide): "scroll doesn't seem to be working on desktop".

**Root cause.** There's no scroll lock. On live r7.4, every wheel step advanced `scrollY` at 1366x768@1.25, 1280x720@1.25, 1366x620 and 1440x900, with 120px and 8px deltas, in both modes. That's 0 stuck steps, `overflow` visible, no nested scroller, no non-passive wheel handler and 0 errors. The screenshot shows the **reduced-motion static composition**: Windows "Animation effects: off" sets `prefers-reduced-motion`. In static mode:
- the lifted cream GOWNS sat under the cream header: the nav read "Acc…" and the logo sat over the G;
- the scroll story is off by design, so the first screen didn't change as you scrolled, and the page read as stuck.

Separately, in both modes, vw-sized type with %-height placement put the h1 and lead over GOWNS/script and below the fold on wide, short windows (e.g. 1366x620).

**Fix (desktop ≥900 only; the phone layout is untouched).**
- The hero lays out in a composition frame: `--fh = max(560px, 100svh − bar)`, `--fw = min(100vw, 1.644·fh, (fh − 240px − top)/0.348)`, centred by `--fx`. Type sizes and x offsets use `--fw`, so short windows scale the composition instead of overlapping it.
- 1440x900 and taller are unchanged (1440x900 h1 box identical to r7.4).
- Static GOWNS starts below the header and is capped to end above the h1. The cap keys off the `prefers-reduced-motion` media query, not `data-motion`: SSR renders `data-motion="on"`, so a size change at hydration would be a layout shift (caught locally at 0.0585, fixed before push).
- `Story.tsx` desktop x moves use the same frame width.

**Live results (`904d5fe`).**
- Scroll to the footer by wheel: every step advances, and the footer is reached at 1366x768@1.25, 1280x720@1.25, 1366x620 and 1440x900 (120px), plus 1366x768 at 8px. Both motion-on and reduced motion; CLS 0 and 0 errors in all 10 runs.
- Hero grid (1024/1093/1280/1366/1440 × 600/620/720/768/900/1000 × both modes, 60 cases):
  - h1 and lead never overlap GOWNS, and the lead never overlaps the h1;
  - the lead stays inside the stage;
  - no cream GOWNS under the nav links (0) and ≤0.021 under the logo (same as approved 1440x900);
  - the nav fits without truncation at all widths 1024–1440.
- CLS: 3 cold loads each at 1440 and 390 → 0; reduced-motion load at 1440x900, 1366x620, 1366x768, 1280x720 → 0.
- 200, `noindex, nofollow` (header + meta), SAMPLE bar, 0 console errors, 0 broken images at 1440 and 390. Booking 2 days × ₱2,500 = ₱5,000, 4 days = ₱10,000. ₱200 is in Owner only. Newsreader is used by 0 elements, and 0 Newsreader files are requested.

Proof: `proof-r7/r7.4.1/`
- `scroll-through.json` + `frame-*.png`: scrollY per wheel step, frames at 0/10/25/50/75% and the footer
- `fixed/`: hero stills at 1366x768@1.25, 1280x720@1.25 and 1366x620, static + motion load
- `before/` and `after/`: the original bug, as before/after pairs
- `geom-grid-live.json`, `cls-cold.txt`, `cls-static-load.txt`, `livea-r741.json`
- `r7.4-live/`: the r7.4 live stills

## Round 7.4 (face-free shop photos)

Commit `c3543c0` on `b2316f3`, pushed from the Mac (16 image binaries + code in one commit). Deployment `dpl_APjE1DYjkrguLSKEV9qryTTfvqSe` READY 2026-10-30 13:32:27 PHT on the branch alias.

Live checks (r7.4, branch alias):
- 200 and `noindex, nofollow` (header + meta) at 1440 and 390, with the SAMPLE bar; 0 console errors, 0 bad responses, 0 broken images.
- Every loaded photo is served as `image/avif` (e.g. barong-woven 80KB, barong-embroidery 69KB, suit-turquoise 74KB).
- `sizes` isn't applicable: each photo is one fixed file in `<picture>` with `width`/`height`, not a responsive srcset.
- CLS 0 on 3 cold loads each at 1440 and 390. Reduced motion: static.
- No Newsreader: the faces are declared but unused, and no Newsreader file is requested.
- Booking 2 days × ₱2,500 = ₱5,000, 4 days = ₱10,000. ₱200 is in Owner only.
- Note: at 390 the first card of the gown and suit racks (ivory-ball, suit-royal-blue) sits fully off-screen in the clipped rack fan, so it's never shown or loaded. That's not broken, but those two photos aren't seen on phones.

Stills: `proof-r7/r7.4/live/` (catalogue/gown strip, Filipiniana/sagala, Suits and barong, accessories at 1440 and 390, normal and reduced motion; hero-1440/390 unchanged).

The local build notes follow.

- 8 crop-only photos from the shop's public FB page (approved for draft #33). No retouching, AI fill or generation. AVIF with a WebP fallback via `<picture>`, at most 1200px on the long edge, every file 120KB or under, `width`/`height` set, lazy-loaded in fixed-size cards. Sources, crops and sizes: `public/demos/cgr-rentals/photos/SOURCES.md`.
- Gown strip: ivory veil, ivory ball and gold cape photo cards take the 3 slots whose listings only re-used the red/blue crops. Those listings stay in the rail. The photo cards have no listing, rate or calendar; each says "ask the shop for rates".
- Filipiniana band: one filipiniana photo between two sagala "no photo yet" cards. No face-free sagala photo exists.
- Suits and barong: two suits and two barong. The barong are cropped from the collar down, removing painted mannequin faces.
- Dropped: ivory-03 (same gown as ivory-02, softer, background sign), filipiniana-02 (real model, never used).
- Weights (AVIF / WebP, KB): ivory-veil 65/89, ivory-ball 54/72, gold-cape 41/61, filipiniana 73/115, barong-embroidery 69/98, barong-woven 80/107, suit-blue 34/39, suit-turquoise 74/114.
- Local (next build + start): 200, noindex, 0 console errors, 0 broken images. CLS 0 on 4 cold loads at both 1440 and 390, and 0 on a full scroll through the racks (3 runs per width). Reduced motion: strips static (`transform: none`).
- Unchanged: hero, rotator, h1, FontGate, address/contact, cream script, SAMPLE bar, booking flow.

## Round 7.3.1

Commit `b2316f3` · deployment `dpl_AJH2roUg6EBHPJDapqeCuDYM3YGg` (READY 2026-10-30 13:03:59 PHT).

**Font-load CLS → 0.**
- Root cause: `display:block` faces are still laid out with fallback metrics while they're invisible. When Anton arrives, the h1 line 3 ("Cavite.", 211px), the condensed header nav and the magnet label reflow (the mobile header too, at 390). Space Mono re-centres the SAMPLE bar text, and Great Vibes (swap) moves the rotated cream script. Fallback metric overrides can't match Anton's widths exactly, so a little shift remained.
- Fix: a small `FontGate` client wrapper. It keeps only the font-sensitive elements (bar text, nav, mobile header, intro h1, magnet label, script) at `visibility:hidden` until `document.fonts.load()` settles for the four families, with a 3s cap. Chrome doesn't score shifts of hidden boxes.
- Safety nets: a CSS keyframe failsafe at 3s, and a `<noscript>` override so no-JS users see everything.
- Unchanged: font display settings, h1 text and sizes, ñ clearance, cream script, hero and rotator are all the same. Fonts still come only from next/font/google.
- Live CLS, 6 cold loads at each width: 1440 → 0, 0, 0, 0, 0, 0; 390 → 0, 0, 0, 0, 0, 0. Each load made 10 font requests, 0 of them Newsreader.

**Eyebrows removed (elements deleted, spacing rebalanced):**
- "Rent by the day · Dasmariñas, Cavite" (catalogue / #gowns)
- "02 · Filipiniana and sagala"
- "03 · Men's formal wear"
- "04 · Accessories"
- "Other racks" (now the rack nav's `aria-label`)

Kept on purpose: the SAMPLE | NOT LIVE bar, "Placeholder copy · not from the shop" disclosure tags, the "sample site by kantoco" wordmark line, nav items and buttons, form labels, CatRows status tags, OwnerView prices, and sr-only text.

Proof: `proof-r7/r7.3.1/` (cls.json, hero/, sections/).

> **SAMPLE | NOT LIVE.** This is a private KantoCo preview for Cavite Gown Rentals (Dasmariñas). It is a new project and is separate from the frozen 3D work on `cursor/cgr-gowns`, which this PR does not touch. Do not merge.

**Done when:** a logged-out `_vercel_share` link to `/demos/cgr-rentals` returns 200 with `X-Robots-Tag: noindex, nofollow`, and all of these work with real CGR photos at 375/390 and 1440:
- catalogue filters (category, size, color)
- detail page and mock calendar
- reservation that saves a `CGR-XXXX` ref
- owner view with status edits and **confirmed** bookings × ₱200 (commission shown in Owner only)

## Round 7.3 (racks after the intro, suit-inclusive h1, cream footer script)
Head: `28cf872`, one text commit on top of `af839a4` (4 files: new `Rack.tsx`, `Catalogue.tsx`, `Story.tsx`, `cgr.css`). Pushed through the connector with no force-push and no merge. No new binaries, and `mavy-side-spin-alpha.mp4` is unchanged. Deployment `dpl_BQo5tSoC1oMDEs9apY9oe1aZ6zx1` was READY at 12:41 PHT on the branch alias.

What changed (Design's r7.3 stamp; the stamp wins where it conflicts with the brief):
- **"What's on the rack" catalogue.** It replaces the mood board. It's an ivory screen with four category rows: 01 Gowns (6 pieces), 02 Filipiniana and sagala, 03 Men's formal, and 04 Accessories (6 pieces). Rows 02 and 03 say "ask the shop". Next to the rows is a tilted strip of the six gown photos, each linking to its detail page. On desktop the strip drifts along its own tilted axis as you scroll (it scrubs and passes through the stamp's composition when the screen is full). It is static on phone and under reduced motion. `MoodBoard.tsx` is no longer rendered and its CSS is removed. The file itself stays, because the connector can't delete files.
- **Filipiniana and sagala band.** A labelled band with four empty cards (Sagala / Filipiniana) and a "Call or message the shop" link to the footer. It is marked "Placeholder copy · not from the shop".
- **"Suits and barong".** A black screen with four empty placeholder cards (Suit / Barong), a "Back to gowns" button, and an "Other racks" row. It is marked "Placeholder copy · not from the shop". Men's formal is real: the shop rents suits. No suit items, photos or prices are invented.
- **Accessories, "Tiaras and crystals".** Uses the six existing accessory photos in a tilted strip, with two rows: tiaras and crowns (4 pieces), and choker and bracelet (2 pieces).
- **Condensed section nav.** While a rack is on screen, a fixed bar shows Gowns / Accessories / Visit / Hold a gown, plus the menu on phone. It turns dark on the men's screen. The active link gets an underline bar, and every tap target is 44px.
- **Scaffolding out of view.** The line "Filipiniana and men's formal wear are waiting on photos" is gone (rg finds no match in `src/`). The mono eyebrows now carry customer copy.
- **h1 (approved exception).** The h1 now reads "Gown and suit rentals in Dasmariñas, Cavite." Line-height is still 1.14 with the extended reveal clip, so the tilde on DASMARIÑAS isn't cut at 360, 390 or 1440. It's three lines on phone ("Gown and suit rentals / in Dasmariñas, / Cavite."); the phone size is now 9.8vw, so the longest line fits inside the 20px gutters (35px at 360, 38px at 390). Desktop is two lines and unchanged in size.
- **Footer script (approved exception).** The "see you" script is cream to match the hero script, with the hero's soft dark halo where it crosses the cream wordmark. Vermilion stays on CTAs and accents.
- **Unchanged.** The intro, rotator, address, contact links, booking flow, owner-only ₱200, the SAMPLE bar, and noindex in both meta and header.

Deviations from the stamp:
- The catalogue eyebrow is "Rent by the day · Dasmariñas, Cavite", and "· 6 sample pieces" is dropped from the accessories eyebrow.
- Empty tags read "ask the shop", "no photo yet" and "ask the shop for rates". The Filipiniana and men's leads are plain customer copy.
- The scrub runs xPercent −9 → +9, not 0 → −30%, so the near edge never opens empty and the stamp composition lands mid-scroll.
- Phone strips are static (no scroll-snap).
- Accessory photos use `object-fit: scale-down`, so the small crops aren't upscaled.
- The "See the 6 …" buttons go to the full rail (`#rail`).
- The stamp's open question on men's formal is settled: Mark confirmed the shop rents suits.

Checks on the live alias (390 and 1440):
- 200 with noindex, nofollow in both meta and header. 0 console errors, 0 broken images, no bad responses.
- No taps under 44px. AA shows only the known carousel false positives from earlier rounds; the mood-board one is gone. No pink on cream.
- The booking total is rate × days (3 days at ₱2,500 = ₱7,500). ₱200 appears only in the owner view (it goes ₱0 → ₱200 on confirmed and back to ₱0 on cancelled).
- Reduced motion: static intro, 0 running animations, and the mp4 is not fetched.
- CLS is 0 at 390 on load and 0.001 after a full scroll. At 1440 the known font-swap shift on h1 line 3 and the nav, around 1.2–1.8s, is still there: 0 to 0.015 across five loads, compared with about 0.009 in r7.2.1, because the first line is longer. It is not from the racks.

Stills are in `proof-r7/r7.3/`:
- `hero/`: the landed h1, with motion and reduced.
- `h1/`: tilde crops at 360, 390 and 1440.
- `sections/`: the catalogue with its strip, men's, Filipiniana and accessories, with motion and reduced.
- `footer/`.
- `checks/`: quick checks, CLS repeats and the condensed nav menu.

All are at 390 and 1440 unless noted.

## Round 7.2.1 (script plates, Newsreader, shop details)
Head: `af839a4`, two text commits on top of `86657bf` (`877266a` plates and Newsreader; `af839a4` address, contacts, nouns, suits lead, cream script). Pushed through the connector with no force-push and no merge. No new binaries, and `mavy-side-spin-alpha.mp4` is unchanged. Deployment `dpl_H2cUKJCW41AMToSY4hDNUnpQuRJr` was READY at 12:13 PHT on the branch alias.

What changed:
- **Plates gone.** At 1440 the "for your / debut" script sat on dark rectangles. The cause: the write-on `clip-path: inset(0)` stayed on the script after it landed and cut its 18px black text-shadow into hard boxes. The wipe box is now padded past the glyphs and set to `clip-path: none` once it lands. The shadow is now a thin soft dark halo, not a plate. Checked every noun, mid-crossfade and reduced motion at 390 and 1440.
- **Newsreader off CGR.** No route renders text in the root Newsreader; it is only the site-wide body fallback, but it was preloaded on every page. The root font now has `preload: false`, so it still loads on demand anywhere text falls back to it. On CGR, `cgr.css` points the html/body shell at a system face, so the page never fetches it.
- **Script colour.** The Great Vibes "for your…" line is cream, to match the shop's logo. Vermilion stays on CTAs and small accents. Where the script crosses the cream GOWNS letters, the dark halo keeps it readable.
- **Rotator nouns** (from the shop's public Facebook): debut, pageant, filipiniana, sagala, gala night, wedding, prom, formal night. It still lands on debut. The sr-only sentence is now "Gowns for your debut, pageant, filipiniana, sagala, gala night, wedding, prom or formal night." The longest noun is "formal night". The noun stack reserves its width (217px at 360, 236px at 390, 535px at 1440) and one width holds through the rotation, so there's no layout shift.
- **Suits.** The hero lead is now plain: "Cavite Gown Rentals rents gowns and suits for any formal occasion in Dasmariñas, Cavite." The meta description and the shop data now say gowns and suits. The GOWNS wordmark, the h1 and the catalogue are unchanged.
- **Address** is "#71 Jose Abad Santos Ave., Salawag, Dasmariñas City, Cavite" in the footer, the meta description, the shop data and the maps link. "071 Lolit Bldg" no longer appears anywhere in the repo (rg finds no match). CGR has no structured data (JSON-LD) to update.
- **Contact links** in the footer: 0977 087 8589 and 0995 477 1665 (`tel:` links), Instagram cavite_gown_rentals, TikTok @cavitegownrentals, and facebook.com/CaviteGownRentals. They are links only: nothing is sent automatically and no form posts anywhere. Every tap is at least 44px. On mobile, the footer's two columns are now `minmax(0, 1fr)`, so long links wrap instead of squeezing the second column. The column count is unchanged.
- **Unchanged.** Section layout and the catalogue (Design is stamping those for r7.3), the r7.1 intro, the owner-only ₱200, and noindex in both meta and header.

Checks on the live alias (390 and 1440):
- 200 with noindex, nofollow in both meta and header, and 0 console errors.
- Newsreader requests on CGR: 0. On `/` and `/demos/amihan-salon` it is still declared as the body font and loads on demand (0 requests on load, 1 once text renders in it).
- CLS 0 at 390 on load, during the rotator, after scroll and under reduced motion. At 1440, an intermittent shift of about 0.009 can happen around 1.5s when web fonts swap (h1 line 3 and nav). r7.2 shows the same in an A/B, so it is not new in this round.
- No taps under 44px. AA has the same known false positives as r7.2 (hidden carousel titles).

Stills are in `proof-r7/r7.2.1/`: hero at rest on debut, mid-crossfade, reduced motion, formal night and gala night, and footer/contact, each at 390 and 1440.

## Round 7.2 (design stamp: type, copy, rotator)
Head: `86657bf`, three text commits on top of `124cc5b` (`4f983be` fonts and hero, `269fe9a` and `86657bf` copy; 12 files), pushed through the connector with no force-push and no merge. No new binaries, and `mavy-side-spin-alpha.mp4` is unchanged. Deployment `dpl_ARXfyBWXRKzcPrnmZheGFxjLbzTN` was READY at 11:35 PHT on the branch alias.

What changed:
- **Type.** Display is now Anton and script is Great Vibes, both through `next/font/google`. Archivo is used for body text only, and Space Mono stays for mono. Mrs Saint Delafield is gone. GOWNS bleeds off both edges (570px at 1440, 164px at 390). The wordmark, buttons and magnet are Anton caps.
- **h1.** Line-height is 1.14, and each line's reveal clip is extended 0.14em upward, so the tilde on DASMARIÑAS is never cut. The h1 runs three lines on phone and two on desktop.
- **Rotator.** "for your" stays fixed while the noun under it rotates once through debut, pageant, wedding, prom, JS prom, ball, photoshoot and graduation ball, then lands back on debut. Each noun holds for 1.9s, then a 0.6s crossfade (0.45,0,0.55,1) with a 4px blur and 0.05em rise. It starts at about 1.7s and stops on scroll, tap or key. Its width is reserved, so there's no layout shift. It's static under reduced motion. The visible words are `aria-hidden`, and one sr-only sentence carries the meaning.
- **Copy.** All 28 copy changes from the stamp are in (23 visible, 5 aria or comments), plus one more two-beat aria line fixed in the Lookbook.
- **Unchanged.** The r7.1 intro and cutout, hem matte, floor sparkles, owner-only ₱200, and noindex in both meta and header.

Checks on the live alias (390 and 1440):
- 200 with noindex, nofollow, and 0 console errors.
- CLS 0 on load, during the rotator, after scroll, and under reduced motion.
- No taps under 44px. AA has the same six known false positives as r7.1 (blend-mode titles and text on the ox band).
- The ₱200 commission shows in Owner only and counts Confirmed, Out and Returned. Customer total = rate × days.

Stills are in `proof-r7/r7.2/`. FPS was not re-run because box load was 11 to 17.

## Round 7.1 (Paige's QA on r7)
Head: `124cc5b`, one text commit on top of `1263dd0` (3 files: `heroAlpha.ts`, `Story.tsx`, `cgr.css`), pushed through the connector with no force-push and no merge. No new binaries, and `mavy-side-spin-alpha.mp4` is unchanged. Deployment `dpl_CdFXY6HavW3x35fKbLtZv2YxTU6n` was READY at 10:32 PHT on the branch alias.

What changed:
- **Cutout edges and hem smear (shader only).** The alpha v2 colour plate is straight alpha: it keeps a grey haze where the matte is 0. r7 clamped colour to alpha as if premultiplied, which lifted that haze into the pink-grey smear under the hem. The shader now multiplies colour by alpha. It also applies three soft masks:
  - Sides: alpha eases to 0 over the left 16% and the right 9%. She walks in from the left edge of the source and the cape leaves the frame there during the spin, which drew the hard vertical cut near x≈570 at 1440. The walk-in now emerges from the dark.
  - Top 3% and bottom 8%.
  - A hem key in the lower 30% that drops semi-opaque, desaturated floor haze but keeps opaque gown pixels and saturated veil edges.
  - Checked at 10 scroll points from 0 to 100% at 1440 and 390, not just 60%.
- **Phone placement.** `.cgr-mavy` is centred at 43% of the stage (it was `left: 30.8vw`), so after the 13vw glide she lands at about 56%. She is fully in frame at 360, 390 and 430 and still in front of GOWNS. GSAP owns `transform`, so the offset is a `calc()` on `left`, not a CSS `translate`.
- **Accent.** Hot pink `#ff4f9e` is replaced by vermilion `#e8452c`. Ink on it is 4.96, it is 5.32 on black, and on oxblood it is 3.72, so it is used for large text only. It is never used as text on cream (3.25). The two small accent texts on oxblood (form label focus and the "date taken" status) are now cream, with an accent underline on the status.
- **Sample bar.** It is now a quiet line: cream-2 mono on black, 24px tall (was 30), with a hairline rule and no bold. It still reads "SAMPLE | NOT LIVE · …".
- **Hero captions.** The mono caption "sample render, mavy… x.xs / 8.0s" and its clock are removed. The "8.0s / 8.0s, facing front…" line under the landing copy is removed too, because it is the same render caption. Their GSAP hooks and CSS are removed as well.
- **Grain on dark.** Dark and oxblood sections now use a white-grain variant of the same inline SVG noise (screen at 0.07). The r7 dark grain used black grains under `screen`, so it was invisible. This is CSS only, with no binary and no animation.

Proof (preview alias, 124cc5b): `proof-r7/r7.1/`
- Intro stills at 360, 390, 430 and 1440, each at 0, 30, 60 and 100%.
- `_checks.json`, plus confirmation stills.
- Results:
  - 200 with `noindex, nofollow` in both the header and meta.
  - 0 console errors.
  - CLS 0 on load and after scrolling.
  - Customer total = rate × days (3 × ₱2,500 = ₱7,500).
  - ₱200 appears only in Owner: Confirmed, Out and Returned show ₱200, Pending and Cancelled show ₱0.
  - No taps under 44px.
  - No accent-on-cream text.
  - Reduced motion is static.
  - The only AA flags are the same six as r7. They are probe false positives: the probe reads the cream section behind the oxblood SVG band in the cover flow, and the mood-board title uses `difference` blend.
- FPS was not rerun because the box load was 12.4 from an unrelated job.

Known gaps:
- The cape really does leave the source frame, so it fades out rather than being reconstructed.
- A few small dark matte holes near the hem in the spin read as black on the black stage.
- Sequins inside the opaque gown are kept, but loose glints in the floor haze are dropped along with it.

## Round 7 ("cut it loose", Design's r7 stamp)
Head: `1263dd0`. The r7 commits sit on top of `a19418b`: `309a906`, `a34871a`, `a0119ae`, `6533512`, `5df12c2` and `1263dd0`. Everything is text and was pushed through the connector, with no force-push and no merge. The Mavy cutout `mavy-side-spin-alpha.mp4` is unchanged. Deployment `dpl_HfD4Hn4QKiYTkaCv4RgvVx439cJr` was READY at 10:09 PHT on the branch alias. `309a906` built ERROR as an intermediate state because its components needed the later commits.

What changed:
- **Type:** Archivo (variable; display at 900 wdth 125, and wdth 78 for GOWNS on phone), Space Mono (lowercase meta at 11–12px; prices in mono with ₱ in the face) and Mrs Saint Delafield, used only for "for your debut" and "see you". All three load through `next/font/google`. Bodoni, Cormorant and Jost are removed.
- **Intro:** black stage, GOWNS bleeding off the edge behind Mavy's alpha canvas, a magnetic "see the gowns" circle, and an oxblood S-curve breakout under her hem with "Rent the gown. / *Keep* the night." The scrub, seek and `heroAlpha.ts` are unchanged.
- **Mood board:** replaces the catalogue grid as the first view. It uses OS-window gown cards; desktop has drag (GSAP Draggable) and phone has a pile with "Tap to shuffle". The title is cream with `mix-blend-mode: difference`.
- **Cover flow:** sits in a rotated oxblood band. The active card has a hard hot shadow, with a centred caption, a counter and prev/next text links.
- **Detail:** an organic photo edge and a two-layer name that changes colour at the photo edge. The lens replaces the ring cursor.
- **Booking:** a calendar with the booked days struck through. The customer total is rate × days with **no fee row** (this corrects r6). ₱200 appears only in OwnerView: Confirmed, Out and Returned count it, Pending and Cancelled are ₱0.
- **Removed:** the ring cursor, the serif marquee and the tracked uppercase eyebrows. Every section boundary is now an SVG curve, band or cap.
- **Fixes after the stamp build:**
  - `5df12c2` gives short header links (Visit) a 44px-wide hit area.
  - `1263dd0` sets `display: "block"` for Archivo and Space Mono. The stamp's `swap` caused a cold-load shift of up to 0.005 at 1440.

FPS on the live preview at **4x CPU**, average of 3 runs (p95 frame range in brackets):

| Run | Intro scroll | Mood board | Cover flow drag |
|---|---|---|---|
| Phone 390 | 44.5 (50–83ms) | 42.5, shuffle taps (50–67ms) | 45.4 (33–67ms) |
| Desktop 1440 | 44.3 (67–100ms) | 21.8, window drags (83–117ms) | 25.6 (83–100ms) |

Load average was **15.1–17.0 on 8 cores** during these runs, because an unrelated job was using about 6 cores. The r6 runs had a load of 0.5–2.1, so these numbers are not comparable with r6 and will read low. Both runs used headless Chrome on SwiftShader (no GPU). Long tasks: at most one per run, max 60ms.

Checks on the live preview at 390 and 1440, logged out:
- HTTP 200, with the `X-Robots-Tag` header and meta both `noindex, nofollow`. The SAMPLE | NOT LIVE bar is present.
- 0 broken images, 0 console errors and 0 bad responses. CLS is 0 on load, after a full scroll, and on the detail page.
- 0 taps under 44px on home, detail, reserve, confirmation and owner. 0 pink-on-cream text.
- AA:
  - 0 failures on detail, reserve, confirmation and owner.
  - The home flags are on the cover flow text, which sits on the oxblood SVG band while the section's computed background is cream. The real pairs are cream on oxblood, which pass AA.
  - The mood board title flag comes from the difference blend.
- Fonts loaded: Archivo, Space Mono and Mrs Saint Delafield. No banned fonts are loaded.
- Flow: detail → reserve (24–26 Nov) → `CGR-XXXX` ref → owner. "3 days at ₱2,500" totals ₱7,500 on both reserve and confirmation, and ₱200 appears only on the owner page.
- Reduced motion: static landed frame drawn to a canvas, no running animations, 0 console errors.

Known gaps:
- The mood board title uses difference blend as the stamp specifies, so its contrast over photos varies.
- Next `_rsc` prefetches abort during client navigation (`ERR_ABORTED`). They are harmless, and all responses are OK.
- Under reduced motion, Chrome aborts the mp4 metadata range request, which is expected with `preload="metadata"`.
- FPS was measured under heavy box load (see above). The desktop mood board and cover flow numbers need a rerun on a quiet machine.
- Asset limits: the veil is cut at the clip edge, the hem has a dark matte, and the grain is invisible on dark surfaces.

## Round 6 (couture style pass, Mavy cutout on)
Head: `fcb21fa` (r6 commits `9617a64`, `13a95a9`, `ae5868f`, `a72a733`, `5d6510d`, `fcb21fa` on top of `ee96d31`, Apple Dev's 540×1920 alpha cutout). Text only, pushed via the connector in three steps (tokens/fonts, components, motion), no force-push, no merge. Deployment `dpl_965aoPMYDEMdFZb6nN6wPhNngKRb` READY 08:49 PHT on the branch alias. Built to Design's r6 stamp and frames.

What changed:
- **Type:** Bodoni Moda (display, GOWNS, headings, marquee italic), Cormorant Garamond (body and prices, latin-ext so ₱ renders in the face) and Jost (labels, .22em). Loaded via `next/font/google`; no font files in the repo.
- **Colour and frames:** black stage, ivory `#F3ECE0`, champagne `#C8B183` hairlines. Radius 0 everywhere except the hero arch, no shadows, 1px frames, 12-column grids. Price line "from ₱2,200 a day".
- **Removed:** stickers, pills and chips; the "Rent me" cursor; `ripple.ts` and its CoverFlow hook.
- **Added:** a fine champagne ring cursor (fine pointers only, hidden on touch and under reduced motion); a full-screen phone menu.
- **Marquee:** one Bodoni italic line, ~90s per loop, paused on hover and off screen, static under reduced motion.
- **Motion:** 900ms masked fades on `cubic-bezier(.22,1,.36,1)`, stagger capped at 3; cover flow 24° tilt with shallow depth; lookbook flip 1100ms. Intro beats and seek logic unchanged.
- **HERO_ALPHA = true** (Mark approved the cutout). The 540×1920 stacked-alpha file draws to a transparent WebGL canvas sized from its real dimensions (540×960). The arch interior is transparent so GOWNS sits behind her. There is no second hem fade because the file already fades its matte over the bottom 80px. Reduced motion and no-WebGL keep the static poster.
- **Kept:** the booking flow, owner view and ₱200 logic (counted for Confirmed, Out and Returned), the SAMPLE | NOT LIVE bar and noindex, CLS 0, 44px taps, AA, and the reduced-motion fallbacks.

FPS (avg of 3 intro runs), live, **4x CPU on both viewports**, r5 (`68bec7c`) → r6 (`fcb21fa`, alpha on):

| Run | Intro | Cover flow | Lookbook flip |
|---|---|---|---|
| Phone 390 | 40.8 / 56.5 / 60 → 60 / 60 / 60 (p95 16.8ms) | 60 → 60 | 59.5 → 59.5 |
| Desktop 1440 | 48.4 / 55.1 / 55.6 → 58.9 / 58.9 / 59.4 (p95 16.7ms) | 60 → 60 | 59.2 → 60 |

Load average 0.5–0.8 (r5 run) and 0.5–2.1 (r6 run). Headless Chrome on SwiftShader (no GPU).

Checks on the live preview at 390 and 1440, logged out:
- 200 with `X-Robots-Tag` and meta set to `noindex, nofollow`. SAMPLE bar present.
- 0 broken images, 0 console errors, 0 failed requests. CLS 0 on load and after a full scroll.
- 0 taps under 44px, including the detail, reserve and owner pages. 0 AA failures (172 / 159 text nodes checked).
- Fonts loaded: Bodoni Moda, Cormorant Garamond and Jost. ₱ is in a loaded Cormorant face, and labels track at .22em.
- Removed items: 0 chips, pills or stickers, no "Rent me", no ripple canvas, radius 0. Marquee: 1 row at 90s. Cover flow max tilt 24°. Ring cursor visible on desktop and hidden on phone.
- Flow: Debut filter → detail → reserve → `CGR-XXXX` ref → owner. Commission is ₱200 for Confirmed, Out and Returned, and ₱0 for Pending and Cancelled.
- Reduced motion: no video, poster shown, marquee static.

## Round 5 (full dark, GOWNS fixes, chip/pill placement, alpha canvas path, perf)
Head: `68bec7c` (r5 commits `6c8c5bc`, `68bec7c` on top of `aa92f94`). Text only, pushed via the connector, no force-push, no merge. Deployment `dpl_9gHr3B1Vte4TK7VE7FRAUcUgJppX` is READY on the branch alias.

**Done when (r5):** the whole `/demos/cgr-rentals` experience (header, intro, lookbook, how-a-hold-works, catalogue, detail, reserve, owner, reduced motion) is dark at 390 and 1440 with AA passing. GOWNS reads once at every scroll position and is never chopped. The "Sample render" pill and the "Rent now" chip never cover the word, her head or the tagline. The lookbook flip and the intro run smoothly on phones.

What changed:
- **Full dark:** `--bg #000`, dark cards (`#141013`), header, bar, footer, inputs, bento, lookbook faces and the steps section are now dark, with `color-scheme: dark`. The load frame no longer has a white header.
- **Pill:** "Sample render" is in the bottom-left corner (12px) and fades out at the front beat.
- **Rent chip:** on desktop it sits right of her at mid height and is clear of "Hold the date" at 1280, 1440 and 1920. On phone it moved up to 22% so it clears the tagline at 6s.
- **GOWNSGOWNS (phone 5.5s):** the root cause was not a duplicate node or marquee clone. There is one `.cgr-intro-word` node. The r4 entry tween (scale 1.25 + xPercent 8) made the word about 485px wide on a 390px stage. At rest it filled exactly 100vw and was cropped at both edges, so it read as a repeating band. Fix: tween scale 0.92→1 with no x shift, and a 21vw size. Checked: 1 node and 0 glyph overflow across 92 scroll samples at 390, 1280, 1440 and 1920.
- **"GC VS" (desktop):** the clip frame had a `#000` background that the feathered mask exposed, which hard-cut the letters. Fix: transparent frame, a head ∪ body ellipse mask with a floor fade, and the word set high so the letters read around her head.
- **HERO_ALPHA canvas path (OFF):** `const HERO_ALPHA = false;` and `HERO_ALPHA_SRC = /demos/cgr-rentals/mavy-side-spin-alpha.mp4` in `Story.tsx`, plus a new `heroAlpha.ts`. It uses WebGL with stacked alpha: colour from the top half, luma matte from the bottom half, drawn on each video frame and scrubbed by the same seek logic. When off, the current clip is used and the page makes no extra requests. It was tested locally only, with a synthetic ffmpeg test clip that is not in git. It works (canvas 540×960, GOWNS behind her head) at 55 fps on phone 390 and 48 fps on desktop 1440 while scrolling.
- **Perf:** the WebGL ripple is off on touch/coarse pointers and on low-end devices (`hardwareConcurrency ≤ 4`, `deviceMemory ≤ 4` or `prefers-reduced-data`), which get the CSS fallback. The lookbook flip animates transform and opacity only, with `will-change` set only while flipping, and no box-shadow, filter or layout animation. The intro float step batches reads before writes, and clip seeks stay rAF-throttled.

**Alpha mp4 spec (for the export):** 540×1920 stacked, made of two 540×960 (9:16) halves with no padding. The top half is colour on black. The bottom half is a greyscale matte where white means opaque. Encode as H.264 High, level 4.0, yuv420p, 24 fps, 8.0s, GOP 6 (`-g 6 -keyint_min 6 -sc_threshold 0`), `-bf 0`, `+faststart`, no audio, CRF about 20 (about 2–4 MB). Save it as `public/demos/cgr-rentals/mavy-side-spin-alpha.mp4`, then set `HERO_ALPHA = true`.

FPS (avg, 3 intro runs), BEFORE r4 → AFTER r5:

| Run | Intro | Cover flow | Lookbook flip |
|---|---|---|---|
| Local phone 390, 4x CPU | 43–60 → 38–53 (load 5.7–7.3) | 56–60 → 60 | 60 → 59.1 |
| Local desktop 1440 | 48–56 → 45–51 (load 5.7–7.3) | 60 → 60 | 40 (p95 66ms) → 58.8 (p95 16.8ms) |
| Live phone 390, 4x CPU | 21–24 → 41–59 | 37–53 → 60 | 26 → 58.7 |
| Live desktop 1440 | 22–30 → 48–51 | 41–49 → 60 | 10 → 59.3 |

The r4 live numbers were measured at load 8–13. The r5 live numbers were measured at load 1.5–1.7 (02:00 PHT).

Checks on the live preview, logged out:
- 200, with `X-Robots-Tag` and meta set to `noindex, nofollow`.
- The SAMPLE bar is present.
- 0 broken images and 0 console errors.
- CLS 0, and all taps are at least 44px.
- AA contrast: 0 failures across 18 page/viewport/motion combinations.
- Flows pass: filters, detail, booked/free dates, `CGR-XXXX` refs, and ₱0 → ₱200 after Confirmed, which persists after reload.
- Reduced motion shows a static poster on black, with no video and CLS 0.
- Only `mavy-side-spin-web.mp4` is requested.

## Round 4 (black intro clip, cover flow, lookbook)
Head: `aa92f94` on top of Apple Dev's `f3ea62e` (clip + poster) and `be31d85` (13 webp). Round 4 code commits: `932da2e`, `0b8f45b`, `e9ce18e`, `aa92f94`. These are text only, pushed via the connector, with no force-push. Deployment `dpl_JV7TrvWSg2BiyfCEqdXc9tpRFF6i` is READY on the branch alias.

**Done when (r4):** a logged-out visitor scrolling `/demos/cgr-rentals` sees a black stage where Mavy walks in from the left, spins, and faces front. As she turns, the serif word, floating cards and copy arrive, and the arch settles into a bento grid. Gowns browse as a 3D cover flow with drag/scroll/swipe/keys. Accessories open as a page-flip lookbook. Booking, the owner view and the ₱200-per-confirmed count are unchanged.

### What changed
- **Intro:** full-black section. `mavy-side-spin-web.mp4` (8 s, 720×1280, GOP 6, faststart) is scrubbed on scroll. 0–1 s spotlight, 1–3 s walk-in, 3–5 s spin, 6 s+ faces front; the reveal runs 5–8 s.
  - Arch mask, with edges and the floor blended into black.
  - Huge serif **GOWNS** word.
  - Parallax cards (sequin, tiara, ₱ badge, Rent now).
  - The arch shrinks into a bento cell (top gowns, date check, accessories).
  - On phone the video fills the height; on desktop it is offset with content in the sides.
- **Clip switch:** `const HERO_CLIP = true;` in `src/components/demos/cgr-rentals/Story.tsx` (`false` = still poster only, no mp4 request).
- **Gowns:** CSS-3D cover flow, plus a small hand-written WebGL fabric/sequin ripple on hover (CSS fallback). No vendor SDK.
- **Cursor:** a gold ring that grows into "Rent me" over gowns, fine pointers only. Touch keeps native taps of at least 44px.
- **Accessories:** CSS-3D lookbook page flip (tap/drag/buttons).
- **Motion:** kinetic marquee (Gowns · Debut · Prom · Wedding · Cavite) and staggered fade-up reveals on the catalogue and booking steps.
- **r3 fixes:**
  - One set of hours (Mon–Sun · 9:00 AM – 8:00 PM), and the "listings disagree" note is gone.
  - Desktop hero sides are filled.
  - Poster overflow at 900px is fixed.
  - No "Sample render" label over a still.
- **Reduced motion:** static black hero with `mavy-poster.jpg`, the arch, the word and the bento. No video element, no mp4 request, no flip or ripple.

### Round 4 proof (live preview, logged out)
| Check | Result |
|---|---|
| Page | 200, `x-robots-tag: noindex, nofollow` + robots meta |
| Clip | mp4 206/200 `video/mp4`, 2,258,613 bytes; scrub hits 0.5/1.99/3.98/5.47/5.96/7.16/7.95 s at the timeline stills |
| Reduced motion | `mavy-poster.jpg` only (200 image/jpeg), mp4 never requested |
| Broken images | 0 |
| Console errors | 0 |
| AA contrast | 0 failures across 18 page/state combos |
| Tap targets | 0 under 44px |
| CLS | 0 on load and full scroll at 390 and 1440 |
| Flows | Debut 2 / Blue 3 filters; booked date "Not available"; `CGR-XXXX` ref; owner ₱0 pending to ₱200 confirmed, kept after reload; date blocked after booking; ₱200 never on customer pages |

**FPS (intro / cover flow / page flip):**
| | Phone 390×844, 4× CPU throttle | Desktop 1440×900 |
|---|---|---|
| Local prod build | 43–60 / 56–60 / 60 | 48–56 / 60 / 40 |
| Live preview (test machine under heavy load) | 21–24 / 37–53 / 26 | 22–30 / 41–49 / 10 |

The test machine has no GPU and was loaded by another job during the live run, so a real-phone check is still needed before sign-off.

**Stills:** 66 files on the box in `/workspace/cgr-rentals/proof-r4/`. They cover the intro timeline at 390 and 1440, cover flow at rest and mid-drag, ripple + cursor, the lookbook closed/mid-flip/open, the marquee, reveals, reduced motion, and the flow shots. The connector can't upload images, so they are listed by path.

**Known gap:** there is no cutout of her from the clip, so GOWNS can't pass behind her. On phone the word sits above her head; on desktop only the faded clip edges overlap it. Paige's background removal would fix this.

**Risk (r4):**
- Data/migrations: No
- Auth/secrets: No
- Permissions: No
- Third-party SDK: No
- Deletes: No
- Store text/privacy: No
- New binary media: Yes, the two clip files in `f3ea62e`, cleared by Mark
- Rollback: set `HERO_CLIP = false` or revert `aa92f94`…`932da2e`

The "Photos + hero clip (pending: Apple Dev)" section below is superseded: the photos are in `be31d85` and the clip is in `f3ea62e`.

## Round 3 (scroll story + 360 hero clip)
Head: `67dcdec` (text pushed via connector). The 13 webp files and the hero mp4 are binaries that Apple Dev pushes (see Photos below).

1. **Scroll-story opener** (`Story.tsx`, same GSAP + ScrollTrigger + `@gsap/react` pattern as Maxicon):
   - The stage is pinned with CSS `position: sticky` under the SAMPLE bar. There's no JS pin, so phones don't reposition.
   - One scrubbed timeline (`scrub: 0.5`) runs four steps:
     - **01** "Rent the look. Hold the date."
     - **02** Pageant red: bodice, lace and sequin-train crops rise in with depth parallax.
     - **03** Debut blue: the hero dims and three blue ball-gown crops come in.
     - **04** Finish it: tiaras and crowns.
   - Progress dots track the step.
   - Only `transform` and `opacity` animate (`autoAlpha`, so hidden steps can't be tapped).
   - The first frame is set in CSS before hydration, so there's no flash and **CLS stays 0**.
   - "Browse gowns" and "Accessories" (44px) are on steps 1 and 4.
   - The CGR page now sets `scroll-behavior: auto`, like the Maxicon page. The site-wide `smooth` setting made programmatic scrolls ease, and the scrub lagged behind.
2. **Hero 360 clip (scroll-scrubbed).**
   - `public/demos/cgr-rentals/cgr-gown-360-web.mp4` shows a faceless mannequin in the red sequin gown, turning one full 360° over the story. `gown-red-full.webp` is the poster and fallback frame.
   - It is configured in `Story.tsx`:
     ```ts
     export const HERO_VIDEO = { src: `${CGR_ASSET}/cgr-gown-360-web.mp4`, mode: "scrub" };
     ```
   - It is `muted`, `playsinline` and `preload="auto"`, with a fixed 540×960 box (9:16), so CLS stays 0.
   - Seeks are rAF-throttled, with one in flight at a time. A seek stuck for more than 250 ms is replaced, and the clip catches up on `seeked`. iOS gets a `play().then(pause)` unlock.
   - A **"Sample render"** label sits on the clip.
   - **With reduced motion it's the poster image only.** There is no `<video>` element, no autoplay and no label.
   - `mode: "loop"` (muted, playsinline autoplay loop) is still available as a one-word switch, and `src: null` gives poster only.
3. **Commission unchanged:** a booking counts once it's Confirmed, and stays counted when it's later Out or Returned.

### Clip encode (the ffmpeg recipe)
- **Source:** the delivered `cgr-gown-360-web.mp4`.
  - 720×1280, 24 fps, 8 s, 192 frames, 3.47 MB.
  - It has **2 B-frames** with a GOP of 12, which seeks slowly.
- **Shipped re-encode:** 540×960, GOP 8, no B-frames, no audio, faststart.
  - Size 1,465,940 bytes.
  - sha256 `465fa83f45456ceb4a2b010d02ef30efc049d39bc6a3054ecfa2f691b4ddce27`.
  - Every 720p variant with a short GOP (6 or 12) came out over 1.5 MB.

```sh
ffmpeg -i cgr-gown-360-web.mp4 -map 0:v:0 -an -sn -dn -map_metadata -1 \
  -vf "scale=540:-2" -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
  -crf 26 -g 8 -keyint_min 8 -sc_threshold 0 -bf 0 \
  -movflags +faststart cgr-gown-360-web.mp4.out
```

To replace the clip later:
1. Run the same command. If it's over 1.5 MB, raise `-crf`.
2. Check it with `ffprobe -show_streams`: there should be one video stream and no audio.
3. Have Apple Dev push it to the same path.

### Scrub vs loop: decision = **scrub**
I measured with `fps.py`: rAF frame times while scrolling through the whole story, plus `PerformanceObserver('longtask')`, `seeked` latency and `requestVideoFrameCallback` frames. There were 5 runs per row, and the results are in `proof-r3/fps-clip-scrub-{600,1800}.json`.

| Run (real clip, scrub) | Avg fps | Max frame | Frames >33 ms | Long tasks | Seeks per pass | Seek p50 / p95 |
|---|---|---|---|---|---|---|
| Phone 390×844 @3x, **4× CPU throttle**, 600 px/s (about 5.2 s) | 60 | 16.8 ms | 0 | 0 | 267–272 | 6–7 / 12–13 ms |
| Phone 4×, 1800 px/s (fast flick, about 1.7 s) | 60 | 16.8 ms | 0 | 0 | 90–92 | 6–7 / 11–12 ms |
| Desktop 1440×900, 600 px/s | 60 | 16.8 ms | 0 | 0 | 286–291 | 8–9 / 13–14 ms |
| Desktop, 1800 px/s | 60 | 16.8 ms | 0 | 0 | 96–98 | 8 / 13–14 ms |

- Every seek presented a frame: the frames presented equal the seek count.
- The as-delivered file (with B-frames) measured seek p50 21–22 ms and p95 33–39 ms on the 4× phone. That's about 3× slower and right at the frame-budget edge, which is why I re-encoded it.
- Earlier poster-only and loop-path runs were also 60 fps with 0 long tasks.
- These are headless Chrome runs on a server, so the phone numbers are emulated, not from a real device.

### Round 3 proof (local, real images + clip, Playwright + Chrome)
Stills are in `/workspace/cgr-rentals/proof-r3/`. There are no videos.
- **Hero and story positions:** `phone-story-{0-load,1-p08,2-p32,3-p56,4-p80,5-p98,6-after}.png` (390×844) and the same set as `desktop-story-*.png` (1440×900).
  - The clip's `currentTime` follows scroll: 0.62 s, 2.54 s, 4.45 s, 6.36 s and 7.79 s at 8%, 32%, 56%, 80% and 98%.
  - The video is `readyState` 4 and paused, so it is scrub-driven.
  - The "Sample render" label is present.
- **Reduced motion:** `{phone,desktop}-reduced-1-opener.png` and `-reduced-full.png` show the poster `<img>` only, with no label.
- **Flows:** `{phone,desktop}-1-catalogue … 6-visit.png`, with results in `proof-results.json` and `story-results.json`.

Results:
- **CLS:** 0 on load and after scrolling the whole story, on phone and desktop, with motion and with reduced motion. The detail page is also 0.
- **Taps:** no visible tap target under 44px on the catalogue, detail or owner pages, or at any story position. The buttons have `min-height: 44px`. At one desktop mid-fade position the two step-4 buttons measured just under 44px (they round to 44), which is sub-pixel rounding.
- **AA contrast:** 0 failures on the catalogue, detail, reserve and owner pages. Noindex meta is present and the SAMPLE bar is on every page.
- **Flows still work:** filters (Debut 2, Blue 3), availability, reserve → `CGR-XXXX`, and owner ₱0 pending → ₱200 confirmed, which persists after reload. 13 distinct images, 0 broken.
- **Until Apple Dev pushes the binaries:** the preview's images are broken, and the hero shows the poster frame because the mp4 404s.

## Round 2 (QA fixes)
1. **Commission off customer pages.** The header "Sample · ₱200 / booking" pill, the catalogue commission card and the reserve/confirmation commission sentences are gone. ₱200 appears only in `/owner`. Checked by script: no "₱200" or "commission" text on catalogue, detail or confirmation (phone + desktop).
2. **Owner total counts confirmed only.** New bookings start Pending and show ₱0; confirming one shows ₱200 and survives reload. A booking later marked Out or Returned stays counted (it was confirmed); Pending and Cancelled never count. The card says so.
3. **Photo-first opener.** Desktop 1440: two columns, copy left, three big photos right (red sequin gown tall, blue ball gown, beaded lace detail). Phone 390: photos come first, at 218–518px on an 844px screen, with the headline below them. The hero has fixed aspect boxes, so CLS stays 0.
4. **Fuller shop.** 12 sample listings, using all 13 crops. **Gowns** has 6 (3 red, 3 blue; reused crops back distinct mock listings) with Debut / Pageant / Formal chips. **Accessories** is its own section with 6 (tiaras, crown, trio, choker, bracelet). Phones get a 2-column grid. Two new tiara crops come from `accessories-tiaras-2.webp` and are face-free.

## What's in it
A flat, mobile-first web app (not a one-pager) at `/demos/cgr-rentals`. All routes are unlisted and noindex. Robots is set in the layout metadata, and `next.config.ts` already sends `X-Robots-Tag: noindex, nofollow` for `/demos/:path*`.

| Route | What it does |
|---|---|
| `/demos/cgr-rentals` | Scroll-story opener (round 3), then **Gowns** (6 listings, filter chips for category, size and color; count updates live) and a separate **Accessories** section (6 listings). |
| `/demos/cgr-rentals/gown/[slug]` | Photo gallery, sample specs, and a 28-day mock availability calendar with a date picker. |
| `/demos/cgr-rentals/reserve/[slug]` | Reservation form that validates dates (no past dates, return on or after the event, no overlap with mock or saved holds). Saving creates a `CGR-XXXX` ref in `localStorage`. |
| `/demos/cgr-rentals/confirmation?ref=` | Shows the reference code and booking summary. |
| `/demos/cgr-rentals/owner` | Owner table with editable status (pending/confirmed/returned/cancelled). Commission = confirmed bookings × ₱200 (statuses confirmed / out / returned; pending and cancelled are not counted). Shows as stacked cards on phones. |
| `/demos/cgr-rentals#visit` | Hours, location, Google Maps link and Messenger link, side by side on desktop. |

Other details:
- The **SAMPLE | NOT LIVE** bar is on every page.
- There is no backend. Data lives only in `localStorage` (`cgr-rentals-bookings-v1`).
- No vendor SDKs. Messenger is a plain `m.me/CaviteGownRentals` link, and no messages are sent.

**Mock data:** all prices, sizes, colors, availability, hold dates and the ₱200 commission figure are mocked sample data, and the UI labels them that way. The hours on CGR's public refs conflict, so the UI says "confirm on Facebook". No phone numbers are shown. No contact with CGR has been made.

## Photos + hero clip (pending: Apple Dev)
- 13 face-free webp crops from CGR's public Facebook page and Maps refs. They are served same-origin from `public/demos/cgr-rentals/`, and attribution is in `public/demos/cgr-rentals/ATTRIBUTION.md`.
- The GitHub connector only takes text, so the binaries are staged on the box at `/workspace/cgr-rentals/images/`. The exact list (repo path, bytes, sha256) is in `/workspace/cgr-rentals/APPLE_DEV.md`:

```
public/demos/cgr-rentals/accessories-tiaras-2.webp
public/demos/cgr-rentals/accessories-tiaras.webp
public/demos/cgr-rentals/accessory-bracelet.webp
public/demos/cgr-rentals/accessory-choker.webp
public/demos/cgr-rentals/accessory-tiara-rose.webp
public/demos/cgr-rentals/accessory-tiara-ruby.webp
public/demos/cgr-rentals/gown-blue-1.webp
public/demos/cgr-rentals/gown-blue-2.webp
public/demos/cgr-rentals/gown-blue-3.webp
public/demos/cgr-rentals/gown-red-bodice.webp
public/demos/cgr-rentals/gown-red-detail.webp
public/demos/cgr-rentals/gown-red-full.webp
public/demos/cgr-rentals/gown-red-skirt.webp
public/demos/cgr-rentals/cgr-gown-360-web.mp4   (round 3 hero clip, 1,465,940 bytes, staged at /workspace/cgr-rentals/push/)
```
**Until these land, the preview shows broken image boxes, and the hero falls back to the poster because the mp4 404s.** Layout is unaffected because every image has fixed width and height, so CLS stays 0.

## Proof (local build with real images, Playwright + Chrome)
Round 2 screenshots are on the box at `/workspace/cgr-rentals/proof-r2/`, as `phone-*.png` (390×844) and `desktop-*.png` (1440×900):
- `1-catalogue`, `1-catalogue-full`, `1b-filter-blue`, `1c-accessories`
- `2-detail`
- `3-availability`, `3-availability-booked`
- `4a-reserve-form`, `4-confirmation`
- `5-owner`
- `6-visit`

Round 1 shots stay in `/workspace/cgr-rentals/proof/`. The connector can't upload images, so they are listed by path. Results (`proof-r2/results.json`):
- **CLS:** 0 on the catalogue and detail pages, on phone and desktop.
- **Taps under 44px:** none on the catalogue, detail or owner pages (inline breadcrumb text links are excluded from the check).
- **Contrast:** AA passes for all text on the catalogue, detail, reserve and owner pages (`contrast.py`, 0 failures).
- **Flow:** reservation produced a `CGR-XXXX` ref. With two pending bookings the owner showed ₱0; confirming one showed ₱200, and the status and total persisted after reload. The booked date then showed as unavailable.
- **Catalogue:** 6 gown cards, 6 accessory cards, 13 distinct images, 0 broken. The Debut filter shows 2, and Blue shows 3.
- `tsc` is clean. `eslint` has 0 errors; the only warnings are the intentional `no-img-element` ones (plain same-origin webp, no image optimizer).

## Second-model review
**Caveat:** the task allowed pstack `/interrogate` or another non-Codex model. No second model or arena subagents were available in this run, so this is an `/interrogate`-style adversarial pass by the building agent. Every finding was reproduced by a script (`/workspace/cgr-rentals/probe.py`, `hydr2.py`) and re-run after the fix. **An independent model review is still open.**

| # | Finding (reproduced) | Fix | Re-check |
|---|---|---|---|
| 1 | Past event date could be saved | `min=today`, past check, submit disabled | Disabled |
| 2 | Return before event could be saved | Date validation, message, submit disabled | Disabled |
| 3 | A range overlapping an existing hold was accepted (only the event day was checked) | `isRangeFree`, which checks for any overlap | "overlaps a hold", disabled |
| 4 | Availability text didn't match between SSR and the client (hydration warning) | `useSyncExternalStore` hooks plus an SSR placeholder | No hydration errors |
| 5 | Lint errors from `set-state-in-effect` and an impure `Date.now` during render | Hooks refactor; server page passes only a validated `?date=` | 0 lint errors |
| 6 | Brand link and status select under 44px; owner table overflowed on phones | `min-height: 44px`; stacked-card table at ≤640px | 0 small taps |
| 7 | Two red-gown crops showed skin (arm/leg) | Recropped to fabric only | Checked by eye |

## Preview (logged-out check)
- **Branch preview:** https://kantoco-git-cursor-cgr-rentals-app-mrkrphls-projects.vercel.app/demos/cgr-rentals
- **Share link:** `?_vercel_share=…` on the branch alias, expires 2026-11-28 14:55 PHT. The token is not posted here because the repo is public; it was sent privately to Mark.
- **Logged-out curl:** `HTTP/2 200` with `x-robots-tag: noindex, nofollow` and `<meta name="robots" content="noindex, nofollow">`. The SAMPLE | NOT LIVE bar is present. The gown, reserve, owner and confirmation pages return 200, and a bad slug returns 404. Image paths return 404 until the Apple Dev commit lands.
- **Round 2:** deployment `dpl_98FR1UTvVQJ45pYEQcFqhfHtvALo` (READY) at head `93bc714`. Logged-out share check: 200, `x-robots-tag: noindex, nofollow`, photo hero present, no ₱200 or commission text on the catalogue; `/owner` and `/gown/ruby-pageant-crown` return 200. Images still 404 until Apple Dev pushes the 13 files.
- Round 1: `dpl_GmrXbdpQTheZGJL5BS6ozU5G72gn` (READY) at `0d4c454`. No Vercel protection settings were changed.

## Risk checklist
- Data/migrations: **No** (browser `localStorage` only)
- Auth/secrets: **No**
- Permissions: **No** (no Vercel protection changes; a share link is used)
- Third-party SDK: **No** (plain links to Maps and Messenger)
- Deletes: **No** (only adds files; `cursor/cgr-gowns` untouched)
- Store text/privacy: **No** (no store listing; noindex/nofollow; sample labels; no real customer data)
- Rollback: **Yes, trivial.** Close the PR or delete the branch. Nothing touches master or production.

Draft. No merge, no production deploy, no contact with CGR.
