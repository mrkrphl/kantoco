import Image from "next/image";
import { FadeUp } from "@/components/demos/FadeUp";
import { HaligiShell } from "@/components/demos/haligi/HaligiShell";

const shots = [
  ["/demos/haligi-auto/lift.jpg", "Wagon on a two-post lift"],
  ["/demos/haligi-auto/bay.jpg", "Open hood and coiled air line"],
  ["/demos/haligi-auto/oil-tools.jpg", "Stamped tool wall"],
  ["/demos/haligi-auto/engine.jpg", "Engine bay, grease light"],
] as const;

export default function HaligiGallery() {
  return (
    <HaligiShell current="Gallery">
      <div className="px-4 py-10 md:px-6">
        <FadeUp>
          <h1 className="haligi-cond text-5xl text-[var(--ha-yellow)] md:text-6xl">
            Bay photos
          </h1>
        </FadeUp>
        <ul className="mt-8 grid grid-cols-2 gap-1 md:grid-cols-3">
          {shots.map(([src, alt]) => (
            <li key={src} className="relative aspect-[4/3]">
              <Image
                src={src}
                alt={alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </li>
          ))}
        </ul>
      </div>
    </HaligiShell>
  );
}
