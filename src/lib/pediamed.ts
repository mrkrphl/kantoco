import { DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";

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
    "Lot 5 Block 39, J.\u00A0Elizalde",
    "BF\u00A0Homes, Parañaque 1720",
  ],
  addressPlain: "Lot 5 Block 39, J. Elizalde, BF Homes, Parañaque 1720",
  facebook: "https://www.facebook.com/PediaMedPH",
  messenger: "https://m.me/PediaMedPH",
  messageLabel: "Message on Facebook",
  directions:
    "https://www.google.com/maps/dir/?api=1&destination=14.4484969,121.0285809&destination_place_id=ChIJW_qmPgnPlzMR6OjPM2uvB8o",
  mapsPin: "https://maps.google.com/?cid=14557797195464042728",
  directionsLabel: "Get directions",
  hours: [
    { days: "Mon–Sat", time: "10\u00A0am – 5\u00A0pm" },
    { days: "Sunday", time: "Closed" },
  ],
  hoursNote: "From their Google Maps listing.",
  hoursConfirm: "CONFIRM",
  sampleNote:
    "A KantoCo sample for PediaMED Children's Clinic. Not live, and not the clinic's official site.",
  credit:
    "Interiors: consult-corner, Yusuf P (Pexels); play-area, Hakim Santoso (Pexels). Hours: Google Maps.",
  madeBy: "Made by KantoCo · m.me/kantocoph",
  disclaimer: DEMO_DISCLAIMER,
  kantocoMessenger: KANTOCO_MESSENGER,
  asset: PEDIAMED_ASSET,
} as const;

export const PEDIAMED_SHOTS = [
  {
    file: "consult-corner-4x5",
    file1x: "consult-corner-4x5-1x",
    caption: "Consult corner. Photo: Yusuf P, Pexels.",
    alt: "Empty exam room with a scale, desk, and two chairs. No people.",
    width: 1280,
    height: 1600,
  },
  {
    file: "play-area-4x5",
    file1x: "play-area-4x5-1x",
    caption: "Play area. Photo: Hakim Santoso, Pexels.",
    alt: "Empty play corner with a wooden train set on a grey rug. No people.",
    width: 1280,
    height: 1600,
  },
] as const;
