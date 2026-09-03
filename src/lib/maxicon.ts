import { DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";

/** Public facts only. Do not invent hours, address, or prices. */
export const maxicon = {
  name: "Maxicon Car Aircon Specialist",
  alsoKnownAs: "Maxicon Car Aircon Parts & Services",
  address: "45 President's Avenue, BF Homes, Parañaque",
  addressShort: "45 President's Avenue, BF Homes",
  phoneMobileDisplay: "0917 501 0872",
  phoneMobileHref: "tel:+639175010872",
  phoneLandlineDisplay: "8820 5426",
  phoneLandlineHref: "tel:+63288205426",
  phoneLandlineAlt: "820 5426",
  phoneOther: "2191370",
  email: "info_maxicon@yahoo.com",
  emailHref: "mailto:info_maxicon@yahoo.com",
  hours: "Monday to Saturday, 8:00am to 5:00pm",
  facebook: "https://www.facebook.com/MaxiconCarAircon",
  facebookFollowers: "about 95,000 followers",
  mapsQuery:
    "https://www.google.com/maps/search/?api=1&query=45+President%27s+Avenue+BF+Homes+Paranaque",
  mapsEmbed:
    "https://maps.google.com/maps?q=45%20President%27s%20Avenue%2C%20BF%20Homes%2C%20Para%C3%B1aque&z=16&output=embed",
  cards: "They accept major credit cards.",
  recentPost:
    "On 26 August their public Facebook page posted a GAC GS8 that was not blowing cold.",
  disclaimer: DEMO_DISCLAIMER,
  sampleNote:
    "This page is a KantoCo sample of how Maxicon’s shop could look on the web. They did not hire us.",
  kantocoMessenger: KANTOCO_MESSENGER,
} as const;

export const maxiconWork = [
  [
    "Diagnostics",
    "Read the system first. They publish computerized scanning as part of the job.",
  ],
  [
    "Leak test",
    "Find where the cold is escaping before anyone talks about a recharge.",
  ],
  [
    "Flush",
    "Pull the system down and clean it when the job needs a full wash, not a top-up.",
  ],
  [
    "Freon recharge",
    "Charge the system once the leak is handled and the parts are ready.",
  ],
  [
    "Parts",
    "Compressors, condensers, evaporators, expansion valves, driers, auxiliary fans. OEM and replacement.",
  ],
  [
    "Full-service repair",
    "Japanese, American, and European cars come through the same door.",
  ],
] as const;
