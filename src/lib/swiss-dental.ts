import { DEMO_BADGE } from "@/lib/demos";

export const SWISS = {
  title: "Swiss Dental Clinic · KantoCo sample (not live)",
  description:
    "KantoCo sample for Swiss Dental Clinic on Jordan Street, Parañaque. Not the clinic’s website.",
  badge: DEMO_BADGE,
  facebook: "https://www.facebook.com/swissdentalclinicph",
  messenger: "https://m.me/swissdentalclinicph",
  maps:
    "https://www.google.com/maps/search/?api=1&query=Swiss%20Dental%20Clinic%2C%2011%20Jordan%20St%2C%20Para%C3%B1aque%201719&query_place_id=ChIJlUw5cI3OlzMRz_0FHVbV1fY",
  directions:
    "https://www.google.com/maps/dir/?api=1&destination=Swiss%20Dental%20Clinic%2C%2011%20Jordan%20St%2C%20Para%C3%B1aque&destination_place_id=ChIJlUw5cI3OlzMRz_0FHVbV1fY",
  address: ["Ledesma Bldg", "11 Jordan St", "Parañaque 1719"],
  rating: "4.9 on Google Maps (156 reviews)",
  ratingCheckedOn: "2026-10-14",
} as const;

export const IMG = "/demos/swiss-dental";

export const PLATE_SIZES =
  "(min-width: 1312px) 1120px, calc(100vw - 2 * clamp(24px, 6vw, 96px))";

/**
 * Every still on the page. Swap `file` (and set ready) when Facebook
 * photos land; plate stays the Unsplash stock crop.
 */
export const PHOTOS = {
  plate: {
    desktop: "plate-16x9",
    desktop1x: "plate-16x9-1x",
    mobile: "plate-mobile-4x5",
    alt: "Dental mirrors and instruments laid out on a steel tray.",
    caption: "Dental instruments on a tray, photo by camera obscura on Unsplash.",
    credit: "Plate: camera obscura / Unsplash",
    width: 1120,
    height: 630,
    mobileWidth: 816,
    mobileHeight: 1020,
  },
  clinic: {
    // Stand-in until the Facebook reception crop lands. Caption/footer
    // strings are the stamp r1.1 copy and stay as specified.
    file: "neon-own-2x1",
    alt: "The Swiss Dental Clinic reception sign.",
    caption: "Their reception sign, from their Facebook.",
    footer:
      "Reception sign photo: Swiss Dental Clinic (facebook.com/swissdentalclinicph)",
    width: 1268,
    height: 634,
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
