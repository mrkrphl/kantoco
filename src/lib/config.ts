/** Agency site env — set real URLs in Vercel / .env.local */
export const site = {
  messengerUrl:
    process.env.NEXT_PUBLIC_MESSENGER_URL ?? "https://m.me/kantoco",
  demos: {
    clinic: process.env.NEXT_PUBLIC_DEMO_CLINIC_URL ?? "",
    salon: process.env.NEXT_PUBLIC_DEMO_SALON_URL ?? "",
    auto: process.env.NEXT_PUBLIC_DEMO_AUTO_URL ?? "",
  },
} as const;

export type Vertical = keyof typeof site.demos;
