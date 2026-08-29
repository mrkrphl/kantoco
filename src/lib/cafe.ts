export const cafe = {
  name: "Concordia's Cafe",
  lockup: "CONCORDIA'S CAFE — BF HOMES",
  tagline: "OUR HOME, YOUR HOME",
  addressLine: "106 Aguirre Ave, BF Homes",
  addressFull: "106 Aguirre Ave, BF Homes, Paranaque",
  hoursLine: "DAILY 7AM–12MN",
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

export const plates = [
  {
    key: "pancake",
    title: "3-layer pancake",
    src: "/demos/concordias-cafe/pancake.webp",
    alt: "Three-layer pancake with cream and fruit at Concordia's Cafe. Photo: Zoy to the World.",
    note: "Fluffy stack. Morning on Aguirre.",
  },
  {
    key: "bangus",
    title: "Bangus belly bowl",
    src: "/demos/concordias-cafe/bangus.webp",
    alt: "Bangus belly bowl with garlic rice and eggs at Concordia's Cafe. Photo: Zoy to the World.",
    note: "Thick milkfish, garlic rice, two eggs.",
  },
  {
    key: "kaldereta",
    title: "Cheesy kaldereta",
    src: "/demos/concordias-cafe/kaldereta.webp",
    alt: "Cheesy kaldereta bowl at Concordia's Cafe. Photo: Zoy to the World.",
    note: "Tender beef under a toasted cheese lid.",
  },
  {
    key: "angus",
    title: "Angus beef cheese burger",
    src: "/demos/concordias-cafe/angus.webp",
    alt: "Angus beef cheese burger and fries at Concordia's Cafe. Photo: Zoy to the World.",
    note: "Thick patty. Soft bun. Salty fries.",
  },
] as const;
