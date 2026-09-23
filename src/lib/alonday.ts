import { DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";

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
      photo: null,
      photoNote: null,
    },
    {
      name: "Orthodontic Braces",
      line: "Braces as they list them. A retainers still (photo-03) is not in this sample yet.",
      photo: null,
      photoNote: "photo-03.jpg — retainers still missing (fbid 1366073978868986)",
    },
    {
      name: "Pediatric Dentistry",
      line: "Children’s dentistry, written on their public About page.",
      photo: null,
      photoNote: null,
    },
    {
      name: "Dental Implants",
      line: "Implants as posted. Smile-promo and model stills are reserved as photo-05 and photo-07.",
      photo: null,
      photoNote: "photo-05.jpg / photo-07.jpg — Facebook stills not in this sample yet",
    },
    {
      name: "Root Canal",
      line: "Root canal treatment, listed beside the rest. An X-ray graphic is reserved as photo-06.",
      photo: null,
      photoNote: "photo-06.jpg — X-ray/surgery graphic missing (fbid 1253037483505970)",
    },
    {
      name: "Crowns",
      line: "Porcelain fused to metal crowns, from a public before-and-after they posted.",
      photo: null,
      photoNote: "photo-02.jpg — PFM crowns B/A missing (fbid 1395733745903009)",
    },
    {
      name: "Composite",
      line: "Composite restoration, from a public close-up they posted.",
      photo: null,
      photoNote: "photo-04.jpg — composite B/A missing (fbid 1280149050794813)",
    },
    {
      name: "Fillings",
      line: "Fillings as shown on their page. The before-and-after still is reserved as photo-08.",
      photo: null,
      photoNote: "photo-08.jpg — fillings B/A missing (fbid 1145568694252850)",
    },
    {
      name: "Dentures",
      line: "Dentures as posted. The lips still is reserved as photo-09.",
      photo: null,
      photoNote: "photo-09.jpg — denture B/A missing (fbid 1137549768388076)",
    },
    {
      name: "Whitening",
      line: "Whitening as posted. The still is reserved as photo-10.",
      photo: null,
      photoNote: "photo-10.jpg — whitening still missing (fbid 1130379019105151)",
    },
  ],
  disclaimer: DEMO_DISCLAIMER,
  sampleNote:
    "This page is a KantoCo sample of how Alonday Dental Clinic could look on the web. They did not hire us.",
  kantocoMessenger: KANTOCO_MESSENGER,
} as const;
