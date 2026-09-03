import Image from "next/image";
import { NaraShell } from "@/components/demos/nara/NaraShell";

export default function NaraAbout() {
  return (
    <NaraShell current="About">
      <div className="nara-page pb-16">
        <p className="nara-kicker">About</p>
        <h1 className="nara-serif nara-title">
          Built for the block, not a medical campus.
        </h1>

        <div className="mt-12 grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div className="nara-shot">
            <Image
              src="/demos/nara-clinic/day-hall.jpg"
              alt="Daylit ward with empty beds and folded blankets"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
          <div className="space-y-5 text-base leading-relaxed text-[var(--mute)]">
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
