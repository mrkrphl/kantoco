import Image from "next/image";
import { NaraShell } from "@/components/demos/nara/NaraShell";

export default function NaraAbout() {
  return (
    <NaraShell current="About">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--nara-green)]">
          About
        </p>
        <h1 className="nara-serif mt-3 max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">
          Built for the block, not a medical campus.
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-start">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="/demos/nara-clinic/day-hall.jpg"
              alt="Daylit ward with empty beds and folded blankets"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
          <div className="space-y-5 text-base leading-relaxed text-[var(--nara-muted)]">
            <p>
              Nara is a sample neighborhood clinic: one waiting row, one consult
              room, and a tray that gets wiped between patients. The name is
              invented. The block is invented.
            </p>
            <p>
              Hours sit in the header because patients look there first. The
              service list is a ledger. The photos are empty rooms and daylight
              halls, not stock portraits of doctors.
            </p>
            <p>
              Sample location: a fictional lot off Dr. A. Santos Avenue, BF
              Homes, Parañaque. There is no real street number and no real
              phone. Message KantoCo on Facebook if you want a site like this
              for an actual shop.
            </p>
          </div>
        </div>
      </div>
    </NaraShell>
  );
}
