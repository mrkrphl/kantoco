import Image from "next/image";
import { MaxiconShell } from "@/components/demos/maxicon/MaxiconShell";

const shots = [
  [
    "/demos/maxicon-car-aircon/shop-front.jpg",
    "Maxicon’s open bay and sign on President’s Avenue.",
  ],
  [
    "/demos/maxicon-car-aircon/maxicon-bay.jpg",
    "A technician in a Maxicon shirt at an open hood.",
  ],
  [
    "/demos/maxicon-car-aircon/dash-work.jpg",
    "Dashboard pulled for evaporator work on a Toyota.",
  ],
  [
    "/demos/maxicon-car-aircon/compressor.jpg",
    "Compressor on the parts board, labeled Panasonic / Mazda 3.",
  ],
] as const;

export default function MaxiconGallery() {
  return (
    <MaxiconShell current="Bay">
      <div className="maxicon-page">
        <h1 className="maxicon-display maxicon-title">
          Their bay and their parts.
        </h1>
        <p className="maxicon-lede">
          These stills were published by the shop. No generated people, and no
          borrowed testimonials.
        </p>

        <ul className="maxicon-gallery">
          {shots.map(([src, alt]) => (
            <li key={src}>
              <div className="maxicon-shot">
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
    </MaxiconShell>
  );
}
