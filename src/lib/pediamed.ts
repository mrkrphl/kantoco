import { KANTOCO_MESSENGER } from "@/lib/demos";

export const PEDIAMED_ASSET = "/demos/pediamed";

/** Public listing facts only. Never contact the clinic. */
export const pediamed = {
  title: "PediaMED Children's Clinic · KantoCo sample",
  description:
    "KantoCo sample for PediaMED Children's Clinic on J. Elizalde, BF Homes, Parañaque. Sample only. Not the clinic's official site.",
  name: "PediaMED",
  fullName: "PediaMED Children's Clinic",
  kicker: "Children's Clinic · BF Homes, Parañaque",
  kickerMob: "Children's Clinic · BF Homes",
  services: "Outpatient care for kids",
  addressLines: [
    "Unit C, 2nd floor, LG Centre Building",
    "J.\u00A0Elizalde St, BF\u00A0Homes",
  ],
  facebook: "https://www.facebook.com/PediaMedPH",
  messenger: "https://m.me/PediaMedPH",
  messageLabel: "Message on Facebook",
  directions:
    "https://www.google.com/maps/dir/?api=1&destination=PediaMED+Children%27s+Clinic%2C+Lot+5+Block+39+J.+Elizalde%2C+BF+Homes%2C+Para%C3%B1aque&destination_place_id=ChIJW_qmPgnPlzMR6OjPM2uvB8o",
  directionsLabel: "Get directions",
  hoursLabel: "Hours per Google Maps",
  hours: [
    { days: "Mon–Sat", time: "10\u00A0am – 5\u00A0pm" },
    { days: "Sunday", time: "Closed" },
  ],
  sampleNote:
    "A KantoCo sample for PediaMED Children's Clinic. Not live, and not the clinic's official site.",
  credit:
    "Hero: Haikal Vivar, Unsplash. Interiors: consult-corner, Yusuf P (Pexels); play-area, Hakim Santoso (Pexels). Hours: Google Maps.",
  madeBy: "Made by KantoCo · m.me/kantocoph",
  kantocoMessenger: KANTOCO_MESSENGER,
  asset: PEDIAMED_ASSET,
} as const;

export const PEDIAMED_HERO = {
  file: "hero-waiting-16x9",
  file1x: "hero-waiting-16x9-1x",
  caption: "Stock waiting room, not PediaMED. Photo: Haikal Vivar, Unsplash.",
  alt: "Empty waiting room with two rows of black chairs against a white wall.",
  width: 1600,
  height: 900,
} as const;

export const PEDIAMED_SHOTS = [
  {
    file: "consult-corner-4x5",
    file1x: "consult-corner-4x5-1x",
    caption: "Stock consult room, not PediaMED. Photo: Yusuf P, Pexels.",
    alt: "Empty exam room with a scale, a desk, and two chairs.",
    width: 1280,
    height: 1600,
    displayMax: 320,
    webp: false,
  },
  {
    file: "play-area-4x5",
    file1x: "play-area-4x5-1x",
    caption: "Stock play corner, not PediaMED. Photo: Hakim Santoso, Pexels.",
    alt: "Empty play corner with a wooden train set on a grey rug.",
    width: 1280,
    height: 1599,
    displayMax: 320,
    webp: true,
  },
] as const;
