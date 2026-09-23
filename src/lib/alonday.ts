import { DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";

const still = (file: string) => `/demos/alonday-dental/${file}`;

/** Public facts from Paige’s brief and their Facebook graphics. */
export const alonday = {
  name: "Alonday Dental Clinic",
  promise: "Creating healthy smiles.",
  address: "454 El Grande Ave., BF Homes, Parañaque 1718",
  addressShort: "454 El Grande Ave., BF Homes",
  phoneDisplay: "0939 932 2060",
  phoneHref: "tel:+639399322060",
  hours: "Monday to Saturday, 9:00 AM to 6:00 PM",
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
    hero: still("photo-01.jpg"),
    hours: still("photo-11.jpg"),
    reception: still("photo-12.jpg"),
  },
  highlights: [
    "General Dentistry",
    "Orthodontic Braces",
    "Pediatric Dentistry",
    "Dental Implants",
    "Root Canal",
  ],
  services: [
    {
      name: "General Dentistry",
      line: "The weekday work on their public About: the check, the clean, and the follow-up.",
      photos: [] as const,
      photoAlt: null,
      photoNote: null,
    },
    {
      name: "Orthodontic Braces",
      line: "Braces as they list them, with a retainers still from a public post.",
      photos: [still("photo-03.jpg")] as const,
      photoAlt: "Hawley retainers on stone models, from a public Facebook post",
      photoNote: "photo-03.jpg — retainers still (fbid 1366073978868986)",
    },
    {
      name: "Pediatric Dentistry",
      line: "Children’s dentistry, written on their public About page.",
      photos: [] as const,
      photoAlt: null,
      photoNote: null,
    },
    {
      name: "Dental Implants",
      line: "Implants as posted. Smile-promo and model stills from public Facebook graphics.",
      photos: [still("photo-05.jpg"), still("photo-07.jpg")] as const,
      photoAlt: "Public Facebook implant stills they posted",
      photoNote:
        "photo-05.jpg / photo-07.jpg — implant smile promo and model still",
    },
    {
      name: "Root Canal",
      line: "Root canal treatment, listed beside the rest, with the X-ray graphic they posted.",
      photos: [still("photo-06.jpg")] as const,
      photoAlt: "Public Facebook graphic about dental X-rays",
      photoNote: "photo-06.jpg — X-ray/surgery graphic (fbid 1253037483505970)",
    },
    {
      name: "Crowns",
      line: "Porcelain fused to metal crowns, from a public before-and-after they posted.",
      photos: [still("photo-02.jpg")] as const,
      photoAlt: "Before and after porcelain-fused-to-metal crowns",
      photoNote: "photo-02.jpg — PFM crowns B/A (fbid 1395733745903009)",
    },
    {
      name: "Composite",
      line: "Composite restoration, from a public close-up they posted.",
      photos: [still("photo-04.jpg")] as const,
      photoAlt: "Before and after composite restoration on a molar",
      photoNote: "photo-04.jpg — composite B/A (fbid 1280149050794813)",
    },
    {
      name: "Fillings",
      line: "Fillings as shown on their page, from a public before-and-after.",
      photos: [still("photo-08.jpg")] as const,
      photoAlt: "Before and after composite fillings on a front tooth",
      photoNote: "photo-08.jpg — fillings B/A (fbid 1145568694252850)",
    },
    {
      name: "Dentures",
      line: "Dentures as posted, from a public before-and-after of a removable denture.",
      photos: [still("photo-09.jpg")] as const,
      photoAlt: "Before and after a removable denture",
      photoNote: "photo-09.jpg — denture B/A (fbid 1137549768388076)",
    },
    {
      name: "Whitening",
      line: "Whitening as posted, from a public Facebook graphic.",
      photos: [still("photo-10.jpg")] as const,
      photoAlt: "Public Facebook graphic for their teeth-whitening service",
      photoNote: "photo-10.jpg — whitening still (fbid 1130379019105151)",
    },
  ],
  disclaimer: DEMO_DISCLAIMER,
  sampleNote:
    "This page is a KantoCo sample of how Alonday Dental Clinic could look on the web. They did not hire us.",
  kantocoMessenger: KANTOCO_MESSENGER,
} as const;
