import Image from "next/image";
import { AmihanShell } from "@/components/demos/amihan/AmihanShell";

const tiles = [
  ["/demos/amihan-salon/mirrors.jpg", "Wash basin and long mirror"],
  ["/demos/amihan-salon/shears.jpg", "Shears on a wood rack"],
  ["/demos/amihan-salon/wet-cut.jpg", "Dark wet hair mid-cut"],
  ["/demos/amihan-salon/chair.jpg", "Shears seated in a wood block"],
  ["/demos/amihan-salon/combs.jpg", "Clipper and brushes on the bench"],
  ["/demos/amihan-salon/mirror-chair.jpg", "Empty station, brick and plate"],
] as const;

export default function AmihanGallery() {
  return (
    <AmihanShell current="Gallery">
      <div className="amihan-page">
        <h1 className="amihan-display text-4xl md:text-6xl">The wall</h1>
        <p className="mt-4 max-w-md text-[var(--mute)]">
          This is the page someone scrolls before they sit in the chair.
        </p>

        <ul className="amihan-gallery">
          {tiles.map(([src, alt]) => (
            <li key={src}>
              <div className="amihan-shot">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 720px) 100vw, 50vw"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AmihanShell>
  );
}
