import Image from "next/image";
import { NaraShell } from "@/components/demos/nara/NaraShell";

const shots = [
  ["/demos/nara-clinic/hallway-daylight.jpg", "Empty beds in a daylight ward"],
  ["/demos/nara-clinic/corridor.jpg", "Reception desk and floor signage"],
  ["/demos/nara-clinic/hall-empty.jpg", "Exam table under a clinic lamp"],
  ["/demos/nara-clinic/signage.jpg", "Made bed, room number, hallway beyond"],
  ["/demos/nara-clinic/day-hall.jpg", "Row of empty beds and cabinets"],
] as const;

export default function NaraGallery() {
  return (
    <NaraShell current="Gallery">
      <div className="mx-auto max-w-[76rem] px-[var(--pad)] pb-16 pt-16">
        <p className="nara-kicker">Gallery</p>
        <h1 className="nara-serif nara-title">Rooms, not portraits.</h1>
        <p className="nara-lede">
          License-clean stills of chairs, halls, and kit. No stock doctors.
        </p>

        <ul className="nara-gallery">
          {shots.map(([src, alt]) => (
            <li key={src}>
              <div className="nara-shot">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 720px) 100vw, 50vw"
                />
              </div>
              <p className="mt-3 text-sm text-[var(--mute)]">{alt}</p>
            </li>
          ))}
        </ul>
      </div>
    </NaraShell>
  );
}
