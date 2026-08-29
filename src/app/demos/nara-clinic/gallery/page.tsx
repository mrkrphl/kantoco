import Image from "next/image";
import { FadeUp } from "@/components/demos/FadeUp";
import { NaraShell } from "@/components/demos/nara/NaraShell";

const shots = [
  [
    "/demos/nara-clinic/hallway-daylight.jpg",
    "Empty beds in a daylight ward",
  ],
  ["/demos/nara-clinic/corridor.jpg", "Reception desk and floor signage"],
  ["/demos/nara-clinic/hall-empty.jpg", "Exam table under a clinic lamp"],
  ["/demos/nara-clinic/signage.jpg", "Made bed, room number, hallway beyond"],
  ["/demos/nara-clinic/day-hall.jpg", "Row of empty beds and cabinets"],
] as const;

export default function NaraGallery() {
  return (
    <NaraShell current="Gallery">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <FadeUp>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--nara-green)]">
            Gallery
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Rooms, not portraits.
          </h1>
          <p className="mt-4 max-w-lg text-[var(--nara-muted)]">
            License-clean stills of chairs, halls, and kit. No stock doctors.
          </p>
        </FadeUp>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {shots.map(([src, alt], i) => (
            <li
              key={src}
              className={i === 0 ? "sm:col-span-2" : undefined}
            >
              <div
                className={`relative overflow-hidden ${i === 0 ? "aspect-[16/8]" : "aspect-[4/3]"}`}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover"
                  sizes={i === 0 ? "100vw" : "(max-width: 640px) 100vw, 50vw"}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--nara-muted)]">{alt}</p>
            </li>
          ))}
        </ul>
      </div>
    </NaraShell>
  );
}
