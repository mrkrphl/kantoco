import { KANTOCO_MESSENGER } from "@/lib/demos";

export const PEDIAMED_ASSET = "/demos/pediamed";

/** Public listing facts only. Never contact the clinic. */
export const pediamed = {
  title: "PediaMed Children's Clinic · KantoCo sample",
  description:
    "KantoCo sample for PediaMed Children's Clinic on J. Elizalde, BF Homes, Parañaque. Sample only. Not the clinic's official site.",
  name: "PediaMed",
  nameSub: "Children's Clinic",
  fullName: "PediaMed Children's Clinic",
  kicker: "Pediatric clinic · BF Homes, Parañaque",
  kickerMob: "Pediatric clinic · BF Homes, Parañaque",
  services: "Outpatient care for kids",
  addressLines: [
    "Unit C, 2nd floor, LG Centre Building",
    "J.\u00A0Elizalde St, BF\u00A0Homes",
  ],
  visitH: "Unit C, 2nd floor, LG Centre Building, BF\u00A0Homes.",
  phone: "0956 164 8522",
  phoneTel: "tel:+639561648522",
  callLabel: "Call 0956 164 8522",
  email: "pediamedph@gmail.com",
  emailHref: "mailto:pediamedph@gmail.com",
  facebook: "https://www.facebook.com/PediaMedPH",
  facebookHandle: "facebook.com/PediaMedPH",
  messenger: "https://m.me/PediaMedPH",
  messageLabel: "Message on Facebook",
  directions:
    "https://www.google.com/maps/dir/?api=1&destination=PediaMED+Children%27s+Clinic&destination_place_id=ChIJW_qmPgnPlzMR6OjPM2uvB8o",
  directionsLabel: "Get directions",
  hoursLabel: "Hours per Google Maps",
  hours: [
    { days: "Mon–Sat", time: "10 AM–5 PM" },
    { days: "Sunday", time: "closed" },
  ],
  comeLine: "Call or message the clinic to set your child's visit.",
  intro:
    "If you searched for PediaMed, this is the clinic's own page: the full address, the mobile number, the hours and its Facebook, in one place.",
  sampleNote:
    "A KantoCo sample for PediaMed Children's Clinic. Not live, and not the clinic's official site.",
  credit:
    "Photos: the clinic's Google Maps listing (Nov 2022). Address, mobile and email: the clinic's Facebook page. Hours: Google Maps. Used for this private sample only.",
  madeBy: "Made by KantoCo · m.me/kantocoph",
  kantocoMessenger: KANTOCO_MESSENGER,
  asset: PEDIAMED_ASSET,
} as const;

export const PEDIAMED_TILES = [
  "red",
  "mint",
  "green",
  "blue",
  "yellow",
  "mint",
] as const;

export const PEDIAMED_SHOTS = [
  {
    file: "play-area",
    caption: "Their play corner, from their Google Maps listing.",
    heading: "A corner to play while you wait",
    body: "Foam mats, toy cubbies and a window that lets the light in.",
    alt: "An empty play corner with blue and cream foam mats, toy cubbies and a row of little paper houses under a window.",
    width: 486,
    height: 462,
  },
  {
    file: "consult-corner",
    caption: "Their consult room, from their Google Maps listing.",
    heading: "A calm room for the checkup",
    body: "Sky-blue walls, soft chairs for you, a step stool for them.",
    alt: "An empty consult room with a wood desk, two teal armchairs, a yellow step stool and sky-blue walls.",
    width: 486,
    height: 462,
  },
] as const;

export const PEDIAMED_KNOW = [
  {
    marker: "red",
    title: "Call",
    detail: "Mobile 0956 164 8522.",
  },
  {
    marker: "green",
    title: "Message or email",
    detail:
      "Send a message to facebook.com/PediaMedPH, or email pediamedph@gmail.com.",
  },
  {
    marker: "yellow",
    title: "Check the hours",
    detail:
      "Monday to Saturday, 10 AM to 5 PM. Closed Sunday. Hours per Google Maps.",
  },
] as const;
