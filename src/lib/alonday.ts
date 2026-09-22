import { DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";

/** Public facts only. Do not invent hours, prices, or a quote. */
export const alonday = {
  name: "Alonday Dental Clinic",
  address: "454 El Grande Ave., BF Homes, Parañaque",
  addressShort: "454 El Grande Ave., BF Homes",
  heroLine:
    "A dental clinic on El Grande Avenue, BF Homes. People already call, open Facebook, or book on their app.",
  phoneDisplay: "0939 932 2060",
  phoneHref: "tel:+639399322060",
  email: "alondaydentalclinic@gmail.com",
  emailHref: "mailto:alondaydentalclinic@gmail.com",
  hours: "Hours on Facebook",
  facebook: "https://www.facebook.com/AlondayDentalClinic/",
  instagram: "https://www.instagram.com/alondaydentalclinic",
  instagramHandle: "@alondaydentalclinic",
  booking: "https://dental.m.mymedsph.app/dental/ROJUACqY",
  mapsQuery:
    "https://www.google.com/maps/search/?api=1&query=454+El+Grande+Ave.+BF+Homes+Paranaque",
  mapsEmbed:
    "https://maps.google.com/maps?q=454%20El%20Grande%20Ave.%2C%20BF%20Homes%2C%20Para%C3%B1aque&z=16&output=embed",
  dentistSign: "Dr. Emma Aleli D. Alonday",
  services: [
    {
      n: "01",
      name: "General Dentistry",
      line: "The weekday work they list first: the check, the clean, the filling, and the follow-up that should not wait for a hospital dental department.",
    },
    {
      n: "02",
      name: "Orthodontic Braces",
      line: "Braces as they name them on Facebook. This sample does not invent a plan or a timeline. They will tell you what they take.",
    },
    {
      n: "03",
      name: "Pediatric Dentistry",
      line: "Children’s dentistry, written on their public About page. Ask them for a chair time that fits a school-day afternoon.",
    },
    {
      n: "04",
      name: "Dental Implants",
      line: "Implants are on that same public list. They decide if a case fits. This page does not guess.",
    },
    {
      n: "05",
      name: "Root Canal Treatment",
      line: "Root canal treatment, listed beside the rest. Call, message Facebook, or use their booking app if a tooth will not wait.",
    },
  ],
  disclaimer: DEMO_DISCLAIMER,
  sampleNote:
    "This page is a KantoCo sample of how Alonday Dental Clinic could look on the web. They did not hire us.",
  kantocoMessenger: KANTOCO_MESSENGER,
} as const;
