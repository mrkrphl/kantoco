/** One phone record. Mark may switch the display string to 0917 599 8928. */
const PHONE_DISPLAY = "0997 688 8219";

export const PHONE = {
  display: PHONE_DISPLAY,
  href: `tel:+63${PHONE_DISPLAY.replaceAll(" ", "").replace(/^0/, "")}`,
} as const;

export const PHONE_NBSP = PHONE.display.replaceAll(" ", "\u00a0");
export const PHONE_CALL_LABEL = `Call ${PHONE_NBSP}`;

export const FACEBOOK_PAGE = "https://www.facebook.com/BetterDetails";
export const FACEBOOK_MSG = "https://m.me/BetterDetails";
export const MAPS_URL =
  "https://www.google.com/maps/place/Better+Details+-+Paint+Protection+Film+Ceramic+Coating+Tint/@14.4780606,121.0295366,17z";

export const IMG = "/demos/better-details";

export const PLATE_SIZES =
  "(min-width: 1312px) 1120px, calc(100vw - 2 * clamp(24px, 6vw, 96px))";

export const SVC_CAPS = [
  "Their work: a panel edge, close up",
  "Their work: a black front end under the bay lights",
  "Their work: a black pickup, side glass",
] as const;

export const SERVICES = [
  {
    num: "01",
    name: "Paint protection film",
    line: "A clear film laid over the paint, so stone chips and light scratches land on the film instead of the car.",
    file: "svc-1-ppf-4x5",
    cap: SVC_CAPS[0],
    alt: "Close-up of a grey car's panel edge with soft reflections on the paint.",
  },
  {
    num: "02",
    name: "Ceramic coating",
    line: "A hard, glossy layer over the clear coat that makes washing easier and keeps the shine deep.",
    file: "svc-2-coating-4x5",
    cap: SVC_CAPS[1],
    alt: "A black car's headlight and fender, glossy, reflecting the bay ceiling lights.",
  },
  {
    num: "03",
    name: "Window tint",
    line: "Film on the glass to cut heat and glare and keep the cabin private.",
    file: "svc-3-tint-4x5",
    cap: SVC_CAPS[2],
    alt: "Side of a black pickup with dark tinted windows, in the bay.",
  },
] as const;
