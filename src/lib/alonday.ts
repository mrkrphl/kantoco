import { DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";

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
  hoursHeading: "Open Monday to Saturday, 9 am to 6 pm.",
  hoursBody:
    "Walk-ins are accepted. Sunday isn't in their posted hours, so message them on Facebook before you go.",
  visitNote: "This sample does not take appointments.",
  facebook: "https://www.facebook.com/AlondayDentalClinic/",
  messenger: "https://www.facebook.com/AlondayDentalClinic/",
  instagram: "https://www.instagram.com/alondaydentalclinic",
  instagramHandle: "@alondaydentalclinic",
  mapsQuery:
    "https://www.google.com/maps/search/?api=1&query=454+El+Grande+Ave.+BF+Homes+Paranaque+1718",
  dentistOnCard: "Dr. Emma Aleli Alonday",
  treatments: [
    {
      n: "01",
      name: "General dentistry",
      descriptor: "Check-ups, cleanings, and fillings.",
    },
    {
      n: "02",
      name: "Root canal treatment",
      descriptor: "Endodontics, done in the clinic.",
    },
    {
      n: "03",
      name: "Crowns & dentures",
      descriptor:
        "Porcelain-fused-to-metal crowns and removable dentures.",
    },
    {
      n: "04",
      name: "Dental implants & oral surgery",
      descriptor: "Including extractions, planned with x-rays first.",
    },
    {
      n: "05",
      name: "Braces & retainers",
      descriptor: "Orthodontics for kids and adults.",
    },
    {
      n: "06",
      name: "Pediatric dentistry",
      descriptor: "Care for younger patients.",
    },
    {
      n: "07",
      name: "TMJ & orofacial pain",
      descriptor: "Jaw joint and facial pain.",
    },
    {
      n: "08",
      name: "Teeth whitening",
      descriptor: "In-clinic whitening.",
    },
  ],
  notes: [
    {
      title: "Doc, do we really need x-rays?",
      body: "Yes, they help. They spot hidden problems that eyes can't see, plan treatments precisely so extractions, fillings, and crowns are done right the first time, check bone support for teeth and implants, and avoid surprises near the nerve and sinus.",
    },
    {
      title: "Have you been wearing your retainers regularly?",
      body: "Retainers help keep your teeth in their new, aligned position after orthodontic treatment.",
    },
    {
      title: "Dental implant. Is it for you?",
      body: "For tooth loss from decay or injury, or if you're tired of loose dentures. A smile that lasts for decades, with long-term comfort.",
    },
    {
      title: "Things you should know about whitening.",
      body: "Results vary per patient, and it doesn't work on dentures, crowns, fillings, or veneers. Avoid coffee, tea, juice, and wine for at least 48 hours, and schedule touch-ups every few months.",
    },
  ],
  notesAttribution:
    "Paraphrased from Alonday Dental Clinic's public Facebook posts.",
  sampleNote:
    "This page is a KantoCo sample of how Alonday Dental Clinic could look on the web. They did not hire us.",
  disclaimer: DEMO_DISCLAIMER,
  kantocoMessenger: KANTOCO_MESSENGER,
} as const;
