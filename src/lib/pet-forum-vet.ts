import { DEMO_BADGE } from "@/lib/demos";

export const PF_ASSET = "/demos/pet-forum-vet";

/** Public listing facts only. Never contact the clinic. */
export const pf = {
  title: "Pet Forum Veterinary Clinic · KantoCo sample",
  description:
    "KantoCo sample for Pet Forum Veterinary Clinic on Elsie Gaches St. corner Monserrat, BF Homes 1, Parañaque. Not the clinic's official site.",
  badge: DEMO_BADGE,
  barDesk:
    "A KantoCo sample page for Pet Forum Veterinary Clinic. Not the clinic's official site.",
  barMob: "Not the clinic's official site",
  eyebrow: "Vet clinic · BF Homes 1, Parañaque",
  namePet: "Pet",
  nameForum: "Forum",
  nameSub: "Veterinary Clinic",
  fullName: "Pet Forum Veterinary Clinic",
  chip: "Open daily · Sun until 2 PM",
  tagline:
    "Your neighbourhood vet on Elsie Gaches St. corner Monserrat. Call or text before you drop by.",
  callLabel: "Call 0917 115 9718",
  textLabel: "Text us",
  phone: "0917 115 9718",
  phoneTel: "tel:+639171159718",
  phoneSms: "sms:+639171159718",
  facebook:
    "https://www.facebook.com/p/Pet-Forum-Veterinary-Clinic-61586570193777/",
  facebookLabel: "Message us on Facebook →",
  facebookHandle: "Pet Forum Veterinary Clinic",
  email: "petforumvc@gmail.com",
  emailHref: "mailto:petforumvc@gmail.com",
  /**
   * Exact pin. CID 18042981361555055303
   * (ftid 0x3397cf0020e898d7:0xfa658bf3d87ba2c7) at 14.4478971, 121.0279753.
   * Logged-out Maps HTML never emitted a ChIJ place_id, so this uses the
   * CID URL rather than guessing query_place_id. Playwright on the CID
   * URL opened "Pet Forum Veterinary Clinic" at those coordinates.
   */
  directions: "https://maps.google.com/?cid=18042981361555055303",
  directionsLabel: "Get directions",
  confirm: "CONFIRM",
  address:
    "Unit J Commercial Building, Elsie Gaches St. corner Monserrat St., BF Homes 1, Parañaque 1720",
  findH: "Elsie Gaches corner Monserrat.",
  findBody:
    "Look for the plum-and-mustard sign and the copper dog-and-cat stickers on the window.",
  hoursH: "Open seven days.",
  hours: [
    "Mon–Fri 8:00 AM–5:00 PM",
    "Sat 9:00 AM–5:30 PM",
    "Sun 9:00 AM–2:00 PM",
  ] as const,
  hoursNote:
    "Holidays can change this. Check the Facebook Page or text first.",
  servicesKicker: "What we do",
  servicesH: "Check-ups, shots",
  servicesH2: "and deworming.",
  servicesLead:
    "For dogs and cats. Not sure if we can help? Call, text or message us first.",
  sampleNote:
    "A KantoCo sample for Pet Forum Veterinary Clinic. Not live, and not the clinic's official site.",
  credit:
    "Photos: sign, front window and clinic dogs from the clinic's Google Maps listing. Stock photo from Unsplash: orange cat by Hao Fan (unsplash.com/photos/LkpRVEbLYPM), used under the Unsplash License. Address, phone, email and hours from the clinic's Facebook Page and Google Maps listing; services from the clinic's own storefront banner. Used for this private sample only.",
  clinicPhotoCredit: "Photo: Pet Forum Veterinary Clinic via Google Maps",
  catStockCredit: "Stock photo · Hao Fan / Unsplash",
  asset: PF_ASSET,
} as const;

export const PF_SERVICES = [
  {
    title: "Check-ups",
    body: "A once-over for your dog or cat, or a visit when something seems off.",
    icon: "heart" as const,
  },
  {
    title: "Vaccines & deworming",
    body: "Ask about anti-rabies and your pet's next schedule.",
    icon: "syringe" as const,
  },
] as const;

export const PF_PHOTOS = {
  sign: {
    file: "storefront-sign",
    alt: "The Pet Forum Veterinary Clinic lightbox sign: a dog and cat in a mustard circle, with the name in plum.",
    width: 1340,
    height: 510,
    avif: false,
  },
  dog: {
    file: "dog-steel-table",
    alt: "A brown puppy lying on a stainless steel exam table in a white clinic room, looking at the camera with its tongue out.",
    caption: pf.clinicPhotoCredit,
    width: 800,
    height: 1200,
    avif: true,
  },
  window: {
    file: "window-decals",
    alt: "The clinic's glass front with copper dog-and-cat stickers on the window.",
    caption: "The clinic's front window, from its Google Maps listing.",
    width: 870,
    height: 1150,
    avif: false,
  },
  cat: {
    file: "filler-cat-haofan",
    alt: "An orange tabby cat asleep in a cardboard box (stock photo).",
    caption: pf.catStockCredit,
    width: 1600,
    height: 1067,
    avif: false,
  },
  scale: {
    file: "dog-teal-scale",
    alt: "A golden retriever in a blue harness lying on a tiled clinic floor beside a food bowl, with a teal scale behind it.",
    caption: pf.clinicPhotoCredit,
    width: 640,
    height: 854,
    avif: true,
  },
} as const;

export const PF_SIGN_PRELOAD = `${PF_ASSET}/${PF_PHOTOS.sign.file}.webp`;
export const PF_SIGN_SIZES =
  "(min-width: 768px) min(534px, calc((1180px - 64px) / 2)), calc(100vw - 2 * clamp(22px, 6vw, 96px))";
