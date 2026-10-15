import { DEMO_BADGE } from "@/lib/demos";

export const SWISS = {
  title: "Swiss Dental Clinic · KantoCo sample",
  description:
    "KantoCo sample for Swiss Dental Clinic on Jordan Street, Parañaque. Not the clinic’s official site.",
  badge: DEMO_BADGE,
  facebook: "https://www.facebook.com/swissdentalclinicph",
  facebookHandle: "facebook.com/swissdentalclinicph",
  messenger: "https://m.me/swissdentalclinicph",
  maps:
    "https://www.google.com/maps/search/?api=1&query=Swiss%20Dental%20Clinic%2C%2011%20Jordan%20St%2C%20Para%C3%B1aque%201719&query_place_id=ChIJlUw5cI3OlzMRz_0FHVbV1fY",
  directions:
    "https://www.google.com/maps/dir/?api=1&destination=Swiss%20Dental%20Clinic%2C%2011%20Jordan%20St%2C%20Para%C3%B1aque&destination_place_id=ChIJlUw5cI3OlzMRz_0FHVbV1fY",
  address: ["Ledesma Bldg", "11 Jordan Street", "Parañaque 1719"],
  addressLine: "Ledesma Bldg, 11 Jordan Street, Parañaque.",
  mobile: "0917 559 9108",
  mobileTel: "tel:+639175599108",
  landline: "(02) 8828 4130",
  landlineTel: "tel:+63288284130",
  email: "analizaborras@yahoo.com",
  doctor: "Dr. Analiza P. Borras",
  rating: "4.9 on Google Maps (156 reviews)",
  ratingCheckedOn: "2026-10-14",
} as const;

export const IMG = "/demos/swiss-dental";

export const PLATE_SIZES =
  "(min-width: 1312px) 1120px, calc(100vw - 2 * clamp(24px, 6vw, 96px))";

export const PLATE_PRELOAD = {
  mobileWebp: `${IMG}/plate-mobile-4x5.webp`,
  desktopWebp: `${IMG}/plate-16x9-1x.webp`,
  desktopWebpSrcSet: `${IMG}/plate-16x9-1x.webp 1120w, ${IMG}/plate-16x9.webp 2240w`,
} as const;

/**
 * Every still on the page. Flip `facebookLater[].ready` (and fill
 * alt/caption/file) when more Facebook photos land.
 */
export const PHOTOS = {
  plate: {
    desktop: "plate-16x9",
    desktop1x: "plate-16x9-1x",
    mobile: "plate-mobile-4x5",
    alt: "Stock photo: an empty dental room with dark red chairs, a wood-panelled wall and tall city windows.",
    caption: "Stock photo, not the clinic.",
    credit: "Stock photo: Sam Moghadam / Unsplash",
    width: 1120,
    height: 630,
    outWidth: 2240,
    outHeight: 1260,
    mobileWidth: 1200,
    mobileHeight: 1500,
  },
  clinic: {
    file: "neon-own-2x1",
    alt: "The clinic's red heart logo and the word SWISS in pale blue neon on a wood-slat wall, with orchids at the edges.",
    caption: "Their reception sign, from their Facebook.",
    footer:
      "Reception sign photo: Swiss Dental Clinic (facebook.com/swissdentalclinicph). Stock photo: Sam Moghadam / Unsplash. Address and mobile: the clinic's Facebook page. Landline and rating: Google Maps. Used for this private sample only.",
    width: 1300,
    height: 650,
    cssMaxWidth: 634,
    cssMaxHeight: 317,
  },
  facebookLater: [
    {
      id: "slot-a",
      file: "slot-a-4x5",
      alt: "",
      caption: "",
      ready: false,
      width: 640,
      height: 800,
    },
    {
      id: "slot-b",
      file: "slot-b-4x5",
      alt: "",
      caption: "",
      ready: false,
      width: 640,
      height: 800,
    },
  ],
} as const;
