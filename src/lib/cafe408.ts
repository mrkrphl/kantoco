export const CAFE408 = {
  title: "Cafe 408 BF Homes · KantoCo sample",
  description:
    "KantoCo sample for Cafe 408 at Chloe Center, BF Homes, Parañaque. Sample only. Not the cafe's official site.",
  messenger: "https://m.me/cafe408",
  directions:
    "https://www.google.com/maps/dir/?api=1&destination=14.4503784,121.0187855",
  facebook: "https://www.facebook.com/cafe408",
  instagram: "https://www.instagram.com/cafe408_/",
} as const;

export const CAFE408_CAPS = [
  "Their iced coffee, from their Facebook.",
  "Their iced matcha, photo by Jehan Marie Yucot on Google Maps.",
  "Their rice plate, from their Facebook.",
  "Their sandwich and fries, from their Google Maps listing.",
] as const;

export const CAFE408_COUNTER = [
  {
    n: "01",
    name: "Coffee",
    descriptor: "Hot or iced, in the white CAFE-408 cup.",
    file: "counter-1-coffee-1x1",
    caption: CAFE408_CAPS[0],
    alt: "An iced coffee in a clear CAFE-408 cup on a concrete floor, crossed by leaf shadows.",
  },
  {
    n: "02",
    name: "Matcha",
    descriptor: "Coconut Matcha and Matcha Cream.",
    file: "counter-2-matcha-maps-1x1",
    caption: CAFE408_CAPS[1],
    alt: "An iced matcha in a short glass, with an iced coffee and a cookie on a grey plate behind it.",
  },
  {
    n: "03",
    name: "Rice plates and pasta",
    descriptor: "Saucy rice bowls and pasta, served on their grey stoneware.",
    file: "counter-3-plates-1x1",
    caption: CAFE408_CAPS[2],
    alt: "Sliced chicken in a dark glossy sauce over white rice, in a grey stoneware bowl.",
  },
  {
    n: "04",
    name: "Sandwiches",
    descriptor:
      "The 408 Clubhouse, the Monte Cristo, and chicken tenders, all with fries.",
    file: "counter-4-sandwich-maps-1x1",
    caption: CAFE408_CAPS[3],
    alt: "A toasted sandwich cut in half with fries on a white plate, a white CAFE-408 cup behind it.",
  },
] as const;

export const CAFE408_ASSET = "/demos/cafe-408-bf";
