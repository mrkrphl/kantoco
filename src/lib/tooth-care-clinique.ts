import { DEMO_BADGE } from "@/lib/demos";

export const TCC_ASSET = "/demos/tooth-care-clinique";

export const PLACE_ID = "ChIJ3yY_KU3PlzMRogA39QMDyZk";
export const PLACE_NAME = "Tooth Care Clinique";

export const tcc = {
  title: "Tooth Care Clinique · KantoCo sample",
  description:
    "KantoCo sample for Tooth Care Clinique on France St., Better Living, Parañaque. Not the clinic's official site.",
  badge: DEMO_BADGE,
  barDesk:
    "SAMPLE | NOT LIVE · A KantoCo sample page for Tooth Care Clinique. Not the clinic's official site.",
  barMob: "SAMPLE | NOT LIVE · Not the clinic's official site.",
  eyebrow: "DENTIST · BETTER LIVING, PARAÑAQUE",
  name: "Tooth Care",
  nameAccent: "Clinique",
  chip: "By appointment only",
  tagline:
    "Dr. Samantha Victoria B. Agbada, on the 2nd floor of 18 France St., Better Living. Message or call to reserve your slot before you come.",
  messenger: "https://m.me/toothcareclinique",
  messengerLabel: "Book on Messenger",
  messengerHandle: "m.me/toothcareclinique",
  facebook: "https://www.facebook.com/toothcareclinique",
  callLabel: "Call 0977 044 7934",
  phone: "0977 044 7934",
  phoneIntl: "(+63) 977 044 7934",
  phoneTel: "tel:+639770447934",
  email: "toothcareclinique@gmail.com",
  emailHref: "mailto:toothcareclinique@gmail.com",
  instagram: "https://www.instagram.com/toothcareclinique/",
  instagramHandle: "@toothcareclinique",
  placeId: PLACE_ID,
  placeName: PLACE_NAME,
  directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${PLACE_NAME}, 18 France St, Parañaque`)}&destination_place_id=${PLACE_ID}`,
  directionsLabel: "Get directions",
  intro:
    "If you searched for Tooth Care Clinique, this is one page with the address, the number, the appointment days and the clinic's Messenger.",
  hoursLine: "Mon, Wed, Fri 9 AM–6 PM · Sun 10 AM–3 PM.",
  hoursVisit: ["Mon, Wed, Fri 9 AM–6 PM", "Sun 10 AM–3 PM"] as const,
  confirm: "CONFIRM",
  addressLines: [
    "2F 18 France St., Better Living Subdivision",
    "Barangay Don Bosco, Parañaque City 1711",
  ],
  landmark: "Landmark: BDO Better Living, Dona Soledad Ave. corner France St.",
  findFloor: "18 France St., near BDO Better Living at Dona Soledad Ave.",
  visitH: "2nd floor, 18 France St., Better Living.",
  insideH: "Aqua walls, white cabinets.",
  insideBody: "A clean, bright treatment room on the 2nd floor.",
  sampleNote:
    "A KantoCo sample for Tooth Care Clinique. Not live, and not the clinic's official site.",
  credit:
    "Photo: the building from the clinic's Google Maps listing. Address, phone, email, Messenger, hours and services: the clinic's WordPress site; phone and ZIP also on Google Maps. Used for this private sample only.",
  asset: TCC_ASSET,
} as const;

export const TCC_BOOK = [
  {
    n: "1",
    title: "Message or call",
    detail: "m.me/toothcareclinique or (+63) 977 044 7934.",
    confirm: false,
  },
  {
    n: "2",
    title: "Pick a clinic day",
    detail: tcc.hoursLine,
    confirm: true,
  },
  {
    n: "3",
    title: "Find the 2nd floor",
    detail: tcc.findFloor,
    confirm: false,
  },
] as const;

export const TCC_SERVICES = [
  {
    title: "General Dentistry",
    body: "Oral cleaning, fluoride treatment, root canal therapy, teeth whitening, wisdom tooth surgery, tooth restoration and extraction.",
  },
  {
    title: "Prosthetics and Support",
    body: "Customized dentures, orthodontic treatment (braces), veneers, fixed bridges and crowns.",
  },
  {
    title: "TMJ Treatment",
    body: "Temporomandibular joint (TMJ) treatment for pain in the jaw joint.",
  },
] as const;

/**
 * Every still on the page. Flip `ready` (and fill file/alt/caption)
 * when a later still is cleared to ship. Storefront is the only
 * photo in this build; opener and inside use the wave mark until then.
 */
export const PHOTOS = {
  opener: {
    id: "opener",
    ready: false,
    file: "opener",
    alt: "",
    caption: "",
    width: 448,
    height: 473,
    maxWidth: 448,
    radius: 6,
  },
  inside: {
    id: "inside",
    ready: false,
    file: "inside",
    alt: "",
    caption: "",
    width: 370,
    height: 290,
    maxWidth: 370,
    radius: 18,
  },
  storefront: {
    id: "storefront",
    ready: true,
    file: "storefront",
    alt: "The green-and-white two-storey building on France St. with the Tooth Care Clinique sign on the 2nd floor.",
    caption: "The building, from the clinic's Google Maps listing.",
    width: 402,
    height: 184,
    maxWidth: 402,
    radius: 12,
  },
} as const;

export type PhotoSlot = (typeof PHOTOS)[keyof typeof PHOTOS];
