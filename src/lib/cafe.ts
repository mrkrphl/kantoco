export const cafe = {
  name: "Concordia’s Cafe",
  shortName: "Concordia’s",
  address: "106 Aguirre Ave, BF Homes, Parañaque",
  hours: "Daily · 7:00 AM – 12:00 MN",
  hoursShort: "7am–midnight",
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
} as const;

export const dayChapters = [
  {
    clock: "07:00",
    title: "First pour",
    body: "Spanish lattes, flat whites, and the Aguirre morning — before the village fully wakes.",
  },
  {
    clock: "12:00",
    title: "Pasta hour",
    body: "Carbonara, truffle, marinara. Plates that hold a table through the long BF Homes afternoon.",
  },
  {
    clock: "19:00",
    title: "Steak on the table",
    body: "Marbled ribeye when the avenue turns gold. An all-day cafe that actually means all day.",
  },
  {
    clock: "23:00",
    title: "Last slice",
    body: "Pistachio, tiramisu, honeycomb cheesecake — cakes until midnight. The village is still out.",
  },
] as const;

export const menuHighlights = [
  {
    key: "coffee",
    title: "Coffee",
    image: "/demos/concordias-cafe/coffee.png",
    alt: "Demo still of a Spanish latte — generated for this sample, not cafe photography.",
    items: [
      "Spanish latte",
      "Flat white",
      "Lotus latte",
      "Dirty chai",
      "Affogato",
    ],
  },
  {
    key: "pasta",
    title: "Pasta",
    image: "/demos/concordias-cafe/pasta.png",
    alt: "Demo still of carbonara — generated for this sample, not cafe photography.",
    items: [
      "Carbonara",
      "Truffle pasta",
      "Seafood marinara",
      "Chicken parmigiana",
      "Meatball pasta",
    ],
  },
  {
    key: "steaks",
    title: "Steaks & mains",
    image: "/demos/concordias-cafe/steak.png",
    alt: "Demo still of a ribeye plate — generated for this sample, not cafe photography.",
    items: [
      "Marbled ribeye bowl",
      "Grilled salmon, mango salsa",
      "Angus beef cheeseburger",
      "Cheesy kaldereta",
      "Bangus belly",
    ],
  },
  {
    key: "cakes",
    title: "Cakes",
    image: "/demos/concordias-cafe/cake.png",
    alt: "Demo still of cake slices — generated for this sample, not cafe photography.",
    items: [
      "Pistachio sansrival",
      "Tiramisu",
      "Honeycomb cheesecake",
      "Ferrero cake",
      "S’mores cake",
    ],
  },
] as const;
