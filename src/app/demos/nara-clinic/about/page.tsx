import Image from "next/image";
import { ClipReveal } from "@/components/demos/ClipReveal";
import { FadeUp } from "@/components/demos/FadeUp";
import { NaraShell } from "@/components/demos/nara/NaraShell";

export default function NaraAbout() {
  return (
    <NaraShell current="About">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <FadeUp>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--nara-green)]">
            About
          </p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">
            Built for the block, not a medical campus.
          </h1>
        </FadeUp>

        <div className="mt-10 grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <ClipReveal>
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/demos/nara-clinic/day-hall.jpg"
                alt="Daylit ward with empty beds and folded blankets"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          </ClipReveal>
          <div className="space-y-5 text-base leading-relaxed text-[var(--nara-muted)]">
            <p>
              Nara is a sample neighborhood clinic: one waiting row, one consult
              room, a tray that gets wiped between patients. The name is
              invented. The block is invented. The tone is the part we want
              shops to steal.
            </p>
            <p>
              We write hours in the header because patients look there first.
              We keep the service list as a ledger, not three equal cards. We
              do not stock smiling portraits. The photos here are empty rooms
              and daylight halls.
            </p>
            <p>
              Sample location: fictional lot off Dr. A. Santos Ave., BF Homes
              fringe, Parañaque. Not a real street number. Not a real phone.
              Message KantoCo if you want a site like this for an actual shop.
            </p>
          </div>
        </div>
      </div>
    </NaraShell>
  );
}
