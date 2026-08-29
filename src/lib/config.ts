/** Agency site env — listed slots default to in-app sample routes. */
export const site = {
  messengerUrl:
    process.env.NEXT_PUBLIC_MESSENGER_URL ?? "https://m.me/kantocoph",
  demos: {
    clinic: process.env.NEXT_PUBLIC_DEMO_CLINIC_URL || "/demos/nara-clinic",
    salon: process.env.NEXT_PUBLIC_DEMO_SALON_URL || "/demos/amihan-salon",
    auto: process.env.NEXT_PUBLIC_DEMO_AUTO_URL || "/demos/haligi-auto",
    cafe: process.env.NEXT_PUBLIC_DEMO_CAFE_URL || "/demos/concordias-cafe",
  },
} as const;

export type Vertical = keyof typeof site.demos;
