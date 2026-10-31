-- CGR r8.1 seed: the live catalogue (src/lib/cgr-rentals.ts at 3f6dfab), its old slugs, and the 4 current fitting times.
insert into public.gowns (slug, name, price_per_day) values
  ('red-sequin-evening', 'Wine sequin slit gown', 2500),
  ('teal-puff-sleeve-gown', 'Teal puff sleeve gown', 3200),
  ('navy-gold-sequin-gown', 'Navy gold sequin gown', 2200),
  ('royal-blue-mermaid-gown', 'Royal blue mermaid gown', 3000),
  ('powder-blue-tulle-gown', 'Powder blue tulle gown', 3200),
  ('periwinkle-cape-gown', 'Periwinkle beaded cape gown', 2600),
  ('violet-gold-beaded-gown', 'Violet gold beaded gown', 2700),
  ('lilac-floral-tulle-gown', 'Lilac floral tulle gown', 2400),
  ('ivory-ball-gown', 'Ivory ball gown', 3500),
  ('black-gold-filipiniana', 'Black and gold Filipiniana', 2800),
  ('gold-crystal-tiaras', 'Gold crystal tiara', 500),
  ('ruby-pageant-crown', 'Ruby pageant crown', 650),
  ('rose-stone-tiara', 'Rose stone tiara', 550),
  ('crown-display-set', 'Stone tiara trio', 1200),
  ('crystal-choker', 'Crystal choker', 300),
  ('crystal-bracelet', 'Crystal bracelet', 250);

insert into public.gown_aliases (alias, slug) values
  ('red-sequin-column', 'navy-gold-sequin-gown'),
  ('blue-ball-gown', 'royal-blue-mermaid-gown'),
  ('blue-ruffle-debut', 'powder-blue-tulle-gown'),
  ('blue-sash-cotillion', 'periwinkle-cape-gown');

insert into public.fitting_slots (slot) values ('10:00'), ('13:00'), ('15:00'), ('17:00');

-- Owner allowlist (Mark, 31 Oct: "Owner login: kantoco.ph@gmail.com, email and password").
insert into public.owners (email) values ('kantoco.ph@gmail.com');
