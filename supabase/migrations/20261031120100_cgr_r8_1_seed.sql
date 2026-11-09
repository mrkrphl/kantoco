-- r9.2: prices left null (never verified word-for-word on CGR public listings).
-- r9.3: accessory photos stay empty (no uncropped source in repo; see 20261109250000).
-- CGR r8.1 seed: the live catalogue (src/lib/cgr-rentals.ts at 3f6dfab), its old slugs, and the 4 current fitting times.
insert into public.gowns (slug, name, price_per_day) values
  ('red-sequin-evening', 'Wine sequin slit gown', null),
  ('teal-puff-sleeve-gown', 'Teal puff sleeve gown', null),
  ('navy-gold-sequin-gown', 'Navy gold sequin gown', null),
  ('royal-blue-mermaid-gown', 'Royal blue mermaid gown', null),
  ('powder-blue-tulle-gown', 'Powder blue tulle gown', null),
  ('periwinkle-cape-gown', 'Periwinkle beaded cape gown', null),
  ('violet-gold-beaded-gown', 'Violet gold beaded gown', null),
  ('lilac-floral-tulle-gown', 'Lilac floral tulle gown', null),
  ('ivory-ball-gown', 'Ivory ball gown', null),
  ('black-gold-filipiniana', 'Black and gold Filipiniana', null),
  ('gold-crystal-tiaras', 'Gold crystal tiara', null),
  ('ruby-pageant-crown', 'Ruby pageant crown', null),
  ('rose-stone-tiara', 'Rose stone tiara', null),
  ('crown-display-set', 'Stone tiara trio', null),
  ('crystal-choker', 'Crystal choker', null),
  ('crystal-bracelet', 'Crystal bracelet', null);

insert into public.gown_aliases (alias, slug) values
  ('red-sequin-column', 'navy-gold-sequin-gown'),
  ('blue-ball-gown', 'royal-blue-mermaid-gown'),
  ('blue-ruffle-debut', 'powder-blue-tulle-gown'),
  ('blue-sash-cotillion', 'periwinkle-cape-gown');

insert into public.fitting_slots (slot) values ('10:00'), ('13:00'), ('15:00'), ('17:00');

-- Owner allowlist (Mark, 31 Oct: "Owner login: kantoco.ph@gmail.com, email and password").
insert into public.owners (email) values ('kantoco.ph@gmail.com');
