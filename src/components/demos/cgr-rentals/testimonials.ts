/**
 * Customer reviews (r7.6.4). Each quote is copied character for character
 * from the shop's public Google Maps listing, typos, spacing and emoji
 * included; do not edit, correct or paraphrase them. Names are as given.
 * `date` is Google's relative label as read on Oct 30, 2026; it is shown
 * as is and never turned into a calendar date. An empty list hides the
 * section (Testimonials.tsx).
 */
/**
 * "Google" is the only source in use. "Facebook comment" is the optional
 * r7.7 variant (Design r7.7 spec §1): typed here so real Facebook comments
 * can be added later, but there is no Facebook data and none may be made up.
 */
export type TestimonialSource = "Google" | "Facebook comment";

export type Testimonial = {
  id: number;
  /** As shown on the review (first name and last initial, or the handle). */
  name: string;
  source: TestimonialSource;
  /** Relative date label, exactly as the source shows it. */
  date: string;
  /** Star rating, shown as text only. Facebook comments may have none. */
  rating?: number;
  /** The review body, verbatim. */
  quote: string;
};

/** Meta-line tag per source. */
export const SOURCE_LABEL: Record<TestimonialSource, string> = {
  Google: "Google review",
  "Facebook comment": "Facebook comment",
};

/**
 * Desktop spreads by id (Design r7.7 spec §1, 3/3/2): a feature quote plus
 * two side quotes, then a duo. The phone shows the same order, one per slide.
 */
export const SPREADS: number[][] = [
  [1, 7, 2], // ea · Hillary M. · Maria R.
  [5, 8, 3], // Leira H. · Angela D. · Lexie C.
  [6, 4], // Kletrysia F. · Yvelle P.
];

/** Where the full list lives (opens in a new tab). */
export const REVIEWS_URL =
  "https://www.google.com/maps/place/CGR+CAVITE+GOWN+RENTALS/@14.3511203,120.9751358,17z";

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "ea",
    source: "Google",
    date: "7 months ago",
    rating: 5,
    quote:
      "The place is easily accessible and their rentals are vv affordable. They offer various dresses befitting different themes of certain events (in my case, a modern filipiniana for gala night.) Staff is very friendly and accommodating, would also engage in small talk to make you feel more comfortable. Overall, I'd highly recommend and would come back again the second time for my next formal event 🫶",
  },
  {
    id: 2,
    name: "Maria R.",
    source: "Google",
    date: "8 months ago",
    rating: 5,
    quote:
      "Beautiful selections of gowns and affordable, very accomodating staff, thank you for the special event of my daughter's promnight. I love your suggestion of what to wear.",
  },
  {
    id: 3,
    name: "Lexie C.",
    source: "Google",
    date: "5 months ago",
    rating: 5,
    quote:
      "The owner is accomodating,friendly, and patient, they provided me with lots of options until i found a gown that im satisfied. Will recommend them because their customer service and gowns are 10/10",
  },
  {
    id: 4,
    name: "Yvelle P.",
    source: "Google",
    date: "7 months ago",
    rating: 5,
    quote:
      "Rented a nice coat for my son's prom from Cavite Gown Rentals. Their coats are all superb worth its rental price. Owners are very accommodating and helpful too. Five star for this shop's service.",
  },
  {
    id: 5,
    name: "Leira H.",
    source: "Google",
    date: "7 months ago",
    rating: 5,
    quote:
      "Besides the gowns and suits being genuinely elegant, what makes this shop extraordinary is the accommodating and caring staffs. They will take time to ask what clients prefer and they will give helpful suggestions that matches your needs. Highly recommended. My kids are always comfortable when visiting the shop as they are always treated nicely😊 On the day of the event, they feel confident and comfortable with their attire thus making them enjoy the night. Happy memories🥰",
  },
  {
    id: 6,
    name: "Kletrysia F.",
    source: "Google",
    date: "8 months ago",
    rating: 5,
    quote:
      "The staffs were very accommodating and good with customers. They have a lot of attires to choose from cocktails, long gowns, ball gowns, and tuxedos. They have sizes from small to plus sizes, if I were given a chance to rent an attire I would choose this shop again.",
  },
  {
    id: 7,
    name: "Hillary M.",
    source: "Google",
    date: "7 months ago",
    rating: 5,
    quote:
      "Loved the filipiniana I rented! Quality is excellent and service is very nice.",
  },
  {
    id: 8,
    name: "Angela D.",
    source: "Google",
    date: "8 months ago",
    rating: 5,
    quote:
      "Great customer service and a beautiful selection of gowns! Highly recommended!",
  },
];
