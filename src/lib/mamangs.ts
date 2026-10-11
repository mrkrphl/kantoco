import { KANTOCO_MESSENGER } from "@/lib/demos";

/** One phone constant. Every Call / Visit number is this tel: link. */
export const MAMANGS_PHONE = "0962 209 1576";

export const mamangs = {
  title: "Mamang's Pizzeria BF Homes · KantoCo sample",
  description:
    "KantoCo sample for Mamang's Pizzeria BF Homes on Aguirre Avenue, Parañaque. Sample only. Not the shop's official site.",
  name: "Mamang's",
  fullName: "Mamang's Pizzeria BF Homes",
  sideTitle: "Pizzeria, BF Homes",
  tagline:
    "Pizza from the brick oven, pasta and big plates for the table, on Aguirre Avenue.",
  addressLine: "40 Aguirre Ave, BF\u00A0Homes, Parañaque",
  addressVisit: "40 Aguirre Ave, BF Homes",
  city: "Parañaque 1715",
  phone: MAMANGS_PHONE,
  phoneNbsp: MAMANGS_PHONE.replaceAll(" ", "\u00A0"),
  phoneHref: `tel:+63${MAMANGS_PHONE.replaceAll(" ", "").replace(/^0/, "")}`,
  callLabel: `Call ${MAMANGS_PHONE.replaceAll(" ", "\u00A0")}`,
  messageLabel: "Message on Facebook",
  messenger: "https://m.me/61551829448008",
  maps: "https://www.google.com/maps/place/Mamang's+Pizzeria+BF+Homes/@14.4450074,121.0246305,17z",
  mapsLabel: "Open in Google Maps",
  sampleNote:
    "This is a sample page made by KantoCo. It is not Mamang's official site and is not live.",
  credit:
    "Photos: Mamang's Pizzeria BF Homes (Facebook); Liza Viray and Vheneth Franche (Google Maps).",
  madeBy: "Made by KantoCo · m.me/kantocoph",
  kantocoMessenger: KANTOCO_MESSENGER,
  asset: "/demos/mamangs-pizzeria-bf",
} as const;

export const MAMANGS_MENU = [
  {
    name: "Brick-oven pizza",
    desc: "Whole pies, including family-sized ones for sharing.",
  },
  {
    name: "Brick-oven lasagna",
    desc: "Baked in the tray and served with garlic bread.",
  },
  {
    name: "Pasta",
    desc: "By the plate, medium or large.",
  },
  {
    name: "Buffalo chicken",
    desc: "With Dynamite, Texas BBQ or Honey Sriracha sauce.",
  },
  {
    name: "Set meals",
    desc: "Grilled pork steak, premium striploin, tuna salpicao or a chicken rice combo.",
  },
  {
    name: "House Blend Kalamantea",
    desc: "Their house drink, also by the 1L or 2L pitcher.",
  },
] as const;

export const MAMANGS_MEALS = [
  {
    name: "Group Meal A",
    price: "₱1,445",
    serves: "GOOD FOR 3–4",
    desc: "1 family-sized pizza, 1 medium plate of pasta, 4 pcs Buffalo chicken and a 1L pitcher of House Blend Kalamantea.",
  },
  {
    name: "Group Meal B",
    price: "₱1,995",
    serves: "GOOD FOR 5–6",
    desc: "1 family-sized pizza, 1 large plate of pasta, 6 pcs Buffalo chicken, 2L of House Blend Kalamantea and fries or mojos.",
  },
] as const;

export const MAMANGS_HOURS = [
  { days: "Mon to Fri", time: "11\u00A0am – 9\u00A0pm" },
  { days: "Sat and Sun", time: "11\u00A0am – 10\u00A0pm" },
] as const;
