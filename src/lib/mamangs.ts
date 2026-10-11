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

export const MAMANGS_PIE_SIZES =
  "(min-width:1024px) min(640px, 57vw), calc(100vw - 48px)";

const hero = `${mamangs.asset}/hero`;

/** Recompressed hero. Original plate-pizza-1x1.webp is 333554 bytes. */
export const MAMANGS_PIE = {
  color: "#b5894d",
  blurDataURL:
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAYABgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwCxp8COiNNgMy7gme1Oim8oOT90HhRhQRzyPeo5lIfcWKuSPk3jn6elOJhwyxooDgfxZbPpg1wHWIDFcGZF2fONwYfyNFTW83CRM5kfcDuwOBj2oqlJkvQzLWeO+uIpI3CThfmGM8jqR61bkYJqG7DbS3LbT+X6UUUTXK7IqmubVjknia68iGPZIyksR/CPU0UUVcYqxnJtOyP/2Q==",
  avifSrcSet: `${hero}/plate-640.avif 640w, ${hero}/plate-960.avif 960w, ${hero}/plate-1280.avif 1280w`,
  webpSrcSet: `${hero}/plate-640.webp 640w, ${hero}/plate-960.webp 960w, ${hero}/plate-1280.webp 1280w`,
  src: `${hero}/plate-960.webp`,
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
