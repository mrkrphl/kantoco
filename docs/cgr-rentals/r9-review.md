# r9 second-model review (local, free)

Reviewed without a paid model or cloud agent (hard rule: $0). Checklist against Chip's brief:

## Catalogue
- Owner CRUD via RPCs; Storage bucket `cgr-catalogue` public-read / owner-write; client compress before upload.
- Public Rail + gown pages read `list_catalogue` / `get_catalogue_item` (available only). Hardcoded GOWNS remain fallback if DB empty.
- Prices optional; blank stays hidden on public (pricePerDay 0). Existing seed rates were already in DB from r8.1 — not newly invented.
- Remove blocked when pending/confirmed/out bookings exist (RPC + unit test).

## Owner site
- Bottom tabs: Today, Bookings, Catalogue, Fitting times.
- Bookings: phone digit search; Call / Messenger-or-Text taps; one-tap New→Confirmed→Picked up→Returned (+ Cancel).
- Status label pending → "New".

## Attribution + commission
- source + UTM columns on reservations; captured from `?src=` / UTM into sessionStorage then create_reservation.
- admin_commission(month) returns monthly count × ₱200 + rows; CSV at `/owner/export?kind=commission`. Owners never get the RPC.

## Conversion
- Gown detail note: "Free on your date" when clear; "Reserve online, get first pick of fitting slots".
- Confirmation page already shows a large ref for screenshots.
- `/demos/cgr-rentals/shop-link` QR generated in-browser with free `qrcode` package (no paid QR API).

## Skipped / blocked
- **New-booking email:** allowlist would be kantoco.ph@gmail.com + +cgr-invite-test only. Stopped before configuring Gmail SMTP or any credentialed sender (would need Mark's SMTP secret). No mail sent this round.
- **No password** created for kantoco.ph@gmail.com. Owner UI stills use a local harness (same as r8.4 wrapfix).
- **No new binary media** committed.

## Risks to watch
- Public catalogue depends on publishable key + RPC; if env missing, falls back to hardcoded GOWNS (look preserved).
- QR links the branch preview host; production domain later needs the same shop-link URL updated.
- Accessories-as-add-ons on gown detail / Reserve form is partial: accessories remain catalogue items; full add-on picker on Reserve is a follow-up.

## r9.1 follow-up (local free review)

- Tab bar clearance: `--tab-h` + `padding-bottom` on `.pg` including safe-area.
- Dev indicator off (`devIndicators: false`).
- Catalogue form stacked at 390; slug auto; bucket line removed; remove confirm; list actions on one row.
- #6 root cause: r9 stills used a 2-item local harness, not `list_catalogue` / `owner_list_gowns`. DB already had 16 available. Harness now loads the public list RPC.
- 0995 → 0927: `0995 477 1665` was added in commit `af839a43` (30 Oct 2026, “from the shop's Facebook page”). Public Maps/aggregator listing checked read-only shows **0977 087 8589** and **0927 447 0021**; 0995 was not found on that listing, so footer now uses 0977 + 0927 only.
- Sticky gown CTA: padding under `.r11-gd` / `.r11-lower` + scroll-margin on `#dates`.
- Accessory add-ons: picker on gown detail + Reserve; stored on reservation; owner card shows plain words; prices only when owner-set.
- Shop-link: go-live URL swap note on the page and in PR notes.
- SMTP still OFF.
