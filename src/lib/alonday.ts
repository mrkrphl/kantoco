import { DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";

/** Public facts from Paige’s brief and their Facebook graphics. */
export const alonday = {
  name: "Alonday Dental Clinic",
  shortName: "Alonday",
  promise: "Creating healthy smiles.",
  address: "454 El\u00A0Grande Ave., BF\u00A0Homes, Parañaque 1718",
  addressShort: "454 El\u00A0Grande Ave., BF\u00A0Homes",
  streetNumber: "454",
  streetName: "El Grande",
  phoneDisplay: "0939 932 2060",
  phoneNbsp: "0939\u00A0932\u00A02060",
  phoneHref: "tel:+639399322060",
  callLabel: "Call 0939\u00A0932\u00A02060",
  messageLabel: "Message on Facebook",
  hours: "Monday to Saturday, 9:00 AM to 6:00 PM",
  hoursHeading: "Open Monday to Saturday, 9\u00A0am to 6\u00A0pm.",
  hoursBody:
    "Sunday isn't in their posted hours, so check on Facebook before you\u00A0go.",
  visitClose: "Walk in, or message first.",
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
      descriptor: "Check-ups, cleanings, and\u00A0fillings.",
    },
    {
      n: "02",
      name: "Root canal treatment",
      descriptor: "Endodontics, done in the\u00A0clinic.",
    },
    {
      n: "03",
      name: "Crowns & dentures",
      descriptor:
        "Porcelain-fused-to-metal crowns and removable\u00A0dentures.",
    },
    {
      n: "04",
      name: "Dental implants & oral\u00A0surgery",
      descriptor: "Including extractions, planned with x-rays\u00A0first.",
    },
    {
      n: "05",
      name: "Braces & retainers",
      descriptor: "Orthodontics for kids and\u00A0adults.",
    },
    {
      n: "06",
      name: "Pediatric dentistry",
      descriptor: "Care for younger\u00A0patients.",
    },
    {
      n: "07",
      name: "TMJ & orofacial pain",
      descriptor: "Jaw joint and facial\u00A0pain.",
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
      body: "Yes, they help. They spot hidden problems that eyes can't see, plan treatments precisely so extractions, fillings, and crowns are done right the first time, check bone support for teeth and implants, and avoid surprises near the nerve and\u00A0sinus.",
    },
    {
      title: "Have you been wearing your retainers regularly?",
      body: "Retainers help keep your teeth in their new, aligned position after orthodontic\u00A0treatment.",
    },
    {
      title: "Dental implant. Is it for you?",
      body: "For tooth loss from decay or injury, or if you're tired of loose dentures. A smile that lasts for decades, with long-term\u00A0comfort.",
    },
    {
      title: "Things you should know about whitening.",
      body: "Results vary per patient, and it doesn't work on dentures, crowns, fillings, or veneers. Avoid coffee, tea, juice, and wine for at least 48 hours, and schedule touch-ups every few\u00A0months.",
    },
  ],
  notesAttribution:
    "Paraphrased from Alonday Dental Clinic's public Facebook\u00A0posts.",
  sampleNote:
    "KantoCo sample, not client\u00A0work. This sample does not take\u00A0appointments. This page is a KantoCo sample of how Alonday Dental Clinic could look on the web. They did not hire\u00A0us.",
  disclaimer: DEMO_DISCLAIMER,
  kantocoMessenger: KANTOCO_MESSENGER,
} as const;
