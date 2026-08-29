/** Agency site env — set real URLs in Vercel / .env.local */
export const site = {
  messengerUrl:
    process.env.NEXT_PUBLIC_MESSENGER_URL ?? "https://m.me/kantocoph",
  demos: {
    clinic: process.env.NEXT_PUBLIC_DEMO_CLINIC_URL ?? "",
    salon: process.env.NEXT_PUBLIC_DEMO_SALON_URL ?? "",
    auto: process.env.NEXT_PUBLIC_DEMO_AUTO_URL ?? "",
    cafe: process.env.NEXT_PUBLIC_DEMO_CAFE_URL ?? "/demos/concordias-cafe",
  },
} as const;

export type Vertical = keyof typeof site.demos;
