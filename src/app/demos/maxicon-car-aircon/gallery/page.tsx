import Image from "next/image";
import { MaxiconShell } from "@/components/demos/maxicon/MaxiconShell";

const shots = [
  [
    "/demos/maxicon-car-aircon/shop-front.jpg",
    "Maxicon’s open bay and sign, from a photo they published on their public Wix page.",
  ],
  [
    "/demos/maxicon-car-aircon/maxicon-bay.jpg",
    "A technician in a Maxicon shirt at an open hood. Their photo, not a generated person.",
  ],
  [
    "/demos/maxicon-car-aircon/dash-work.jpg",
    "Dashboard pulled for evaporator work on a Toyota. Published by the shop.",
  ],
  [
    "/demos/maxicon-car-aircon/compressor.jpg",
    "Compressor on the parts board, labeled Panasonic / Mazda 3. Their 2014 shop photo.",
  ],
  [
    "/demos/maxicon-car-aircon/workshop-haze.jpg",
    "Generic workshop photograph. Dark bay, not Maxicon’s storefront.",
  ],
  [
    "/demos/maxicon-car-aircon/belt-drive.jpg",
    "Generic engine-bay still of a belt and compressor clutch. Not their car.",
  ],
] as const;

export default function MaxiconGallery() {
  return (
    <MaxiconShell current="Bay">
      <div className="maxicon-page">
        <p className="maxicon-kicker">Bay</p>
        <h1 className="maxicon-display maxicon-title">
          Their shop first. Generic stills labeled as generic.
        </h1>
        <p className="maxicon-lede">
          The shop stills here are photos Maxicon already published on their
          public Wix site. Two license-clean workshop photos fill the dark-bay
          feeling and say so in the caption.
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
