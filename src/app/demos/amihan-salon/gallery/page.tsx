import Image from "next/image";
import { FadeUp } from "@/components/demos/FadeUp";
import { AmihanShell } from "@/components/demos/amihan/AmihanShell";

const tiles = [
  ["/demos/amihan-salon/mirrors.jpg", "Wash basin and long mirror", "tall"],
  ["/demos/amihan-salon/shears.jpg", "Shears on a wood rack", "wide"],
  ["/demos/amihan-salon/wet-cut.jpg", "Dark wet hair mid-cut", "wide"],
  ["/demos/amihan-salon/chair.jpg", "Shears seated in a wood block", "sq"],
  ["/demos/amihan-salon/combs.jpg", "Clipper and brushes on the bench", "sq"],
  ["/demos/amihan-salon/mirror-chair.jpg", "Empty station, brick and plate", "tall"],
] as const;

export default function AmihanGallery() {
  return (
    <AmihanShell current="Gallery">
      <div className="px-4 pb-8 md:px-8">
        <FadeUp>
          <h1 className="amihan-display text-4xl md:text-6xl">The wall</h1>
          <p className="mt-4 max-w-md text-sm text-[var(--ami-dim)]">
            Gallery-forward on purpose. This is the page a walk-in actually
            scrolls.
          </p>
        </FadeUp>

        <ul className="mt-10 columns-1 gap-3 sm:columns-2">
          {tiles.map(([src, alt, shape]) => (
            <li key={src} className="mb-3 break-inside-avoid">
              <div
                className={`relative ${
                  shape === "tall"
                    ? "aspect-[3/4]"
                    : shape === "wide"
                      ? "aspect-[16/10]"
                      : "aspect-square"
                }`}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AmihanShell>
  );
}
