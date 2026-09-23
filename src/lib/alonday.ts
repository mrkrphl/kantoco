import { DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";

const still = (file: string) => `/demos/alonday-dental/${file}`;

/** Public facts from Paige’s brief and their Facebook graphics. */
export const alonday = {
  name: "Alonday Dental Clinic",
  shortName: "Alonday",
  promise: "Creating healthy smiles.",
  address: "454 El Grande Ave., BF Homes, Parañaque 1718",
  addressShort: "454 El Grande Ave., BF Homes",
  streetNumber: "454",
  streetName: "El Grande",
  phoneDisplay: "0939 932 2060",
  phoneHref: "tel:+639399322060",
  hours: "Monday to Saturday, 9:00 AM to 6:00 PM",
  hoursLoud: "Monday to Saturday",
  hoursTime: "9 to 6",
  hoursNote:
    "Walk-ins are accepted. Confirm the schedule on Facebook before you go.",
  facebook: "https://www.facebook.com/AlondayDentalClinic/",
  messenger: "https://www.facebook.com/AlondayDentalClinic/",
  instagram: "https://www.instagram.com/alondaydentalclinic",
  instagramHandle: "@alondaydentalclinic",
  mapsQuery:
    "https://www.google.com/maps/search/?api=1&query=454+El+Grande+Ave.+BF+Homes+Paranaque+1718",
  dentistOnCard: "Dr. Emma Aleli Alonday",
  stills: {
    hero: still("opener-molar.jpg"),
    heroSource: still("photo-04.jpg"),
    heroAlt: still("opener-smile.jpg"),
    heroAltSource: still("photo-08.jpg"),
    composite: still("beat-composite.jpg"),
    compositeSource: still("photo-04.jpg"),
    crowns: still("beat-crowns.jpg"),
    crownsSource: still("photo-02.jpg"),
  },
  sampleNote:
    "This page is a KantoCo sample of how Alonday Dental Clinic could look on the web. They did not hire us.",
  disclaimer: DEMO_DISCLAIMER,
  kantocoMessenger: KANTOCO_MESSENGER,
} as const;
