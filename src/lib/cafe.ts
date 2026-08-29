export const cafe = {
  name: "Concordia's Cafe",
  lockup: "CONCORDIA'S CAFE - BF HOMES",
  tagline: "OUR HOME, YOUR HOME",
  addressLine: "106 Aguirre Ave, BF Homes",
  addressFull: "106 Aguirre Ave, BF Homes, Paranaque",
  hoursLine: "DAILY 7AM-12MN",
  hoursPlain: "Daily, 7am-12mn",
  phoneDisplay: "0962 884 3971",
  phoneHref: "tel:+639628843971",
  facebook: "https://www.facebook.com/concordiascafe",
  instagram: "https://www.instagram.com/concordiascafebf/",
  instagramHandle: "@concordiascafebf",
  mapsQuery:
    "https://www.google.com/maps/search/?api=1&query=106+Aguirre+Ave+BF+Homes+Paranaque",
  mapsEmbed:
    "https://maps.google.com/maps?q=106%20Aguirre%20Ave%2C%20BF%20Homes%2C%20Para%C3%B1aque&z=16&output=embed",
  disclaimer: "Demo site by KantoCo — sample only. Not real client work.",
  lookPass: "SAMPLE | look pass | not live",
  photoCredit: "photo: Zoy to the World | public visitor ref",
} as const;

export const walkIn = [
  {
    key: "facade",
    src: "/demos/concordias-cafe/night-facade.webp",
    alt: "Night storefront of Concordia's Cafe on Aguirre Ave. Photo: Zoy to the World.",
    kicker: cafe.tagline,
    title: "106 AGUIRRE",
    line: cafe.lockup,
  },
  {
    key: "open",
    src: "/demos/concordias-cafe/al-fresco.webp",
    alt: "Glass entry and patio at Concordia's Cafe. Photo: Zoy to the World.",
    kicker: "THE GLASS",
    title: "OPEN",
    line: cafe.hoursLine,
  },
  {
    key: "interior",
    src: "/demos/concordias-cafe/day-interior.webp",
    alt: "Daylight interior of Concordia's Cafe. Concrete, white steel, fluted tables. Photo: Zoy to the World.",
    kicker: "INSIDE",
    title: "COME IN",
    line: "Pet-friendly. Photobooth. Come hang.",
    italic: true,
  },
] as const;
